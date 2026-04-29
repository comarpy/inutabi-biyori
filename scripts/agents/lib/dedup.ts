import { createHash } from 'node:crypto';

// マーケティング修飾語（prefixのみ除去）
// 楽天等で名前の前に付く宣伝フレーズが、既存実名と一致しない原因になる
const MARKETING_PREFIX_PATTERNS: RegExp[] = [
  /^Rakuten\s*STAY\s*\w*\s*/i,
  /^愛犬同伴\s*/,
  /^愛犬との[湯温泉]?宿\s*/,
  // 「愛犬と〇〇」系（柔軟に対応）
  /^愛犬と(暮らす|楽しむ|過ごす|泊まる|泊まれる|微笑む|くつろぐ|大満喫|大冒険)[一-鿿ぁ-んァ-ヿA-Za-z0-9々]{0,25}(宿|お宿|湯宿|温泉宿|リゾート)?\s*/,
  /^愛犬癒[しさ]の?\s*(宿|お宿|湯宿)?\s*/,
  /^愛犬の(宿|お宿|湯宿)\s*/,
  // 「ペットと〇〇」系
  /^ペットと(暮らす|楽しむ|過ごす|泊まる|泊まれる|大満喫)[一-鿿ぁ-んァ-ヿ]{0,15}\s*(宿|お宿|湯宿|温泉宿)?\s*/,
  /^ペット同伴(可)?\s*/,
  /^ペット可\s*/,
  // 「わんこ〇〇」「ワンちゃん〇〇」系
  /^わんこと(泊まれる|泊まる|過ごす)\s*(宿|お宿|湯宿)?\s*/,
  /^わんこ歓迎(の|な)?\s*(宿|お宿)?\s*/,
  /^ワンちゃん(と|可|歓迎|OK|ok)\s*(宿|お宿)?\s*/,
  // 「犬と〇〇」系
  /^犬と(泊まれる|泊まる|過ごす|楽しむ)\s*(宿|お宿|湯宿)?\s*/,
  /^犬同伴\s*/,
  // その他形容詞的なプレフィックス
  /^こころ和む愛犬との[湯温泉]?宿\s*/,
  /^こころ和む\s*/,
  /^癒[しさ]の?\s*/,
  /^天然温泉\s+/,
  // 地名+温泉 のprefix（例: "あてま温泉 〇〇" → "〇〇"）。後ろに空白＋別の単語があるときのみ
  /^[一-鿿ぁ-んァ-ヿ]{2,6}温泉\s+(?=\S)/,
  // 場所prefix（地名 + 空白）— "南阿蘇 ○○"、"伊勢二見 ○○" 等
  /^[一-鿿]{2,5}\s+(?=[一-鿿ぁ-んァ-ヿA-Za-z])/,
];

// カテゴリprefix（旅館、ホテル、リゾート等の宿タイプ）
// 同じ宿でも「割烹旅館孫八」 vs 「孫八」のような揺れを吸収するため
const CATEGORY_PREFIX_PATTERNS: RegExp[] = [
  /^(割烹|料理|温泉)?(旅館|お宿|温泉宿)\s*/,
  /^(温泉|料亭)?ホテル\s*/,
  /^リゾートホテル\s*/,
  /^ペンション\s*/,
  /^民宿\s*/,
  /^コテージ\s*/,
  /^貸別荘\s*/,
];

// 括弧内のアノテーション（フリガナ・別名・地名など）を除去
function stripParenthetical(s: string): string {
  return s
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/＜[^＞]*＞/g, '')
    .replace(/【[^】]*】/g, '')
    .replace(/「[^」]*」/g, '')
    .replace(/『[^』]*』/g, '')
    .replace(/《[^》]*》/g, '')
    .replace(/〈[^〉]*〉/g, '');
}

// パターン群を再帰的に剥がす
function stripPatterns(s: string, patterns: RegExp[], maxDepth = 5): string {
  let cur = s;
  for (let i = 0; i < maxDepth; i++) {
    let stripped = false;
    for (const p of patterns) {
      const next = cur.replace(p, '');
      if (next !== cur && next.length > 0) {
        cur = next;
        stripped = true;
        break;
      }
    }
    if (!stripped) break;
  }
  return cur;
}

