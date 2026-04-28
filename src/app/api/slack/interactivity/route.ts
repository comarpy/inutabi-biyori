import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { verifySlackSignatureDetailed } from '@/lib/slack/sign';
import { viewsOpen, chatPostMessage, chatUpdate } from '@/lib/slack/api';
import { buildRejectionModal } from '@/lib/slack/modal';

const REJECTION_LABELS: Record<string, string> = {
  business_hotel: '🏢 ビジネスホテル',
  closed_or_uncertain: '🚫 閉店・営業停止疑い',
  not_dog_friendly: '🐶 犬対応が形式的・不十分',
  bad_data: '📋 情報が不正確・不完全',
  duplicate: '🔁 既存と重複',
  other: '🤷 その他',
};

function jstNow(): string {
  return new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
}

function buildDecidedMessage(args: {
  decision: 'approved' | 'rejected';
  candidateName: string;
  candidateAddress?: string;
  userId: string;
  category?: string;
  reason?: string;
}) {
  const head =
    args.decision === 'approved'
      ? `✅ *承認済* — ${args.candidateName}`
      : `❌ *却下済* — ${args.candidateName}`;

  const parts: string[] = [];
  if (args.candidateAddress) parts.push(`📍 ${args.candidateAddress}`);
  if (args.category) parts.push(`カテゴリ: ${REJECTION_LABELS[args.category] ?? args.category}`);
  if (args.reason) parts.push(`理由: ${args.reason}`);
  parts.push(`by <@${args.userId}> @ ${jstNow()}`);

  return {
    text: head,
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: head } },
      { type: 'context', elements: [{ type: 'mrkdwn', text: parts.join('  ・  ') }] },
    ],
  };
}

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
    // DB情報も取得（メッセージ更新で住所等を表示するため）
    const { data: row } = await sb
      .from('discovery_queue')
      .select('candidate_name, candidate_address')
      .eq('id', queueId)
      .maybeSingle();
    const candidate = row as { candidate_name?: string; candidate_address?: string } | null;

    const { error } = await sb
      .from('discovery_queue')
      .update({
        status: 'approved',
        decided_by: userTag,
        decided_at: new Date().toISOString(),
      })
      .eq('id', queueId)
      .eq('status', 'pending');

    if (error) {
      if (payload.channel?.id && payload.message?.ts) {
        await chatPostMessage({
          channel: payload.channel.id,
          thread_ts: payload.message.ts,
          text: `❗ 承認失敗: ${error.message}`,
        });
      }
      return NextResponse.json({ ok: true });
    }

    // 元メッセージを「承認済」表示に書き換える（ボタンも消える）
    if (payload.channel?.id && payload.message?.ts && candidate?.candidate_name) {
      const updated = buildDecidedMessage({
        decision: 'approved',
        candidateName: candidate.candidate_name,
        candidateAddress: candidate.candidate_address,
        userId: payload.user?.id ?? '',
      });
      await chatUpdate({
        channel: payload.channel.id,
        ts: payload.message.ts,
        text: updated.text,
        blocks: updated.blocks,
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
      .select('candidate_name, candidate_address')
      .eq('id', queueId)
      .maybeSingle();
    const candidate = data as { candidate_name?: string; candidate_address?: string } | null;

    await viewsOpen(
      payload.trigger_id,
      buildRejectionModal({
        queueId,
        candidateName: candidate?.candidate_name ?? '(候補)',
        candidateAddress: candidate?.candidate_address,
        channelId: payload.channel?.id,
        messageTs: payload.message?.ts,
      }),
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}

async function handleViewSubmission(payload: SlackPayload): Promise<NextResponse> {
  if (payload.view?.callback_id !== 'rejection_modal') {
    return NextResponse.json({ ok: true });
  }

  // private_metadata は JSON 形式に拡張済み
  let meta: { qid?: string; name?: string; addr?: string; ch?: string; ts?: string } = {};
  try {
    meta = JSON.parse(payload.view.private_metadata ?? '{}');
  } catch {
    // 旧形式（queue_idの文字列だけ）の互換
    meta = { qid: payload.view.private_metadata };
  }
  const queueId = meta.qid;
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

  // 元メッセージを「却下済」表示に書き換える
  if (meta.ch && meta.ts && meta.name) {
    const updated = buildDecidedMessage({
      decision: 'rejected',
      candidateName: meta.name,
      candidateAddress: meta.addr,
      userId: payload.user?.id ?? '',
      category,
      reason: reason ?? undefined,
    });
    await chatUpdate({
      channel: meta.ch,
      ts: meta.ts,
      text: updated.text,
      blocks: updated.blocks,
    });
  }

  return NextResponse.json({ response_action: 'clear' });
}
