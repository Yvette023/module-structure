/* =========================================================
   结构3 · 左文 + 左列表 | 右列表
   变体：a 大图卡 / b 三段式（中图 + 右图标列表）/ c 缩略图文行 / d 图片宫格
   可变量：右侧列表形态 / 双栏·三栏 / 明暗主题
   ========================================================= */
(function () {
  var D = window.DATA;
  var icon = window.icon;

  var NOTES = {
    a: '<b>A · 右侧大图卡</b>：左边文案 + 4×2 图标网格，右边两张「图片 + 标题 + 说明」大卡。左右各成一个完整信息块，适合「应用场景」类内容。',
    b: '<b>B · 三段式</b>：文案（含圆形材质色板）| 中间竖图 | 右侧紧凑图标列表。三栏最有节奏感，但要求容器够宽。',
    c: '<b>C · 缩略图文行</b>：左边标签式列表一行排开，右边三条「小图 + 文字」横向图文行——右边信息更密，适合条目多的情况。',
    d: '<b>D · 图片宫格</b>：左边编号列表（带描述），右边 2×2 图片宫格，图注压在图上。左侧负责解释，右侧负责氛围。'
  };

  function intro() {
    return '<div class="m3__intro">' +
      '<p class="m3__eyebrow">' + D.m3.eyebrow + '</p>' +
      '<h3 class="m3__title">' + D.m3.title + '</h3>' +
      '<p class="m3__para">' + D.m3.para + '</p>' +
    '</div>';
  }

  function cta(cls) {
    return '<a class="btn ' + (cls || '') + '" href="#m3">' + D.m3.cta + icon('arrow') + '</a>';
  }

  /* ---- 左列表 ---- */
  function appGrid() {
    return '<ul class="m3__apps">' + D.m3.applications.map(function (a) {
      return '<li class="m3__app">' + icon(a.icon) + '<span>' + a.title + '</span></li>';
    }).join('') + '</ul>';
  }
  function swatches() {
    return '<ul class="m3__swatches">' + D.m3.finishes.map(function (f) {
      return '<li class="m3__swatch"><span class="m3__dot" style="--tone:' + f.tone + '"></span><span>' + f.title + '</span></li>';
    }).join('') + '</ul>';
  }
  function chips() {
    return '<ul class="m3__chips">' + D.m3.applications.map(function (a) {
      return '<li>' + icon(a.icon) + a.title + '</li>';
    }).join('') + '</ul>';
  }
  function steps() {
    return '<ol class="m3__steps">' + D.m3.spaces.map(function (s, i) {
      return '<li><span class="m3__step-no">0' + (i + 1) + '</span>' +
        '<div><h4>' + s.title + '</h4><p>' + s.desc + '</p></div></li>';
    }).join('') + '</ol>';
  }

  /* ---- 右列表 ---- */
  function bigCards(n) {
    return '<ul class="m3__cards">' + D.m3.spaces.slice(0, n).map(function (s) {
      return '<li class="m3__card">' +
        '<figure><img src="' + s.img + '" alt="' + s.title + '" loading="lazy" decoding="async"></figure>' +
        '<h4>' + s.title + '</h4><p>' + s.desc + '</p>' +
      '</li>';
    }).join('') + '</ul>';
  }
  function compactList() {
    return '<ul class="m3__compact">' + D.m3.applications.slice(0, 4).map(function (a) {
      return '<li>' + icon(a.icon) + '<div><h4>' + a.title + '</h4>' +
        '<p>' + a.desc + '</p></div></li>';
    }).join('') + '</ul>';
  }
  function rows(n) {
    return '<ul class="m3__rows">' + D.m3.spaces.slice(0, n).map(function (s) {
      return '<li class="m3__row">' +
        '<figure><img src="' + s.img + '" alt="' + s.title + '" loading="lazy" decoding="async"></figure>' +
        '<div><h4>' + s.title + '</h4><p>' + s.desc + '</p></div>' +
      '</li>';
    }).join('') + '</ul>';
  }
  function tiles() {
    return '<ul class="m3__tiles">' + D.m3.spaces.map(function (s) {
      return '<li class="m3__tile">' +
        '<img src="' + s.img + '" alt="' + s.title + '" loading="lazy" decoding="async">' +
        '<span>' + s.title + '</span>' +
      '</li>';
    }).join('') + '</ul>';
  }

  function render(s) {
    var main = '<div class="m3__main">' + intro() + cta() + '</div>';
    var aside = '';
    var mainWithList = '';

    if (s.variant === 'a') {
      mainWithList = '<div class="m3__main">' + intro() + appGrid() + cta() + '</div>';
      aside = bigCards(2);
      return '<div class="m3 m3--a"><div class="m3__grid">' + mainWithList + '<div class="m3__aside">' + aside + '</div></div></div>';
    }
    if (s.variant === 'b') {
      mainWithList = '<div class="m3__main">' + intro() + swatches() + cta() + '</div>';
      return '<div class="m3 m3--b"><div class="m3__grid">' + mainWithList +
        '<figure class="m3__media"><img src="' + D.m3.media + '" alt="材质细节" loading="lazy" decoding="async"></figure>' +
        '<div class="m3__aside">' + compactList() + '</div></div></div>';
    }
    if (s.variant === 'c') {
      mainWithList = '<div class="m3__main">' + intro() + chips() + cta() + '</div>';
      return '<div class="m3 m3--c"><div class="m3__grid">' + mainWithList +
        '<div class="m3__aside">' + rows(3) + '</div></div></div>';
    }
    mainWithList = '<div class="m3__main">' + intro() + steps() + cta() + '</div>';
    return '<div class="m3 m3--d"><div class="m3__grid">' + mainWithList +
      '<div class="m3__aside">' + tiles() + '</div></div></div>';
  }

  window.M3 = {
    defaults: { variant: 'a', tone: 'light' },
    controls: [
      {
        key: 'variant', label: '列表布局',
        options: [
          { value: 'a', label: 'A · 右侧大图卡' },
          { value: 'b', label: 'B · 三段式中图' },
          { value: 'c', label: 'C · 缩略图文行' },
          { value: 'd', label: 'D · 图片宫格' }
        ]
      },
      {
        key: 'tone', label: '主题',
        options: [
          { value: 'light', label: '浅色' },
          { value: 'dark', label: '深色' }
        ]
      }
    ],
    note: function (s) {
      return NOTES[s.variant];
    },
    apply: function (s) {
      var sec = document.getElementById('m3');
      if (sec) sec.classList.toggle('is-dark', s.tone === 'dark');
    },
    render: render
  };
})();
