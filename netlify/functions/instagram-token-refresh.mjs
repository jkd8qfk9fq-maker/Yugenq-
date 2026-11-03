/* ==========================================================================
   Instagram アクセストークンの自動更新（Netlify の定期実行関数、毎週）

   Instagram の長期アクセストークンは60日で切れる。発行から24時間以上たったトークンは
   refresh_access_token で延長できるので、毎週延長し、新しいトークンを Netlify Blobs に保存する。
   instagram.mjs は保存されたトークンを優先して使う。
   最初のトークン（環境変数 INSTAGRAM_ACCESS_TOKEN）さえ入れておけば、以後は手作業なしで続く。
   ========================================================================== */
import { getStore } from "@netlify/blobs";
import { currentToken } from "./instagram.mjs";

export default async () => {
  const token = await currentToken();
  if (!token) {
    console.log("[instagram-token-refresh] トークン未設定のため何もしない");
    return;
  }
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", token);
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    console.error("[instagram-token-refresh] 更新に失敗", res.status, data && data.error && data.error.message);
    return;
  }
  await getStore("instagram").setJSON("token", {
    token: data.access_token,
    refreshedAt: new Date().toISOString(),
    expiresIn: data.expires_in
  });
  console.log("[instagram-token-refresh] 更新した（有効期間の残り秒数）", data.expires_in);
};

export const config = { schedule: "@weekly" };
