(function () {
  "use strict";

  if (window.HFITQuickbar) return;

  const notes = document.querySelector(".notes-page");
  const checkPage = document.querySelector(".check-page");
  const atlasPage = document.querySelector(".atlas-page");
  const mode = notes ? notes.dataset.mode || "notes" : checkPage ? "checklist" : atlasPage ? "dorm" : null;
  if (!mode) return;

  const threshold = mode === "dorm" ? 280 : 520;
  const bar = document.createElement("div");
  bar.className = "quickbar";
  bar.setAttribute("aria-hidden", "true");
  bar.inert = true;

  function globalButton() {
    return '<button class="qb-global" type="button" data-qb-global aria-label="打开全站检索">全站</button>';
  }

  let sync = () => {};
  let refresh = () => {};

  if (mode === "faq" || mode === "software") {
    const pageSearch = document.querySelector("#searchInput, #faqSearch");
    const pageCount = document.querySelector("#resultCount, #faqCount");
    const catSelector = mode === "faq" && document.querySelector(".reader-cats")
      ? ".reader-cats [data-cat]"
      : ".cat-nav [data-cat-filter]";
    const catButtons = () => [...document.querySelectorAll(catSelector)];

    bar.innerHTML = `<div class="quickbar-inner">
      <span class="qb-label">${mode === "faq" ? "问答" : "软件"}</span>
      <label class="qb-search-field"><span class="sr-only">搜本页</span>
        <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M10.2 10.2L14 14" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>
        <input class="qb-search" type="search" placeholder="搜本页…" autocomplete="off">
      </label>
      ${catButtons().length ? '<select class="qb-select" aria-label="本页分类"></select>' : ""}
      <span class="qb-count"></span>
      ${globalButton()}
    </div>`;

    const input = bar.querySelector(".qb-search");
    const select = bar.querySelector(".qb-select");
    const count = bar.querySelector(".qb-count");

    if (catButtons().length) {
      select.innerHTML = catButtons()
        .map((button) => {
          const value = button.dataset.catFilter ?? button.dataset.cat ?? "";
          const active = button.classList.contains("is-active") || button.getAttribute("aria-pressed") === "true";
          return `<option value="${value}"${active ? " selected" : ""}>${button.textContent.replace(/\s+/g, " ").trim()}</option>`;
        })
        .join("");
      select.addEventListener("change", () => {
        const target = catButtons().find((button) => (button.dataset.catFilter ?? button.dataset.cat ?? "") === select.value);
        target?.click();
      });
    }

    if (pageSearch) {
      input.addEventListener("input", () => {
        pageSearch.value = input.value;
        pageSearch.dispatchEvent(new Event("input", { bubbles: true }));
      });
      pageSearch.addEventListener("input", () => {
        if (document.activeElement !== input) input.value = pageSearch.value;
      });
    }

    sync = () => {
      if (pageSearch) input.value = pageSearch.value;
      if (pageCount) count.textContent = pageCount.textContent.trim();
      if (select) {
        const active = catButtons().find((button) => button.classList.contains("is-active") || button.getAttribute("aria-pressed") === "true");
        if (active) select.value = active.dataset.catFilter ?? active.dataset.cat ?? "";
      }
    };
    refresh = sync;
    const catHost =
      mode === "faq" && document.querySelector(".reader-cats")
        ? document.querySelector(".reader-cats")
        : document.querySelector(".cat-nav");
    if (catHost) new MutationObserver(() => sync()).observe(catHost, { childList: true, subtree: true });
  } else if (mode === "checklist") {
    bar.innerHTML = `<div class="quickbar-inner">
      <span class="qb-label">清单</span>
      <span class="qb-progress"><b data-qb-done>0</b><small>/37</small></span>
      <span class="qb-note" data-qb-left></span>
      <button class="qb-action" type="button" data-qb-unchecked>只看未勾</button>
      <button class="qb-action" type="button" data-qb-copy>复制未带</button>
      ${globalButton()}
    </div>`;

    const done = bar.querySelector("[data-qb-done]");
    const left = bar.querySelector("[data-qb-left]");
    const update = () => {
      const ringDone = document.querySelector("#ringDone");
      const total = document.querySelectorAll(".check-row").length;
      const checked = Number(ringDone?.textContent || 0);
      const requiredLeft = [...document.querySelectorAll('.check-row[data-optional="false"]')].filter(
        (row) => row.getAttribute("aria-checked") !== "true"
      ).length;
      done.textContent = String(checked);
      const small = bar.querySelector(".qb-progress small");
      if (small) small.textContent = `/${total || 37}`;
      left.textContent = requiredLeft ? `必带差 ${requiredLeft}` : "必带齐了";
    };

    bar.querySelector("[data-qb-unchecked]").addEventListener("click", () => {
      const button = document.querySelector('[data-filter="unchecked"]');
      if (button) button.click();
    });
    bar.querySelector("[data-qb-copy]").addEventListener("click", () => window.HFITChecklist?.copyMissing?.());

    const observer = new MutationObserver(update);
    const ring = document.querySelector("#ringDone");
    const list = document.querySelector("#checkList");
    if (ring) observer.observe(ring, { childList: true, characterData: true, subtree: true });
    if (list) observer.observe(list, { subtree: true, attributes: true, attributeFilter: ["aria-checked"] });
    sync = update;
    refresh = update;
  } else if (mode === "dorm") {
    bar.innerHTML = `<div class="quickbar-inner">
      <span class="qb-label">图集</span>
      <button class="qb-step" type="button" data-qb-prev aria-label="上一张图纸">←</button>
      <span class="qb-plate" data-qb-plate>D01</span>
      <button class="qb-step" type="button" data-qb-next aria-label="下一张图纸">→</button>
      <span class="qb-plate-name" data-qb-name></span>
      <button class="qb-action" type="button" data-qb-index>图版索引</button>
      ${globalButton()}
    </div>`;

    const plate = bar.querySelector("[data-qb-plate]");
    const name = bar.querySelector("[data-qb-name]");
    bar.querySelector("[data-qb-prev]").addEventListener("click", () => document.querySelector("[data-prev]")?.click());
    bar.querySelector("[data-qb-next]").addEventListener("click", () => document.querySelector("[data-next]")?.click());
    bar.querySelector("[data-qb-index]").addEventListener("click", () => {
      const index = document.querySelector(".plate-index");
      index?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const update = () => {
      plate.textContent = document.querySelector("#currentId")?.textContent || "D01";
      name.textContent = document.querySelector("#currentName")?.textContent || "";
    };
    const current = document.querySelector("#currentId");
    if (current) new MutationObserver(update).observe(current, { childList: true, characterData: true, subtree: true });
    sync = update;
    refresh = update;
  }

  bar.addEventListener("click", (event) => {
    if (event.target.closest("[data-qb-global]")) window.HFITSearch?.open();
  });
  document.body.append(bar);

  let visible = false;
  let ticking = false;
  let anchor = null;
  let anchorMode = "top";
  if (mode === "faq" || mode === "software") {
    anchor = document.querySelector("#searchInput, #faqSearch");
    anchorMode = "top";
  } else if (mode === "checklist") {
    anchor = document.querySelector(".check-rail");
    anchorMode = "bottom";
  } else if (mode === "dorm") {
    anchor = document.querySelector(".atlas-toolbar");
    anchorMode = "bottom";
  }

  function updateVisibility() {
    let show = window.scrollY > threshold;
    if (show && anchor) {
      const rect = anchor.getBoundingClientRect();
      show = anchorMode === "bottom" ? rect.bottom < 68 : rect.top < 68;
    }
    if (show !== visible) {
      visible = show;
      bar.classList.toggle("is-visible", show);
      bar.setAttribute("aria-hidden", String(!show));
      bar.inert = !show;
      if (show) sync();
    }
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateVisibility();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  updateVisibility();
  window.HFITQuickbar = { refresh, show: () => sync() };
})();
