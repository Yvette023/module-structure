/* =========================================================
   main.js — 控制条生成 / 状态 / 渲染调度
   ========================================================= */
(function () {
  'use strict';

  var DEFS = { m1: window.M1, m2: window.M2, m3: window.M3, m4: window.M4, m5: window.M5 };
  var IDS = ['m1', 'm2', 'm3', 'm4', 'm5'];
  var state = {};

  function coerce(v) {
    return /^\d+$/.test(v) ? Number(v) : v;
  }

  function buildCtrl(id, def) {
    function groupHTML(g) {
      var chips = g.options.map(function (o) {
        return '<button type="button" class="chip" data-key="' + g.key +
          '" data-value="' + o.value + '">' + o.label + '</button>';
      }).join('');
      return '<div class="ctrl__group" data-group="' + g.key + '">' +
        '<span class="ctrl__label">' + g.label + '</span>' +
        '<span class="ctrl__chips">' + chips + '</span>' +
      '</div>';
    }
    /* 第一行：列表布局；第二行：数量 / 方向 / 间距 / 圆角等参数 */
    var first = groupHTML(def.controls[0]);
    var rest = def.controls.slice(1).map(groupHTML).join('');
    return '<div class="ctrl__row">' + first + '</div>' +
      (rest ? '<div class="ctrl__row ctrl__row--params">' + rest + '</div>' : '');
  }

  function paintChips(id) {
    var host = document.querySelector('[data-ctrl="' + id + '"]');
    if (!host) return;
    var s = state[id];
    Array.prototype.forEach.call(host.querySelectorAll('.chip'), function (c) {
      var on = String(s[c.dataset.key]) === c.dataset.value;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

  }

  function render(id, animate) {
    var def = DEFS[id];
    var stage = document.querySelector('[data-stage="' + id + '"]');
    if (!stage) return;
    stage.innerHTML = def.render(state[id]);
    paintChips(id);
    if (def.apply) def.apply(state[id]);
    if (animate !== false) {
      stage.classList.remove('is-anim');
      void stage.offsetWidth;
      stage.classList.add('is-anim');
    }
  }

  IDS.forEach(function (id) {
    var def = DEFS[id];
    if (!def) return;
    state[id] = Object.assign({}, def.defaults);

    var host = document.querySelector('[data-ctrl="' + id + '"]');
    if (host) {
      host.innerHTML = buildCtrl(id, def);
      host.addEventListener('click', function (e) {
        var btn = e.target.closest('.chip');
        if (!btn || btn.disabled) return;
        var key = btn.dataset.key;
        var val = coerce(btn.dataset.value);
        if (state[id][key] === val) return;
        state[id][key] = val;
        render(id);
      });
    }

    render(id, false);
  });

  /* 图片加载完成后轻微淡化，避免闪烁 */
  document.addEventListener(
    'load',
    function () {
      document.querySelectorAll('.stage img').forEach(function (img) {
        img.style.opacity = '1';
      });
    },
    true
  );
})();
