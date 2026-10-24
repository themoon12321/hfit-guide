(function () {
  "use strict";

  if (typeof IMAGES === "undefined" || typeof HOTSPOTS === "undefined") return;

  const { $, $$, escapeHtml, clamp, reduceMotion, sheet } = window.HFIT;

  const DIMENSIONS = {
    D01: [1400, 1049],
    D02: [1400, 1050],
    D03: [1400, 1050],
    D07: [1050, 1400],
    D09: [1400, 1050],
    D10: [1050, 1400],
    B01: [1050, 1400],
    B02: [922, 1229],
    S01: [1050, 1400],
    S02: [1400, 1050],
    C01: [1050, 1400],
    C02: [1400, 1050],
    C03: [1050, 1400],
    C04: [1400, 1050],
    P01: [1050, 1400],
    P02: [1050, 1400]
  };

  const CATEGORIES = {
    desk: "书桌",
    bed: "床架",
    stairs: "楼梯",
    closet: "衣柜",
    space: "侧边空间"
  };

  const stage = $("#stage");
  const canvas = $("#plateCanvas");
  const front = $("#layerA");
  const back = $("#layerB");
  const filters = $("#plateFilters");
  const plateList = $("#plateList");
  const inspector = $("#inspector");
  const ledgerList = $("#ledgerList");
  const viewer = $("#imageViewer");
  const viewerImage = $("#viewerImage");
  const mobileQuery = window.matchMedia("(max-width: 1240px)");

  let filter = "all";
  let current = null;
  let noteIndex = -1;
  let imageToken = 0;

  const pad = (value) => String(value).padStart(2, "0");
  const plateSrc = (id) => `assets/img/plates/${id}.webp`;
  const thumbSrc = (id) => `assets/img/thumbs/${id}.webp`;
  const notesFor = (id) => HOTSPOTS[id] || [];
  const currentImage = () => IMAGES.find((image) => image.id === current);

  function visibleImages() {
    return filter === "all" ? IMAGES : IMAGES.filter((image) => image.cat === filter);
  }

  function counts(category) {
    return category === "all"
      ? IMAGES.length
      : IMAGES.filter((image) => image.cat === category).length;
  }

  function renderFilters() {
    const options = [["all", "全部"], ...Object.entries(CATEGORIES)];
    filters.innerHTML = options
      .map(
        ([key, label]) => `
        <button class="chip${key === filter ? " is-active" : ""}" type="button" data-filter="${key}" aria-pressed="${key === filter}">
          ${label}<span class="count">${counts(key)}</span>
        </button>`
      )
      .join("");
  }

  function renderPlateList() {
    plateList.innerHTML = visibleImages()
      .map((image) => {
        const index = IMAGES.indexOf(image) + 1;
        const active = image.id === current;
        return `
          <button class="plate-item" type="button" data-id="${image.id}" aria-current="${active}" aria-label="查看 ${image.id} ${escapeHtml(image.label)}">
            <span class="id">${pad(index)}</span>
            <span class="thumb"><img src="${thumbSrc(image.id)}" width="160" height="120" alt="" loading="lazy"></span>
            <span class="name">${escapeHtml(image.label)}</span>
          </button>`;
      })
      .join("");
  }

  function renderHotspots() {
    $$(".hotspot", canvas).forEach((node) => node.remove());
    const notes = notesFor(current);
    notes.forEach((note, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "hotspot";
      button.style.left = `${note.x}%`;
      button.style.top = `${note.y}%`;
      button.dataset.index = String(index);
      button.setAttribute("aria-pressed", index === noteIndex ? "true" : "false");
      button.setAttribute("aria-label", `批注 ${index + 1}：${note.title}`);
      button.innerHTML = `${pad(index + 1)}<span class="tip" aria-hidden="true">${escapeHtml(note.title)}</span>`;
      button.addEventListener("click", () => {
        selectNote(index, { sheet: mobileQuery.matches });
      });
      canvas.append(button);
    });
  }

  function noteBody(note) {
    return escapeHtml(note.text)
      .split("\n\n")
      .filter((paragraph) => paragraph.trim())
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  function noteImages(note, title) {
    const images = (note.images || []).map((url) => {
      const name = url.split("/").pop().replace(/\.(jpe?g|png)$/i, "");
      return `assets/img/tips/${name}.webp`;
    });
    if (!images.length) return "";
    return `<div class="note-images">${images
      .map(
        (src, index) => `
        <a href="${src}" data-viewer-src="${src}" aria-label="放大查看 ${escapeHtml(title)} 配图 ${index + 1}">
          <img src="${src}" alt="${escapeHtml(title)} 配图 ${index + 1}" loading="lazy">
        </a>`
      )
      .join("")}</div>`;
  }

  function selectionLabel() {
    const notes = notesFor(current);
    if (!notes.length) return "暂无批注";
    if (noteIndex < 0) return `${pad(notes.length)} 处批注 · 点击红点阅读`;
    return `${pad(noteIndex + 1)} / ${pad(notes.length)} 处批注`;
  }

  function renderInspector() {
    if (!current) return;
    const image = currentImage();
    const notes = notesFor(current);

    if (noteIndex < 0 || !notes[noteIndex]) {
      inspector.innerHTML = `
        <div class="inspector-empty">
          <span class="crosshair" aria-hidden="true"></span>
          <h2>${notes.length ? "红点里，<br>是住过的人留下的判断。" : "这张图，<br>把尺寸说完了。"}</h2>
          <p>${
            notes.length
              ? "选择照片上的红点，阅读对应位置的现场批注。每一处都标了它在这张图里的位置。"
              : "暂时没有额外批注。点击「原图」可以放大核对细节；如果发现尺寸有出入，请以现场实测为准。"
          }</p>
          ${
            notes.length
              ? '<button class="text-link ledger-link" type="button" data-browse-notes>浏览全部批注 <span>↓</span></button>'
              : `<span class="mono muted">${escapeHtml(image.id)} / ${escapeHtml(image.label)}</span>`
          }
        </div>`;
      return;
    }

    const note = notes[noteIndex];
    const switcher =
      notes.length > 1
        ? `<div class="note-switch" aria-label="本图的其他批注">${notes
            .map(
              (item, index) => `
              <button class="chip" type="button" data-note-index="${index}" aria-pressed="${index === noteIndex}">${escapeHtml(item.title)}</button>`
            )
            .join("")}</div>`
        : "";

    inspector.innerHTML = `
      <article class="note-content is-updating">
        ${switcher}
        <p class="kicker">${escapeHtml(image.id)} · 现场批注 ${pad(noteIndex + 1)}</p>
        <h2>${escapeHtml(note.title)}</h2>
        <div class="note-body">${noteBody(note)}</div>
        ${noteImages(note, note.title)}
        <p class="note-source">${escapeHtml(image.id)} / ${escapeHtml(image.label)} · 原站整理</p>
      </article>`;
  }

  function sheetMarkup(note) {
    const image = currentImage();
    const notes = notesFor(current);
    const next = notes.length > 1 ? (noteIndex + 1) % notes.length : -1;
    return `
      ${noteBody(note)}
      ${noteImages(note, note.title)}
      <div class="note-next">
        <span class="mono">${escapeHtml(image.id)} · Note ${pad(noteIndex + 1)} / ${pad(notes.length)}</span>
        ${
          next >= 0
            ? `<button class="text-link" type="button" data-sheet-note="${next}">下一处批注 <span>→</span></button>`
            : `<span class="mono muted">现场批注</span>`
        }
      </div>`;
  }

  function openSheetFor(index) {
    const image = currentImage();
    const notes = notesFor(current);
    const note = notes[index];
    if (!note) return;
    sheet.open({
      kicker: `${image.id} · 现场批注`,
      title: note.title,
      html: sheetMarkup(note)
    });
    requestAnimationFrame(() => {
      const body = $(".sheet-body");
      if (body) body.scrollTop = 0;
    });
  }

  function syncSelection() {
    const notes = notesFor(current);
    const image = currentImage();
    $("#currentId").textContent = image.id;
    $("#currentName").textContent = image.label;
    $("#captionId").textContent = image.id;
    $("#captionLabel").textContent = image.label;
    $("#captionNotes").textContent = selectionLabel();
    const dims = DIMENSIONS[image.id] || [1400, 1050];
    $("#captionRight").innerHTML = `${dims[0]} × ${dims[1]} px<br>${notes.length ? "点击红点阅读批注" : "暂无现场批注"}`;
    $$(".plate-item", plateList).forEach((item) => {
      item.setAttribute("aria-current", item.dataset.id === current ? "true" : "false");
    });
    $$(".hotspot", canvas).forEach((hotspot) => {
      hotspot.setAttribute("aria-pressed", Number(hotspot.dataset.index) === noteIndex ? "true" : "false");
    });
    document.title = `${image.id} ${image.label} · 宿舍图集`;
    if (inspector.scrollTop) inspector.scrollTop = 0;
  }

  function fitCanvas() {
    if (!current) return;
    const dims = DIMENSIONS[current] || [1400, 1050];
    const styles = getComputedStyle(stage);
    const availableWidth =
      stage.clientWidth - parseFloat(styles.paddingLeft || "0") - parseFloat(styles.paddingRight || "0");
    const availableHeight =
      stage.clientHeight - parseFloat(styles.paddingTop || "0") - parseFloat(styles.paddingBottom || "0");
    const scale = Math.min(availableWidth / dims[0], availableHeight / dims[1]);
    canvas.style.width = `${Math.max(1, Math.floor(dims[0] * scale))}px`;
    canvas.style.height = `${Math.max(1, Math.floor(dims[1] * scale))}px`;
  }

  function crossfade(image) {
    const src = plateSrc(image.id);
    const alt = image.label;
    const token = ++imageToken;
    if (reduceMotion.matches || !front.getAttribute("src")) {
      front.src = src;
      front.alt = alt;
      back.classList.remove("is-visible");
      return;
    }

    back.classList.remove("is-visible");
    back.src = src;
    back.alt = alt;
    back.setAttribute("aria-hidden", "true");

    const commit = () => {
      if (token !== imageToken) return;
      back.classList.add("is-visible");
      window.setTimeout(() => {
        if (token !== imageToken) return;
        front.src = src;
        front.alt = alt;
        back.style.transition = "none";
        back.classList.remove("is-visible");
        requestAnimationFrame(() => {
          back.style.transition = "";
        });
      }, 440);
    };

    if (back.complete && back.naturalWidth > 0) {
      requestAnimationFrame(commit);
    } else {
      back.onload = commit;
    }
  }

  function preloadNeighbors() {
    const images = visibleImages();
    const index = images.findIndex((image) => image.id === current);
    [images[index - 1], images[index + 1]].forEach((image) => {
      if (!image) return;
      const loader = new Image();
      loader.src = plateSrc(image.id);
    });
  }

  function selectPlate(id, nextNote = 0, options = {}) {
    const image = IMAGES.find((item) => item.id === id);
    if (!image) return;
    const changed = current !== id;
    current = id;
    const notes = notesFor(id);
    noteIndex = notes.length ? clamp(nextNote, 0, notes.length - 1) : -1;

    if (changed || options.force) {
      fitCanvas();
      crossfade(image);
      renderHotspots();
      preloadNeighbors();
    }

    syncSelection();
    renderInspector();
    if (options.scrollLedger) {
      const top = stage.getBoundingClientRect().top + window.scrollY - 138;
      window.scrollTo({ top, behavior: reduceMotion.matches ? "auto" : "smooth" });
    }
    if (changed) {
      try {
        history.replaceState(null, "", `#${id}`);
      } catch {
        /* file:// or a locked URL should not break plate browsing. */
      }
    }
  }

  function selectNote(index, options = {}) {
    const notes = notesFor(current);
    if (!notes[index]) return;
    noteIndex = index;
    renderInspector();
    syncSelection();
    if (options.sheet) openSheetFor(index);
  }

  function step(direction) {
    const images = visibleImages();
    const index = images.findIndex((image) => image.id === current);
    const next = images[(index + direction + images.length) % images.length];
    if (next) selectPlate(next.id, 0);
  }

  function openViewer(src, alt) {
    if (!viewer || typeof viewer.showModal !== "function") return;
    viewerImage.src = src;
    viewerImage.alt = alt || "图纸原图";
    viewer.showModal();
  }

  /* ---------- bindings ---------- */

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    filter = button.dataset.filter;
    renderFilters();
    renderPlateList();
    const images = visibleImages();
    if (images.length && !images.some((image) => image.id === current)) {
      selectPlate(images[0].id, 0);
    }
  });

  plateList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (!button) return;
    selectPlate(button.dataset.id, 0);
  });

  inspector.addEventListener("click", (event) => {
    const noteButton = event.target.closest("[data-note-index]");
    if (noteButton) {
      const index = Number(noteButton.dataset.noteIndex);
      selectNote(index);
      inspector.querySelector(`[data-note-index="${index}"]`)?.focus({ preventScroll: true });
      return;
    }
    if (event.target.closest("[data-browse-notes]")) {
      const ledger = $(".notes-ledger");
      if (ledger) ledger.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
    }
  });

  ledgerList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (!button) return;
    const id = button.dataset.id;
    const index = Number(button.dataset.note || 0);
    selectPlate(id, index, { scrollLedger: !mobileQuery.matches });
    if (mobileQuery.matches) {
      window.setTimeout(() => openSheetFor(index), 60);
    }
  });

  document.addEventListener("click", (event) => {
    const sheetNote = event.target.closest("[data-sheet-note]");
    if (sheetNote) {
      const index = Number(sheetNote.dataset.sheetNote);
      selectNote(index, { sheet: true });
      return;
    }
    const imageLink = event.target.closest("[data-viewer-src]");
    if (imageLink) {
      event.preventDefault();
      openViewer(imageLink.dataset.viewerSrc, imageLink.querySelector("img")?.alt);
    }
  });

  $$("[data-prev]").forEach((button) => button.addEventListener("click", () => step(-1)));
  $$("[data-next]").forEach((button) => button.addEventListener("click", () => step(1)));
  $$("[data-zoom]").forEach((button) =>
    button.addEventListener("click", () => {
      const image = currentImage();
      if (image) openViewer(plateSrc(image.id), `${image.id} ${image.label}`);
    })
  );

  if (viewer) {
    viewer.addEventListener("click", (event) => {
      if (event.target === viewer || event.target.classList.contains("viewer-inner")) {
        viewer.close();
      }
    });
    const close = $("[data-viewer-close]", viewer);
    if (close) close.addEventListener("click", () => viewer.close());
  }

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.matches("input, textarea, select, [contenteditable='true']")) return;
    if (sheet.isOpen || (viewer && viewer.open)) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  });

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(() => fitCanvas()).observe(stage);
  } else {
    window.addEventListener("resize", fitCanvas);
  }

  /* ---------- initial state ---------- */

  renderFilters();
  renderPlateList();

  const match = location.hash.match(/^#([A-Z]\d{2})(?:-(\d+))?$/);
  const initialId = match && IMAGES.some((image) => image.id === match[1]) ? match[1] : IMAGES[0].id;
  const initialNote = match && match[2] ? Number(match[2]) : 0;
  selectPlate(initialId, initialNote, { force: true });

  window.addEventListener("hashchange", () => {
    const next = location.hash.match(/^#([A-Z]\d{2})(?:-(\d+))?$/);
    if (!next || !IMAGES.some((image) => image.id === next[1])) return;
    selectPlate(next[1], next[2] ? Number(next[2]) : 0, { force: true });
  });

  ledgerList.innerHTML = IMAGES.flatMap((image) =>
    notesFor(image.id).map(
      (note, index) => `
      <button class="ledger-item" type="button" data-id="${image.id}" data-note="${index}">
        <span class="n">${image.id}</span>
        <span class="q">${escapeHtml(note.title)}</span>
        <span class="p">Note ${pad(index + 1)} / ${pad(notesFor(image.id).length)}</span>
      </button>`
    )
  ).join("");
})();
