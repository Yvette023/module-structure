/* 本地视觉校验工具：用 headless Chrome + CDP 逐屏截图
   用法：node tools/shot.mjs tools/shots.json [outDir]                    */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
const ROOT = process.cwd();
const cfgPath = process.argv[2];
const outDir = process.argv[3] || '.shots';
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const shots = Array.isArray(cfg) ? cfg : cfg.shots;
const basePage = Array.isArray(cfg) ? 'index.html' : (cfg.page || 'index.html');
fs.mkdirSync(outDir, { recursive: true });

// 清掉上一次可能残留的无头 Chrome（同一端口/配置目录会复用旧页面与 localStorage）
try { spawn('pkill', ['-f', 'remote-debugging-port=' + PORT], { stdio: 'ignore' }); } catch {}
await new Promise((r) => setTimeout(r, 600));

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  '--user-data-dir=' + path.join(ROOT, '.chrome-profile'),
  '--remote-debugging-port=' + PORT,
  '--force-device-scale-factor=1',
  '--window-size=1440,1000',
  'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function targets() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page;
    } catch {}
    await sleep(250);
  }
  throw new Error('chrome did not start');
}

const page = await targets();
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let seq = 0;
const pending = new Map();
const errors = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.method === 'Runtime.exceptionThrown') {
    errors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    errors.push('console.error: ' + msg.params.args.map((a) => a.value ?? a.description).join(' '));
  }
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
  }
};
function send(method, params = {}) {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((res, rej) => pending.set(id, { res, rej }));
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' :: ' + expression);
  return r.result.value;
}

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false
});

let curPage = basePage;
const url = 'file://' + path.join(ROOT, basePage);
await send('Page.navigate', { url });
await sleep(1400);

// 等图片
await evaluate(`(async () => {
  const imgs = [...document.images];
  await Promise.all(imgs.map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 8000); })));
  return imgs.length;
})()`);

await evaluate(`window.__set = function (mod, key, val) {
  const host = document.querySelector('[data-ctrl="' + mod + '"]');
  const btn = host && host.querySelector('.chip[data-key="' + key + '"][data-value="' + val + '"]');
  if (btn) btn.click();
  return !!btn;
};`);

const WAIT_IMGS = (sel) => `(async () => {
  const root = document.querySelector(${JSON.stringify(sel)}) || document;
  root.scrollIntoView({ block: 'center' });
  const imgs = [...root.querySelectorAll('img')];
  imgs.forEach(i => { if (i.loading !== 'eager') i.loading = 'eager'; });
  await Promise.all(imgs.map(i => (i.complete && i.naturalWidth) ? 1 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 6000); })));
  return imgs.length;
})()`;

let curW = 1440, curH = 1000;
for (const shot of shots) {
  const w = shot.width || 1440;
  const hgt = shot.height || 1000;
  if (w !== curW || hgt !== curH) {
    curW = w; curH = hgt;
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: hgt, deviceScaleFactor: 1, mobile: w < 760 });
    await sleep(400);
  }
  if (shot.page && shot.page !== curPage) {
    curPage = shot.page;
    await send('Page.navigate', { url: 'file://' + path.join(ROOT, curPage) });
    await sleep(1400);
  }
  if (shot.eval) await evaluate(shot.eval);
  await evaluate(WAIT_IMGS(shot.sel));
  await sleep(shot.wait || 500);
  await evaluate('window.scrollTo(0, 0)');
  await sleep(120);
  const rect = await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(shot.sel)});
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height };
  })()`);
  if (!rect) { console.log('missing selector', shot.sel); continue; }
  const params = shot.viewport
    ? { format: 'png' }
    : {
        format: 'png',
        captureBeyondViewport: true,
        clip: {
          x: Math.max(0, rect.x - 8),
          y: Math.max(0, rect.y - 8),
          width: Math.min(curW, rect.width + 16),
          height: rect.height + 16,
          scale: 1
        }
      };
  const res = await send('Page.captureScreenshot', params);
  fs.writeFileSync(path.join(outDir, shot.name + '.png'), Buffer.from(res.data, 'base64'));
  console.log('shot', shot.name, Math.round(rect.width) + 'x' + Math.round(rect.height));
}

console.log(errors.length ? 'PAGE ERRORS:\n' + errors.join('\n') : 'no page errors');
ws.close();
chrome.kill('SIGKILL');
process.exit(0);
