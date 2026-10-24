(function () {
  "use strict";

  if (typeof CHECKLIST === "undefined") return;

  const { $, $$, escapeHtml, stripEmoji, itemId, getChecklistState, setChecklistState, showToast, reduceMotion } = window.HFIT;

  const list = $("#checkList");
  const filtersEl = $("#filterGroup");
  const jumpEl = $("#jumpGroup");
  const ring = $("#progressRing");
  const ringFill = $("#ringFill");
  const ringDone = $("#ringDone");
  const progressTitle = $("#progressTitle");
  const progressCopy = $("#progressCopy");
  const mobileDone = $("#mobileDone");
  const mobileBar = $("#mobileBar");
  const MICRO = 439.82;

  const allItems = CHECKLIST.flatMap((category, ci) =>
    category.items.map((item, ii) => ({ ...item, ci, ii, id: itemId(ci, ii) }))
  );
  const total = allItems.length;
  const required = allItems.filter((item) => !item.optional);
  const optional = allItems.filter((item) => item.optional);
  let state = getChecklistState();
  let filter = "all";
  let query = "";

  const pad = (value) => String(value).padStart(2, "0");
  const normalize = (value) => String(value || "").toLowerCase().normalize("NFKC").replace(/\s+/g, "");
  const doneCount = () => allItems.filter((item) => Boolean(state[item.id])).length;

  filtersEl.innerHTML = [["all", "全部", total], ["required", "必带", required.length], ["optional", "可选", optional.length], ["unchecked", "未勾", total]]
    .map(
      ([key, label, count]) => `
      <button class="chip${key === filter ? " is-active" : ""}" type="button" data-filter="${key}" aria-pressed="${key === filter}">
        ${label}<span class="count" data-filter-count="${key}">${count}</span>
      </button>`
    )
    .join("");

  jumpEl.innerHTML = CHECKLIST.map(
    (category, index) => `
    <button class="chip" type="button" data-jump="${index}">${pad(index + 1)} ${escapeHtml(stripEmoji(category.cat))}</button>`
  ).join("");

  const firstFilter = document.querySelector(".check-rail .filter-block");
  if (firstFilter && !document.querySelector("#checkSearch")) {
    firstFilter.insertAdjacentHTML(
      "beforeend",
      `<div class="check-find">
        <label class="check-find-label" for="checkSearch">查找 / Find</label>
        <input id="checkSearch" type="search" placeholder="输入物品名…" autocomplete="off">
      </div>`
    );
  }

  const actions = document.querySelector(".rail-actions");
  if (actions && !document.querySelector("#copyMissingBtn")) {
    actions.insertAdjacentHTML(
      "beforeend",
      `<button id="copyMissingBtn" type="button">复制未带</button>
       <button id="shareMissingBtn" type="button">分享剩余</button>
       <button id="printCurrentBtn" type="button">打印当前</button>`
    );
  }

  const categoriesHtml = CHECKLIST.map((category, ci) => {
    const title = stripEmoji(category.cat);
    const rows = category.items
      .map((item, ii) => {
        const id = itemId(ci, ii);
        return `
          <button class="check-row${item.optional ? " is-optional" : ""}" type="button" role="checkbox"
            id="check-${id}" data-id="${id}" data-optional="${Boolean(item.optional)}"
            aria-checked="${Boolean(state[id])}">
            <span class="check-box" aria-hidden="true">
              <svg viewBox="0 0 14 14"><path d="M1.8 7.3l3.2 3.3 7.2-7.2"/></svg>
            </span>
            <span class="item-main">
              <span class="item-name">${escapeHtml(item.name)}</span>
              ${item.note ? `<span class="item-note">${escapeHtml(item.note)}</span>` : ""}
            </span>
            ${item.optional ? '<span class="optional-tag">可选</span>' : ""}
          </button>${item.link ? `<a class="check-jump" href="${escapeHtml(item.link.href)}">${escapeHtml(item.link.label)} <span aria-hidden="true">↗</span></a>` : ""}`;
      })
      .join("");

    return `
      <section class="cat-section" id="cat-c${ci}" data-ci="${ci}" aria-labelledby="cat-title-${ci}">
        <div class="cat-head">
          <div class="cat-title">
            <span class="cat-num">${pad(ci + 1)}</span>
            <h2 id="cat-title-${ci}">${escapeHtml(title)}</h2>
          </div>
          <span class="cat-count" data-cat-count="${ci}">0 / ${category.items.length}</span>
        </div>
        <div class="cat-items">${rows}</div>
      </section>`;
  }).join("");

  list.insertAdjacentHTML("beforeend", categoriesHtml);
  const rows = $$(".check-row", list);
  const sections = $$(".cat-section", list);
  const search = $("#checkSearch");
  const empty = document.createElement("div");
  empty.className = "check-empty";
  empty.hidden = true;
  empty.innerHTML = `<p>没有找到对应物品。换一个关键词，或清空筛选。</p><button type="button" class="btn btn-line btn-sm">清空筛选</button>`;
  list.after(empty);
  empty.querySelector("button").addEventListener("click", () => {
    query = "";
    if (search) search.value = "";
    setFilter("all");
  });

  function updateCategoryCounts() {
    CHECKLIST.forEach((category, ci) => {
      const items = category.items.map((_, ii) => itemId(ci, ii));
      const done = items.filter((id) => state[id]).length;
      const label = $(`[data-cat-count="${ci}"]`, list);
      if (label) label.textContent = `${done} / ${items.length}`;
    });
  }

  function updateProgress() {
    const done = doneCount();
    const ratio = total ? done / total : 0;
    ringFill.style.strokeDashoffset = String(MICRO * (1 - ratio));
    ring.setAttribute("aria-label", `已完成 ${done} / ${total} 项`);
    ringDone.textContent = String(done);
    mobileDone.textContent = String(done);
    mobileBar.style.transform = `scaleX(${ratio})`;

    if (done === 0) {
      progressTitle.textContent = "一件件确认。";
      progressCopy.textContent = "分成六组，一件件确认。没勾完也没关系，必带项单独标出来，可以最后核对。";
    } else if (done >= total) {
      progressTitle.textContent = "都带齐了。";
      progressCopy.textContent = "清单上的每一项都有了着落。出发前再把证件单独核对一遍。";
    } else {
      const missingRequired = required.filter((item) => !state[item.id]).length;
      const missingOptional = optional.filter((item) => !state[item.id]).length;
      progressTitle.textContent = `还剩 ${total - done} 项。`;
      progressCopy.textContent = `必带还剩 ${missingRequired} 项，可选还剩 ${missingOptional} 项。勾选会自动保存在本机。`;
    }

    updateCategoryCounts();
    updateFilterCounts();
  }

  function updateFilterCounts() {
    const done = doneCount();
    const counts = {
      all: total,
      required: required.length,
      optional: optional.length,
      unchecked: total - done
    };
    $$("[data-filter-count]", filtersEl).forEach((node) => {
      const key = node.dataset.filterCount;
      node.textContent = String(counts[key] ?? "");
    });
  }

  function applyVisibility() {
    rows.forEach((row) => {
      const isOptional = row.dataset.optional === "true";
      const isChecked = row.getAttribute("aria-checked") === "true";
      const byFilter =
        filter === "all" ||
        (filter === "required" && !isOptional) ||
        (filter === "optional" && isOptional) ||
        (filter === "unchecked" && !isChecked);
      const byQuery = !query || normalize(row.textContent).includes(query);
      row.hidden = !byFilter || !byQuery;
    });
    sections.forEach((section) => {
      section.hidden = !section.querySelector(".check-row:not([hidden])");
    });
    empty.hidden = rows.some((row) => !row.hidden);
  }

  function syncRows() {
    rows.forEach((row) => row.setAttribute("aria-checked", state[row.dataset.id] ? "true" : "false"));
    updateProgress();
  }

  function setFilter(next) {
    filter = next;
    $$("[data-filter]", filtersEl).forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    applyVisibility();
  }

  filtersEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    setFilter(button.dataset.filter);
  });

  if (search) {
    search.addEventListener("input", () => {
      query = normalize(search.value);
      applyVisibility();
    });
  }

  jumpEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-jump]");
    if (!button) return;
    setFilter("all");
    const section = $(`#cat-c${button.dataset.jump}`, list);
    if (section) {
      section.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    }
  });

  list.addEventListener("click", (event) => {
    const row = event.target.closest(".check-row");
    if (!row) return;
    const id = row.dataset.id;
    state[id] = !state[id];
    setChecklistState(state);
    row.setAttribute("aria-checked", String(Boolean(state[id])));
    updateProgress();
    applyVisibility();
  });

  function missingText() {
    const done = doneCount();
    const groups = CHECKLIST.map((category, ci) => {
      const missing = category.items
        .map((item, ii) => ({ ...item, id: itemId(ci, ii) }))
        .filter((item) => !state[item.id])
        .map((item) => `· ${item.name}${item.optional ? "（可选）" : ""}`);
      if (!missing.length) return "";
      return `${stripEmoji(category.cat)}\n${missing.join("\n")}`;
    }).filter(Boolean);
    const body = groups.length ? groups.join("\n\n") : "全部已勾选。";
    return `合肥理工学院报到清单 · 未带 ${total - done}/${total}\n\n${body}\n\n${location.origin}${location.pathname.replace(/[^/]*$/, "checklist.html")}`;
  }

  function copyMissing() {
    const text = missingText();
    const done = () => showToast("未带清单已复制");
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    try {
      document.execCommand("copy");
      done();
    } catch {
      showToast("复制失败，请手动截图。");
    }
    area.remove();
  }

  async function shareMissing() {
    const text = missingText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "报到清单剩余", text });
        return;
      } catch {
        return;
      }
    }
    copyMissing();
  }

  $("#copyMissingBtn")?.addEventListener("click", copyMissing);
  $("#shareMissingBtn")?.addEventListener("click", shareMissing);
  $("#printCurrentBtn")?.addEventListener("click", () => {
    document.documentElement.classList.add("print-current");
    window.print();
  });
  window.addEventListener("afterprint", () => document.documentElement.classList.remove("print-current"));

  window.HFITChecklist = { copyMissing, shareMissing, setFilter: (next) => setFilter(next) };

  function resetList() {
    const done = doneCount();
    if (!done) {
      showToast("还没有勾选任何项目。");
      return;
    }
    const snapshot = { ...state };
    state = {};
    setChecklistState(state);
    syncRows();
    showToast("已清空全部勾选。", {
      action: "撤销",
      onAction() {
        state = snapshot;
        setChecklistState(state);
        syncRows();
      }
    });
  }

  $("#resetBtn").addEventListener("click", resetList);
  $("#mobileReset").addEventListener("click", resetList);
  $("#printBtn").addEventListener("click", () => window.print());

  try {
    const probe = "__hfit_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
  } catch {
    const note = $(".save-note");
    if (note) note.textContent = "本机存储不可用 · 仅本次有效";
  }

  function handleHash() {
    const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!hash) return;
    query = "";
    if (search) search.value = "";
    setFilter("all");
    if (hash.startsWith("check-")) {
      const row = document.getElementById(hash);
      if (!row) return;
      row.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
      row.classList.add("is-target");
      row.focus({ preventScroll: true });
      window.setTimeout(() => row.classList.remove("is-target"), 2200);
    } else if (hash.startsWith("cat-c")) {
      document.getElementById(hash)?.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "start"
      });
    }
  }

  window.addEventListener("hashchange", handleHash);
  syncRows();
  setFilter("all");
  window.setTimeout(handleHash, 80);
})();
