/* ==========================================================================
   Instagram の最新投稿を返す API（Netlify Functions）
   GET /api/instagram?after=<カーソル>   →  { posts: [...], next: "<次のカーソル>" | null }

   - Instagram API（Instagram ログイン）の /me/media を呼び、公開用に整形して返す。
   - アクセストークンはブラウザに渡さない。Netlify の環境変数 INSTAGRAM_ACCESS_TOKEN、
     または instagram-token-refresh.mjs が更新して Netlify Blobs に保存したものを使う。
   - 結果は Netlify の CDN に15分キャッシュさせ、Instagram への問い合わせを抑える。
   - トークン未設定・取得失敗のときは 503 を返す。ページ側は Instagram へのリンクに切り替える。
   ========================================================================== */
import { getStore } from "@netlify/blobs";

const FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
const PAGE_SIZE = 8;

/** 使えるトークンの候補：自動更新で保存したもの → 環境変数のもの（重複は除く） */
export async function tokens() {
  const list = [];
  try {
    const saved = await getStore("instagram").get("token", { type: "json" });
    if (saved && saved.token) list.push(saved.token);
  } catch {
    // Blobs が使えない環境（ローカル確認など）では環境変数だけを使う
  }
  if (process.env.INSTAGRAM_ACCESS_TOKEN) list.push(process.env.INSTAGRAM_ACCESS_TOKEN);
  return [...new Set(list)];
}

export async function currentToken() {
  return (await tokens())[0] || "";
}

const json = (body, status, cache) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      ...(cache ? { "Netlify-CDN-Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } : {})
    }
  });

/** Instagram の投稿を、サイトの投稿データの形（js/components/social.js と同じ）にする */
function toPost(m) {
  const caption = (m.caption || "").trim();
  return {
    id: `instagram-${m.id}`,
    platform: "instagram",
    // "+0000" 形式は Safari が読めないため、ISO 8601（Z）にそろえる
    date: new Date(m.timestamp).toISOString(),
    text: caption,
    url: m.permalink,
    // 動画は media_url が動画ファイルのため、サムネイル画像を使う
    image: m.media_type === "VIDEO" ? m.thumbnail_url || "" : m.media_url,
    imageAlt: caption ? caption.split("\n")[0].slice(0, 80) : "Instagramの投稿",
    mediaType: m.media_type
  };
}

export default async (req) => {
  const candidates = await tokens();
  if (!candidates.length) return json({ error: "not_configured", posts: [], next: null }, 503, false);

  const after = new URL(req.url).searchParams.get("after");
  // 保存済みのトークンが失効していたら（作り直した場合など）、環境変数のトークンで取り直す
  for (const token of candidates) {
    const api = new URL("https://graph.instagram.com/me/media");
    api.searchParams.set("fields", FIELDS);
    api.searchParams.set("limit", String(PAGE_SIZE));
    api.searchParams.set("access_token", token);
    if (after && /^[\w-]+$/.test(after)) api.searchParams.set("after", after);
    try {
      const res = await fetch(api);
      const data = await res.json();
      if (!res.ok) {
        // トークンの中身はログに出さない
        console.error("[instagram] API error", res.status, data && data.error && data.error.message);
        continue;
      }
      const posts = (data.data || []).filter((m) => m.permalink).map(toPost);
      const next = data.paging && data.paging.next && data.paging.cursors ? data.paging.cursors.after : null;
      return json({ posts, next }, 200, true);
    } catch (err) {
      console.error("[instagram] fetch failed", err && err.message);
    }
  }
  return json({ error: "upstream", posts: [], next: null }, 503, false);
};

export const config = { path: "/api/instagram" };
