(function () {
  "use strict";

  if (window.HFITFeedback) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const meta = $('meta[name="hfit-api"]');
  const API_BASE = (meta ? meta.getAttribute("content") || "" : "/api").trim().replace(/\/+$/, "") || "/api";
  const esc = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  function toast(message) {
    if (window.HFIT && typeof window.HFIT.showToast === "function") {
      window.HFIT.showToast(message);
    }
  }

  function readStore(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeStore(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Private mode can reject writes; the page still works for this visit. */
    }
  }

  function likeKey(page, item) {
    if (!item) return page === "portal" ? "liked_portal" : `hfit-liked-${page}`;
    if (page === "faq") return `liked_faq_${item}`;
    return `hfit-liked-${page}-${item}`;
  }

  async function request(path, options) {
    const response = await fetch(`${API_BASE}${path}`, options);
    let data = null;
    try {
      data = await response.json();
    } catch {
      /* Non-JSON failures fall through to the status check below. */
    }
    if (!response.ok) {
      const error = new Error((data && data.error) || "服务暂时不可用");
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function setCount(button, count) {
    const label = $("[data-like-count]", button);
    if (label) label.textContent = count === null ? "—" : String(Math.max(0, count));
    const text = button.dataset.likeLabel || "有用";
    if (count !== null) button.setAttribute("aria-label", `${text}，${Math.max(0, count)} 人觉得有用`);
  }

  function paintLiked(button, liked) {
    button.setAttribute("aria-pressed", String(liked));
  }

  async function toggleLike(button) {
    if (button.dataset.busy === "1") return;
    const page = button.dataset.likePage;
    const item = button.dataset.likeItem || null;
    const wasLiked = button.getAttribute("aria-pressed") === "true";
    const nextLiked = !wasLiked;
    const label = $("[data-like-count]", button);
    const parsed = label ? Number(label.textContent) : Number.NaN;
    const shown = Number.isFinite(parsed) ? parsed : null;

    button.dataset.busy = "1";
    button.dataset.touched = "1";
    button.setAttribute("aria-busy", "true");
    paintLiked(button, nextLiked);
    writeStore(likeKey(page, item), nextLiked ? "1" : "0");
    if (shown !== null) setCount(button, shown + (nextLiked ? 1 : -1));

    try {
      const data = await request("/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, item: item || undefined, delta: nextLiked ? 1 : -1 })
      });
      setCount(button, data && Number.isFinite(data.count) ? data.count : shown);
    } catch (error) {
      paintLiked(button, wasLiked);
      writeStore(likeKey(page, item), wasLiked ? "1" : "0");
      setCount(button, shown);
      toast(error.status === 429 ? "点得太频繁，过一会儿再试。" : "暂时没连上，稍后再试。");
    } finally {
      button.dataset.busy = "0";
      button.removeAttribute("aria-busy");
    }
  }

  const wiredLikes = new WeakSet();

  function mountLikes() {
    const buttons = $$("[data-like-page]").filter((button) => !wiredLikes.has(button));
    if (!buttons.length) return;

    buttons.forEach((button) => {
      wiredLikes.add(button);
      if (readStore(likeKey(button.dataset.likePage, button.dataset.likeItem || null)) === "1") {
        paintLiked(button, true);
      }
      button.addEventListener("click", () => toggleLike(button));
    });

    const byPage = new Map();
    buttons.forEach((button) => {
      const page = button.dataset.likePage;
      if (!byPage.has(page)) byPage.set(page, { items: [], pages: [] });
      if (button.dataset.likeItem) byPage.get(page).items.push(button);
      else byPage.get(page).pages.push(button);
    });

    byPage.forEach((group, page) => {
      if (group.items.length) {
        const ids = [...new Set(group.items.map((button) => button.dataset.likeItem))];
        request(`/likes?page=${encodeURIComponent(page)}&ids=${encodeURIComponent(ids.join(","))}`)
          .then((counts) => {
            group.items.forEach((button) => {
              if (button.dataset.touched === "1") return;
              const count = counts ? Number(counts[button.dataset.likeItem]) : 0;
              setCount(button, Number.isFinite(count) ? count : 0);
            });
          })
          .catch(() => {
            group.items.forEach((button) => {
              if (button.dataset.touched !== "1") setCount(button, null);
            });
          });
      }
      group.pages.forEach((button) => {
        request(`/likes?page=${encodeURIComponent(page)}`)
          .then((data) => {
            if (button.dataset.touched === "1") return;
            const count = data && Number(data.count);
            setCount(button, Number.isFinite(count) ? count : 0);
          })
          .catch(() => {
            if (button.dataset.touched !== "1") setCount(button, null);
          });
      });
    });
  }

  function formatTime(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function renderSent(block, record) {
    if (!block || !record) return;
    block.hidden = false;
    block.innerHTML = `
      <span class="feedback-sent-label">已发出 / Sent</span>
      <p>${esc(record.text)}</p>
      <span class="feedback-sent-meta">${esc(formatTime(record.time))} · 只发给编者，不公开展示</span>`;
  }

  function readSent(page) {
    try {
      const raw = readStore(`hfit-sent-${page}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setStatus(element, message, tone) {
    if (!element) return;
    element.textContent = message;
    if (tone) element.dataset.tone = tone;
    else delete element.dataset.tone;
  }

  function setBusy(button, busy) {
    if (!button) return;
    if (busy) {
      button.dataset.label = button.textContent;
      button.disabled = true;
      button.textContent = "发送中…";
    } else {
      button.disabled = false;
      if (button.dataset.label) button.textContent = button.dataset.label;
    }
  }

  function mountForms() {
    $$("[data-feedback-form]").forEach((form) => {
      const page = form.dataset.page;
      const status = $("[data-feedback-status]", form);
      const submit = $('button[type="submit"]', form);
      const textarea = $('textarea[name="text"]', form);
      const nickname = $('input[name="nickname"]', form);
      const section = form.closest(".feedback");
      const sent = section ? $("[data-feedback-sent]", section) : null;

      renderSent(sent, readSent(page));

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const text = textarea ? textarea.value.trim() : "";
        const name = nickname ? nickname.value.trim().slice(0, 12) : "";

        if (!text) {
          setStatus(status, "写点什么再发。", "error");
          if (textarea) textarea.focus();
          return;
        }
        if (/https?:\/\/|www\./i.test(text)) {
          setStatus(status, "内容里不要带链接，原站接口会拦截。", "error");
          if (textarea) textarea.focus();
          return;
        }

        setBusy(submit, true);
        setStatus(status, "正在发送…", "pending");
        try {
          await request("/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page, nickname: name || "匿名", text })
          });
          const record = { text, time: new Date().toISOString() };
          writeStore(`hfit-sent-${page}`, JSON.stringify(record));
          renderSent(sent, record);
          form.reset();
          setStatus(status, "已收到，只发给编者。", "ok");
          toast("已发给编者");
          if (textarea) textarea.focus();
        } catch (error) {
          const message =
            error.status === 429
              ? "发送太频繁，过一会儿再试。"
              : error.status === 400 && error.message
                ? error.message
                : "暂时没连上，稍后再试。";
          setStatus(status, message, "error");
        } finally {
          setBusy(submit, false);
        }
      });
    });
  }

  function start() {
    mountLikes();
    mountForms();
    requestAnimationFrame(() => mountLikes());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  window.HFITFeedback = { apiBase: API_BASE };
})();
