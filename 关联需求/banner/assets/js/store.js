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
    /* id:2 角色定义 —— 决定标题/副标题/标签/简介的文案质量 */
    role: '你是高端品牌电商 banner 的文案总监，服务追求质感的品牌。\n\n' +
      '根据【用户输入】【风格提示词】输出文案：\n' +
      '1. 标题：≤12 个汉字（英文 ≤5 个词），可用「主句\\n副句」两行；用名词短语或动宾结构，\n' +
      '   不写完整句子、结尾不加标点；禁止「震撼/超值/必买/爆款/疯抢」这类廉价词。\n' +
      '2. 副标题：≤20 个汉字，一句具体利益点或使用场景，不与标题重复。\n' +
      '3. 标签：3 个，每个 ≤5 字，不带 # 号；取品类、场景、材质等名词。\n' +
      '4. 简介：≤45 个汉字，说清「是什么 + 适合谁」，克制陈述，不堆砌形容词。\n\n' +
      '语言跟随【用户输入】；调性贴合【风格提示词】；不编造参数与承诺。\n' +
      '只输出 JSON，不要解释：{"title":"","subtitle":"","desc":"","tags":["","",""]}',

    /* id:5 提示词增强 —— 画面质感规范（作为静态约束追加，不额外调用模型） */
    enhance: '【影调质感】大画幅商业广告摄影质感：单一柔和主光配合环境补光，产品边缘有干净轮廓光；\n' +
      '影调层次分明，高光受控不溢出、暗部保留细节；材质（金属/皮革/织物/玻璃/哑光塑料）纹理清晰可辨。\n' +
      '【色彩】低饱和高级灰调，色温统一，色彩克制不刺眼；画面通透、有空气感。\n' +
      '【画面干净】避免塑料感、过度锐化、廉价打光；不出现文字、字母、数字、按钮、图标、水印。\n' +
      '【氛围】边缘轻微暗角收束视线，背景有柔和渐变，整体有广告大片的从容感。',

    /* id:8 图像生成 —— 构图、占比与合规约束（id:6 同构，图生图时产品原貌优先） */
    image: '中景偏近，产品完整入镜不被裁切，约占画面 45%–55%，是画面唯一视觉焦点，不要顶满画面；\n' +
      '产品四周由同一场景自然延伸：地面、背景纵深、前景虚化，形成前中后层次；\n' +
      '构图稳定，主体略偏一侧或居中，画面有明确的明暗引导；\n' +
      '不要出现纯色块、分栏、边框、拼接痕迹或空白占位区。'
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
