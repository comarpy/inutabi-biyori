import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // バリデーション
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      );
    }

    // メール送信
    const { data, error } = await resend.emails.send({
      from: 'noreply@inutabi-biyori.com', // 送信者アドレス（ドメイン認証が必要）
      to: ['contact@comarpy.co.jp'], // 受信者アドレス
      subject: `【お問い合わせ】${subject}`,
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
                <td style="padding: 8px 0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">メールアドレス:</td>
                <td style="padding: 8px 0;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">件名:</td>
                <td style="padding: 8px 0;">${subject}</td>
              </tr>
            </table>
            
            <div style="margin-top: 20px;">
              <strong style="color: #666;">お問い合わせ内容:</strong>
              <div style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 8px; white-space: pre-wrap; border-left: 4px solid #FF5A5F;">
${message}
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
      console.error('メール送信エラー:', error);
      return NextResponse.json(
        { error: 'メールの送信に失敗しました' },
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