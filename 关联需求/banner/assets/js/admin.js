/* =========================================================
   admin.js — 运营后台：草稿编辑 / 发布 / 提示词与模版
   配置唯一存放在 BannerStore，发布后小鱼AI 读取同一份。
   ========================================================= */
(function () {
  'use strict';

  var D = window.BANNER_DATA;
  var qs = new URLSearchParams(location.search);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var draft = window.BannerStore.getDraft();   // 本地草稿
  var view = 'workflow';
  var tplCat = 'all';
  var editingId = null;
  var coverSrc = '';

  $$('[data-ic]').forEach(function (n) { n.innerHTML = UI.icon(n.getAttribute('data-ic')); });

  /* ================= 视图 ================= */
  function showView(v, updateUrl) {
    view = v;
    $$('.viewtab').forEach(function (b) {
      var on = b.getAttribute('data-view') === v;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
    $('#viewWorkflow').classList.toggle('is-active', v === 'workflow');
    $('#viewTemplate').classList.toggle('is-active', v === 'template');
    if (updateUrl) { try { history.replaceState(null, '', '?view=' + v); } catch (e) {} }
    if (v === 'workflow') requestAnimationFrame(fitCanvas);
    else renderRows();
  }
  $$('.viewtab').forEach(function (b) {
    b.addEventListener('click', function () { showView(b.getAttribute('data-view'), true); });
  });

  /* ================= 模型下拉 ================= */
  function fillModels(sel, list, current) {
    sel.innerHTML = list.map(function (m) {
      return '<option value="' + m.id + '">' + m.name + '</option>';
    }).join('');
    sel.value = current;
  }
  fillModels($('#textModelAdmin'), D.textModels, draft.workflow.textModel);
  fillModels($('#imageModel8'), D.imageModels, draft.workflow.imageModel);
  fillModels($('#imageModel6'), D.imageModels, draft.workflow.imageModel);

  $('#textModelAdmin').addEventListener('change', function () {
    draft.workflow.textModel = this.value;
    markDirty();
  });

  /* 图像模型：id:8 与 id:6 保持一致 */
  function bindImageModel(sel) {
    sel.addEventListener('change', function () {
      draft.workflow.imageModel = sel.value;
      $$('#imageModel8, #imageModel6').forEach(function (s) { s.value = sel.value; });
      markDirty();
    });
  }
  bindImageModel($('#imageModel8'));
  bindImageModel($('#imageModel6'));

  /* ================= 生成文案 ================= */
  var copySel = $('#copySel');
  copySel.value = draft.workflow.copy ? '1' : '0';
  copySel.addEventListener('change', function () {
    draft.workflow.copy = copySel.value === '1';
    markDirty();
  });

  /* ================= 图文布局（两路一致） ================= */
  $$('.layout-sel').forEach(function (sel) {
    sel.innerHTML = D.layouts.map(function (l) {
      return '<option value="' + l.id + '">' + l.select + '</option>';
    }).join('');
    sel.value = draft.workflow.layout;
    sel.addEventListener('change', function () {
      draft.workflow.layout = sel.value;
      $$('.layout-sel').forEach(function (s) { s.value = sel.value; });
      markDirty();
    });
  });

  /* ================= 输出设置（两路镜像） ================= */
  function mirrorPair(aId, bId, key, transform, parse) {
    var a = $('#' + aId), b = $('#' + bId);
    function apply(v) {
      draft.workflow[key] = parse ? parse(v) : v;
      a.value = v;
      b.value = v;
      markDirty();
    }
    a.addEventListener('change', function () { apply(a.value); });
    a.addEventListener('input', function () { if (a.type === 'number' || a.tagName === 'INPUT') apply(a.value); });
    b.addEventListener('change', function () { apply(b.value); });
    b.addEventListener('input', function () { if (b.type === 'number' || b.tagName === 'INPUT') apply(b.value); });
    return { a: a, b: b, set: function (v) { a.value = v; b.value = v; } };
  }

  var ratioPair = mirrorPair('ratio8', 'ratio6', 'ratio');
  var resPair = mirrorPair('res8', 'res6', 'resolution');
  var fillPair = mirrorPair('fill8', 'fill6', 'fillTo');
  var countPair = mirrorPair('count8', 'count6', 'count', null, function (v) {
    return Math.max(1, Math.min(4, Number(v) || 1));
  });

  ratioPair.set(draft.workflow.ratio);
  resPair.set(draft.workflow.resolution);
  fillPair.set(draft.workflow.fillTo);
  countPair.set(String(draft.workflow.count));

  /* ================= 提示词（同步到小鱼） ================= */
  var rolePrompt = $('#rolePrompt');
  var enhancePrompt = $('#enhancePrompt');
  var imgPrompt8 = $('#imgPrompt8');
  var imgPrompt6 = $('#imgPrompt6');
  rolePrompt.value = draft.workflow.prompts.role;
  enhancePrompt.value = draft.workflow.prompts.enhance;
  var imgP = draft.workflow.prompts.image;
  imgPrompt8.value = imgP;
  imgPrompt6.value = imgP;

  rolePrompt.addEventListener('input', function () {
    draft.workflow.prompts.role = rolePrompt.value;
    markDirty();
  });
  enhancePrompt.addEventListener('input', function () {
    draft.workflow.prompts.enhance = enhancePrompt.value;
    markDirty();
  });
  /* 图像生成提示词：id:8 与 id:6 保持一致 */
  function bindImgPrompt(el) {
    el.addEventListener('input', function () {
      draft.workflow.prompts.image = el.value;
      [imgPrompt8, imgPrompt6].forEach(function (x) { if (x !== el) x.value = el.value; });
      markDirty();
    });
  }
  bindImgPrompt(imgPrompt8);
  bindImgPrompt(imgPrompt6);

  /* ================= 顶栏：保存 / 发布 ================= */
  function renderPubState(dirty) {
    var v = window.BannerStore.getVersion();
    var el = $('#pubState');
    el.textContent = 'v' + v + (dirty ? ' · 有未发布改动' : ' · 已发布');
    el.classList.toggle('is-dirty', !!dirty);
    $('#publishBtn').classList.toggle('btn--pulse', !!dirty);
  }

  function markDirty() {
    renderPubState(true);
  }

  $('#saveBtn').addEventListener('click', function () {
    window.BannerStore.saveDraft(draft);
    UI.toast('草稿已保存（前台仍使用 v' + window.BannerStore.getVersion() + '）');
    renderPubState(true);
  });

  $('#publishBtn').addEventListener('click', function () {
    var v = window.BannerStore.publish(draft);
    draft = window.BannerStore.getDraft();
    renderPubState(false);
    UI.toast('已发布 v' + v + ' · 小鱼AI 已同步最新配置');
  });

  /* ================= 节点聚焦 / 连线 ================= */
  var EDGES = [[1, 2], [2, 5], [5, 3], [2, 4], [4, 8], [4, 6], [5, 8], [5, 6], [8, 9], [6, 7]];
  var canvas = $('#wfCanvas');
  var inner = $('#wfInner');
  var zoom = 1;

  function drawEdges() {
    var svg = $('#wfEdges');
    if (!inner || !svg) return;
    svg.setAttribute('viewBox', '0 0 1420 1130');
    var parts = [];
    EDGES.forEach(function (pair) {
      var a = inner.querySelector('.node[data-id="' + pair[0] + '"]');
      var b = inner.querySelector('.node[data-id="' + pair[1] + '"]');
      if (!a || !b) return;
      var ax = a.offsetLeft, ay = a.offsetTop, aw = a.offsetWidth, ah = a.offsetHeight;
      var bx = b.offsetLeft, by = b.offsetTop, bw = b.offsetWidth, bh = b.offsetHeight;
      var sx, sy, tx, ty, d;
      var centered = Math.abs((bx + bw / 2) - (ax + aw / 2)) < Math.max(aw, bw) * 0.72;
      if (by >= ay + ah - 6 && centered) {
        sx = ax + aw / 2; sy = ay + ah; tx = bx + bw / 2; ty = by;
        var dyy = Math.max(24, (ty - sy) * 0.5);
        d = 'M' + sx + ',' + sy + ' C' + sx + ',' + (sy + dyy) + ' ' + tx + ',' + (ty - dyy) + ' ' + tx + ',' + ty;
      } else {
        sx = ax + aw; sy = ay + ah / 2; tx = bx; ty = by + bh / 2;
        var dx = Math.max(26, Math.abs(tx - sx) * 0.45);
        d = 'M' + sx + ',' + sy + ' C' + (sx + dx) + ',' + sy + ' ' + (tx - dx) + ',' + ty + ' ' + tx + ',' + ty;
      }
      parts.push('<path' + (a.getAttribute('data-id') === '4' ? ' class="is-branch"' : '') + ' d="' + d + '"/>');
    });
    svg.innerHTML = parts.join('');
  }

  function applyZoom(z) {
    zoom = Math.max(0.5, Math.min(1.15, z));
    inner.style.zoom = zoom;
    $('#zoomVal').textContent = Math.round(zoom * 100) + '%';
  }
  function fitCanvas() {
    if (view !== 'workflow') return;
    var availW = canvas.clientWidth - 48;
    var availH = canvas.clientHeight - 48;
    if (availW <= 0) return;
    applyZoom(Math.min(availW / 1420, availH / 1130, 1));
    drawEdges();
  }
  $$('.wf-zoom button').forEach(function (b) {
    b.addEventListener('click', function () {
      var act = b.getAttribute('data-zoom');
      if (act === 'in') applyZoom(zoom + 0.08);
      else if (act === 'out') applyZoom(zoom - 0.08);
      else fitCanvas();
    });
  });
  function focusNode(id) {
    var node = id === '2' ? $('#nodeRole') : id === '8' ? $('#nodeImg8') : id === '6' ? $('#nodeImg6') : null;
    if (!node) return;
    applyZoom(0.95);
    requestAnimationFrame(function () {
      var nr = node.getBoundingClientRect();
      var cr = canvas.getBoundingClientRect();
      canvas.scrollLeft += nr.left - cr.left - (canvas.clientWidth - nr.width) / 2;
      canvas.scrollTop += nr.top - cr.top - (canvas.clientHeight - nr.height) / 2;
      node.classList.remove('is-focus');
      void node.offsetWidth;
      node.classList.add('is-focus');
      setTimeout(function () { node.classList.remove('is-focus'); }, 1600);
    });
  }
  window.addEventListener('resize', UI.debounce(function () { if (view === 'workflow') fitCanvas(); }, 160));

  /* ================= 提示词模版 ================= */
  var rows = $('#tplRows');

  function nowStr() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' +
      p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  function filtered() {
    return draft.templates.filter(function (t) {
      if (tplCat !== 'all' && t.category !== tplCat) return false;
      var st = $('#tplStatus').value;
      if (st !== 'all' && t.status !== st) return false;
      var q = $('#tplSearch').value.trim();
      if (q && t.name.indexOf(q) === -1) return false;
      return true;
    });
  }

  function updateCounts() {
    $('#countAll').textContent = '(' + draft.templates.length + ')';
    $('#countBanner').textContent = '(' + draft.templates.filter(function (t) { return t.category === 'banner模块'; }).length + ')';
    $('#tplCount').textContent = draft.templates.length;
  }

  function rowHTML(t) {
    var meta = UI.layoutMeta(t.layout);
    return '<article class="tpl-row" data-id="' + t.id + '">' +
      '<div class="tpl-row__main">' +
        '<div class="tpl-row__top">' +
          '<div class="tpl-row__cover"><img src="' + UI.escapeHTML(t.cover) + '" alt="" loading="lazy"><span class="tpl-row__badge">' + UI.icon('text') + '</span></div>' +
          '<div class="tpl-row__title">' +
            '<div class="tpl-row__name">' + UI.escapeHTML(t.name) +
              '<span class="tag ' + (t.status === '已发布' ? 'tag--green' : 'tag--orange') + '">' + t.status + '</span>' +
              '<button class="tpl-row__copy" title="复制提示词" data-copy-name="' + UI.escapeHTML(t.name) + '">' + UI.icon('copy') + '</button>' +
            '</div>' +
            '<div class="tpl-row__layout"><span>图文布局</span><b>' + meta.full + '</b></div>' +
          '</div>' +
          '<div class="tpl-row__meta">' +
            '<span>适用智能体：banner生成</span>' +
            '<span>提示词分类：' + (t.category ? UI.escapeHTML(t.category) : '-') + '</span>' +
            '<span class="ref-count">参考素材：' + ((t.refs && t.refs.length) || 1) + ' 张</span>' +
          '</div>' +
        '</div>' +
        '<div class="tpl-row__times">' +
          '<span>发布时间：' + t.created + '</span>' +
          '<span>修改时间：' + t.updated + ':00</span>' +
        '</div>' +
        '<div class="tpl-row__stats">' +
          '<span title="权重值">' + UI.icon('star') + t.weight + '</span>' +
          '<span title="收藏">' + UI.icon('book') + (t.favorite || 0) + '</span>' +
          '<span title="调用次数">' + UI.icon('sparkle') + (t.usage || 0) + '</span>' +
          '<span title="使用人数">' + UI.icon('user') + '0</span>' +
        '</div>' +
      '</div>' +
      '<div class="tpl-row__acts">' +
        '<button class="btn tpl-row__edit" data-edit="' + t.id + '">编辑</button>' +
        '<button class="btn tpl-row__more" data-more="' + t.id + '">操作' + UI.icon('chevronDown') + '</button>' +
      '</div>' +
    '</article>';
  }

  function renderRows() {
    updateCounts();
    var list = filtered();
    if (!list.length) {
      rows.innerHTML = '<div class="tpl-empty">' + UI.icon('search') + '没有找到匹配的提示词<br>试试重置筛选条件</div>';
      return;
    }
    rows.innerHTML = list.map(rowHTML).join('');
  }

  rows.addEventListener('click', function (e) {
    var ed = e.target.closest('[data-edit]');
    if (ed) {
      var t = draft.templates.find(function (x) { return x.id === ed.getAttribute('data-edit'); });
      if (t) openEditor(t);
      return;
    }
    var cp = e.target.closest('[data-copy-name]');
    if (cp) { UI.toast('已复制「' + cp.getAttribute('data-copy-name') + '」'); return; }
    var more = e.target.closest('[data-more]');
    if (more) openRowMenu(more, more.getAttribute('data-more'));
  });

  var rowMenu = null;
  function closeRowMenu() { if (rowMenu) { rowMenu.remove(); rowMenu = null; } }
  function openRowMenu(btn, id) {
    closeRowMenu();
    var r = btn.getBoundingClientRect();
    var t = draft.templates.find(function (x) { return x.id === id; });
    var m = document.createElement('div');
    m.className = 'row-menu';
    m.innerHTML = '<button data-act="copy">复制提示词</button>' +
      '<button data-act="toggle">' + (t.status === '已发布' ? '转为草稿' : '发布') + '</button>' +
      '<button data-act="del" class="is-danger">删除</button>';
    document.body.appendChild(m);
    m.style.top = (r.bottom + 6) + 'px';
    m.style.left = Math.max(12, r.right - 132) + 'px';
    rowMenu = m;
    m.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'copy') UI.toast('已复制「' + t.name + '」');
      if (act === 'toggle') {
        t.status = t.status === '已发布' ? '草稿' : '已发布';
        markDirty();
        UI.toast('已' + (t.status === '已发布' ? '发布' : '转为草稿') + '：' + t.name + '，需点「发布」生效');
      }
      if (act === 'del') {
        draft.templates = draft.templates.filter(function (x) { return x.id !== id; });
        markDirty();
        UI.toast('已删除「' + t.name + '」，需点「发布」生效', 'warn');
      }
      closeRowMenu();
      renderRows();
    });
  }
  document.addEventListener('click', function (e) {
    if (rowMenu && !rowMenu.contains(e.target) && !e.target.closest('[data-more]')) closeRowMenu();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeRowMenu(); });

  ['#tplQuery', '#tplReset'].forEach(function (sel) {
    $(sel).addEventListener('click', function () {
      if (sel === '#tplReset') {
        $('#tplSearch').value = '';
        $('#tplStatus').value = 'all';
        tplCat = 'all';
        $$('.tpl-tab').forEach(function (x) { x.classList.toggle('is-active', x.getAttribute('data-cat') === 'all'); });
      }
      renderRows();
    });
  });
  $('#tplSearch').addEventListener('keydown', function (e) { if (e.key === 'Enter') renderRows(); });
  $('#tplStatus').addEventListener('change', renderRows);
  $$('.tpl-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      tplCat = tab.getAttribute('data-cat');
      $$('.tpl-tab').forEach(function (x) { x.classList.toggle('is-active', x === tab); });
      renderRows();
    });
  });

  /* 模版编辑 */
  function fillLayoutOptions() {
    $('#tfLayout').innerHTML = D.layouts.map(function (l) {
      return '<option value="' + l.id + '">' + l.select + '</option>';
    }).join('');
  }
  fillLayoutOptions();

  /* 参考素材列表（编辑态）：第 1 张固定为封面，其余为追加的素材 */
  var refList = [];
  var COVER_FLAG = 'is-cover';

  function renderRefs() {
    var grid = $('#tfRefGrid');
    if (!grid) return;
    $$('.ref-item', grid).forEach(function (el) { el.remove(); });
    var add = $('#tfRefAdd');
    grid.insertAdjacentHTML(add ? 'beforeend' : 'beforeend', refList.map(function (r, i) {
      return '<span class="ref-item' + (r.cover ? ' ' + COVER_FLAG : '') + '" data-idx="' + i + '" title="点击放大">' +
        '<img src="' + UI.escapeHTML(r.src) + '" alt="参考素材 ' + (i + 1) + '">' +
        (r.cover ? '<i class="ref-item__tag">封面</i>' : '') +
        (r.cover ? '' : '<button type="button" class="ref-item__x" data-del="' + i + '" title="移除">×</button>') +
      '</span>';
    }).join(''));
    /* 让「+」始终排在最后 */
    if (add) grid.appendChild(add);
    $$('.ref-item', grid).forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.closest('[data-del]')) return;
        var i = Number(el.getAttribute('data-idx'));
        zoomImage(refList[i].full || refList[i].src, '参考素材 ' + (i + 1) + (refList[i].cover ? ' · 封面' : ''));
      });
    });
    $$('[data-del]', grid).forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        refList.splice(Number(b.getAttribute('data-del')), 1);
        renderRefs();
      });
    });
    var add = $('#tfRefAdd');
    if (add) add.style.display = refList.length >= 5 ? 'none' : '';
  }

  function setRefs(list) {
    refList = (list || []).filter(Boolean).slice(0, 5).map(function (src, i) {
      return { src: src, cover: i === 0 };
    });
    renderRefs();
  }

  function fillCover(src) {
    var box = $('#tfCoverBox'), img = $('#tfCoverImg');
    if (src) {
      img.src = src; box.classList.add('has-img'); coverSrc = src;
      /* 封面自动放进参考素材第 1 张；full 记录高清原图（放大 / refs 用） */
      var t0 = draft.templates.find(function (x) { return x.id === editingId; });
      var full = (t0 && t0.gallery && t0.gallery !== src) ? t0.gallery : src;
      if (refList[0] && refList[0].cover) { refList[0].src = src; refList[0].full = full; }
      else refList.unshift({ src: src, full: full, cover: true });
    } else {
      img.removeAttribute('src'); box.classList.remove('has-img'); coverSrc = '';
      refList = refList.filter(function (r) { return !r.cover; });
    }
    renderRefs();
  }

  function openEditor(t) {
    editingId = t ? t.id : null;
    $('#tplModalTitle').textContent = t ? '编辑提示词' : '新增提示词';
    $('#tfName').value = t ? t.name : '';
    $('#tfDesc').value = t ? t.desc : '';
    $('#tfWeight').value = t ? t.weight : 100;
    $('#tfCategory').value = t ? t.category : '';
    $('#tfLayout').value = t ? t.layout : draft.workflow.layout;
    $('#tfPrompt').value = t ? t.prompt : '';
    $('#tfStyle').value = t ? (t.stylePrompt || '') : '';
    refList = [];
    fillCover(t ? t.cover : '');
    if (t && t.refs && t.refs.length) {
      /* 第 1 张 refs 是封面原图；其余作为追加素材载入 */
      t.refs.slice(1).forEach(function (src) {
        if (refList.length < 5) refList.push({ src: src, full: src, cover: false });
      });
    }
    renderRefs();
    UI.openModal('tplModal');
  }
  $('#tplNew').addEventListener('click', function () { openEditor(null); });

  /* 封面 / 参考素材：点击放大 */
  function zoomImage(src, caption) {
    if (!src) return;
    $('#imgZoomSrc').src = src;
    $('#imgZoomCap').textContent = caption || '';
    UI.openModal('imgZoom');
  }
  $('#tfCoverImg').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var t = draft.templates.find(function (x) { return x.id === editingId; });
    var big = (t && (t.gallery || t.photo)) || $('#tfCoverImg').getAttribute('src');
    zoomImage(big, '模版预览 · ' + ($('#tfName').value || '未命名模版'));
  });
  $('#tfCoverInput').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    UI.readFile(f, function (url) { fillCover(url); });
    e.target.value = '';
  });
  $('#tfRefInput').addEventListener('change', function (e) {
    var files = Array.prototype.slice.call(e.target.files || []);
    var room = 5 - refList.length;
    if (files.length > room) UI.toast('最多 5 张，已忽略多余的 ' + (files.length - room) + ' 张', 'warn');
    files.slice(0, room).forEach(function (f) {
      UI.readFile(f, function (url) {
        refList.push({ src: url, cover: false });
        renderRefs();
      });
    });
    e.target.value = '';
  });

  $('#tfSave').addEventListener('click', function () {
    var name = $('#tfName').value.trim();
    if (!name) { UI.toast('请填写名称', 'warn'); $('#tfName').classList.add('is-error'); $('#tfName').focus(); return; }
    $('#tfName').classList.remove('is-error');
    var prompt = $('#tfPrompt').value.trim();
    if (!prompt) { UI.toast('请填写提示词', 'warn'); $('#tfPrompt').classList.add('is-error'); $('#tfPrompt').focus(); return; }
    $('#tfPrompt').classList.remove('is-error');

    var payload = {
      name: name,
      desc: $('#tfDesc').value.trim(),
      weight: Number($('#tfWeight').value) || 0,
      category: $('#tfCategory').value || '',
      prompt: prompt,
      stylePrompt: $('#tfStyle').value.trim(),
      layout: $('#tfLayout').value,
      updated: nowStr().slice(0, 16)
    };
    var t = draft.templates.find(function (x) { return x.id === editingId; });
    if (t) {
      Object.assign(t, payload);
      if (coverSrc) t.cover = coverSrc;
      t.refs = refList.map(function (r) { return r.full || r.src; });
    } else {
      t = Object.assign({
        id: 'tpl-' + Date.now(),
        sub: 'banner模块',
        copy: true,
        theme: 'dark',
        photo: coverSrc || 'assets/img/tpl-misirui.jpg',
        cover: coverSrc || 'assets/img/cover-tpl-misirui.jpg',
        refs: refList.map(function (r) { return r.full || r.src; }),
        refMode: 'style',
        gallery: coverSrc || 'assets/img/tpl-misirui.jpg',
        stylePrompt: '',
        status: '已发布',
        created: nowStr(),
        usage: 0,
        favorite: 0,
        copyData: UI.DEF_COPY
      }, payload);
      draft.templates.unshift(t);
    }
    markDirty();
    UI.closeModal('tplModal');
    renderRows();
    UI.toast('模版已保存到草稿，点「发布」后小鱼AI 生效');
  });

  /* ================= 启动 ================= */
  renderPubState(false);
  fitCanvas();
  showView(qs.get('view') === 'template' ? 'template' : 'workflow', false);
  renderRows();

  if (qs.get('tpl')) {
    showView('template', false);
    var want = qs.get('tpl');
    if (want === 'new') setTimeout(function () { openEditor(null); }, 140);
    else {
      var t0 = draft.templates.find(function (x) { return x.id === want; });
      if (t0) setTimeout(function () { openEditor(t0); }, 160);
    }
  }
  if (qs.get('focus')) {
    var fid = qs.get('focus');
    setTimeout(function () {
      showView('workflow', false);
      setTimeout(function () { focusNode(fid); }, 90);
    }, 600);
  }
})();
