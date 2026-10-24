(function () {
  "use strict";

  const layoutList = document.getElementById("layoutList");
  const murmurList = document.getElementById("murmurList");
  const viewer = document.getElementById("livingViewer");
  const viewerImage = document.getElementById("livingViewerImage");
  if (!layoutList && !murmurList) return;

  const esc = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  if (layoutList) layoutList.innerHTML = LAYOUTS.map((layout, index) => {
    const images = layout.images || [];
    const thumbs = images
      .map(
        (image, imageIndex) => `
          <button class="layout-thumb${imageIndex === 0 ? " is-active" : ""}" type="button"
            data-thumb="${imageIndex}" aria-pressed="${imageIndex === 0}"
            aria-label="查看第 ${imageIndex + 1} 张照片">
            <img src="${esc(image.src)}" alt="" loading="lazy">
          </button>`
      )
      .join("");
    return `
      <article class="layout-card" data-reveal style="--delay:${index * 80}ms">
        <div class="layout-media">
          <button class="layout-photo" type="button" data-open-viewer aria-label="查看 ${esc(layout.author)} 的布置原图">
            <img src="${esc(images[0]?.src || "")}" alt="${esc(images[0]?.alt || "")}" loading="lazy">
          </button>
          <div class="layout-thumbs" role="group" aria-label="切换 ${esc(layout.author)} 的布置照片">${thumbs}</div>
          <span class="layout-count" aria-live="polite"><b>1</b> / ${images.length}</span>
        </div>
        <div class="layout-copy">
          <p class="layout-kicker">Layout 0${index + 1} · ${esc(layout.meta)}</p>
          <h3>${esc(layout.author)}</h3>
          <p class="layout-tag">${esc(layout.tag)}</p>
          <p class="layout-text">${esc(layout.text)}</p>
          <p class="layout-source">原站「宿舍布置参考」· 作者署名保留</p>
        </div>
      </article>`;
  }).join("");

  if (murmurList) murmurList.innerHTML = MURMUR.map(
    (item, index) => `
      <article class="murmur-item" data-reveal style="--delay:${index * 60}ms">
        <span class="murmur-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
        <div class="murmur-copy">
          <span class="murmur-tag">#${esc(item.tag)}</span>
          <p class="murmur-text">${esc(item.text)}</p>
          <p class="murmur-source">${esc(item.source)}</p>
        </div>
      </article>`
  ).join("");

  document.querySelectorAll(".layout-card").forEach((card) => {
    const mainButton = card.querySelector(".layout-photo");
    const mainImage = mainButton?.querySelector("img");
    const count = card.querySelector(".layout-count b");
    const thumbs = [...card.querySelectorAll(".layout-thumb")];
    if (!mainButton || !mainImage) return;

    const layout = LAYOUTS[[...layoutList.children].indexOf(card)];
    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const index = Number(thumb.dataset.thumb);
        const image = layout.images[index];
        if (!image) return;
        mainImage.classList.add("is-swapping");
        window.setTimeout(() => {
          mainImage.src = image.src;
          mainImage.alt = image.alt;
          if (count) count.textContent = String(index + 1);
          thumbs.forEach((button) => {
            const active = button === thumb;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
          });
          mainImage.classList.remove("is-swapping");
        }, 140);
      });
    });

    mainButton.addEventListener("click", () => {
      if (!viewer || !viewerImage) return;
      viewerImage.src = mainImage.src;
      viewerImage.alt = mainImage.alt;
      viewer.showModal();
      viewer.querySelector("[data-viewer-close]")?.focus({ preventScroll: true });
    });
  });

  if (viewer) {
    viewer.querySelector("[data-viewer-close]")?.addEventListener("click", () => viewer.close());
    viewer.addEventListener("cancel", (event) => {
      event.preventDefault();
      viewer.close();
    });
    viewer.addEventListener("click", (event) => {
      if (event.target === viewer) viewer.close();
    });
  }
})();
