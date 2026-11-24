/* =========================================================
   editor.js — 装修端 · 小鱼AI
   配置来源：BannerStore 已发布版本（运营后台发布后同步）
   生成结果：BannerRender 用 Canvas 真实产出 PNG
   ========================================================= */
(function () {
  'use strict';

  var D = window.BANNER_DATA;
  var qs = new URLSearchParams(location.search);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var published = window.BannerStore.getPublished();
  var wf = published.workflow;

  /* 前台临时状态：刷新后回到已发布配置 */
  var state = {
    layout: wf.layout,
    copy: wf.copy,
    ratio: wf.ratio,
    count: wf.count,
    resolution: wf.resolution,
    textModel: wf.textModel,
    imageModel: wf.imageModel,
    templateId: null,
    refImage: null,
    refName: '',
    refImages: []
  };
  var touched = false;      // 用户是否临时改过配置
  var isGenerating = false;
  var tplCat = 'all';
  var usedRemote = false;
  var remoteError = '';
  var textError = '';

  var HERO_COPY = {
    eyebrow: 'PERFECT BALANCE',
    title: 'THE SOUND OF\nNATURE',
    desc: 'Enjoying the music feast at this moment is as if you are in person, intoxicated by the beautiful music melody and indulged in your home.',
    cta: 'READ MORE'
  };

  $$('[data-ic]').forEach(function (n) { n.innerHTML = UI.icon(n.getAttribute('data-ic')); });

  /* 店铺图 */
  [['--1', D.photos.headphone], ['--2', D.photos.product], ['--3', D.photos.interiorA]].forEach(function (c) {
    var el = document.querySelector('.site-card-img' + c[0]);
    if (el) el.style.backgroundImage = 'url("' + c[1] + '")';
  });

  /* 画布主图（装修展示，不参与 AI 生成） */
  /* ================= 画布轮播 ================= */
  var slides = [];          // { html } 每页已渲染好的 DOM 片段
  var slideIdx = 0;

  function renderSlides() {
    var host = $('#heroSlides');
    host.innerHTML = slides.map(function (s, i) {
      return '<div class="hero-slide' + (i === slideIdx ? ' is-on' : '') + '">' + s.html + '</div>';
    }).join('');
    $('#heroDots').innerHTML = slides.map(function (s, i) {
      return '<i class="' + (i === slideIdx ? 'is-on' : '') + '" title="第 ' + (i + 1) + ' 张"></i>';
    }).join('');
  }

  function goSlide(i) {
    slideIdx = (i + slides.length) % slides.length;
    $$('.hero-slide').forEach(function (el, k) { el.classList.toggle('is-on', k === slideIdx); });
    $$('#heroDots i').forEach(function (el, k) { el.classList.toggle('is-on', k === slideIdx); });
  }

  function pushSlide(html) {
    slides.push({ html: html });
    renderSlides();
    goSlide(slides.length - 1);
  }

  /* 首屏 3 张（原本的轮播占位） */
  function bannerHTML(spec) {
    var tmp = document.createElement('div');
    UI.renderBanner(tmp, spec);
    return tmp.outerHTML;
  }
  /* 默认两张轮播（第三张已去掉）：干净克制的排版，小字 + 细按钮 */
  slides = [
    { html: bannerHTML({ layout: 'center', copy: true, copyData: { eyebrow: 'NEW · ACOUSTIC', title: '听见\n自然的声音', desc: '轻盈佩戴，沉浸每一段旋律。', cta: '探索新品' }, photo: D.photoFiles.headphone, ratio: '16:9', theme: 'dark' }) },
    { html: bannerHTML({ layout: 'left-img', overlay: true, copy: true, copyData: { eyebrow: 'AUTUMN COLLECTION', title: '为日常空间\n添一点温度', desc: '天然材质，柔和光线，恰到好处。', cta: '浏览系列' }, photo: D.photoFiles.interiorA, ratio: '16:9', theme: 'dark' }) }
  ];
  renderSlides();

  $('#heroPrev').addEventListener('click', function (e) { e.stopPropagation(); goSlide(slideIdx - 1); });
  $('#heroNext').addEventListener('click', function (e) { e.stopPropagation(); goSlide(slideIdx + 1); });
  $('#heroDots').addEventListener('click', function (e) {
    e.stopPropagation();
    var i = $$('#heroDots i').indexOf(e.target);
    if (i > -1) goSlide(i);
  });

  /* ================= 模型下拉 ================= */
  function fillModels(sel, list, current) {
    sel.innerHTML = list.map(function (m) {
      return '<option value="' + m.id + '">' + m.name + '</option>';
    }).join('');
    sel.value = current;
  }
  fillModels($('#textModel'), D.textModels, state.textModel);
  fillModels($('#imageModel'), D.imageModels, state.imageModel);

  function modelName(id) {
    for (var i = 0; i < D.imageModels.length; i++) if (D.imageModels[i].id === id) return D.imageModels[i].name;
    return id;
  }

  function dims() {
    var s = BannerRender.ratioSize(state.ratio, state.resolution);
    return s;
  }

  function updateDock() {
    $('#layoutSel').value = state.layout;
    $('#copySel').value = state.copy ? '1' : '0';
    $('#ratioSel').value = state.ratio;
    $('#countSel').value = String(state.count);
    $('#resSel').value = state.resolution;
    $('#textModel').value = state.textModel;
    $('#imageModel').value = state.imageModel;
    var d = dims();
    $('#sizeW').value = d[0];
    $('#sizeH').value = d[1];
    var t = state.templateId ? UI.getTemplate(state.templateId) : null;
    $('#appliedTpl').hidden = !t;
    if (t) $('#appliedName').textContent = t.name;
  }

  /* ================= 生成配置弹层 ================= */
  var cfgPop = $('#cfgPop');

  function openCfg() {
    closeTplPop();
    updateDock();
    cfgPop.classList.add('is-open');
    cfgPop.setAttribute('aria-hidden', 'false');
  }
  function closeCfg() {
    cfgPop.classList.remove('is-open');
    cfgPop.setAttribute('aria-hidden', 'true');
  }
  $('#settingsBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    if (cfgPop.classList.contains('is-open')) closeCfg();
    else openCfg();
  });
  $('#cfgClose').addEventListener('click', closeCfg);
  document.addEventListener('click', function (e) {
    if (!cfgPop.classList.contains('is-open')) return;
    if (cfgPop.contains(e.target) || e.target.closest('#settingsBtn')) return;
    closeCfg();
  });

  var layoutSel = $('#layoutSel');
  layoutSel.innerHTML = D.layouts.map(function (l) {
    return '<option value="' + l.id + '">' + l.select + '</option>';
  }).join('');
  layoutSel.addEventListener('change', function () {
    state.layout = layoutSel.value;
    state.templateId = null;
    touched = true;
    updateDock();
    UI.toast('图文布局：' + UI.layoutMeta(state.layout).name);
  });
  $('#copySel').addEventListener('change', function () {
    /* 只改文案开关，不清空模版：风格提示词与参考图仍然生效 */
    state.copy = this.value === '1';
    touched = true;
    updateDock();
    UI.toast(state.copy ? '将生成文案' : '不生成文案，仅输出纯净图片');
  });
  $('#ratioSel').addEventListener('change', function () {
    state.ratio = this.value; touched = true; updateDock();
  });
  $('#countSel').addEventListener('change', function () {
    state.count = Number(this.value); touched = true; updateDock();
  });
  $('#resSel').addEventListener('change', function () {
    state.resolution = this.value; touched = true; updateDock();
  });
  $('#textModel').addEventListener('change', function () { state.textModel = this.value; touched = true; });
  $('#imageModel').addEventListener('change', function () { state.imageModel = this.value; touched = true; });

  /* ================= 参考图（决定走 id:6） ================= */
  var refFile = $('#refFile');
  $('#attachBtn').addEventListener('click', function () { refFile.click(); });
  refFile.addEventListener('change', function () {
    var files = Array.prototype.slice.call(refFile.files || []);
    if (!files.length) return;
    var loaded = 0;
    files.forEach(function (f) {
      UI.readFile(f, function (url) {
        state.refImages.push({ url: url, name: f.name });
        loaded++;
        if (loaded === files.length) {
          state.refImage = state.refImages[0].url;
          state.refName = state.refImages[0].name;
          renderMediaRow();
          updateSend();
          UI.toast('已添加 ' + (files.length === 1 ? '参考图' : files.length + ' 张参考图') + '，将走 id:6 图生图');
        }
      });
    });
    refFile.value = '';
  });

  /* ================= 媒体条（模版图与参考图，水平并行排列） ================= */
  function renderMediaRow() {
    var host = $('#inputMedia');
    if (!host) return;

    var t = state.templateId ? UI.getTemplate(state.templateId) : null;
    var hasRefs = state.refImages && state.refImages.length > 0;

    if (!t && !hasRefs) {
      host.hidden = true;
      host.innerHTML = '';
      return;
    }

    host.hidden = false;
    var html = '';

    // 1. 模版缩略图
    if (t) {
      var tplImg = t.gallery || t.cover;
      html += '<span class="input-tpl__thumb" id="inputTplChip" title="模版：' + UI.escapeHTML(t.name) + '（点击放大）">' +
        '<img src="' + UI.escapeHTML(tplImg) + '" alt="' + UI.escapeHTML(t.name) + '">' +
        '<button type="button" id="inputTplX" title="移除模版">×</button>' +
      '</span>';
    }

    // 2. 参考图缩略图
    if (hasRefs) {
      state.refImages.forEach(function (item, idx) {
        html += '<span class="input-tpl__thumb input-ref-thumb" data-ref-idx="' + idx + '" title="参考图：' + UI.escapeHTML(item.name) + '（点击放大）">' +
          '<img src="' + item.url + '" alt="参考图">' +
          '<button type="button" class="input-img-x" data-idx="' + idx + '" title="移除此参考图">×</button>' +
        '</span>';
      });
    }

    host.innerHTML = html;

    // 模版图放大与删除
    var tplChip = $('#inputTplChip', host);
    if (tplChip) {
      tplChip.addEventListener('click', function (e) {
        if (e.target.closest('button')) return;
        zoomImage(t.gallery || t.cover, '模版参考图 · ' + t.name, t.prompt || '');
      });
      $('#inputTplX', host).addEventListener('click', function (e) {
        e.stopPropagation();
        state.templateId = null;
        renderMediaRow();
        updateDock();
        updateSend();
      });
    }

    // 参考图放大与删除
    $$('.input-ref-thumb', host).forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.closest('button')) return;
        var idx = parseInt(el.getAttribute('data-ref-idx'), 10);
        var item = state.refImages[idx];
        if (item) zoomImage(item.url, '参考图预览 · ' + item.name);
      });
    });

    $$('.input-img-x', host).forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute('data-idx'), 10);
        state.refImages.splice(idx, 1);
        if (state.refImages.length > 0) {
          state.refImage = state.refImages[0].url;
          state.refName = state.refImages[0].name;
        } else {
          state.refImage = null;
          state.refName = '';
          UI.toast('已移除全部参考图，回到文生图（id:8）');
        }
        renderMediaRow();
        updateSend();
      });
    });
  }

  function renderInputImages() { renderMediaRow(); }
  function clearInputImages() {
    state.refImages = [];
    state.refImage = null;
    state.refName = '';
    renderMediaRow();
  }

  /* ================= 提示词模版 ================= */
  var pop = $('#tplPop');

  function renderTplPop() {
    var list = window.BannerStore.templates().filter(function (t) {
      return tplCat === 'all' || t.category === tplCat ||
        (tplCat === 'banner模块' && t.category === 'banner模块');
    });
    var host = $('#tplList');
    if (!list.length) {
      host.innerHTML = '<div class="tpl-gallery__empty">该分类下暂无模版</div>';
      return;
    }
    host.innerHTML = '<div class="tpl-gallery">' + list.map(function (t) {
      var meta = UI.layoutMeta(t.layout);
      var img = t.gallery || t.cover;
      return '<figure class="tpl-tile' + (state.templateId === t.id ? ' is-active' : '') + '" data-id="' + t.id + '" tabindex="0" role="button">' +
        '<img src="' + UI.escapeHTML(img) + '" alt="' + UI.escapeHTML(t.name) + '">' +
        '<span class="tpl-tile__same">做同款</span>' +
        '<span class="tpl-tile__check">' + UI.icon('check') + '</span>' +
        '<figcaption class="tpl-tile__info">' +
          '<b>' + UI.escapeHTML(t.name) + '</b>' +
          '<span class="tpl-tile__tags">' +
            '<em>' + meta.name + '</em>' +
            '<em class="' + (t.copy ? '' : 'is-off') + '">' + (t.copy ? '生成文案' : '不生成文案') + '</em>' +
          '</span>' +
          '<p>' + UI.escapeHTML(t.desc) + '</p>' +
        '</figcaption>' +
      '</figure>';
    }).join('') + '</div>';

    $$('.tpl-tile', host).forEach(function (tile) {
      tile.addEventListener('click', function (e) {
        e.stopPropagation();
        useTemplate(tile.getAttribute('data-id'));
      });
      tile.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); useTemplate(tile.getAttribute('data-id')); }
      });
    });
  }

  function useTemplate(id) {
    var t = UI.getTemplate(id);
    if (!t) return;
    state.templateId = t.id;
    state.layout = t.layout;
    state.copy = t.copy;
    touched = true;
    updateDock();
    attachTemplateChip(t);
    if (t.prompt) {
      input.value = t.prompt;
      updateSend();
      /* 选中占位符：用户直接输入即可替换成自己的产品 */
      closeTplPop();
      input.focus();
      var ph = input.value.indexOf('【{产品}】');
      if (ph > -1) {
        try { input.setSelectionRange(ph, ph + '【{产品}】'.length); } catch (e) {}
      }
    } else {
      closeTplPop();
      input.focus();
    }
    UI.toast('已应用「' + t.name + '」· ' + UI.layoutMeta(t.layout).name);
  }

  function attachTemplateChip(t) {
    state.templateId = t ? t.id : null;
    renderMediaRow();
    updateSend();
  }
  function clearInputTpl() {
    state.templateId = null;
    renderMediaRow();
    updateSend();
  }

  function openTplPop() {
    closeCfg();
    renderTplPop();
    pop.classList.add('is-open');
    pop.setAttribute('aria-hidden', 'false');
  }
  function closeTplPop() {
    pop.classList.remove('is-open');
    pop.setAttribute('aria-hidden', 'true');
  }
  $('#tplBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    if (pop.classList.contains('is-open')) closeTplPop();
    else openTplPop();
  });
  $('#tplClose').addEventListener('click', closeTplPop);
  $$('.tpl-pop__tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      tplCat = tab.getAttribute('data-cat');
      $$('.tpl-pop__tab').forEach(function (x) { x.classList.toggle('is-active', x === tab); });
      renderTplPop();
    });
  });
  document.addEventListener('click', function (e) {
    if (!pop.classList.contains('is-open')) return;
    if (pop.contains(e.target) || e.target.closest('#tplBtn')) return;
    closeTplPop();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeRowMenu();
    if (pop.classList.contains('is-open')) closeTplPop();
    else if (cfgPop.classList.contains('is-open')) closeCfg();
  });
  function closeRowMenu() {}

  /* ================= 文案生成（依据工作流角色提示词 + 用户输入） =================
     若接入真实文本模型，只需把 craftCopy 换成接口调用，其余流程不变。 */
  var STOP = /(生成|请|帮我|给我|做|来|一张|一个|一款|一个|的|吧|呀|啊)/g;
  var STYLE = /(深色|浅色|高级|质感|简约|简洁|大气|时尚|清新|复古|极简|风格|背景|色调|高清|好看|漂亮|科技感|氛围感)/g;

  function keywordsOf(text) {
    var t = String(text || '')
      .replace(/[，。！？、,.!?;；:："'（）()【】\[\]]/g, ' ')
      .replace(/banner|Banner|BANNER|主图|海报|图片|图|素材|内容|文案/g, ' ')
      .replace(STYLE, ' ')
      .replace(STOP, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    var out = [];
    t.split(' ').forEach(function (p) {
      p = p.trim();
      if (p.length < 2) return;
      if (out.indexOf(p) === -1) out.push(p);
    });
    return out;
  }

  function shortTitle(kws) {
    if (!kws.length) return '新品上市';
    var a = kws[0].length > 7 ? kws[0].slice(0, 7) : kws[0];
    if (kws.length < 2) return a;
    var b = kws[1].length > 7 ? kws[1].slice(0, 7) : kws[1];
    return a + '\n' + b;
  }

  function toneOf(prompt) {
    if (/促销|折扣|大促|直降|sale|SALE|限时/.test(prompt)) return '限时直降，先到先得。';
    if (/耳机|音响|声|audio|Audio|聆听/.test(prompt)) return '沉浸式聆听体验，轻盈佩戴。';
    if (/家居|空间|home|Home|客厅|卧室/.test(prompt)) return '为日常空间，带来恰到好处的质感。';
    if (/护肤|美妆|口红|香水/.test(prompt)) return '细腻质地，日常好气色。';
    return '贴合品牌调性的图文内容。';
  }

  function craftCopy(prompt, tpl) {
    var kws = keywordsOf(prompt);
    /* 模版已带文案时，沿用模版文案结构，只把标签替换为用户输入关键词 */
    var t = tpl && tpl.copy && tpl.copyData && tpl.copyData.title ? tpl.copyData : null;
    var tags = (kws.length ? kws.slice(0, 3) : ['新品', '图文', 'Banner'])
      .map(function (k) { return '#' + k.replace(/\s/g, '').slice(0, 10); });

    if (t) {
      return {
        eyebrow: t.eyebrow || 'NEW · COLLECTION',
        title: t.title,
        subtitle: (tpl.desc || '').slice(0, 40),
        desc: t.desc || '',
        cta: t.cta || '立即查看',
        tags: tags
      };
    }

    var role = wf.prompts.role || '';
    var main = kws[0] || '新品';
    return {
      eyebrow: 'NEW · ' + (main.length > 8 ? main.slice(0, 8) : main),
      title: shortTitle(kws),
      subtitle: main + ' · 图文详情',
      desc: toneOf(prompt) + (/英文|english|English|EN\b/.test(role) ? ' Designed to convert.' : ''),
      cta: '立即查看',
      tags: tags
    };
  }


  /* ================= 远端生图：ModelVerse / Qwen Image 3.0 =================
     POST {base}/images/generations
     body: { model, prompt, size:"W*H", n, prompt_extend, watermark, image? }
     返回 data[0].url，前端 fetch 成 blob 再交给 Canvas 合成文案。 */

  /* ⚠️ 生图时绝对不能提「主体在左/右」「留出空间」之类的排版要求，
     模型会把它理解成左右分栏 + 一块纯色，导致画面割裂。
     图文布局只用于后端文字叠加，不进入生图提示词。 */
  /* 景别：产品不能顶满画面，四周要有真实场景（供后期叠字）。
     ⚠️ 不能写"留白 / 留出空间"，模型会画成纯色块；要写"产品占比 + 场景延伸"。 */
  var FRAMING = '中景偏近，产品完整入镜、不被任何边缘裁切，产品约占画面的 45%–55%——既要醒目成为视觉焦点，' +
    '又不要顶满画面；产品四周由同一场景自然延伸：有地面、有背景纵深、有前景虚化形成层次。';
  var COMPOSITION = '整幅画面是一张完整的摄影作品，从边缘到边缘都填满真实场景，' +
    '没有留白、没有纯色背景、没有图形色块或分割。';

  function apiConfig() {
    var a = window.BannerStore.getApi();
    return a && a.base && a.key ? a : null;
  }

  function apiMode() {
    var a = apiConfig();
    return (a && a.mode) || 'compose';
  }

  function sizeStr(ratio, resolution) {
    var s = BannerRender.ratioSize(ratio, resolution);
    return s[0] + '*' + s[1];
  }

  function stripTask(text) {
    /* 模板/工作流提示词里常以「根据…生成一张…：」开头，拼装时去掉避免重复 */
    return String(text || '').replace(/^根据【[^\n]*?】[^\n：:]*[：:]\s*/, '').trim();
  }

  /* 真正要发给模型的参考图：
     - 用户自己上传的 → 一定发（图生图）
     - 模版的参考图 → 默认只当风格参照，不发给模型，避免把模版里的产品一起带进来 */
  function refSource(snap, tpl) {
    if (snap.refImage) return { img: snap.refImage, label: '用户上传的参考图' };
    if (tpl && tpl.refKey && window.BANNER_IMG && window.BANNER_IMG[tpl.refKey]) {
      return { img: window.BANNER_IMG[tpl.refKey], label: '模版参考图「' + tpl.name + '」' };
    }
    return null;
  }

  function imageForModel(snap, tpl) {
    if (snap.refImage) return { img: snap.refImage, label: '用户上传的参考图' };
    if (tpl && tpl.refMode === 'image') {
      var r = refSource(snap, tpl);
      if (r) return r;
    }
    return null;
  }

  /* 生图提示词（生成文案 / 不生成文案 共用同一套纯摄影措辞）
     ⚠️ 文案由前端叠加，模型完全不需要知道"这是 banner"。
     一旦出现 banner / 底图 / 主视觉 / 文案 / 标题 / 文字 等字眼，
     模型就会自作主张画出版式、大标题和乱码字。 */
  function buildImagePrompt(prompt, snap, tpl) {
    return buildPurePrompt(prompt, snap, tpl);
  }

  /* 「不生成文案」时的提示词：纯摄影描述
     ⚠️ 关键：不能出现 banner / 文案 / 标题 / 文字 / 标签 / 图标 等字眼，
     越强调"不要文字"，模型越容易画出排版和乱码字。 */
  function buildPurePrompt(prompt, snap, tpl) {
    var style = tpl ? (tpl.stylePrompt || '') : '';
    var wfPrompt = stripTask(wf.prompts.image || '');
    var enhance = (wf.prompts.enhance || '').trim();
    var hasUserRef = !!(snap.refImages && snap.refImages.length) || !!snap.refImage;
    var ref = imageForModel(snap, tpl);

    var lines = [];
    lines.push('一张专业的产品商业摄影原片。');

    if (hasUserRef) {
      /* 上传了产品图：它就是唯一主体，模版文字只能当"环境/光线"参考 */
      lines.push('【产品主体】以随附上传的产品图为唯一主体：产品的外形、结构、比例、颜色、材质、标识必须与上传图完全一致，原样保留，不得改写、不得替换、不得增加或减少部件。');
      if (style) {
        lines.push('【环境参考】以下描述仅用于搭建产品所处的环境、背景、光线与氛围，其中提到的任何物品都不是拍摄对象，不得出现在画面中：');
        lines.push(style);
      }
      if (tpl && tpl.refSubject) {
        lines.push('【排除】画面中不得出现：' + tpl.refSubject + '。');
      }
    } else {
      lines.push('【拍摄对象】' + prompt);
      if (style) lines.push('【画面风格】' + style);
      if (ref) {
        lines.push('【画面参考】参考其色调、光影与质感，画面主体按拍摄对象重新组织。');
        if (tpl && tpl.refSubject) {
          lines.push('【主体要求】只拍摄【拍摄对象】描述的产品，' + tpl.refSubject + '不出现在画面中。');
        }
      }
    }

    /* 工作流提示词（后台可配）若已写了景别，就不再重复输出【景别】 */
    var wfHasFraming = /占.*画面|顶满|中远景|完整入镜/.test(wfPrompt);
    if (!wfHasFraming) lines.push('【景别】' + FRAMING);
    if (wfPrompt) lines.push('【画面要求】' + wfPrompt);
    /* id:5 提示词增强：作为静态质感规范追加，不额外调用模型，保持出图速度 */
    if (enhance) lines.push(enhance);
    lines.push('画面只有摄影内容本身，是一张未经后期设计的原片。');
    lines.push('【画面完整性】' + COMPOSITION);
    lines.push('【比例】' + snap.ratio + '，' + snap.resolution + ' 分辨率。');
    return lines.join('\n');
  }



  function buildFullPrompt(prompt, snap, tpl, copy) {
    var parts = [buildImagePrompt(prompt, snap, tpl)];
    if (copy) {
      parts.push('请在画面中直接排版以下文案：主标题「' + String(copy.title).replace(/\n/g, ' ') + '」' +
        (copy.desc ? '，副标题「' + copy.desc + '」' : '') +
        (copy.cta ? '，按钮文案「' + copy.cta + '」' : ''));
    }
    return parts.join('。');
  }

  /* OSS 图片直接交给 <img crossOrigin> 加载：Canvas 仍可 toDataURL，且避免 fetch 挂起 */
  function toObjectURL(url) {
    return Promise.resolve(url);
  }

  function callQwen(prompt, snap, tpl, copy) {
    var cfg = apiConfig();
    if (!cfg) return Promise.resolve(null);
    var isFull = apiMode() === 'full';
    var body = {
      model: snap.imageModel,
      prompt: isFull
        ? buildFullPrompt(prompt, snap, tpl, copy)
        : buildImagePrompt(prompt, snap, tpl),
      size: sizeStr(snap.ratio, snap.resolution),
      n: 1,
      prompt_extend: cfg.promptExtend === true,
      watermark: false
    };
    if (!isFull) {
      /* 负面词统一精简：太长反而会干扰画面 */
      var neg = ['文字', '字母', '数字', '水印', 'logo', '图标', '箭头',
        'text', 'letters', 'numbers', 'watermark', 'logo', 'icon', 'arrow'];
      /* 模版参考图里的原有产品不是本次主体，一律排除 */
      if (tpl && tpl.refSubject) {
        neg = neg.concat(tpl.refSubject.split(/[、，,]/).map(function (x) { return x.trim(); }).filter(Boolean));
      }
      /* 产品不能顶满、不能裁切、不能变形 */
      neg = neg.concat(['特写', '裁切', '变形', '添加部件']);
      body.negative_prompt = neg.join(', ');
    }
    /* 用户上传的多张参考图：用 images 数组一次发给模型（接口上限 3 张） */
    var userRefs = (snap.refImages && snap.refImages.length)
      ? snap.refImages.slice(0, 3).map(function (r) { return r.url; })
      : [];
    if (userRefs.length > 1) {
      body.images = userRefs;
    } else {
      var ref = imageForModel(snap, tpl);
      if (ref) body.image = userRefs[0] || ref.img;
    }

    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 180000);

    return fetch(cfg.base.replace(/\/+$/, '') + '/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.key },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) {
          var msg = (j && j.error && (j.error.message || j.error.code)) || ('HTTP ' + r.status);
          throw new Error(msg);
        }
        return j;
      });
    }).then(function (j) {
      var d = j && j.data && j.data[0];
      if (!d || !d.url) throw new Error('接口未返回图片');
      return toObjectURL(d.url);
    }).then(function (local) {
      clearTimeout(timer);
      return local;
    }).catch(function (err) {
      clearTimeout(timer);
      return { error: String(err && err.message || err) };
    });
  }

  /* ================= 文案生成：真实调用文本模型（id:2 提示词驱动） ================= */
  function buildCopyInput(prompt, snap, tpl, meta) {
    var style = tpl ? (tpl.stylePrompt || '') : '';
    var ref = refSource(snap, tpl);
    return [
      '【用户输入】' + prompt,
      '【风格提示词】' + (style || '通用电商风格'),
      '【参考图】' + (ref ? ref.label + '（画面：' + (tpl ? tpl.name : '参考素材') + '）' : '无'),
      '【图文布局】' + meta.name,
      '请按系统提示词的输出标准，只返回 JSON。'
    ].join('\n');
  }

  function parseJSONLoose(text) {
    if (!text) return null;
    var t = String(text).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    var i = t.indexOf('{');
    var j = t.lastIndexOf('}');
    if (i === -1 || j === -1) return null;
    try { return JSON.parse(t.slice(i, j + 1)); } catch (e) { return null; }
  }

  function normalizeCopy(o) {
    if (!o || typeof o !== 'object') return null;
    var title = String(o.title || '').trim();
    if (!title) return null;
    var tags = Array.isArray(o.tags) ? o.tags : [];
    tags = tags.map(function (x) { return String(x || '').replace(/^#/, '').trim(); })
      .filter(Boolean).slice(0, 3)
      .map(function (x) { return '#' + x.slice(0, 10); });
    return {
      title: title.slice(0, 40),
      subtitle: String(o.subtitle || '').trim().slice(0, 60),
      desc: String(o.desc || '').trim().slice(0, 160),
      tags: tags.length ? tags : ['#新品', '#banner', '#图文']
    };
  }

  function callTextModel(prompt, snap, tpl, meta) {
    var cfg = apiConfig();
    if (!cfg) return Promise.resolve(null);
    var body = {
      model: snap.textModel,
      messages: [
        { role: 'system', content: wf.prompts.role || '' },
        { role: 'user', content: buildCopyInput(prompt, snap, tpl, meta) }
      ],
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    };
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 45000);
    return fetch(cfg.base.replace(/\/+$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.key },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error((j && j.error && j.error.message) || ('HTTP ' + r.status));
        var content = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
        return normalizeCopy(parseJSONLoose(content));
      });
    }).then(function (o) {
      clearTimeout(timer);
      return o;
    }).catch(function (err) {
      clearTimeout(timer);
      textError = String(err && err.message || err);
      return null;
    });
  }

  /* ================= 生成 ================= */
  function routeNode() {
    var hasRef = (state.refImages && state.refImages.length > 0) || state.refImage;
    return hasRef ? { id: '6', label: '图生图' } : { id: '8', label: '文生图' };
  }

  /* 兜底图库：全部是不带文字的干净素材，避免叠加文案后出现两层文字 */
  function photosFor() {
    return [D.photos.headphone, D.photos.product, D.photos.interiorA, D.photos.interiorB];
  }

  function addTyping() {
    var d = document.createElement('div');
    d.className = 'msg';
    d.id = 'typingMsg';
    d.innerHTML = '<div class="typing"><i></i><i></i><i></i><span id="typingText">正在调用 ' +
      UI.escapeHTML(modelName(state.imageModel)) + '…</span></div>';
    chat.appendChild(d);
    scrollChat();
    return d;
  }

  function scrollChat() {
    var toBottom = function () { body.scrollTop = body.scrollHeight; };
    requestAnimationFrame(toBottom);
    setTimeout(toBottom, 90);
    setTimeout(toBottom, 380);
  }

  function addUser(text, snap) {
    var t = snap && snap.templateId ? UI.getTemplate(snap.templateId) : null;
    var thumbs = [];
    if (t) {
      thumbs.push({ url: t.gallery || t.cover, title: '模版：' + t.name });
    }
    if (snap && snap.refImages && snap.refImages.length > 0) {
      snap.refImages.forEach(function (r) {
        thumbs.push({ url: r.url, title: '参考图：' + (r.name || '') });
      });
    } else if (snap && snap.refImage) {
      thumbs.push({ url: snap.refImage, title: '参考图' });
    }
    var d = document.createElement('div');
    d.className = 'msg msg--user';
    var thumbsHTML = thumbs.map(function (item, idx) {
      return '<img class="msg__thumb" data-idx="' + idx + '" src="' + UI.escapeHTML(item.url) + '" alt="' + UI.escapeHTML(item.title) + '" title="' + UI.escapeHTML(item.title) + '（点击放大）">';
    }).join('');
    d.innerHTML = '<div class="msg__bubble">' +
      thumbsHTML +
      '<span>' + UI.escapeHTML(text) + '</span>' +
    '</div>';
    $$('.msg__thumb', d).forEach(function (img) {
      img.addEventListener('click', function () {
        var idx = parseInt(img.getAttribute('data-idx'), 10);
        if (thumbs[idx]) zoomImage(thumbs[idx].url, thumbs[idx].title);
      });
    });
    chat.appendChild(d);
    scrollChat();
  }

  function setTyping(text) {
    var el = $('#typingText');
    if (el) el.textContent = text;
  }

  function replyCardHTML(copy) {
    var list = copy
      ? '<ol class="reply__list">' +
          '<li><b>标题：</b><span>' + UI.escapeHTML(String(copy.title).replace(/\n/g, ' ')) + '</span></li>' +
          '<li><b>副标题：</b><span>' + UI.escapeHTML(copy.subtitle || '—') + '</span></li>' +
          '<li><b>标签：</b><span class="reply__tags">' +
            (copy.tags.map(function (g) { return '<em>' + UI.escapeHTML(g) + '</em>'; }).join('')) +
          '</span></li>' +
          '<li><b>简介：</b><span>' + UI.escapeHTML(copy.desc || '—') + '</span></li>' +
        '</ol>'
      : '<p class="reply__note">本次不生成文案，只输出干净的图片。</p>';
    return list;
  }

  function addResult(prompt, snap) {
    var tpl = snap.templateId ? UI.getTemplate(snap.templateId) : null;
    var meta = UI.layoutMeta(snap.layout);
    var node = snap.node;

    var d = document.createElement('div');
    d.className = 'msg';
    chat.appendChild(d);
    scrollChat();

    var copyPromise = Promise.resolve(null);
    if (snap.copy) {
      setTyping('正在按 id:2 生成文案 · ' + snap.textModel);
      copyPromise = callTextModel(prompt, snap, tpl, meta).then(function (o) {
        /* 模型失败则用本地规则兜底，并标注 */
        return o || craftCopy(prompt, tpl);
      });
    }

    return copyPromise.then(function (copy) {
      d.innerHTML =
        '<div class="reply">' +
          '<p class="reply__lead">已备好' + (snap.copy ? '[图文内容]' : '[图片]') + '，请确认应用。</p>' +
          '<div class="reply__card">' +
            replyCardHTML(copy) +
            '<div class="reply__banner"><div class="reply__loading skeleton"></div></div>' +
            '<div class="reply__foot">' +
              '<span class="reply__apply">应用到</span>' +
              '<button class="reply__target" data-act="pick">' + UI.icon('link') + '选择对象' + UI.icon('chevronDown') + '</button>' +
            '</div>' +
          '</div>' +
          '<details class="reply__cfg">' +
            '<summary>查看生效配置</summary>' +
            '<div class="reply__cfg-body">' +
              '<div><span>执行节点</span><b>id:' + node.id + ' · ' + node.label + '</b></div>' +
              '<div><span>图文布局</span><b>' + meta.full + '</b></div>' +
              '<div><span>生成文案</span><b>' + (snap.copy ? '是' : '否') + '</b></div>' +
              '<div><span>文案模型</span><b>' + UI.escapeHTML(snap.textModel) + (snap.copy && textError ? '（失败，已本地兜底）' : '') + '</b></div>' +
              '<div><span>图像模型</span><b>' + UI.escapeHTML(modelName(snap.imageModel)) + '</b></div>' +
              '<div><span>比例 / 分辨率</span><b>' + snap.ratio + ' · ' + snap.resolution + '</b></div>' +
              '<div><span>出图方式</span><b data-role="mode">本地合成</b></div>' +
              '<div><span>工作流版本</span><b>v' + window.BannerStore.getVersion() + '</b></div>' +
            '</div>' +
          '</details>' +
          '<div class="reply__acts">' +
            '<button class="reply__btn" data-act="regen">' + UI.icon('refresh') + '重新生成</button>' +
            '<button class="reply__btn reply__btn--primary" data-act="apply">应用内容</button>' +
          '</div>' +
        '</div>';

      var host = $('.reply__banner', d);
      var photos = photosFor(tpl);
      var specs = [];
      for (var i = 0; i < snap.count; i++) {
        specs.push({
          /* 交付图保持纯净：不叠加任何文字与按钮 */
          layout: snap.layout,
          copy: false,
          copyData: { eyebrow: '', title: '', desc: '', cta: '' },
          theme: tpl ? tpl.theme : 'dark',
          photo: i === 0 && snap.refImage ? snap.refImage : photos[i % photos.length],
          ratio: snap.ratio,
          resolution: snap.resolution,
          emptyGuide: false
        });
      }

      setTyping('正在按 id:' + node.id + ' 绘制画面 · ' + modelName(snap.imageModel));

      var fullMode = apiMode() === 'full';
      var tasks = specs.map(function (spec, i) {
        return callQwen(prompt, snap, tpl, copy).then(function (res) {
          if (res && res.error) {
            remoteError = res.error;
            return BannerRender.render(spec).then(function (url) { return { url: url, remote: false }; });
          }
          if (res) {
            if (fullMode) return { url: res, remote: true };
            /* 底图直接作为成品，不再叠加文字；取图失败则回退本地素材 */
            return BannerRender.render(Object.assign({}, spec, { baseImage: res }))
              .then(function (url) {
                if (url) return { url: url, remote: true };
                remoteError = 'AI 图取回失败，已用本地素材';
                return BannerRender.render(spec).then(function (u) { return { url: u, remote: false }; });
              });
          }
          return BannerRender.render(spec).then(function (url) { return { url: url, remote: false }; });
        });
      });

      return Promise.all(tasks).then(function (list) {
        var urls = list.map(function (x) { return x.url; });
        var remoteCount = list.filter(function (x) { return x.remote; }).length;
        var modeEl = $('[data-role="mode"]', d);
        if (modeEl) {
          if (remoteCount) {
            modeEl.textContent = (fullMode ? 'AI 整图 · ' : 'AI 底图 · ') + snap.imageModel +
              (remoteCount < urls.length ? '（部分回退本地）' : '');
          } else {
            modeEl.textContent = '本地合成' + (remoteError ? '（接口失败：' + remoteError + '）' : '');
            modeEl.classList.add('is-warn');
          }
        }
        host.innerHTML = urls.map(function (u, idx) {
          return '<img class="reply__img" src="' + u + '" alt="生成的 banner ' + (idx + 1) + '" data-idx="' + idx + '">';
        }).join('');
        $$('.reply__img', host).forEach(function (img) {
          img.addEventListener('click', function () {
            openLightbox(urls, meta, snap, tpl, Number(img.getAttribute('data-idx')));
          });
        });
        scrollChat();
      }).catch(function () {
        host.innerHTML = '<div class="reply__error">出图失败，请重试</div>';
        scrollChat();
      }).then(function () {
        $('[data-act="apply"]', d).addEventListener('click', function () {
          var imgs = $$('.reply__img', host);
          if (!imgs.length) { UI.toast('图片还没生成好，请稍候', 'warn'); return; }
          applyToCanvas(imgs[0].getAttribute('src'), copy, snap, tpl, meta, this);
        });
        $('[data-act="regen"]', d).addEventListener('click', function () {
          if (isGenerating) return;
          runGeneration(prompt, snap);
        });
        $('[data-act="pick"]', d).addEventListener('click', function (e) {
          e.stopPropagation();
          openPicker(this);
        });
      });
    });
  }

  /* 画布组件树：一级是组件，二级是组件内可替换的元素 */
  var COMPONENTS = [
    {
      id: 'hero-carousel', name: '轮播图', group: '幻灯片-1', kind: 'carousel',
      children: [
        { id: 'c-img-1', name: '图片1 - ' + D.photoFiles.headphone, kind: 'image' },
        { id: 'c-title-1', name: '标题1 - 听见自然的声音', kind: 'text' },
        { id: 'c-desc-1', name: '描述1 - 轻盈佩戴，沉浸每一段旋律。', kind: 'text' },
        { id: 'c-cta-1', name: '按钮1 - 探索新品', kind: 'text' },
        { id: 'c-img-2', name: '图片2 - ' + D.photoFiles.interiorA, kind: 'image' },
        { id: 'c-title-2', name: '标题2 - 为日常空间添一点温度', kind: 'text' },
        { id: 'c-desc-2', name: '描述2 - 天然材质，柔和光线，恰到好处。', kind: 'text' }
      ]
    },
    {
      id: 'feature-1', name: '图文列表', group: '企业优势-1', kind: 'list',
      children: [
        { id: 'f1-img-1', name: '图标1 - 天然材质', kind: 'image' },
        { id: 'f1-title-1', name: '标题1 - 天然材质', kind: 'text' },
        { id: 'f1-img-2', name: '图标2 - 手工工艺', kind: 'image' },
        { id: 'f1-title-2', name: '标题2 - 手工工艺', kind: 'text' }
      ]
    },
    { id: 'feature-3a', name: '图文列表', group: '企业优势-3', kind: 'list',
      children: [
        { id: 'f3a-img', name: '图标 - 全球配送', kind: 'image' },
        { id: 'f3a-title', name: '标题 - 全球配送', kind: 'text' }
      ] },
    { id: 'feature-3b', name: '图文列表', group: '企业优势-3', kind: 'list',
      children: [
        { id: 'f3b-img', name: '图标 - 售后保障', kind: 'image' },
        { id: 'f3b-title', name: '标题 - 售后保障', kind: 'text' }
      ] },
    { id: 'multi-text', name: '行', group: '多行图文', kind: 'row',
      children: [
        { id: 'mt-p', name: '段落 - Objects for the way you listen.', kind: 'text' }
      ] },
    { id: 'section-title', name: '标题', group: '精选集合', kind: 'text', children: null },
    { id: 'section-link', name: '链接', group: '精选集合', kind: 'text', children: null }
  ];
  window.BANNER_COMPONENTS = COMPONENTS;

  /* ================= 选择对象：两级选择器 ================= */
  /* 一级 = 页面组件；二级 = 组件内的可替换元素 */
  var PICKER = {
    open: false,
    level: 1,
    currentId: 'hero-carousel',
    currentName: '轮播图',
    anchorBtn: null
  };

  function pageComponents() {
    var CP = window.BANNER_COMPONENTS || [];
    return CP;
  }

  function pickerIcon(kind) {
    var map = { carousel: 'image', list: 'layers', text: 'text', image: 'image', row: 'grid' };
    return UI.icon(map[kind] || 'cube');
  }

  function renderPickerList(keyword) {
    var host = $('#pickerList');
    if (!host) return;
    var kw = (keyword || '').trim();
    var list = pageComponents().filter(function (c) {
      if (!kw) return true;
      if (c.name.indexOf(kw) > -1) return true;
      if (c.group && c.group.indexOf(kw) > -1) return true;
      return false;
    });

    if (!list.length) {
      host.innerHTML = '<div class="pk-elem-sub" style="padding:18px 6px;text-align:center">没有匹配的组件</div>';
      return;
    }

    var html = '';
    var lastGroup = null;
    list.forEach(function (c) {
      if (c.group && c.group !== lastGroup) {
        html += '<div class="pk-group">' + UI.escapeHTML(c.group) + '</div>';
        lastGroup = c.group;
      }
      var sel = c.id === PICKER.currentId;
      html += '<button class="pk-item' + (sel ? ' is-sel' : '') + '" data-cid="' + c.id + '">' +
        '<span class="pk-item__ic">' + pickerIcon(c.kind) + '</span>' +
        '<span class="pk-item__name">' + UI.escapeHTML(c.name) + '</span>' +
        '<span class="pk-item__check">' + UI.icon('check') + '</span>' +
        (c.children && c.children.length ? '<span class="pk-item__more">' + UI.icon('chevronRight') + '</span>' : '') +
      '</button>';
    });
    host.innerHTML = html;

    $$('.pk-item', host).forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var cid = btn.getAttribute('data-cid');
        var comp = pageComponents().filter(function (x) { return x.id === cid; })[0];
        if (!comp) return;
        if (comp.children && comp.children.length) {
          /* 有下级 → 进入二级 */
          PICKER.currentId = comp.id;
          PICKER.currentName = comp.name;
          updatePickerFoot(comp.name);
          renderPickerElements(comp, null);
          setPickerLevel(2);
        } else {
          selectComponent(comp.id, comp.name, null);
          closePicker();
        }
      });
    });
  }

  function renderPickerElements(comp, activeId) {
    var host = $('#pickerElements');
    var title = $('#pickerTitle');
    if (!host) return;
    if (title) title.textContent = '选择组件元素';

    var html = '<div class="pk-elem-sub">' + UI.escapeHTML(comp.name) + '</div>';
    comp.children.forEach(function (el) {
      var sel = el.id === activeId;
      html += '<button class="pk-item' + (sel ? ' is-sel' : '') + '" data-eid="' + el.id + '">' +
        '<span class="pk-item__ic">' + pickerIcon(el.kind) + '</span>' +
        '<span class="pk-item__name">' + UI.escapeHTML(el.name) + '</span>' +
        '<span class="pk-item__check">' + UI.icon('check') + '</span>' +
      '</button>';
    });
    host.innerHTML = html;

    $$('.pk-item', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('.pk-item', host).forEach(function (b) { b.classList.toggle('is-sel', b === btn); });
        var eid = btn.getAttribute('data-eid');
        var el = comp.children.filter(function (x) { return x.id === eid; })[0];
        selectComponent(comp.id, comp.name, el);
        updatePickerFoot(el ? comp.name + ' · ' + el.name : comp.name);
        setTimeout(closePicker, 220);
      });
    });
  }

  function selectComponent(cid, cname, el) {
    PICKER.currentId = cid;
    PICKER.currentName = el ? el.name : cname;
    updatePickerFoot(el ? cname + ' · ' + el.name : cname);
    renderPickerList($('#pickerSearch') ? $('#pickerSearch').value : '');

    /* 同步画布选中态 */
    var wrap = $('#heroWrap');
    if (wrap) {
      if (cid === 'hero-carousel') wrap.classList.add('is-selected');
      else wrap.classList.remove('is-selected');
    }
    var label = el ? el.name : cname;
    var t = el && el.kind === 'text' ? '文本' : '图片';
    UI.toast('已选择「' + label + '」' + (el ? ' · ' + t + '替换目标' : ' · 追加目标'));
  }

  function updatePickerFoot(text) {
    var n = $('#pickerCurrentName');
    if (n) n.textContent = text || PICKER.currentName;
  }

  function setPickerLevel(n) {
    PICKER.level = n;
    $$('.picker__pane').forEach(function (p) {
      p.classList.toggle('is-active', p.getAttribute('data-pane') === (n === 1 ? 'list' : 'elements'));
    });
  }

  function openPicker(btn) {
    PICKER.anchorBtn = btn || null;
    var pop = $('#objPicker');
    if (!pop) return;
    /* 定位到按钮附近 */
    var host = $('.ed-main');
    var pr = pop.parentElement ? pop.parentElement.getBoundingClientRect() : { left: 0, top: 0 };
    var br = (btn || { getBoundingClientRect: function () { return { left: 220, top: 600, bottom: 630 }; } }).getBoundingClientRect();
    var left = br.left - (pop.parentElement ? pr.left : 0) - 6;
    var top = br.top - (pop.parentElement ? pr.top : 0) - 12;
    pop.style.left = Math.max(8, Math.min(left, (host ? host.clientWidth : 400) - 280)) + 'px';
    pop.style.bottom = 'auto';
    pop.style.top = Math.max(8, top - 400 > 8 ? top - 400 : top + 36) + 'px';

    setPickerLevel(1);
    updatePickerFoot(PICKER.currentName);
    renderPickerList('');
    if ($('#pickerSearch')) $('#pickerSearch').value = '';
    pop.classList.add('is-open');
    pop.setAttribute('aria-hidden', 'false');
    PICKER.open = true;
  }

  function closePicker() {
    var pop = $('#objPicker');
    if (!pop) return;
    pop.classList.remove('is-open');
    pop.setAttribute('aria-hidden', 'true');
    PICKER.open = false;
  }

  function bindPicker() {
    var pop = $('#objPicker');
    if (!pop) return;
    if ($('#pickerBack')) {
      $('#pickerBack').addEventListener('click', function () { setPickerLevel(1); });
    }
    if ($('#pickerSearch')) {
      $('#pickerSearch').addEventListener('input', function () { renderPickerList(this.value); });
    }
    if ($('#pickerCurrent')) {
      $('#pickerCurrent').addEventListener('click', function () { setPickerLevel(1); renderPickerList(''); });
    }
    if ($('#pickerPick')) {
      $('#pickerPick').addEventListener('click', function () {
        var wrap = $('#heroWrap');
        if (wrap) {
          wrap.classList.add('is-selected');
          wrap.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
        closePicker();
        UI.toast('已在画布中定位');
      });
    }
    /* 点外部关闭 */
    document.addEventListener('click', function (e) {
      if (!PICKER.open) return;
      if (pop.contains(e.target) || e.target.closest('[data-act="pick"]')) return;
      closePicker();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && PICKER.open) closePicker();
    });
  }

  /* ================= 应用内容到画布轮播 ================= */
  function applyToCanvas(baseUrl, copy, snap, tpl, meta, btnEl) {
    if (btnEl) { btnEl.disabled = true; btnEl.textContent = '应用中…'; }

    var ratio = snap.ratio;
    var res = snap.resolution;

    var job = snap.copy && copy
      ? BannerRender.render({
          /* 底图铺满，文案按生成时的图文布局叠加 */
          overlayCopy: true,
          fullBleed: true,
          layout: snap.layout,
          copy: true,
          copyData: {
            eyebrow: copy.title ? (tpl ? (tpl.copyData && tpl.copyData.eyebrow) || '' : '') : '',
            title: copy.title,
            desc: copy.subtitle || copy.desc || '',
            cta: '了解更多'
          },
          theme: 'dark',
          baseImage: baseUrl,
          ratio: ratio,
          resolution: res
        })
      : BannerRender.render({
          layout: snap.layout, copy: false, copyData: {},
          theme: tpl ? tpl.theme : 'dark',
          baseImage: baseUrl, ratio: ratio, resolution: res
        });

    job.then(function (finalUrl) {
      var page = slideHTML(finalUrl, snap.layout);
      slides.push({ html: page });
      renderSlides();
      goSlide(slides.length - 1);
      $('#heroWrap').classList.add('is-selected');

      var n = slides.length;
      UI.toast('已应用到轮播图 · 追加第 ' + n + ' 张（' + meta.name + '）');
      if (btnEl) { btnEl.disabled = false; btnEl.textContent = '已应用'; }
      setTimeout(function () { if (btnEl) btnEl.textContent = '应用内容'; }, 1800);
    }).catch(function () {
      if (btnEl) { btnEl.disabled = false; btnEl.textContent = '应用内容'; }
      UI.toast('应用失败，请重试', 'warn');
    });
  }

  /* 生成画布里的轮播页（纯图片 + 布局标记） */
  function slideHTML(url, layout) {
    return '<div class="bnr-slide" data-layout="' + layout + '">' +
      '<img src="' + url + '" alt="新增轮播图">' +
      '</div>';
  }

  /* ================= 大图 ================= */
  var lbUrls = [];
  function openLightbox(urls, meta, snap, tpl, idx) {
    lbUrls = urls;
    var headSpan = $('.lightbox__head span');
    if (headSpan) headSpan.textContent = '生成结果 · 1:1';
    $('#lbHost').innerHTML = '<img class="lightbox__img" src="' + urls[idx || 0] + '" alt="生成结果">';
    $('#lbCap').innerHTML = meta.full + ' · ' + (snap.copy ? '生成文案' : '不生成文案') +
      ' · ' + snap.ratio + ' · ' + snap.resolution +
      (tpl ? ' · 模版：' + UI.escapeHTML(tpl.name) : '') +
      ' · <a class="lightbox__dl" download="banner.png" href="' + urls[idx || 0] + '">下载图片</a>';
    UI.openModal('lightbox');
  }

  function zoomImage(url, title, caption) {
    if (!url) return;
    var headSpan = $('.lightbox__head span');
    if (headSpan) headSpan.textContent = title || '图片预览';
    $('#lbHost').innerHTML = '<img class="lightbox__img" src="' + url + '" alt="大图预览">';
    $('#lbCap').innerHTML = (caption ? UI.escapeHTML(caption) + ' · ' : '') +
      '<a class="lightbox__dl" download="image.png" href="' + url + '">下载原图</a>';
    UI.openModal('lightbox');
  }

  function capture() {
    var node = routeNode();
    return {
      layout: state.layout,
      copy: state.copy,
      templateId: state.templateId,
      ratio: state.ratio,
      count: state.count,
      resolution: state.resolution,
      textModel: state.textModel,
      imageModel: state.imageModel,
      refImage: state.refImage,
      refImages: state.refImages ? state.refImages.slice() : [],
      node: node
    };
  }

  function runGeneration(prompt, snap) {
    if (isGenerating) return;
    usedRemote = false;
    remoteError = '';
    textError = '';
    isGenerating = true;
    updateSend();

    var typing = addTyping();
    var t0 = Date.now();
    var tick = setInterval(function () {
      var el = $('#typingText');
      if (!el) return;
      var sec = Math.round((Date.now() - t0) / 1000);
      el.textContent = '正在调用 ' + modelName(snap.imageModel) + ' · ' +
        (apiConfig() ? 'AI 生成中 ' : '本地合成 ') + sec + 's';
    }, 400);

    var done = function () {
      clearInterval(tick);
      if (typing.parentNode) typing.remove();
      isGenerating = false;
      updateSend();
    };

    addResult(prompt, snap).then(done).catch(done);
  }

  /* ================= 输入 ================= */
  var chat = $('#chat');
  var body = $('#chatBody');
  var input = $('#promptInput');

  function send() {
    var text = input.value.trim();
    if (!text) { UI.toast('先描述一下你想要的内容', 'warn'); input.focus(); return; }
    if (/\{产品\}/.test(text)) {
      UI.toast('请把【{产品}】替换成你的产品，例如「无线耳机」', 'warn');
      var ph = input.value.indexOf('【{产品}】');
      if (ph > -1) { input.focus(); try { input.setSelectionRange(ph, ph + 6); } catch (e) {} }
      return;
    }
    if (isGenerating) return;
    closeCfg();
    var snap = capture();
    addUser(text, snap);
    input.value = '';
    clearInputTpl();
    clearInputImages();
    updateSend();
    runGeneration(text, snap);
  }

  function updateSend() {
    $('#sendBtn').disabled = isGenerating || !input.value.trim();
  }
  input.addEventListener('input', updateSend);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  $('#sendBtn').addEventListener('click', send);
  $('#genBtn').addEventListener('click', function () {
    if (!input.value.trim()) input.value = '生成一张耳机新品 banner，深色高级质感';
    updateSend();
    send();
  });

  /* ================= 面板开关 ================= */
  function closeAi() {
    $('#aiPanel').classList.add('is-hidden');
    $('.ed-main').classList.add('ai-closed');
    $('#aiFab').hidden = false;
    $('#aiEntry').hidden = false;
  }
  function openAi() {
    $('#aiPanel').classList.remove('is-hidden');
    $('.ed-main').classList.remove('ai-closed');
    $('#aiFab').hidden = true;
    $('#aiEntry').hidden = true;
    scrollChat();
  }
  $('#closeAi').addEventListener('click', closeAi);
  $('#aiFab').addEventListener('click', openAi);
  $('#aiEntry').addEventListener('click', openAi);

  /* 画布选中 */
  $('#heroWrap').addEventListener('click', function () {
    var on = $('#heroWrap').classList.toggle('is-selected');
    if (on) UI.toast('已选中画布对象：轮播图');
  });
  $('#autoPick').addEventListener('click', function () {
    $('#heroWrap').classList.add('is-selected');
    UI.toast('已识别当前对象：轮播图');
  });
  $('.obj-x').addEventListener('click', function () {
    $('#heroWrap').classList.remove('is-selected');
    UI.toast('已取消选中，可从画布重新选择');
  });
  $('.save-split__main').addEventListener('click', function () { UI.toast('页面已保存'); });
  $('.save-split__more').addEventListener('click', function () { UI.toast('已保存为草稿'); });


  /* ================= 接口配置 ================= */
  function openApi() {
    var a = apiConfig() || {};
    $('#apiBase').value = a.base || '';
    $('#apiKey').value = a.key || '';
    $$('#apiModes input').forEach(function (r) {
      r.checked = r.value === (a.mode || 'compose');
    });
    if ($('#apiExtend')) $('#apiExtend').checked = a.promptExtend === true;
    UI.openModal('apiModal');
  }
  $('#cfgApiBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    closeCfg();
    openApi();
  });
  $('#apiSave').addEventListener('click', function () {
    var base = $('#apiBase').value.trim();
    var key = $('#apiKey').value.trim();
    var mode = 'compose';
    $$('#apiModes input').forEach(function (r) { if (r.checked) mode = r.value; });
    if (!base || !key) {
      window.BannerStore.setApi(null);
      UI.closeModal('apiModal');
      UI.toast('已关闭接口，改为本地合成', 'warn');
      return;
    }
    var extend = $('#apiExtend') ? $('#apiExtend').checked : false;
    window.BannerStore.setApi({ base: base, key: key, mode: mode, provider: 'modelverse', promptExtend: extend });
    UI.closeModal('apiModal');
    UI.toast(mode === 'full' ? '已接入：AI 整图生成' : '已接入：AI 底图 + 本地排版');
  });

  /* ================= 发布同步 ================= */
  window.BannerStore.onChange(function (s, reason) {
    if (reason !== 'publish') return;
    var latest = window.BannerStore.getPublished();
    wf = latest.workflow;
    if (!touched) {
      state.layout = wf.layout;
      state.copy = wf.copy;
      state.ratio = wf.ratio;
      state.count = wf.count;
      state.resolution = wf.resolution;
      state.textModel = wf.textModel;
      state.imageModel = wf.imageModel;
      fillModels($('#textModel'), D.textModels, state.textModel);
      fillModels($('#imageModel'), D.imageModels, state.imageModel);
      updateDock();
    }
    if (pop.classList.contains('is-open')) renderTplPop();
    UI.toast('运营后台已发布 v' + latest.version + '，配置已同步');
  });

  /* ================= 启动 ================= */
  bindPicker();
  updateDock();
  setTimeout(function () { if (!qs.get('modal')) input.focus(); }, 300);

  if (qs.get('tpl')) {
    var t0 = UI.getTemplate(qs.get('tpl'));
    if (t0) useTemplate(t0.id);
  }
  if (qs.get('modal') === 'settings') setTimeout(openCfg, 260);
  if (qs.get('modal') === 'templates') setTimeout(openTplPop, 300);
})();
