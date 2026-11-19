/* =========================================================
   结构1 · 中心图 + 左右双排列表
   变体：a 双列均布 / b 错位偏移 / c 紧凑内联 / d 编号序号
   可变量：数量 4·6·8 / 方向 竖向·横向（含阅读顺序）/ 样式
   ========================================================= */
(function () {
  var D = window.DATA;
  var icon = window.icon;

  var NOTES = {
    a: '<b>A · 双列均布</b>：左右各一列，图标在上、文案居中，沿竖向等距铺满图片高度——最常见的稳妥版式。',
    b: '<b>B · 错位偏移</b>：两列整体上下错开，靠图一侧文字向图对齐，图片拉高，节奏更像杂志跨页。',
    c: '<b>C · 紧凑内联</b>：图标移到标题左侧、方正小底板，信息密度最高，适合 8 条以上的卖点。',
    d: '<b>D · 编号序号</b>：去掉图标改用大号数字 01–0N 做视觉锤，适合「步骤 / 理由 / 优势」类并列内容。'
  };

  function pairs(items, dir, count) {
    var list = items.slice(0, count).map(function (it, i) { return { it: it, i: i }; });
    if (dir === 'v') {
      var half = Math.ceil(list.length / 2);
      return [list.slice(0, half), list.slice(half)];
    }
    return [
      list.filter(function (_, i) { return i % 2 === 0; }),
      list.filter(function (_, i) { return i % 2 === 1; })
    ];
  }

  function listHTML(group, variant) {
    return '<ul class="m1__list">' + group.map(function (o) {
      var badge = variant === 'd'
        ? '<span class="m1__num">' + ('0' + (o.i + 1)).slice(-2) + '</span>'
        : '<span class="m1__icon">' + icon(o.it.icon) + '</span>';
      return '<li class="m1__item">' + badge +
        '<div class="m1__text"><h3>' + o.it.title + '</h3><p>' + o.it.desc + '</p></div></li>';
    }).join('') + '</ul>';
  }

  function render(s) {
    var g = pairs(D.m1.items, s.dir, s.count);
    var cls = [
      'm1', 'm1--' + s.variant,
      'count-' + s.count,
      s.dir === 'h' ? 'is-h' : 'is-v',
      s.dir === 'h' && s.count > 4 ? 'is-h-dense' : ''
    ].join(' ').trim();

    return '<div class="' + cls + '">' +
      '<div class="m1__grid">' +
        '<div class="m1__col m1__col--left">' + listHTML(g[0], s.variant) + '</div>' +
        '<figure class="m1__media">' +
          '<img src="' + D.m1.media + '" alt="主视觉" loading="lazy" decoding="async">' +
        '</figure>' +
        '<div class="m1__col m1__col--right">' + listHTML(g[1], s.variant) + '</div>' +
      '</div>' +
    '</div>';
  }

  window.M1 = {
    defaults: { variant: 'a', count: 6, dir: 'v' },
    controls: [
      {
        key: 'variant', label: '列表布局',
        options: [
          { value: 'a', label: 'A · 双列均布' },
          { value: 'b', label: 'B · 错位偏移' },
          { value: 'c', label: 'C · 紧凑内联' },
          { value: 'd', label: 'D · 编号序号' }
        ]
      },
      {
        key: 'count', label: '列表数量',
        options: [
          { value: 4, label: '4 项（2+2）' },
          { value: 6, label: '6 项（3+3）' },
          { value: 8, label: '8 项（4+4）' }
        ]
      },
      {
        key: 'dir', label: '排布方向',
        options: [
          { value: 'v', label: '竖向 · 上下' },
          { value: 'h', label: '横向 · 左右' }
        ]
      }
    ],
    note: function (s) {
      var order = s.dir === 'v'
        ? '阅读顺序为竖向顺读：左侧 1–' + Math.ceil(s.count / 2) + '，右侧 ' + (Math.ceil(s.count / 2) + 1) + '–' + s.count
        : '阅读顺序为左右交替：左 1/3/5…，右 2/4/6…，列表项本身也横向并排';
      return NOTES[s.variant] + '<br>' + order + '。';
    },
    render: render
  };
})();
