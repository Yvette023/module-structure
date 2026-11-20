/* =========================================================
   editor.js — 装修编辑页：状态 / 设置面板 / 实时联动
   UI 结构对齐后台截图：图文列表 → 视频 → 文本设置 → 按钮设置
   → 链接 → 更多内容设置（布局/背景/图片/视频/轮播/SEO/显示）
   ========================================================= */
(function () {
  'use strict';

  var D = window.DATA;
  var icon = window.icon;
  var Canvas = window.EdCanvas;

  var STORAGE_KEY = 'module-editor-v1';

  /* ================= 结构基础信息 ================= */
  var STRUCTURES = [
    { id: 'm5', name: '轮播列表' },
    { id: 'm4', name: '复合列表' },
    { id: 'm1', name: '双排列表' },
    { id: 'm2', name: '单排列表' },
    { id: 'm3', name: '多排列表' }
  ];

  var MODES = {
    m5: { label: '列表样式', options: [
      { v: 'icon', l: '图标列表' },
      { v: 'num', l: '编号列表' },
      { v: 'check', l: '勾选列表' },
      { v: 'row', l: '图文行' }
    ], def: 'icon' },
    m4: { label: '列表布局', options: [
      { v: 'grid', l: '网格排布' },
      { v: 'waterfall', l: '瀑布拼排' },
      { v: 'bento', l: '主次宫格' }
    ], def: 'grid' },
    m1: { label: '列表布局', options: [
      { v: 'a', l: '双列均布' },
      { v: 'b', l: '错位偏移' },
      { v: 'c', l: '紧凑内联' },
      { v: 'd', l: '编号序号' }
    ], def: 'a' },
    m2: { label: '列表布局', options: [
      { v: 'check', l: '勾选网格' },
      { v: 'icon', l: '图标列表' },
      { v: 'num', l: '编号步骤' },
      { v: 'stat', l: '数据行' }
    ], def: 'check' },
    m3: { label: '列表布局', options: [
      { v: 'a', l: '右侧大图卡' },
      { v: 'b', l: '三段式中图' },
      { v: 'c', l: '缩略图文行' },
      { v: 'd', l: '图片宫格' }
    ], def: 'a' }
  };

  /* ================= 默认状态 ================= */
  function defaults(structure) {
    var m4 = structure === 'm4' || !structure;
    var base = {
      structure: structure || 'm4',
      unit: 'px',
      items: [],
      text: {
        title: 'Successful Cases',
        subtitle: '',
        intro: 'We have cooperated with 200 companies from various industries.',
        button: { on: true, text: 'Read More', icon: 'none', theme: 'ghost', link: '' }
      },
      show: { title: true, subtitle: false, intro: true, button: true },
      layout: {
        mode: MODES[structure || 'm4'].def,
        columns: 2,
        count: 6,
        dir: 'v',
        imgText: 'tb',
        imgAlignX: 'center',
        imgAlignY: 'center',
        valign: 'center',
        mainRatio: 6,
        listRatio: 6,
        iconRatio: 1,
        textRatio: 3,
        split: 8,
        align: 'center',
        textAlign: 'left',
        reverse: false,
        width: 100,
        gap: 40, gapMode: 'uni', gapX: 40, gapY: 40,
        textBg: {
          on: false, color: '#000000b3',
          radius: 8, radiusMode: 'uni', radiusTl: 8, radiusTr: 8, radiusBr: 8, radiusBl: 8,
          pad: 16, padMode: 'uni', padT: 16, padR: 16, padB: 16, padL: 16
        }
      },
      card: {
        bgOn: false, bg: '#14171c',
        borderOn: false, border: '#2a2f38', borderWidth: 1,
        radius: 0, radiusMode: 'uni', radiusTl: 0, radiusTr: 0, radiusBr: 0, radiusBl: 0,
        pad: 0, padMode: 'uni', padT: 0, padR: 0, padB: 0, padL: 0,
        shadow: { on: false, x: 0, y: 12, blur: 30, spread: -14 }
      },
      container: {
        bgOn: true, bg: m4 ? '#0b0b0c' : '#ffffff',
        borderOn: false, border: '#1f2228', borderWidth: 1,
        radius: 0, radiusMode: 'uni', radiusTl: 0, radiusTr: 0, radiusBr: 0, radiusBl: 0,
        pad: 40, padMode: 'uni', padT: 40, padR: 40, padB: 40, padL: 40,
        shadow: { on: false, x: 0, y: 20, blur: 50, spread: -24 }
      },
      img: {
        ratio: '3:4', effect: 'none', align: 'center',
        radius: 0, radiusMode: 'uni', radiusTl: 0, radiusTr: 0, radiusBr: 0, radiusBl: 0,
        pad: 0, padMode: 'uni', padT: 0, padR: 0, padB: 0, padL: 0,
        bgOn: false, bg: '#22262e', borderOn: false, border: '#2a2f38',
        /* 蒙层：开启后在图片上叠一层黑色半透明遮罩，透明度 0–1 */
        mask: { on: false, opacity: 0.3 }
      },
      video: { on: false, ratio: '无', playMode: '点击播放', loop: false, muted: false, autoplay: false, icon: true, controls: false, hideText: false, mask: true },
      carousel: { on: false, loop: true, arrows: false, dots: true, interval: 5000 },
      seo: { alt: true, altText: 'Successful Cases', titleAttr: true, titleText: 'Successful Cases' },
      motion: { type: 'none', duration: 600, delay: 0 },
      /* 主图（结构1 中间图）：图片 / 地图 / 对比图 */
      hero: {
        type: 'image',
        img: D.m1.media,
        url: '',
        address: 'https://j.map.baidu.com/fb/Xsx',
        zoom: 14,
        w: 100,
        h: 600,
        compare: {
          active: 1,
          img1: { src: D.m1.media, url: '', ratio: '3:4', effect: 'none' },
          img2: { src: D.m4.gallery[1].img, url: '', ratio: '3:4', effect: 'none' }
        }
      },
      preset: '',
      _page: 0
    };
    if (structure === 'm5') {
      base.carousel.on = true;
      base.carousel.arrows = true;
      base.carousel.dots = true;
      base.carousel.auto = false;
      base.layout.position = 'left';
      base.layout.gap = 12;
      base.container.pad = 0; /* 整幅背景图铺满组件，不做内边距 */
      base.container.padMode = 'uni';
    }
    return base;
  }

  var VALUES = ['18 yrs', '42', '4.9'];

  function seedItems(structure, keep) {
    var imgs = D.m4.gallery.map(function (g) { return g.img; });
    if (structure === 'm4') {
      var t = 'Successful Cases';
      return [
        { img: imgs[0], title: t, desc: '', icon: 'grid' },
        { img: imgs[1], title: t, desc: '', icon: 'grid' }
      ];
    }
    if (structure === 'm5') {
      /* 轮播页：每页 = 一张整幅背景图 + 标题文案 + 一组列表（列1，默认 3 页） */
      return D.m5.slides.slice(0, 3).map(function (sl) {
        return {
          img: sl.img,
          title: sl.title,
          subtitle: sl.eyebrow,
          intro: sl.lede,
          list1: sl.list1.map(function (it, i) {
            return { img: imgs[i % imgs.length], icon: it.icon, title: it.title };
          })
        };
      });
    }
    if (structure === 'm3') {
      /* 列 1 = 8 项（左列表），列 2 = 4 项（右列表） */
      var out = [];
      for (var i = 0; i < 12; i++) {
        var p = D.m3.applications[i % D.m3.applications.length];
        out.push({
          img: imgs[i % imgs.length],
          title: p.title,
          desc: p.desc || '',
          icon: p.icon || 'sparkle',
          value: VALUES[i % VALUES.length]
        });
      }
      return out;
    }
    var pool = structure === 'm2' ? D.m2.items : D.m1.items;
    var n = 6;
    return pool.slice(0, n).map(function (p, i) {
      return {
        img: imgs[i % imgs.length],
        title: p.title,
        desc: p.desc || '',
        icon: p.icon || 'sparkle',
        value: VALUES[i % VALUES.length]
      };
    });
  }

  /* ================= 状态 ================= */
  var state = load() || init('m4');
  var ui = { tab: 'design', open: { hero: true, items: true, video: false, text: false, button: false, link: false, more: true }, more: 'layout', sel: 0, col: 1, m1tab: 'hero', sub: 0, m5tab: 'slides' };

  function init(structure) {
    var s = defaults(structure);
    s.items = seedItems(structure);
    return s;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !s.structure || !s.items || !s.items.length) return null;
      var base = defaults(s.structure);
      return deepMerge(base, s);
    } catch (e) { return null; }
  }
  function deepMerge(a, b) {
    Object.keys(b || {}).forEach(function (k) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') {
        deepMerge(a[k], b[k]);
      } else if (b[k] !== undefined) {
        a[k] = b[k];
      }
    });
    return a;
  }
  function save() {
    try {
      var copy = JSON.parse(JSON.stringify(state));
      delete copy._page;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
    } catch (e) {}
  }

  /* ================= 路径读写 ================= */
  function getPath(p) {
    return p.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, state);
  }
  function setPath(p, v) {
    var keys = p.split('.');
    var last = keys.pop();
    var obj = keys.reduce(function (o, k) { return o[k]; }, state);
    obj[last] = v;
  }

  /* ================= 布局判定 Helper ================= */
  function isVert(s)  { return s.layout.imgText === 'tb' || s.layout.imgText === 'bt'; }
  function isHoriz(s) { return !isVert(s); }

  /* ================= 控件片段 ================= */
  function esc(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function label(text, opts) {
    opts = opts || {};
    var eye = '';
    if (opts.eye) {
      eye = '<button class="ed-ibtn" data-act="toggle" data-bind="' + opts.eye + '"' +
        ' style="width:20px;height:20px" title="显示/隐藏">' +
        icon(getPath(opts.eye) ? 'eye' : 'eyeOff') + '</button>';
    }
    return '<span class="flabel">' + text + eye + '</span>';
  }

  function row(inner, cls) {
    return '<div class="frow' + (cls ? ' ' + cls : '') + '">' + inner + '</div>';
  }

  function seg(bind, value, options, cls) {
    var btns = options.map(function (o) {
      var on = String(o.v) === String(value);
      return '<button type="button" data-act="seg" data-bind="' + bind + '" data-value="' + o.v + '"' +
        (on ? ' class="is-on"' : '') + '>' + (o.icon ? icon(o.icon) : o.l) + '</button>';
    }).join('');
    return '<div class="fseg' + (cls ? ' ' + cls : '') + '">' + btns + '</div>';
  }

  function sw(bind, on) {
    return '<button type="button" class="fsw' + (on ? ' is-on' : '') + '" data-act="toggle" data-bind="' + bind + '"' +
      ' role="switch" aria-checked="' + (on ? 'true' : 'false') + '"></button>';
  }

  function inp(bind, value, placeholder) {
    return '<input class="finput" data-bind="' + bind + '" value="' + esc(value) + '"' +
      ' placeholder="' + esc(placeholder || '') + '">';
  }

  function area(bind, value, placeholder) {
    return '<textarea class="ftext" data-bind="' + bind + '" placeholder="' + esc(placeholder || '') + '">' +
      esc(value) + '</textarea>';
  }

  /* ---- 单位（px/rem 全局切换）+ 数值换算 ---- */
  var REM = 16;
  function toDisplay(v) {
    var n = Number(v) || 0;
    return state.unit === 'rem' ? Math.round((n / REM) * 100) / 100 : n;
  }
  function fromDisplay(v) {
    var n = Number(v) || 0;
    return state.unit === 'rem' ? n * REM : n;
  }
  function unitSelect() {
    var cur = state.unit || 'px';
    return '<select class="funit" data-bind="unit" title="单位">' +
      '<option value="px"' + (cur === 'px' ? ' selected' : '') + '>px</option>' +
      '<option value="rem"' + (cur === 'rem' ? ' selected' : '') + '>rem</option>' +
    '</select>';
  }

  function num(bind, value, unit, min, max, step) {
    var display = toDisplay(value);
    return '<span class="fnum">' +
      '<input type="number" data-bind="' + bind + '" data-px="1" value="' + esc(display) + '"' +
      (min != null ? ' min="' + toDisplay(min) + '"' : '') +
      (max != null ? ' max="' + toDisplay(max) + '"' : '') +
      ' step="' + (state.unit === 'rem' ? 0.25 : 1) + '">' +
    '</span>' + unitSelect();
  }

  /* 单个尺寸数字（纯输入框，无角标） */
  function dimNum(bind, value, min, max) {
    var display = toDisplay(value);
    return '<span class="dim-num"><span class="fnum"><input type="number" data-bind="' + bind + '" data-px="1" value="' + esc(display) + '"' +
      (min != null ? ' min="' + toDisplay(min) + '"' : '') +
      (max != null ? ' max="' + toDisplay(max) + '"' : '') +
      ' step="' + (state.unit === 'rem' ? 0.25 : 1) + '"></span></span>';
  }

  /* 尺寸控件：标题在上；下方一行 = [统一|独立] + 输入框(1个/2个/4个) + 单位下拉
     type: box(内边距·4边) / corner(圆角·4角) / gap(间距·2值) */
  function dimCtl(opts) {
    var mode = getPath(opts.modeBind) || 'uni';
    var tabs = '<span class="dim-tabs">' +
      '<button type="button" class="' + (mode === 'uni' ? 'is-on' : '') + '" data-act="dim-mode" data-bind="' + opts.modeBind + '" data-value="uni">统一</button>' +
      '<button type="button" class="' + (mode === 'ind' ? 'is-on' : '') + '" data-act="dim-mode" data-bind="' + opts.modeBind + '" data-value="ind">独立</button>' +
    '</span>';

    var vals;
    if (opts.type === 'gap') {
      vals = mode === 'ind'
        ? '<span class="dim-vals dim-vals--2">' +
            dimNum(opts.field + 'X', getPath(opts.field + 'X'), opts.min, opts.max) +
            dimNum(opts.field + 'Y', getPath(opts.field + 'Y'), opts.min, opts.max) +
          '</span>'
        : dimNum(opts.field, getPath(opts.field), opts.min, opts.max);
    } else {
      var sides = opts.type === 'box' ? ['T', 'R', 'B', 'L'] : ['Tl', 'Tr', 'Br', 'Bl'];
      vals = mode === 'ind'
        ? '<span class="dim-vals dim-vals--4">' + sides.map(function (sfx) {
            return dimNum(opts.field + sfx, getPath(opts.field + sfx), opts.min, opts.max);
          }).join('') + '</span>'
        : dimNum(opts.field, getPath(opts.field), opts.min, opts.max);
    }

    return '<div class="dim">' +
      '<div class="dim__title">' + opts.label + '</div>' +
      '<div class="dim__row">' + tabs + vals + unitSelect() + '</div>' +
    '</div>';
  }

  function color(bind, value, withAlpha) {
    var hex = String(value || '#000000');
    var six = '#' + hex.replace('#', '').slice(0, 6);
    return '<span class="fcolor">' +
      '<input type="color" data-bind="' + bind + '" data-kind="color" value="' + six + '">' +
      '<input type="text" data-bind="' + bind + '" data-kind="hex" value="' + esc(hex) + '">' +
    '</span>';
  }

  function select(bind, value, options) {
    return '<select class="finput" data-bind="' + bind + '" style="flex:1">' + options.map(function (o) {
      return '<option value="' + o.v + '"' + (String(o.v) === String(value) ? ' selected' : '') + '>' + o.l + '</option>';
    }).join('') + '</select>';
  }

  function range(bind, value, min, max, step, unit) {
    return '<span class="frange">' +
      '<input type="range" data-bind="' + bind + '" data-kind="range" min="' + min + '" max="' + max + '"' +
      ' step="' + step + '" value="' + esc(value) + '">' +
      '<span class="fnum" style="height:24px;padding:0 6px"><input type="number" data-bind="' + bind + '"' +
      ' value="' + esc(value) + '" min="' + min + '" max="' + max + '" step="' + step + '"' +
      ' style="width:38px">' + (unit ? '<span>' + unit + '</span>' : '') + '</span>' +
    '</span>';
  }

  function shadowCtl(prefix) {
    var sh = getPath(prefix);
    return row(label('投影') + sw(prefix + '.on', sh.on)) +
      '<div class="fshadow">' +
        num(prefix + '.x', sh.x) + num(prefix + '.y', sh.y) +
        num(prefix + '.blur', sh.blur) + num(prefix + '.spread', sh.spread) +
      '</div>' +
      '<div class="fshadow__cap"><span>X</span><span>Y</span><span>模糊</span><span>扩散</span></div>';
  }

  /* ================= 面板：设计 tab ================= */
  function sec(id, title, body, opts) {
    opts = opts || {};
    var open = ui.open[id];
    return '<section class="sec' + (open ? ' is-open' : '') + '" data-sec="' + id + '">' +
      '<button class="sec__head" data-act="sec" data-sec="' + id + '">' +
        '<span>' + title + '</span>' + icon('chevron') +
      '</button>' +
      '<div class="sec__body">' + body + '</div>' +
    '</section>';
  }

  /* 结构1：顶部「主图 / 列表」切换 Tab（主图 tab 内 = 图片 + 地图） */
  function m1TabHTML() {
    var tab = ui.m1tab || 'hero';
    return '<div class="ed-coltab">' +
      '<button type="button" data-act="m1-tab" data-value="hero"' + (tab === 'hero' ? ' class="is-on"' : '') + '>主内容</button>' +
      '<button type="button" data-act="m1-tab" data-value="list"' + (tab === 'list' ? ' class="is-on"' : '') + '>列表</button>' +
    '</div>';
  }

  /* 结构1：中间主图（图片 + 地图同在此 tab，用「显示类型」选择器切换） */
  function heroSection() {
    var h = state.hero || {};
    var type = h.type || 'image';
    var body = row(label('显示类型')) + select('hero.type', type, [
      { v: 'image', l: '图片' },
      { v: 'compare', l: '对比图' },
      { v: 'map', l: '地图' }
    ]);

    if (type === 'compare') {
      var cmp = h.compare || {};
      var act = cmp.active || 1;
      var cur = cmp['img' + act] || {};
      var src = cur.url || cur.src || '';
      body += '<div class="ed-coltab">' +
        '<button type="button" data-act="cmp-tab" data-value="1"' + (act === 1 ? ' class="is-on"' : '') + '>图 1</button>' +
        '<button type="button" data-act="cmp-tab" data-value="2"' + (act === 2 ? ' class="is-on"' : '') + '>图 2</button>' +
      '</div>';
      body += '<button type="button" class="hero-thumb" data-act="hero-modal" title="替换图片">' +
          '<img src="' + esc(src) + '" alt="">' +
          '<span class="hero-thumb__hint">替换图片</span>' +
        '</button>';
      body += imgPanel({ main: true, bind: 'hero.compare.img' + act });
      body += heroStyleSection();
      body += heroLinkSection();
    } else if (type === 'map') {
      body += '<div class="hero-map-block">' +
          '<div class="hero-preview hero-preview--map">' +
            '<span class="hero-preview__pin"></span>' +
            '<span class="hero-preview__addr">' + esc(h.address || '未填写地址') + '</span>' +
          '</div>' +
          '<div class="map-size">' +
            '<div class="map-size__title">地图尺寸</div>' +
            '<div class="map-size__row">' +
              '<span class="map-size__item"><b>W</b><input type="number" data-bind="hero.w" value="' + esc(h.w || 100) + '"><span class="map-size__unit">%</span></span>' +
              '<span class="map-size__item"><b>H</b><input type="number" data-bind="hero.h" value="' + esc(h.h || 600) + '"><span class="map-size__unit">px</span></span>' +
            '</div>' +
          '</div>' +
          '<div class="map-addr">' +
            '<div class="map-addr__title">地图地址 <span class="map-addr__num">①</span></div>' +
            '<input class="finput" data-bind="hero.address" value="' + esc(h.address || 'https://j.map.baidu.com/fb/Xsx') + '" placeholder="地图地址">' +
          '</div>' +
        '</div>';
      body += heroStyleSection();
    } else {
      /* 图片预览（hover 显示「替换图片」按钮），下方再复制「图片风格」设置项 */
      var src = h.url || h.img || '';
      body += '<button type="button" class="hero-thumb" data-act="hero-modal" title="替换图片">' +
          '<img src="' + esc(src) + '" alt="">' +
          '<span class="hero-thumb__hint">替换图片</span>' +
        '</button>';
      body += imgPanel({ main: true });
      body += heroStyleSection();
      body += heroLinkSection();
    }
    return body;
  }

  /* 主图弹层：图库 + 外链（支持对比图，操作当前激活的图） */
  function heroImgTarget() {
    var h = state.hero || {};
    if (h.type === 'compare') {
      var act = (h.compare && h.compare.active) || 1;
      return { srcPath: 'hero.compare.img' + act + '.src', urlPath: 'hero.compare.img' + act + '.url', obj: h.compare['img' + act] };
    }
    return { srcPath: 'hero.img', urlPath: 'hero.url', obj: h };
  }
  function renderHeroModal() {
    var t = heroImgTarget();
    var h = t.obj || {};
    var gallery = document.getElementById('heroGallery');
    if (gallery) {
      gallery.innerHTML = D.m4.gallery.map(function (g) {
        var on = !h.url && h.src === g.img;
        return '<button type="button" class="hero-pick__item' + (on ? ' is-on' : '') +
          '" data-act="hero-pick" data-src="' + esc(g.img) + '" title="使用这张图片">' +
          '<img src="' + esc(g.img) + '" alt=""></button>';
      }).join('');
    }
    var urlInput = document.getElementById('heroUrlInput');
    if (urlInput) urlInput.value = h.url || '';
  }

  /* 多列表：列1/列2 切换 Tab（列1 = 左列表，列2 = 右列表） */
  function colTabHTML() {
    return '<div class="ed-coltab">' +
      '<button type="button" data-act="col" data-value="1"' + (ui.col === 1 ? ' class="is-on"' : '') + '>列 1</button>' +
      '<button type="button" data-act="col" data-value="2"' + (ui.col === 2 ? ' class="is-on"' : '') + '>列 2</button>' +
    '</div>';
  }
  /* 多列表：当前列对应的 items 区间 */
  function colRange(s) {
    if (s.structure !== 'm3') return { start: 0, end: s.items.length };
    var split = s.layout.split || 8;
    if (ui.col === 1) return { start: 0, end: Math.min(split, s.items.length) };
    return { start: Math.min(split, s.items.length), end: s.items.length };
  }

  /* ================= 结构5：轮播列表面板 =================
     两个 Tab：轮播列表（管理轮播页） / 列1（管理选中轮播页的列表） */
  function m5Slide() {
    return state.items[Math.min(ui.sel, state.items.length - 1)] || state.items[0] || {};
  }
  function m5SlideItems() {
    return m5Slide().list1 || [];
  }
  function m5ItemsSection() {
    var slides = state.items;
    var list = m5SlideItems();
    var sub = Math.max(0, Math.min(ui.sub, list.length - 1));

    var tabs = '<div class="ed-coltab ed-coltab--m5">' +
      '<button type="button" data-act="m5-tab" data-value="slides"' + (ui.m5tab === 'slides' ? ' class="is-on"' : '') + '>轮播列表</button>' +
      '<button type="button" data-act="m5-tab" data-value="list"' + (ui.m5tab === 'list' ? ' class="is-on"' : '') + '>列 1</button>' +
    '</div>';

    var body;
    if (ui.m5tab === 'list') {
      /* 列1：选中轮播页里的那一组列表 */
      var innerThumbs = list.map(function (it, i) {
        return '<div class="thumb' + (sub === i ? ' is-on' : '') + '" data-act="sub" data-idx="' + i + '">' +
          '<span class="thumb__del" data-act="del-sub" data-idx="' + i + '">' + icon('trash') + '</span>' +
          '<span class="thumb__box"><img src="' + esc(it.img) + '" alt=""></span>' +
          '<span class="thumb__no">列表项' + (i + 1) + '</span>' +
        '</div>';
      }).join('');
      var addInnerBtn = '<div class="thumb thumb--add" data-act="add-sub">' +
        '<span class="thumb__box">' + icon('plus') + '</span>' +
        '<span class="thumb__no">新增</span></div>';
      body = '<div class="m5-tabctx">轮播 ' + (ui.sel + 1) + ' · 列 1 的列表项</div>' +
        row(
          '<span class="fcount">' + (sub + 1) + '/' + list.length + '</span>' +
          '<button class="flink" data-act="add-sub">' + icon('plus') + '新增</button>') +
        '<div class="thumbs">' + innerThumbs + addInnerBtn + '</div>';
    } else {
      /* 轮播列表：轮播页缩略图 */
      var slideThumbs = slides.map(function (it, i) {
        return '<div class="thumb' + (ui.sel === i ? ' is-on' : '') + '" data-act="sel" data-idx="' + i + '">' +
          '<span class="thumb__del" data-act="del" data-idx="' + i + '">' + icon('trash') + '</span>' +
          '<span class="thumb__box"><img src="' + esc(it.img) + '" alt=""></span>' +
          '<span class="thumb__no">图片' + (i + 1) + '</span>' +
        '</div>';
      }).join('');
      var addSlideBtn = '<div class="thumb thumb--add" data-act="add">' +
        '<span class="thumb__box">' + icon('plus') + '</span>' +
        '<span class="thumb__no">新增</span></div>';
      body = row(
        '<span class="fcount">' + (ui.sel + 1) + '/' + slides.length + '</span>' +
        '<button class="flink" data-act="add">' + icon('plus') + '新增</button>') +
        '<div class="thumbs">' + slideThumbs + addSlideBtn + '</div>';
    }

    return tabs + '<div class="m5-tabsec__body">' + body + '</div>';
  }

  function itemsSection() {
    var s = state;
    if (s.structure === 'm5') return m5ItemsSection();
    var isM4 = s.structure === 'm4';
    var range = colRange(s);
    var colItems = s.items.slice(range.start, range.end);
    var selInCol = Math.max(0, ui.sel - range.start);
    var thumbs = colItems.map(function (it, i) {
      var idx = range.start + i;
      return '<div class="thumb' + (ui.sel === idx ? ' is-on' : '') + '" data-act="sel" data-idx="' + idx + '">' +
        '<span class="thumb__del" data-act="del" data-idx="' + idx + '">' + icon('trash') + '</span>' +
        '<span class="thumb__box"><img src="' + esc(it.img) + '" alt=""></span>' +
        '<span class="thumb__no">图片' + (i + 1) + '</span>' +
      '</div>';
    }).join('');
    var add = '<div class="thumb thumb--add" data-act="add">' +
      '<span class="thumb__box">' + icon('plus') + '</span>' +
      '<span class="thumb__no">新增</span></div>';
    return row(
      '<span class="fcount">' + (selInCol + 1) + '/' + colItems.length + '</span>' +
      '<button class="flink" data-act="add">' + icon('plus') + '新增</button>') +
      '<div class="thumbs">' + thumbs + add + '</div>'
  }

  function videoSection() {
    var v = state.video;
    var body = row('<span class="flabel">视频</span>' +
      '<button class="flink" data-act="toggle" data-bind="video.on">' +
      icon(v.on ? 'check' : 'plus') + (v.on ? '已添加' : '新增') + '</button>');
    return body;
  }

  function textSection() {
    var s = state;
    var body = '';
    if (s.structure === 'm5') {
      var sl = s.items[Math.min(ui.sel, s.items.length - 1)] || s.items[0] || {};
      if (ui.m5tab === 'list') {
        /* 列1 tab：编辑选中列表项（列表只要标题） */
        var list = sl.list1 || [];
        var it = list[Math.min(ui.sub, list.length - 1)] || list[0] || {};
        body += '<div class="frow"><span class="flabel" style="color:#1e6fff">列 1 · 轮播 ' + (ui.sel + 1) +
          ' · 第 ' + (ui.sub + 1) + ' 项</span></div>' +
          row(label('标题')) + inp('items.' + ui.sel + '.list1.' + ui.sub + '.title', it.title, '列表项标题');
        return body;
      }
      /* 轮播列表 tab：编辑选中轮播页的文案 */
      body += '<div class="frow"><span class="flabel" style="color:#1e6fff">轮播 ' + (ui.sel + 1) + ' 的文案</span></div>' +
        row(label('标题')) + inp('items.' + ui.sel + '.title', sl.title, '轮播页标题') +
        row(label('副标题')) + inp('items.' + ui.sel + '.subtitle', sl.subtitle, '副标题（眉题）') +
        row(label('简介')) + area('items.' + ui.sel + '.intro', sl.intro, '轮播页简介');
      return body;
    }
    if (s.structure !== 'm4') {
      var it2 = s.items[ui.sel] || s.items[0];
      body += '<div class="frow"><span class="flabel" style="color:#1e6fff">第 ' + (ui.sel + 1) + ' 项内容</span></div>' +
        row(label('列表标题') + '') +
        inp('items.' + ui.sel + '.title', it2.title, '列表项标题') +
        '<div style="height:8px"></div>' +
        inp('items.' + ui.sel + '.desc', it2.desc, '列表项描述');
    }
    body += row(label('标题', { eye: 'show.title' })) +
      inp('text.title', s.text.title, '请输入标题') +
      row(label('副标题', { eye: 'show.subtitle' })) +
      inp('text.subtitle', s.text.subtitle, '请输入') +
      row(label('简介', { eye: 'show.intro' })) +
      area('text.intro', s.text.intro, '请输入简介');
    return body;
  }

  function buttonSection() {
    var b = state.text.button;
    var body = '<button class="ftile" data-act="toggle" data-bind="text.button.on" title="新增/移除按钮">' +
      icon(b.on ? 'check' : 'plus') + '</button>' +
      row(label('图标位置')) +
      seg('text.button.icon', b.icon, [
        { v: 'left', l: '居左' }, { v: 'none', l: '无' }, { v: 'right', l: '居右' }
      ], 'fseg--wide') +
      '<div style="height:10px"></div>' +
      inp('text.button.text', b.text, '按钮文字') +
      row(label('配色方案')) +
      select('text.button.theme', b.theme, [
        { v: 'ghost', l: '描边（适合图片上）' },
        { v: 'solid', l: '主色实心' },
        { v: 'light', l: '白色实心' },
        { v: 'dark', l: '深色实心' }
      ]) +
      row(label('按钮链接')) +
      inp('text.button.link', b.link, 'https:// 或 /path');
    return body;
  }

  function linkSection() {
    return row(label('模块链接')) + inp('link', state.link || '', '点击整个模块跳转的地址');
  }

  /* ---- 更多内容设置 ---- */
  var STRIP = [
    { id: 'layout', icon: 'alignLeft', title: '布局排版' },
    { id: 'bg', icon: 'brush', title: '背景设置' },
    { id: 'img', icon: 'image', title: '图片风格' },
    { id: 'video', icon: 'video', title: '视频设置' },
    { id: 'carousel', icon: 'carousel', title: '轮播设置' },
    { id: 'seo', icon: 'seo', title: 'SEO设置' },
    { id: 'show', icon: 'eye', title: '显示设置' }
  ];

  function moreSection() {
    var strip = '<div class="strip">' + STRIP.map(function (t) {
      return '<button data-act="more" data-id="' + t.id + '"' + (ui.more === t.id ? ' class="is-on"' : '') +
        ' title="' + t.title + '">' + icon(t.icon) + '</button>';
    }).join('') + '</div>';
    var map = {
      layout: layoutPanel, bg: bgPanel, img: imgPanel,
      video: videoPanel, carousel: carouselPanel, seo: seoPanel, show: showPanel
    };
    return strip + map[ui.more]();
  }

  function layoutPanel() {
    var s = state;
    var m = MODES[s.structure];
    var body;
    if (s.structure === 'm1') {
      /* 双排列表：去掉 A/B/C/D 变体，固定「双列均布」，改为「图文布局」 */
      body = row(label('图文布局')) + select('layout.imgText', s.layout.imgText, [
        { v: 'tb', l: '上图下文' },
        { v: 'bt', l: '下图上文' },
        { v: 'lr', l: '左图右文' },
        { v: 'rl', l: '右图左文' },
        { v: 'inner', l: '图片靠内' },
        { v: 'outer', l: '图片靠外' }
      ]);
    } else {
      body = row(label(m.label)) + select('layout.mode', s.layout.mode, m.options);
    }

    if (s.structure === 'm5') {
      /* 轮播列表：整幅背景图 + 文字居左 / 居右 / 居中浮卡 */
      body += row(label('文字位置')) + seg('layout.position', s.layout.position, [
        { v: 'left', l: '文字居左' }, { v: 'right', l: '文字居右' }, { v: 'bg', l: '居中浮卡' }
      ], 'fseg--wide');
    }

    if (s.structure === 'm1') {
      body += row(label('排布方向')) + seg('layout.dir', s.layout.dir, [
        { v: 'v', l: '竖向排列' }, { v: 'h', l: '横向排列' }
      ], 'fseg--wide');
    }
    if (s.structure === 'm4' && s.layout.mode === 'grid') {
      body += row(label('列数')) + seg('layout.columns', s.layout.columns, [
        { v: 2, l: '2列' }, { v: 3, l: '3列' }, { v: 4, l: '4列' }
      ], 'fseg--wide');
    }
    if (s.structure === 'm2') {
      body += row(label('图文位置') + sw('layout.reverse', s.layout.reverse));
    }
    if (s.structure === 'm1') {
      /* 双排列表：竖向 = 「图文对齐」(图标+文字 一起左中右)；横向 = 「图片对齐」(图标 上中下，文案不动) */
      var vert = isVert(s);
      if (vert) {
        body += row(label('图文对齐')) + seg('layout.imgAlignX', s.layout.imgAlignX, [
          { v: 'left', icon: 'alignLeft' }, { v: 'center', icon: 'alignCenter' }, { v: 'right', icon: 'alignRight' }
        ], 'fseg--wide');
      } else {
        body += row(label('图片对齐')) + seg('layout.imgAlignY', s.layout.imgAlignY, [
          { v: 'top', l: '上' }, { v: 'center', l: '中' }, { v: 'bottom', l: '下' }
        ], 'fseg--wide');
        body += row(label('文案对齐')) + seg('layout.textAlign', s.layout.textAlign, [
          { v: 'left', icon: 'alignLeft' }, { v: 'center', icon: 'alignCenter' }, { v: 'right', icon: 'alignRight' }
        ], 'fseg--wide');
      }
    } else {
      body += row(label('容器对齐')) + seg('layout.align', s.layout.align, [
        { v: 'start', icon: 'alignLeft' }, { v: 'center', icon: 'alignCenter' }, { v: 'end', icon: 'alignRight' }
      ], 'fseg--wide');
    }
    if (s.structure !== 'm1') {
      body += row(label('文案对齐')) + seg('layout.textAlign', s.layout.textAlign, [
        { v: 'left', icon: 'alignLeft' }, { v: 'center', icon: 'alignCenter' }, { v: 'right', icon: 'alignRight' }
      ], 'fseg--wide');
    }
    if (s.structure === 'm1') {
      /* 双排列表：无宽度；列中间距 + 图文比例 = 主内容 vs 列表项 */
      body += row(label('上下对齐')) + seg('layout.valign', s.layout.valign, [
        { v: 'top', l: '上' }, { v: 'center', l: '中' }, { v: 'bottom', l: '下' }
      ], 'fseg--wide');
      body += dimCtl({ label: '列中间距', field: 'layout.gap', modeBind: 'layout.gapMode', type: 'gap', min: 0, max: 80 });
      body += '<div class="frow" style="margin-top:14px"><span class="flabel" style="font-weight:600;color:#1f2328">图文比例</span></div>';
      body += row(label('主内容') + range('layout.mainRatio', s.layout.mainRatio, 1, 12, 1, ''));
      body += row(label('列表项') + range('layout.listRatio', s.layout.listRatio, 1, 12, 1, ''));
      /* 横向布局：列表项内部 图标:文字 比例 */
      var horiz = isHoriz(s);
      if (horiz) {
        body += row(label('图片') + range('layout.iconRatio', s.layout.iconRatio, 1, 6, 1, ''));
        body += row(label('文字') + range('layout.textRatio', s.layout.textRatio, 1, 12, 1, ''));
      }
    } else {
      body += row(label('宽度')) + range('layout.width', s.layout.width, 30, 100, 1, '%');
    }
    if (s.structure === 'm4' || s.structure === 'm5') {
      body += dimCtl({ label: s.structure === 'm5' ? '列表间距' : '列中间距', field: 'layout.gap', modeBind: 'layout.gapMode', type: 'gap', min: 0, max: 80 });
    }
    if (s.structure === 'm4') {
      body += row(label('文案背景')) + sw('layout.textBg.on', s.layout.textBg.on);
      if (s.layout.textBg.on) {
        body += row(label('背景色')) + color('layout.textBg.color', s.layout.textBg.color, true) +
          dimCtl({ label: '圆角', field: 'layout.textBg.radius', modeBind: 'layout.textBg.radiusMode', type: 'corner', min: 0, max: 40 }) +
          dimCtl({ label: '内边距', field: 'layout.textBg.pad', modeBind: 'layout.textBg.padMode', type: 'box', min: 0, max: 48 });
      }
    }
    return body;
  }

  function bgPanel() {
    var c = state.card;
    var k = state.container;
    var body = '<div class="frow"><span class="flabel" style="font-weight:600;color:#1f2328">卡片背景</span></div>' +
      row(label('背景') + sw('card.bgOn', c.bgOn)) +
      (c.bgOn ? row(label('颜色') + color('card.bg', c.bg)) : '') +
      row(label('描边') + sw('card.borderOn', c.borderOn)) +
      (c.borderOn ? row(label('颜色') + color('card.border', c.border)) +
        row(label('粗细') + num('card.borderWidth', c.borderWidth, 'px', 0, 8)) : '') +
      row(label('相邻的描边合并') + sw('card.merge', c.merge)) +
      dimCtl({ label: '圆角', field: 'card.radius', modeBind: 'card.radiusMode', type: 'corner', min: 0, max: 48 }) +
      dimCtl({ label: '内边距', field: 'card.pad', modeBind: 'card.padMode', type: 'box', min: 0, max: 48 }) +
      shadowCtl('card.shadow') +
      '<div class="frow" style="margin-top:22px"><span class="flabel" style="font-weight:600;color:#1f2328">容器背景</span></div>' +
      row(label('背景') + sw('container.bgOn', k.bgOn)) +
      (k.bgOn ? row(label('颜色') + color('container.bg', k.bg)) : '') +
      row(label('描边') + sw('container.borderOn', k.borderOn)) +
      (k.borderOn ? row(label('颜色') + color('container.border', k.border)) +
        row(label('粗细') + num('container.borderWidth', k.borderWidth, 'px', 0, 8)) : '') +
      dimCtl({ label: '圆角', field: 'container.radius', modeBind: 'container.radiusMode', type: 'corner', min: 0, max: 48 }) +
      dimCtl({ label: '内边距', field: 'container.pad', modeBind: 'container.padMode', type: 'box', min: 0, max: 96 }) +
      shadowCtl('container.shadow');
    return body;
  }

  function imgPanel(opts) {
    opts = opts || {};
    var bind = opts.bind || 'img';
    var g = getPath(bind) || state.img;
    var body = row(label('图片比例')) + select(bind + '.ratio', g.ratio, [
      { v: 'none', l: '无（跟随原图）' },
      { v: '1:1', l: '1 : 1' }, { v: '4:3', l: '4 : 3' },
      { v: '16:9', l: '16 : 9' }, { v: '3:4', l: '3 : 4' }
    ]) +
      row(label('图片效果')) + select(bind + '.effect', g.effect, [
        { v: 'none', l: '原图' }, { v: 'gray', l: '黑白' },
        { v: 'blur', l: '柔化' }, { v: 'zoom', l: '放大裁切' }
      ]) +
      (opts.main ? '' :
        row(label('图片背景') + sw(bind + '.bgOn', g.bgOn)) +
        (g.bgOn ? row(label('颜色') + color(bind + '.bg', g.bg)) : '') +
        row(label('图片描边') + sw(bind + '.borderOn', g.borderOn)) +
        (g.borderOn ? row(label('颜色') + color(bind + '.border', g.border)) : '') +
        dimCtl({ label: '圆角', field: bind + '.radius', modeBind: bind + '.radiusMode', type: 'corner', min: 0, max: 48 }) +
        (opts.noAlign ? '' :
          row(label('图片对齐')) + seg(bind + '.align', g.align, [
            { v: 'left', icon: 'alignLeft' }, { v: 'center', icon: 'alignCenter' }, { v: 'right', icon: 'alignRight' }
          ], 'fseg--wide')) +
        dimCtl({ label: '内边距', field: bind + '.pad', modeBind: bind + '.padMode', type: 'box', min: 0, max: 40 }) +
        /* 开启蒙层：图片上叠黑色半透明遮罩，开启后再给透明度滑杆 + 数值 */
        (function () {
          var m = g.mask || {};
          var on = !!m.on;
          return row(label('开启蒙层') + sw(bind + '.mask.on', on)) +
            (on
              ? row(label('蒙层透明度')) + '<div class="frow">' +
                  range(bind + '.mask.opacity', m.opacity != null ? m.opacity : 0.3, 0, 1, 0.05, '') +
                '</div>'
              : '');
        })());
    return body;
  }

  /* 个性化风格：标题 + 一个设置入口 */
  function heroStyleSection() {
    return '<div class="hero-entry-sec">' +
      '<div class="hero-entry-sec__title">个性化风格</div>' +
      '<button type="button" class="hero-entry-sec__btn">设置</button>' +
    '</div>';
  }

  /* 链接：标题 + 一个设置入口 */
  function heroLinkSection() {
    return '<div class="hero-entry-sec">' +
      '<div class="hero-entry-sec__title">链接</div>' +
      '<button type="button" class="hero-entry-sec__btn">链接设置</button>' +
    '</div>';
  }

  function videoPanel() {
    var v = state.video;
    return row(label('视频比例')) + select('video.ratio', v.ratio, [
      { v: '无', l: '无' }, { v: '16:9', l: '16 : 9' }, { v: '1:1', l: '1 : 1' }, { v: '9:16', l: '9 : 16' }
    ]) +
      row(label('播放方式')) + select('video.playMode', v.playMode, [
        { v: '点击播放', l: '点击播放' }, { v: '悬停播放', l: '悬停播放' }, { v: '弹窗播放', l: '弹窗播放' }
      ]) +
      row(label('循环播放') + sw('video.loop', v.loop)) +
      row(label('静音播放') + sw('video.muted', v.muted)) +
      row(label('自动播放') + sw('video.autoplay', v.autoplay)) +
      row(label('显示播放图标') + sw('video.icon', v.icon)) +
      row(label('显示控件') + sw('video.controls', v.controls)) +
      row(label('播放时隐藏文字和按钮') + sw('video.hideText', v.hideText)) +
      row(label('开启蒙层') + sw('video.mask', v.mask))
  }

  function carouselPanel() {
    var c = state.carousel;
    if (state.structure === 'm5') {
      /* 轮播列表本身就是轮播：不提供「是否轮播」，改为「自动播放」 */
      return row(label('循环播放') + sw('carousel.loop', c.loop)) +
        row(label('显示切换箭头') + sw('carousel.arrows', c.arrows)) +
        row(label('显示轮播分页') + sw('carousel.dots', c.dots)) +
        row(label('自动播放') + sw('carousel.auto', c.auto)) +
        row(label('轮播间隔(毫秒)')) +
        '<div class="frow">' + range('carousel.interval', c.interval, 1000, 10000, 500, 'ms') + '</div>';
    }
    return row(label('是否轮播') + sw('carousel.on', c.on)) +
      row(label('循环播放') + sw('carousel.loop', c.loop)) +
      row(label('显示切换箭头') + sw('carousel.arrows', c.arrows)) +
      row(label('显示轮播分页') + sw('carousel.dots', c.dots)) +
      row(label('轮播间隔(毫秒)')) +
      '<div class="frow">' + range('carousel.interval', c.interval, 1000, 10000, 500, 'ms') + '</div>'
  }

  function seoPanel() {
    var s = state.seo;
    return row(label('ALT 标签') + sw('seo.alt', s.alt)) +
      inp('seo.altText', s.altText, '图片替代文本') +
      row(label('标题属性') + sw('seo.titleAttr', s.titleAttr)) +
      inp('seo.titleText', s.titleText, '鼠标悬停提示');
  }

  function showPanel() {
    var s = state.show;
    return row(label('标题') + sw('show.title', s.title)) +
      row(label('副标题') + sw('show.subtitle', s.subtitle)) +
      row(label('简介') + sw('show.intro', s.intro)) +
      row(label('按钮') + sw('show.button', s.button));
  }

  /* ================= 面板：动画 / 预设 ================= */
  function motionPanel() {
    var m = state.motion;
    return row(label('入场动画')) + seg('motion.type', m.type, [
      { v: 'none', l: '无' }, { v: 'fade', l: '淡入' },
      { v: 'up', l: '上移' }, { v: 'zoom', l: '缩放' }
    ], 'fseg--wide') +
      row(label('时长')) + range('motion.duration', m.duration, 200, 1500, 50, 'ms') +
      row(label('延迟')) + range('motion.delay', m.delay, 0, 800, 50, 'ms') +
      '<div class="frow"><button class="fbtn" data-act="preview" style="width:100%;height:32px;border-radius:6px;background:#1e6fff;color:#fff;font-size:12.5px">预览动画</button></div>'
  }

  var PRESETS = [
    {
      id: 'p1', name: '暗色海报', desc: '黑底 + 直角铺满 + 描边按钮',
      apply: { container: { bgOn: true, bg: '#0b0b0c', radius: 0, pad: 40 }, card: { radius: 0, pad: 0, bgOn: false, shadow: { on: false } }, layout: { gap: 8, textAlign: 'left' }, img: { radius: 0, ratio: '4:3' }, text: { button: { theme: 'ghost' } } }
    },
    {
      id: 'p2', name: '圆角卡片', desc: '深灰卡片 + 16px 圆角 + 投影',
      apply: { container: { bgOn: true, bg: '#0f1216', radius: 0, pad: 28 }, card: { radius: 16, pad: 10, bgOn: true, bg: '#181c22', shadow: { on: true, x: 0, y: 14, blur: 34, spread: -16 } }, layout: { gap: 14 }, img: { radius: 10, ratio: '4:3' }, text: { button: { theme: 'solid' } } }
    },
    {
      id: 'p3', name: '明亮画册', desc: '白底 + 大留白 + 深色按钮',
      apply: { container: { bgOn: true, bg: '#ffffff', radius: 0, pad: 48 }, card: { radius: 0, pad: 0, bgOn: false, shadow: { on: false } }, layout: { gap: 20, textAlign: 'left' }, img: { radius: 4, ratio: '4:3' }, text: { button: { theme: 'dark' } } }
    },
    {
      id: 'p4', name: '居中文字', desc: '文字居中 + 半透明文案底',
      apply: { container: { bgOn: true, bg: '#0b0b0c', pad: 32 }, card: { radius: 8, pad: 0 }, layout: { gap: 12, textAlign: 'center', textBg: { on: true, color: '#000000b3', radius: 10, pad: 18 } }, img: { radius: 8, ratio: '1:1' }, text: { button: { theme: 'light' } } }
    }
  ];

  function presetPanel() {
    return '<div class="presets">' + PRESETS.map(function (p) {
      return '<button class="preset' + (state.preset === p.id ? ' is-on' : '') + '" data-act="preset" data-id="' + p.id + '">' +
        '<span class="preset__swatch"><i style="background:' + (p.apply.container.bg || '#0b0b0c') + '"></i><i style="background:' + (p.apply.card.bg || '#2a2f38') + '"></i></span>' +
        '<span><span class="preset__name">' + p.name + '</span>' +
        '<span class="preset__desc">' + p.desc + '</span></span>' +
      '</button>';
    }).join('') + '</div>'
  }

  /* ================= 渲染 ================= */
  var canvasEl, stageEl, panelEl, toastEl;

  function renderCanvas(animate) {
    var motion = state.motion;
    canvasEl.innerHTML = Canvas.render(state);
    stageEl.className = 'ed-stage is-' + state.layout.align;
    var sel = canvasEl.querySelector('.ed-select');
    if (sel && motion.type !== 'none') {
      var key = { fade: 'edFade', up: 'edUp', zoom: 'edZoom' }[motion.type];
      sel.style.animation = 'none';
      void sel.offsetWidth;
      sel.style.animation = key + ' ' + motion.duration + 'ms cubic-bezier(.22,.61,.36,1) ' + motion.delay + 'ms both';
    }
    if (sel) sel.style.transformOrigin = 'center top';
    syncCarouselTimer();
  }

  /* 面板重绘时保留滚动位置：
     - 同一 Tab 内改设置 / 点预设 / 切图 / 折叠区块 → 不跳回顶部
     - 切换 Tab → 各自记住上次滚动位置
     - 换结构 / 重置模块 → 才回到顶部 */
  var pendingScrollReset = false;
  var tabScroll = {};
  var lastTab = null;

  function renderPanel() {
    var prev = panelEl.querySelector('.ed-scroll');
    var prevTop = prev ? prev.scrollTop : 0;
    if (prev && lastTab) tabScroll[lastTab] = prevTop;

    var keepTop;
    if (pendingScrollReset) {
      tabScroll = {};
      keepTop = 0;
    } else if (lastTab && lastTab !== ui.tab) {
      keepTop = tabScroll[ui.tab] || 0;
    } else {
      keepTop = prevTop;
    }
    pendingScrollReset = false;
    lastTab = ui.tab;

    var tabs = ['design', 'motion', 'preset'];
    var names = { design: '设计', motion: '动画', preset: '预设' };
    var body;
    if (ui.tab === 'motion') body = motionPanel();
    else if (ui.tab === 'preset') body = presetPanel();
    else {
      if (state.structure === 'm1') {
        /* 主内容 tab 只保留「更多内容设置」；列表 tab 才有 视频/文本/按钮/链接 */
        var m1Common = ui.m1tab === 'hero'
          ? sec('more', '更多内容设置', moreSection())
          : sec('video', '视频', videoSection()) +
            sec('text', '文本设置', textSection()) +
            sec('button', '按钮设置', buttonSection()) +
            sec('link', '链接', linkSection()) +
            sec('more', '更多内容设置', moreSection());
        body =
          m1TabHTML() +
          (ui.m1tab === 'hero'
            ? sec('hero', '主图', heroSection())
            : sec('items', '列表项', itemsSection())) +
          m1Common;
      } else {
        var itemsTitle = state.structure === 'm4' ? '图文列表'
          : state.structure === 'm5' ? '轮播列表' : '列表项';
        body =
          (state.structure === 'm3' ? colTabHTML() : '') +
          (state.structure === 'm5'
            ? '<div class="m5-tabsec">' + m5ItemsSection() + '</div>'
            : sec('items', itemsTitle, itemsSection())) +
          sec('video', '视频', videoSection()) +
          sec('text', '文本设置', textSection()) +
          sec('button', '按钮设置', buttonSection()) +
          sec('link', '链接', linkSection()) +
          sec('more', '更多内容设置', moreSection());
      }
    }
    panelEl.innerHTML =
      '<div class="ed-scroll">' +
        '<div class="ed-tabs">' + tabs.map(function (t) {
          return '<button class="ed-tab' + (ui.tab === t ? ' is-on' : '') + '" data-act="tab" data-id="' + t + '">' +
            names[t] + '</button>';
        }).join('') + '</div>' +
        body +
      '</div>';

    var next = panelEl.querySelector('.ed-scroll');
    if (next && keepTop > 0) {
      next.scrollTop = keepTop;
      /* 图片/字体落位后再校正一次，避免高度未就绪时被浏览器夹到 0 */
      requestAnimationFrame(function () {
        var box = panelEl.querySelector('.ed-scroll');
        if (box) box.scrollTop = keepTop;
      });
    }
  }

  function renderAll() {
    renderCanvas();
    renderPanel();
    save();
  }

  /* ================= 事件 ================= */
  function bindPanel() {
    panelEl.addEventListener('click', function (e) {
      var el = e.target.closest('[data-act]');
      if (!el) return;
      var act = el.dataset.act;

      if (act === 'tab') {
        ui.tab = el.dataset.id;
        renderPanel();
        return;
      }
      if (act === 'sec') {
        var id = el.dataset.sec;
        ui.open[id] = !ui.open[id];
        renderPanel();
        return;
      }
      if (act === 'more') { ui.more = el.dataset.id; renderPanel(); return; }
      if (act === 'seg') {
        var raw = el.dataset.value;
        setPath(el.dataset.bind, /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw);
        if (el.dataset.bind === 'layout.mode') { state._page = 0; }
        renderAll();
        return;
      }
      if (act === 'toggle') {
        var p = el.dataset.bind;
        if (!p) return;
        setPath(p, !getPath(p));
        renderAll();
        return;
      }
      if (act === 'sel') { ui.sel = Number(el.dataset.idx); ui.sub = 0; renderPanel(); return; }
      if (act === 'sub') { ui.sub = Number(el.dataset.idx); renderPanel(); return; }
      if (act === 'add') {
        if (state.structure === 'm5') {
          /* 新增一个轮播页（自带 列1 列表） */
          var imgs5 = D.m4.gallery.map(function (g) { return g.img; });
          var nn = state.items.length;
          var mk = [];
          var T5 = ['Free Delivery', 'Solid Oak', '5-Year Warranty', 'Modular Design', 'Swap Covers', 'Low-VOC Finish'];
          var I5 = ['truck', 'cube', 'shield', 'layers', 'refresh', 'leaf'];
          for (var j5 = 0; j5 < 6; j5++) {
            mk.push({ img: imgs5[j5 % imgs5.length], icon: I5[j5 % I5.length], title: T5[j5 % T5.length] });
          }
          state.items.push({
            img: imgs5[nn % imgs5.length],
            title: '新的轮播标题',
            subtitle: 'EYEBROW',
            intro: '这一页轮播的简介文案。',
            list1: mk
          });
          ui.sel = state.items.length - 1;
          ui.sub = 0;
          renderAll();
          return;
        }
        var imgs = D.m4.gallery.map(function (g) { return g.img; });
        var n = state.items.length;
        var item = {
          img: imgs[n % imgs.length],
          title: state.structure === 'm4' ? state.text.title : (D.m1.items[n % D.m1.items.length].title),
          desc: state.structure === 'm4' ? '' : D.m1.items[n % D.m1.items.length].desc,
          icon: D.m1.items[n % D.m1.items.length].icon,
          value: VALUES[n % VALUES.length]
        };
        if (state.structure === 'm3') {
          var split = state.layout.split || 8;
          if (ui.col === 1) {
            state.items.splice(Math.min(split, state.items.length), 0, item);
            ui.sel = Math.min(split, state.items.length);
          } else {
            state.items.push(item);
            ui.sel = state.items.length - 1;
          }
        } else {
          state.items.push(item);
          ui.sel = state.items.length - 1;
        }
        renderAll();
        return;
      }
      if (act === 'add-sub') {
        /* 结构5：给当前轮播页的 列1 新增列表项 */
        var sl = m5Slide();
        if (!sl) return;
        var list = sl.list1 || (sl.list1 = []);
        var imgs2 = D.m4.gallery.map(function (g) { return g.img; });
        var T5b = ['Free Delivery', 'Solid Oak', '5-Year Warranty', 'Modular Design', 'Swap Covers', 'Low-VOC Finish'];
        var I5b = ['truck', 'cube', 'shield', 'layers', 'refresh', 'leaf'];
        var n2 = list.length;
        list.push({ img: imgs2[n2 % imgs2.length], icon: I5b[n2 % I5b.length], title: T5b[n2 % T5b.length] });
        ui.sub = list.length - 1;
        renderAll();
        return;
      }
      if (act === 'del-sub') {
        e.stopPropagation();
        var sl2 = m5Slide();
        if (!sl2) return;
        var list2 = sl2.list1 || [];
        if (list2.length <= 1) return toast('至少保留一项列表内容');
        list2.splice(Number(el.dataset.idx), 1);
        ui.sub = Math.max(0, Math.min(ui.sub, list2.length - 1));
        renderAll();
        return;
      }
      if (act === 'del') {
        e.stopPropagation();
        var i = Number(el.dataset.idx);
        if (state.structure === 'm5') {
          if (state.items.length <= 1) return toast('至少保留一张轮播图');
          state.items.splice(i, 1);
          ui.sel = Math.max(0, Math.min(ui.sel, state.items.length - 1));
          ui.sub = 0;
          renderAll();
          return;
        }
        if (state.items.length <= 1) return toast('至少保留一张图片');
        state.items.splice(i, 1);
        ui.sel = Math.max(0, Math.min(ui.sel, state.items.length - 1));
        renderAll();
        return;
      }
      if (act === 'dim-mode') {
        setPath(el.dataset.bind, el.dataset.value);
        renderAll();
        return;
      }
      if (act === 'hero-modal') {
        renderHeroModal();
        document.getElementById('heroModal').classList.add('is-on');
        return;
      }
      if (act === 'cmp-tab') {
        setPath('hero.compare.active', Number(el.dataset.value));
        renderAll();
        return;
      }
      if (act === 'm1-tab') {
        ui.m1tab = el.dataset.value;
        renderPanel();
        return;
      }
      if (act === 'm5-tab') {
        ui.m5tab = el.dataset.value;
        renderPanel();
        return;
      }
      if (act === 'col') {
        ui.col = Number(el.dataset.value);
        var r = colRange(state);
        ui.sel = Math.max(r.start, Math.min(ui.sel, Math.max(r.start, r.end - 1)));
        ui.sub = 0;
        renderPanel();
        return;
      }
      if (act === 'preset') {
        var p2 = PRESETS.filter(function (x) { return x.id === el.dataset.id; })[0];
        if (p2) {
          deepMerge(state, JSON.parse(JSON.stringify(p2.apply)));
          state.preset = p2.id;
          renderAll();
        }
        return;
      }
      if (act === 'preview') {
        renderCanvas();
        return;
      }
    });

    /* 文本 / 数字 / 颜色 / 滑杆：只重绘画布，避免输入框失焦 */
    panelEl.addEventListener('input', function (e) {
      var el = e.target.closest('[data-bind]');
      if (!el || el.dataset.act || el.tagName === 'SELECT') return;
      var kind = el.dataset.kind || el.type;
      var v = el.value;
      if (kind === 'range' || el.type === 'number') v = Number(v);
      if (el.type === 'number' && el.dataset.px) v = fromDisplay(v);
      if (el.type === 'color') {
        var old = String(getPath(el.dataset.bind) || '');
        v = old.length === 9 ? v + old.slice(7) : v;
      }
      setPath(el.dataset.bind, v);
      renderCanvas();
      save();
      if (el.type === 'range' || el.type === 'number') syncNumberField(el);
      /* 主图外链：同步「图库 / 外链」标记与选中态，不重绘面板以免失焦 */

    });

    panelEl.addEventListener('change', function (e) {
      var el = e.target.closest('select[data-bind]');
      if (!el) return;
      setPath(el.dataset.bind, el.value);
      renderAll();
    });
  }

  function syncNumberField(el) {
    var bind = el.dataset.bind;
    panelEl.querySelectorAll('[data-bind="' + bind + '"]').forEach(function (other) {
      if (other !== el) other.value = el.value;
    });
  }

  /* 画布点击选中卡片 */
  function bindCanvas() {
    canvasEl.addEventListener('click', function (e) {
      /* 结构5：轮播箭头 / 分页点 / 轮播页 / 页内列表项 */
      var ctl = e.target.closest('[data-m5]');
      if (ctl && ctl.closest('.m5')) {
        var nn = Math.max(1, state.items.length);
        if (ctl.dataset.m5 === 'prev') state._page = (state._page - 1 + nn) % nn;
        else if (ctl.dataset.m5 === 'next') state._page = (state._page + 1) % nn;
        else state._page = Number(ctl.dataset.m5Goto || 0);
        renderCanvas();
        return;
      }
      var slide = e.target.closest('.m5__slide');
      if (slide && slide.dataset.idx != null) {
        ui.sel = Number(slide.dataset.idx);
        var item = e.target.closest('.m5__item');
        if (item && item.dataset.sub != null) ui.sub = Number(item.dataset.sub);
        else ui.sub = 0;
        ui.open.items = true;
        ui.tab = 'design';
        renderPanel();
        return;
      }
      var card = e.target.closest('.ed-card');
      if (!card || card.dataset.idx == null) return;
      ui.sel = Number(card.dataset.idx);
      ui.open.items = true;
      ui.tab = 'design';
      renderPanel();
    });

    /* 对比图 before/after 滑块拖动 */
    var dragCmp = null;
    function setCmpPos(cmp, ratio) {
      ratio = Math.max(0, Math.min(1, ratio));
      var pct = (ratio * 100).toFixed(2) + '%';
      var top = cmp.querySelector('.m1__compare-img--top');
      var line = cmp.querySelector('.m1__compare-line');
      var handle = cmp.querySelector('.m1__compare-handle');
      if (top) top.style.clipPath = 'inset(0 0 0 ' + pct + ')';
      if (line) line.style.left = pct;
      if (handle) handle.style.left = pct;
    }
    canvasEl.addEventListener('mousedown', function (e) {
      var handle = e.target.closest('.m1__compare-handle');
      if (!handle) return;
      var cmp = handle.closest('.m1__compare');
      e.preventDefault();
      dragCmp = cmp;
      var rect = cmp.getBoundingClientRect();
      var ratio = (e.clientX - rect.left) / rect.width;
      setCmpPos(cmp, ratio);
    });
    canvasEl.addEventListener('touchstart', function (e) {
      var handle = e.target.closest('.m1__compare-handle');
      if (!handle) return;
      var cmp = handle.closest('.m1__compare');
      dragCmp = cmp;
      var t = e.touches[0];
      var rect = cmp.getBoundingClientRect();
      var ratio = (t.clientX - rect.left) / rect.width;
      setCmpPos(cmp, ratio);
    }, { passive: true });
    document.addEventListener('mousemove', function (e) {
      if (!dragCmp) return;
      var rect = dragCmp.getBoundingClientRect();
      setCmpPos(dragCmp, (e.clientX - rect.left) / rect.width);
    });
    document.addEventListener('touchmove', function (e) {
      if (!dragCmp) return;
      var t = e.touches[0];
      var rect = dragCmp.getBoundingClientRect();
      setCmpPos(dragCmp, (t.clientX - rect.left) / rect.width);
    }, { passive: true });
    document.addEventListener('mouseup', function () { dragCmp = null; });
    document.addEventListener('touchend', function () { dragCmp = null; });
  }

  /* ================= 轮播自动播放 ================= */
  var timer = null;
  function syncCarouselTimer() {
    if (timer) { clearInterval(timer); timer = null; }
    var c = state.carousel;
    if (state.structure === 'm5') {
      /* 轮播列表：按轮播页数自动翻页 */
      var n = state.items.length;
      if (!c.auto || n <= 1) return;
      timer = setInterval(function () {
        state._page = (state._page + 1) % n;
        renderCanvas();
      }, Math.max(800, c.interval));
      return;
    }
    if (!c.on || state.structure !== 'm4' || state.layout.mode !== 'grid') return;
    var pages = Math.max(1, Math.ceil(state.items.length / state.layout.columns));
    if (pages <= 1) return;
    timer = setInterval(function () {
      state._page = (state._page + 1) % pages;
      renderCanvas();
    }, Math.max(800, c.interval));
  }

  /* ================= 顶部 / 全局 ================= */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove('is-on'); }, 1600);
  }

  function boot() {
    canvasEl = document.getElementById('canvas');
    stageEl = document.getElementById('stage');
    panelEl = document.getElementById('panel');
    toastEl = document.getElementById('toast');

    /* 顶部图标 */
    document.querySelectorAll('[data-icon]').forEach(function (el) {
      el.innerHTML = icon(el.dataset.icon);
    });

    /* 模块选择 */
    var sel = document.getElementById('structureSel');
    sel.innerHTML = STRUCTURES.map(function (s) {
      return '<option value="' + s.id + '">' + s.name + '</option>';
    }).join('');
    sel.value = state.structure;
    sel.addEventListener('change', function () {
      var id = sel.value;
      state = init(id);
      ui.sel = 0;
      ui.col = 1;
      ui.sub = 0;
      ui.m1tab = 'hero';
      ui.m5tab = 'slides';
      ui.more = 'layout';
      pendingScrollReset = true;
      renderAll();
      toast('已切换到「' + Canvas.LABELS[id] + '」');
    });

    document.getElementById('saveBtn').addEventListener('click', function () {
      save();
      toast('已保存到本地（localStorage）');
    });
    document.getElementById('resetBtn').addEventListener('click', function () {
      state = init(state.structure);
      ui.sel = 0;
      ui.sub = 0;
      pendingScrollReset = true;
      renderAll();
      toast('已重置当前模块');
    });
    document.getElementById('closeBtn').addEventListener('click', function () {
      document.body.classList.toggle('is-panel-hidden');
      var p = document.getElementById('panel');
      p.style.display = p.style.display === 'none' ? '' : 'none';
    });

    /* 窄屏：面板默认收起，用右下角按钮唤出 */
    var panelBox = document.querySelector('.ed-panel');
    var mq = window.matchMedia('(max-width: 860px)');
    function syncPanel() { panelBox.style.display = mq.matches ? 'none' : ''; }
    if (mq.addEventListener) mq.addEventListener('change', syncPanel);
    syncPanel();
    document.getElementById('fabBtn').addEventListener('click', function () {
      panelBox.style.display = panelBox.style.display === 'none' ? '' : 'none';
    });

    /* 主图弹层：选图 / 外链 / 关闭 */
    var heroModal = document.getElementById('heroModal');
    heroModal.addEventListener('click', function (e) {
      var el = e.target.closest('[data-act]');
      if (!el) return;
      var act = el.dataset.act;
      if (act === 'hero-close') {
        heroModal.classList.remove('is-on');
        return;
      }
      if (act === 'hero-pick') {
        var tgt = heroImgTarget();
        setPath(tgt.srcPath, el.dataset.src);
        setPath(tgt.urlPath, '');
        heroModal.classList.remove('is-on');
        renderAll();
        return;
      }
      if (act === 'hero-url') {
        var tgt2 = heroImgTarget();
        var v = document.getElementById('heroUrlInput').value.trim();
        setPath(tgt2.urlPath, v);
        heroModal.classList.remove('is-on');
        renderAll();
        return;
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') heroModal.classList.remove('is-on');
    });

    bindPanel();
    bindCanvas();
    renderAll();
  }

  /* 动画 keyframes 注入 */
  var css = document.createElement('style');
  css.textContent =
    '@keyframes edFade{from{opacity:0}to{opacity:1}}' +
    '@keyframes edUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}' +
    '@keyframes edZoom{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}';
  document.head.appendChild(css);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
