/* =========================================================
   editor-canvas.js — 编辑页画布：由 state 驱动渲染四种结构
   结构4（复合图片列表）为完整实现；结构1/2/3 复用变体库的
   布局与类名，只把文案与列表项换成 state 里的数据。
   ========================================================= */
(function () {
  'use strict';

  var icon = window.icon;
  var D = window.DATA;

  /* ---------- 小工具 ---------- */
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function hexToRgb(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length < 6) return null;
    var n = parseInt(h.slice(0, 6), 16);
    if (isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function isDark(hex) {
    var c = hexToRgb(hex);
    if (!c) return true;
    return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) < 140;
  }
  function shadowCss(sh) {
    if (!sh || !sh.on) return 'none';
    return (sh.x || 0) + 'px ' + (sh.y || 0) + 'px ' + (sh.blur || 0) + 'px ' + (sh.spread || 0) + 'px rgba(0,0,0,.32)';
  }
  function style(obj) {
    return Object.keys(obj)
      .filter(function (k) { return obj[k] !== '' && obj[k] != null; })
      .map(function (k) { return k + ':' + obj[k]; })
      .join(';');
  }

  /* ---- 单位（px/rem）与 统一/独立 尺寸输出 ---- */
  function dimVal(s, v) {
    var n = Number(v) || 0;
    if (s.unit === 'rem') n = n / 16;
    return (Math.round(n * 100) / 100) + (s.unit === 'rem' ? 'rem' : 'px');
  }
  function padCSS(s, o, f) {
    if (!o) return '0';
    f = f || 'pad';
    if ((o[f + 'Mode'] || 'uni') === 'ind') {
      return [o[f + 'T'], o[f + 'R'], o[f + 'B'], o[f + 'L']].map(function (v) { return dimVal(s, v || 0); }).join(' ');
    }
    return dimVal(s, o[f]);
  }
  function marginCSS(s, o, f) {
    if (!o) return '0';
    f = f || 'margin';
    if ((o[f + 'Mode'] || 'uni') === 'ind') {
      return [o[f + 'T'], o[f + 'R'], o[f + 'B'], o[f + 'L']].map(function (v) { return dimVal(s, v || 0); }).join(' ');
    }
    return dimVal(s, o[f]);
  }
  function radiusCSS(s, o, f) {
    if (!o) return '0';
    f = f || 'radius';
    if ((o[f + 'Mode'] || 'uni') === 'ind') {
      return [o[f + 'Tl'], o[f + 'Tr'], o[f + 'Br'], o[f + 'Bl']].map(function (v) { return dimVal(s, v || 0); }).join(' ');
    }
    return dimVal(s, o[f]);
  }
  /* 间距：统一=单值；独立= 行(row) 列(column) */
  function gapCSS(s) {
    var g = s.layout;
    if ((g.gapMode || 'uni') === 'ind') return dimVal(s, g.gapY || 0) + ' ' + dimVal(s, g.gapX || 0);
    return dimVal(s, g.gap);
  }
  function gapH(s) {
    var g = s.layout;
    return dimVal(s, (g.gapMode || 'uni') === 'ind' ? (g.gapX || 0) : g.gap);
  }

  /* ---------- 主题：浅色/深色容器时同步库内变量 ---------- */
  function themeVars(bg) {
    if (!isDark(bg)) {
      return '--ink:#14161a;--ink-soft:#2b2f37;--body:#4b5260;--muted:#7b8290;' +
        '--line:#e7e3db;--line-strong:#d6d1c7;--paper:#ffffff;--sand:#f6f2ec;--sand-deep:#eee8de;--accent:#9a7b4f;color:#14161a';
    }
    return '--ink:#f4f2ee;--ink-soft:#e3e0d9;--body:#b7bbc3;--muted:#8c919b;' +
      '--line:rgba(255,255,255,.14);--line-strong:rgba(255,255,255,.26);' +
      '--paper:transparent;--sand:rgba(255,255,255,.06);--sand-deep:rgba(255,255,255,.1);--accent:#c8a86a;color:#f4f2ee';
  }

  /* ---------- 容器 / 卡片 / 图片 样式 ---------- */
  function containerStyle(s) {
    var c = s.container;
    var bStyle = c.borderStyle || 'solid';
    return style({
      background: c.bgOn ? c.bg : 'transparent',
      'border-radius': radiusCSS(s, c, 'radius'),
      padding: padCSS(s, c, 'pad'),
      border: c.borderOn ? dimVal(s, c.borderWidth != null ? c.borderWidth : 1) + ' ' + bStyle + ' ' + c.border : '0',
      'box-shadow': shadowCss(c.shadow),
      'box-sizing': 'border-box',
      color: isDark(c.bgOn ? c.bg : '#ffffff') ? '#f4f2ee' : '#14161a'
    }) + ';' + themeVars(c.bgOn ? c.bg : '#ffffff');
  }

  function cardStyle(s) {
    var c = s.card;
    var bStyle = c.borderStyle || 'solid';
    return style({
      background: c.bgOn ? c.bg : 'transparent',
      'border-radius': radiusCSS(s, c, 'radius'),
      padding: padCSS(s, c, 'pad'),
      border: c.borderOn ? dimVal(s, c.borderWidth != null ? c.borderWidth : 1) + ' ' + bStyle + ' ' + c.border : '0',
      'box-shadow': shadowCss(c.shadow)
    });
  }

  function mediaStyle(s) {
    var g = s.img || {};
    var st = {
      'border-radius': radiusCSS(s, g, 'radius'),
      background: g.bgOn ? g.bg : 'transparent',
      border: g.borderOn ? (g.borderWidth || 1) + 'px ' + (g.borderStyle || 'solid') + ' ' + (g.border || '#111418') : '0',
      padding: padCSS(s, g, 'pad')
    };
    if (g.margin != null || g.marginMode === 'ind') {
      st.margin = marginCSS(s, g, 'margin');
    }
    if (g.ratio !== 'none') st['aspect-ratio'] = g.ratio.replace(':', '/');
    return style(st);
  }

  function iconBoxStyle(s) {
    var g = s.img || {};
    var st = {};
    if (g.bgOn) st['background-color'] = g.bg;
    if (g.borderOn) {
      st['border-width'] = (g.borderWidth != null ? g.borderWidth : 1) + 'px';
      st['border-style'] = g.borderStyle || 'solid';
      st['border-color'] = g.border || '#111418';
    } else {
      st['border'] = 'none';
    }
    if (g.radius != null || g.radiusMode === 'ind') {
      st['border-radius'] = radiusCSS(s, g, 'radius');
    }
    if (g.pad != null || g.padMode === 'ind') {
      st['padding'] = padCSS(s, g, 'pad');
    }
    if (g.margin != null || g.marginMode === 'ind') {
      st['margin'] = marginCSS(s, g, 'margin');
    }
    return style(st);
  }

  function imgStyle(s) {
    var g = s.img;
    var filters = { none: 'none', gray: 'grayscale(1)', blur: 'blur(2px) saturate(.9)', zoom: 'none' };
    var st = {
      filter: filters[g.effect] || 'none',
      transform: g.effect === 'zoom' ? 'scale(1.08)' : 'none',
      'object-position': g.align === 'left' ? 'left center' : g.align === 'right' ? 'right center' : 'center'
    };
    if (g.ratio === 'none') st.height = 'auto';
    return style(st);
  }

  /* 图片蒙层：开启后在图片上叠一层黑色半透明遮罩（透明度 0–1） */
  function imgMaskHTML(s) {
    var m = (s.img && s.img.mask) || {};
    if (!m.on) return '';
    var a = Math.max(0, Math.min(1, Number(m.opacity) || 0));
    return '<span class="ed-imgmask" style="background:rgba(8,10,12,' + (Math.round(a * 100) / 100) + ')"></span>';
  }

  /* ---------- 文案块（标题/副标题/简介/按钮） ---------- */
  function btnHTML(s, extra, opts) {
    var b = s.text.button;
    if (!s.show.button || !b.on) return '';
    opts = opts || {};
    var theme = b.theme || 'ghost';
    var lightBg = !isDark(s.container.bgOn ? s.container.bg : '#ffffff');
    // 浅色容器上的描边/白色按钮会看不见，自动换成深色（浮在图片上时跳过）
    if (!opts.onImage && lightBg && (theme === 'ghost' || theme === 'light')) theme = 'dark';
    var cls = 'ed-btn ed-btn--' + theme;
    var ic = b.icon === 'left' ? icon('arrow') : '';
    var icR = b.icon === 'right' ? icon('arrow') : '';
    return '<a class="' + cls + (extra ? ' ' + extra : '') + '" href="' + esc(b.link || '#') + '">' +
      ic + '<span>' + esc(b.text) + '</span>' + icR + '</a>';
  }

  function textBlock(s, opts) {
    var t = s.text;
    var align = s.layout.textAlign;
    var has = (s.show.title && t.title) || (s.show.subtitle && t.subtitle) ||
      (s.show.intro && t.intro) || (s.show.button && t.button.on);
    if (!has) return '';
    var tb = s.layout.textBg || {};
    var bgOn = tb.bgOn != null ? tb.bgOn : tb.on;
    var bgColor = tb.bg || tb.color || 'transparent';
    var st = style({
      'text-align': align,
      'align-items': align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
      background: bgOn ? bgColor : 'transparent',
      'border-radius': (bgOn || tb.borderOn) ? radiusCSS(s, tb, 'radius') : '0',
      padding: (bgOn || tb.borderOn) ? padCSS(s, tb, 'pad') : undefined,
      border: tb.borderOn ? dimVal(s, tb.borderWidth != null ? tb.borderWidth : 1) + ' ' + (tb.borderStyle || 'solid') + ' ' + (tb.border || '#111418') : '0'
    });
    var out = '<div class="ed-card__text is-' + align + '" style="' + st + '">';
    if (s.show.title && t.title) out += '<h3>' + esc(t.title) + '</h3>';
    if (s.show.subtitle && t.subtitle) out += '<p class="ed-sub">' + esc(t.subtitle) + '</p>';
    if (s.show.intro && t.intro) out += '<p class="ed-p">' + esc(t.intro) + '</p>';
    out += btnHTML(s);
    out += '</div>';
    return out;
  }

  /* ---------- 单张图卡（结构4） ---------- */
  function cardHTML(s, item, i, extra) {
    var hideText = s.video.on && s.video.hideText;
    return '<article class="ed-card' + (hideText ? ' ed-captionless' : '') + '" data-idx="' + i + '"' +
      ' style="' + (extra || '') + cardStyle(s) + '">' +
      '<figure class="ed-card__media" style="' + mediaStyle(s) + '">' +
        '<img src="' + esc(item.img) + '" alt="' + esc(s.seo.alt ? s.seo.altText : '') + '"' +
          (s.seo.titleAttr ? ' title="' + esc(s.seo.titleText) + '"' : '') +
          ' style="' + imgStyle(s) + '" loading="lazy" decoding="async">' +
        '<span class="ed-scrim"></span>' +
        (s.video.on && s.video.mask ? '<span class="ed-mask"></span>' : '') +
        imgMaskHTML(s) +
        (s.video.on && s.video.icon ? '<span class="ed-play"><i>' + icon('play') + '</i></span>' : '') +
        (hideText ? '' : textBlock(s, i)) +
      '</figure>' +
    '</article>';
  }

  /* ---------- 结构4：图文卡片列表 ---------- */

  /* 瀑布拼排模板：3 列 × R 行，按真实图片数 1–10 各一套。
     每套都带「跨行大格 + 小格」穿插，保证瀑布错落感；全部无洞（逐格铺满）。 */
  var MASONRY = {
    1:  { r: 2, cells: [[1,1,3,4]] },
    2:  { r: 2, cells: [[1,1,3,3],[1,3,3,4]] },
    3:  { r: 2, cells: [[1,1,2,3],[2,1,3,3],[1,3,3,4]] },
    4:  { r: 3, cells: [[1,1,3,3],[3,1,4,3],[1,3,2,4],[2,3,4,4]] },
    5:  { r: 3, cells: [[1,1,3,2],[1,2,2,3],[2,2,4,3],[1,3,4,4],[3,1,4,2]] },
    6:  { r: 3, cells: [[1,1,3,2],[1,2,2,3],[2,2,3,3],[1,3,3,4],[3,1,4,2],[3,2,4,4]] },
    7:  { r: 3, cells: [[1,1,3,2],[1,2,2,3],[2,2,3,3],[1,3,3,4],[3,1,4,2],[3,2,4,3],[3,3,4,4]] },
    8:  { r: 3, cells: [[1,1,3,2],[1,2,2,3],[2,2,3,3],[1,3,2,4],[2,3,3,4],[3,1,4,2],[3,2,4,3],[3,3,4,4]] },
    9:  { r: 4, cells: [[1,1,3,2],[1,2,2,3],[2,2,3,3],[1,3,3,4],[3,1,4,2],[3,2,4,3],[3,3,5,4],[4,1,5,2],[4,2,5,3]] },
    10: { r: 4, cells: [[1,1,3,2],[1,2,2,3],[2,2,3,3],[1,3,3,4],[3,1,4,2],[3,2,4,3],[3,3,4,4],[4,1,5,2],[4,2,5,3],[4,3,5,4]] }
  };

  /* 主次宫格模板：第 1 格 = 主图大格，其余小格，按数量 1–10 各一套（全部无洞） */
  var BENTO = {
    1:  { r: 1, cells: [[1,1,2,4]] },
    2:  { r: 1, cells: [[1,1,2,3],[1,3,2,4]] },
    3:  { r: 2, cells: [[1,1,3,3],[1,3,2,4],[2,3,3,4]] },
    4:  { r: 3, cells: [[1,1,3,3],[1,3,2,4],[2,3,3,4],[3,1,4,4]] },
    5:  { r: 3, cells: [[1,1,3,3],[1,3,2,4],[2,3,3,4],[3,1,4,2],[3,2,4,4]] },
    6:  { r: 3, cells: [[1,1,3,3],[1,3,2,4],[2,3,3,4],[3,1,4,2],[3,2,4,3],[3,3,4,4]] },
    7:  { r: 4, cells: [[1,1,3,3],[1,3,2,4],[2,3,3,4],[3,1,4,2],[3,2,4,3],[3,3,4,4],[4,1,5,4]] },
    8:  { r: 4, cells: [[1,1,3,3],[1,3,2,4],[2,3,3,4],[3,1,4,2],[3,2,4,3],[3,3,4,4],[4,1,5,3],[4,3,5,4]] },
    9:  { r: 4, cells: [[1,1,3,3],[1,3,2,4],[2,3,3,4],[3,1,4,2],[3,2,4,3],[3,3,4,4],[4,1,5,2],[4,2,5,3],[4,3,5,4]] },
    10: { r: 5, cells: [[1,1,3,3],[1,3,2,4],[2,3,3,4],[3,1,4,2],[3,2,4,3],[3,3,4,4],[4,1,5,2],[4,2,5,3],[4,3,5,4],[5,1,6,4]] }
  };

  /* 主次宫格行高：1/2 张单行更高，3/4 张主图行一致（图1 同尺寸），5+ 恢复标准 */
  function bentoRow(n) {
    if (n === 1) return 'clamp(200px,20vw,300px)';
    if (n === 2) return 'clamp(180px,18vw,270px)';
    if (n === 3) return 'clamp(140px,13vw,190px)';
    return 'clamp(100px,11vw,164px)';
  }

  /* 拼排型布局：按数量取模板渲染格子 */
  function masonryCells(s, items, tpl, rowsClamp) {
    return items.map(function (it, i) {
      var a = tpl.cells[i];
      return '<li class="m4__cell"' +
        ' style="grid-area:' + a.join('/') + ';border-radius:' + radiusCSS(s, s.card, 'radius') + ';' +
          'background:' + (s.img.bgOn ? s.img.bg : '#1b1f25') + '">' +
        '<img src="' + esc(it.img) + '" alt="' + esc(s.seo.alt ? s.seo.altText : '') + '"' +
          ' style="' + imgStyle(s) + ';width:100%;height:100%;object-fit:cover" loading="lazy" decoding="async">' +
        imgMaskHTML(s) +
        (i === 0 ? '<span class="ed-scrim"></span>' + textBlock(s, i) : '') +
      '</li>';
    }).join('');
  }

  function renderM4(s) {
    var items = s.items;
    var cols = s.layout.columns;
    var mode = s.layout.mode; // grid | waterfall | bento
    var body;

    if (mode === 'waterfall' || mode === 'bento') {
      /* 按「图文列表」真实数量取模板（1–10，超出截到 10） */
      var n = Math.min(items.length, 10);
      var tpl = (mode === 'waterfall' ? MASONRY : BENTO)[n] || (mode === 'waterfall' ? MASONRY : BENTO)[10];
      var cls = mode === 'waterfall' ? 'm4 m4--b' : 'm4 m4--d';
      /* 瀑布：1–3 张用高行；主次宫格：1/2/3 张更高，4 张主图行一致 + 图4 底部行更高 */
      var rowsClamp = mode === 'waterfall'
        ? (n <= 3 ? 'clamp(150px,17vw,250px)' : 'clamp(96px,10.6vw,158px)')
        : bentoRow(n);
      var rowsCss = 'repeat(' + tpl.r + ',' + rowsClamp + ')';
      var cells = masonryCells(s, items.slice(0, n), tpl, rowsClamp);
      body = '<div class="' + cls + '">' +
        '<ul class="m4__grid" style="grid-template-columns:repeat(3,minmax(0,1fr));' +
          'grid-template-rows:' + rowsCss + ';gap:' + gapCSS(s) + '">' + cells + '</ul></div>';
    } else {
      var cards = items.map(function (it, i) {
        var one = items.length === 1 ? ' grid-column:1 / -1;' : '';
        return cardHTML(s, it, i, one);
      }).join('');
      var pages = Math.max(1, Math.ceil(items.length / cols));
      var carousel = s.carousel.on && items.length > cols;
      if (carousel) {
        body = '<div style="position:relative;overflow:hidden">' +
          '<div class="ed-track" style="--cols:' + cols + ';--gap-px:' + gapH(s) + ';--gap:' + gapH(s) + ';' +
            'transform:translateX(-' + (s._page % pages) * 100 + '%)">' + cards + '</div>' +
          (s.carousel.arrows
            ? '<div class="ed-arrows"><i>' + icon('arrow', 'ed-flip') + '</i><i>' + icon('arrow') + '</i></div>'
            : '') +
        '</div>';
        if (s.carousel.dots && pages > 1) {
          body += '<div class="ed-dots" style="color:' + (isDark(s.container.bgOn ? s.container.bg : '#0b0b0c') ? '#fff' : '#14161a') + '">';
          for (var p = 0; p < pages; p++) body += '<i class="' + (p === s._page % pages ? 'is-on' : '') + '"></i>';
          body += '</div>';
        }
      } else {
        body = '<div class="ed-list" style="--cols:' + cols + ';gap:' + gapCSS(s) + '">' + cards + '</div>';
      }
    }

    return '<div class="ed-mod" style="' + containerStyle(s) + '">' + body + '</div>';
  }

  /* ---------- 通用头部（结构1 用） ---------- */
  function headerHTML(s) {
    var t = s.text;
    var out = '<div class="ed-head" style="text-align:' + s.layout.textAlign + '">';
    if (s.show.subtitle && t.subtitle) out += '<p class="ed-head__sub">' + esc(t.subtitle) + '</p>';
    if (s.show.title && t.title) out += '<h2>' + esc(t.title) + '</h2>';
    if (s.show.intro && t.intro) out += '<p class="ed-head__p"' +
      (s.layout.textAlign === 'center' ? ' style="margin-inline:auto"' : '') + '>' + esc(t.intro) + '</p>';
    out += btnHTML(s, 'ed-head__btn');
    out += '</div>';
    return out;
  }

  /* ---------- 结构1：中心图 + 左右双排列表 ----------
     画布只渲染模块本身（不带头部文字/按钮）；数量由「列表项」内容决定 */
  function renderM1(s) {
    var cols = Number(s.layout.columns) || (s.layout.dir === 'h' ? 4 : 2);
    var dir = cols >= 4 ? 'h' : 'v';
    var items = s.items;
    function split(arr) {
      if (dir === 'v') {
        var half = Math.ceil(arr.length / 2);
        return [arr.slice(0, half), arr.slice(half)];
      }
      /* 横向：列表项左右并排，阅读顺序左右交替（左 1/3/5…，右 2/4/6…） */
      return [
        arr.filter(function (_, i) { return i % 2 === 0; }),
        arr.filter(function (_, i) { return i % 2 === 1; })
      ];
    }
    var groups = split(items);
    var vert = (window.ED && window.ED.isVert ? window.ED.isVert(s) : (s.layout.imgText === 'tb' || s.layout.imgText === 'bt'));
    /* 竖向：图文对齐 = 图标 + 文字一起左中右（textAlign 跟随 imgAlignX）；横向：文案不动 */
    var textAlign = vert ? (s.layout.imgAlignX || 'center') : (s.layout.textAlign || 'left');
    var taCls = 'm1__ta-' + textAlign;
    var it = s.layout.imgText || 'tb';
    /* 横向布局（lr/rl/inner/outer）：列表项内 图标:文字 宽度比例 */
    var horiz = (window.ED && window.ED.isHoriz ? window.ED.isHoriz(s) : (it === 'lr' || it === 'rl' || it === 'inner' || it === 'outer'));
    var iconFlex = horiz ? 'flex:' + (s.layout.iconRatio || 1) + ' 1 0%;' : '';
    var textFlex = horiz ? 'flex:' + (s.layout.textRatio || 3) + ' 1 0%;' : '';
    var icStyle = iconBoxStyle(s);
    var vertAlignStyle = '';
    if (vert) {
      if (s.layout.imgAlignX === 'left') {
        vertAlignStyle = 'align-self:flex-start !important;margin-left:0 !important;margin-right:auto !important;';
      } else if (s.layout.imgAlignX === 'right') {
        vertAlignStyle = 'align-self:flex-end !important;margin-left:auto !important;margin-right:0 !important;';
      } else {
        vertAlignStyle = 'align-self:center !important;margin-left:auto !important;margin-right:auto !important;';
      }
    }
    var itemAlignStyle = vert
      ? ('display:flex;flex-direction:column;align-items:' + (s.layout.imgAlignX === 'left' ? 'flex-start' : s.layout.imgAlignX === 'right' ? 'flex-end' : 'center') + ';text-align:' + (s.layout.imgAlignX || 'center') + ';')
      : '';
    function list(arr, listStyle) {
      return '<ul class="m1__list" style="' + listStyle + '">' + arr.map(function (it) {
        var badgeStyle = iconFlex ? (iconFlex + ';') : '';
        badgeStyle += icStyle ? (icStyle + ';') : '';
        badgeStyle += vertAlignStyle;
        var badge = '<span class="m1__icon" style="' + badgeStyle + '">' + icon(it.icon || 'sparkle') + '</span>';
        return '<li class="m1__item" style="' + itemAlignStyle + '">' + badge +
          '<div class="m1__text ' + taCls + '" style="' + textFlex + '"><h3>' + esc(it.title) + '</h3><p>' + esc(it.desc) + '</p></div></li>';
      }).join('') + '</ul>';
    }
    /* 图片对齐 = 列表基于容器的对齐：竖向=水平左中右（图文对齐），横向=垂直上中下 */
    var imgAlignCls = vert
      ? 'm1--imgx-' + (s.layout.imgAlignX || 'center')
      : 'm1--imgy-' + (s.layout.imgAlignY || 'center');
    var cls = 'm1 m1--a m1--it-' + it + ' ' + imgAlignCls + ' count-' + items.length + ' ' + (dir === 'h' ? 'is-h' : 'is-v') +
      (dir === 'h' && items.length > 4 ? ' is-h-dense' : '');

    /* 图文比例：主内容（图片） vs 列表项（文字），三栏 fr */
    var mainRatio = s.layout.mainRatio || 6;
    var listRatio = s.layout.listRatio || 6;
    var gapMode = s.layout.gapMode || 'uni';
    var rowGap, columnGap;
    if (gapMode === 'ind') {
      /* 独立：gapX = 行间距（列表项之间），gapY = 列间距（列表↔主图） */
      rowGap = dimVal(s, s.layout.gapX || 0);
      columnGap = dimVal(s, s.layout.gapY || 0);
    } else {
      rowGap = dimVal(s, s.layout.gap || 0);
      columnGap = dimVal(s, s.layout.gap || 0);
    }
    /* 三列同高（stretch），图片列保持 3:4 为基准，列表内容按 valign 对齐 */
    var gridStyle = 'grid-template-columns:minmax(0,' + listRatio + 'fr) minmax(0,' + mainRatio + 'fr) minmax(0,' + listRatio + 'fr);' +
      'column-gap:' + columnGap + ';align-items:stretch';
    /* 行间距：列表项 gap；垂直对齐 = 列表内容基于图片（图片为基准） */
    var valignMap2 = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
    var listStyle = 'gap:' + rowGap + ';justify-content:' + (valignMap2[s.layout.valign] || 'center');

    /* 主图：图片 / 对比图 / 地图（比例统一 3:4） */
    var hero = s.hero || {};
    var heroHTML;
    if (hero.type === 'map') {
      heroHTML = '<div class="m1__map">' +
        '<span class="m1__map-addr">' + esc(hero.address || '未填写地址') + '</span>' +
        '<span class="m1__map-pin"></span>' +
        '<span class="m1__map-zoom">Z' + (hero.zoom || 14) + '</span>' +
      '</div>';
    } else if (hero.type === 'compare') {
      var cmp = hero.compare || {};
      var i1 = cmp.img1 || {}, i2 = cmp.img2 || {};
      var src1 = i1.url || i1.src || '';
      var src2 = i2.url || i2.src || '';
      /* before/after 对比滑块：底层图1 + 上层图2（clip 裁剪）+ 中间拖动条 */
      heroHTML = '<div class="m1__compare" data-cmp>' +
        '<img class="m1__compare-img m1__compare-img--base" src="' + esc(src1) + '" alt="图1">' +
        '<img class="m1__compare-img m1__compare-img--top" src="' + esc(src2) + '" alt="图2">' +
        '<span class="m1__compare-line"></span>' +
        '<span class="m1__compare-handle">' + icon('arrow') + '</span>' +
      '</div>';
    } else {
      var heroSrc = hero.url || hero.img || (items[0] && items[0].img) || '';
      /* 主图框固定 3:4（由 .m1__media 控制），图片 object-fit 填满，设置项不影响框大小 */
      heroHTML = '<img src="' + esc(heroSrc) + '" alt="' + esc(s.seo.alt && s.seo.altText ? s.seo.altText : '主视觉') + '"' +
        ' style="object-fit:cover;width:100%;height:100%">' + imgMaskHTML(s);
    }

    return '<div class="ed-mod" style="' + containerStyle(s) + '">' +
      '<div class="' + cls + '">' +
        '<div class="m1__grid" style="' + gridStyle + '">' +
          '<div class="m1__col m1__col--left">' + list(groups[0], listStyle) + '</div>' +
          '<figure class="m1__media">' + heroHTML + '</figure>' +
          '<div class="m1__col m1__col--right">' + list(groups[1], listStyle) + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ---------- 结构2：文案 + 列表 | 整图 ---------- */
  function renderM2(s) {
    var t = s.text;
    var mode = s.layout.mode === 'grid' ? 'check' : s.layout.mode;
    var icStyle = iconBoxStyle(s);
    var list;
    if (mode === 'check') {
      list = '<ul class="m2__list m2__list--check">' + s.items.slice(0, 6).map(function (it) {
        return '<li class="m2__item"><span class="m2__badge" style="' + icStyle + '">' + icon('checkCircle', 'is-accent') + '</span><span>' + esc(it.title) + '</span></li>';
      }).join('') + '</ul>';
    } else if (mode === 'num') {
      list = '<ul class="m2__list m2__list--num">' + s.items.slice(0, 4).map(function (it, i) {
        return '<li class="m2__item"><span class="m2__num">0' + (i + 1) + '</span>' +
          '<div class="m2__text"><h4>' + esc(it.title) + '</h4><p>' + esc(it.desc) + '</p></div></li>';
      }).join('') + '</ul>';
    } else if (mode === 'stat') {
      list = '<ul class="m2__list m2__list--stat">' + s.items.slice(0, 3).map(function (it) {
        return '<li class="m2__item"><span class="m2__stat">' + esc(it.value || '18 yrs') + '</span>' +
          '<div class="m2__text"><h4>' + esc(it.title) + '</h4><p>' + esc(it.desc) + '</p></div></li>';
      }).join('') + '</ul>';
    } else {
      list = '<ul class="m2__list m2__list--icon">' + s.items.slice(0, 4).map(function (it) {
        return '<li class="m2__item"><span class="m2__badge" style="' + icStyle + '">' + icon(it.icon || 'sparkle') + '</span>' +
          '<div class="m2__text"><h4>' + esc(it.title) + '</h4><p>' + esc(it.desc) + '</p></div></li>';
      }).join('') + '</ul>';
    }
    var reversed = s.layout.reverse ? ' is-reversed' : '';

    /* 主图：图片 / 对比图 / 地图（支持选择图片、对比图、地图，与双排列表一致） */
    var hero = s.hero || {};
    var heroHTML;
    if (hero.type === 'map') {
      heroHTML = '<div class="m1__map m2__media">' +
        '<span class="m1__map-addr">' + esc(hero.address || '未填写地址') + '</span>' +
        '<span class="m1__map-pin"></span>' +
        '<span class="m1__map-zoom">Z' + (hero.zoom || 14) + '</span>' +
      '</div>';
    } else if (hero.type === 'compare') {
      var cmp = hero.compare || {};
      var i1 = cmp.img1 || {}, i2 = cmp.img2 || {};
      var src1 = i1.url || i1.src || (s.items[0] && s.items[0].img) || '';
      var src2 = i2.url || i2.src || (s.items[1] && s.items[1].img) || '';
      heroHTML = '<div class="m1__compare m2__media" data-cmp>' +
        '<img class="m1__compare-img m1__compare-img--base" src="' + esc(src1) + '" alt="图1">' +
        '<img class="m1__compare-img m1__compare-img--top" src="' + esc(src2) + '" alt="图2">' +
        '<span class="m1__compare-line"></span>' +
        '<span class="m1__compare-handle">' + icon('arrow') + '</span>' +
      '</div>';
    } else {
      var img = hero.image || {};
      var src = hero.url || hero.img || img.url || img.src || (s.items[0] && s.items[0].img) || '';
      heroHTML = '<figure class="m2__media">' +
        '<img src="' + esc(src) + '" alt="' + esc(s.seo.alt ? s.seo.altText : '') + '">' +
        imgMaskHTML(s) +
      '</figure>';
    }

    return '<div class="ed-mod" style="' + containerStyle(s) + '">' +
      '<div class="m2 m2--list-' + mode + ' is-r45' + reversed + '">' +
        '<div class="m2__grid">' +
          '<div class="m2__body">' +
            (s.show.subtitle && t.subtitle ? '<p class="m2__eyebrow">' + esc(t.subtitle) + '</p>' : '') +
            (s.show.title && t.title ? '<h3 class="m2__title">' + esc(t.title) + '</h3>' : '') +
            (s.show.intro && t.intro ? '<p class="m2__lede">' + esc(t.intro) + '</p>' : '') +
            list + btnHTML(s, 'm2__cta') +
          '</div>' +
          heroHTML +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ---------- 结构3：左文 + 左列表 | 右列表 ----------
     列 1 = 左列表（apps / chips / steps / compact），列 2 = 右列表（cards / rows / tiles） */
  function renderM3(s) {
    var t = s.text;
    var mode = s.layout.mode === 'grid' ? 'a' : s.layout.mode;
    var split = s.layout.split || 8;
    var col1 = s.items.slice(0, split);
    var col2 = s.items.slice(split);
    var icStyle = iconBoxStyle(s);
    var apps = '<ul class="m3__apps">' + col1.slice(0, 8).map(function (it) {
      return '<li class="m3__app"><span class="m3__icon" style="' + icStyle + '">' + icon(it.icon || 'sparkle') + '</span><span>' + esc(it.title) + '</span></li>';
    }).join('') + '</ul>';
    var cards = '<ul class="m3__cards">' + col2.slice(0, 2).map(function (it) {
      return '<li class="m3__card"><figure><img src="' + esc(it.img) + '" alt="">' + imgMaskHTML(s) + '</figure>' +
        '<h4>' + esc(it.title) + '</h4><p>' + esc(it.desc) + '</p></li>';
    }).join('') + '</ul>';
    var rows = '<ul class="m3__rows">' + col2.slice(0, 3).map(function (it) {
      return '<li class="m3__row"><figure><img src="' + esc(it.img) + '" alt="">' + imgMaskHTML(s) + '</figure>' +
        '<div><h4>' + esc(it.title) + '</h4><p>' + esc(it.desc) + '</p></div></li>';
    }).join('') + '</ul>';
    var tiles = '<ul class="m3__tiles">' + col2.slice(0, 4).map(function (it) {
      return '<li class="m3__tile"><img src="' + esc(it.img) + '" alt="">' + imgMaskHTML(s) + '<span>' + esc(it.title) + '</span></li>';
    }).join('') + '</ul>';

    var intro = '<div class="m3__intro">' +
      (s.show.subtitle && t.subtitle ? '<p class="m3__eyebrow">' + esc(t.subtitle) + '</p>' : '') +
      (s.show.title && t.title ? '<h3 class="m3__title">' + esc(t.title) + '</h3>' : '') +
      (s.show.intro && t.intro ? '<p class="m3__para">' + esc(t.intro) + '</p>' : '') +
      '</div>';

    var media = (col1[0] || s.items[0]);
    var main = '<div class="m3__main">' + intro + apps + btnHTML(s) + '</div>';
    var inner;
    if (mode === 'b') {
      inner = '<div class="m3__grid">' + main +
        '<figure class="m3__media"><img src="' + esc(media.img) + '" alt="">' + imgMaskHTML(s) + '</figure>' +
        '<div class="m3__aside"><ul class="m3__compact">' + col1.slice(0, 4).map(function (it) {
          return '<li>' + icon(it.icon || 'sparkle') + '<div><h4>' + esc(it.title) + '</h4><p>' + esc(it.desc) + '</p></div></li>';
        }).join('') + '</ul></div></div>';
    } else if (mode === 'c') {
      inner = '<div class="m3__grid">' +
        '<div class="m3__main">' + intro + '<ul class="m3__chips">' + col1.slice(0, 8).map(function (it) {
          return '<li>' + icon(it.icon || 'sparkle') + esc(it.title) + '</li>';
        }).join('') + '</ul>' + btnHTML(s) + '</div>' +
        '<div class="m3__aside">' + rows + '</div></div>';
    } else if (mode === 'd') {
      inner = '<div class="m3__grid">' +
        '<div class="m3__main">' + intro + '<ol class="m3__steps">' + col1.slice(0, 4).map(function (it, i) {
          return '<li><span class="m3__step-no">0' + (i + 1) + '</span><div><h4>' + esc(it.title) +
            '</h4><p>' + esc(it.desc) + '</p></div></li>';
        }).join('') + '</ol>' + btnHTML(s) + '</div>' +
        '<div class="m3__aside">' + tiles + '</div></div>';
    } else {
      inner = '<div class="m3__grid">' + main + '<div class="m3__aside">' + cards + '</div></div>';
    }
    return '<div class="ed-mod" style="' + containerStyle(s) + '"><div class="m3 m3--' + mode + '">' + inner + '</div></div>';
  }

  /* ---------- 结构5：轮播列表 ----------
     整幅背景海报 + 内容容器（支持容器对齐、文案对齐、宽度与列表间距） */
  function renderM5(s) {
    var slides = s.items;
    var n = Math.max(1, slides.length);
    var page = Math.max(0, Math.min(s._page || 0, n - 1));

    var grads = (window.DATA && window.DATA.m5Gradients) || [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23e8edf5"/><stop offset="50%" stop-color="%23eff3f8"/><stop offset="100%" stop-color="%23f6f3eb"/></linearGradient></defs><rect width="1600" height="1000" fill="url(%23g1)"/></svg>',
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f7f2ed"/><stop offset="50%" stop-color="%23f2eae1"/><stop offset="100%" stop-color="%23ebe5dc"/></linearGradient></defs><rect width="1600" height="1000" fill="url(%23g2)"/></svg>',
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23edf4ef"/><stop offset="50%" stop-color="%23e6ede8"/><stop offset="100%" stop-color="%23dde8df"/></linearGradient></defs><rect width="1600" height="1000" fill="url(%23g3)"/></svg>'
    ];

    var inner = slides.map(function (sl, i) {
      /* 支持单页独立排版：若该页开启 customLayout 则使用其私有 layout，否则继承全局 layout */
      var l = (sl.customLayout && sl.layout) ? sl.layout : s.layout;

      var hAlign = l.align || 'start';
      var vAlign = l.valign || 'center';
      var textAlign = l.textAlign || 'left';
      var widthPct = l.contentWidth || l.width || 54;
      var gapVal = dimVal(s, l.gap != null ? l.gap : 14);

      var listCols = Number(l.listColumns) || 3;
      var listWidth = l.listWidth != null ? l.listWidth : 100;
      var listAlign = l.listAlign || 'start';
      var listItemAlign = l.listItemAlign || 'left';
      var listGap = dimVal(s, l.listGap != null ? l.listGap : 12);

      /* 轮播列表主文案背景 */
      var tb = l.textBg || {};
      var tbStyle = '';
      if (tb.bgOn) tbStyle += 'background-color:' + esc(tb.bg || '#ffffffcc') + ';';
      if (tb.borderOn) {
        tbStyle += 'border:' + dimVal(s, tb.borderWidth != null ? tb.borderWidth : 1) + ' ' +
          (tb.borderStyle || 'solid') + ' ' + esc(tb.border || '#111418') + ';';
      }
      if (tb.radius != null || tb.radiusTl != null) tbStyle += 'border-radius:' + radiusCSS(s, tb, 'radius') + ';';
      if (tb.pad != null || tb.padT != null) tbStyle += 'padding:' + padCSS(s, tb, 'pad') + ';';

      var followContent = tb.followContent !== false;

      /* 内部列表项文案背景 */
      var ltb = l.listTextBg || {};
      var ltbStyle = '';
      if (ltb.bgOn) ltbStyle += 'background-color:' + esc(ltb.bg || '#ffffff') + ';';
      else ltbStyle += 'background-color:transparent;';
      if (ltb.borderOn) {
        ltbStyle += 'border:' + dimVal(s, ltb.borderWidth != null ? ltb.borderWidth : 1) + ' ' +
          (ltb.borderStyle || 'solid') + ' ' + esc(ltb.border || 'rgba(0,0,0,0.08)') + ';';
      } else {
        ltbStyle += 'border:none;';
      }
      if (ltb.radius != null || ltb.radiusTl != null) ltbStyle += 'border-radius:' + radiusCSS(s, ltb, 'radius') + ';';
      if (ltb.pad != null || ltb.padT != null) ltbStyle += 'padding:' + padCSS(s, ltb, 'pad') + ';';

      var icStyle = iconBoxStyle(s);
      function m5Item(it, j) {
        var title = '<div class="m5__text"><h4>' + esc(it.title) + '</h4></div>';
        return '<li class="m5__item" data-sub="' + j + '" style="' + ltbStyle + '"><span class="m5__icon" style="' + icStyle + '">' + icon(it.icon || 'sparkle') +
          '</span>' + title + '</li>';
      }

      var bodyCls = 'm5__body is-align-' + hAlign + ' is-valign-' + vAlign + ' is-text-' + textAlign +
        (followContent ? ' is-follow-content' : ' is-free-content');
      var bodyStyle = '--m5-w:' + widthPct + '%;--m5-gap:' + gapVal + ';gap:' + gapVal + ';' + tbStyle;

      var list = (sl.list1 || []).slice(0, 8);
      var imgSrc = sl.img;
      if (!imgSrc || imgSrc.indexOf('unsplash.com') !== -1) {
        imgSrc = grads[i % grads.length];
      }
      var listWrap = '<div class="m5__list-wrap is-list-align-' + listAlign + '" style="--m5-list-w:' + listWidth + '%;">' +
        '<ul class="m5__list is-item-' + listItemAlign + '" style="--m5-cols:' + listCols + ';gap:' + listGap + '">' +
          list.map(function (it, j) { return m5Item(it, j); }).join('') +
        '</ul>' +
      '</div>';

      var body = '<div class="' + bodyCls + '" style="' + bodyStyle + '">' +
        (s.show.subtitle && sl.subtitle ? '<p class="m5__eyebrow">' + esc(sl.subtitle) + '</p>' : '') +
        (s.show.title && sl.title ? '<h3 class="m5__title">' + esc(sl.title) + '</h3>' : '') +
        (s.show.intro && sl.intro ? '<p class="m5__lede">' + esc(sl.intro) + '</p>' : '') +
        listWrap +
        btnHTML(s, 'm5__cta', { onImage: true }) +
      '</div>';
      return '<li class="m5__slide" data-idx="' + i + '">' +
        '<div class="m5__frame">' +
          '<figure class="m5__media">' +
            '<img src="' + esc(imgSrc) + '" alt="' + esc(s.seo.alt && s.seo.altText ? s.seo.altText : '') + '"' +
              (s.seo.titleAttr ? ' title="' + esc(s.seo.titleText) + '"' : '') +
              ' style="' + imgStyle(s) + ';height:100%" loading="lazy" decoding="async">' +
            imgMaskHTML(s) +
          '</figure>' +
          body +
        '</div>' +
      '</li>';
    }).join('');

    var track = '<div class="m5__viewport"><div class="m5__track"' +
      ' style="transform:translateX(-' + (page * 100) + '%)">' + inner + '</div></div>';
    var arrows = s.carousel.arrows
      ? '<i class="m5__arrow m5__arrow--prev" data-m5="prev">' + icon('arrow', 'ed-flip') + '</i>' +
        '<i class="m5__arrow m5__arrow--next" data-m5="next">' + icon('arrow') + '</i>'
      : '';
    var dots = s.carousel.dots
      ? '<div class="m5__dots">' + slides.map(function (_, p) {
          return '<i class="' + (p === page ? 'is-on' : '') + '" data-m5="goto" data-m5-goto="' + p + '"></i>';
        }).join('') + '</div>'
      : '';

    return '<div class="ed-mod" style="' + containerStyle(s) + '">' +
      '<div class="m5 m5--icon">' + track + arrows + dots + '</div>' +
    '</div>';
  }

  /* ---------- 对外 ---------- */
  var LABELS = { m4: '复合列表', m1: '双排列表', m2: '单排列表', m3: '多排列表', m5: '轮播列表' };
  var ICONS = { m4: 'grid', m1: 'layers', m2: 'image', m3: 'list', m5: 'carousel' };

  window.EdCanvas = {
    LABELS: LABELS,
    render: function (s) {
      var inner;
      if (s.structure === 'm1') inner = renderM1(s);
      else if (s.structure === 'm2') inner = renderM2(s);
      else if (s.structure === 'm3') inner = renderM3(s);
      else if (s.structure === 'm5') inner = renderM5(s);
      else inner = renderM4(s);
      return '<div class="ed-select" style="width:' + s.layout.width + '%">' +
        '<span class="ed-tag">' + icon(ICONS[s.structure] || 'grid') + LABELS[s.structure] + '</span>' +
        inner +
      '</div>';
    }
  };
})();
