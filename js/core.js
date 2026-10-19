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

  /** 日付を「2026.10.18」形式に整形 */
  formatDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
  }
};
