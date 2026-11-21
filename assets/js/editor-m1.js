/* =========================================================
   editor-m1.js — 结构1（双排列表）专属面板组件与主图设置
   ========================================================= */
(function () {
  'use strict';

  var ED = window.ED = window.ED || {};
  var icon = window.icon;
  var D = window.DATA;

  var esc = function () { return ED.esc.apply(null, arguments); };
  var label = function () { return ED.label.apply(null, arguments); };
  var row = function () { return ED.row.apply(null, arguments); };
  var seg = function () { return ED.seg.apply(null, arguments); };
  var sw = function () { return ED.sw.apply(null, arguments); };
  var inp = function () { return ED.inp.apply(null, arguments); };
  var area = function () { return ED.area.apply(null, arguments); };
  var color = function () { return ED.color.apply(null, arguments); };
  var select = function () { return ED.select.apply(null, arguments); };
  var range = function () { return ED.range.apply(null, arguments); };
  var dimCtl = function () { return ED.dimCtl.apply(null, arguments); };
  var shadowCtl = function () { return ED.shadowCtl.apply(null, arguments); };
  var sec = function () { return ED.sec.apply(null, arguments); };
  var isVert = function (s) { return ED.isVert(s); };
  var isHoriz = function (s) { return ED.isHoriz(s); };
  var imgPanel = function (opts) { return ED.imgPanel(opts); };

  function m1TabHTML() {
    var ui = ED.ui;
    var tab = ui.m1tab || 'hero';
    return '<div class="ed-coltab">' +
      '<button type="button" data-act="m1-tab" data-value="hero"' + (tab === 'hero' ? ' class="is-on"' : '') + '>主内容</button>' +
      '<button type="button" data-act="m1-tab" data-value="list"' + (tab === 'list' ? ' class="is-on"' : '') + '>内部列表</button>' +
    '</div>';
  }

  function m2TabHTML() {
    var ui = ED.ui;
    var tab = ui.m2tab || 'hero';
    return '<div class="ed-coltab">' +
      '<button type="button" data-act="m2-tab" data-value="hero"' + (tab === 'hero' ? ' class="is-on"' : '') + '>主内容</button>' +
      '<button type="button" data-act="m2-tab" data-value="list"' + (tab === 'list' ? ' class="is-on"' : '') + '>内部列表</button>' +
    '</div>';
  }

  function m3TabHTML() {
    var ui = ED.ui;
    var tab = ui.m3tab || 'main';
    return '<div class="ed-coltab">' +
      '<button type="button" data-act="m3-tab" data-value="main"' + (tab === 'main' ? ' class="is-on"' : '') + '>主内容</button>' +
      '<button type="button" data-act="m3-tab" data-value="list1"' + (tab === 'list1' ? ' class="is-on"' : '') + '>内部列表1</button>' +
      '<button type="button" data-act="m3-tab" data-value="list2"' + (tab === 'list2' ? ' class="is-on"' : '') + '>内部列表2</button>' +
    '</div>';
  }


  function heroSection() {
    var state = ED.state;
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


  function heroImgTarget() {
    var state = ED.state;
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


  function heroStyleSection() {
    return '<div class="hero-entry-sec">' +
      '<div class="hero-entry-sec__title">个性化风格</div>' +
      '<button type="button" class="hero-entry-sec__btn">设置</button>' +
    '</div>';
  }


  function heroLinkSection() {
    return '<div class="hero-entry-sec">' +
      '<div class="hero-entry-sec__title">链接</div>' +
      '<button type="button" class="hero-entry-sec__btn">链接设置</button>' +
    '</div>';
  }


  function colTabHTML() {
    return m3TabHTML();
  }


  function colRange(s) {
    var ui = ED.ui;
    if (s.structure !== 'm3') return { start: 0, end: s.items.length };
    var split = s.layout.split || 8;
    if (ui.m3tab === 'list2' || ui.col === 2) {
      return { start: Math.min(split, s.items.length), end: s.items.length };
    }
    return { start: 0, end: Math.min(split, s.items.length) };
  }


  ED.m1TabHTML = m1TabHTML;
  ED.m2TabHTML = m2TabHTML;
  ED.m3TabHTML = m3TabHTML;
  ED.heroSection = heroSection;
  ED.heroImgTarget = heroImgTarget;
  ED.renderHeroModal = renderHeroModal;
  ED.heroStyleSection = heroStyleSection;
  ED.heroLinkSection = heroLinkSection;
  ED.colTabHTML = colTabHTML;
  ED.colRange = colRange;
})();
