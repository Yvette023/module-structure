/* =========================================================
   editor-fields.js — 通用低代码控件片段与表单原子组件
   ========================================================= */
(function () {
  'use strict';

  var ED = window.ED = window.ED || {};
  var icon = window.icon;

  var getPath = function (p) { return ED.getPath(p); };
  var setPath = function (p, v) { return ED.setPath(p, v); };

  function isVert(s)  { return s.layout.imgText === 'tb' || s.layout.imgText === 'bt'; }


  function isHoriz(s) { return !isVert(s); }


  function esc(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }


  function label(text, opts) {
    opts = opts || {};
    var eye = '';
    if (opts.eye) {
      eye = '<button class="ed-ibtn" data-act="toggle" data-bind="' + opts.eye + '"' +
        ' style="width:20px;height:20px" title="显示/隐藏">' +
        icon(getPath(opts.eye) ? 'eye' : 'eyeOff') + '</button>';
    }
    return '<span class="flabel">' + text + eye + '</span>';
  }


  function row(inner, cls) {
    return '<div class="frow' + (cls ? ' ' + cls : '') + '">' + inner + '</div>';
  }


  function seg(bind, value, options, cls) {
    var btns = options.map(function (o) {
      var on = String(o.v) === String(value);
      return '<button type="button" data-act="seg" data-bind="' + bind + '" data-value="' + o.v + '"' +
        (on ? ' class="is-on"' : '') + '>' + (o.icon ? icon(o.icon) : o.l) + '</button>';
    }).join('');
    return '<div class="fseg' + (cls ? ' ' + cls : '') + '">' + btns + '</div>';
  }


  function sw(bind, on) {
    return '<button type="button" class="fsw' + (on ? ' is-on' : '') + '" data-act="toggle" data-bind="' + bind + '"' +
      ' role="switch" aria-checked="' + (on ? 'true' : 'false') + '"></button>';
  }


  function inp(bind, value, placeholder) {
    return '<input class="finput" data-bind="' + bind + '" value="' + esc(value) + '"' +
      ' placeholder="' + esc(placeholder || '') + '">';
  }


  function area(bind, value, placeholder) {
    return '<textarea class="ftext" data-bind="' + bind + '" placeholder="' + esc(placeholder || '') + '">' +
      esc(value) + '</textarea>';
  }


  var REM = 16;


  function toDisplay(v) {
    var state = ED.state;
    var n = Number(v) || 0;
    return state.unit === 'rem' ? Math.round((n / REM) * 100) / 100 : n;
  }


  function fromDisplay(v) {
    var state = ED.state;
    var n = Number(v) || 0;
    return state.unit === 'rem' ? n * REM : n;
  }


  function unitSelect() {
    var state = ED.state;
    var cur = state.unit || 'px';
    return '<span class="dim-unit-tag">' +
      '<select class="funit dim-unit-select" data-bind="unit" title="单位">' +
        '<option value="px"' + (cur === 'px' ? ' selected' : '') + '>px</option>' +
        '<option value="rem"' + (cur === 'rem' ? ' selected' : '') + '>rem</option>' +
      '</select>' +
      icon('chevronDown', 'dim-unit-arrow') +
    '</span>';
  }


  function num(bind, value, unit, min, max, step) {
    var state = ED.state;
    var display = toDisplay(value);
    return '<span class="fnum">' +
      '<input type="number" data-bind="' + bind + '" data-px="1" value="' + esc(display) + '"' +
      (min != null ? ' min="' + toDisplay(min) + '"' : '') +
      (max != null ? ' max="' + toDisplay(max) + '"' : '') +
      ' step="' + (state.unit === 'rem' ? 0.25 : 1) + '">' +
    '</span>' + unitSelect();
  }


  function dimNum(bind, value, min, max) {
    var state = ED.state;
    var display = toDisplay(value);
    return '<span class="dim-num"><input type="number" data-bind="' + bind + '" data-px="1" value="' + esc(display) + '"' +
      (min != null ? ' min="' + toDisplay(min) + '"' : '') +
      (max != null ? ' max="' + toDisplay(max) + '"' : '') +
      ' step="' + (state.unit === 'rem' ? 0.25 : 1) + '"></span>';
  }


  function dimCtl(opts) {
    var mode = getPath(opts.modeBind) || 'uni';
    var isCorner = opts.type === 'corner' || opts.label === '圆角';
    var iconUni = isCorner ? 'cornerAll' : 'paddingAll';
    var iconInd = isCorner ? 'cornerInd' : 'paddingInd';

    var tabs = '<span class="dim-tabs-icon">' +
      '<button type="button" class="' + (mode === 'uni' ? 'is-on' : '') + '" data-act="dim-mode" data-bind="' + opts.modeBind + '" data-value="uni" title="统一">' + icon(iconUni) + '</button>' +
      '<button type="button" class="' + (mode === 'ind' ? 'is-on' : '') + '" data-act="dim-mode" data-bind="' + opts.modeBind + '" data-value="ind" title="独立">' + icon(iconInd) + '</button>' +
    '</span>';

    var vals;
    if (opts.type === 'gap') {
      vals = mode === 'ind'
        ? '<span class="dim-vals dim-vals--2">' +
            dimNum(opts.field + 'X', getPath(opts.field + 'X'), opts.min, opts.max) +
            dimNum(opts.field + 'Y', getPath(opts.field + 'Y'), opts.min, opts.max) +
          '</span>'
        : '<span class="dim-vals dim-vals--1">' + dimNum(opts.field, getPath(opts.field), opts.min, opts.max) + '</span>';
    } else {
      var sides = opts.type === 'box' ? ['T', 'R', 'B', 'L'] : ['Tl', 'Tr', 'Br', 'Bl'];
      vals = mode === 'ind'
        ? '<span class="dim-vals dim-vals--4">' + sides.map(function (sfx) {
            return dimNum(opts.field + sfx, getPath(opts.field + sfx), opts.min, opts.max);
          }).join('') + '</span>'
        : '<span class="dim-vals dim-vals--1">' + dimNum(opts.field, getPath(opts.field), opts.min, opts.max) + '</span>';
    }

    return '<div class="dim">' +
      '<div class="dim__header">' +
        '<span class="dim__title">' + opts.label + '</span>' +
        unitSelect() +
      '</div>' +
      '<div class="dim__row">' + tabs + vals + '</div>' +
    '</div>';
  }


  function color(bind, value, withAlpha) {
    var hex = String(value || '#000000');
    var six = '#' + hex.replace('#', '').slice(0, 6);
    return '<span class="fcolor">' +
      '<input type="color" data-bind="' + bind + '" data-kind="color" value="' + six + '">' +
      '<input type="text" data-bind="' + bind + '" data-kind="hex" value="' + esc(hex) + '">' +
    '</span>';
  }


  function select(bind, value, options) {
    return '<div class="fselect-field">' +
      '<select class="fselect-input" data-bind="' + bind + '">' + options.map(function (o) {
        return '<option value="' + o.v + '"' + (String(o.v) === String(value) ? ' selected' : '') + '>' + o.l + '</option>';
      }).join('') + '</select>' +
      icon('chevronDown', 'fselect-arrow') +
    '</div>';
  }


  function range(bind, value, min, max, step, unit) {
    return '<span class="frange">' +
      '<input type="range" data-bind="' + bind + '" data-kind="range" min="' + min + '" max="' + max + '"' +
      ' step="' + step + '" value="' + esc(value) + '">' +
      '<span class="fnum" style="height:24px;padding:0 6px"><input type="number" data-bind="' + bind + '"' +
      ' value="' + esc(value) + '" min="' + min + '" max="' + max + '" step="' + step + '"' +
      ' style="width:38px">' + (unit ? '<span>' + unit + '</span>' : '') + '</span>' +
    '</span>';
  }


  function shadowCtl(prefix) {
    var sh = getPath(prefix);
    return row(label('投影') + sw(prefix + '.on', sh.on)) +
      '<div class="fshadow">' +
        num(prefix + '.x', sh.x) + num(prefix + '.y', sh.y) +
        num(prefix + '.blur', sh.blur) + num(prefix + '.spread', sh.spread) +
      '</div>' +
      '<div class="fshadow__cap"><span>X</span><span>Y</span><span>模糊</span><span>扩散</span></div>';
  }


  function sec(id, title, body, opts) {
    var ui = ED.ui;
    opts = opts || {};
    var open = ui.open[id];
    return '<section class="sec' + (open ? ' is-open' : '') + '" data-sec="' + id + '">' +
      '<button class="sec__head" data-act="sec" data-sec="' + id + '">' +
        '<span>' + title + '</span>' + icon('chevron') +
      '</button>' +
      '<div class="sec__body">' + body + '</div>' +
    '</section>';
  }


  ED.isVert = isVert;
  ED.isHoriz = isHoriz;
  ED.esc = esc;
  ED.label = label;
  ED.row = row;
  ED.seg = seg;
  ED.sw = sw;
  ED.inp = inp;
  ED.area = area;
  ED.REM = REM;
  ED.toDisplay = toDisplay;
  ED.fromDisplay = fromDisplay;
  ED.unitSelect = unitSelect;
  ED.num = num;
  ED.dimNum = dimNum;
  ED.dimCtl = dimCtl;
  ED.color = color;
  ED.select = select;
  ED.range = range;
  ED.shadowCtl = shadowCtl;
  ED.sec = sec;
})();