// マーケティング prefix を再帰的に剥がす
function stripMarketingPrefix(s: string, maxDepth = 5): string {
  return stripPatterns(s, MARKETING_PREFIX_PATTERNS, maxDepth);
}

// カテゴリ prefix（旅館等）も剥がす（aggressive 用）
function stripCategoryPrefix(s: string): string {
  return stripPatterns(s, CATEGORY_PREFIX_PATTERNS, 3);
}

// 名前正規化（標準）— 装飾語・括弧除去 + マーケティング prefix除去
export function normalizeForHash(s: string): string {
  let out = s.normalize('NFKC');
  out = stripParenthetical(out);
  out = stripMarketingPrefix(out);
  out = out.replace(/\s+/g, '');
  out = out.replace(/[（）()「」『』〜～\-‐ー―・★☆◎●○＊*\[\]<>＜＞【】《》〈〉^]/g, '');
  out = out.replace(/(株式会社|有限会社|合同会社)/g, '');
  return out.toLowerCase();
}

// 名前正規化（aggressive）— カテゴリprefixも追加で除去
// 例: "ペットと泊まれるお宿 孫八" → "孫八"
//     "割烹旅館 孫八" → "孫八"
// 短い結果（< 3文字）になる可能性あり、住所/電話と組み合わせて使う
export function normalizeForHashAggressive(s: string): string {
  let out = s.normalize('NFKC');
  out = stripParenthetical(out);
  out = stripMarketingPrefix(out);
  out = stripCategoryPrefix(out);
  out = out.replace(/\s+/g, '');
  out = out.replace(/[（）()「」『』〜～\-‐ー―・★☆◎●○＊*\[\]<>＜＞【】《》〈〉^]/g, '');
  out = out.replace(/(株式会社|有限会社|合同会社)/g, '');
  return out.toLowerCase();
}

// 住所の正規化と「中核部分」の抽出
//   - NFKC統一、空白除去
//   - "大字"/"字" を除去
//   - 末尾に追加された施設名を切り捨てる（最後の番地まで）
function extractAddressCore(addr: string): string {
  let s = addr.normalize('NFKC');
  s = s.replace(/\s+/g, '');
  s = s.replace(/(大字|字)/g, '');
  s = s.replace(/[ー―‐]/g, '-');
  // 最初の番地（数字-数字）まで切り出す
  // "山梨県北杜市小淵沢町10144-3RakutenStayVilla八ヶ岳" → "山梨県北杜市小淵沢町10144-3"
  const m = s.match(/^(.*?[0-9]+(?:-[0-9]+)*)/);
  return (m ? m[1] : s).toLowerCase();
}

// 住所のみのハッシュ（住所完全一致dedup用）
export function computeAddressHash(addr: string | null | undefined): string | null {
  if (!addr) return null;
  const core = extractAddressCore(addr);
  if (core.length < 8) return null;
  return createHash('sha256').update(core).digest('hex');
}

// 電話番号のハッシュ（同じ電話 = 同じ法人 = 同じ宿）
export function computePhoneHash(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 9) return null; // 国内電話は最低9桁
  return createHash('sha256').update(digits).digest('hex');
}

// 宿名 + 住所 + 電話下4桁 で SHA-256 ハッシュ（厳密一致）
export function computeDedupHash(input: {
  name: string;
  address: string;
  phone?: string | null;
}): string {
  const n = normalizeForHash(input.name);
  const a = normalizeForHash(input.address);
  const t = (input.phone ?? '').replace(/\D/g, '').slice(-4);
  return createHash('sha256').update(`${n}|${a}|${t}`).digest('hex');
}

// aggressive な名前ハッシュ（住所/電話と組み合わせて使う）
export function computeAggressiveNameHash(name: string): string {
  return createHash('sha256').update(normalizeForHashAggressive(name)).digest('hex');
}

// 都道府県名の抽出（住所文字列から）
export function extractPrefecture(address: string): string | null {
  const match = address.match(/^(.{2,3}?[都道府県])/);
  return match ? match[1] : null;
}
