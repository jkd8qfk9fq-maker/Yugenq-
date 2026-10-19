/* ==========================================================================
   ページ機能（該当要素があるページでのみ動作）
   - [data-filter-group] : インサイト記事のカテゴリ絞り込み
   - [data-google-form]  : お問い合わせ（Google フォーム）の埋め込み
   ========================================================================== */
(function () {
  /* ---- カテゴリ絞り込み ----------------------------------------------
     <div data-filter-group="insights"> 内の .filter__button[data-filter]
     と、対象リスト [data-filter-target="insights"] > [data-category] を連動。 */
  document.querySelectorAll("[data-filter-group]").forEach((group) => {
    const name = group.dataset.filterGroup;
    const target = document.querySelector(`[data-filter-target="${name}"]`);
    const status = document.querySelector(`[data-filter-status="${name}"]`);
    if (!target) return;

    group.hidden = false; // JS 無効時は絞り込みUIを出さない

    group.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      const value = btn.dataset.filter;

      group.querySelectorAll("[data-filter]").forEach((b) => {
        b.setAttribute("aria-pressed", String(b === btn));
      });

      let count = 0;
      target.querySelectorAll("[data-category]").forEach((item) => {
        const show = value === "all" || item.dataset.category === value;
        item.hidden = !show;
        if (show) count++;
      });

      if (status) status.textContent = `${count}件の記事を表示しています`;
    });
  });

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
