/* =========================================================
   editor-m5.js — 结构5（轮播列表）专属面板组件与列表联动
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
  var sec = function () { return ED.sec.apply(null, arguments); };

  function m5Slide() {
    var state = ED.state, ui = ED.ui;
    return state.items[Math.min(ui.sel, state.items.length - 1)] || state.items[0] || {};
  }


  function m5SlideItems() {
    return m5Slide().list1 || [];
  }


  function m5ItemsSection() {
    var state = ED.state, ui = ED.ui;
    var slides = state.items;
    var list = m5SlideItems();
    var sub = Math.max(0, Math.min(ui.sub, list.length - 1));

    var tabs = '<div class="ed-coltab ed-coltab--m5">' +
      '<button type="button" data-act="m5-tab" data-value="slides"' + (ui.m5tab === 'slides' ? ' class="is-on"' : '') + '>轮播列表</button>' +
      '<button type="button" data-act="m5-tab" data-value="list"' + (ui.m5tab === 'list' ? ' class="is-on"' : '') + '>内部列表</button>' +
    '</div>';

    var body;
    if (ui.m5tab === 'list') {
      /* 内部列表：选中轮播页里的那一组列表项（图标 + 标题） */
      var innerThumbs = list.map(function (it, i) {
        return '<div class="thumb thumb--m5item' + (sub === i ? ' is-on' : '') + '" data-act="sub" data-idx="' + i + '" title="' + esc(it.title || '') + '">' +
          '<span class="thumb__del" data-act="del-sub" data-idx="' + i + '">' + icon('trash') + '</span>' +
          '<span class="thumb__box thumb__box--icon">' + icon(it.icon || 'sparkle') + '</span>' +
          '<span class="thumb__no">' + esc(it.title || ('项' + (i + 1))) + '</span>' +
        '</div>';
      }).join('');
      var addInnerBtn = '<div class="thumb thumb--add" data-act="add-sub">' +
        '<span class="thumb__box">' + icon('plus') + '</span>' +
        '<span class="thumb__no">新增</span></div>';
      body = '<div class="m5-tabctx">轮播图 ' + (ui.sel + 1) + ' · 内部列表项</div>' +
        row(
          '<span class="fcount">' + (sub + 1) + '/' + list.length + '</span>' +
          '<button class="flink" data-act="add-sub">' + icon('plus') + '新增</button>') +
        '<div class="thumbs thumbs--m5">' + innerThumbs + addInnerBtn + '</div>';
    } else {
      /* 轮播列表：轮播页海报背景图 */
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


  ED.m5Slide = m5Slide;
  ED.m5SlideItems = m5SlideItems;
  ED.m5ItemsSection = m5ItemsSection;
})();
