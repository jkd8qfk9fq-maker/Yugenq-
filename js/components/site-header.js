/* ==========================================================================
   <yq-header current="services" base="">
   current : 現在ページの nav key（aria-current を付与）
   base    : 下層ディレクトリから読み込む場合の相対パス（例: "../"）
   ========================================================================== */
(function () {
  const { esc, href, externalAttrs, externalMark, navLinkAttrs } = YQ.util;
  const DESKTOP = window.matchMedia("(min-width: 1080px)");
  const CHEVRON = `<svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true" focusable="false"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`;

  class YqHeader extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = "true";

      const cfg = YQ.config;
      const base = this.getAttribute("base") || "";
      const current = this.getAttribute("current") || "";
      const cur = (key) => (key === current ? ' aria-current="page"' : "");
      // 下層に現在ページを含む親項目には、印（is-current）だけを付ける
      const inSection = (n) => n.key === current || (n.children || []).some((c) => c.key === current);

      const primary = cfg.nav.filter((n) => n.key !== "home" && n.key !== "contact");
      const contact = cfg.nav.find((n) => n.key === "contact");

      const subLink = (c, cls) => `
        <li><a class="${cls}" ${navLinkAttrs(base, c)}${c.external ? "" : cur(c.key)}>${esc(c.ja)}${c.external ? externalMark() : ""}</a></li>`;

      const desktopItem = (n) => {
        if (!n.children) {
          return `<li class="site-nav__item"><a class="site-nav__link" href="${href(base, n.href)}"${cur(n.key)}>${esc(n.ja)}</a></li>`;
        }
        const id = `site-nav-sub-${n.key}`;
        return `
          <li class="site-nav__item has-sub">
            <a class="site-nav__link${inSection(n) ? " is-current" : ""}" href="${href(base, n.href)}">${esc(n.ja)}</a>
            <button class="site-nav__sub-toggle" type="button" aria-expanded="false" aria-controls="${id}">
              ${CHEVRON}<span class="visually-hidden">${esc(n.ja)}のメニューを開く</span>
            </button>
            <ul class="site-nav__sub" id="${id}">
              ${n.children.map((c) => subLink(c, "site-nav__sublink")).join("")}
            </ul>
          </li>`;
      };

      const mobileItem = (n) => `
        <li>
          <a class="mobile-menu__link" href="${href(base, n.href)}"${cur(n.key)}>
            <span class="mobile-menu__en">${esc(n.label)}</span>
            <span class="mobile-menu__ja">${esc(n.ja)}</span>
          </a>
          ${n.children ? `<ul class="mobile-menu__children">${n.children
            .filter((c) => c.href !== n.href)
            .map((c) => subLink(c, "mobile-menu__child")).join("")}</ul>` : ""}
        </li>`;

      this.innerHTML = `
        <header class="site-header">
          <div class="container site-header__inner">
            <a class="site-logo" href="${href(base, "index.html")}"${cur("home")}>${esc(cfg.siteName)}</a>

            <nav class="site-nav" aria-label="メインメニュー">
              <ul class="site-nav__list">
                ${primary.map(desktopItem).join("")}
              </ul>
              <a class="button button--small" href="${href(base, contact.href)}"${cur("contact")}>${esc(contact.ja)}</a>
            </nav>

            <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">
              <span class="menu-toggle__bars" aria-hidden="true"></span>
              <span class="menu-toggle__label">メニュー</span>
            </button>
          </div>
        </header>

        <div class="mobile-menu theme-ink" id="mobile-menu" hidden>
          <div class="container">
            <nav aria-label="メインメニュー（モバイル）">
              <ul class="mobile-menu__list">
                ${cfg.nav.map(mobileItem).join("")}
              </ul>
            </nav>
            <p class="mobile-menu__sub">公式SNS</p>
            <ul class="social-inline">
              ${cfg.social.map((s) => `
                <li><a href="${esc(s.url)}"${externalAttrs(s.url)}>${esc(s.name)}</a></li>
              `).join("")}
            </ul>
          </div>
        </div>
      `;

      this.toggle = this.querySelector(".menu-toggle");
      this.label = this.querySelector(".menu-toggle__label");
      this.menu = this.querySelector(".mobile-menu");

      this.toggle.addEventListener("click", () => (this.isOpen ? this.close() : this.open()));
      this.menu.addEventListener("click", (e) => {
        if (e.target.closest("a")) this.close(false);
      });
      this.addEventListener("keydown", (e) => this.onKeydown(e));
      DESKTOP.addEventListener("change", (e) => e.matches && this.close(false));
      this.setupSubmenus();
    }

    /* PC のドロップダウン：ホバーでも開くが、ボタン（クリック・Enter）でも開閉できる */
    setupSubmenus() {
      const items = this.querySelectorAll(".has-sub");
      const closeAll = (except) => items.forEach((item) => {
        if (item !== except) item.querySelector(".site-nav__sub-toggle").setAttribute("aria-expanded", "false");
      });

      items.forEach((item) => {
        const btn = item.querySelector(".site-nav__sub-toggle");
        btn.addEventListener("click", () => {
          const open = btn.getAttribute("aria-expanded") !== "true";
          closeAll(item);
          btn.setAttribute("aria-expanded", String(open));
        });
        item.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
            btn.setAttribute("aria-expanded", "false");
            btn.focus();
          }
        });
        item.addEventListener("focusout", (e) => {
          if (!item.contains(e.relatedTarget)) btn.setAttribute("aria-expanded", "false");
        });
      });

      document.addEventListener("click", (e) => {
        if (!e.target.closest(".has-sub")) closeAll();
      });
    }

    get isOpen() {
      return this.toggle.getAttribute("aria-expanded") === "true";
    }

    open() {
      this.menu.hidden = false;
      this.toggle.setAttribute("aria-expanded", "true");
      this.label.textContent = "閉じる";
      document.body.classList.add("is-menu-open");
      const first = this.menu.querySelector("a");
      if (first) first.focus();
    }

    close(returnFocus = true) {
      if (!this.isOpen) return;
      this.menu.hidden = true;
      this.toggle.setAttribute("aria-expanded", "false");
      this.label.textContent = "メニュー";
      document.body.classList.remove("is-menu-open");
      if (returnFocus) this.toggle.focus();
    }

    /* Esc で閉じる / Tab をメニュー内に留める */
    onKeydown(e) {
      if (!this.isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        this.close();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = [this.toggle, ...this.menu.querySelectorAll("a")];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  customElements.define("yq-header", YqHeader);
})();
