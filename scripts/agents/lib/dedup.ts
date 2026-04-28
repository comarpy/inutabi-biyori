import { createHash } from 'node:crypto';

// マーケティング修飾語（prefixのみ除去）
// 楽天等で名前の前に付く宣伝フレーズが、microCMSの実名と一致しない原因になる
const MARKETING_PREFIX_PATTERNS: RegExp[] = [
  /^Rakuten\s*STAY\s*\w*\s*/i,
  /^愛犬同伴\s*/,
  /^愛犬との[湯温泉]?宿\s*/,
  /^愛犬と泊まれる(宿|お宿|湯宿)?\s*/,
  /^愛犬と泊まる(宿|お宿|湯宿)?\s*/,
  /^わんこと泊まれる(宿|お宿|湯宿)?\s*/,
  /^わんこと泊まる(宿|お宿|湯宿)?\s*/,
  /^わんこ歓迎(の|な)?(宿|お宿)?\s*/,
  /^ペットと泊まれる(宿|お宿|湯宿)?\s*/,
  /^ペットと泊まる(宿|お宿|湯宿)?\s*/,
  /^ペット同伴(可)?\s*/,
  /^犬と泊まれる(宿|お宿|湯宿)?\s*/,
  /^犬と泊まる(宿|お宿|湯宿)?\s*/,
  /^犬同伴\s*/,
  /^こころ和む愛犬との[湯温泉]?宿\s*/,
  /^こころ和む\s*/,
  // 地名+温泉 のprefix（例: "あてま温泉 〇〇" → "〇〇"）。
  // 後ろに空白＋別の単語が続く時のみ除去（"桃の木温泉" 単独は実名なので残す）。
  // ひらがな・カタカナ・漢字の地名に対応
  /^[一-鿿ぁ-んァ-ヿ]{2,6}温泉\s+(?=\S)/,
];

// 括弧内のアノテーション（フリガナ・別名・地名など）を除去
// 例: "HASHINSHITA(ハシンシタ)" → "HASHINSHITA"
//     "DOGGYWOOD 淡路島<淡路島>" → "DOGGYWOOD 淡路島"
function stripParenthetical(s: string): string {
  return s
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/＜[^＞]*＞/g, '')
    .replace(/【[^】]*】/g, '')
    .replace(/「[^」]*」/g, '')
    .replace(/『[^』]*』/g, '');
}

// マーケティング prefix を再帰的に剥がす
// 例: "下湯原温泉　わんこと泊まれる宿　わんこあん"
//   → 1回目: "わんこと泊まれる宿　わんこあん" (温泉 prefix除去)
//   → 2回目: "わんこあん"                     (わんこと泊まれる宿 除去)
function stripMarketingPrefix(s: string, maxDepth = 5): string {
  let cur = s;
  for (let i = 0; i < maxDepth; i++) {
    let stripped = false;
    for (const p of MARKETING_PREFIX_PATTERNS) {
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

// 重複判定用に住所・宿名を正規化
//   1. NFKC で全角半角・カタカナ統一
//   2. 括弧内のアノテーション除去
//   3. マーケティング prefix 除去
//   4. 空白・記号除去
//   5. 法人格除去
//   6. lowercase
export function normalizeForHash(s: string): string {
  let out = s.normalize('NFKC');
  out = stripParenthetical(out);
  out = stripMarketingPrefix(out);
  out = out.replace(/\s+/g, '');
  out = out.replace(/[（）()「」『』〜～\-‐ー―・★☆◎●○＊*\[\]<>＜＞【】]/g, '');
  out = out.replace(/(株式会社|有限会社|合同会社)/g, '');
  return out.toLowerCase();
}

// 宿名 + 住所 + 電話下4桁 で SHA-256 ハッシュ
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

// 都道府県名の抽出（住所文字列から）
export function extractPrefecture(address: string): string | null {
  const match = address.match(/^(.{2,3}?[都道府県])/);
  return match ? match[1] : null;
}
