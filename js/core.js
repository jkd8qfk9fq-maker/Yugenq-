/* ==========================================================================
   共通ユーティリティ
   すべてのコンポーネントより先に読み込む。
   ========================================================================== */
window.YQ = window.YQ || {};

YQ.util = {
  /** HTML 特殊文字のエスケープ（外部データを描画する際は必ず通す） */
  esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  /** サイト内リンクに base（例: "../"）を付与する。外部URL・アンカーはそのまま */
  href(base, path) {
    if (!path || /^(https?:|mailto:|tel:|#)/.test(path)) return path || "#";
    return (base || "") + path;
  },

  /** 外部リンク属性（実URLが未設定 "#" のときは付与しない） */
  externalAttrs(url) {
    return /^https?:/.test(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
  },

  /** 外部サイトへのリンクに添える印（読み上げでは「新しいタブで開きます」と伝える） */
  externalMark() {
    return `<svg class="ext-icon" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" focusable="false"><path d="M4 1.5h6.5V8M10.5 1.5 1.5 10.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg><span class="visually-hidden">（新しいタブで開きます）</span>`;
  },

  /** ナビ項目の href / target 属性を組み立てる */
  navLinkAttrs(base, item) {
    if (item.external) {
      return `href="${YQ.util.esc(item.href)}" target="_blank" rel="noopener"`;
    }
    return `href="${YQ.util.href(base, item.href)}"`;
  },

  /** 日付を「2026.10.18」形式に整形 */
  formatDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
  }
};
