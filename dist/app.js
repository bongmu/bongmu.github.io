/* ===================================================================
   婚礼请柬 H5 · 逻辑
   - 打开即播（无点击遮罩）
   - 音乐胶囊：歌名 + 唱片旋转 + 点按暂停/播放
   - 自动逐屏滚动（手动触摸即暂停，右上角按钮可继续）
   - 每屏入场动画 / 视差 / 倒计时 / 导航 / 结尾烟花
   =================================================================== */
(function () {
  'use strict';

  var CFG = window.INVITE || {};
  var C = CFG.couple || {}, W = CFG.wedding || {}, V = CFG.venue || {},
      M = CFG.music || {}, P = CFG.player || {};

  var stage = document.getElementById('stage');
  var hud = document.getElementById('hud');
  var dotsBox = document.getElementById('dots');
  var toastEl = document.getElementById('toast');
  var boot = document.getElementById('boot');
  var bootBar = document.getElementById('bootBar');
  var audio = document.getElementById('bgm');

  var EDIT = /[?&]edit=1/.test(location.search);

  /* ---------------- 小工具 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function d(ms) { return ' style="--d:' + ms + 'ms"'; }
  function focus(p) { return p && p.focus ? ' style="object-position:' + esc(p.focus) + '"' : ''; }
  function img(p, lazy) {
    if (!p) return '';
    return '<img src="' + esc(p.src) + '" alt=""' + (lazy ? ' loading="lazy"' : '') +
           ' decoding="async"' + focus(p) + '>';
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  var toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  /* ---------------- 页面模板 ---------------- */
  var T = {};

  T.cover = function (p) {
    return '' +
      '<div class="bleed kb">' + img(p.photo) + '</div>' +
      '<div class="scrim veil"></div>' +
      '<i class="corner tl" data-anim="fade"' + d(1500) + '></i>' +
      '<i class="corner tr" data-anim="fade"' + d(1560) + '></i>' +
      '<i class="corner bl" data-anim="fade"' + d(1620) + '></i>' +
      '<i class="corner br" data-anim="fade"' + d(1680) + '></i>' +
      '<div class="layer">' +
        '<div class="eyebrow" data-anim="fade"' + d(700) + '>' + esc(p.eyebrow) + '</div>' +
        '<div class="names">' +
          '<span class="nm" data-anim="right"' + d(900) + '>' + esc(C.groom) + '</span>' +
          '<span class="amp" data-anim="fade"' + d(1250) + '>&amp;</span>' +
          '<span class="nm" data-anim="left"' + d(900) + '>' + esc(C.bride) + '</span>' +
        '</div>' +
        '<div class="en" data-anim="fade"' + d(1350) + '>' + esc(C.groomEn) + ' &nbsp;&amp;&nbsp; ' + esc(C.brideEn) + '</div>' +
        '<div class="datewrap">' +
          '<i class="rule c dline" data-anim="rule"' + d(1450) + '></i>' +
          '<div class="date" data-anim="up"' + d(1560) + '>' + esc(W.dateText) + '</div>' +
          '<div class="sub" data-anim="up"' + d(1700) + '>' +
            esc(W.week) + ' · ' + esc(W.lunar) + ' · ' + esc(W.timeText) + '</div>' +
          '<i class="rule c dline" data-anim="rule"' + d(1840) + '></i>' +
        '</div>' +
      '</div>' +
      '<div class="hint" data-anim="fade"' + d(2300) + '>' +
        '<span>' + esc(p.hint) + '</span><i class="arw"></i>' +
      '</div>';
  };

  T.verse = function (p) {
    var lines = (p.lines || []).map(function (t, i) {
      return '<div class="vl" data-anim="up"' + d(700 + i * 190) + '>' + esc(t) + '</div>';
    }).join('');
    return '' +
      '<div class="bleed blur kb">' + img(p.photo, true) + '</div>' +
      '<div class="scrim paper"></div>' +
      '<div class="layer">' +
        '<div class="seal" data-anim="zoom"' + d(260) + '>' + esc(p.no) + '</div>' +
        '<div class="eyebrow" data-anim="fade"' + d(460) + '>' + esc(p.eyebrow) + '</div>' +
        '<div class="vlines">' + lines + '</div>' +
        '<div class="orn" data-anim="fade"' + d(700 + (p.lines || []).length * 190 + 200) + '>' +
          '<i class="rule c" style="width:34px"></i><i class="dot"></i><i class="rule c" style="width:34px"></i>' +
        '</div>' +
      '</div>';
  };

  function capline(p, rightAlign, delay) {
    return '<div class="capline">' +
      '<i class="rule ' + (rightAlign ? 'r' : '') + '" data-anim="rule"' + d(delay) + '></i>' +
      '<span class="no" data-anim="fade"' + d(delay + 120) + '>' + esc(p.no) + '</span>' +
      '<span class="label" data-anim="fade"' + d(delay + 200) + '>' + esc(p.label) + '</span>' +
      '</div>';
  }

  T.single = function (p) {
    var left = p.align !== 'right';
    return '' +
      '<div class="ph frame par kb ' + (left ? 'from-left' : 'from-right') + '" style="--pm:30px;--d:120ms">' +
        img(p.photo) + '<i class="edge"></i></div>' +
      '<i class="offline" data-anim="fade"' + d(820) + '></i>' +
      '<div class="copy">' +
        capline(p, left, 900) +
        '<h2 class="title" data-anim="up"' + d(1080) + '>' + esc(p.title) + '</h2>' +
        '<p class="body" data-anim="up"' + d(1280) + '>' + esc(p.text) + '</p>' +
      '</div>';
  };

  T.duo = function (p) {
    var a = (p.photos || [])[0], b = (p.photos || [])[1];
    return '' +
      '<div class="ph fa par kb from-left" style="--pm:34px;--d:120ms">' + img(a) + '<i class="edge"></i></div>' +
      '<div class="ph fb par kb from-right" style="--pm:-20px;--d:480ms">' + img(b, true) + '<i class="edge"></i></div>' +
      '<i class="offline" data-anim="fade"' + d(980) + '></i>' +
      '<div class="copy">' +
        capline(p, false, 1000) +
        '<h2 class="title" data-anim="up"' + d(1180) + '>' + esc(p.title) + '</h2>' +
        '<p class="body" data-anim="up"' + d(1360) + '>' + esc(p.text) + '</p>' +
      '</div>';
  };

  T.collage = function (p) {
    var q = p.photos || [];
    return '' +
      '<div class="ph fa par kb from-left" style="--pm:30px;--d:120ms">' + img(q[0]) + '<i class="edge"></i></div>' +
      '<div class="ph fb par kb from-right" style="--pm:-22px;--d:400ms">' + img(q[1], true) + '<i class="edge"></i></div>' +
      '<div class="ph fc par kb from-top" style="--pm:16px;--d:680ms">' + img(q[2], true) + '<i class="edge"></i></div>' +
      '<i class="offline" data-anim="fade"' + d(1120) + '></i>' +
      '<div class="copy">' +
        capline(p, false, 1160) +
        '<h2 class="title" data-anim="up"' + d(1340) + '>' + esc(p.title) + '</h2>' +
        '<p class="body" data-anim="up"' + d(1520) + '>' + esc(p.text) + '</p>' +
      '</div>';
  };

  T.invite = function (p) {
    return '' +
      '<div class="bleed blur kb">' + img(p.photo, true) + '</div>' +
      '<div class="scrim paper"></div>' +
      '<div class="layer">' +
        '<div class="card" data-anim="fade"' + d(120) + '>' +
          '<div class="eyebrow" data-anim="fade"' + d(320) + '>' + esc(p.eyebrow) + '</div>' +
          '<h2 class="ivtitle" data-anim="up"' + d(440) + '>' + esc(p.title) + '</h2>' +
          '<div class="pair" data-anim="up"' + d(580) + '>' +
            esc(C.groom) + '<span class="amp">&amp;</span>' + esc(C.bride) + '</div>' +
          '<p class="ivbody" data-anim="up"' + d(720) + '>' + esc(p.body) + '</p>' +
          '<div class="bigdate" data-anim="up"' + d(860) + '>' + esc(W.dateText) + '</div>' +
          '<div class="meta">' +
            '<div class="mrow" data-anim="up"' + d(980) + '>' + esc(W.dateCn) + ' · ' + esc(W.week) + '</div>' +
            '<div class="mrow" data-anim="up"' + d(1060) + '>' + esc(W.lunar) + '　<b>' + esc(W.timeText) + '</b></div>' +
            '<div class="mrow" data-anim="up"' + d(1140) + '><b>' + esc(V.name) + '</b></div>' +
            '<div class="mrow" data-anim="up"' + d(1220) + '>' + esc(V.hall) + '</div>' +
          '</div>' +
          '<div class="tips" data-anim="fade"' + d(1360) + '>' + esc(W.tips) + '</div>' +
          '<span class="seal-xi" data-anim="seal"' + d(1560) + '>囍</span>' +
        '</div>' +
      '</div>';
  };

  T.countdown = function (p) {
    function unit(id, cap) {
      return '<div class="unit"><div class="num" id="' + id + '">--</div><div class="cap">' + cap + '</div></div>';
    }
    return '' +
      '<div class="bleed kb">' + img(p.photo, true) + '</div>' +
      '<div class="scrim dark"></div>' +
      '<div class="layer">' +
        '<div class="eyebrow" data-anim="fade"' + d(260) + '>' + esc(p.eyebrow) + '</div>' +
        '<div class="cdtitle" data-anim="up"' + d(400) + ' id="cdTitle">' + esc(p.title) + '</div>' +
        '<div class="cd" data-anim="up"' + d(620) + '>' +
          unit('cdD', '天') + '<span class="sep">:</span>' +
          unit('cdH', '时') + '<span class="sep">:</span>' +
          unit('cdM', '分') + '<span class="sep">:</span>' +
          unit('cdS', '秒') +
        '</div>' +
        '<div class="cdfoot" data-anim="up"' + d(880) + '>' + esc(W.dateText) + '　' + esc(V.name) + '</div>' +
      '</div>';
  };

  T.map = function (p) {
    var lng = V.lng, lat = V.lat;
    var nm = encodeURIComponent(V.name || ''), ad = encodeURIComponent(V.address || '');
    var amap = 'https://uri.amap.com/marker?position=' + lng + ',' + lat + '&name=' + nm +
               '&src=wedding&coordinate=gaode&callnative=1';
    var qq = 'https://apis.map.qq.com/uri/v1/marker?marker=coord:' + lat + ',' + lng +
             ';title:' + nm + ';addr:' + ad + '&referer=wedding';
    var bd = 'https://api.map.baidu.com/marker?location=' + lat + ',' + lng + '&title=' + nm +
             '&content=' + ad + '&output=html&coord_type=gcj02&src=wedding';

    var calls = (V.contacts || []).map(function (c, i) {
      return '<a class="callbtn" href="tel:' + esc(c.phone) + '" data-anim="up"' + d(1200 + i * 90) + '>' +
        '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2z"/></svg>' +
        esc(c.name) + '</a>';
    }).join('');

    return '' +
      '<div class="layer">' +
        '<div class="eyebrow" data-anim="fade"' + d(200) + '>' + esc(p.eyebrow) + '</div>' +
        '<h2 class="maptitle" data-anim="up"' + d(340) + '>' + esc(p.title) + '</h2>' +
        '<div class="mapcard" data-anim="up"' + d(480) + '>' +
          '<div class="minimap">' + miniMapSVG() +
            '<div class="pin"><b></b><i></i></div>' +
          '</div>' +
          '<div class="mapinfo">' +
            '<h3 class="vname" data-anim="up"' + d(720) + '>' + esc(V.name) + '</h3>' +
            '<div class="vhall" data-anim="up"' + d(800) + '>' + esc(V.hall) + '</div>' +
            '<div class="vaddr" data-anim="up"' + d(880) + '>' + esc(V.address) + '</div>' +
          '</div>' +
          '<div class="navrow">' +
            '<a class="navbtn" href="' + amap + '" target="_blank" rel="noopener" data-anim="up"' + d(960) + '>高德</a>' +
            '<a class="navbtn" href="' + qq + '" target="_blank" rel="noopener" data-anim="up"' + d(1020) + '>腾讯</a>' +
            '<a class="navbtn" href="' + bd + '" target="_blank" rel="noopener" data-anim="up"' + d(1080) + '>百度</a>' +
            '<button class="navbtn" id="copyAddr" data-anim="up"' + d(1140) + '>复制地址</button>' +
          '</div>' +
          (calls ? '<div class="callrow">' + calls + '</div>' : '') +
        '</div>' +
        '<div class="mapnote" data-anim="fade"' + d(1360) + '>' + esc(p.note) + '</div>' +
      '</div>';
  };

  function miniMapSVG() {
    return '<svg viewBox="0 0 352 146" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<rect width="352" height="146" fill="#EDE4D4"/>' +
      '<g fill="#E5DAC5">' +
        '<rect x="14" y="12" width="78" height="42" rx="3"/>' +
        '<rect x="120" y="6" width="62" height="34" rx="3"/>' +
        '<rect x="248" y="16" width="88" height="46" rx="3"/>' +
        '<rect x="18" y="96" width="70" height="40" rx="3"/>' +
        '<rect x="222" y="98" width="104" height="40" rx="3"/>' +
      '</g>' +
      '<path d="M0 78 L352 66" stroke="#FBF7EF" stroke-width="13"/>' +
      '<path d="M0 78 L352 66" stroke="#E3D6BE" stroke-width="1"/>' +
      '<path d="M196 0 L182 146" stroke="#FBF7EF" stroke-width="10"/>' +
      '<path d="M196 0 L182 146" stroke="#E3D6BE" stroke-width="1"/>' +
      '<path d="M104 0 L98 146" stroke="#F6F0E4" stroke-width="5"/>' +
      '<path d="M0 24 C70 40 120 8 200 22 C270 34 310 18 352 30" fill="none" stroke="#CFDCD6" stroke-width="7" opacity=".85"/>' +
      '<g stroke="#DCCFB6" stroke-width="1" stroke-dasharray="3 4">' +
        '<path d="M0 118 L352 108"/><path d="M290 0 L282 146"/>' +
      '</g>' +
      '</svg>';
  }

  T.ending = function (p) {
    var lines = (p.lines || []).map(function (t, i) {
      return '<div class="el' + (i === 0 ? ' big' : '') + '" data-anim="up"' + d(600 + i * 260) + '>' + esc(t) + '</div>';
    }).join('');
    return '' +
      '<div class="bleed dim kb">' + img(p.photo, true) + '</div>' +
      '<div class="scrim night"></div>' +
      '<canvas id="fw"></canvas>' +
      '<div class="layer">' +
        '<div class="elines">' + lines + '</div>' +
        '<div class="esign">' +
          '<i class="rule c" data-anim="rule"' + d(1700) + '></i>' +
          '<div class="enames" data-anim="up"' + d(1820) + '>' + esc(C.groom) + '　' + esc(C.bride) + '</div>' +
          '<div class="edate" data-anim="up"' + d(1940) + '>' + esc(W.dateText) + '</div>' +
          '<div class="etag" data-anim="fade"' + d(2100) + '>' + esc(p.sign) + '</div>' +
        '</div>' +
      '</div>';
  };

  var TONE = { cover: 'dark', countdown: 'dark', ending: 'dark' };

  /* ---------------- 构建 ---------------- */
  var pages = [];

  function build() {
    var html = (CFG.pages || []).map(function (p, i) {
      var fn = T[p.type];
      if (!fn) return '';
      var cls = 'page pg-' + p.type + (p.type === 'single' ? ' al-' + (p.align === 'right' ? 'right' : 'left') : '');
      return '<section class="' + cls + '" data-i="' + i + '" data-tone="' + (TONE[p.type] || 'light') + '">' +
        fn(p) + '</section>';
    }).join('');
    stage.innerHTML = html;
    pages = [].slice.call(stage.querySelectorAll('.page'));
    pages.forEach(measure);

    // 进度点
    dotsBox.innerHTML = pages.map(function () { return '<i></i>'; }).join('');

    // 标题 & 分享信息
    document.title = C.shareTitle || '婚礼邀请函';
  }

  /* 量出每张有框照片的真实比例：--ar1/--ar2/--ar3 + arN-land
     这样竖版照片得到高框、横版照片得到宽框，谁都不会被裁掉半边 */
  function measure(page) {
    [].forEach.call(page.querySelectorAll('.ph'), function (box, k) {
      var im = box.querySelector('img');
      if (!im) return;
      function apply() {
        if (!im.naturalWidth || !im.naturalHeight) return;
        var ar = im.naturalWidth / im.naturalHeight;
        page.style.setProperty('--ar' + (k + 1), ar.toFixed(4));
        page.classList.toggle('ar' + (k + 1) + '-land', ar > 1.05);
      }
      if (im.complete) apply();
      else im.addEventListener('load', apply, { once: true });
    });
  }

  /* ---------------- 开场加载 ---------------- */
  function preload(done) {
    var srcs = [];
    (CFG.pages || []).slice(0, 3).forEach(function (p) {
      if (p.photo) srcs.push(p.photo.src);
      (p.photos || []).forEach(function (q) { srcs.push(q.src); });
    });
    srcs = srcs.filter(function (s, i) { return s && srcs.indexOf(s) === i; });
    if (!srcs.length) return done();

    var n = 0, total = srcs.length, finished = false;
    function step() {
      n++;
      if (bootBar) bootBar.style.width = Math.round(n / total * 100) + '%';
      if (n >= total && !finished) { finished = true; done(); }
    }
    srcs.forEach(function (s) {
      var im = new Image();
      im.onload = im.onerror = step;
      im.src = s;
    });
    // 最长等 3.2 秒，网络再慢也不挡着人看
    setTimeout(function () {
      if (!finished) { finished = true; if (bootBar) bootBar.style.width = '100%'; done(); }
    }, 3200);
  }

  /* ---------------- 音乐 ---------------- */
  var musicBox = document.getElementById('music');
  var playing = false, fadeT;

  function setPlaying(v) {
    playing = v;
    musicBox.classList.toggle('playing', v);
  }
  function openCapsule() {
    musicBox.classList.add('open');   // 歌名常驻，不自动收起
  }
  function fadeIn() {
    clearInterval(fadeT);
    var v = 0; audio.volume = 0;
    fadeT = setInterval(function () {
      v += 0.06;
      if (v >= 1) { v = 1; clearInterval(fadeT); }
      try { audio.volume = v; } catch (e) {}
    }, 60);
  }
  function tryPlay() {
    if (playing) return Promise.resolve();
    var pr = audio.play();
    if (!pr || !pr.then) { setPlaying(true); return Promise.resolve(); }
    return pr.then(function () { setPlaying(true); fadeIn(); })
             .catch(function () { setPlaying(false); });
  }
  function toggleMusic() {
    if (audio.paused) { tryPlay(); openCapsule(); }
    else { audio.pause(); setPlaying(false); openCapsule(); }
  }

  function initMusic() {
    audio.src = M.src || '';
    audio.loop = M.loop !== false;
    audio.preload = 'auto';
    document.getElementById('mTitle').textContent = M.title || '背景音乐';
    document.getElementById('mArtist').textContent = M.artist || '';

    audio.addEventListener('play', function () { setPlaying(true); });
    audio.addEventListener('pause', function () { setPlaying(false); });
    musicBox.addEventListener('click', function (e) { e.stopPropagation(); toggleMusic(); });

    // 1) 直接尝试
    tryPlay();
    // 2) 微信内：桥就绪后系统允许自动播放
    function wxPlay() {
      try { window.WeixinJSBridge.invoke('getNetworkType', {}, function () { tryPlay(); }); }
      catch (e) { tryPlay(); }
    }
    if (window.WeixinJSBridge) wxPlay();
    else document.addEventListener('WeixinJSBridgeReady', wxPlay, false);
    // 3) 兜底：用户第一次触碰屏幕时无声接管（不需要点任何按钮）
    ['touchstart', 'pointerdown', 'mousedown', 'keydown'].forEach(function (ev) {
      document.addEventListener(ev, function once() {
        document.removeEventListener(ev, once, true);
        if (!playing) tryPlay();
      }, true);
    });
    // 4) 回到前台时续播
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && playing && audio.paused) audio.play().catch(function () {});
    });

    openCapsule();
  }

  /* ---------------- 分屏 / 动画 / 自动滚动 ---------------- */
  var cur = -1, auto = P.autoScroll !== false, dwellT, lockT, locked = false, warned = false;
  var autoBtn = document.getElementById('autoBtn');

  function pageH() { return stage.clientHeight || window.innerHeight; }

  function goto(i, smooth) {
    i = clamp(i, 0, pages.length - 1);
    locked = true;
    clearTimeout(lockT);
    lockT = setTimeout(function () { locked = false; }, 1100);
    stage.scrollTo({ top: i * pageH(), behavior: smooth === false ? 'auto' : 'smooth' });
  }

  function setAuto(v, silent) {
    auto = v;
    autoBtn.classList.toggle('off', !v);
    autoBtn.setAttribute('aria-label', v ? '暂停自动滚动' : '开始自动滚动');
    clearTimeout(dwellT);
    if (v) {
      if (cur >= pages.length - 1) { goto(0); }
      else schedule();
      if (!silent) toast('自动滚动已开启');
    } else if (!silent) {
      toast('已暂停自动滚动');
    }
  }

  function schedule() {
    clearTimeout(dwellT);
    if (!auto || cur < 0) return;
    if (cur >= pages.length - 1) { setAuto(false, true); return; }
    var conf = (CFG.pages || [])[cur] || {};
    var ms = conf.dwell || P.dwell || 6800;
    dwellT = setTimeout(function () { if (auto) goto(cur + 1); }, ms);
  }

  function enter(pg) {
    pg.classList.add('is-in');
    var i = +pg.dataset.i;
    if (i === cur) return;
    cur = i;
    [].forEach.call(dotsBox.children, function (n, k) { n.classList.toggle('on', k === i); });
    dotsBox.classList.toggle('on-dark', pg.dataset.tone === 'dark');
    if (pg.querySelector('#fw')) startFireworks(pg.querySelector('#fw'));
    schedule();
  }
  function leave(pg) {
    pg.classList.remove('is-in');
    if (pg.querySelector('#fw')) stopFireworks();
  }

  function observe() {
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (e) {
        if (e.intersectionRatio >= 0.55) enter(e.target);
        else if (e.intersectionRatio <= 0.12) leave(e.target);
      });
    }, { root: stage, threshold: [0, 0.12, 0.55, 0.9] });
    pages.forEach(function (p) { io.observe(p); });
  }

  /* 视差 */
  var rafId = 0;
  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = 0;
      var h = pageH(), top = stage.scrollTop;
      for (var i = Math.max(0, cur - 1); i <= Math.min(pages.length - 1, cur + 1); i++) {
        var p = clamp((i * h - top) / h, -1, 1);
        pages[i].style.setProperty('--p', p.toFixed(3));
      }
    });
  }

  function userInterrupt() {
    if (locked) return;
    if (auto) { setAuto(false, true); if (!warned) { warned = true; toast('已暂停自动滚动 · 右上角可继续'); } }
  }

  /* ---------------- 倒计时 ---------------- */
  function initCountdown() {
    var elD = document.getElementById('cdD');
    if (!elD) return;
    var elH = document.getElementById('cdH'), elM = document.getElementById('cdM'),
        elS = document.getElementById('cdS'), elT = document.getElementById('cdTitle');
    var conf = (CFG.pages || []).filter(function (p) { return p.type === 'countdown'; })[0] || {};
    var target = new Date(W.datetime).getTime();
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var diff = target - Date.now(), past = false;
      if (isNaN(target)) return;
      if (diff < 0) { past = true; diff = -diff; }
      var s = Math.floor(diff / 1000);
      elD.textContent = Math.floor(s / 86400);
      elH.textContent = pad(Math.floor(s % 86400 / 3600));
      elM.textContent = pad(Math.floor(s % 3600 / 60));
      elS.textContent = pad(s % 60);
      if (elT) elT.textContent = past ? (conf.passed || '我们已经携手') : (conf.title || '距离婚礼还有');
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------- 复制地址 ---------------- */
  function initCopy() {
    var btn = document.getElementById('copyAddr');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var txt = (V.name || '') + ' ' + (V.hall || '') + '\n' + (V.address || '');
      var ok = function () { toast('地址已复制'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(ok, fallback);
      } else fallback();
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = txt;
        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); ok(); } catch (e) { toast('长按地址可复制'); }
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------------- 结尾烟花 ---------------- */
  var fwRaf = 0, fwTimer = 0;
  function startFireworks(cv) {
    stopFireworks();
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      cv.width = cv.offsetWidth * dpr;
      cv.height = cv.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    var W2 = function () { return cv.offsetWidth; }, H2 = function () { return cv.offsetHeight; };
    var COLORS = ['#F6E3B4', '#E8C77E', '#FFF1D6', '#F3D5C6', '#E3C9EC'];
    var rockets = [], sparks = [];

    function launch() {
      if (rockets.length > 2) return;
      rockets.push({
        x: W2() * (0.2 + Math.random() * 0.6),
        y: H2() + 8,
        vy: -(H2() * 0.010 + Math.random() * H2() * 0.004),
        ty: H2() * (0.16 + Math.random() * 0.28),
        c: COLORS[(Math.random() * COLORS.length) | 0]
      });
    }
    function burst(x, y, c) {
      var n = 46 + ((Math.random() * 22) | 0);
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, sp = Math.random() * 2.6 + 0.5;
        sparks.push({
          x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 1, dec: 0.007 + Math.random() * 0.010,
          c: Math.random() < 0.25 ? '#FFFFFF' : c, r: Math.random() * 1.6 + 1.1
        });
      }
    }
    function frame() {
      // 用 destination-out 淡出上一帧：既有拖尾，又不会糊住底图
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,.17)';
      ctx.fillRect(0, 0, W2(), H2());
      ctx.globalCompositeOperation = 'lighter';
      for (var i = rockets.length - 1; i >= 0; i--) {
        var r = rockets[i];
        r.y += r.vy; r.vy += 0.05;
        ctx.beginPath();
        ctx.fillStyle = r.c;
        ctx.globalAlpha = 0.9;
        ctx.arc(r.x, r.y, 1.9, 0, 6.284);
        ctx.fill();
        if (r.y <= r.ty || r.vy >= 0) { burst(r.x, r.y, r.c); rockets.splice(i, 1); }
      }
      for (var j = sparks.length - 1; j >= 0; j--) {
        var s = sparks[j];
        s.x += s.vx; s.y += s.vy;
        s.vy += 0.022; s.vx *= 0.988; s.vy *= 0.988;
        s.life -= s.dec;
        if (s.life <= 0) { sparks.splice(j, 1); continue; }
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.284);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      fwRaf = requestAnimationFrame(frame);
    }
    setTimeout(launch, 700);
    fwTimer = setInterval(launch, 1400);
    fwRaf = requestAnimationFrame(frame);
    startFireworks._size = size;
  }
  function stopFireworks() {
    if (fwRaf) cancelAnimationFrame(fwRaf);
    if (fwTimer) clearInterval(fwTimer);
    fwRaf = fwTimer = 0;
  }

  /* ---------------- 编辑模式 ---------------- */
  function initEdit() {
    if (!EDIT) return;
    var bar = document.createElement('div');
    bar.className = 'editbar';
    bar.textContent = '编辑模式：点「换图」预览新照片（刷新即还原）';
    document.body.appendChild(bar);

    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    var target = null;

    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      if (f && target) target.src = URL.createObjectURL(f);
      input.value = '';
    });

    [].forEach.call(stage.querySelectorAll('.ph, .bleed'), function (box) {
      var b = document.createElement('button');
      b.className = 'swapbtn';
      b.textContent = '换图';
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        target = box.querySelector('img');
        input.click();
      });
      box.appendChild(b);
    });
  }

  /* ---------------- 启动 ---------------- */
  function start() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    build();
    initCountdown();
    initCopy();
    initEdit();
    initMusic();

    stage.scrollTop = 0;
    stage.addEventListener('scroll', onScroll, { passive: true });
    ['touchstart', 'wheel', 'keydown'].forEach(function (ev) {
      stage.addEventListener(ev, userInterrupt, { passive: true });
    });
    autoBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      warned = true;
      setAuto(!auto);
    });
    autoBtn.classList.toggle('off', !auto);

    window.addEventListener('orientationchange', function () {
      setTimeout(function () { goto(cur < 0 ? 0 : cur, false); }, 260);
    });

    preload(function () {
      boot.classList.add('gone');
      setTimeout(function () {
        boot.style.display = 'none';
        hud.style.opacity = '1';
        observe();
      }, 120);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
