/* =========================================================
   icons.js — 线性图标库（24×24, stroke=currentColor）
   用法：icon('truck')  →  <svg class="ic" ...>
   ========================================================= */
(function () {
  var P = {
    info:
      '<circle cx="12" cy="12" r="9"/><line x1="12" y1="16" x2="12" y2="11"/><circle cx="12" cy="7.5" r="0.5" fill="currentColor"/>',
    truck:
      '<path d="M2.6 7.2h10.6v9.2H2.6z"/><path d="M13.2 10.4h3.6l3.4 3.4v2.6h-7"/>' +
      '<circle cx="6.4" cy="17.8" r="1.7"/><circle cx="16.6" cy="17.8" r="1.7"/>',
    cube:
      '<path d="M12 2.8 20.2 7v10L12 21.2 3.8 17V7L12 2.8Z"/>' +
      '<path d="M3.8 7 12 11.4 20.2 7"/><path d="M12 11.4v9.8"/>',
    shield:
      '<path d="M12 2.8 19.4 5.7v6.2c0 4.3-3 7.3-7.4 8.8-4.4-1.5-7.4-4.5-7.4-8.8V5.7L12 2.8Z"/>' +
      '<path d="m9.2 11.9 2.2 2.2 3.9-4.3"/>',
    leaf:
      '<path d="M20.4 3.6C11.4 3.6 5.2 8.9 5.2 16.6c0 1.3.2 2.5.6 3.6"/>' +
      '<path d="M20.4 3.6c.8 9-5.3 14.6-14 14.6"/><path d="M4.9 20.2 14.6 10.4"/>',
    pen:
      '<path d="M4.2 19.8l3.9-1L19.3 7.6a1.9 1.9 0 0 0 0-2.7l-.6-.6a1.9 1.9 0 0 0-2.7 0L4.9 15.6l-.7 4.2Z"/>' +
      '<path d="m14.6 5.4 4 4"/>',
    refresh:
      '<path d="M20.2 12a8.2 8.2 0 1 1-2.4-5.8"/><path d="M20.6 3.9v4.7h-4.7"/>',
    layers:
      '<path d="m12 3 8.4 4.5L12 12 3.6 7.5 12 3Z"/><path d="m3.6 12 8.4 4.5 8.4-4.5"/>' +
      '<path d="m3.6 16.5 8.4 4.5 8.4-4.5"/>',
    grid:
      '<rect x="3.6" y="3.6" width="7" height="7" rx="1.5"/><rect x="13.4" y="3.6" width="7" height="7" rx="1.5"/>' +
      '<rect x="3.6" y="13.4" width="7" height="7" rx="1.5"/><rect x="13.4" y="13.4" width="7" height="7" rx="1.5"/>',
    sofa:
      '<path d="M4.6 12.6V9.9a2.4 2.4 0 0 1 2.4-2.4h10a2.4 2.4 0 0 1 2.4 2.4v2.7"/>' +
      '<path d="M3 12.6h18v4.3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.3Z"/><path d="M7 18.9v1.7M17 18.9v1.7"/>',
    bed:
      '<path d="M2.9 19.2V9.4"/><path d="M2.9 14.6h18.2"/><path d="M21.1 19.2v-4.6"/>' +
      '<path d="M6.2 14.6v-3.1h4.6v3.1"/><path d="M12.4 11.5h6.3a2.4 2.4 0 0 1 2.4 2.4v.7"/>',
    dining:
      '<circle cx="12" cy="12" r="4.4"/><path d="M3.4 6.6v10.8"/><path d="M6.2 6.6v3.4a2.8 2.8 0 0 1-2.8 2.8"/>' +
      '<path d="M20.6 6.6v10.8"/><path d="M18.2 6.6v10.8"/>',
    desk:
      '<path d="M2.9 10.2h18.2"/><path d="M5.4 10.2V19.4"/><path d="M18.6 10.2V19.4"/>' +
      '<rect x="8.6" y="4.4" width="6.8" height="4.8" rx="1.1"/>',
    lamp:
      '<path d="M12 3.2v3.4"/><path d="M6.4 12.6 12 6.6l5.6 6"/><path d="M6.4 12.6h11.2"/>' +
      '<path d="M12 12.6v5.2"/><path d="M8.6 20.6h6.8"/>',
    pot:
      '<path d="M5 10.4h14v5.2a4.2 4.2 0 0 1-4.2 4.2H9.2A4.2 4.2 0 0 1 5 15.6v-5.2Z"/>' +
      '<path d="M3.2 12.8h1.6M19.2 12.8h1.6"/><path d="M9.4 6.8c0-1.5 1.2-1.7 1.2-3.2"/>' +
      '<path d="M13.4 6.8c0-1.5 1.2-1.7 1.2-3.2"/>',
    crib:
      '<path d="M4 8.6h16"/><path d="M4 8.6v10.2"/><path d="M20 8.6v10.2"/><path d="M4 14.4h16"/>' +
      '<path d="M8 8.6v5.8M12 8.6v5.8M16 8.6v5.8"/>',
    sun:
      '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M4.2 12H1.8M22.2 12h-2.4"/>' +
      '<path d="M6.2 6.2 4.5 4.5M19.5 19.5l-1.7-1.7M6.2 17.8 4.5 19.5M19.5 4.5l-1.7 1.7"/>',
    store:
      '<path d="M4.2 9.8V19h15.6V9.8"/><path d="M3 9.8 4.8 5h14.4L21 9.8"/>' +
      '<path d="M9.4 19v-5.6h5.2V19"/>',
    sparkle:
      '<path d="M12 3.4 13.9 9l5.6 1.9L13.9 12.8 12 18.4 10.1 12.8 4.5 10.9 10.1 9 12 3.4Z"/>',
    check:
      '<path d="m4.8 12.6 4.6 4.6L19.4 7"/>',
    checkCircle:
      '<circle cx="12" cy="12" r="9"/><path d="m8.1 12.3 2.8 2.8 5-5.9"/>',
    arrow:
      '<path d="M4.4 12h15.2"/><path d="m13.6 6.2 5.8 5.8-5.8 5.8"/>',
    plus:
      '<path d="M12 5.2v13.6M5.2 12h13.6"/>',
    chat:
      '<path d="M4 5.6h16v9.6H9.4L5.2 19v-3.8H4z"/>',
    handshake:
      '<path d="M3 10.6 7 7l3.4 2.8L12 8.4l1.6 1.4L17 7l4 3.6"/>' +
      '<path d="M7 7 3 10.6v3.2L6 16l2.2-1.6"/><path d="M17 7l4 3.6v3.2L18 16l-2.2-1.6"/>' +
      '<path d="M10.4 12.6 12 14.2l1.6-1.6"/>',
    swatch:
      '<circle cx="12" cy="12" r="8.4"/><path d="M12 3.6a8.4 8.4 0 0 1 0 16.8"/>',

    /* ---- 装修编辑页 UI 用 ---- */
    image:
      '<rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2.4"/><circle cx="8.6" cy="9.6" r="1.6"/>' +
      '<path d="m4.6 17.4 4.8-4.6 3.4 3 2.6-2.4 4.2 4"/>',
    video:
      '<rect x="3.2" y="5.6" width="17.6" height="12.8" rx="2.4"/><path d="m10.4 9.4 5 2.6-5 2.6V9.4Z"/>',
    eye:
      '<path d="M2.6 12S6 6.4 12 6.4 21.4 12 21.4 12 18 17.6 12 17.6 2.6 12 2.6 12Z"/>' +
      '<circle cx="12" cy="12" r="2.8"/>',
    eyeOff:
      '<path d="M4 4.4 20 20.4"/><path d="M9.6 6.8A9.8 9.8 0 0 1 12 6.4c6 0 9.4 5.6 9.4 5.6a17 17 0 0 1-3.2 3.9"/>' +
      '<path d="M6.3 8.6A16.6 16.6 0 0 0 2.6 12S6 17.6 12 17.6a9.7 9.7 0 0 0 3.4-.6"/>' +
      '<path d="M10.2 10.3a2.8 2.8 0 0 0 3.5 3.5"/>',
    brush:
      '<path d="M14.6 4.6 19.4 9.4"/><path d="M17.4 2.8a2.4 2.4 0 0 1 3.4 0 2.4 2.4 0 0 1 0 3.4l-1.4 1.4-3.4-3.4 1.4-1.4Z"/>' +
      '<path d="M15.4 8 6.6 16.8a3.4 3.4 0 0 0 4.8 4.8L20.2 12.8"/>',
    monitor:
      '<rect x="2.8" y="4.4" width="18.4" height="12" rx="1.8"/><path d="M8.4 19.8h7.2"/><path d="M12 16.4v3.4"/>',
    link:
      '<path d="M10 13.8a3.6 3.6 0 0 0 5.1 0l2.6-2.6a3.6 3.6 0 0 0-5.1-5.1l-1 1"/>' +
      '<path d="M14 10.2a3.6 3.6 0 0 0-5.1 0l-2.6 2.6a3.6 3.6 0 0 0 5.1 5.1l1-1"/>',
    alignLeft:
      '<path d="M3.6 6h16.8M3.6 12h10.8M3.6 18h14.4"/>',
    alignCenter:
      '<path d="M3.6 6h16.8M6.6 12h10.8M4.8 18h14.4"/>',
    alignRight:
      '<path d="M3.6 6h16.8M9.6 12h10.8M6 18h14.4"/>',
    alignBoxLeft:
      '<path d="M4.5 4.5v15M8.5 10.5h8M8.5 14.5h8"/>',
    alignBoxCenter:
      '<path d="M12 4.5v15M7.5 10.5h9M7.5 14.5h9"/>',
    alignBoxRight:
      '<path d="M19.5 4.5v15M7.5 10.5h8M7.5 14.5h8"/>',
    alignBoxTop:
      '<path d="M4.5 4.5h15M9.5 8.5v7M14.5 8.5v4"/>',
    alignBoxMiddle:
      '<path d="M4.5 12h15M9.5 7.5v9M14.5 7.5v9"/>',
    alignBoxBottom:
      '<path d="M4.5 19.5h15M9.5 11.5v4M14.5 8.5v7"/>',
    chevron:
      '<path d="m6.4 9.6 5.6 5.4 5.6-5.4"/>',
    play:
      '<path d="M8.6 5.6v12.8L19 12 8.6 5.6Z"/>',
    list:
      '<path d="M3.8 6.4h16.4M3.8 12h16.4M3.8 17.6h10.4"/>',
    text:
      '<path d="M4.6 6.4h14.8"/><path d="M12 6.4v11.2"/><path d="M8.6 17.6h6.8"/>',
    trash:
      '<path d="M4.6 7h14.8"/><path d="M9.4 7V4.8h5.2V7"/><path d="M6.6 7l.9 12.2h9l.9-12.2"/>',
    carousel:
      '<rect x="6.6" y="6" width="10.8" height="12" rx="1.6"/><path d="M3.4 9v6M20.6 9v6"/>',
    seo:
      '<circle cx="11" cy="11" r="6.4"/><path d="m15.8 15.8 4 4"/><path d="M8.6 11h4.8M11 8.6v4.8"/>',
    map:
      '<path d="M9 4.5 3.6 6.6v12.9l5.4-2.1 5.4 2.1 5.4-2.1V4.5l-5.4 2.1L9 4.5Z"/>' +
      '<path d="M9 4.5v12.9M14.4 6.6v12.9"/>',
    pin:
      '<path d="M12 21s6.4-6.1 6.4-10.9a6.4 6.4 0 1 0-12.8 0C5.6 14.9 12 21 12 21Z"/>' +
      '<circle cx="12" cy="10" r="2.3"/>',
    palette:
      '<path d="M12 21a9 9 0 0 1-9-9c0-4.97 4.03-9 9-9 4.14 0 7.64 2.8 8.68 6.64.44 1.63-.82 3.36-2.5 3.36h-2.18c-1 0-1.82.82-1.82 1.82 0 .44.16.85.43 1.17.65.77.5 1.94-.3 2.58A8.93 8.93 0 0 1 12 21Z"/>' +
      '<circle cx="7.5" cy="10.5" r="1.2" fill="currentColor"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor"/><circle cx="16.5" cy="10.5" r="1.2" fill="currentColor"/>',
    checkCircleFilled:
      '<circle cx="12" cy="12" r="10" fill="#1677ff" stroke="none"/><path d="m7.8 12.2 2.8 2.8 5.6-5.8" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    circleEmpty:
      '<circle cx="12" cy="12" r="9.5" stroke="#d0d5dd" stroke-width="1.8" fill="#ffffff"/>',
    lineWidth:
      '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
    boxSquare:
      '<rect x="4" y="4" width="16" height="16" rx="2" stroke-width="1.6"/>',
    chevronDown:
      '<path d="m6 9 6 6 6-6"/>',
    cornerAll:
      '<rect x="4.5" y="4.5" width="15" height="15" rx="3.5" stroke="currentColor" stroke-width="1.8"/>' +
      '<path d="M4.5 9V7a2.5 2.5 0 0 1 2.5-2.5h2M15 4.5h2a2.5 2.5 0 0 1 2.5 2.5v2M19.5 15v2a2.5 2.5 0 0 1-2.5 2.5h-2M9 19.5H7a2.5 2.5 0 0 1-2.5-2.5v-2" stroke="#1677ff" stroke-width="2.2"/>',
    cornerInd:
      '<path d="M4.5 8.5V6a1.5 1.5 0 0 1 1.5-1.5h2.5M15.5 4.5H18a1.5 1.5 0 0 1 1.5 1.5v2.5M19.5 15.5V18a1.5 1.5 0 0 1-1.5 1.5h-2.5M8.5 19.5H6a1.5 1.5 0 0 1-1.5-1.5v-2.5" stroke="currentColor" stroke-width="1.8"/>',
    paddingAll:
      '<rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" stroke-width="1.6"/><rect x="8.5" y="8.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/>',
    paddingInd:
      '<rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" stroke-width="1.6"/><rect x="8.5" y="8.5" width="7" height="7" rx="1.5" stroke="#1677ff" stroke-width="2" fill="#1677ff" fill-opacity="0.12"/>'
  };

  window.icon = function (name, cls) {
    var body = P[name] || P.sparkle;
    return (
      '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + body + '</svg>'
    );
  };
})();
