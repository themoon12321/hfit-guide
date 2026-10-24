(function () {
  "use strict";

  const { $, itemId, getChecklistState, setChecklistState } = window.HFIT;
  const list = $("#miniList");
  const countLabel = $("#miniCount");
  const bar = $("#miniBar");
  if (!list || typeof CHECKLIST === "undefined") return;

  const total = CHECKLIST.reduce((sum, category) => sum + category.items.length, 0);
  const picks = [
    [0, 0],
    [2, 0],
    [3, 5]
  ];

  list.innerHTML = picks
    .map(([ci, ii]) => {
      const category = CHECKLIST[ci];
      const item = category && category.items[ii];
      if (!item) return "";
      return `
        <button class="mini-check" type="button" role="checkbox" aria-checked="false" data-id="${itemId(ci, ii)}">
          <span class="box" aria-hidden="true">
            <svg viewBox="0 0 14 14"><path d="M1.6 7.2l3.3 3.4L12.4 3.2"/></svg>
          </span>
          <span class="name">${window.HFIT.escapeHtml(item.name)}<span class="note">${window.HFIT.escapeHtml(window.HFIT.stripEmoji(category.cat))}</span></span>
        </button>`;
    })
    .join("");

  const buttons = Array.from(list.querySelectorAll(".mini-check"));
  let state = getChecklistState();

  function checkedCount() {
    return Object.keys(state).filter((key) => state[key]).length;
  }

  function sync() {
    buttons.forEach((button) => {
      button.setAttribute("aria-checked", state[button.dataset.id] ? "true" : "false");
    });
    const done = checkedCount();
    countLabel.textContent = done >= total ? `${total} / ${total} · 齐了` : `${done} / ${total}`;
    bar.style.transform = `scaleX(${done / total})`;
  }

  list.addEventListener("click", (event) => {
    const button = event.target.closest(".mini-check");
    if (!button) return;
    const id = button.dataset.id;
    state[id] = !state[id];
    setChecklistState(state);
    sync();
  });


  const featured = [
    {
      src: "assets/img/plates/D01.webp",
      w: 1400,
      h: 1049,
      id: "D01",
      title: "书桌 · 主正视图",
      side: "D01 — Desk / South Elevation",
      alt: "宿舍书桌主正视图，画面上标注了尺寸与局部细节",
      meta: "Scale 1:1 · 合肥理工学院",
      stamp: ["Measured", "16 图", "HFIT · 2026"]
    },
    {
      src: "assets/img/plates/C02.webp",
      w: 1400,
      h: 1050,
      id: "C02",
      title: "衣柜 · 上层能放什么",
      side: "C02 — Closet / Upper Shelf",
      alt: "衣柜上层开门视图，能看到隔板与收纳空间",
      meta: "Scale 1:1 · 合肥理工学院",
      stamp: ["Measured", "16 图", "HFIT · 2026"]
    },
    {
      src: "assets/img/layouts/Yo_01.webp",
      w: 1200,
      h: 900,
      id: "L01",
      layout: true,
      title: "Yo濛 · 桌面布置",
      side: "Living 01 — Desk / Yo",
      alt: "Yo濛的宿舍桌面：27 寸显示器、洞洞板与键盘",
      meta: "Living reference · 2026",
      stamp: ["Living", "05 套", "HFIT · 2026"]
    },
    {
      src: "assets/img/layouts/wzew_01.webp",
      w: 1200,
      h: 900,
      id: "L02",
      layout: true,
      title: "未知饿物 · 床铺与灯",
      side: "Living 02 — Bed / Unknown",
      alt: "未知饿物的床铺：深色床帘、枕头与床灯",
      meta: "Living reference · 2026",
      stamp: ["Living", "05 套", "HFIT · 2026"]
    },
    {
      src: "assets/img/layouts/kekokele_01.webp",
      w: 1200,
      h: 900,
      id: "L03",
      layout: true,
      title: "可口可乐 · 洞洞板桌面",
      side: "Living 03 — Desk / Kekokele",
      alt: "可口可乐的宿舍桌面：洞洞板、笔记本与收纳架",
      meta: "Living reference · 2026",
      stamp: ["Living", "05 套", "HFIT · 2026"]
    }
  ];

  function mountFeatured() {
    const figure = document.querySelector(".hero-figure");
    if (!figure || !featured.length) return;
    const image = figure.querySelector(".plate-canvas img");
    const side = figure.querySelector(".side-label");
    const caption = figure.querySelector("figcaption");
    const stamp = figure.querySelector(".plate-stamp");
    if (!image || !caption) return;
    let index = Math.floor(Math.random() * featured.length);

    function paint(next) {
      index = next;
      const item = featured[index];
      figure.classList.toggle("is-living", Boolean(item.layout));
      image.src = item.src;
      image.width = item.w;
      image.height = item.h;
      image.alt = item.alt;
      if (side) side.textContent = item.side;
      caption.innerHTML = `<span><b>${item.id}</b> / ${item.title}</span><span>${item.meta}</span>`;
      if (stamp) stamp.innerHTML = `<span>${item.stamp[0]}</span><b>${item.stamp[1]}</b><span>${item.stamp[2]}</span>`;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "hero-shuffle";
    button.textContent = "换一张";
    button.setAttribute("aria-label", "换一张宿舍照片");
    button.addEventListener("click", () => {
      let nextIndex = index;
      while (nextIndex === index) nextIndex = Math.floor(Math.random() * featured.length);
      paint(nextIndex);
    });
    figure.append(button);
    paint(index);
  }

  mountFeatured();


  const headlines = [
    {
      aria: "住在这里，总有些事要查。",
      lines: [{ text: "住在这里，" }, { text: "总有些事要查。", accent: true }]
    },
    {
      aria: "校园不大，常去的那几处。",
      lines: [{ text: "校园不大，" }, { text: "常去的那几处。", accent: true }]
    },
    {
      aria: "宿舍、教室、快递点，每天都走。",
      lines: [{ text: "宿舍、教室、" }, { text: "快递点。", accent: true }, { text: "每天都走。" }]
    },
    {
      aria: "一间宿舍，四年日常。",
      lines: [{ text: "一间宿舍，" }, { text: "四年日常。", accent: true }]
    },
    {
      aria: "宿舍不大，日子很长。",
      lines: [{ text: "宿舍不大，" }, { text: "日子很长。", accent: true }]
    },
    {
      aria: "把宿舍量清楚，再决定带什么。",
      lines: [{ text: "把宿舍量清楚，" }, { text: "再决定带什么。", accent: true }]
    },
    {
      aria: "住下来以后，很多事自然知道。",
      lines: [{ text: "住下来以后，" }, { text: "很多事自然知道。", accent: true }]
    },
    {
      aria: "常去的路，记在这里。",
      lines: [{ text: "常去的路，" }, { text: "记在这里。", accent: true }]
    }
  ];

  function mountHeadline() {
    const title = document.querySelector(".home-hero .hero-title");
    const actions = document.querySelector(".hero-actions");
    if (!title) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hero-headline-switch";
    button.textContent = "换一句";
    button.setAttribute("aria-label", "换一句首页标题");
    let index = Math.floor(Math.random() * headlines.length);

    function paint(next) {
      index = next;
      const item = headlines[index];
      title.setAttribute("aria-label", item.aria);
      title.innerHTML = item.lines
        .map((line) => `<span class="line">${line.accent ? `<span class="accent">${line.text}</span>` : line.text}</span>`)
        .join("");
    }

    button.addEventListener("click", () => {
      let next = index;
      while (next === index) next = Math.floor(Math.random() * headlines.length);
      paint(next);
    });
    if (actions) actions.append(button);
    paint(index);
  }

  mountHeadline();

  sync();
})();
