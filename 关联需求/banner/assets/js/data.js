/* =========================================================
   data.js — banner 智能体原型演示数据
   图片来自项目内参考图裁切，本地加载、离线可用
   ========================================================= */
(function () {
  /* 画布生成需要同源图片，优先使用内嵌 data URL（img-data.js），预览仍用本地文件 */
  var EMB = window.BANNER_IMG || {};
  var PHOTOS = {
    headphone: EMB.headphone || 'assets/img/headphones.jpg',
    interiorA: EMB.interiorA || 'assets/img/interior-a.jpg',
    interiorB: EMB.interiorB || 'assets/img/interior-b.jpg',
    product: EMB.product || 'assets/img/product.jpg'
  };
  var PHOTO_FILES = {
    headphone: 'assets/img/headphones.jpg',
    interiorA: 'assets/img/interior-a.jpg',
    interiorB: 'assets/img/interior-b.jpg',
    product: 'assets/img/product.jpg'
  };
  var GALLERY = {
    red: 'assets/img/g-red.jpg',
    bread: 'assets/img/g-bread.jpg',
    build: 'assets/img/g-build.jpg',
    kitchen: 'assets/img/g-kitchen.jpg',
    cert: 'assets/img/g-cert.jpg',
    board: 'assets/img/g-board.jpg'
  };

  var COVERS = {
    headphone: 'assets/img/cover-headphones.jpg',
    interiorA: 'assets/img/cover-interior-a.jpg',
    interiorB: 'assets/img/cover-interior-b.jpg',
    product: 'assets/img/cover-product.jpg'
  };

  var LAYOUTS = [
    {
      id: 'left-img',
      name: '左图右文',
      full: '左图右文',
      select: '左图右文',
      isDefault: true,
      desc: '图片在左、文案在右，阅读动线自然，适合品牌故事与新品首发。'
    },
    {
      id: 'right-img',
      name: '右图左文',
      full: '右图左文',
      select: '右图左文',
      desc: '先文后图，强钩子开场，适合促销活动与利益点前置。'
    },
    {
      id: 'top-img',
      name: '上图下文',
      full: '上图下文',
      select: '上图下文',
      desc: '大图开场、文案托底，适合商品展示与系列合集。'
    },
    {
      id: 'bottom-img',
      name: '下图上文',
      full: '下图上文',
      select: '下图上文',
      desc: '文案先行、图片收尾，适合卖点说明与材质解读。'
    },
    {
      id: 'center',
      name: '文字居中',
      full: '文字居中',
      select: '文字居中',
      desc: '整图铺底 + 居中大字，视觉冲击最强，适合主推爆款。'
    }
  ];

  /* =========================================================
     三个提示词模版（对应三张参考图）
     stylePrompt：风格提示词，只用于图像生成，不在小鱼AI 前台展示
     prompt：结构提示词，描述排版与画面关系
     ========================================================= */
  var TEMPLATES = [
    {
      id: 'tpl-1',
      name: '高端家居',
      sub: 'banner模块',
      desc: '暖调空间铺满画面，居中细体大字，适合家居与生活美学品牌。',
      layout: 'center',
      copy: true,
      theme: 'light',
      photo: 'assets/img/tpl-misirui.jpg',
      refKey: 'tpl_misirui',
      refSubject: '客厅家具与室内空间',
      refMode: 'style',
      gallery: 'assets/img/tpl-misirui.jpg',
      cover: 'assets/img/cover-tpl-misirui.jpg',
      refs: ['assets/img/tpl-misirui.jpg'],
      status: '已发布',
      category: 'banner模块',
      weight: 100,
      created: '2026-11-22 10:12:00',
      updated: '2026-11-23 11:40',
      usage: 63,
      favorite: 5,
      copyData: {
        eyebrow: 'MISIRUI · CUSTOM FURNITURE',
        title: '灯光设计\n点亮生活',
        desc: '根植于艺术与个性的高端定制家居品牌。',
        cta: 'READ MORE'
      },
      stylePrompt:
        '高端定制家具品牌空间摄影。米白与暖沙色调的现代极简客厅，浅色石材与木饰面，' +
        '大面积落地窗自然光，通透柔和，光影层次丰富；广角建筑室内构图，浅景深，' +
        '杂志级家居空间摄影质感，画面干净克制。',
      prompt: '高端定制家居的客厅，暖色调'
    },
    {
      id: 'tpl-2',
      name: '科技数码',
      sub: 'banner模块',
      desc: '深蓝黑渐变 + 霓虹光带，产品与暗部环境自然融合，适合 3C 新品。',
      layout: 'right-img',
      copy: true,
      theme: 'dark',
      photo: 'assets/img/tpl-colorx.jpg',
      refKey: 'tpl_colorx',
      refSubject: '摄像头、监控器等安防设备',
      refMode: 'style',
      gallery: 'assets/img/tpl-colorx.jpg',
      cover: 'assets/img/cover-tpl-colorx.jpg',
      refs: ['assets/img/tpl-colorx.jpg'],
      status: '已发布',
      category: 'banner模块',
      weight: 90,
      created: '2026-11-21 16:05:00',
      updated: '2026-11-23 10:22',
      usage: 48,
      favorite: 4,
      copyData: {
        eyebrow: 'COLORX SERIES',
        title: 'ColorX Camera\nSeries',
        desc: '夜间也清晰，4K 全彩夜视。',
        cta: 'Learn More'
      },
      stylePrompt:
        '深色科技产品摄影。深蓝到纯黑的渐变背景，冷色霓虹光带以几何线条穿插构成空间，' +
        '产品群组置于画面右侧，带柔和接触阴影与地面反射；电影级硬边打光，金属与磨砂质感清晰，' +
        '深色空间自然延展、光影连贯；3C 数码产品摄影。',
      prompt: '摄像头新品，深色科技感'
    },
    {
      id: 'tpl-3',
      name: '工业产品',
      sub: 'banner模块',
      desc: '深灰影棚 + 冷调金属光，设备居右、左侧放标题与卖点，适合工业设备。',
      layout: 'right-img',
      copy: true,
      theme: 'dark',
      photo: 'assets/img/tpl-creality.jpg',
      refKey: 'tpl_creality',
      refSubject: '3D 打印机及其配件',
      refMode: 'style',
      gallery: 'assets/img/tpl-creality.jpg',
      cover: 'assets/img/cover-tpl-creality.jpg',
      refs: ['assets/img/tpl-creality.jpg'],
      status: '已发布',
      category: 'banner模块',
      weight: 80,
      created: '2026-11-20 09:31:00',
      updated: '2026-11-23 09:05',
      usage: 35,
      favorite: 2,
      copyData: {
        eyebrow: 'K1C SERIES',
        title: 'K1C\n冠军速度',
        desc: '600mm/s 高速打印，支持碳纤维耗材。',
        cta: 'Buy Now'
      },
      stylePrompt:
        '工业级设备产品广告。深灰渐变无缝影棚背景，顶部柔光箱冷调打光，金属机身呈现清晰高光与' +
        '细腻磨砂质感；设备与配件组合陈列于画面右侧，地面有柔和反射与浅景深，' +
        '整体理性、精密、科技感；产品目录级清晰度。',
      prompt: '3D 打印机，深灰影棚'
    }

    ,{
      id: 'tpl-4',
      name: '时尚配饰',
      sub: 'banner模块',
      desc: '暖棕影棚 + 错落展台陈列，左文右图，适合服饰、包袋、配饰品类。',
      layout: 'left-img',
      copy: true,
      theme: 'light',
      photo: 'assets/img/tpl-fashion.jpg',
      gallery: 'assets/img/tpl-fashion.jpg',
      cover: 'assets/img/cover-tpl-fashion.jpg',
      refs: ['assets/img/tpl-fashion.jpg'],
      refKey: 'tpl_fashion',
      refSubject: '草帽、手提包、草编包等配饰',
      refMode: 'style',
      status: '已发布',
      category: 'banner模块',
      weight: 85,
      created: '2026-11-23 21:40:00',
      updated: '2026-11-23 22:00',
      usage: 0,
      favorite: 0,
      copyData: {
        eyebrow: 'SPRING COLLECTION',
        title: '春日配饰\n全新系列',
        desc: '前沿潮流配饰，快速打样，稳定 bulk 供应。',
        cta: 'Read More'
      },
      stylePrompt:
        '暖棕色无缝影棚，柔和顶光与侧光塑造体积感；产品陈列在高低错落的方形展台上，' +
        '形成前后层次与节奏；右侧为拱形壁龛作背景纵深，地面为细腻沙色材质；' +
        '整体温暖、克制、有手工质感，时尚配饰目录摄影。',
      prompt: '时尚配饰新品，暖棕影棚陈列'
    }
    ,{
      id: 'tpl-5',
      name: '机车头盔',
      sub: 'banner模块',
      desc: '红黑竞速背景 + 三产品并排，上图下文，适合运动、机车、硬核品类。',
      layout: 'top-img',
      copy: true,
      theme: 'dark',
      photo: 'assets/img/tpl-helmet.jpg',
      gallery: 'assets/img/tpl-helmet.jpg',
      cover: 'assets/img/cover-tpl-helmet.jpg',
      refs: ['assets/img/tpl-helmet.jpg'],
      refKey: 'tpl_helmet',
      refSubject: '摩托车头盔',
      refMode: 'style',
      status: '已发布',
      category: 'banner模块',
      weight: 80,
      created: '2026-11-23 21:45:00',
      updated: '2026-11-23 22:00',
      usage: 0,
      favorite: 0,
      copyData: {
        eyebrow: 'MY HELMETS',
        title: 'SAFETY,\nMY STYLE.',
        desc: '全球合规认证，原创设计。',
        cta: 'Read More'
      },
      stylePrompt:
        '深炭黑到暗红的竞速风格背景，带细密的划痕与速度线纹理；三件产品并排悬浮居中，' +
        '底部有向后延伸的彩色光轨强化速度感；硬朗的轮廓光勾勒产品边缘，高对比、有冲击力；' +
        '运动装备广告摄影。',
      prompt: '摩托车头盔新品，红黑竞速风'
    }
    ,{
      id: 'tpl-6',
      name: '电竞硬件',
      sub: 'banner模块',
      desc: '星空月面场景 + RGB 灯效，上图下文，适合电竞、外设、PC 硬件。',
      layout: 'top-img',
      copy: true,
      theme: 'dark',
      photo: 'assets/img/tpl-gaming.jpg',
      gallery: 'assets/img/tpl-gaming.jpg',
      cover: 'assets/img/cover-tpl-gaming.jpg',
      refs: ['assets/img/tpl-gaming.jpg'],
      refKey: 'tpl_gaming',
      refSubject: '电脑机箱风扇、水冷排等 PC 硬件',
      refMode: 'style',
      status: '已发布',
      category: 'banner模块',
      weight: 75,
      created: '2026-11-23 21:50:00',
      updated: '2026-11-23 22:00',
      usage: 0,
      favorite: 0,
      copyData: {
        eyebrow: 'TITAN 360',
        title: '4 吋屏幕\n尽显你的风格',
        desc: '一块会说话的 4 吋屏。',
        cta: 'Explore More'
      },
      stylePrompt:
        '深蓝紫色的星空与月面荒漠场景，地面为灰色月壤质感，远处地平线低平；' +
        '产品置于画面中下部，带彩色 RGB 灯效光晕并向地面投射霓虹反光；' +
        '冷调、科技感、有未来氛围，电竞硬件广告摄影。',
      prompt: '电竞水冷散热器新品，星空月面场景'
    }
  ];

  /* 图像模型：ModelVerse 网关（Qwen Image 3.0 系列，实测可用） */
  var IMAGE_MODELS = [
    { id: 'qwen-image-3.0',     name: 'Qwen Image 3.0',      provider: 'ModelVerse', note: '标准版 · 支持文生图 / 图生图' },
    { id: 'qwen-image-3.0-pro', name: 'Qwen Image 3.0 Pro',  provider: 'ModelVerse', note: 'Pro 版 · 细节与文字更强' }
  ];

  var TEXT_MODELS = [
    { id: 'gpt-4o-mini',   name: 'GPT-4o mini',        provider: 'ModelVerse' },
    { id: 'gpt-4.1-mini',  name: 'GPT-4.1 mini',       provider: 'ModelVerse' }
  ];

  window.BANNER_DATA = {
    photos: PHOTOS,
    photoFiles: PHOTO_FILES,
    covers: COVERS,
    gallery: GALLERY,
    layouts: LAYOUTS,
    templates: TEMPLATES,
    defaults: {
      layout: 'left-img',
      copy: true,
      templateId: null,
      ratio: '16:9',
      count: 1,
      resolution: '1K',
      textModel: 'gpt-4o-mini',
      imageModel: 'qwen-image-3.0'
    },
    ratioMap: { '1:1': '1x1', '4:3': '4x3', '16:9': '16x9' },
    imageModels: IMAGE_MODELS,
    textModels: TEXT_MODELS,
    apiDefault: {
      base: 'https://api.modelverse.cn/v1',
      key: 'dAHUvg9QIPFm7DHBC6F37cB3-4CbA-49De-8F43-9b92B031',
      provider: 'modelverse',
      mode: 'compose'
    }
  };
})();
