(function () {
  "use strict";

  const viewer = document.getElementById("rewardViewer");
  const image = document.getElementById("rewardViewerImage");
  const caption = document.getElementById("rewardViewerCaption");
  if (!viewer || !image || !caption) return;

  const closeButton = viewer.querySelector("[data-reward-close]");

  document.querySelectorAll("[data-reward-src]").forEach((button) => {
    button.addEventListener("click", () => {
      const src = button.dataset.rewardSrc;
      if (!src) return;
      image.src = src;
      image.alt = button.dataset.rewardLabel || "收款码";
      caption.textContent = `${button.dataset.rewardLabel || "收款码"} · 长按或截图后扫码`;
      if (typeof viewer.showModal === "function") {
        viewer.showModal();
        closeButton?.focus({ preventScroll: true });
      }
    });
  });

  closeButton?.addEventListener("click", () => viewer.close());

  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) viewer.close();
  });

  viewer.addEventListener("close", () => {
    image.removeAttribute("src");
    image.alt = "";
    caption.textContent = "";
  });
})();
