// 各OTAのアフィリエイトURL生成
// VC（バリューコマース）経由で各広告主の宿名検索URLを生成する
//
// SID/PID は公開トラッキングID（HTMLに埋め込まれて配布される性質のもの）なので
// .env で隠す必要はなくコードに直接記載する

const VC_REFERRAL = 'https://ck.jp.ap.valuecommerce.com/servlet/referral';
const VC_SID = '3749962';

export type OtaProvider = 'rakuten' | 'jalan' | 'rurubu' | 'yahoo_travel' | 'jtb' | 'ikkyu';

// VC経由で配信する4広告主のPID
const VC_PIDS: Record<Exclude<OtaProvider, 'rakuten'>, string> = {
  jalan:        '892603751',
  rurubu:       '892603752',
  yahoo_travel: '892603754',
  jtb:          '892603755',
  ikkyu:        '892603757',
};

// 各OTAの「宿名検索」URL（vc_urlでラップする対象）
const SEARCH_URL_BUILDERS: Record<Exclude<OtaProvider, 'rakuten'>, (q: string) => string> = {
  jalan:        (q) => `https://www.jalan.net/uw/uwp3000/uww3001.do?keyword=${encodeURIComponent(q)}`,
  rurubu:       (q) => `https://travel.rurubu.com/Search/Hotel/?keyword=${encodeURIComponent(q)}`,
  yahoo_travel: (q) => `https://travel.yahoo.co.jp/search/keyword/?keyword=${encodeURIComponent(q)}`,
  jtb:          (q) => `https://www.jtb.co.jp/kokunai-hotel/?searchword=${encodeURIComponent(q)}`,
  ikkyu:        (q) => `https://www.ikyu.com/search/?keyword=${encodeURIComponent(q)}`,
};

// 各OTAの表示ラベル（UI用）
export const PROVIDER_LABELS: Record<OtaProvider, string> = {
  rakuten:      '楽天トラベル',
  jalan:        'じゃらん',
  rurubu:       'るるぶトラベル',
  yahoo_travel: 'Yahoo!トラベル',
  jtb:          'JTB',
  ikkyu:        '一休.com',
};

// VC経由のアフィリエイトURLを生成（rakuten以外）
export function buildVcAffiliateUrl(provider: Exclude<OtaProvider, 'rakuten'>, hotelName: string): string {
  const pid = VC_PIDS[provider];
  const targetUrl = SEARCH_URL_BUILDERS[provider](hotelName);
  return `${VC_REFERRAL}?sid=${VC_SID}&pid=${pid}&vc_url=${encodeURIComponent(targetUrl)}`;
}

// 全プロバイダ共通：UIで「予約サイトから探す」ボタン群として並べるために使う
export interface BookingLink {
  provider: OtaProvider;
  label: string;
  url: string;
}

// 宿名から、VC経由の4社アフィリリンクを一括生成
export function buildVcBookingLinks(hotelName: string): BookingLink[] {
  const providers: Array<Exclude<OtaProvider, 'rakuten'>> = ['jalan', 'rurubu', 'yahoo_travel', 'jtb', 'ikkyu'];
  return providers.map((p) => ({
    provider: p,
    label: PROVIDER_LABELS[p],
    url: buildVcAffiliateUrl(p, hotelName),
  }));
}

// 楽天トラベル＋VC経由4社の合計5社のリンクを生成
//   - rakutenUrl が渡されればそれを楽天枠に使う（既存の動的取得）
//   - 渡されなければ楽天検索URLにフォールバック
export function buildAllBookingLinks(hotelName: string, rakutenUrl?: string): BookingLink[] {
  const links: BookingLink[] = [];
  if (rakutenUrl) {
    links.push({ provider: 'rakuten', label: PROVIDER_LABELS.rakuten, url: rakutenUrl });
  }
  links.push(...buildVcBookingLinks(hotelName));
  return links;
}
