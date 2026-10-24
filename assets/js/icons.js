(function () {
  "use strict";

  const ICONS = {
    building:
      '<path d="M4 20V6l8-3 8 3v14M8 20v-5h8v5"/><path d="M8 8h.01M12 8h.01M16 8h.01M8 11h.01M12 11h.01M16 11h.01"/>',
    phone:
      '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M10.5 18.5h3"/>',
    chat:
      '<path d="M4 5h11v7H8l-4 3V5Z"/><path d="M15 9h5v7h-3l-2 2v-9Z"/>',
    certificate:
      '<circle cx="12" cy="9" r="4"/><path d="M8.5 12.5 7 21l5-2 5 2-1.5-8.5"/>',
    id:
      '<rect x="3" y="5" width="18" height="14" rx="1"/><circle cx="8" cy="11" r="2"/><path d="M12 10h5M12 14h5M5.5 16c.8-1.4 4.2-1.4 5 0"/>',
    monitor:
      '<rect x="3" y="5" width="18" height="11" rx="1"/><path d="M12 16v4M8 21h8"/>',
    course:
      '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M10 9l5 3-5 3V9Z"/>',
    play:
      '<circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4V8Z"/>',
    cap:
      '<path d="M3 9l9-4 9 4-9 4-9-4Z"/><path d="M7 11v5c0 2 10 2 10 0v-5M21 9v5"/>',
    branch:
      '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 8v8M18 10v2c0 3-3 4-6 4H8"/>',
    book:
      '<path d="M4 5c3-1 6-1 8 1v14c-2-2-5-2-8-1V5Z"/><path d="M20 5c-3-1-6-1-8 1v14c2-2 5-2 8-1V5Z"/>',
    paper:
      '<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h4M9 12h6M9 16h6"/>',
    search:
      '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
    archive:
      '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v12h14V8M10 12h4"/>',
    screenshot:
      '<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><circle cx="12" cy="12" r="2.5"/>',
    grid:
      '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>',
    trash:
      '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
    gem:
      '<path d="M4 9l4-5h8l4 5-8 11L4 9Z"/><path d="M4 9h16M9 4l3 5 3-5"/>',
    network:
      '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="12" cy="19" r="2"/><path d="M6.5 10.7 10.7 6.5M13.3 6.5l4.2 4.2M17.5 13.3l-4.2 4.2M10.7 17.5 6.5 13.3"/>',
    gauge:
      '<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4-5"/>',
    printer:
      '<path d="M6 9V4h12v5"/><rect x="4" y="9" width="16" height="8" rx="1"/><path d="M7 14h10v7H7z"/><circle cx="17" cy="12" r=".6" fill="currentColor" stroke="none"/>',
    cube:
      '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="M12 12l8-4.5M12 12 4 7.5M12 12v9"/>',
    shield:
      '<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3Z"/><path d="M9 12l2 2 4-4"/>',
    code:
      '<path d="M9 8l-5 4 5 4M15 8l5 4-5 4"/>',
    terminal:
      '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M7 10l3 3-3 3M13 16h4"/>',
    remote:
      '<rect x="3" y="5" width="18" height="11" rx="1"/><path d="M12 16v4M8 21h8M8 9h5M8 12h3"/>',
    toolbox:
      '<rect x="3" y="9" width="18" height="10" rx="1"/><path d="M9 9V6h6v3M3 13h18M10 13v2h4v-2"/>',
    rocket:
      '<path d="M14 4c3 1 5 3 6 6l-7 7-4-4 5-9Z"/><path d="M9 13l-4 4M7 11l-3 1 2-5 4-1"/><circle cx="15" cy="8" r="1"/>',
    gamepad:
      '<path d="M7 7h10c3 0 4 3 4 6 0 3-2 4-4 4-1 0-2-1-3-2h-4c-1 1-2 2-3 2-2 0-4-1-4-4 0-3 1-6 4-6Z"/><path d="M8 10v4M6 12h4"/><circle cx="16" cy="11" r=".7" fill="currentColor" stroke="none"/><circle cx="18" cy="13" r=".7" fill="currentColor" stroke="none"/>',
    target:
      '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    star:
      '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"/>',
    image:
      '<rect x="3" y="5" width="18" height="14" rx="1"/><circle cx="8.5" cy="10" r="1.5"/><path d="M4 17l5-5 4 4 3-3 4 4"/>',
    film:
      '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    scissors:
      '<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5 20 19M8 15.5 20 5"/>',
    palette:
      '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.4-2.2-.6-1.2.2-2.3 1.5-2.3H17a4 4 0 0 0 4-4c0-5.2-4-9.5-9-9.5Z"/><circle cx="7" cy="10" r=".7" fill="currentColor" stroke="none"/><circle cx="10" cy="7" r=".7" fill="currentColor" stroke="none"/><circle cx="14" cy="7" r=".7" fill="currentColor" stroke="none"/><circle cx="16" cy="11" r=".7" fill="currentColor" stroke="none"/>',
    sparkles:
      '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z"/>',
    api:
      '<path d="M8 5 3 12l5 7M16 5l5 7-5 7"/>',
    moon:
      '<path d="M15 4a8 8 0 1 0 6 12 6.5 6.5 0 0 1-6-12Z"/>',
    cloud:
      '<path d="M7 18h10a4 4 0 0 0 .6-7.9A6 6 0 0 0 6.2 10 4 4 0 0 0 7 18Z"/>',
    switch:
      '<rect x="3" y="8" width="18" height="8" rx="4"/><circle cx="8" cy="12" r="2"/><path d="M16 10l2 2-2 2"/>',
    briefcase:
      '<rect x="3" y="7" width="18" height="12" rx="1"/><path d="M9 7V4h6v3M3 12h18"/>',
    wand:
      '<path d="M4 20 14 10M13 5l1.5 1.5M17 3l.5 2M21 7l-2 .5M18 4l-1 1"/>',
    layers:
      '<path d="M12 3l9 5-9 5-9-5 9-5Z"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5"/>',
    house:
      '<path d="M4 11l8-7 8 7v9H4v-9Z"/><path d="M9 20v-6h6v6"/>',
    note:
      '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    bed:
      '<path d="M3 18v-7h18v7M3 13h18M6 11V7h5v4M3 18v2M21 18v2"/>',
    link:
      '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/>'
  };

  function svg(name, className) {
    const paths = ICONS[name] || ICONS.link;
    return `<svg class="${className || "ui-icon"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
  }

  window.HFITIcons = { svg, has: (name) => Boolean(ICONS[name]) };
})();
