import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { verifySlackSignatureDetailed } from '@/lib/slack/sign';
import { viewsOpen, chatPostMessage } from '@/lib/slack/api';
import { buildRejectionModal } from '@/lib/slack/modal';

export const runtime = 'nodejs';

// ブラウザで開いた時に環境変数の状態を確認できる診断用エンドポイント
// 機密情報は返さない（長さと先頭3文字のみ）
export async function GET() {
  const secret = process.env.SLACK_SIGNING_SECRET;
  const token = process.env.SLACK_BOT_TOKEN;
  const supaUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return NextResponse.json({
    deploy_check: 'ok',
    deployed_at: new Date().toISOString(),
    env: {
      SLACK_SIGNING_SECRET: secret
        ? { set: true, len: secret.length, prefix: secret.slice(0, 3) }
        : { set: false },
      SLACK_BOT_TOKEN: token
        ? { set: true, len: token.length, prefix: token.slice(0, 5) }
        : { set: false },
      SUPABASE_URL: supaUrl ? { set: true, value: supaUrl } : { set: false },
      SUPABASE_SERVICE_ROLE_KEY: supaKey
        ? { set: true, len: supaKey.length, prefix: supaKey.slice(0, 5) }
        : { set: false },
    },
  });
}

interface SlackPayload {
  type: 'block_actions' | 'view_submission' | string;
  actions?: Array<{ action_id: string; value: string }>;
  trigger_id?: string;
  user?: { id: string; name?: string };
  channel?: { id: string };
  message?: { ts: string };
  view?: {
    callback_id?: string;
    private_metadata?: string;
    state?: { values?: Record<string, Record<string, { value?: string; selected_option?: { value: string } }>> };
  };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sigSecret = process.env.SLACK_SIGNING_SECRET;
  if (!sigSecret) {
    console.error('SLACK_SIGNING_SECRET not set');
    return NextResponse.json({ error: 'config' }, { status: 500 });
  }

  const verifyResult = verifySlackSignatureDetailed({
    signingSecret: sigSecret,
    timestamp: req.headers.get('x-slack-request-timestamp'),
    body: rawBody,
    signature: req.headers.get('x-slack-signature'),
  });
  if (!verifyResult.ok) {
    console.error('[slack/interactivity] verify failed:', JSON.stringify({
      reason: verifyResult.reason,
      debug: verifyResult.debug,
      sig_secret_set: !!sigSecret,
      sig_secret_len: sigSecret?.length,
      sig_secret_prefix: sigSecret?.slice(0, 4),
      timestamp_header: req.headers.get('x-slack-request-timestamp'),
      signature_header_prefix: req.headers.get('x-slack-signature')?.slice(0, 12),
      body_len: rawBody.length,
      body_first_60: rawBody.slice(0, 60),
    }));
    return new NextResponse('unauthorized', { status: 401 });
  }

  // Slack interactivity は application/x-www-form-urlencoded で payload= に JSON を入れて送る
  const form = new URLSearchParams(rawBody);
  const payloadStr = form.get('payload');
  if (!payloadStr) {
    return NextResponse.json({ error: 'no payload' }, { status: 400 });
  }
  let payload: SlackPayload;
  try {
    payload = JSON.parse(payloadStr);
  } catch {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }

  try {
    if (payload.type === 'block_actions') return await handleBlockActions(payload);
    if (payload.type === 'view_submission') return await handleViewSubmission(payload);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('interactivity handler error:', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

async function handleBlockActions(payload: SlackPayload): Promise<NextResponse> {
  const action = payload.actions?.[0];
  if (!action) return NextResponse.json({ ok: true });

  const queueId = action.value;
  const sb = createServerClient();
  const userTag = `slack:${payload.user?.name || payload.user?.id || 'unknown'}`;

  // ✅ 追加 = approve
  if (action.action_id === 'approve_candidate') {
    const { error } = await sb
      .from('discovery_queue')
      .update({
        status: 'approved',
        decided_by: userTag,
        decided_at: new Date().toISOString(),
      })
      .eq('id', queueId)
      .eq('status', 'pending');

    if (payload.channel?.id && payload.message?.ts) {
      await chatPostMessage({
        channel: payload.channel.id,
        thread_ts: payload.message.ts,
        text: error
          ? `❗ 承認失敗: ${error.message}`
          : `✅ <@${payload.user?.id}> が承認しました（DBで status=approved に更新）`,
      });
    }
    return NextResponse.json({ ok: true });
  }

  // ❌ 却下（旧 ⏭️ スキップも互換でハンドル） = reject reason modal を開く
  if (action.action_id === 'reject_candidate' || action.action_id === 'skip_candidate') {
    if (!payload.trigger_id) {
      return NextResponse.json({ error: 'no trigger_id' }, { status: 400 });
    }

    const { data } = await sb
      .from('discovery_queue')
      .select('candidate_name')
      .eq('id', queueId)
      .maybeSingle();
    const candidateName = (data as { candidate_name?: string } | null)?.candidate_name ?? '(候補)';

    await viewsOpen(payload.trigger_id, buildRejectionModal({ queueId, candidateName }));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}

async function handleViewSubmission(payload: SlackPayload): Promise<NextResponse> {
  if (payload.view?.callback_id !== 'rejection_modal') {
    return NextResponse.json({ ok: true });
  }

  const queueId = payload.view.private_metadata;
  if (!queueId) return NextResponse.json({ error: 'no queue_id' }, { status: 400 });

  const values = payload.view.state?.values ?? {};
  const category = values.category_block?.category_select?.selected_option?.value;
  const reason = values.reason_block?.reason_input?.value;

  if (!category) {
    return NextResponse.json({
      response_action: 'errors',
      errors: { category_block: 'カテゴリを選んでください' },
    });
  }

  const sb = createServerClient();
  const userTag = `slack:${payload.user?.name || payload.user?.id || 'unknown'}`;

  const { error } = await sb
    .from('discovery_queue')
    .update({
      status: 'skipped',
      rejection_category: category,
      rejection_reason: reason || null,
      decided_by: userTag,
      decided_at: new Date().toISOString(),
    })
    .eq('id', queueId);

  if (error) {
    return NextResponse.json({
      response_action: 'errors',
      errors: { category_block: `保存失敗: ${error.message}` },
    });
  }

  // モーダルを閉じる
  return NextResponse.json({ response_action: 'clear' });
}
