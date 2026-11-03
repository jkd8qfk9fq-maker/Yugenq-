/* ==========================================================================
   SNS コンポーネント
   --------------------------------------------------------------------------
   <yq-social-accounts>                     公式アカウント一覧（site.config.js）
   <yq-social-feed provider="local" limit="6" filterable>
                                            投稿フィード

   投稿データの形（プロバイダが返す配列の要素）:
     { id, platform, date(ISO), text, url, image?, imageAlt? }
     platform は site.config.js の social[].key と一致させる。

   将来の拡張:
     SNS 各社の API はアクセストークンを要するため、ブラウザから直接呼ばず、
     自社サーバー（または CMS / 連携サービス）で集約した JSON を返す想定。
     その場合は provider="json" endpoint="/api/social-posts.json" を指定する。
     独自の取得方法は YQ.social.registerProvider(name, fn) で追加できる。
   ========================================================================== */
(function () {
  const { esc, externalAttrs, formatDate } = YQ.util;

  YQ.social = {
    providers: {
      /** js/data/social-posts.js のサンプルデータ */
      local: async () => (YQ.data && YQ.data.socialPosts) || [],

      /** 集約済み JSON を返すエンドポイント */
      json: async ({ endpoint }) => {
        const res = await fetch(endpoint, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return Array.isArray(data) ? data : data.posts || [];
      }
    },

    registerProvider(name, fn) {
      this.providers[name] = fn;
    },

    account(key) {
      return YQ.config.social.find((s) => s.key === key);
    }
  };

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

  /* ---- 投稿フィード ---- */
  class YqSocialFeed extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = "true";

      this.limit = parseInt(this.getAttribute("limit"), 10) || 6;
      this.active = "all";
      this.posts = [];

      this.innerHTML = `
        <div class="social-feed">
          ${this.hasAttribute("filterable") ? `
            <div role="group" aria-label="媒体で絞り込む">
              <ul class="filter">
                <li><button class="filter__button" type="button" data-platform="all" aria-pressed="true">すべて</button></li>
                ${YQ.config.social.map((s) => `
                  <li><button class="filter__button" type="button" data-platform="${esc(s.key)}" aria-pressed="false">${esc(s.name)}</button></li>
                `).join("")}
              </ul>
            </div>` : ""}
          <div class="social-feed__body" aria-live="polite">
            <p class="social-feed__status">投稿を読み込んでいます</p>
          </div>
        </div>
      `;

      this.body = this.querySelector(".social-feed__body");
      this.querySelectorAll(".filter__button").forEach((btn) => {
        btn.addEventListener("click", () => this.setFilter(btn.dataset.platform));
      });

      this.load();
    }

    async load() {
      const name = this.getAttribute("provider") || "local";
      const provider = YQ.social.providers[name];
      try {
        if (!provider) throw new Error(`Unknown provider: ${name}`);
        const posts = await provider({ endpoint: this.getAttribute("endpoint") });
        // 表示中（URL設定済み）のアカウントの投稿だけを出す
        const enabled = new Set(YQ.config.social.map((acc) => acc.key));
        this.posts = posts
          .filter((p) => enabled.has(p.platform))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        this.render();
      } catch (err) {
        console.error("[yq-social-feed]", err);
        this.body.innerHTML = `<p class="social-feed__status">投稿を読み込めませんでした。時間をおいて再度お試しいただくか、各公式アカウントをご覧ください。</p>`;
      }
    }

    setFilter(platform) {
      this.active = platform;
      this.querySelectorAll(".filter__button").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn.dataset.platform === platform));
      });
      this.render();
    }

    render() {
      const list = this.posts
        .filter((p) => this.active === "all" || p.platform === this.active)
        .slice(0, this.limit);

      if (!list.length) {
        this.body.innerHTML = `<p class="social-feed__status">この媒体の投稿はまだありません。</p>`;
        return;
      }

      this.body.innerHTML = `
        <ul class="social-feed__list">
          ${list.map((p) => this.renderPost(p)).join("")}
        </ul>
      `;
    }

    renderPost(p) {
      const account = YQ.social.account(p.platform) || { name: p.platform };
      const url = p.url || account.url || "#";
      return `
        <li>
          <article class="post">
            <div class="post__head">
              <span class="post__platform">${esc(account.name)}</span>
              <time datetime="${esc(p.date)}">${esc(formatDate(p.date))}</time>
            </div>
            ${p.image ? `<div class="post__media"><img src="${esc(p.image)}" alt="${esc(p.imageAlt || "")}" loading="lazy" decoding="async"></div>` : ""}
            <p class="post__text">${esc(p.text)}</p>
            <a class="text-link" href="${esc(url)}"${externalAttrs(url)}>${esc(account.name)}で見る</a>
          </article>
        </li>
      `;
    }
  }

  /* ---- Instagram の最新投稿（自動更新） ----
     <yq-instagram-feed endpoint="/api/instagram" pages="4">
     /api/instagram（netlify/functions/instagram.mjs）が Instagram から取った投稿を、
     4列のグリッドで1ページ8件ずつ表示する。ページは「最新・2・3・4」から選べ、
     「もっと見る」で次のページへ進む。4ページ目より前の投稿は Instagram 本体へ案内する。
     各ページは開いたときに初めて取得し、取得済みのページは再取得しない。
     API が使えない（トークン未設定など）ときは、架空の投稿は出さず、アカウントへのリンクだけを出す。 */
  class YqInstagramFeed extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = "true";
      this.account = YQ.social.account("instagram");
      if (!this.account) return;
      this.endpoint = this.getAttribute("endpoint") || "/api/instagram";
      this.maxPages = parseInt(this.getAttribute("pages"), 10) || 4;
      this.pages = [];          // 取得済みのページ（投稿の配列）
      this.cursors = [null];    // 各ページを取るためのカーソル（1ページ目は null）
      this.current = 0;

      this.innerHTML = `
        <div class="ig-feed">
          <div class="ig-feed__head">
            <a class="ig-feed__account" href="${esc(this.account.url)}"${externalAttrs(this.account.url)}>
              <span class="ig-feed__mark" aria-hidden="true"></span>
              <span>
                <span class="ig-feed__handle">${esc(this.account.handle)}</span>
                <span class="ig-feed__note">${esc(this.account.note)}</span>
              </span>
            </a>
            <a class="button button--small" href="${esc(this.account.url)}"${externalAttrs(this.account.url)}>Instagramでフォロー</a>
          </div>
          <div class="ig-feed__body" aria-live="polite">${this.skeleton()}</div>
          <nav class="ig-feed__pager" aria-label="Instagramの投稿のページ" hidden></nav>
        </div>
      `;
      this.body = this.querySelector(".ig-feed__body");
      this.pager = this.querySelector(".ig-feed__pager");
      this.show(0);
    }

    skeleton() {
      return `<ul class="ig-grid" aria-hidden="true">${"<li class=\"ig-tile ig-tile--loading\"></li>".repeat(8)}</ul>`;
    }

    async fetchPage(index) {
      if (this.pages[index]) return this.pages[index];
      const url = new URL(this.endpoint, location.href);
      if (this.cursors[index]) url.searchParams.set("after", this.cursors[index]);
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.pages[index] = data.posts || [];
      this.cursors[index + 1] = data.next || null;
      return this.pages[index];
    }

    async show(index) {
      const first = this.pages.length === 0;
      if (!this.pages[index]) this.body.innerHTML = this.skeleton();
      try {
        const posts = await this.fetchPage(index);
        this.current = index;
        if (!posts.length && index === 0) return this.fallback();
        this.body.innerHTML = `<ul class="ig-grid">${posts.map((p) => this.tile(p)).join("")}</ul>`;
        this.renderPager();
        if (!first) this.scrollIntoView({ behavior: "smooth", block: "start" });
        if (first) this.prefetch();
      } catch (err) {
        console.error("[yq-instagram-feed]", err);
        if (index === 0) this.fallback();
        else this.body.insertAdjacentHTML("beforeend", `<p class="social-feed__status">投稿を読み込めませんでした。時間をおいて再度お試しください。</p>`);
      }
    }

    /** 2ページ目以降を順に先読みし、「最新・2・3・4」をはじめから全部選べるようにする（応答は CDN にキャッシュされる） */
    async prefetch() {
      for (let i = 1; i < this.maxPages && this.cursors[i]; i++) {
        try {
          await this.fetchPage(i);
        } catch {
          break;
        }
        this.renderPager();
      }
    }

    /** 押せるページ：取得済みのページと、カーソルがある次のページ（最大 maxPages） */
    available() {
      let n = 0;
      while (n < this.maxPages && (this.pages[n] || (n > 0 && this.cursors[n]))) n++;
      return n;
    }

    renderPager() {
      const count = this.available();
      const hasNext = this.current + 1 < count;
      this.pager.hidden = false;
      this.pager.innerHTML = `
        <ul class="ig-feed__pages">
          ${Array.from({ length: count }, (_, i) => `
            <li><button class="filter__button" type="button" data-page="${i}" aria-pressed="${i === this.current}">${i === 0 ? "最新" : i + 1}</button></li>
          `).join("")}
        </ul>
        ${hasNext
          ? `<button class="button button--ghost button--small" type="button" data-page="${this.current + 1}">もっと見る</button>`
          : `<a class="text-link" href="${esc(this.account.url)}"${externalAttrs(this.account.url)}>過去の投稿をInstagramで見る</a>`}
      `;
      this.pager.querySelectorAll("[data-page]").forEach((btn) => {
        btn.addEventListener("click", () => this.show(parseInt(btn.dataset.page, 10)));
      });
    }

    tile(p) {
      const kind = p.mediaType === "VIDEO" ? "動画" : p.mediaType === "CAROUSEL_ALBUM" ? "複数枚" : "";
      const caption = (p.text || "").split("\n")[0];
      return `
        <li class="ig-tile">
          <a href="${esc(p.url)}"${externalAttrs(p.url)} aria-label="${esc(`${formatDate(p.date)}の投稿${kind ? `（${kind}）` : ""}：${caption || "Instagramで見る"}`)}">
            ${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" decoding="async">` : ""}
            ${kind ? `<span class="ig-tile__kind" aria-hidden="true">${kind}</span>` : ""}
            <span class="ig-tile__caption" aria-hidden="true">
              <time datetime="${esc(p.date)}">${esc(formatDate(p.date))}</time>
              ${caption ? `<span>${esc(caption)}</span>` : ""}
            </span>
          </a>
        </li>
      `;
    }

    fallback() {
      this.pager.hidden = true;
      this.body.innerHTML = `
        <div class="ig-feed__empty">
          <p>最新の投稿は Instagram でご覧いただけます。</p>
          <a class="text-link" href="${esc(this.account.url)}"${externalAttrs(this.account.url)}>${esc(this.account.handle)} を開く</a>
        </div>
      `;
    }
  }

  customElements.define("yq-instagram-feed", YqInstagramFeed);
  customElements.define("yq-social-accounts", YqSocialAccounts);
  customElements.define("yq-social-feed", YqSocialFeed);
})();
