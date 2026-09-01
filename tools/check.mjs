// 功能自检：自动播放 / 自动滚屏 / 手动打断 / 结尾烟花
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const CHROME = process.env.LOCALAPPDATA.split(String.fromCharCode(92)).join('/') +
  '/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe';
const PORT = 9334;
mkdirSync('.shots', { recursive: true });
const proc = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`, '--headless=new', '--disable-gpu', '--no-sandbox',
  '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required',
  '--user-data-dir=' + process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/cdpcheck',
  'about:blank',
], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try {
    const j = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    wsUrl = j.find(t => t.type === 'page')?.webSocketDebuggerUrl;
  } catch {}
  if (!wsUrl) await sleep(250);
}
const ws = new WebSocket(wsUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const waiters = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && waiters.has(m.id)) { waiters.get(m.id)(m); waiters.delete(m.id); }
});
const send = (method, params = {}) => {
  const i = ++id; ws.send(JSON.stringify({ id: i, method, params }));
  return new Promise(r => waiters.set(i, r));
};
const evalJs = async expr => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  return r.result?.result?.value;
};

await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send('Page.navigate', { url: 'http://127.0.0.1:8899/index.html' });

const probe = `(()=>{const s=document.getElementById('stage'),a=document.getElementById('bgm');
  return JSON.stringify({idx:Math.round(s.scrollTop/s.clientHeight),
    boot:getComputedStyle(document.getElementById('boot')).display,
    playing:!a.paused, t:+a.currentTime.toFixed(1), vol:+a.volume.toFixed(2),
    capsule:document.getElementById('music').className,
    song:document.getElementById('mTitle').textContent+' / '+document.getElementById('mArtist').textContent,
    autoBtn:document.getElementById('autoBtn').className,
    inPages:[...document.querySelectorAll('.page.is-in')].map(p=>p.dataset.i).join(',')})})()`;

await sleep(4500); console.log('T+4.5s ', await evalJs(probe));
await sleep(6000); console.log('T+10.5s', await evalJs(probe));   // 封面 dwell 9s -> 应已翻到第 2 屏
await sleep(7000); console.log('T+17.5s', await evalJs(probe));   // 应继续往下翻

// 模拟用户手动触摸 -> 自动滚动应暂停
await evalJs(`document.getElementById('stage').dispatchEvent(new TouchEvent('touchstart',{bubbles:true}))`);
await sleep(500);  console.log('after touch', await evalJs(probe));
await sleep(9000); console.log('T+27s (应停在原屏)', await evalJs(probe));

// 结尾页烟花
await evalJs(`(()=>{const s=document.getElementById('stage');s.scrollTo({top:10*s.clientHeight,behavior:'auto'});return 1})()`);
await sleep(5200);
const shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync('.shots/ending-fw.png', Buffer.from(shot.result.data, 'base64'));
console.log('ending  ', await evalJs(probe));
console.log('fw canvas', await evalJs(`(()=>{const c=document.getElementById('fw');return c?c.width+'x'+c.height:'none'})()`));

ws.close(); proc.kill(); process.exit(0);
