(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const STORE_KEY = "hfit-field-guide-checklist-v1";

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function stripEmoji(value) {
    return String(value).replace(/^[^\p{L}\p{N}]+/u, "").trim();
  }

  function itemId(catIndex, itemIndex) {
    return `c${catIndex}i${itemIndex}`;
  }

  function getChecklistState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function setChecklistState(state) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      /* localStorage can be unavailable in private mode; the UI still works for this visit. */
    }
  }

  function spring(options) {
    const settings = {
      from: 0,
      to: 0,
      velocity: 0,
      stiffness: 220,
      damping: 28,
      mass: 1,
      precision: 0.05,
      velocityThreshold: 0.08,
      onUpdate: null,
      onComplete: null,
      ...options
    };

    let value = settings.from;
    let velocity = settings.velocity;
    let target = settings.to;
    let frame = null;
    let previousTime = 0;

    function finish() {
      value = target;
      velocity = 0;
      if (settings.onUpdate) settings.onUpdate(value, 0);
      if (settings.onComplete) settings.onComplete(value);
    }

    function step(time) {
      if (!previousTime) previousTime = time;
      const dt = Math.min((time - previousTime) / 1000, 1 / 30);
      previousTime = time;

      const force = -settings.stiffness * (value - target) - settings.damping * velocity;
      velocity += (force / settings.mass) * dt;
      value += velocity * dt;

      if (settings.onUpdate) settings.onUpdate(value, velocity);

      if (Math.abs(velocity) < settings.velocityThreshold && Math.abs(value - target) < settings.precision) {
        frame = null;
        finish();
        return;
      }
      frame = requestAnimationFrame(step);
    }

    function start() {
      if (reduceMotion.matches) {
        cancel();
        finish();
        return;
      }
      cancel();
      previousTime = 0;
      frame = requestAnimationFrame(step);
    }

    function cancel() {
      if (frame) cancelAnimationFrame(frame);
      frame = null;
    }

    return {
      start,
      cancel,
      retarget(nextTarget, nextVelocity) {
        target = nextTarget;
        if (typeof nextVelocity === "number") velocity = nextVelocity;
        start();
      },
      get value() {
        return value;
      },
      get velocity() {
        return velocity;
      }
    };
  }

  function trapFocus(container) {
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function onKeyDown(event) {
      if (event.key !== "Tab") return;
      if (document.querySelector("dialog[open]")) return;
      const candidates = $$(selector, container).filter(
        (element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden"
      );
      if (!candidates.length) return;
      const first = candidates[0];
      const last = candidates[candidates.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }

  let inerted = [];

  function inertBackground(except) {
    const candidates = $$("main, .site-head, .site-foot, .mobile-bar");
    inerted = candidates.map((element) => ({ element, wasInert: element.inert }));
    candidates.forEach((element) => {
      if (element !== except) element.inert = true;
    });
    document.body.classList.add("sheet-open");
  }

  function restoreBackground() {
    inerted.forEach(({ element, wasInert }) => {
      element.inert = wasInert;
    });
    inerted = [];
    document.body.classList.remove("sheet-open");
  }

  /* ---------- toast ---------- */

  let toastElement = null;
  let toastTimer = null;
  let toastAction = null;

  function buildToast() {
    if (toastElement) return toastElement;
    toastElement = document.createElement("div");
    toastElement.className = "toast";
    toastElement.setAttribute("role", "status");
    toastElement.setAttribute("aria-live", "polite");
    toastElement.innerHTML = '<span class="toast-message"></span><button type="button" class="toast-action" hidden></button>';
    document.body.append(toastElement);
    return toastElement;
  }

  function showToast(message, options = {}) {
    const element = buildToast();
    const duration = options.duration || 4200;
    element.querySelector(".toast-message").textContent = message;
    const actionButton = element.querySelector(".toast-action");
    if (options.action) {
      actionButton.hidden = false;
      actionButton.textContent = options.action;
      toastAction = typeof options.onAction === "function" ? options.onAction : null;
      actionButton.onclick = () => {
        if (toastAction) toastAction();
        hideToast();
      };
    } else {
      actionButton.hidden = true;
      actionButton.onclick = null;
      toastAction = null;
    }
    element.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, duration);
  }

  function hideToast() {
    if (!toastElement) return;
    clearTimeout(toastTimer);
    toastElement.classList.remove("is-visible");
    toastAction = null;
  }

  /* ---------- sheet ---------- */

  function createSheet() {
    const shell = document.createElement("div");
    shell.className = "sheet-shell";
    shell.id = "site-sheet";
    shell.innerHTML = `
      <div class="sheet-scrim" data-sheet-close></div>
      <section class="sheet-panel" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div class="sheet-handle" data-sheet-handle aria-hidden="true"></div>
        <div class="sheet-head">
          <div>
            <p class="kicker" id="sheet-kicker">FIELD NOTE</p>
            <h2 id="sheet-title">现场笔记</h2>
          </div>
          <button class="sheet-close" type="button" data-sheet-close aria-label="关闭">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>
          </button>
        </div>
        <div class="sheet-body" id="sheet-body"></div>
      </section>`;
    document.body.append(shell);

    const panel = shell.querySelector(".sheet-panel");
    const scrim = shell.querySelector(".sheet-scrim");
    const handle = shell.querySelector("[data-sheet-handle]");
    const closeButton = shell.querySelector(".sheet-close");
    const body = shell.querySelector(".sheet-body");

    let open = false;
    let offset = 0;
    let height = 0;
    let animation = null;
    let releaseFocus = null;
    let previousFocus = null;
    let dragging = false;
    let dragStart = 0;
    let startOffset = 0;
    let samples = [];
    let escapeHandler = null;
    let closeTimer = null;

    function setOffset(next, opacityScale = 1) {
      offset = next;
      const progress = clamp(1 - next / Math.max(height, 1), 0, 1);
      panel.style.transform = `translateY(${next}px)`;
      scrim.style.opacity = String(clamp(progress * opacityScale, 0, 1));
    }

    function finishClose() {
      if (!open) return;
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      if (animation) {
        animation.cancel();
        animation = null;
      }
      shell.classList.remove("is-open");
      open = false;
      panel.style.transform = "";
      scrim.style.opacity = "";
      document.body.classList.remove("sheet-open");
      restoreBackground();
      if (releaseFocus) releaseFocus();
      releaseFocus = null;
      if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
      previousFocus = null;
      if (escapeHandler) document.removeEventListener("keydown", escapeHandler);
      escapeHandler = null;
    }

    function close(velocity = 0) {
      if (!open) return;
      if (animation) animation.cancel();
      height = panel.offsetHeight;
      height = Math.max(height, 1);
      const current = spring({
        from: offset,
        to: height + 40,
        velocity: Math.max(velocity, 0),
        stiffness: 210,
        damping: 26,
        onUpdate(value) {
          setOffset(clamp(value, 0, height + 80), 1);
        },
        onComplete: finishClose
      });
      animation = current;
      current.start();
      clearTimeout(closeTimer);
      // The panel is fully offscreen well before the spring's 0.05px tail; release focus and inert then.
      closeTimer = window.setTimeout(() => {
        if (!open || animation !== current) return;
        finishClose();
      }, 560);
    }

    function openSheet({ kicker = "FIELD NOTE", title, html }) {
      if (open) {
        body.innerHTML = html;
        shell.querySelector("#sheet-title").textContent = title;
        shell.querySelector("#sheet-kicker").textContent = kicker;
        return;
      }
      open = true;
      previousFocus = document.activeElement;
      shell.querySelector("#sheet-title").textContent = title;
      shell.querySelector("#sheet-kicker").textContent = kicker;
      body.innerHTML = html;
      shell.classList.add("is-open");
      inertBackground(shell);
      document.body.classList.add("sheet-open");
      releaseFocus = trapFocus(shell);
      escapeHandler = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        }
      };
      document.addEventListener("keydown", escapeHandler);

      height = panel.offsetHeight;
      height = Math.max(height, 1);
      setOffset(height);
      if (animation) animation.cancel();
      requestAnimationFrame(() => {
        height = panel.offsetHeight;
        animation = spring({
          from: height,
          to: 0,
          stiffness: 235,
          damping: 27,
          onUpdate(value) {
            setOffset(clamp(value, 0, height + 80), 1);
          }
        });
        animation.start();
        closeButton.focus({ preventScroll: true });
      });
    }

    shell.querySelectorAll("[data-sheet-close]").forEach((element) => {
      element.addEventListener("click", () => close());
    });

    handle.addEventListener("pointerdown", (event) => {
      if (!open) return;
      if (animation) animation.cancel();
      dragging = true;
      dragStart = event.clientY;
      startOffset = offset;
      samples = [{ y: event.clientY, t: performance.now() }];
      handle.setPointerCapture(event.pointerId);
      panel.style.willChange = "transform";
      event.preventDefault();
    });

    handle.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const dy = event.clientY - dragStart;
      let next = startOffset + dy;
      if (next < 0) next = next * 0.22;
      setOffset(clamp(next, -20, height + 80), 1);
      samples.push({ y: event.clientY, t: performance.now() });
      if (samples.length > 6) samples.shift();
    });

    function endDrag(event) {
      if (!dragging) return;
      dragging = false;
      panel.style.willChange = "";
      const now = performance.now();
      const recent = samples.filter((sample) => now - sample.t < 140);
      let velocity = 0;
      if (recent.length > 1) {
        const first = recent[0];
        const last = recent[recent.length - 1];
        velocity = ((last.y - first.y) / Math.max(last.t - first.t, 1)) * 1000;
      }
      if (offset > height * 0.28 || velocity > 650) {
        close(velocity);
        return;
      }
      animation = spring({
        from: offset,
        to: 0,
        velocity,
        stiffness: 260,
        damping: 30,
        onUpdate(value) {
          setOffset(clamp(value, 0, height + 80), 1);
        }
      });
      animation.start();
    }

    handle.addEventListener("pointerup", endDrag);
    handle.addEventListener("pointercancel", endDrag);

    window.addEventListener("resize", () => {
      if (!open || offset > 0.5) return;
      height = panel.offsetHeight;
      setOffset(0);
    });

    return {
      open: openSheet,
      close,
      get isOpen() {
        return open;
      }
    };
  }

  /* ---------- menu ---------- */

  function initMenu() {
    const menu = $("#site-menu");
    if (!menu) return;
    const openButtons = $$("[data-menu-open]");
    const closeButtons = $$("[data-menu-close]");
    const menuPanel = $(".menu", menu) || menu;
    let releaseFocus = null;
    let previousFocus = null;
    let isOpen = false;

    function open() {
      if (isOpen) return;
      menu.classList.remove("is-leaving");
      isOpen = true;
      previousFocus = document.activeElement;
      openButtons.forEach((button) => button.setAttribute("aria-expanded", "true"));
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
      inertBackground(menu);
      releaseFocus = trapFocus(menu);
      const firstLink = menu.querySelector("a[href]");
      window.setTimeout(() => {
        if (isOpen && firstLink) firstLink.focus({ preventScroll: true });
      }, 180);
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      openButtons.forEach((button) => button.setAttribute("aria-expanded", "false"));
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
      restoreBackground();
      if (releaseFocus) releaseFocus();
      releaseFocus = null;
      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus({ preventScroll: true });
      }
      previousFocus = null;
    }

    openButtons.forEach((button) => button.addEventListener("click", open));
    closeButtons.forEach((button) => button.addEventListener("click", close));
    menu.querySelectorAll("a[href]").forEach((link) => {
      link.addEventListener("click", () => {
        if (!isOpen) return;
        menu.classList.add("is-leaving");
        close();
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        close();
      }
    });
    if (!menu.hasAttribute("aria-hidden")) menu.setAttribute("aria-hidden", "true");
  }

  /* ---------- header / reveal / enter ---------- */

  function initChrome() {
    const header = $(".site-head");
    if (header) {
      const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    const hero = $(".home-hero");
    if (hero) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => hero.classList.add("is-ready"));
      });
    }

    const revealItems = $$("[data-reveal]");
    if (!revealItems.length) return;
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.08 }
    );
    revealItems.forEach((item) => observer.observe(item));
  }

  function animateHeight(element, to, options = {}) {
    const start = element.getBoundingClientRect().height;
    const target = to === "auto" ? element.scrollHeight : to;
    if (reduceMotion.matches) {
      element.style.height = target === 0 ? "0px" : "auto";
      if (options.onComplete) options.onComplete();
      return null;
    }
    element.style.height = `${start}px`;
    element.style.overflow = "hidden";
    const animation = spring({
      from: start,
      to: target,
      stiffness: 250,
      damping: 30,
      onUpdate(value) {
        element.style.height = `${Math.max(0, value)}px`;
      },
      onComplete() {
        element.style.height = target === 0 ? "0px" : "auto";
        element.style.overflow = "";
        if (options.onComplete) options.onComplete();
      }
    });
    animation.start();
    return animation;
  }

  const sheet = createSheet();

  window.HFIT = {
    $,
    $$,
    clamp,
    escapeHtml,
    stripEmoji,
    itemId,
    spring,
    showToast,
    hideToast,
    sheet,
    animateHeight,
    getChecklistState,
    setChecklistState,
    STORE_KEY,
    reduceMotion,
    isFinePointer
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChrome);
  } else {
    initChrome();
  }

  initMenu();
})();
