/* =========================================================
   editor-defs.js — 结构基础配置、默认状态模型与样式预设
   ========================================================= */
(function () {
  'use strict';

  var ED = window.ED = window.ED || {};
  var D = window.DATA;

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
        margin: 0, marginMode: 'uni', marginT: 0, marginR: 0, marginB: 0, marginL: 0,
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
    if (structure === 'm2') {
      base.hero = {
        type: 'image',
        img: (D.m2 && D.m2.media) || D.m1.media,
        url: '',
        address: 'https://j.map.baidu.com/fb/Xsx',
        zoom: 14,
        w: 100,
        h: 600,
        compare: {
          active: 1,
          img1: { src: (D.m2 && D.m2.media) || D.m1.media, url: '', ratio: '3:4', effect: 'none' },
          img2: { src: (D.m2 && D.m2.mediaAlt) || D.m1.media, url: '', ratio: '3:4', effect: 'none' }
        }
      };
      if (D.m2) {
        base.text.title = D.m2.title || base.text.title;
        base.text.subtitle = D.m2.eyebrow || base.text.subtitle;
        base.text.intro = D.m2.lede || base.text.intro;
        base.text.button = { on: true, text: D.m2.cta || 'Read the full story', icon: 'right', theme: 'solid', link: '#m2' };
      }
    }
    if (structure === 'm3' && D.m3) {
      base.text.title = D.m3.title || base.text.title;
      base.text.subtitle = D.m3.eyebrow || base.text.subtitle;
      base.text.intro = D.m3.para || base.text.intro;
      base.text.button = { on: true, text: D.m3.cta || 'See all rooms', icon: 'right', theme: 'solid', link: '#m3' };
    }
    if (structure === 'm5') {
      base.carousel.on = true;
      base.carousel.arrows = true;
      base.carousel.dots = true;
      base.carousel.auto = false;
      base.layout.mode = 'icon';
      base.layout.align = 'start';
      base.layout.valign = 'center';
      base.layout.textAlign = 'left';
      base.layout.contentWidth = 54;
      base.layout.gap = 14; /* 轮播列表外层垂直间距（大标题/简介/列表整体/按钮） */
      base.layout.listColumns = 3; /* 内部列表网格布局列数（默认 3 列） */
      base.layout.listWidth = 100; /* 内部列表整体宽度（默认 100%） */
      base.layout.listAlign = 'start'; /* 内部列表整体对齐（左/中/右，默认 start） */
      base.layout.listItemAlign = 'left'; /* 内部列表图文对齐（图标+文字一起对齐，默认 left） */
      base.layout.listGap = 12; /* 内部列表项之间网格间距（默认 12px） */
      base.layout.textBg = {
        bgOn: false,
        bg: '#ffffffcc',
        borderOn: false,
        border: '#111418',
        borderStyle: 'solid',
        borderWidth: 1,
        radius: 12,
        radiusMode: 'uni',
        radiusTl: 12, radiusTr: 12, radiusBr: 12, radiusBl: 12,
        pad: 24,
        padMode: 'uni',
        padT: 24, padR: 24, padB: 24, padL: 24,
        followContent: true
      };
      base.layout.listTextBg = {
        bgOn: true,
        bg: '#ffffff',
        borderOn: true,
        border: 'rgba(0,0,0,0.08)',
        borderStyle: 'solid',
        borderWidth: 1,
        radius: 10,
        radiusMode: 'uni',
        radiusTl: 10, radiusTr: 10, radiusBr: 10, radiusBl: 10,
        pad: 14,
        padMode: 'uni',
        padT: 14, padR: 10, padB: 14, padL: 10
      };
      base.container.pad = 0; /* 整幅背景图铺满组件，不做内边距 */
      base.container.padMode = 'uni';
      base.container.bg = '#f6f8fa';
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
      /* 内部列表1 = 8 项（应用场景图标组），内部列表2 = 4 项（空间图文卡图片组） */
      var out = [];
      var apps = (D.m3 && D.m3.applications) || [];
      var spaces = (D.m3 && D.m3.spaces) || [];
      for (var i = 0; i < 8; i++) {
        var p = apps[i % apps.length] || {};
        out.push({
          img: imgs[i % imgs.length],
          title: p.title || ('应用场景' + (i + 1)),
          desc: p.desc || '',
          icon: p.icon || 'sparkle',
          value: VALUES[i % VALUES.length]
        });
      }
      for (var j = 0; j < 4; j++) {
        var sp = spaces[j % spaces.length] || {};
        out.push({
          img: sp.img || imgs[(j + 8) % imgs.length],
          title: sp.title || ('空间' + (j + 1)),
          desc: sp.desc || '',
          icon: 'grid',
          value: VALUES[(j + 8) % VALUES.length]
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

  ED.STRUCTURES = STRUCTURES;
  ED.MODES = MODES;
  ED.defaults = defaults;
  ED.VALUES = VALUES;
  ED.seedItems = seedItems;
  ED.PRESETS = PRESETS;
})();
