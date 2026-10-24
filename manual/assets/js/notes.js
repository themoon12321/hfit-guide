(function () {
  "use strict";

  if (typeof FAQ === "undefined" || typeof LINK_SITES === "undefined") return;

  const { $, $$, escapeHtml, stripEmoji, animateHeight, reduceMotion } = window.HFIT;
  const seg = $(".seg");
  const searchInput = $("#searchInput");
  const searchWrap = $("#searchWrap");
  const resultCount = $("#resultCount");
  const catNav = $("#catNav");
  const panelQa = $("#panelQa");
  const panelLinks = $("#panelLinks");
  const qaList = $("#qaList");
  const qaEmpty = $("#qaEmpty");
  const linksBody = $("#linksBody");
  const linksEmpty = $("#linksEmpty");
  const tabs = seg ? $$("[data-tab]", seg) : [];
  const pageMode = $(".notes-page")?.dataset.mode || null;
  const modeTab = pageMode === "faq" ? "qa" : pageMode === "software" ? "links" : null;

  if (!searchInput || !qaList || !linksBody) return;

  const incomingHash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (pageMode === "faq" && (incomingHash === "links" || incomingHash.startsWith("l-"))) {
    window.location.replace(`software.html${window.location.hash}`);
    return;
  }
  if (pageMode === "software" && (incomingHash === "qa" || /^q\d+$/.test(incomingHash))) {
    window.location.replace(`faq.html${window.location.hash}`);
    return;
  }

  const TODAY = new Date().toISOString().slice(0, 10);
  const state = { tab: modeTab || "qa", cat: null, query: "" };
  const qaAnimations = new WeakMap();
  let qaIndex = [];
  let linkCats = [];
  let linkMap = new Map();
  let sceneBlock = null;
  let editorialAside = null;
  let totalLinks = 0;
  let hiddenLinks = 0;

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function htmlToText(html) {
    const scratch = document.createElement("div");
    scratch.innerHTML = html;
    return scratch.textContent.replace(/\s+/g, " ").trim();
  }

  function normalize(value) {
    return String(value)
      .normalize("NFKC")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function queryTokens() {
    return state.query ? state.query.split(" ").filter(Boolean) : [];
  }

  function matchesQuery(text, tokens) {
    if (!tokens.length) return true;
    return tokens.every((token) => text.includes(token));
  }

  function localFaqImage(url) {
    const file = String(url).split("/").pop().replace(/\.[^.]+$/, "");
    return `assets/img/faq/${file}.webp`;
  }

  function answerToParagraphs(html) {
    return String(html)
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join("");
  }

  /* ---------- faq ---------- */

  function qaLikeMarkup(id) {
    if (pageMode !== "faq") return "";
    return `
      <button class="qa-like" type="button" data-like-page="faq" data-like-item="${escapeHtml(id)}" data-like-label="这条问答有用" aria-pressed="false" aria-label="这条问答有用">
        <span class="qa-like-mark" aria-hidden="true"></span><span>有用</span><span class="qa-like-count" data-like-count>…</span>
      </button>`;
  }

  const faqMarkup = FAQ.map((question, index) => {
    const id = question.id || `q${index + 1}`;
    const tags = question.tags || [];
    const images = (question.images || []).map(
      (src, imageIndex) =>
        `<img src="${localFaqImage(src)}" alt="${escapeHtml(question.q)} 配图 ${imageIndex + 1}" loading="lazy">`
    );
    const footTags = tags.map((tag) => `<span class="qa-tag">${escapeHtml(tag)}</span>`).join("");
    return `
      <article class="qa" id="${escapeHtml(id)}" data-open="false" data-index="${index}">
        <h3>
          <button class="qa-q" type="button" aria-expanded="false" aria-controls="a-${escapeHtml(id)}">
            <span class="qa-num">Q.${pad(index + 1)}</span>
            <span class="qa-title">${escapeHtml(question.q)}</span>
            <span class="qa-toggle" aria-hidden="true"></span>
          </button>
        </h3>
        <div class="qa-a" id="a-${escapeHtml(id)}">
          <div class="qa-a-inner">
            <div class="answer-body">${answerToParagraphs(question.a)}${images.length ? `<div class="answer-images">${images.join("")}</div>` : ""}</div>
            <div class="qa-foot">
              <span>Filed under</span>
              ${footTags}
              <span>最近核对 ${typeof FAQ_UPDATED !== "undefined" ? escapeHtml(FAQ_UPDATED) : ""}</span>
              <button class="qa-copy" type="button" data-copy-qa="${escapeHtml(id)}">复制链接</button>
              ${qaLikeMarkup(id)}
            </div>
          </div>
        </div>
      </article>`;
  });

  qaList.innerHTML = faqMarkup.join("");

  qaIndex = FAQ.map((question, index) => {
    const id = question.id || `q${index + 1}`;
    const element = document.getElementById(id);
    const tags = question.tags || [];
    const text = normalize(
      [
        question.q,
        htmlToText(question.a),
        tags.join(" "),
        "Q." + pad(index + 1)
      ].join(" ")
    );
    return { id, element, tags, text };
  });

  function setQaOpen(id, open, options = {}) {
    const entry = qaIndex.find((item) => item.id === id);
    if (!entry) return;
    const article = entry.element;
    const button = $(".qa-q", article);
    const panel = $(".qa-a", article);
    if (!article || !button || !panel) return;
    if (article.dataset.open === String(open)) return;

    article.dataset.open = String(open);
    button.setAttribute("aria-expanded", String(open));

    const running = qaAnimations.get(panel);
    if (running) running.cancel();

    if (options.animate === false) {
      panel.style.height = open ? "auto" : "0px";
      panel.style.overflow = "";
    } else {
      const animation = animateHeight(panel, open ? "auto" : 0);
      if (animation) qaAnimations.set(panel, animation);
    }

    if (options.updateHash !== false) {
      const nextHash = open ? `#${id}` : "#qa";
      if (location.hash !== nextHash) history.replaceState(null, "", nextHash);
    }
  }

  function openQa(id, options = {}) {
    const target = qaIndex.find((item) => item.id === id);
    if (!target) return;
    qaIndex.forEach((item) => {
      if (item.id !== id && item.element.dataset.open === "true") {
        setQaOpen(item.id, false, { updateHash: false, animate: options.animate !== false });
      }
    });
    target.element.hidden = false;
    setQaOpen(id, true, { animate: options.animate !== false, updateHash: options.updateHash !== false });
    if (options.scroll) {
      requestAnimationFrame(() => {
        target.element.scrollIntoView({
          behavior: reduceMotion.matches ? "auto" : "smooth",
          block: "start"
        });
      });
    }
  }

  function copyText(text, button) {
    const done = () => {
      if (window.HFIT?.showToast) window.HFIT.showToast("链接已复制");
      if (button) {
        const old = button.textContent;
        button.textContent = "已复制";
        window.setTimeout(() => {
          button.textContent = old;
        }, 1200);
      }
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {
        if (window.HFIT?.showToast) window.HFIT.showToast("复制失败，请手动复制地址栏。");
      });
    } else {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      try {
        document.execCommand("copy");
        done();
      } catch {
        if (window.HFIT?.showToast) window.HFIT.showToast("复制失败，请手动复制地址栏。");
      }
      area.remove();
    }
  }

  qaList.addEventListener("click", (event) => {
    const copy = event.target.closest("[data-copy-qa]");
    if (copy) {
      event.preventDefault();
      copyText(new URL(`faq.html#${copy.dataset.copyQa}`, location.href).href, copy);
      return;
    }
    const button = event.target.closest(".qa-q");
    if (!button) return;
    const article = button.closest(".qa");
    if (!article) return;
    const isOpen = article.dataset.open === "true";
    if (isOpen) {
      setQaOpen(article.id, false);
    } else {
      openQa(article.id);
    }
  });

  /* ---------- links ---------- */

  const linkData = LINK_SITES.map((group, groupIndex) => {
    const kept = group.items.filter((item) => {
      if (!item.until) return true;
      const valid = item.until >= TODAY;
      if (!valid) hiddenLinks += 1;
      return valid;
    });
    return {
      ...group,
      groupIndex,
      label: stripEmoji(group.cat) || group.cat,
      items: kept.map((item, itemIndex) => ({ ...item, groupIndex, itemIndex, id: `l-${groupIndex}-${itemIndex}` }))
    };
  });

  totalLinks = linkData.reduce((sum, group) => sum + group.items.length, 0);

  const metaCount = $("#linkMetaCount");
  const tabCount = $("#linkTabCount");
  if (metaCount) metaCount.textContent = String(totalLinks);
  if (tabCount) tabCount.textContent = String(totalLinks);

  linkData.forEach((group) => {
    group.items.forEach((item) => linkMap.set(item.name, item));
  });

  function linkKind(item) {
    if (item.wechat) return "微信内";
    if (item.app) return "APP";
    if (item.noLink) return "站外查找";
    return "";
  }

  const LINK_ICON_NAMES = {
    学校官网: "building",
    学校官方公众号: "chat",
    "智慧合理工 APP": "phone",
    "四六级考试（CET）": "certificate",
    学信网: "id",
    全国计算机等级考试: "monitor",
    "中国大学 MOOC": "course",
    "B 站": "play",
    国家高等教育智慧教育平台: "cap",
    GitHub: "branch",
    菜鸟教程: "book",
    "知网 CNKI": "paper",
    飞书: "chat",
    Everything: "search",
    "7-Zip": "archive",
    Snipaste: "screenshot",
    PowerToys: "grid",
    "Geek Uninstaller": "trash",
    Obsidian: "gem",
    TrafficMonitor: "monitor",
    Wireshark: "network",
    中科大测速: "gauge",
    "拓竹 3D 打印": "printer",
    "Creality Print": "printer",
    火绒安全: "shield",
    "WPS Office": "paper",
    "VS Code": "code",
    PyCharm: "code",
    Python: "terminal",
    Git: "branch",
    "Visual Studio": "layers",
    MobaXterm: "terminal",
    ToDesk: "remote",
    图吧工具箱: "toolbox",
    "UU 加速器": "rocket",
    Steam: "gamepad",
    "Watt Toolkit（原 Steam++）": "switch",
    剪映专业版: "scissors",
    必剪: "film",
    "达芬奇（DaVinci Resolve）": "palette",
    PS: "image",
    PR: "film",
    "SolidWorks 等专业软件": "cube",
    "瓦罗兰特（Valorant）": "target",
    CS2: "target",
    完美对战平台: "gamepad",
    "5E 对战平台": "target",
    米哈游游戏: "star",
    "我的世界（Minecraft）": "cube",
    "PCL2 启动器": "play",
    "Wallpaper Engine": "image",
    DeepSeek: "sparkles",
    "DeepSeek API 平台": "api",
    Kimi: "moon",
    豆包: "chat",
    通义千问: "cloud",
    智谱清言: "sparkles",
    ZCode: "code",
    WorkBuddy: "briefcase",
    Qoder: "wand",
    OpenCode: "terminal",
    Codex: "terminal",
    "CC Switch": "switch"
  };

  const GROUP_ICONS = ["building", "certificate", "book", "grid", "code", "gamepad", "sparkles"];

  function linkIcon(item) {
    const iconName = LINK_ICON_NAMES[item.name] || GROUP_ICONS[item.groupIndex] || "link";
    const svg = window.HFITIcons ? window.HFITIcons.svg(iconName) : "";
    const fallback = `<span class="link-icon-letter">${escapeHtml(item.name.slice(0, 1))}</span>`;
    return `<span class="link-icon" aria-hidden="true">${svg || fallback}</span>`;
  }

  const mustItems = linkData.flatMap((group) => group.items.filter((item) => item.must));

  function mustMarkup() {
    if (!mustItems.length) return "";
    return `
      <div class="must-strip">
        <div class="must-strip-head">
          <span class="kicker">Start here / 必装这几样</span>
          <span class="mono">${mustItems.length} 个必装</span>
        </div>
        <div class="must-grid">
          ${mustItems.map((item) => `
            <a class="must-item" href="#${item.id}" data-jump="${escapeHtml(item.name)}">
              <span class="link-icon" aria-hidden="true">${window.HFITIcons ? window.HFITIcons.svg(LINK_ICON_NAMES[item.name] || GROUP_ICONS[item.groupIndex] || "link") : ""}</span>
              <span><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.desc || "")}</small></span>
            </a>`).join("")}
        </div>
      </div>`;
  }

  function linkMarkup(item) {
    const kind = linkKind(item);
    const name = item.url
      ? `<a class="link-name" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.name)}${item.must ? '<span class="link-must">必装</span>' : ""}</a>`
      : `<span class="link-name">${escapeHtml(item.name)}${item.must ? '<span class="link-must">必装</span>' : ""}</span>`;
    const out = item.url
      ? `<span class="link-out" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M4 12L12 4M6 4h6v6" fill="none" stroke="currentColor" stroke-width="1.3"/></svg></span>`
      : `<span class="link-kind">${kind}</span>`;
    const noteId = `ln-${item.id}`;
    const noteButton = item.note && item.note.length
      ? `<button class="link-note-btn" type="button" aria-expanded="false" aria-controls="${noteId}">
           <span class="dot" aria-hidden="true"></span>批注 ${item.note.length}
         </button>`
      : "";
    const note = item.note && item.note.length
      ? `<div class="link-note" id="${noteId}">
           <div class="link-note-inner">${item.note.map((paragraph) => `<p>${paragraph}</p>`).join("")}</div>
         </div>`
      : "";
    return `
      <div class="link-item" id="${item.id}" data-name="${escapeHtml(item.name)}">
        <div class="link-row">
          ${linkIcon(item)}
          <div class="link-main">
            ${name}
            <span class="link-desc">${escapeHtml(item.desc || "")}</span>
            ${out}
          </div>
          ${noteButton}
        </div>
        ${note}
      </div>`;
  }

  function categoryMarkup(group) {
    const expiredNote =
      group.groupIndex === 0 && hiddenLinks
        ? `<p class="link-cat-note">其中 ${hiddenLinks} 条迎新期专属链接（智慧合理工 APP）已过有效期，自动隐藏。</p>`
        : "";
    const groupNote = group.groupNote
      ? `<p class="link-cat-note">${escapeHtml(group.groupNote)}</p>`
      : "";
    return `
      <section class="link-cat" id="cat-${group.groupIndex}" data-cat="${escapeHtml(group.label)}">
        <div class="link-cat-head">
          <div class="link-cat-title">
            <span class="link-cat-num">${pad(group.groupIndex + 1)}</span>
            <h2>${escapeHtml(group.label)}</h2>
          </div>
          <span class="mono">${group.items.length} 条</span>
        </div>
        ${groupNote}
        ${expiredNote}
        ${group.items.map(linkMarkup).join("")}
      </section>`;
  }

  function sceneMarkup() {
    if (typeof SCENES === "undefined" || !SCENES.length) return "";
    const scenes = SCENES.map((scene, index) => {
      const items = scene.items.map((name) => {
        const item = linkMap.get(name);
        const href = item ? `#${item.id}` : "#links";
        return `<li><a href="${href}" data-jump="${escapeHtml(name)}">${escapeHtml(name)}</a></li>`;
      });
      return `
        <div class="scene">
          <span class="kit">KIT ${pad(index + 1)}</span>
          <h3>${escapeHtml(scene.name)}</h3>
          <p class="scene-desc">${escapeHtml(scene.desc)}</p>
          <ul>${items.join("")}</ul>
        </div>`;
    });
    return `
      <div class="scene-block">
        <div class="scene-head">
          <span class="kicker">Scene Kits / 按场景打包</span>
          <span class="mono">${pad(SCENES.length)} Sets · 点击直达</span>
        </div>
        <div class="scene-grid">${scenes.join("")}</div>
      </div>`;
  }

  function asideMarkup() {
    const swaps = typeof SWAP_LIST !== "undefined" && SWAP_LIST.length
      ? `<div class="swap-list">${SWAP_LIST.map(
          (row) => `
            <div class="swap-row">
              <span class="bad">${escapeHtml(row.bad)}</span>
              <span class="arrow" aria-hidden="true">→</span>
              <span class="good">${escapeHtml(row.good)}<span class="why">${escapeHtml(row.why)}</span></span>
            </div>`
        ).join("")}</div>`
      : "";
    const recommends = typeof RECOMMENDS !== "undefined" && RECOMMENDS.length
      ? RECOMMENDS.map(
          (item) => `
            <div class="rec-card">
              <span class="rec-type">${escapeHtml(item.type || "推荐")} · 同学推荐</span>
              <blockquote>${escapeHtml(item.quote)}</blockquote>
              <cite>—— ${escapeHtml(item.by)}</cite>
            </div>`
        ).join("")
      : "";
    if (!swaps && !recommends) return "";
    return `
      <div class="editorial-aside">
        <section class="aside-block">
          <h3>别用这些，改用这些。</h3>
          <p>来自实际踩坑的替代对照。不是为了多装软件，而是少装一堆拖慢电脑的东西。</p>
          ${swaps}
        </section>
        <section class="aside-block">
          <h3>同学推荐</h3>
          <p>被同学反复提到的，才收进这份清单。推荐原话保留，不做润色。</p>
          ${recommends}
        </section>
      </div>`;
  }

  linksBody.innerHTML = mustMarkup() + linkData.map(categoryMarkup).join("") + sceneMarkup() + asideMarkup();
  sceneBlock = $(".scene-block", linksBody);
  editorialAside = $(".editorial-aside", linksBody);

  linkCats = linkData.map((group) => {
    const element = document.getElementById(`cat-${group.groupIndex}`);
    const itemElements = group.items.map((item) => {
      const itemElement = document.getElementById(item.id);
      const noteText = item.note ? item.note.map(htmlToText).join(" ") : "";
      const text = normalize(
        [item.name, item.desc, group.label, group.groupNote || "", noteText, linkKind(item)].join(" ")
      );
      return { item, element: itemElement, text };
    });
    return { group, element, items: itemElements };
  });

  linksBody.addEventListener("click", (event) => {
    const noteButton = event.target.closest(".link-note-btn");
    if (noteButton) {
      const item = noteButton.closest(".link-item");
      const note = item ? $(".link-note", item) : null;
      if (!note) return;
      const open = noteButton.getAttribute("aria-expanded") === "true";
      noteButton.setAttribute("aria-expanded", String(!open));
      animateHeight(note, open ? 0 : "auto");
      return;
    }

    const jump = event.target.closest("[data-jump]");
    if (!jump) return;
    event.preventDefault();
    jumpToLink(jump.dataset.jump);
  });

  function flashLink(element) {
    if (!element) return;
    element.classList.remove("is-flash");
    void element.offsetWidth;
    element.classList.add("is-flash");
    window.setTimeout(() => element.classList.remove("is-flash"), 1800);
  }

  function jumpToLink(name) {
    const item = linkMap.get(name);
    if (!item) {
      activateTab("links");
      return;
    }
    state.query = "";
    searchInput.value = "";
    searchWrap.classList.remove("has-value");
    state.cat = null;
    activateTab("links", { updateHash: false });
    history.replaceState(null, "", `#${item.id}`);
    const itemElement = document.getElementById(item.id);
    const noteButton = itemElement ? $(".link-note-btn", itemElement) : null;
    if (noteButton && noteButton.getAttribute("aria-expanded") !== "true") {
      noteButton.setAttribute("aria-expanded", "true");
      const note = $(".link-note", itemElement);
      if (note) animateHeight(note, "auto");
    }
    requestAnimationFrame(() => {
      if (!itemElement) return;
      itemElement.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
      flashLink(itemElement);
      const nameLink = $("a.link-name", itemElement);
      if (nameLink) nameLink.focus({ preventScroll: true });
    });
  }

  /* ---------- filtering ---------- */

  function qaCategories() {
    const order = [];
    const counts = new Map();
    FAQ.forEach((question) => {
      (question.tags || []).forEach((tag) => {
        if (!counts.has(tag)) order.push(tag);
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });
    return order.map((tag) => ({ label: tag, count: counts.get(tag) }));
  }

  function catsForTab() {
    if (state.tab === "qa") return qaCategories();
    return linkData.map((group) => ({ label: group.label, count: group.items.length }));
  }

  function renderCatNav() {
    const categories = catsForTab();
    const total = state.tab === "qa" ? FAQ.length : totalLinks;
    const chips = [
      `<button class="chip${state.cat === null ? " is-active" : ""}" type="button" data-cat-filter="" aria-pressed="${state.cat === null}">全部 <span class="count">${total}</span></button>`
    ];
    categories.forEach((category) => {
      const active = state.cat === category.label;
      chips.push(
        `<button class="chip${active ? " is-active" : ""}" type="button" data-cat-filter="${escapeHtml(category.label)}" aria-pressed="${active}">${escapeHtml(category.label)} <span class="count">${category.count}</span></button>`
      );
    });
    catNav.innerHTML = chips.join("");
  }

  catNav.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-cat-filter]");
    if (!chip) return;
    const value = chip.dataset.catFilter || null;
    state.cat = value && state.cat !== value ? value : null;
    renderCatNav();
    applyFilter();
    revealResults();
  });

  function revealResults() {
    const head = $(".notes-panel:not([hidden]) .panel-head");
    if (!head) return;
    const tools = $(".notes-tools");
    const cutoff = (tools ? tools.getBoundingClientRect().bottom : 0) + 8;
    if (head.getBoundingClientRect().top < cutoff) {
      head.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    }
  }

  function updateSearchClear() {
    searchWrap.classList.toggle("has-value", Boolean(searchInput.value));
  }

  function applyFilter() {
    const tokens = queryTokens();
    if (state.tab === "qa") {
      let visible = 0;
      qaIndex.forEach((entry) => {
        const matchesCat = !state.cat || entry.tags.includes(state.cat);
        const show = matchesCat && matchesQuery(entry.text, tokens);
        entry.element.hidden = !show;
        if (show) visible += 1;
      });
      qaList.hidden = visible === 0;
      qaEmpty.hidden = visible !== 0;
      resultCount.textContent =
        !state.query && !state.cat
          ? `${FAQ.length} 条问答`
          : `${visible} / ${FAQ.length} 条问答`;
    } else {
      let visible = 0;
      linkCats.forEach((category) => {
        let categoryVisible = 0;
        category.items.forEach((entry) => {
          const matchesCat = !state.cat || category.group.label === state.cat;
          const show = matchesCat && matchesQuery(entry.text, tokens);
          if (entry.element) entry.element.hidden = !show;
          if (show) categoryVisible += 1;
        });
        if (category.element) category.element.hidden = categoryVisible === 0;
        visible += categoryVisible;
      });
      if (sceneBlock) sceneBlock.hidden = Boolean(state.query || state.cat);
      if (editorialAside) editorialAside.hidden = Boolean(state.query || state.cat);
      linksBody.hidden = visible === 0;
      linksEmpty.hidden = visible !== 0;
      resultCount.textContent =
        !state.query && !state.cat
          ? `${totalLinks} 条链接`
          : `${visible} / ${totalLinks} 条链接`;
    }
  }

  searchInput.addEventListener("input", () => {
    state.query = normalize(searchInput.value);
    updateSearchClear();
    applyFilter();
    revealResults();
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && searchInput.value) {
      event.preventDefault();
      clearSearch();
    }
  });

  function clearSearch() {
    searchInput.value = "";
    state.query = "";
    updateSearchClear();
    applyFilter();
    searchInput.focus({ preventScroll: true });
  }

  $$("[data-clear-search]").forEach((button) => {
    button.addEventListener("click", clearSearch);
  });

  $("#searchClear").addEventListener("click", clearSearch);

  /* ---------- tabs ---------- */

  function updateTabs() {
    const isQa = state.tab === "qa";
    if (seg) seg.dataset.active = state.tab;
    tabs.forEach((tab) => {
      const selected = tab.dataset.tab === state.tab;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panelQa.hidden = !isQa;
    panelLinks.hidden = isQa;
  }

  function activateTab(tab, options = {}) {
    if (tab !== "qa" && tab !== "links") return;
    if (pageMode === "faq" && tab === "links") {
      window.location.href = "software.html#links";
      return;
    }
    if (pageMode === "software" && tab === "qa") {
      window.location.href = "faq.html#qa";
      return;
    }
    const changed = state.tab !== tab;
    state.tab = tab;
    if (options.keepCat !== true) state.cat = null;
    updateTabs();
    renderCatNav();
    applyFilter();
    if (options.updateHash !== false) {
      const nextHash = `#${tab}`;
      if (location.hash !== nextHash) history.replaceState(null, "", nextHash);
    }
    if (changed && options.scroll) {
      const tools = $(".notes-tools");
      if (tools && window.scrollY > tools.offsetTop + 80) {
        tools.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      }
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const shouldScroll = window.scrollY > ($(".notes-tools")?.offsetTop || 0) + 80;
      activateTab(tab.dataset.tab, { scroll: shouldScroll });
    });
  });

  if (seg) {
    seg.addEventListener("keydown", (event) => {
      const current = tabs.indexOf(document.activeElement);
      if (current === -1) return;
      let next = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % tabs.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      tabs[next].focus();
      activateTab(tabs[next].dataset.tab, { scroll: false });
    });
  }

  /* ---------- deep links ---------- */

  function handleHash() {
    const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!hash) return;

    if (hash === "qa" || hash === "links") {
      activateTab(hash, { updateHash: false, scroll: true });
      return;
    }

    if (hash.startsWith("cat-")) {
      state.query = "";
      searchInput.value = "";
      updateSearchClear();
      state.cat = null;
      activateTab("links", { updateHash: false });
      const category = document.getElementById(hash);
      if (category) {
        requestAnimationFrame(() => {
          category.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
        });
      }
      return;
    }

    if (hash.startsWith("l-")) {
      state.query = "";
      searchInput.value = "";
      updateSearchClear();
      state.cat = null;
      activateTab("links", { updateHash: false });
      const itemElement = document.getElementById(hash);
      if (itemElement) {
        requestAnimationFrame(() => {
          itemElement.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
          flashLink(itemElement);
        });
      }
      return;
    }

    if (qaIndex.some((entry) => entry.id === hash)) {
      state.query = "";
      searchInput.value = "";
      updateSearchClear();
      state.cat = null;
      activateTab("qa", { updateHash: false });
      renderCatNav();
      applyFilter();
      openQa(hash, { scroll: true, animate: false });
    }
  }

  window.addEventListener("hashchange", handleHash);

  /* ---------- boot ---------- */

  const initialHash = decodeURIComponent(location.hash.replace(/^#/, ""));
  const initialQuestion = qaIndex.find((entry) => entry.id === initialHash);
  if (initialQuestion) {
    setQaOpen(initialQuestion.id, true, { animate: false, updateHash: false });
  } else if (qaIndex.length && window.matchMedia("(min-width: 901px)").matches) {
    setQaOpen(qaIndex[0].id, true, { animate: false, updateHash: false });
  }

  updateSearchClear();
  updateTabs();
  renderCatNav();
  applyFilter();

  if (initialHash && initialHash !== "qa") {
    requestAnimationFrame(() => {
      requestAnimationFrame(handleHash);
    });
  }
})();
