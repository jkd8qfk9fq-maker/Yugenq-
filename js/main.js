/* ==========================================================================
   ページ機能（該当要素があるページでのみ動作）
   - [data-google-form]  : お問い合わせ（Google フォーム）の埋め込み
   ========================================================================== */
(function () {

  /* ---- お問い合わせ（Google フォーム） --------------------------------
     js/site.config.js の contact.googleForm に設定したURLのフォームを埋め込む。
     共有リンク（…/viewform）でも埋め込みコードのURL（…?embedded=true）でもよい。
     未設定のときは、HTML に書いてあるメール案内をそのまま表示する。 */
  const holder = document.querySelector("[data-google-form]");
  const contact = (window.YQ && YQ.config && YQ.config.contact) || {};
  if (!holder || !contact.googleForm) return;

  const { esc } = YQ.util;
  let url;
  try {
    url = new URL(contact.googleForm);
  } catch (err) {
    console.error("[google-form] contact.googleForm のURLが正しくありません", err);
    return;
  }

  const isEmbeddable = url.hostname === "docs.google.com" && url.pathname.includes("/forms/");

  // 新しいタブで開く用のURL（embedded を外す）
  const openUrl = new URL(url);
  openUrl.searchParams.delete("embedded");

  if (!isEmbeddable) {
    // forms.gle などの短縮URLは埋め込めないため、フォームへのボタンだけを出す
    console.warn("[google-form] 埋め込むには docs.google.com/forms/… のURLを設定してください");
    holder.innerHTML = `
      <div class="gform__fallback">
        <p>お問い合わせは、Google フォームで受け付けています。</p>
        <a class="button" href="${esc(openUrl.href)}" target="_blank" rel="noopener">お問い合わせフォームを開く</a>
      </div>`;
    return;
  }

  const embedUrl = new URL(url);
  embedUrl.searchParams.set("embedded", "true");

  const height = parseInt(contact.googleFormHeight, 10) || 1600;
  holder.innerHTML = `
    <div class="gform__frame" style="--gform-h: ${height}px">
      <iframe src="${esc(embedUrl.href)}" title="お問い合わせフォーム（Google フォーム）" loading="lazy">読み込んでいます…</iframe>
    </div>
    <p class="gform__alt">
      フォームが表示されない場合は、<a href="${esc(openUrl.href)}" target="_blank" rel="noopener">新しいタブでフォームを開いて</a>ください。
    </p>`;
})();
