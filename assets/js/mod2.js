/* =========================================================
   结构2 · 一侧文案 + 列表，另一侧整图
   变体：列表样式 check 勾选网格 / icon 图标列表 / num 编号步骤 / stat 数据行
   可变量：左右镜像 / 图片占比 40·50·60
   ========================================================= */
(function () {
  var D = window.DATA;
  var icon = window.icon;

  var NOTES = {
    check: '<b>勾选网格</b>：2 列紧凑勾选项，只有短标题、没有描述——信息扫读最快，适合「保障 / 支持」类条目。',
    icon: '<b>图标列表</b>：单列，图标 + 标题 + 一句解释，右侧留给大图，适合需要说服力时的重点 4 条。',
    num: '<b>编号步骤</b>：01–04 纵向排列，用细分割线切段，天然带「流程 / 服务步骤」语义。',
    stat: '<b>数据行</b>：左侧大数字、右侧一句说明，用数据做论据，适合业绩、规模、口碑类模块。'
  };

  var lists = {
    check: function () {
      return '<ul class="m2__list m2__list--check">' +
        D.m2.items.slice(0, 6).map(function (it) {
          return '<li class="m2__item">' + icon('checkCircle', 'is-accent') +
            '<span>' + it.title + '</span></li>';
        }).join('') + '</ul>';
    },
    icon: function () {
      return '<ul class="m2__list m2__list--icon">' +
        D.m2.items.slice(0, 4).map(function (it) {
          return '<li class="m2__item"><span class="m2__badge">' + icon(it.icon) + '</span>' +
            '<div class="m2__text"><h4>' + it.title + '</h4><p>' + it.desc + '</p></div></li>';
        }).join('') + '</ul>';
    },
    num: function () {
      return '<ul class="m2__list m2__list--num">' +
        D.m2.items.slice(0, 4).map(function (it, i) {
          return '<li class="m2__item"><span class="m2__num">0' + (i + 1) + '</span>' +
            '<div class="m2__text"><h4>' + it.title + '</h4><p>' + it.desc + '</p></div></li>';
        }).join('') + '</ul>';
    },
    stat: function () {
      return '<ul class="m2__list m2__list--stat">' +
        D.m2.stats.map(function (st) {
          return '<li class="m2__item"><span class="m2__stat">' + st.value + '</span>' +
            '<div class="m2__text"><h4>' + st.label + '</h4><p>' + st.desc + '</p></div></li>';
        }).join('') + '</ul>';
    }
  };

  function render(s) {
    var cls = 'm2 m2--list-' + s.list + ' is-r' + s.ratio + (s.layout === 'right' ? ' is-reversed' : '');
    return '<div class="' + cls + '">' +
      '<div class="m2__grid">' +
        '<div class="m2__body">' +
          '<p class="m2__eyebrow">' + D.m2.eyebrow + '</p>' +
          '<h3 class="m2__title">' + D.m2.title + '</h3>' +
          '<p class="m2__lede">' + D.m2.lede + '</p>' +
          lists[s.list]() +
          '<a class="btn m2__cta" href="#m2">' + D.m2.cta + icon('arrow') + '</a>' +
        '</div>' +
        '<figure class="m2__media">' +
          '<img src="' + (s.layout === 'right' ? D.m2.mediaAlt : D.m2.media) + '" alt="空间图" loading="lazy" decoding="async">' +
        '</figure>' +
      '</div>' +
    '</div>';
  }

  window.M2 = {
    defaults: { layout: 'left', list: 'check', ratio: 45 },
    controls: [
      {
        key: 'list', label: '列表布局',
        options: [
          { value: 'check', label: '勾选网格' },
          { value: 'icon', label: '图标列表' },
          { value: 'num', label: '编号步骤' },
          { value: 'stat', label: '数据行' }
        ]
      },
      {
        key: 'layout', label: '图文位置',
        options: [
          { value: 'left', label: '左文左列表 + 右图' },
          { value: 'right', label: '右文右列表 + 左图' }
        ]
      },
      {
        key: 'ratio', label: '图片占比',
        options: [
          { value: 40, label: '40%' },
          { value: 45, label: '45%' },
          { value: 55, label: '55%' }
        ]
      }
    ],
    note: function (s) {
      var side = s.layout === 'right' ? '图文左右镜像：图在左、文案与列表靠右对齐' : '文案与列表在左，整图在右';
      return NOTES[s.list] + '<br>' + side + '，图片占 ' + s.ratio + '%，改占比可微调文字栏与图片的视觉重量。';
    },
    render: render
  };
})();
