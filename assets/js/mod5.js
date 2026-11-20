/* =========================================================
   结构5 · 轮播列表（轮播图组件内嵌列表）
   每个轮播页 = 整幅背景图 + 标题文案 + 一组列表（列1）
   变体：列表样式 icon/num/check/row × 文字位置 左/右/居中浮卡
   可变量：轮播页数 / 轮播控制 / 自动播放
   ========================================================= */
(function () {
  var D = window.DATA;
  var icon = window.icon;

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* 当前轮播页码（模块级，跨渲染保留） */
  var cur = 0;
  var timer = null;

  /* 列表项：只保留 图标 + 标题 */
  function itemHTML(mode, it, i) {
    var title = '<div class="m5__text"><h4>' + esc(it.title) + '</h4></div>';
    if (mode === 'num') {
      return '<li class="m5__item"><span class="m5__num">0' + (i + 1) + '</span>' + title + '</li>';
    }
    if (mode === 'check') {
      return '<li class="m5__item">' + icon('check') + '<span>' + esc(it.title) + '</span></li>';
    }
    if (mode === 'row') {
      return '<li class="m5__item"><span class="m5__thumb"><img src="' + esc(it.img || '') +
        '" alt="" loading="lazy" decoding="async"></span>' + title + '</li>';
    }
    /* 默认：图标格 */
    return '<li class="m5__item"><span class="m5__icon">' + icon(it.icon || 'sparkle') + '</span>' + title + '</li>';
  }

  function slideHTML(sl, mode) {
    var list = (sl.list1 || []).slice(0, 8);
    return '<li class="m5__slide">' +
      '<div class="m5__frame">' +
        '<figure class="m5__media"><img src="' + esc(sl.img) + '" alt="" loading="lazy" decoding="async"></figure>' +
        '<div class="m5__body">' +
          '<p class="m5__eyebrow">' + esc(sl.eyebrow) + '</p>' +
          '<h3 class="m5__title">' + esc(sl.title) + '</h3>' +
          (sl.lede ? '<p class="m5__lede">' + esc(sl.lede) + '</p>' : '') +
          '<ul class="m5__list">' + list.map(function (it, i) { return itemHTML(mode, it, i); }).join('') + '</ul>' +
          '<a class="btn m5__cta" href="#">' + esc('Discover the collection') + '</a>' +
        '</div>' +
      '</div>' +
    '</li>';
  }

  function render(s) {
    var count = Math.max(1, s.count || 3);
    var slides = D.m5.slides.slice(0, count);
    var page = cur % slides.length;
    var cls = 'm5 m5--' + s.mode + ' m5--' + s.position + ' count-' + count;
    var track = '<div class="m5__viewport"><div class="m5__track"' +
      ' style="transform:translateX(-' + (page * 100) + '%)">' +
      slides.map(function (sl) { return slideHTML(sl, s.mode); }).join('') +
      '</div></div>';

    var showArrows = s.nav === 'both' || s.nav === 'arrows';
    var showDots = s.nav === 'both' || s.nav === 'dots';
    var arrows = showArrows
      ? '<i class="m5__arrow m5__arrow--prev" data-m5-act="prev">' + icon('arrow', 'm5-flip') + '</i>' +
        '<i class="m5__arrow m5__arrow--next" data-m5-act="next">' + icon('arrow') + '</i>'
      : '';
    var dots = showDots
      ? '<div class="m5__dots">' + slides.map(function (_, p) {
          return '<i class="' + (p === page ? 'is-on' : '') + '" data-m5-act="goto" data-m5-goto="' + p + '"></i>';
        }).join('') + '</div>'
      : '';

    return '<div class="' + cls + '" data-m5>' + track + arrows + dots + '</div>';
  }

  function apply(s) {
    var stage = document.querySelector('[data-stage="m5"]');
    if (!stage) return;
    /* 每次渲染都记录最新状态，供委托监听读取（避免闭包里的旧值） */
    stage.__m5State = s;

    /* 委托监听：只绑一次，避免每次渲染重复绑定 */
    if (!stage.getAttribute('data-m5-bound')) {
      stage.setAttribute('data-m5-bound', '1');
      stage.addEventListener('click', function (e) {
        var t = e.target.closest('[data-m5-act]');
        if (!t) return;
        var st = stage.__m5State || s;
        var count = Math.max(1, st.count || 3);
        if (t.dataset.m5Act === 'prev') cur = (cur - 1 + count) % count;
        else if (t.dataset.m5Act === 'next') cur = (cur + 1) % count;
        else cur = Number(t.dataset.m5Goto || 0);
        stage.innerHTML = render(st);
      });
    }

    /* 自动播放 */
    if (timer) { clearInterval(timer); timer = null; }
    if (s.auto === 'on' && (s.count || 3) > 1) {
      timer = setInterval(function () {
        cur = (cur + 1) % (s.count || 3);
        stage.innerHTML = render(s);
      }, 4200);
    }
  }

  window.M5 = {
    defaults: { count: 3, mode: 'icon', position: 'left', nav: 'both', auto: 'off' },
    controls: [
      {
        key: 'count', label: '轮播页数',
        options: [
          { value: 2, label: '2 页' },
          { value: 3, label: '3 页' },
          { value: 4, label: '4 页' }
        ]
      },
      {
        key: 'mode', label: '列表样式',
        options: [
          { value: 'icon', label: '图标列表' },
          { value: 'num', label: '编号列表' },
          { value: 'check', label: '勾选列表' },
          { value: 'row', label: '图文行' }
        ]
      },
      {
        key: 'position', label: '文字位置',
        options: [
          { value: 'left', label: '文字居左' },
          { value: 'right', label: '文字居右' },
          { value: 'bg', label: '居中浮卡' }
        ]
      },
      {
        key: 'nav', label: '轮播控制',
        options: [
          { value: 'both', label: '箭头+分页' },
          { value: 'arrows', label: '仅箭头' },
          { value: 'dots', label: '仅分页' },
          { value: 'none', label: '无' }
        ]
      },
      {
        key: 'auto', label: '自动播放',
        options: [
          { value: 'off', label: '关' },
          { value: 'on', label: '开' }
        ]
      }
    ],
    render: render,
    apply: apply
  };
})();
