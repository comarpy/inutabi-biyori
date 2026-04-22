// 開発時のみログ出力。本番ではノーオペ（ログスパム・パフォーマンス低下回避）
const isDev = process.env.NODE_ENV !== 'production';

export const devLog: typeof console.log = isDev
  ? console.log.bind(console)
  : () => {};

export const devWarn: typeof console.warn = isDev
  ? console.warn.bind(console)
  : () => {};

// エラーは本番でも残す（Vercel のエラー監視でキャッチするため）
export const logError: typeof console.error = console.error.bind(console);
