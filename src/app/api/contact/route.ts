import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// APIキーが設定されている場合のみResendを初期化
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    // レート制限: 同一IPから10分間で最大5回
    const ip = getClientIp(request);
    const rl = rateLimit({ key: `contact:${ip}`, limit: 5, windowMs: 10 * 60 * 1000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'リクエストが多すぎます。しばらく経ってから再度お試しください。' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
      );
    }

    const { name, email, subject, message } = await request.json();

    // バリデーション
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      );
    }

    // 形式・長さチェック
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
    if (!emailOk) {
      return NextResponse.json(
        { error: 'メールアドレスの形式が正しくありません' },
        { status: 400 }
      );
    }
    if (String(name).length > 100 || String(subject).length > 200 || String(message).length > 5000) {
      return NextResponse.json(
        { error: '入力文字数の上限を超えています' },
        { status: 400 }
      );
    }

    // Resendが初期化されていない場合はエラーを返す
    if (!resend) {
      return NextResponse.json(
        { error: 'メール送信サービスが設定されていません' },
        { status: 500 }
      );
    }

    const esc = (s: string) =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    // メール送信
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Resendのテスト用認証済みドメイン
      to: ['support@comarpy.co.jp'], // 受信者アドレス（Resendアカウントのメール）
      subject: `【お問い合わせ】${esc(subject)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF5A5F; border-bottom: 2px solid #FF5A5F; padding-bottom: 10px;">
            新しいお問い合わせが届きました
          </h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">お問い合わせ内容</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666; width: 120px;">お名前:</td>
                <td style="padding: 8px 0;">${esc(name)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">メールアドレス:</td>
                <td style="padding: 8px 0;">${esc(email)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">件名:</td>
                <td style="padding: 8px 0;">${esc(subject)}</td>
              </tr>
            </table>

            <div style="margin-top: 20px;">
              <strong style="color: #666;">お問い合わせ内容:</strong>
              <div style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 8px; white-space: pre-wrap; border-left: 4px solid #FF5A5F;">
${esc(message)}
              </div>
            </div>
          </div>
          
          <div style="color: #666; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
            このメールは Inutabi-biyori のお問い合わせフォームから送信されました。<br>
            送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('メール送信エラー詳細:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: `メールの送信に失敗しました: ${error.message || JSON.stringify(error)}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'お問い合わせを受け付けました' 
    });

  } catch (error) {
    console.error('API エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 