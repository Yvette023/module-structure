/* =========================================================
   render.js — 把「配置」真实渲染成图片（Canvas）
   布局 / 文案 / 主题 / 比例 / 分辨率全部来自调用参数，
   小鱼的生成结果就是这里产出的 PNG，可直接下载。
   ========================================================= */
(function () {
  'use strict';

  var FONT_SERIF = 'Georgia, "Times New Roman", "Songti SC", "STSong", serif';
  var FONT_SANS = '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

  var THEMES = {
    dark: { bg: '#14161a', fg: '#f6f4ef', sub: 'rgba(246,244,239,.78)', ctaBg: '#f4f1e8', ctaFg: '#14161a', overlay: ['rgba(10,12,16,.10)', 'rgba(10,12,16,.34)', 'rgba(10,12,16,.62)'] },
    light: { bg: '#f3efe8', fg: '#1b1b1b', sub: 'rgba(27,27,27,.72)', ctaBg: '#1b1b1b', ctaFg: '#ffffff', overlay: ['rgba(255,255,255,.08)', 'rgba(24,20,16,.18)', 'rgba(24,20,16,.42)'] }
  };

  function ratioSize(ratio, resolution) {
    var base = ratio === '16:9' ? [1280, 720] : ratio === '4:3' ? [1024, 768] : [1024, 1024];
    if (resolution === '2K') return [base[0] * 2, base[1] * 2];
    return base;
  }

  function loadImage(src) {
    return new Promise(function (resolve) {
      if (!src) return resolve(null);
      if (src instanceof HTMLImageElement) return resolve(src);
      var img = new Image();
      var done = false;
      var finish = function (v) { if (!done) { done = true; resolve(v); } };
      if (/^https?:/i.test(src)) img.crossOrigin = 'anonymous';
      img.onload = function () { finish(img); };
      img.onerror = function () { finish(null); };
      setTimeout(function () { finish(null); }, 20000);
      img.src = src;
    });
  }

  function coverDraw(ctx, img, x, y, w, h) {
    if (!img || !img.width) return;
    var s = Math.max(w / img.width, h / img.height);
    var dw = img.width * s, dh = img.height * s;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function wrapLines(ctx, text, maxWidth) {
    var lines = [];
    text.split('\n').forEach(function (para) {
      if (!para) { lines.push(''); return; }
      var line = '';
      for (var i = 0; i < para.length; i++) {
        var test = line + para[i];
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = para[i];
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
    });
    return lines;
  }

  function drawSpaced(ctx, text, x, y, spacing) {
    var cur = x;
    for (var i = 0; i < text.length; i++) {
      ctx.fillText(text[i], cur, y);
      cur += ctx.measureText(text[i]).width + spacing;
    }
  }

  function measureSpaced(ctx, text, spacing) {
    var w = 0;
    for (var i = 0; i < text.length; i++) w += ctx.measureText(text[i]).width + spacing;
    return w - spacing;
  }

  function buildBlocks(ctx, copy, area, sizes, center) {
    var blocks = [];
    if (copy.eyebrow) blocks.push({ type: 'eyebrow', size: sizes.eyebrow, text: String(copy.eyebrow).toUpperCase() });

    ctx.font = '500 ' + sizes.title + 'px ' + FONT_SERIF;
    wrapLines(ctx, copy.title || '', area.w - area.pad * 2).slice(0, center ? 3 : 4)
      .forEach(function (ln) { blocks.push({ type: 'title', size: sizes.title, text: ln }); });

    if (copy.desc) {
      ctx.font = '400 ' + sizes.desc + 'px ' + FONT_SANS;
      var lines = wrapLines(ctx, copy.desc, area.w - area.pad * 2).slice(0, center ? 3 : 3);
      blocks.push({ type: 'gap', size: Math.round(sizes.desc * 0.6) });
      lines.forEach(function (ln) { blocks.push({ type: 'desc', size: sizes.desc, text: ln }); });
    }
    if (copy.cta) {
      blocks.push({ type: 'gap', size: Math.round(sizes.cta * 0.95) });
      blocks.push({ type: 'cta', size: sizes.cta, text: copy.cta });
    }
    return blocks;
  }

  function measureBlocks(ctx, blocks) {
    var total = 0;
    blocks.forEach(function (b) {
      if (b.type === 'title') { ctx.font = '500 ' + b.size + 'px ' + FONT_SERIF; b.h = b.size * 1.2; }
      else if (b.type === 'desc') { ctx.font = '400 ' + b.size + 'px ' + FONT_SANS; b.h = b.size * 1.75; }
      else if (b.type === 'eyebrow') { ctx.font = '600 ' + b.size + 'px ' + FONT_SANS; b.h = b.size * 2.1; }
      else if (b.type === 'cta') { b.h = b.size * 3.3; }
      else { b.h = b.size; }
      total += b.h;
    });
    return total;
  }

  function overlayArea(layout, W, H) {
    if (layout === 'right-img') return { x: 0, y: 0, w: W * 0.46, h: H };
    if (layout === 'left-img') return { x: W * 0.54, y: 0, w: W * 0.46, h: H };
    if (layout === 'top-img') return { x: 0, y: H * 0.56, w: W, h: H * 0.44, tall: true };
    if (layout === 'bottom-img') return { x: 0, y: 0, w: W, h: H * 0.44, tall: true };
    return { x: 0, y: 0, w: W, h: H };
  }

  function drawScrim(ctx, layout, W, H) {
    var g;
    if (layout === 'right-img') {
      g = ctx.createLinearGradient(0, 0, W * 0.62, 0);
      g.addColorStop(0, 'rgba(10,12,16,.88)');
      g.addColorStop(.62, 'rgba(10,12,16,.55)');
      g.addColorStop(1, 'rgba(10,12,16,0)');
    } else if (layout === 'left-img') {
      g = ctx.createLinearGradient(W, 0, W * 0.38, 0);
      g.addColorStop(0, 'rgba(10,12,16,.88)');
      g.addColorStop(.62, 'rgba(10,12,16,.55)');
      g.addColorStop(1, 'rgba(10,12,16,0)');
    } else if (layout === 'top-img') {
      g = ctx.createLinearGradient(0, H, 0, H * 0.38);
      g.addColorStop(0, 'rgba(10,12,16,.9)');
      g.addColorStop(.7, 'rgba(10,12,16,.5)');
      g.addColorStop(1, 'rgba(10,12,16,0)');
    } else if (layout === 'bottom-img') {
      g = ctx.createLinearGradient(0, 0, 0, H * 0.62);
      g.addColorStop(0, 'rgba(10,12,16,.9)');
      g.addColorStop(.7, 'rgba(10,12,16,.5)');
      g.addColorStop(1, 'rgba(10,12,16,0)');
    } else {
      g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, 'rgba(10,12,16,.28)');
      g.addColorStop(.55, 'rgba(10,12,16,.4)');
      g.addColorStop(1, 'rgba(10,12,16,.66)');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawCopy(ctx, area, copy, theme, opts) {
    var t = THEMES[theme] || THEMES.dark;
    var center = !!opts.center;
    var pad = area.w * (area.tall ? 0.075 : 0.09);
    area = { x: area.x, y: area.y, w: area.w, h: area.h, pad: pad };

    /* 侧栏布局以文案栏宽度为基准，上下/居中布局以画布宽度为基准 */
    var baseW = center || area.tall ? area.w : area.w;
    /* 叠加到画布轮播上的字号：整体收敛，避免图内文字过大 */
    var sizes = center
      ? { eyebrow: baseW * 0.014, title: baseW * 0.050, desc: baseW * 0.017, cta: baseW * 0.015 }
      : area.tall
        ? { eyebrow: baseW * 0.011, title: baseW * 0.038, desc: baseW * 0.014, cta: baseW * 0.012 }
        : { eyebrow: baseW * 0.016, title: baseW * 0.062, desc: baseW * 0.018, cta: baseW * 0.016 };

    var blocks = buildBlocks(ctx, copy, area, sizes, center);
    var total = measureBlocks(ctx, blocks);

    /* 超高时整体缩放，保证不溢出 */
    var limit = area.h * 0.9;
    var guard = 0;
    while (total > limit && guard < 8) {
      Object.keys(sizes).forEach(function (k) { sizes[k] *= 0.9; });
      blocks = buildBlocks(ctx, copy, area, sizes, center);
      total = measureBlocks(ctx, blocks);
      guard++;
    }

    var x = area.x + pad;
    var cx = area.x + area.w / 2;
    var align = center ? 'center' : 'left';
    var y = area.y + (area.h - total) / 2;

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    blocks.forEach(function (b) {
      var baseY = y + b.h / 2;
      if (b.type === 'eyebrow') {
        ctx.font = '600 ' + b.size + 'px ' + FONT_SANS;
        ctx.fillStyle = t.sub;
        var spacing = b.size * 0.24;
        if (align === 'center') {
          var w = measureSpaced(ctx, b.text, spacing);
          drawSpaced(ctx, b.text, cx - w / 2, baseY, spacing);
        } else {
          drawSpaced(ctx, b.text, x, baseY, spacing);
        }
      } else if (b.type === 'title') {
        ctx.font = '500 ' + b.size + 'px ' + FONT_SERIF;
        ctx.fillStyle = t.fg;
        ctx.textAlign = align === 'center' ? 'center' : 'left';
        ctx.fillText(b.text, align === 'center' ? cx : x, baseY);
        ctx.textAlign = 'left';
      } else if (b.type === 'desc') {
        ctx.font = '400 ' + b.size + 'px ' + FONT_SANS;
        ctx.fillStyle = t.sub;
        ctx.textAlign = align === 'center' ? 'center' : 'left';
        ctx.fillText(b.text, align === 'center' ? cx : x, baseY);
        ctx.textAlign = 'left';
      } else if (b.type === 'cta') {
        ctx.font = '600 ' + b.size + 'px ' + FONT_SANS;
        var textW = ctx.measureText(b.text).width;
        var padX = b.size * 1.55, padY = b.size * 0.9;
        var btnW = textW + padX * 2, btnH = b.size + padY * 2;
        var btnX = align === 'center' ? cx - btnW / 2 : x;
        ctx.fillStyle = t.ctaBg;
        roundRect(ctx, btnX, baseY - btnH / 2, btnW, btnH, btnH / 2);
        ctx.fill();
        ctx.fillStyle = t.ctaFg;
        ctx.textAlign = 'center';
        ctx.fillText(b.text, btnX + btnW / 2, baseY + 1);
        ctx.textAlign = 'left';
      }
      y += b.h;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /**
   * 渲染一张 banner，返回 dataURL
   * spec: { layout, copy(bool), copyData, theme, photo, ratio, resolution, emptyGuide }
   */
  function render(spec) {
    var layout = spec.layout || 'left-img';
    var theme = spec.theme === 'light' ? 'light' : 'dark';
    var size = ratioSize(spec.ratio || '16:9', spec.resolution || '1K');
    var W = size[0], H = size[1];

    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    var base = spec.baseImage || spec.baseUrl || spec.photo;
    return loadImage(base).then(function (img) {
      var t = THEMES[theme];
      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, W, H);

      var imgRect, copyArea;
      /* 应用内容到画布：底图铺满，文案按图文布局叠在对应区域 */
      if (spec.overlayCopy && spec.copy) {
        imgRect = { x: 0, y: 0, w: W, h: H };
        copyArea = overlayArea(layout, W, H);
      /* 交付图不叠加文字时，底图铺满整幅画布（布局仅作为生成时的构图约束） */
      } else if (!spec.copy && !spec.emptyGuide) {
        imgRect = { x: 0, y: 0, w: W, h: H };
        copyArea = { x: 0, y: 0, w: W, h: H };
      } else if (layout === 'left-img') {
        imgRect = { x: 0, y: 0, w: W * 0.55, h: H };
        copyArea = { x: W * 0.55, y: 0, w: W * 0.45, h: H };
      } else if (layout === 'right-img') {
        imgRect = { x: W * 0.45, y: 0, w: W * 0.55, h: H };
        copyArea = { x: 0, y: 0, w: W * 0.45, h: H };
      } else if (layout === 'top-img') {
        imgRect = { x: 0, y: 0, w: W, h: H * 0.6 };
        copyArea = { x: 0, y: H * 0.6, w: W, h: H * 0.4, tall: true };
      } else if (layout === 'bottom-img') {
        imgRect = { x: 0, y: H * 0.4, w: W, h: H * 0.6 };
        copyArea = { x: 0, y: 0, w: W, h: H * 0.4, tall: true };
      } else {
        imgRect = { x: 0, y: 0, w: W, h: H };
        copyArea = { x: 0, y: 0, w: W, h: H };
      }

      /* 裁剪图片区域，避免 cover 溢出到文案区 */
      ctx.save();
      ctx.beginPath();
      ctx.rect(imgRect.x, imgRect.y, imgRect.w, imgRect.h);
      ctx.clip();
      coverDraw(ctx, img, imgRect.x, imgRect.y, imgRect.w, imgRect.h);
      ctx.restore();

      if (spec.overlayCopy && spec.copy) {
        drawScrim(ctx, layout, W, H);
      } else if (layout === 'center') {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, t.overlay[0]);
        g.addColorStop(0.52, t.overlay[1]);
        g.addColorStop(1, t.overlay[2]);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      if (spec.baseImage && !img) return null;   /* 远端底图取不到，交给上层回退 */

      if (spec.copy && spec.copyData && spec.copyData.title) {
        drawCopy(ctx, copyArea, spec.copyData,
          spec.overlayCopy ? 'dark' : theme,
          { center: layout === 'center' });
      } else if (!spec.copy && spec.emptyGuide) {
        // 文案位留空：画一个极淡的占位框（仅预览用，导出时关闭）
        ctx.save();
        ctx.strokeStyle = 'rgba(120,130,145,.35)';
        ctx.setLineDash([10, 8]);
        ctx.lineWidth = 2;
        ctx.strokeRect(copyArea.x + 16, copyArea.y + 16, copyArea.w - 32, copyArea.h - 32);
        ctx.restore();
      }

      return canvas.toDataURL('image/png');
    });
  }

  window.BannerRender = {
    render: render,
    ratioSize: ratioSize
  };
})();
