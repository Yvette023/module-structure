/* =========================================================
   store.js — 运营后台 ↔ 小鱼AI 的共享配置中心
   草稿（draft）在后台编辑，发布（published）后前台才读取到。
   存储：localStorage；同源页面通过 storage 事件实时感知发布。
   ========================================================= */
(function () {
  'use strict';

  var KEY = 'banner-agent:v16';   /* v16：节点提示词按高端广告摄影重写 + 产品占比 45-55% */
  var API_KEY = 'banner-agent:api:v1';

  var DEFAULT_PROMPTS = {
    role: '你是资深电商 banner 文案专家。请根据【用户输入】【风格提示词】【参考图】信息，为这张 banner 输出标题、副标题、标签与简介。\n\n' +
      '输出标准：\n' +
      '1. 标题：不超过 14 个汉字（英文不超过 6 个词），可用「主标题\\n副标题行」两行表达，直指主体与利益点，结尾不加标点。\n' +
      '2. 副标题：不超过 24 个汉字，补一句具体卖点或使用场景，不要重复标题。\n' +
      '3. 标签：3 个，每个不超过 6 个字，不带 # 号。\n' +
      '4. 简介：不超过 50 个汉字，说清是什么、适合谁；不要堆砌形容词与感叹号。\n' +
      '5. 语言跟随【用户输入】：用户写中文就全中文，写英文就全英文。\n' +
      '6. 风格贴合【风格提示词】的调性，不要编造不存在的参数或承诺。\n\n' +
      '只输出 JSON，不要任何解释：\n' +
      '{"title":"","subtitle":"","desc":"","tags":["","",""]}',
    enhance: '你是一名 AI 绘画提示词生成大师，擅长使用 FLUX、Seedream 等模型。\n\n' +
      '请根据用户输入与所选图文布局，补充构图、留白与光影描述，确保文案区不被主体侵占。',
    image: '中远景，产品完整入镜、不被裁切，产品约占画面的 30%–40%，不要顶满画面；' +
      '产品四周由同一场景自然延伸，有环境、有地面、有背景纵深。\n' +
      '一张完整的商业摄影原片，画面从边缘到边缘都填满真实场景，主体与背景自然融合，光影真实，高清。\n' +
      '画面只有摄影内容本身。'
  };


  function deep(o) { return JSON.parse(JSON.stringify(o)); }

  function stripMeta(d) {
    var c = deep(d);
    c.version = 0;
    c.publishedAt = '';
    return c;
  }

  var listeners = [];
  var cache = null;

  function snapshot() {
    if (!cache) cache = ensure();
    return cache;
  }

  function emit(reason) {
    listeners.forEach(function (fn) {
      try { fn(snapshot(), reason); } catch (e) {}
    });
  }

  window.addEventListener('storage', function (e) {
    if (e.key !== KEY) return;
    cache = readRaw();
    emit('storage');
  });

  function validImageModel(id) {
    var list = (window.BANNER_DATA && window.BANNER_DATA.imageModels) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return true;
    return false;
  }

  function migrate(v) {
    var fallback = ((window.BANNER_DATA || {}).defaults || {}).imageModel || 'qwen-image-3.0';
    ['draft', 'published'].forEach(function (k) {
      var wf = v[k] && v[k].workflow;
      if (wf && !validImageModel(wf.imageModel)) wf.imageModel = fallback;
    });
    return v;
  }

  function ensure() {
    var v = readRaw();
    if (v) return migrate(v);
    var d = defaults();
    v = { draft: deep(d), published: deep(d) };
    write(v);
    return v;
  }

  function write(v) {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
  }

  var Store = {
    KEY: KEY,

    /** 当前草稿（后台编辑用） */
    getDraft: function () { return deep(snapshot().draft); },

    /** 已发布版本（前台读取用） */
    getPublished: function () { return deep(snapshot().published); },

    getVersion: function () { return snapshot().published.version; },

    /** 保存草稿，不改变前台可见配置 */
    saveDraft: function (draft) {
      var v = snapshot();
      v.draft = deep(draft);
      write(v);
      cache = v;
      emit('draft');
    },

    /** 发布：草稿覆盖为线上版本，版本号 +1 */
    publish: function (draft) {
      var v = snapshot();
      v.draft = deep(draft || v.draft);
      v.published = deep(v.draft);
      v.published.version = (v.published.version || 0) + 1;
      v.published.publishedAt = new Date().toISOString();
      write(v);
      cache = v;
      emit('publish');
      return v.published.version;
    },

    /** 把线上版本回填为草稿（放弃未发布改动） */
    resetDraft: function () {
      var v = snapshot();
      v.draft = deep(v.published);
      write(v);
      cache = v;
      emit('draft');
    },

    /** 是否与线上一致 */
    isClean: function () {
      var v = snapshot();
      return JSON.stringify(stripMeta(v.draft)) === JSON.stringify(stripMeta(v.published));
    },

    /** 提示词模版列表（以线上版本为准） */
    templates: function () { return deep(snapshot().published.templates || []); },

    getTemplate: function (id) {
      var list = snapshot().published.templates || [];
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return deep(list[i]);
      return null;
    },

    /** 图片/文本模型目录 */
    imageModels: function () { return (window.BANNER_DATA.imageModels || []); },
    textModels: function () { return (window.BANNER_DATA.textModels || []); },
    imageModelName: function (id) {
      var list = this.imageModels();
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].name;
      return id;
    },

    /** 生图接口配置；未配置时回落到 BANNER_DATA.apiDefault */
    getApi: function () {
      var saved = null;
      try { saved = JSON.parse(localStorage.getItem(API_KEY) || 'null'); } catch (e) {}
      if (saved) return saved;
      var def = (window.BANNER_DATA || {}).apiDefault;
      return def ? deep(def) : null;
    },
    setApi: function (api) {
      try {
        if (api) localStorage.setItem(API_KEY, JSON.stringify(api));
        else localStorage.setItem(API_KEY, 'null');
      } catch (e) {}
    },
    /** 清空本地覆盖，回到内置默认接口 */
    resetApi: function () {
      try { localStorage.removeItem(API_KEY); } catch (e) {}
    },

    onChange: function (fn) {
      listeners.push(fn);
      return function () {
        var i = listeners.indexOf(fn);
        if (i > -1) listeners.splice(i, 1);
      };
    },

    /** 调试/重置 */
    resetAll: function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      cache = null;
      emit('reset');
    }
  };

  function defaults() {
    var D = window.BANNER_DATA;
    return {
      version: 1,
      publishedAt: '',
      workflow: {
        copy: true,
        layout: 'left-img',
        textModel: 'gpt-4o-mini',
        imageModel: 'qwen-image-3.0',
        count: 1,
        ratio: '16:9',
        resolution: '1K',
        fillTo: '通用（匹配本组件唯一的图片）',
        prompts: deep(DEFAULT_PROMPTS)
      },
      templates: deep(D.templates || [])
    };
  }

  function readRaw() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      if (!v || !v.draft || !v.published) return null;
      return v;
    } catch (e) { return null; }
  }

  window.BannerStore = Store;
})();
