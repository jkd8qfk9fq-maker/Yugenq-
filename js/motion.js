/* ==========================================================================
   スクロール演出
   --------------------------------------------------------------------------
   1. 出現：REVEAL に該当する要素が画面に入ると .is-inview を付ける（1回のみ）
   2. 連動：[data-parallax] / [data-scroll-x] に、画面内の位置を
            --progress（-1 = 画面上方 〜 0 = 中央 〜 1 = 画面下方）として渡す
            [data-parallax="-80"] のように値を書くと移動量（px）を指定できる
   3. 背景：文字のセクション（.section / .page-hero / .cta-band）に背景レイヤーを
            差し込み、スクロールに合わせて斜線・光・大きな英字を動かす
   見た目は css/motion.css が担当する。動きを減らす設定では連動を行わない。
   ========================================================================== */
(function () {
  const REVEAL = ".section-head, .media, .slashes, .cta-band, [data-reveal]";
  const BG_TARGETS = ".section, .page-hero, .cta-band";
  const LINKED = "[data-parallax], [data-scroll-x], .has-bg-layer";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---- 3. 背景レイヤー（静止状態でも表示する装飾なので、先に差し込む） ---- */
  document.querySelectorAll(BG_TARGETS).forEach((section) => {
    if (section.querySelector(":scope > .bg-layer")) return;
    const label = section.querySelector(".section-head__en, .page-hero__en");
    const layer = document.createElement("div");
    layer.className = "bg-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = `<span class="bg-layer__glow"></span><span class="bg-layer__lines"></span>${
      label ? `<span class="bg-layer__word"></span>` : ""
    }`;
    if (label) layer.querySelector(".bg-layer__word").textContent = label.textContent.trim();
    section.prepend(layer);
    section.classList.add("has-bg-layer");
  });

  /* ---- 1. 出現 ---- */
  const revealEls = document.querySelectorAll(REVEAL);

  if (reduce.matches || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-inview"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---- 2. スクロール連動 ---- */
  if (reduce.matches) return;

  const linked = Array.from(document.querySelectorAll(LINKED));
  if (!linked.length) return;

  linked.forEach((el) => {
    const amount = parseFloat(el.dataset.parallax);
    if (!isNaN(amount)) el.style.setProperty("--parallax", `${amount}px`);
  });

  const active = new Set();
  let ticking = false;

  function update() {
    ticking = false;
    const vh = window.innerHeight;
    active.forEach((el) => {
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const p = (center - vh / 2) / (vh / 2 + r.height / 2);
      el.style.setProperty("--progress", Math.max(-1, Math.min(1, p)).toFixed(4));
    });
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  // 画面付近にある要素だけを計算する
  const watcher = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => (e.isIntersecting ? active.add(e.target) : active.delete(e.target)));
      requestUpdate();
    },
    { rootMargin: "25% 0px" }
  );
  linked.forEach((el) => watcher.observe(el));

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
})();
