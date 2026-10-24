(function () {
  "use strict";

  const list = document.getElementById("logCurrent");
  const earlierList = document.getElementById("logEarlier");
  if (!list || typeof CHANGELOG === "undefined") return;

  const esc = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  list.innerHTML = CHANGELOG.map((release, index) => {
    const groups = (release.groups || [])
      .map(
        (group) => `
          <section class="log-group">
            <h4>${esc(group.label)}</h4>
            <ul>${(group.items || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
          </section>`
      )
      .join("");
    return `
      <article class="log-entry${index === 0 ? " is-latest" : ""}" data-reveal>
        <div class="log-side">
          <span class="log-version">${esc(release.version)}</span>
          <time datetime="${esc(release.date)}">${esc(String(release.date || "").replaceAll("-", "."))}</time>
          ${index === 0 ? '<span class="log-flag">Current</span>' : ""}
        </div>
        <div class="log-body">
          <h3>${esc(release.title)}</h3>
          <p class="log-summary">${esc(release.summary)}</p>
          <div class="log-groups">${groups}</div>
        </div>
      </article>`;
  }).join("");

  if (earlierList && typeof EARLIER_UPDATES !== "undefined") {
    earlierList.innerHTML = EARLIER_UPDATES.map(
      (release) => `
        <article class="log-entry" data-reveal>
          <div class="log-side">
            <span class="log-version">${esc(release.version)}</span>
            <time datetime="${esc(release.date)}">${esc(String(release.date || "").replaceAll("-", "."))}</time>
          </div>
          <div class="log-body">
            <h3>${esc(release.title)}</h3>
            <ul>${(release.items || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
          </div>
        </article>`
    ).join("");
  }
})();
