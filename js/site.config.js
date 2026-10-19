/* ==========================================================================
   サイト共通設定
   ナビゲーション・SNSアカウント・フッター情報はここだけを編集する。
   ヘッダー / フッター / SNS 一覧の各コンポーネントがこの設定を参照する。
   ========================================================================== */
window.YQ = window.YQ || {};

YQ.config = {
  siteName: "YUGENQ",
  statement: "日本企業の情報を正確に記録し、市場の動きを読み解く。",

  // グローバルナビゲーション（表示順）
  nav: [
    { key: "home",         label: "Home",         ja: "ホーム",           href: "index.html" },
    { key: "services",     label: "Services",     ja: "サービス",         href: "services.html" },
    { key: "encyclopedia", label: "Encyclopedia", ja: "日本企業百科事典", href: "encyclopedia.html" },
    { key: "insights",     label: "Insights",     ja: "インサイト",       href: "insights.html" },
    { key: "social",       label: "Social",       ja: "公式SNS",          href: "social.html" },
    { key: "about",        label: "About",        ja: "企業情報",         href: "about.html" },
    { key: "contact",      label: "Contact",      ja: "お問い合わせ",     href: "contact.html" }
  ],

  // 公式SNSアカウント（ヘッダー・フッター・SOCIALページに表示）
  // url が空のアカウントは表示されない。URLを入れると表示される。
  social: [
    { key: "x",         name: "X",         handle: "@YUGENQjp", url: "https://x.com/YUGENQjp",              note: "レポート公開とお知らせ" },
    { key: "instagram", name: "Instagram", handle: "@yugenqjp", url: "https://www.instagram.com/yugenqjp/", note: "ブランドとチームの記録" },
    { key: "youtube",   name: "YouTube",   handle: "",          url: "",                                    note: "市場解説の動画" }
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

  copyright: "YUGENQ"
};

// URL が未設定の SNS アカウントは表示しない
YQ.config.social = YQ.config.social.filter((s) => /^https?:\/\//.test(s.url));
