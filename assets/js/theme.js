(function () {
  "use strict";

  const KEY = "hfit-theme";
  const root = document.documentElement;
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  const valid = (value) => value === "paper" || value === "night";

  let stored = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch {
    /* Private mode still gets a usable theme for this visit. */
  }

  let explicit = valid(stored);
  const initial = explicit ? stored : system.matches ? "night" : "paper";

  function syncRoot(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme === "night" ? "dark" : "light";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "night" ? "#161510" : "#f3efe6");
  }

  function syncControls() {
    const theme = root.dataset.theme;
    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme));
    });
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", String(theme === "night"));
    });
  }

  function set(theme, persist) {
    if (!valid(theme)) return;
    syncRoot(theme);
    if (persist) {
      explicit = true;
      try {
        localStorage.setItem(KEY, theme);
      } catch {
        /* A stored preference is a convenience, not a requirement. */
      }
    }
    syncControls();
    document.dispatchEvent(new CustomEvent("hfit:themechange", { detail: { theme } }));
  }

  function toggle() {
    set(root.dataset.theme === "night" ? "paper" : "night", true);
  }

  system.addEventListener?.("change", (event) => {
    if (!explicit) set(event.matches ? "night" : "paper", false);
  });

  function mountToggle() {
    const right = document.querySelector(".head-right");
    if (right && !right.querySelector("[data-theme-toggle]")) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "theme-btn";
      button.dataset.themeToggle = "";
      button.setAttribute("aria-label", "夜间模式");
      button.innerHTML =
        '<svg class="theme-icon moon" viewBox="0 0 20 20" aria-hidden="true"><path d="M14.8 12.7A6.2 6.2 0 0 1 7.3 5.2 6.8 6.8 0 1 0 14.8 12.7Z" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>' +
        '<svg class="theme-icon sun" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3.2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4" stroke="currentColor" stroke-width="1.2"/></svg>';
      button.addEventListener("click", toggle);
      right.prepend(button);
    }

    syncControls();
  }

  document.addEventListener("click", (event) => {
    const choice = event.target.closest("[data-theme-choice]");
    if (choice) set(choice.dataset.themeChoice, true);
  });

  syncRoot(initial);
  window.HFITTheme = {
    set: (theme) => set(theme, true),
    toggle,
    current: () => root.dataset.theme
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountToggle);
  } else {
    mountToggle();
  }
})();
