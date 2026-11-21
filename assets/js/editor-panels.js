/* =========================================================
   editor-panels.js — 各设置面板（图文/文本/按钮/布局/背景/图片/更多设置）
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
  var num = function () { return ED.num.apply(null, arguments); };
  var getPath = function (p) { return ED.getPath(p); };
  var color = function () { return ED.color.apply(null, arguments); };
  var select = function () { return ED.select.apply(null, arguments); };
  var range = function () { return ED.range.apply(null, arguments); };
  var dimCtl = function () { return ED.dimCtl.apply(null, arguments); };
  var shadowCtl = function () { return ED.shadowCtl.apply(null, arguments); };
  var sec = function () { return ED.sec.apply(null, arguments); };
  var isVert = function (s) { return ED.isVert(s); };
  var isHoriz = function (s) { return ED.isHoriz(s); };

  var m5ItemsSection = function () { return ED.m5ItemsSection(); };
  var m1TabHTML = function () { return ED.m1TabHTML(); };
  var colTabHTML = function () { return ED.colTabHTML(); };
  var colRange = function (s) { return ED.colRange(s); };
  var heroStyleSection = function () { return ED.heroStyleSection(); };
  var heroLinkSection = function () { return ED.heroLinkSection(); };
  var MODES = ED.MODES;
  var PRESETS = ED.PRESETS;

  var STRIP = [
    { id: 'layout', icon: 'alignLeft', title: '布局排版' },
    { id: 'bg', icon: 'brush', title: '背景设置' },
    { id: 'img', icon: 'image', title: '图片风格' },
    { id: 'video', icon: 'video', title: '视频设置' },
    { id: 'carousel', icon: 'carousel', title: '轮播设置' },
    { id: 'seo', icon: 'seo', title: 'SEO设置' },
    { id: 'show', icon: 'eye', title: '显示设置' }
  ];



  function itemsSection() {
    var state = ED.state, ui = ED.ui;
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
    var state = ED.state;
    var v = state.video;
    var body = row('<span class="flabel">视频</span>' +
      '<button class="flink" data-act="toggle" data-bind="video.on">' +
      icon(v.on ? 'check' : 'plus') + (v.on ? '已添加' : '新增') + '</button>');
    return body;
  }


  function textSection() {
    var state = ED.state, ui = ED.ui;
    var s = state;
    var body = '';
    if (s.structure === 'm5') {
      var sl = s.items[Math.min(ui.sel, s.items.length - 1)] || s.items[0] || {};
      if (ui.m5tab === 'list') {
        /* 内部列表 tab：编辑选中列表项（列表只要标题） */
        var list = sl.list1 || [];
        var it = list[Math.min(ui.sub, list.length - 1)] || list[0] || {};
        body += '<div class="frow"><span class="flabel" style="color:#1e6fff">内部列表 · 轮播 ' + (ui.sel + 1) +
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
    var state = ED.state;
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
    var state = ED.state;
    return row(label('模块链接')) + inp('link', state.link || '', '点击整个模块跳转的地址');
  }


  function moreSection() {
    var ui = ED.ui;
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


  function alignDualField(title, hBind, hVal, hOpts, vBind, vVal, vOpts, vDisabled) {
    return row(label(title)) +
      '<div class="frow" style="margin-top:6px">' +
        '<div class="fseg-pair">' +
          seg(hBind, hVal, hOpts) +
          seg(vBind, vVal, vOpts, vDisabled ? 'is-disabled' : '') +
        '</div>' +
      '</div>';
  }

  function layoutPanel() {
    var state = ED.state, ui = ED.ui;
    var s = state;
    var m = MODES[s.structure];
    var body;

    if (s.structure === 'm5') {
      if (ui.m5tab === 'list') {
        /* 轮播列表 · 内部列表：列表布局（3列下拉）、容器对齐（仅左中右生效，上中下禁用）、图文对齐、宽度（仅列表组）、列表间距（卡片网格gap） */
        body = row(label('列表布局')) + select('layout.listColumns', s.layout.listColumns || 3, [
          { v: 1, l: '1列' },
          { v: 2, l: '2列' },
          { v: 3, l: '3列' },
          { v: 4, l: '4列' }
        ]);
        body += alignDualField('容器对齐',
          'layout.listAlign', s.layout.listAlign || 'start', [
            { v: 'start', icon: 'alignBoxLeft' },
            { v: 'center', icon: 'alignBoxCenter' },
            { v: 'end', icon: 'alignBoxRight' }
          ],
          'layout.valign', s.layout.valign || 'center', [
            { v: 'start', icon: 'alignBoxTop' },
            { v: 'center', icon: 'alignBoxMiddle' },
            { v: 'end', icon: 'alignBoxBottom' }
          ],
          true /* 上中下对齐禁用 */
        );
        body += row(label('图文对齐')) + seg('layout.listItemAlign', s.layout.listItemAlign || 'left', [
          { v: 'left', icon: 'alignLeft' }, { v: 'center', icon: 'alignCenter' }, { v: 'right', icon: 'alignRight' }
        ], 'fseg--wide');
        body += row(label('宽度')) + range('layout.listWidth', s.layout.listWidth != null ? s.layout.listWidth : 100, 30, 100, 1, '%');
        body += dimCtl({ label: '列表间距', field: 'layout.listGap', modeBind: 'layout.listGapMode', type: 'gap', min: 0, max: 48 });
        return body;
      }

      /* 轮播列表 · 轮播列表（主层）：容器对齐（9宫格）、文案对齐、宽度（大标题简介按钮整体）、间距（外层垂直间隙） */
      var m5HAlign = s.layout.align || 'start';
      var m5VAlign = s.layout.valign || 'center';
      body = alignDualField('容器对齐',
        'layout.align', m5HAlign, [
          { v: 'start', icon: 'alignBoxLeft' },
          { v: 'center', icon: 'alignBoxCenter' },
          { v: 'end', icon: 'alignBoxRight' }
        ],
        'layout.valign', m5VAlign, [
          { v: 'start', icon: 'alignBoxTop' },
          { v: 'center', icon: 'alignBoxMiddle' },
          { v: 'end', icon: 'alignBoxBottom' }
        ]
      );
      body += row(label('文案对齐')) + seg('layout.textAlign', s.layout.textAlign || 'left', [
        { v: 'left', icon: 'alignLeft' }, { v: 'center', icon: 'alignCenter' }, { v: 'right', icon: 'alignRight' }
      ], 'fseg--wide');
      body += row(label('宽度')) + range('layout.contentWidth', s.layout.contentWidth || s.layout.width || 54, 30, 100, 1, '%');
      body += dimCtl({ label: '间距', field: 'layout.gap', modeBind: 'layout.gapMode', type: 'gap', min: 0, max: 48 });
      return body;
    }

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
      /* 双排列表：竖向 = 「图文对齐」(左中右)；横向（左图右文/右图左文/图片靠内/图片靠外） = 「文案对齐」(左中右) */
      var vert = isVert(s);
      if (vert) {
        body += row(label('图文对齐')) + seg('layout.imgAlignX', s.layout.imgAlignX, [
          { v: 'left', icon: 'alignLeft' }, { v: 'center', icon: 'alignCenter' }, { v: 'right', icon: 'alignRight' }
        ], 'fseg--wide');
      } else {
        body += row(label('文案对齐')) + seg('layout.textAlign', s.layout.textAlign, [
          { v: 'left', icon: 'alignLeft' }, { v: 'center', icon: 'alignCenter' }, { v: 'right', icon: 'alignRight' }
        ], 'fseg--wide');
      }
    } else if (s.structure !== 'm5') {
      body += row(label('容器对齐')) + seg('layout.align', s.layout.align, [
        { v: 'start', icon: 'alignLeft' }, { v: 'center', icon: 'alignCenter' }, { v: 'end', icon: 'alignRight' }
      ], 'fseg--wide');
    }
    if (s.structure !== 'm1' && s.structure !== 'm5') {
      body += row(label('文案对齐')) + seg('layout.textAlign', s.layout.textAlign, [
        { v: 'left', icon: 'alignLeft' }, { v: 'center', icon: 'alignCenter' }, { v: 'right', icon: 'alignRight' }
      ], 'fseg--wide');
    }
    if (s.structure === 'm1') {
      /* 双排列表：上下对齐（主图 vs 列表），列中间距 + 图文比例 */
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
    } else if (s.structure !== 'm5') {
      body += row(label('宽度')) + range('layout.width', s.layout.width, 30, 100, 1, '%');
    }
    if (s.structure === 'm4') {
      body += dimCtl({ label: '列中间距', field: 'layout.gap', modeBind: 'layout.gapMode', type: 'gap', min: 0, max: 80 });
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
    var state = ED.state;
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
    var state = ED.state;
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


  function videoPanel() {
    var state = ED.state;
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
    var state = ED.state;
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
    var state = ED.state;
    var s = state.seo;
    return row(label('ALT 标签') + sw('seo.alt', s.alt)) +
      inp('seo.altText', s.altText, '图片替代文本') +
      row(label('标题属性') + sw('seo.titleAttr', s.titleAttr)) +
      inp('seo.titleText', s.titleText, '鼠标悬停提示');
  }


  function showPanel() {
    var state = ED.state;
    var s = state.show;
    return row(label('标题') + sw('show.title', s.title)) +
      row(label('副标题') + sw('show.subtitle', s.subtitle)) +
      row(label('简介') + sw('show.intro', s.intro)) +
      row(label('按钮') + sw('show.button', s.button));
  }


  function motionPanel() {
    var state = ED.state;
    var m = state.motion;
    return row(label('入场动画')) + seg('motion.type', m.type, [
      { v: 'none', l: '无' }, { v: 'fade', l: '淡入' },
      { v: 'up', l: '上移' }, { v: 'zoom', l: '缩放' }
    ], 'fseg--wide') +
      row(label('时长')) + range('motion.duration', m.duration, 200, 1500, 50, 'ms') +
      row(label('延迟')) + range('motion.delay', m.delay, 0, 800, 50, 'ms') +
      '<div class="frow"><button class="fbtn" data-act="preview" style="width:100%;height:32px;border-radius:6px;background:#1e6fff;color:#fff;font-size:12.5px">预览动画</button></div>'
  }


  function presetPanel() {
    var state = ED.state;
    return '<div class="presets">' + PRESETS.map(function (p) {
      return '<button class="preset' + (state.preset === p.id ? ' is-on' : '') + '" data-act="preset" data-id="' + p.id + '">' +
        '<span class="preset__swatch"><i style="background:' + (p.apply.container.bg || '#0b0b0c') + '"></i><i style="background:' + (p.apply.card.bg || '#2a2f38') + '"></i></span>' +
        '<span><span class="preset__name">' + p.name + '</span>' +
        '<span class="preset__desc">' + p.desc + '</span></span>' +
      '</button>';
    }).join('') + '</div>'
  }


  ED.STRIP = STRIP;
  ED.itemsSection = itemsSection;
  ED.videoSection = videoSection;
  ED.textSection = textSection;
  ED.buttonSection = buttonSection;
  ED.linkSection = linkSection;
  ED.moreSection = moreSection;
  ED.layoutPanel = layoutPanel;
  ED.bgPanel = bgPanel;
  ED.imgPanel = imgPanel;
  ED.videoPanel = videoPanel;
  ED.carouselPanel = carouselPanel;
  ED.seoPanel = seoPanel;
  ED.showPanel = showPanel;
  ED.motionPanel = motionPanel;
  ED.presetPanel = presetPanel;
})();
