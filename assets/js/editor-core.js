/* =========================================================
   editor-core.js — 核心驱动：状态持久化、事件绑定、渲染调度与启动入口
   ========================================================= */
(function () {
  'use strict';

  var ED = window.ED = window.ED || {};
  var icon = window.icon;
  var D = window.DATA;
  var Canvas = window.EdCanvas;

  var STORAGE_KEY = 'module-editor-v1';

  var itemsSection = function () { return ED.itemsSection(); };
  var videoSection = function () { return ED.videoSection(); };
  var textSection = function () { return ED.textSection(); };
  var buttonSection = function () { return ED.buttonSection(); };
  var linkSection = function () { return ED.linkSection(); };
  var moreSection = function () { return ED.moreSection(); };
  var motionPanel = function () { return ED.motionPanel(); };
  var presetPanel = function () { return ED.presetPanel(); };
  var heroSection = function () { return ED.heroSection(); };
  var renderHeroModal = function () { return ED.renderHeroModal(); };
  var sec = function () { return ED.sec.apply(null, arguments); };
  var m1TabHTML = function () { return ED.m1TabHTML.apply(null, arguments); };
  var colTabHTML = function () { return ED.colTabHTML.apply(null, arguments); };
  var colRange = function (s) { return ED.colRange(s); };
  var m5ItemsSection = function () { return ED.m5ItemsSection.apply(null, arguments); };
  var m5Slide = function () { return ED.m5Slide.apply(null, arguments); };
  var heroImgTarget = function (sub) { return ED.heroImgTarget(sub); };
  var fromDisplay = function () { return ED.fromDisplay.apply(null, arguments); };

  var defaults = function (st) { return ED.defaults(st); };
  var seedItems = function (st, keep) { return ED.seedItems(st, keep); };

  var STRUCTURES = ED.STRUCTURES;
  var MODES = ED.MODES;
  var PRESETS = ED.PRESETS;
  var VALUES = ED.VALUES;

  var state = ED.state = load() || init('m4');
  var ui = ED.ui = { tab: 'design', open: { hero: true, items: true, video: false, text: false, button: false, link: false, more: true }, more: 'layout', sel: 0, col: 1, m1tab: 'hero', sub: 0, m5tab: 'slides' };

  var canvasEl, stageEl, panelEl, toastEl;


  var pendingScrollReset = false;
  var tabScroll = {};
  var lastTab = null;


  var timer = null;

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


  function getPath(p) {
    return p.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, state);
  }


  function setPath(p, v) {
    var keys = p.split('.');
    var last = keys.pop();
    var obj = keys.reduce(function (o, k) {
      if (!o[k] || typeof o[k] !== 'object') o[k] = {};
      return o[k];
    }, state);
    obj[last] = v;
  }


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
        var nextVal = !getPath(p);
        setPath(p, nextVal);
        /* 轮播列表开启独立排版时：深拷贝全局 layout 作为初始值，避免突变 */
        if (p.indexOf('customLayout') !== -1 && nextVal) {
          var slideIdx = Math.max(0, Math.min(ui.sel || 0, state.items.length - 1));
          var sl = state.items[slideIdx];
          if (sl && (!sl.layout || typeof sl.layout !== 'object')) {
            sl.layout = JSON.parse(JSON.stringify(state.layout));
          }
        }
        renderAll();
        return;
      }
      if (act === 'sel') {
        ui.sel = Number(el.dataset.idx);
        ui.sub = 0;
        if (state.structure === 'm5') {
          state._page = ui.sel;
          renderAll();
          return;
        }
        renderPanel();
        return;
      }
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
      if (e.target && e.target.type === 'color') {
        var b = e.target.dataset.bind;
        if (b && (b.endsWith('.bg') || b.endsWith('.border'))) {
          var onProp = b.endsWith('.bg') ? b.replace(/\.bg$/, '.bgOn') : b.replace(/\.border$/, '.borderOn');
          setPath(onProp, true);
        }
        renderAll();
        return;
      }
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


  function bindCanvas() {
    canvasEl.addEventListener('click', function (e) {
      /* 结构5：轮播箭头 / 分页点 / 轮播页 / 页内列表项 */
      var ctl = e.target.closest('[data-m5]');
      if (ctl && ctl.closest('.m5')) {
        var nn = Math.max(1, state.items.length);
        if (ctl.dataset.m5 === 'prev') state._page = (state._page - 1 + nn) % nn;
        else if (ctl.dataset.m5 === 'next') state._page = (state._page + 1) % nn;
        else state._page = Number(ctl.dataset.m5Goto || 0);
        ui.sel = state._page;
        renderAll();
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
      ED.state = state = init(id);
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
      ED.state = state = init(state.structure);
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


  ED.STORAGE_KEY = STORAGE_KEY;
  ED.init = init;
  ED.load = load;
  ED.deepMerge = deepMerge;
  ED.save = save;
  ED.getPath = getPath;
  ED.setPath = setPath;
  ED.renderCanvas = renderCanvas;
  ED.renderPanel = renderPanel;
  ED.renderAll = renderAll;
  ED.bindPanel = bindPanel;
  ED.syncNumberField = syncNumberField;
  ED.bindCanvas = bindCanvas;
  ED.syncCarouselTimer = syncCarouselTimer;
  ED.toast = toast;
  ED.boot = boot;

  boot();
})();
