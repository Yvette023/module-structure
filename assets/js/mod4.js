/* =========================================================
   结构4 · 复合图片列表
   变体：a 双大图 / b 瀑布拼排 / c 一大两小 / d 大图+四小（bento）
   可变量：间距 / 圆角 / 图注
   ========================================================= */
(function () {
  var D = window.DATA;

  var NOTES = {
    a: '<b>A · 双大图并列</b>：两张同尺寸大图 1:1 对置，最稳、最像作品集跨页；图片越多越要慎用。',
    b: '<b>B · 瀑布拼排</b>：5 张图在不同行跨度里错落，视线沿「大—小—大」走，页面对比最强。',
    c: '<b>C · 一大两小</b>：左侧一张横向大图压住节奏，右侧两张小图做细节补充，适合「主空间 + 局部」。',
    d: '<b>D · Bento 宫格</b>：一张 2×2 主图配四张小图，信息量最大，适合相册 / 案例合集入口。'
  };

  var CELLS = { a: 2, b: 5, c: 3, d: 5 };

  function render(s) {
    var n = CELLS[s.variant] || 4;
    var gap = { s: 'is-gap-s', m: 'is-gap-m', l: 'is-gap-l' }[s.gap] || 'is-gap-m';
    var radius = { r0: 'is-r0', r12: 'is-r12', r20: 'is-r20' }[s.radius] || 'is-r12';
    var cls = 'm4 m4--' + s.variant + ' ' + gap + ' ' + radius + (s.caps === 'on' ? ' has-caps' : '');

    var cells = D.m4.gallery.slice(0, n).map(function (g, i) {
      return '<li class="m4__cell m4__cell--' + (i + 1) + '">' +
        '<img src="' + g.img + '" alt="' + g.caption + '" loading="lazy" decoding="async">' +
        '<span class="m4__cap"><b>' + g.caption + '</b><em>' + g.tag + '</em></span>' +
      '</li>';
    }).join('');

    return '<div class="' + cls + '"><ul class="m4__grid">' + cells + '</ul></div>';
  }

  window.M4 = {
    defaults: { variant: 'b', gap: 'm', radius: 'r12', caps: 'on' },
    controls: [
      {
        key: 'variant', label: '列表布局',
        options: [
          { value: 'a', label: 'A · 双大图' },
          { value: 'b', label: 'B · 瀑布拼排' },
          { value: 'c', label: 'C · 一大两小' },
          { value: 'd', label: 'D · Bento 宫格' }
        ]
      },
      {
        key: 'gap', label: '图片间距',
        options: [
          { value: 's', label: '紧凑 6px' },
          { value: 'm', label: '适中 14px' },
          { value: 'l', label: '宽松 26px' }
        ]
      },
      {
        key: 'radius', label: '圆角',
        options: [
          { value: 'r0', label: '直角' },
          { value: 'r12', label: '12px' },
          { value: 'r20', label: '20px' }
        ]
      },
      {
        key: 'caps', label: '图注',
        options: [
          { value: 'on', label: '显示' },
          { value: 'off', label: '隐藏' }
        ]
      }
    ],
    note: function (s) {
      return NOTES[s.variant] + '<br>当前：' + CELLS[s.variant] + ' 张图 · 间距 ' +
        { s: '6px', m: '14px', l: '26px' }[s.gap] + ' · 图注' + (s.caps === 'on' ? '显示（悬停浮出）' : '隐藏') + '。';
    },
    render: render
  };
})();
