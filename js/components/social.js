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

  customElements.define("yq-social-accounts", YqSocialAccounts);
  customElements.define("yq-social-feed", YqSocialFeed);
})();
