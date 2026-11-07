/* ==========================================================================
   サイト共通設定
   ナビゲーション・SNSアカウント・フッター情報はここだけを編集する。
   ヘッダー / フッター / SNS 一覧の各コンポーネントがこの設定を参照する。
   ========================================================================== */
window.YQ = window.YQ || {};

YQ.config = {
  siteName: "YUGENQ",
  statement: "知っているから、日本が強くなる。",

  // 日本企業百科事典（外部サイト）
  encyclopediaUrl: "https://nihonkigyohyakka.yugenqjp.workers.dev/",

  // グローバルナビゲーション（表示順）
  // children を持つ項目は、PC ではドロップダウン、スマートフォンでは下層リストとして表示される。
  // external: true の項目は新しいタブで開く。
  nav: [
    { key: "home",         label: "Home",         ja: "ホーム",           href: "index.html" },
    {
      key: "services", label: "Business", ja: "事業紹介", href: "services.html",
      children: [
        { key: "services",     ja: "事業一覧",                 href: "services.html" },
        { key: "encyclopedia", ja: "日本企業百科事典について", href: "encyclopedia.html" },
        { key: "encyclopedia-app", ja: "日本企業百科事典を見る", href: "https://nihonkigyohyakka.yugenqjp.workers.dev/", external: true }
      ]
    },
    { key: "social",       label: "Social",       ja: "公式SNS",          href: "social.html" },
    { key: "about",        label: "About",        ja: "企業情報",         href: "about.html" },
    { key: "contact",      label: "Contact",      ja: "お問い合わせ",     href: "contact.html" }
  ],

  // 公式SNSアカウント（ヘッダー・フッター・SOCIALページに表示）
  // url が空のアカウントは表示されない。URLを入れると表示される。
  social: [
    { key: "x",         name: "X",         handle: "@YUGENQjp", url: "https://x.com/YUGENQjp",              note: "日本企業百科事典の更新とお知らせ" },
    { key: "instagram", name: "Instagram", handle: "@nihonkigyohyakka", url: "https://www.instagram.com/nihonkigyohyakka/", note: "日本企業百科事典の公式アカウント" },
    { key: "youtube",   name: "YouTube",   handle: "@日本企業百科事典", url: "https://www.youtube.com/@%E6%97%A5%E6%9C%AC%E4%BC%81%E6%A5%AD%E7%99%BE%E7%A7%91%E4%BA%8B%E5%85%B8", note: "日本企業百科事典の公式チャンネル" }
  ],

  // お問い合わせ（Google フォーム）
  // googleForm      ：Google フォームのURL。「送信」→「<>（埋め込み）」に表示される
  //                   src="…" の中身、または共有リンク（docs.google.com/forms/…/viewform）を貼る。
  //                   空の間は、お問い合わせページにメールアドレスの案内が表示される。
  // googleFormHeight：埋め込み表示の高さ（px）。埋め込みコードの height の値を目安にする。
  contact: {
    googleForm: "https://docs.google.com/forms/d/e/1FAIpQLSfHZH0TYhg8IRYS2edLInWzoCrbm-wyuBLgB3xNhJn6aZyVnQ/viewform?usp=publish-editor",
    googleFormHeight: 1300
  },

  // フッターの補助リンク
  legal: [
    { label: "プライバシーポリシー", href: "privacy.html" },
    { label: "運営方針",             href: "about.html#policy" }
  ],

  copyright: "YUGENQ",

  // アクセス計測（Cloudflare Web Analytics。Cookie を使わない）
  // Cloudflare の Web Analytics でサイトを追加し、表示されたスニペットの token の値を入れると計測が始まる。
  // 公開される値なので、ここに書いてよい（パスワードやAPIキーではない）。空の間は計測しない。
  analytics: {
    cloudflareToken: ""
  }
};

// 計測用のスクリプトは、トークンが設定されているときだけ読み込む
if (YQ.config.analytics.cloudflareToken) {
  const beacon = document.createElement("script");
  beacon.defer = true;
  beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
  beacon.dataset.cfBeacon = JSON.stringify({ token: YQ.config.analytics.cloudflareToken });
  document.head.appendChild(beacon);
}

// URL が未設定の SNS アカウントは表示しない
YQ.config.social = YQ.config.social.filter((s) => /^https?:\/\//.test(s.url));
