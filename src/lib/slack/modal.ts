// 却下理由を入力するモーダル
export function buildRejectionModal(args: {
  queueId: string;
  candidateName: string;
}) {
  return {
    type: 'modal',
    callback_id: 'rejection_modal',
    private_metadata: args.queueId,
    title: { type: 'plain_text', text: '却下理由' },
    submit: { type: 'plain_text', text: '送信' },
    close: { type: 'plain_text', text: 'キャンセル' },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${args.candidateName}* を却下します。\n選択肢から理由を選んでください。`,
        },
      },
      {
        type: 'input',
        block_id: 'category_block',
        element: {
          type: 'static_select',
          action_id: 'category_select',
          placeholder: { type: 'plain_text', text: 'カテゴリを選択' },
          options: [
            { text: { type: 'plain_text', text: '🏢 ビジネスホテル（犬向きでない）' }, value: 'business_hotel' },
            { text: { type: 'plain_text', text: '🚫 閉店・営業停止疑い' }, value: 'closed_or_uncertain' },
            { text: { type: 'plain_text', text: '🐶 犬対応が形式的・不十分' }, value: 'not_dog_friendly' },
            { text: { type: 'plain_text', text: '📋 情報が不正確・不完全' }, value: 'bad_data' },
            { text: { type: 'plain_text', text: '🔁 既存と重複' }, value: 'duplicate' },
            { text: { type: 'plain_text', text: '🤷 その他' }, value: 'other' },
          ],
        },
        label: { type: 'plain_text', text: 'カテゴリ（必須）' },
      },
      {
        type: 'input',
        block_id: 'reason_block',
        optional: true,
        element: {
          type: 'plain_text_input',
          action_id: 'reason_input',
          multiline: true,
          max_length: 500,
          placeholder: {
            type: 'plain_text',
            text: '例: ビジネスホテルでペット可と書いているが、犬向け設備の言及なし',
          },
        },
        label: { type: 'plain_text', text: '詳しい理由（任意）' },
        hint: { type: 'plain_text', text: 'AI学習の精度に直結します。一行でも書いていただけると助かります。' },
      },
    ],
  };
}
