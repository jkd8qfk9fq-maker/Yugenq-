/* ==========================================================================
   <yq-footer base="">
   ========================================================================== */
(function () {
  const { esc, href, externalAttrs, externalMark, navLinkAttrs } = YQ.util;

  class YqFooter extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = "true";

      const cfg = YQ.config;
      const base = this.getAttribute("base") || "";
      const link = (n) => `<li><a ${navLinkAttrs(base, n)}>${esc(n.ja || n.label)}${n.external ? externalMark() : ""}</a></li>`;

      const company = cfg.nav.filter((n) => ["home", "about", "contact"].includes(n.key));
      // 事業紹介の下層（日本企業百科事典など）も並べる。親と同じURLの項目は除く
      const content = cfg.nav
        .filter((n) => ["services", "social"].includes(n.key))
        .flatMap((n) => [n, ...(n.children || []).filter((c) => c.href !== n.href)]);

      this.innerHTML = `
        <footer class="site-footer theme-ink">
          <div class="container">
            <div class="site-footer__top">
              <div>
                <a class="site-logo" href="${href(base, "index.html")}">${esc(cfg.siteName)}</a>
                <p class="site-footer__statement">${esc(cfg.statement)}</p>
              </div>
              <div class="site-footer__cols">
                <nav aria-label="コンテンツ">
                  <p class="site-footer__heading">Contents</p>
                  <ul class="site-footer__links">${content.map(link).join("")}</ul>
                </nav>
                <nav aria-label="企業情報">
                  <p class="site-footer__heading">Company</p>
                  <ul class="site-footer__links">${company.map(link).join("")}</ul>
                </nav>
                <div>
                  <p class="site-footer__heading">Follow</p>
                  <ul class="site-footer__links">
                    ${cfg.social.map((s) => `<li><a href="${esc(s.url)}"${externalAttrs(s.url)}>${esc(s.name)}</a></li>`).join("")}
                  </ul>
                </div>
              </div>
            </div>
            <div class="site-footer__bottom">
              <ul class="social-inline">
                ${cfg.legal.map((l) => `<li><a href="${href(base, l.href)}">${esc(l.label)}</a></li>`).join("")}
              </ul>
              <p><small>&copy; ${new Date().getFullYear()} ${esc(cfg.copyright)}</small></p>
            </div>
          </div>
        </footer>
      `;
    }
  }

  customElements.define("yq-footer", YqFooter);
})();
