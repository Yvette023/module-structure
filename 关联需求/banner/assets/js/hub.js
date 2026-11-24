/* =========================================================
   hub.js — 原型入口：布局预览 / 复制智能体演示
   ========================================================= */
(function () {
  'use strict';

  var D = window.BANNER_DATA;
  var tpl = D.templates[0];
  var bannerHost = document.getElementById('heroBanner');
  var switchHost = document.getElementById('heroLayouts');
  var layoutName = document.getElementById('heroLayoutName');
  var current = 'left-img';
  var timer = null;
  var copied = false;

  /* 图标填充 */
  document.querySelectorAll('[data-ic]').forEach(function (n) {
    n.innerHTML = UI.icon(n.getAttribute('data-ic'));
  });

  /* 顶部布局切换 */
  D.layouts.forEach(function (l) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lv-btn' + (l.id === current ? ' is-active' : '');
    b.setAttribute('data-layout', l.id);
    b.title = l.full;
    b.innerHTML = UI.glyph(l.id) + '<span>' + l.name + '</span>';
    b.addEventListener('click', function () {
      stopAuto();
      switchLayout(l.id);
    });
    switchHost.appendChild(b);
  });

  function switchLayout(id) {
    if (id === current) {
      updateActive();
      return;
    }
    current = id;
    updateActive();
    if (layoutName) layoutName.textContent = UI.layoutMeta(id).name;
    bannerHost.style.opacity = '0';
    setTimeout(function () {
      UI.renderBanner(bannerHost, { layout: id, template: tpl, ratio: '16:9' });
      bannerHost.style.opacity = '1';
    }, 90);
    bannerHost.style.transition = 'opacity .18s ease';
  }

  function updateActive() {
    switchHost.querySelectorAll('.lv-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-layout') === current);
    });
  }

  function startAuto() {
    var ids = D.layouts.map(function (l) { return l.id; });
    timer = setInterval(function () {
      var i = ids.indexOf(current);
      switchLayout(ids[(i + 1) % ids.length]);
    }, 4200);
  }
  function stopAuto() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  UI.renderBanner(bannerHost, { layout: current, template: tpl, ratio: '16:9' });
  if (layoutName) layoutName.textContent = UI.layoutMeta(current).name;

  /* 复制智能体 */
  function openCopy() {
    if (copied) { location.href = 'admin.html?view=workflow'; return; }
    UI.openModal('copyModal');
    var input = document.getElementById('copyName');
    if (copied) input.value = 'banner生成-副本 2';
    setTimeout(function () { input.focus(); input.select(); }, 80);
  }
  document.querySelectorAll('[data-act="copy"]').forEach(function (b) {
    b.addEventListener('click', openCopy);
  });

  document.getElementById('copyConfirm').addEventListener('click', function () {
    var name = document.getElementById('copyName').value.trim();
    if (!name) {
      UI.toast('请填写副本名称', 'warn');
      document.getElementById('copyName').focus();
      return;
    }
    copied = true;
    UI.closeModal('copyModal');
    UI.toast('已复制「' + name + '」，工作流与 4 个模版已同步');

    var flow = document.getElementById('flowCopy');
    flow.classList.add('is-done');
    document.getElementById('flowCopyNum').innerHTML = UI.icon('check');
    document.getElementById('flowCopyAct').textContent = '已复制 · 去配置工作流';

    var pre = document.getElementById('preCopy');
    pre.classList.add('is-done');
    document.getElementById('preCopyIc').innerHTML = UI.icon('check');
    pre.querySelector('b').textContent = '已复制到「图文生成」：' + name;
    pre.querySelector('p').textContent = '工作流、生成配置与 4 个提示词模版已继承。可继续调整图文布局与生成文案。';
    var preBtn = document.getElementById('preCopyBtn');
    preBtn.textContent = '去配置工作流';
    preBtn.onclick = function () { location.href = 'admin.html?view=workflow'; };
  });
})();
