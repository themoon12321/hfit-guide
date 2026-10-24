(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const force = params.get("cover") === "1";
  const disabled = params.get("cover") === "0";
  if (disabled) return;
  if (window.location.hash && !force) return;

  let seen = false;
  try {
    seen = localStorage.getItem("hfit-entered") === "1";
  } catch {
    /* The cover still works without storage. */
  }
  if (seen && !force) return;
  if (document.getElementById("entryCover")) return;

  const currentTheme = document.documentElement.dataset.theme || "paper";
  const pressed = (theme) => (theme === currentTheme ? "true" : "false");

  document.body.insertAdjacentHTML(
    "afterbegin",
    `
    <dialog class="entry-cover" id="entryCover" tabindex="-1" aria-labelledby="entryTitle" aria-describedby="entryDesc">
      <div class="entry-shell">
        <header class="entry-head">
          <span class="entry-brand">
            <span class="brand-mark" aria-hidden="true">合</span>
            <span><b>合肥理工学院指南</b><small>CAMPUS MANUAL</small></span>
          </span>
          <span class="entry-issue">ISSUE 01 · 2026</span>
          <button class="entry-close" type="button" data-entry-close aria-label="关闭封面">
            <span>关闭</span><i aria-hidden="true"></i>
          </button>
        </header>

        <div class="entry-grid">
          <section class="entry-main">
            <p class="kicker">Campus Manual / Opening</p>
            <h1 class="entry-title" id="entryTitle">校园<br><span>使用手册。</span></h1>
            <p class="entry-lede" id="entryDesc">宿舍尺寸、报到清单、软件入口和现场批注。内容来自在校生的实测与经验，需要时翻到对应那一页。</p>
            <div class="entry-actions">
              <a class="btn entry-enter" href="index.html" data-entry-link>进入首页 <span aria-hidden="true">→</span></a>
              <a class="text-link" href="about.html" data-entry-link>关于作者 <span aria-hidden="true">↗</span></a>
              <span class="entry-hint">或选择栏目进入</span>
            </div>

            <div class="entry-theme">
              <span class="entry-theme-label">阅读皮肤 / Theme</span>
              <div class="theme-choices">
                <button class="theme-choice" type="button" data-theme-choice="paper" aria-pressed="${pressed("paper")}">
                  <span class="theme-swatch theme-swatch-paper" aria-hidden="true"><span>纸</span><small>PAPER</small></span>
                  <span class="theme-copy"><b>纸本</b><small>白天 · 暖纸墨色</small></span>
                </button>
                <button class="theme-choice" type="button" data-theme-choice="night" aria-pressed="${pressed("night")}">
                  <span class="theme-swatch theme-swatch-night" aria-hidden="true"><span>夜</span><small>NIGHT</small></span>
                  <span class="theme-copy"><b>墨夜</b><small>夜间 · 低亮阅读</small></span>
                </button>
              </div>
            </div>
          </section>

          <nav class="entry-nav" aria-label="选择栏目">
            <span class="entry-nav-label">选择入口 / Index</span>
            <a href="dorm.html" data-entry-link>
              <span class="entry-n">01</span>
              <span class="entry-t">宿舍图集<small>16 张实测图与现场批注</small></span>
              <span class="entry-e">Atlas</span>
            </a>
            <a href="checklist.html" data-entry-link>
              <span class="entry-n">02</span>
              <span class="entry-t">报到清单<small>37 项物品，勾选并保存在本机</small></span>
              <span class="entry-e">Packing</span>
            </a>
            <a href="faq.html" data-entry-link>
              <span class="entry-n">03</span>
              <span class="entry-t">常见问答<small>6 条高频问题，按校园生活分类</small></span>
              <span class="entry-e">FAQ</span>
            </a>
            <a href="software.html" data-entry-link>
              <span class="entry-n">04</span>
              <span class="entry-t">软件与官网<small>必装工具、学校与考试入口</small></span>
              <span class="entry-e">Software</span>
            </a>
            <a href="about.html" data-entry-link>
              <span class="entry-n">07</span>
              <span class="entry-t">关于作者<small>个人介绍、爱好与联系方式</small></span>
              <span class="entry-e">About</span>
            </a>
            <div class="entry-secondary">
              <span>再读 / More</span>
              <a href="layouts.html" data-entry-link>宿舍布置</a>
              <a href="murmur.html" data-entry-link>碎碎念</a>
              <a href="support.html" data-entry-link>支持作者</a>
            </div>
            <p class="entry-stamp"><b>16 / 37 / 60</b><span>PLATES · ITEMS · LINKS<br>HEFEI INSTITUTE OF TECHNOLOGY</span></p>
          </nav>
        </div>

        <footer class="entry-foot">
          <span>非官方个人公益项目 · 作者 @月亮早睡困不醒</span>
          <span>内容与尺寸以学校通知和现场实测为准</span>
        </footer>
      </div>
    </dialog>`
  );

  const dialog = document.getElementById("entryCover");
  if (!dialog) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let closing = false;

  function markSeen() {
    try {
      localStorage.setItem("hfit-entered", "1");
    } catch {
      /* no-op */
    }
  }

  function closeCover() {
    if (closing) return;
    closing = true;
    markSeen();
    dialog.classList.add("is-leaving");
    const finish = () => {
      document.documentElement.classList.remove("entry-open");
      if (dialog.open) dialog.close();
      const url = new URL(window.location.href);
      if (url.searchParams.has("cover")) {
        url.searchParams.delete("cover");
        history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      }
    };
    if (reduceMotion.matches) finish();
    else window.setTimeout(finish, 260);
  }

  dialog.querySelectorAll("[data-entry-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      markSeen();
      const target = new URL(link.href, window.location.href);
      if (target.origin === window.location.origin && target.pathname === window.location.pathname && !target.hash) {
        event.preventDefault();
        closeCover();
      }
    });
  });
  dialog.querySelector("[data-entry-close]")?.addEventListener("click", closeCover);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeCover();
  });
  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("entry-open");
  });

  document.documentElement.classList.add("entry-open");
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    dialog.focus({ preventScroll: true });
  } else {
    dialog.setAttribute("open", "");
  }
})();
