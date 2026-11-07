/* ==========================================================================
   SNS コンポーネント
   --------------------------------------------------------------------------
   <yq-social-accounts>   公式アカウント一覧（js/site.config.js の social から生成）
   ========================================================================== */
(function () {
  const { esc, externalAttrs } = YQ.util;

  /* ---- 公式アカウント一覧 ---- */
  class YqSocialAccounts extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = "true";
      this.innerHTML = `
        <ul class="social-accounts">
          ${YQ.config.social.map((s) => `
            <li class="social-account">
              <a class="social-account__link" href="${esc(s.url)}"${externalAttrs(s.url)}>
                <span class="social-account__name">${esc(s.name)}</span>
                <span class="social-account__handle">${esc(s.handle)}</span>
                <span class="social-account__note">${esc(s.note)}</span>
              </a>
            </li>
          `).join("")}
        </ul>
      `;
    }
  }

  customElements.define("yq-social-accounts", YqSocialAccounts);
})();
