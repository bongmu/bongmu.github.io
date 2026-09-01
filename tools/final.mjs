// 收尾自检：控制台报错 / 回滚重播 / 编辑模式 / 静态资源
import { spawn } from 'node:child_process';
const CHROME = process.env.LOCALAPPDATA.split(String.fromCharCode(92)).join('/') +
  '/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe';
const PORT = 9335;
const proc = spawn(CHROME, [`--remote-debugging-port=${PORT}`, '--headless=new', '--disable-gpu',
  '--no-sandbox', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required',
  '--user-data-dir=' + process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/cdpfinal',
  'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await sleep(250);
}
const ws = new WebSocket(wsUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const waiters = new Map(); const problems = [];
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && waiters.has(m.id)) { waiters.get(m.id)(m); waiters.delete(m.id); return; }
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type))
    problems.push('console.' + m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description).join(' '));
  if (m.method === 'Runtime.exceptionThrown')
    problems.push('EXCEPTION: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
  if (m.method === 'Network.loadingFailed') problems.push('LOAD FAILED: ' + m.params.errorText);
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400)
    problems.push('HTTP ' + m.params.response.status + ' ' + m.params.response.url);
});
const send = (method, params = {}) => { const i = ++id; ws.send(JSON.stringify({ id: i, method, params })); return new Promise(r => waiters.set(i, r)); };
const ev = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.result?.value;

await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

await send('Page.navigate', { url: 'http://127.0.0.1:8899/index.html?edit=1' });
await sleep(4500);
console.log('编辑模式 换图按钮数 =', await ev(`document.querySelectorAll('.swapbtn').length`));
console.log('编辑提示条        =', await ev(`!!document.querySelector('.editbar')`));

// 往下翻两屏再翻回封面，确认动画会重播
await ev(`(()=>{const s=document.getElementById('stage');s.scrollTo({top:2*s.clientHeight,behavior:'auto'});return 1})()`);
await sleep(1500);
await ev(`(()=>{const s=document.getElementById('stage');s.scrollTo({top:0,behavior:'auto'});return 1})()`);
await sleep(300);
console.log('回到封面后 is-in   =', await ev(`[...document.querySelectorAll('.page.is-in')].map(p=>p.dataset.i).join(',')||'(空-动画将重播)'`));
await sleep(1200);
console.log('1.5s 后 is-in      =', await ev(`[...document.querySelectorAll('.page.is-in')].map(p=>p.dataset.i).join(',')`));

// 静态资源 404 检查
console.log('404 页面           =', (await (await fetch('http://127.0.0.1:8899/404.html')).text()).includes('回到邀请函'));
for (const u of ['config.js','app.js','style.css','assets/music/he-ni-deng-yan-hua.mp3','assets/photos/09.jpg','CNAME']) {
  const r = await fetch('http://127.0.0.1:8899/' + u, { method: 'HEAD' });
  console.log('  ', r.status, u, r.headers.get('content-length'));
}
console.log('\n控制台问题:', problems.length ? problems : '无');
ws.close(); proc.kill(); process.exit(0);
