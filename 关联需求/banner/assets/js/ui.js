/* =========================================================
   ui.js — 图标 / 弹窗 / Toast / banner 渲染 / 通用工具
   ========================================================= */
(function () {
  'use strict';

  var PATHS = {
    back: '<path d="M15 18l-6-6 6-6"/>',
    chevronDown: '<path d="M6 9l6 6 6-6"/>',
    chevronRight: '<path d="M9 6l6 6-6 6"/>',
    chevronLeft: '<path d="M15 6l-6 6 6 6"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
    workflow: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><path d="M10 6.5h4A3.5 3.5 0 0117.5 10v4"/>',
    template: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    text: '<path d="M4 6h16M4 12h10M4 18h7"/>',
    sparkle: '<path d="M12 3l1.8 4.9L19 9.7l-5.2 1.8L12 16.5l-1.8-5L5 9.7l5.2-1.8L12 3z"/><path d="M19 16l.7 1.9L21.6 18l-1.9.7L19 20.6l-.7-1.9L16.4 18l1.9-.4L19 16z"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>',
    send: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    more: '<circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    refresh: '<path d="M21 12a9 9 0 11-2.64-6.36M21 3v6h-6"/>',
    expand: '<path d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M8 21H5a2 2 0 01-2-2v-3M16 21h3a2 2 0 002-2v-3"/>',
    history: '<path d="M3 12a9 9 0 109-9 9 9 0 00-7.6 4.2M3 3v4h4"/><path d="M12 7v5l3 2"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 .3c0 1.7-2.5 2-2.5 3.7M12 17h.01"/>',
    monitor: '<rect x="2" y="4" width="20" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9M9 20v-6h6v6"/>',
    page: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17.5l9 5 9-5"/>',
    cube: '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v9"/>',
    node: '<circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M7.5 6h9M6.5 8.2L10.5 16M17.5 8.2L13.5 16"/>',
    brush: '<path d="M9 20l-5-5 9-9 5 5-9 9z"/><path d="M14 5l5 5M4 21c2 0 3-1 3-3"/>',
    arrowUpRight: '<path d="M7 17L17 7M8 7h9v9"/>',
    zoomIn: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M8 11h6M11 8v6"/>',
    zoomOut: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M8 11h6"/>',
    fit: '<path d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4M20 15v4a1 1 0 01-1 1h-4"/>',
    play: '<path d="M8 5v14l11-7-11-7z"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    link: '<path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1.5-1.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    wand: '<path d="M3 21l9-9M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8l1.4 1.4M17.8 6.2l1.4-1.4M12.2 6.2l-1.4-1.4"/>',
    star: '<path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 3z"/>',
    rotate: '<path d="M21 12a9 9 0 11-3-6.7M21 3v5h-5"/>',
    save: '<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    folder: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>',
    arrowDown: '<path d="M12 5v14M5 12l7 7 7-7"/>',
    arrowRight: '<path d="M5 12h14M13 5l7 7-7 7"/>',
    arrowUp: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    message: '<path d="M21 11.5a8.4 8.4 0 01-9 8.4 9.3 9.3 0 01-4-.9L3 21l1.9-4.6A8.4 8.4 0 1121 11.5z"/>'
  };

  function icon(name, cls) {
    var p = PATHS[name] || '';
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }

  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------------- Toast ---------------- */
  var toastWrap = null;
  function toast(msg, type) {
    if (!toastWrap) {
      toastWrap = document.createElement('div');
      toastWrap.className = 'toast-wrap';
      toastWrap.id = 'toastWrap';
      document.body.appendChild(toastWrap);
    }
    var t = document.createElement('div');
    t.className = 'toast' + (type === 'warn' ? ' toast--warn' : '');
    t.innerHTML = icon(type === 'warn' ? 'alert' : 'check') + '<span>' + escapeHTML(msg) + '</span>';
    toastWrap.appendChild(t);
    while (toastWrap.children.length > 3) toastWrap.removeChild(toastWrap.firstChild);
    setTimeout(function () {
      t.classList.add('is-out');
      setTimeout(function () { t.remove(); }, 220);
    }, 2600);
  }

  /* ---------------- 弹窗 ---------------- */
  var scrollLock = 0;
  function openModal(id) {
    var m = typeof id === 'string' ? document.getElementById(id) : id;
    if (!m) return;
    m.classList.add('is-open');
    m.setAttribute('aria-hidden', 'false');
    if (!scrollLock++) document.body.style.overflow = 'hidden';
    var focusable = m.querySelector('input:not([type=hidden]):not([readonly]), textarea, select, button');
    if (focusable) setTimeout(function () { focusable.focus({ preventScroll: true }); }, 60);
    m.dispatchEvent(new CustomEvent('modal:open', { bubbles: false }));
  }
  function closeModal(id) {
    var m = typeof id === 'string' ? document.getElementById(id) : id;
    if (!m || !m.classList.contains('is-open')) return;
    m.classList.remove('is-open');
    m.setAttribute('aria-hidden', 'true');
    scrollLock = Math.max(0, scrollLock - 1);
    if (!scrollLock) document.body.style.overflow = '';
    m.dispatchEvent(new CustomEvent('modal:close', { bubbles: false }));
  }

  document.addEventListener('click', function (e) {
    var closer = e.target.closest('[data-close]');
    if (closer) {
      var m = closer.closest('.modal');
      if (m) closeModal(m);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var open = document.querySelector('.modal.is-open');
      if (open) closeModal(open);
    }
  });

  /* ---------------- Banner 渲染 ---------------- */
  var DEF_COPY = {
    eyebrow: 'NEW · ACOUSTIC',
    title: 'THE SOUND\nOF NATURE',
    desc: '轻盈佩戴，沉浸每一段旋律。',
    cta: '立即探索'
  };

  function layoutMeta(id) {
    var list = (window.BANNER_DATA || {}).layouts || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0] || { id: id, name: id, full: id };
  }

  function glyph(layout) {
    var g = layout === 'center' ? 'center' : String(layout).replace('-img', '');
    return '<span class="lyt lyt--' + g + '"><i class="lyt__img"></i><span class="lyt__txt"><i></i><i></i><i></i></span></span>';
  }

  function allTemplates() {
    if (window.BannerStore) return window.BannerStore.templates();
    return (window.BANNER_DATA || {}).templates || [];
  }

  function getTemplate(id) {
    var list = allTemplates();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /**
   * 渲染一张 banner
   * @param {HTMLElement|string} host
   * @param {Object} o { layout, copy, theme, photo, copyData, template, ratio, guide }
   */
  function renderBanner(host, o) {
    var el = typeof host === 'string' ? document.querySelector(host) : host;
    if (!el) return;
    o = o || {};
    var D = window.BANNER_DATA || { ratioMap: {} };
    var tpl = o.template || (o.templateId ? getTemplate(o.templateId) : null) || {};
    var layout = o.layout || tpl.layout || 'left-img';
    var copyOn = o.copy != null ? !!o.copy : (tpl.copy !== false);
    var theme = o.theme || tpl.theme || 'dark';
    var photo = o.photo || tpl.photo || ((D.photos || {}).headphone || '');
    var copyData = o.copyData || tpl.copyData || DEF_COPY;
    var ar = D.ratioMap && D.ratioMap[o.ratio || '1:1'] || '1x1';

    if (copyOn && (!copyData || !copyData.title)) copyData = DEF_COPY;

    var copyHTML = '';
    if (copyOn) {
      copyHTML =
        '<div class="bnr__copy">' +
          (copyData.eyebrow ? '<span class="bnr__eyebrow">' + escapeHTML(copyData.eyebrow) + '</span>' : '') +
          '<h3 class="bnr__title">' + escapeHTML(copyData.title) + '</h3>' +
          (copyData.desc ? '<p class="bnr__desc">' + escapeHTML(copyData.desc) + '</p>' : '') +
          (copyData.cta ? '<span class="bnr__cta">' + escapeHTML(copyData.cta) + '</span>' : '') +
        '</div>';
    } else if (layout !== 'center') {
      copyHTML =
        '<div class="bnr__copy is-empty">' +
          (o.guide
            ? '<span class="bnr__empty">' + icon('text') + '<span>文案位 · 留空</span></span>'
            : '') +
        '</div>';
    }

    var keep = [];
    el.classList.forEach(function (c) {
      if (c !== 'bnr' && c.indexOf('bnr--') !== 0) keep.push(c);
    });
    el.className = 'bnr bnr--' + layout + ' bnr--' + (theme === 'light' ? 'light' : 'dark') + ' bnr--ar-' + ar +
      (o.overlay ? ' bnr--overlay' : '') + (keep.length ? ' ' + keep.join(' ') : '');
    el.style.setProperty('--bnr-ar', ar === '16x9' ? '16 / 9' : ar === '4x3' ? '4 / 3' : '1');
    el.setAttribute('data-layout', layout);
    el.innerHTML =
      '<div class="bnr__media"><img src="' + escapeHTML(photo) + '" alt="AI 生成的 banner 视觉效果" loading="eager"></div>' +
      copyHTML + (o.overlay ? '<i class="bnr__scrim"></i>' : '');
  }

  /* ---------------- 其他 ---------------- */
  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait);
    };
  }

  function readFile(file, cb) {
    if (!file) return;
    var r = new FileReader();
    r.onload = function () { cb(r.result); };
    r.readAsDataURL(file);
  }

  window.UI = {
    icon: icon,
    templates: allTemplates,
    toast: toast,
    openModal: openModal,
    closeModal: closeModal,
    renderBanner: renderBanner,
    layoutMeta: layoutMeta,
    glyph: glyph,
    getTemplate: getTemplate,
    escapeHTML: escapeHTML,
    debounce: debounce,
    readFile: readFile,
    DEF_COPY: DEF_COPY
  };
})();
