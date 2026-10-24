(function () {
  "use strict";

  const pages = [
    ["index.html", "00", "封面", "Cover"],
    ["dorm.html", "01", "宿舍图集", "Dorm Atlas"],
    ["checklist.html", "02", "报到清单", "Packing List"],
    ["faq.html", "03", "常见问答", "Questions"],
    ["software.html", "04", "软件与官网", "Field Kit"],
    ["layouts.html", "05", "宿舍布置", "Living"],
    ["murmur.html", "06", "碎碎念", "Marginalia"],
    ["design.html", "07", "设计手记", "Colophon"],
    ["about.html", "07", "关于作者", "About"],
    ["logs.html", "08", "更新日志", "Changelog"],
    ["support.html", "09", "支持作者", "Support"]
  ];

  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const current = pages.find(([name]) => name === file) || pages[0];

  document.body.classList.add("layout-v5");

  const headRight = document.querySelector(".head-right");
  if (headRight && !headRight.querySelector(".folio-now")) {
    const now = document.createElement("span");
    now.className = "folio-now";
    now.innerHTML = `<b>${current[1]}</b><span>${current[2]}</span>`;
    headRight.prepend(now);
  }

  const intro = document.querySelector(
    ".page-intro, .check-intro, .notes-intro, .living-intro, .design-intro, .log-intro, .about-intro, .support-intro"
  );
  if (intro && current[1] !== "00" && !intro.querySelector(".chapter-mark")) {
    const mark = document.createElement("span");
    mark.className = "chapter-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = current[1];
    intro.prepend(mark);
  }

  const main = document.querySelector("main");
  if (main && current[1] !== "00") {
    main.dataset.folio = current[1];
    const end = document.createElement("div");
    end.className = "page-end";
    end.setAttribute("aria-hidden", "true");
    end.innerHTML = `<span>${current[3]} / CAMPUS MANUAL</span><span>P.${current[1]}</span>`;
    main.append(end);
  }
})();
