(function () {
  "use strict";

  if (window.HFITSearch) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  const strip = (value) =>
    String(value || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
  const norm = (value) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFKC")
      .replace(/\s+/g, "");
  const today = new Date().toISOString().slice(0, 10);
  const dormCats = { desk: "书桌", bed: "床架", stairs: "楼梯", closet: "衣柜", space: "侧边空间" };

  let entries = null;
  let loading = null;
  let dialog = null;
  let input = null;
  let resultsEl = null;
  let countEl = null;
  let active = -1;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`无法加载 ${src}`));
      document.head.append(script);
    });
  }

  function ensureData() {
    if (entries) return Promise.resolve(entries);
    if (loading) return loading;
    const loads = [];
    if (typeof FAQ === "undefined") loads.push(loadScript("data/faq.js"));
    if (typeof LINK_SITES === "undefined") loads.push(loadScript("data/links.js"));
    if (typeof IMAGES === "undefined") loads.push(loadScript("data/dorm.js"));
    if (typeof HOTSPOTS === "undefined") loads.push(loadScript("data/hotspots.js"));
    if (typeof CHECKLIST === "undefined") loads.push(loadScript("data/checklist.js"));
    loading = Promise.all(loads)
      .then(buildIndex)
      .catch((error) => {
        if (window.HFIT?.showToast) window.HFIT.showToast("检索资料没有加载完整，请刷新后重试。");
        throw error;
      });
    return loading;
  }

  function buildIndex() {
    const list = [];
    const push = (group, title, body, href, meta) => {
      list.push({
        group,
        title,
        body: strip(body),
        href,
        meta: meta || "",
        text: norm([title, body, meta].join(" "))
      });
    };

    if (typeof FAQ !== "undefined") {
      FAQ.forEach((question, index) => {
        const id = question.id || `q${index + 1}`;
        push(
          "问答",
          question.q,
          question.a,
          `faq.html#${id}`,
          `Q.${String(index + 1).padStart(2, "0")} · ${(question.tags || []).join(" / ")}`
        );
      });
    }

    if (typeof LINK_SITES !== "undefined") {
      LINK_SITES.forEach((group, groupIndex) => {
        (group.items || [])
          .filter((item) => !(item.until && item.until < today))
          .forEach((item, itemIndex) => {
            const notes = (item.note || []).map(strip).join(" ");
            push(
              "软件与官网",
              item.name,
              [item.desc, group.cat, notes].join(" "),
              `software.html#l-${groupIndex}-${itemIndex}`,
              `${strip(group.cat)} · ${item.url ? "外部链接" : "站内条目"}`
            );
          });
      });
    }

    if (typeof IMAGES !== "undefined") {
      IMAGES.forEach((image) => {
        const notes = (typeof HOTSPOTS !== "undefined" ? HOTSPOTS[image.id] || [] : []).map((note) => note.title).join(" ");
        push(
          "宿舍图版",
          `${image.id} · ${image.label}`,
          [image.label, dormCats[image.cat] || image.cat, notes].join(" "),
          `dorm.html#${image.id}`,
          dormCats[image.cat] || "图版"
        );
      });
    }

    if (typeof IMAGES !== "undefined" && typeof HOTSPOTS !== "undefined") {
      IMAGES.forEach((image) => {
        (HOTSPOTS[image.id] || []).forEach((note, noteIndex) => {
          push(
            "宿舍批注",
            `${image.id} · ${note.title}`,
            note.text,
            `dorm.html#${image.id}-${noteIndex}`,
            `批注 ${String(noteIndex + 1).padStart(2, "0")} / ${String((HOTSPOTS[image.id] || []).length).padStart(2, "0")}`
          );
        });
      });
    }

    if (typeof CHECKLIST !== "undefined") {
      const idFor = window.HFIT?.itemId || ((ci, ii) => `c${ci}i${ii}`);
      CHECKLIST.forEach((category, categoryIndex) => {
        (category.items || []).forEach((item, itemIndex) => {
          push(
            "清单",
            item.name,
            [category.cat, item.note].join(" "),
            `checklist.html#check-${idFor(categoryIndex, itemIndex)}`,
            `${strip(category.cat)}${item.optional ? " · 可选" : " · 必带"}`
          );
        });
      });
    }

    push(
      "关于作者",
      "关于作者 · 月亮早睡困不醒",
      "个人介绍 爱好 找到我 作者 关于",
      "about.html",
      "About / 07"
    );
    push(
      "支持作者",
      "支持作者 · 请作者喝咖啡",
      "打赏 支付宝 微信 请喝咖啡 支持 服务器 完全自愿",
      "support.html",
      "Support / 09"
    );
    push(
      "更新日志",
      "更新日志 · Changelog",
      "v1.6 整站重新设计 新增功能 界面 日间 夜间 更早记录 历史 反馈 关于作者",
      "logs.html",
      "Changelog / 08"
    );

    entries = list;
    return list;
  }

  function scoreEntry(entry, tokens) {
    const title = norm(entry.title);
    let score = 0;
    for (const token of tokens) {
      if (!entry.text.includes(token)) return -1;
      score += 1;
      if (title.includes(token)) score += 4;
    }
    return score;
  }

  function snippet(entry, query) {
    const raw = entry.body || entry.meta || "";
    if (!query) return raw.slice(0, 86);
    const index = raw.toLowerCase().indexOf(query.toLowerCase());
    if (index < 0) return raw.slice(0, 86);
    const start = Math.max(0, index - 32);
    const text = raw.slice(start, start + 96);
    return `${start > 0 ? "…" : ""}${text}${start + 96 < raw.length ? "…" : ""}`;
  }

  function search(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      const picks = ["问答", "软件与官网", "宿舍图版", "清单"].flatMap((group) =>
        entries.filter((entry) => entry.group === group).slice(0, 2)
      );
      return picks.slice(0, 8);
    }
    const tokens = trimmed.split(/\s+/).map(norm).filter(Boolean);
    return entries
      .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
      .filter((item) => item.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40)
      .map((item) => item.entry);
  }

  function render() {
    if (!resultsEl || !input) return;
    const query = input.value;
    const found = search(query);
    const groups = ["问答", "软件与官网", "宿舍图版", "宿舍批注", "清单", "关于作者", "支持作者", "更新日志"];
    let html = "";
    let index = 0;
    let count = 0;
    groups.forEach((group) => {
      const rows = found.filter((entry) => entry.group === group);
      if (!rows.length) return;
      html += `<div class="is-group"><span>${esc(group)}</span><span>${rows.length}</span></div>`;
      rows.forEach((entry, rowIndex) => {
        const isActive = index === 0;
        html += `<div class="is-result${isActive ? " is-active" : ""}" role="option" aria-selected="${isActive}" data-href="${esc(entry.href)}" data-index="${index}">
          <a class="is-result-main" href="${esc(entry.href)}">
            <span class="is-type">${esc(group)}</span>
            <span class="is-result-copy"><b>${esc(entry.title)}</b><small>${esc(snippet(entry, query))}</small></span>
            <span class="is-result-meta">${esc(entry.meta)}</span>
          </a>
          <button class="is-copy-btn" type="button" data-copy="${esc(entry.href)}" aria-label="复制链接：${esc(entry.title)}">复制</button>
        </div>`;
        index += 1;
        count += 1;
      });
    });
    if (!count) {
      html = `<div class="is-empty"><b>${esc(query ? "没有找到" : "输入关键词")}</b><span>${esc(
        query ? "换一个更短的关键词，或试试“床垫”“南站”“打赏”。" : "可以搜问题、软件、宿舍批注、清单物品和打赏。"
      )}</span></div>`;
    }
    resultsEl.innerHTML = html;
    const countText = query ? `${count} 条结果` : "建议先看这几条";
    if (countEl) countEl.textContent = countText;
    active = count ? 0 : -1;
    input.setAttribute("aria-expanded", "true");
    input.setAttribute("aria-activedescendant", count ? "is-result-0" : "");
    const first = resultsEl.querySelector(".is-result");
    if (first) first.id = "is-result-0";
  }

  function setActive(next) {
    if (!resultsEl) return;
    const rows = [...resultsEl.querySelectorAll(".is-result")];
    if (!rows.length) return;
    active = (next + rows.length) % rows.length;
    rows.forEach((row, index) => {
      const isActive = index === active;
      row.classList.toggle("is-active", isActive);
      row.setAttribute("aria-selected", String(isActive));
      row.id = `is-result-${index}`;
      if (isActive) row.scrollIntoView({ block: "nearest" });
    });
    input.setAttribute("aria-activedescendant", `is-result-${active}`);
  }

  function open() {
    if (!dialog) return;
    if (document.querySelector(".entry-cover[open]")) return;
    if (!dialog.open) {
      if (dialog.showModal) dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    document.documentElement.classList.add("index-open");
    input.value = "";
    ensureData().then(() => {
      render();
      input.focus({ preventScroll: true });
    }).catch(() => {});
  }

  function close() {
    if (!dialog) return;
    if (dialog.open && dialog.close) dialog.close();
    else dialog.removeAttribute("open");
    document.documentElement.classList.remove("index-open");
  }

  function copyLink(href, button) {
    const absolute = new URL(href, location.href).href;
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
      navigator.clipboard.writeText(absolute).then(done).catch(() => fallbackCopy(absolute, done));
    } else {
      fallbackCopy(absolute, done);
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
      if (window.HFIT?.showToast) window.HFIT.showToast("复制失败，请手动复制地址栏。");
    }
    area.remove();
  }

  function buildUi() {
    const headRight = $(".head-right");
    if (headRight && !headRight.querySelector("[data-index-open]")) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "index-trigger";
      button.dataset.indexOpen = "";
      button.setAttribute("aria-label", "全站检索");
      button.innerHTML =
        '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M10.2 10.2L14 14" fill="none" stroke="currentColor" stroke-width="1.2"/></svg><span>检索</span><kbd>/</kbd>';
      button.addEventListener("click", open);
      headRight.insertBefore(button, headRight.querySelector("[data-theme-toggle]") || headRight.firstChild);
    }

    dialog = document.createElement("dialog");
    dialog.className = "index-search";
    dialog.id = "indexSearch";
    dialog.setAttribute("aria-labelledby", "indexSearchTitle");
    dialog.innerHTML = `<div class="index-search-panel">
      <header class="is-head">
        <div><span class="is-kicker">Index / 全站检索</span><h2 id="indexSearchTitle">查这本册子。</h2></div>
        <button class="is-close" type="button" data-index-close aria-label="关闭检索">关闭</button>
      </header>
      <label class="is-field">
        <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M10.2 10.2L14 14" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>
        <input id="indexSearchInput" type="search" placeholder="输入问题、软件、尺寸或清单物品…" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="indexResults" aria-autocomplete="list">
        <kbd>Esc</kbd>
      </label>
      <p class="is-hint" id="indexSearchHint">跨问答、软件、图版批注、清单、关于与日志检索。↑↓ 选择，Enter 打开，Esc 关闭。</p>
      <div class="is-results" id="indexResults" role="listbox" aria-label="检索结果"></div>
      <footer class="is-foot"><span id="indexResultCount">加载索引…</span><span>HFIT / Index</span></footer>
    </div>`;
    document.body.append(dialog);

    input = $("#indexSearchInput", dialog);
    resultsEl = $("#indexResults", dialog);
    countEl = $("#indexResultCount", dialog);

    input.addEventListener("input", () => {
      ensureData().then(render).catch(() => {});
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive(active + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive(active - 1);
      } else if (event.key === "Enter") {
        const current = resultsEl.querySelector(".is-result.is-active");
        if (current) {
          event.preventDefault();
          close();
          location.href = current.dataset.href;
        }
      }
    });
    resultsEl.addEventListener("click", (event) => {
      const copy = event.target.closest("[data-copy]");
      if (copy) {
        event.preventDefault();
        copyLink(copy.dataset.copy, copy);
        return;
      }
      const link = event.target.closest(".is-result-main");
      if (link) close();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });
    dialog.querySelector("[data-index-close]").addEventListener("click", close);
    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("index-open");
    });
    dialog.addEventListener("cancel", () => {
      document.documentElement.classList.remove("index-open");
    });
  }

  document.addEventListener("keydown", (event) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      open();
      return;
    }
    if (!typing && event.key === "/") {
      event.preventDefault();
      open();
    }
  });

  window.HFITSearch = { open, close, ready: ensureData };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildUi);
  } else {
    buildUi();
  }
})();
