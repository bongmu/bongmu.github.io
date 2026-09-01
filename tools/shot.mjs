// 用 CDP 直连无头 Chromium 截图，检查每一屏的排版
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const CHROME = process.env.LOCALAPPDATA.split(String.fromCharCode(92)).join('/') + '/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe';
const URL_ = process.argv[2] || 'http://127.0.0.1:8899/index.html';
const OUT = process.argv[3] || '.shots';
const VW = +(process.argv[4]||390), VH = +(process.argv[5]||844);
const PORT = 9333;
mkdirSync(OUT, { recursive: true });

const proc = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  '--headless=new', '--disable-gpu', '--no-sandbox',
  '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required',
  '--user-data-dir=' + process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/cdpshot',
  'about:blank',
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getWs() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const j = await r.json();
      const pg = j.find(t => t.type === 'page');
      if (pg) return pg.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('no devtools');
}

const wsUrl = await getWs();
const ws = new WebSocket(wsUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));

let id = 0;
const waiters = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && waiters.has(m.id)) { waiters.get(m.id)(m); waiters.delete(m.id); }
});
function send(method, params = {}) {
  const i = ++id;
  ws.send(JSON.stringify({ id: i, method, params }));
  return new Promise(r => waiters.set(i, r));
}

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: VW, height: VH, deviceScaleFactor: 2, mobile: true,
});
await send('Emulation.setUserAgentOverride', {
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
await send('Page.navigate', { url: URL_ });
await sleep(4200);

const logs = await send('Runtime.evaluate', {
  expression: `JSON.stringify({pages: document.querySelectorAll('.page').length, err: window.__err||null})`,
  returnByValue: true,
});
console.log('state:', logs.result?.result?.value);

const n = JSON.parse(logs.result.result.value).pages;
for (let i = 0; i < n; i++) {
  await send('Runtime.evaluate', {
    expression: `(()=>{const s=document.getElementById('stage');
      const pg=s.querySelectorAll('.page')[${i}];
      pg.classList.remove('is-in');
      s.scrollTo({top:${i}*s.clientHeight,behavior:'auto'});
      requestAnimationFrame(()=>pg.classList.add('is-in'));
      return 1})()`,
  });
  await sleep(3400); // 等动画走完
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${OUT}/p${String(i).padStart(2, '0')}.png`, Buffer.from(shot.result.data, 'base64'));
  console.log('shot', i);
}

ws.close();
proc.kill();
process.exit(0);
