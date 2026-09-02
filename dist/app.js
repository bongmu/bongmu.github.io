/* ===================================================================
   婚礼请柬 H5 · 中国红七页版 · 逻辑
   - 打开即播（无点击遮罩）
   - 音乐胶囊：歌名 + 唱片旋转 + 点按暂停/播放
   - 自动逐屏滚动（手动触摸即暂停，右上角按钮可继续）
   - 入场动画 / 视差 / 倒计时 / 日历 / 导航 / 回执 / 结尾烟花
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
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* 所有照片一律不 lazy —— 九张压完总共不到 1MB，
     开场时全部预载，滚到哪一屏都不会有「图还没出来」的空档 */
  function img(p) {
    if (!p || !p.src) return '';
    return '<img src="' + esc(p.src) + '" alt="" decoding="async"' +
           (p.focus ? ' style="object-position:' + esc(p.focus) + '"' : '') + '>';
  }

  var toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ---------------- 1/7 封面 ---------------- */
  var T = {};

  /* 婚呗式标题：逐字翻滚进场（囍 已造进字体，当普通字符处理） */
  function rollTitle(t) {
    var src = esc(t), out = '', i = 0;
    function rc(ch) {
      return '<span class="rc" style="--rd:' + (260 + (i++) * 75) + 'ms">' + ch + '</span>';
    }
    out += rc('<i>“</i>');
    for (var k = 0; k < src.length; k++) out += rc(src.charAt(k));
    return out + rc('<i>”</i>');
  }

  T.cover = function (p) {
    return '' +
      '<div class="topstrip" data-anim="fade"' + d(1900) + '>' + esc(p.topStrip) + '</div>' +
      '<div class="bigtitle">' + rollTitle(p.bigTitle) + '</div>' +
      '<div class="ph hero kb par" style="--pm:16px;--d:600ms">' + img(p.photo) + '</div>' +
      '<div class="foot">' +
        '<div class="nrow">' +
          '<span class="nm" data-anim="right"' + d(1500) + '>' + esc(C.groom) + '</span>' +
          '<span class="xipair" data-anim="zoom"' + d(1350) + '>囍</span>' +
          '<span class="nm" data-anim="left"' + d(1500) + '>' + esc(C.bride) + '</span>' +
        '</div>' +
        '<div class="date" data-anim="up"' + d(1660) + '>' + esc(W.dateText) + '</div>' +
        '<div class="place" data-anim="up"' + d(1790) + '>' +
          esc(V.name) + '　' + esc(V.hall) + '</div>' +
      '</div>' +
      '<div class="hint" data-anim="fade"' + d(2300) + '>' +
        '<span>' + esc(p.hint) + '</span><i class="arw"></i></div>';
  };

  /* ---------------- 2/7 邀请函 ---------------- */
  T.invite = function (p) {
    var verse = (p.verse || []).map(function (t, i) {
      return '<div class="vl" data-anim="up"' + d(700 + i * 200) + '>' + esc(t) + '</div>';
    }).join('');
    return '' +
      '<div class="ph band kb" style="--d:60ms">' + img(p.photo) + '</div>' +
      (p.eyebrow ? '<div class="eyebrow" data-anim="fade"' + d(520) + '>' +
        esc(p.eyebrow) + '</div>' : '') +
      '<div class="layer">' +
        '<div class="verse">' + verse + '</div>' +
        ((p.verse && p.verse.length && p.body)
          ? '<i class="vslash" data-anim="fade"' + d(1050) + '>/</i>' : '') +
        '<p class="ivbody" data-anim="up"' + d(1180) + '>' + esc(p.body) + '</p>' +
        '<div class="seal"><span class="xi-seal" data-anim="seal"' + d(1450) + '>囍</span></div>' +
        (p.sign ? '<div class="sign" data-anim="up"' + d(1760) + '>' +
          esc(p.sign) + '</div>' : '') +
      '</div>';
  };

  /* ---------------- 3/7 相册 ---------------- */
  T.gallery = function (p) {
    var q = p.photos || [];
    return '' +
      '<div class="ph ga card par" data-anim="tilt" style="--pm:26px;--d:420ms">' + img(q[0]) + '</div>' +
      '<div class="ph gb card par" data-anim="tilt" style="--pm:-18px;--d:700ms">' + img(q[1]) + '</div>' +
      '<div class="ph gc card par" data-anim="tilt" style="--pm:20px;--d:960ms">' + img(q[2]) + '</div>' +
      '<i class="heart h1" data-anim="zoom"' + d(1250) + '>❤</i>' +
      '<i class="heart h2" data-anim="zoom"' + d(1360) + '>❤</i>' +
      '<i class="heart h3" data-anim="zoom"' + d(1470) + '>❤</i>' +
      '<div class="cap">' +
        '<div class="gtitle" data-anim="up"' + d(1300) + '>' + esc(p.title) + '</div>' +
        '<i class="rule" style="width:40px" data-anim="rule"' + d(1450) + '></i>' +
        '<div class="gtext" data-anim="up"' + d(1560) + '>' + esc(p.text) + '</div>' +
      '</div>';
  };

  /* ---------------- 4/7 倒计时 ---------------- */
  T.countdown = function (p) {
    function u(id, cap) {
      return '<div class="u"><span class="n" id="' + id + '">--</span><span class="c">' + cap + '</span></div>';
    }
    return '' +
      '<div class="ph cdph wipe from-left kb par" style="--pm:22px;--d:120ms">' + img(p.photo) + '</div>' +
      '<div class="bigxi" data-anim="zoom"' + d(1150) + '>囍</div>' +
      '<div class="cdbox">' +
        '<div class="cdtitle" data-anim="fade"' + d(520) + ' id="cdTitle">' + esc(p.title) + '</div>' +
        '<div data-anim="left"' + d(640) + '>' + u('cdD', '天') + '</div>' +
        '<div data-anim="left"' + d(740) + '>' + u('cdH', '时') + '</div>' +
        '<div data-anim="left"' + d(840) + '>' + u('cdM', '分') + '</div>' +
        '<div data-anim="left"' + d(940) + '>' + u('cdS', '秒') + '</div>' +
      '</div>' +
      '<div class="quote">' +
        '<div class="qcn" data-anim="up"' + d(1460) + '>' + esc(p.cn) + '</div>' +
      '</div>';
  };

  /* ---------------- 5/7 婚礼时间（日历） ---------------- */
  function calendarHTML() {
    var t = new Date(W.datetime);
    if (isNaN(t)) t = new Date();
    var y = t.getFullYear(), m = t.getMonth(), day = t.getDate();
    var first = new Date(y, m, 1).getDay();              // 0=周日
    var days = new Date(y, m + 1, 0).getDate();
    var prev = new Date(y, m, 0).getDate();

    var cells = '';
    ['日', '一', '二', '三', '四', '五', '六'].forEach(function (w) {
      cells += '<div class="w">' + w + '</div>';
    });
    for (var i = 0; i < first; i++) cells += '<div class="d off">' + (prev - first + 1 + i) + '</div>';
    for (var k = 1; k <= days; k++) {
      cells += '<div class="d' + (k === day ? ' on' : '') + '">' + k + '</div>';
    }
    var tail = (7 - (first + days) % 7) % 7;
    for (var j = 1; j <= tail; j++) cells += '<div class="d off">' + j + '</div>';

    return '' +
      '<div class="calhead">' +
        '<span class="m">' + ('0' + (m + 1)).slice(-2) + ' / ' + ('0' + day).slice(-2) + '</span>' +
        '<span class="s">' + y + '</span>' +
      '</div>' +
      '<div class="calgrid">' + cells + '</div>' +
      '<div class="calfoot">' +
        '<div class="r1">' + esc(W.week) + '　' + esc(W.lunar) + '</div>' +
        '<div class="r2">' + esc(W.tips) + '</div>' +
      '</div>';
  }

  T.vow = function (p) {
    var q = p.photos || [];
    var lines = (p.lines || []).map(function (t, i) {
      return '<div class="cl" data-anim="up"' + d(1000 + i * 170) + '>' + esc(t) + '</div>';
    }).join('');
    return '' +
      (p.eyebrow ? '<div class="eyebrow" data-anim="fade"' + d(240) + '>' +
        esc(p.eyebrow) + '</div>' : '') +
      '<div class="ph cala card par" data-anim="tilt" style="--pm:20px;--d:260ms">' + img(q[0]) + '</div>' +
      '<div class="ph calb card par" data-anim="tilt" style="--pm:-14px;--d:480ms">' + img(q[1]) + '</div>' +
      '<div class="vowbox">' +
        '<i class="rule c" style="width:38px" data-anim="rule"' + d(880) + '></i>' +
        '<div class="clines">' + lines + '</div>' +
        '<span class="xi-seal" data-anim="seal"' + d(1760) + '>囍</span>' +
        (p.sign ? '<div class="vsign" data-anim="up"' + d(1900) + '>' +
          esc(p.sign) + '</div>' : '') +
      '</div>';
  };

  /* ---------------- 6/7 地址 ---------------- */
  function miniMapSVG() {
    return '<svg viewBox="0 0 340 118" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<rect width="340" height="118" fill="#E9DECA"/>' +
      '<g fill="#E0D2B8">' +
        '<rect x="12" y="8" width="74" height="34" rx="3"/>' +
        '<rect x="116" y="4" width="58" height="28" rx="3"/>' +
        '<rect x="238" y="12" width="86" height="38" rx="3"/>' +
        '<rect x="16" y="78" width="66" height="34" rx="3"/>' +
        '<rect x="214" y="80" width="100" height="34" rx="3"/>' +
      '</g>' +
      '<path d="M0 64 L340 54" stroke="#FBF6EC" stroke-width="12"/>' +
      '<path d="M0 64 L340 54" stroke="#DCCBAE" stroke-width="1"/>' +
      '<path d="M190 0 L178 118" stroke="#FBF6EC" stroke-width="9"/>' +
      '<path d="M190 0 L178 118" stroke="#DCCBAE" stroke-width="1"/>' +
      '<path d="M100 0 L94 118" stroke="#F6EFE1" stroke-width="5"/>' +
      '<path d="M0 20 C68 34 116 6 194 18 C262 29 300 14 340 25" fill="none" stroke="#CBDBD4" stroke-width="6" opacity=".85"/>' +
      '<g stroke="#DCCBAE" stroke-width="1" stroke-dasharray="3 4">' +
        '<path d="M0 96 L340 88"/><path d="M280 0 L272 118"/></g>' +
      '</svg>';
  }

  T.address = function (p) {
    var lng = V.lng, lat = V.lat;
    var nm = encodeURIComponent(V.name || ''), ad = encodeURIComponent(V.address || '');
    var amap = 'https://uri.amap.com/marker?position=' + lng + ',' + lat + '&name=' + nm +
               '&src=wedding&coordinate=gaode&callnative=1';
    var qq = 'https://apis.map.qq.com/uri/v1/marker?marker=coord:' + lat + ',' + lng +
             ';title:' + nm + ';addr:' + ad + '&referer=wedding';
    var bd = 'https://api.map.baidu.com/marker?location=' + lat + ',' + lng + '&title=' + nm +
             '&content=' + ad + '&output=html&coord_type=gcj02&src=wedding';
    var calls = (V.contacts || []).map(function (c, i) {
      return '<a class="callbtn" href="tel:' + esc(c.phone) + '">' +
        '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2z"/></svg>' +
        esc(c.name) + '</a>';
    }).join('');

    return '' +
      '<div class="ph band kb" style="--d:60ms">' + img(p.photo) + '</div>' +
      '<div class="layer">' +
        '<div class="mapcard" data-anim="up"' + d(700) + '>' +
          '<div class="minimap">' + miniMapSVG() + '<div class="pin"><b></b><i></i></div></div>' +
          '<div class="mapinfo">' +
            '<h3 class="vname">' + esc(V.name) + '</h3>' +
            '<div class="vhall">' + esc(V.hall) + '</div>' +
            '<div class="vaddr">' + esc(V.address) + '</div>' +
          '</div>' +
          '<div class="navrow">' +
            '<a class="navbtn" href="' + amap + '" target="_blank" rel="noopener">高德</a>' +
            '<a class="navbtn" href="' + qq + '" target="_blank" rel="noopener">腾讯</a>' +
            '<a class="navbtn" href="' + bd + '" target="_blank" rel="noopener">百度</a>' +
            '<button class="navbtn" id="copyAddr">复制地址</button>' +
          '</div>' +
          (calls ? '<div class="callrow">' + calls + '</div>' : '') +
        '</div>' +
        '<div class="mapnote" data-anim="fade"' + d(1340) + '>' + esc(p.note) + '</div>' +
      '</div>';
  };

  /* ---------------- 7/7 结尾 + 回执（烟花页） ---------------- */
  T.ending = function (p) {
    var lines = (p.lines || []).map(function (t, k) {
      return '<div class="el" data-anim="up"' + d(900 + k * 220) + '>' + esc(t) + '</div>';
    }).join('');
    return '' +
      '<div class="bleed kb">' + img(p.photo) + '</div>' +
      '<div class="scrim night"></div>' +
      '<canvas id="fw"></canvas>' +
      '<div class="bigtitle" data-anim="down"' + d(400) + '>' + esc(p.bigTitle) + '</div>' +
      '<div class="efoot">' +
        '<div class="elines">' + lines + '</div>' +
        '<i class="rule c" style="width:44px" data-anim="rule"' + d(1600) + '></i>' +
        '<div class="enames" data-anim="up"' + d(1720) + '>' +
          esc(C.groom) + '　' + esc(C.bride) + '</div>' +
        '<div class="edate" data-anim="up"' + d(1840) + '>' +
          esc(W.dateText) + '　' + esc(V.name) + '</div>' +
        '<div class="etag" data-anim="fade"' + d(2000) + '>' + esc(p.sign) + '</div>' +
      '</div>';
  };

  /* 哪几页要内描金框 */
  /* 留空 = 所有页都不要内描边框。想把封面那圈加回来就写回 { cover: 1 } */
  var FRAMED = {};

  /* ---------------- 构建 ---------------- */
  var pages = [];

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

  function build() {
    stage.innerHTML = (CFG.pages || []).map(function (p, i) {
      var fn = T[p.type];
      if (!fn) return '';
      return '<section class="page pg-' + p.type + (FRAMED[p.type] ? ' framed' : '') +
             '" data-i="' + i + '">' + fn(p) + '</section>';
    }).join('');
    pages = [].slice.call(stage.querySelectorAll('.page'));
    pages.forEach(measure);
    dotsBox.innerHTML = pages.map(function () { return '<i></i>'; }).join('');
    document.title = C.shareTitle || '婚礼邀请函';
  }

  /* ---------------- 开场：把九张照片全部预载 ---------------- */
  function preload(done) {
    var srcs = [];
    (CFG.pages || []).forEach(function (p) {
      if (p.photo && p.photo.src) srcs.push(p.photo.src);
      (p.photos || []).forEach(function (q) { if (q && q.src) srcs.push(q.src); });
    });
    srcs = srcs.filter(function (s, i) { return srcs.indexOf(s) === i; });
    if (!srcs.length) return done();

    var n = 0, total = srcs.length, finished = false, shown = false;
    function step() {
      n++;
      if (bootBar) bootBar.style.width = Math.round(n / total * 100) + '%';
      if (n >= total) finish();
    }
    function finish() {
      if (finished) return;
      finished = true;
      if (bootBar) bootBar.style.width = '100%';
      done();
    }
    srcs.forEach(function (s) {
      var im = new Image();
      im.onload = im.onerror = step;
      im.src = s;
    });
    // 网络再慢也最多挡 4 秒，之后照片继续在后台加载
    setTimeout(finish, 4000);
    if (shown) return;
  }

  /* ---------------- 音乐 ---------------- */
  var musicBox = document.getElementById('music');
  var playing = false, fadeT;

  var mStatus;
  function setPlaying(v) {
    playing = v;
    musicBox.classList.toggle('playing', v);
    if (mStatus) mStatus.textContent = v ? '音乐正在播放中…' : '音乐已暂停　点此播放';
  }
  function fadeIn() {
    clearInterval(fadeT);
    var v = 0; try { audio.volume = 0; } catch (e) {}
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
    if (audio.paused) tryPlay();
    else { audio.pause(); setPlaying(false); }
  }

  function initMusic() {
    audio.preload = 'metadata';        // 3.6MB 不跟照片抢带宽，点开就能播
    audio.src = M.src || '';
    audio.loop = M.loop !== false;
    mStatus = document.getElementById('mStatus');
    document.getElementById('mTitle').textContent =
      (M.title || '背景音乐') + (M.artist ? ' - ' + M.artist : '');
    setPlaying(false);

    audio.addEventListener('play', function () { setPlaying(true); });
    audio.addEventListener('pause', function () { setPlaying(false); });
    musicBox.addEventListener('click', function (e) { e.stopPropagation(); toggleMusic(); });

    tryPlay();                                    // 1) 直接试
    function wxPlay() {                           // 2) 微信内桥就绪后系统放行
      try { window.WeixinJSBridge.invoke('getNetworkType', {}, function () { tryPlay(); }); }
      catch (e) { tryPlay(); }
    }
    if (window.WeixinJSBridge) wxPlay();
    else document.addEventListener('WeixinJSBridgeReady', wxPlay, false);
    // 3) 兜底：任何一个用户动作都试一次，直到播起来为止
    ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown', 'scroll'].forEach(function (ev) {
      document.addEventListener(ev, function again() {
        if (playing) { document.removeEventListener(ev, again, true); return; }
        tryPlay();
      }, true);
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && playing && audio.paused) audio.play().catch(function () {});
    });
  }

  /* ---------------- 分屏 / 动画 / 自动滚动 ---------------- */
  var cur = -1, auto = P.autoScroll !== false, dwellT, lockT, locked = false;
  var idleT, AUTO_ON = P.autoScroll !== false;

  function pageH() { return stage.clientHeight || window.innerHeight; }

  /* iOS 上地址栏收起会改变 100dvh，整屏吸附容器跟着抖、甚至卡住。
     所以开场量一次高度写成固定 px，之后只在真正转屏时才更新。 */
  var lockedW = 0, lockedH = 0;
  function lockHeight() {
    var h = window.innerHeight, w = window.innerWidth;
    // 只有宽度变了（转屏）或高度变化超过 120px（不是地址栏那点伸缩）才重设
    if (w === lockedW && Math.abs(h - lockedH) < 120) return;
    lockedW = w; lockedH = h;
    document.documentElement.style.setProperty('--app-h', h + 'px');
    if (cur > 0) stage.scrollTop = cur * h;
  }

  /* iOS Safari 上 scroll-snap:mandatory 会把 scrollTo({behavior:'smooth'})
     按回去，页面就像卡死了。所以这里自己做补间，动画期间把吸附临时关掉。 */
  var animRaf = 0;
  function goto(i) {
    i = clamp(i, 0, pages.length - 1);
    var from = stage.scrollTop, to = i * pageH();
    if (Math.abs(to - from) < 2) return;

    locked = true;
    clearTimeout(lockT);
    if (animRaf) cancelAnimationFrame(animRaf);
    stage.style.scrollSnapType = 'none';

    var t0 = 0, DUR = 760;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / DUR);
      // easeInOutCubic，和 CSS 的手感接近
      var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      stage.scrollTop = from + (to - from) * e;
      if (k < 1) { animRaf = requestAnimationFrame(step); return; }
      animRaf = 0;
      stage.style.scrollSnapType = '';       // 交还给吸附
      lockT = setTimeout(function () { locked = false; }, 140);
    }
    animRaf = requestAnimationFrame(step);
  }

  function setAuto(v) {
    auto = v;
    clearTimeout(dwellT);
    if (v) schedule();
  }

  function schedule() {
    clearTimeout(dwellT);
    if (!auto || cur < 0) return;
    if (cur >= pages.length - 1) { auto = false; return; }   // 最后一页停住，不循环
    var conf = (CFG.pages || [])[cur] || {};
    dwellT = setTimeout(function () { if (auto) goto(cur + 1); },
                        conf.dwell || P.dwell || 7200);
  }

  function enter(pg) {
    pg.classList.add('is-in');
    var i = +pg.dataset.i;
    if (i === cur) return;
    cur = i;
    [].forEach.call(dotsBox.children, function (n, k) { n.classList.toggle('on', k === i); });
    var dark = pg.classList.contains('pg-ending');   // 结尾页是暗的，控件反色
    dotsBox.classList.toggle('on-dark', dark);
    hud.classList.toggle('on-dark', dark);
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

  var rafId = 0;
  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = 0;
      var h = pageH(), top = stage.scrollTop;
      for (var i = Math.max(0, cur - 1); i <= Math.min(pages.length - 1, cur + 1); i++) {
        pages[i].style.setProperty('--p', clamp((i * h - top) / h, -1, 1).toFixed(3));
      }
    });
  }

  /* 手动滑动时先让开，停手 10 秒后自动接着播 —— 所以不需要开关按钮 */
  function userInterrupt() {
    if (locked || !AUTO_ON) return;
    auto = false;
    clearTimeout(dwellT);
    clearTimeout(idleT);
    idleT = setTimeout(function () {
      if (cur < pages.length - 1) setAuto(true);
    }, 10000);
  }

  /* ---------------- 倒计时 ---------------- */
  function initCountdown() {
    var elD = document.getElementById('cdD');
    if (!elD) return;
    var elH = document.getElementById('cdH'), elM = document.getElementById('cdM'),
        elS = document.getElementById('cdS'), elT = document.getElementById('cdTitle');
    var conf = (CFG.pages || []).filter(function (p) { return p.type === 'countdown'; })[0] || {};
    var target = new Date(W.datetime).getTime();
    if (isNaN(target)) return;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var diff = target - Date.now(), past = diff < 0;
      if (past) diff = -diff;
      var s = Math.floor(diff / 1000);
      elD.textContent = Math.floor(s / 86400);
      elH.textContent = pad(Math.floor(s % 86400 / 3600));
      elM.textContent = pad(Math.floor(s % 3600 / 60));
      elS.textContent = pad(s % 60);
      if (elT) elT.textContent = past ? (conf.passed || '我们已经携手') : (conf.title || '距婚礼还有');
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------- 复制 ---------------- */
  function copyText(txt, ok, fail) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = txt;
      ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      var done = false;
      try { done = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      done ? ok() : fail();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(ok, fallback);
    } else fallback();
  }

  function initCopy() {
    var btn = document.getElementById('copyAddr');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var txt = (V.name || '') + ' ' + (V.hall || '') + '\n' + (V.address || '');
      copyText(txt, function () { toast('地址已复制'); }, function () { toast('长按地址可复制'); });
    });
  }

  /* ---------------- 结尾烟花 ---------------- */
  var fwRaf = 0, fwTimer = 0;
  function startFireworks(cv) {
    stopFireworks();
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = cv.offsetWidth * dpr;
    cv.height = cv.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var W2 = cv.offsetWidth, H2 = cv.offsetHeight;
    var COLORS = ['#F6E3B4', '#E8C77E', '#FFF1D6', '#F3B8A0', '#EFD2A6'];
    var rockets = [], sparks = [];

    function launch() {
      if (rockets.length > 2) return;
      rockets.push({
        x: W2 * (0.18 + Math.random() * 0.64),
        y: H2 + 8,
        vy: -(H2 * 0.010 + Math.random() * H2 * 0.004),
        ty: H2 * (0.14 + Math.random() * 0.26),
        c: COLORS[(Math.random() * COLORS.length) | 0]
      });
    }
    function burst(x, y, c) {
      var n = 48 + ((Math.random() * 24) | 0);
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, sp = Math.random() * 2.7 + 0.5;
        sparks.push({
          x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 1, dec: 0.007 + Math.random() * 0.010,
          c: Math.random() < 0.25 ? '#FFFFFF' : c, r: Math.random() * 1.6 + 1.1
        });
      }
    }
    function frame() {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,.17)';
      ctx.fillRect(0, 0, W2, H2);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = rockets.length - 1; i >= 0; i--) {
        var r = rockets[i];
        r.y += r.vy; r.vy += 0.05;
        ctx.beginPath(); ctx.fillStyle = r.c; ctx.globalAlpha = 0.9;
        ctx.arc(r.x, r.y, 1.9, 0, 6.284); ctx.fill();
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
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.284); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      fwRaf = requestAnimationFrame(frame);
    }
    setTimeout(launch, 600);
    fwTimer = setInterval(launch, 1300);
    fwRaf = requestAnimationFrame(frame);
  }
  function stopFireworks() {
    if (fwRaf) cancelAnimationFrame(fwRaf);
    if (fwTimer) clearInterval(fwTimer);
    fwRaf = fwTimer = 0;
  }

  /* ---------------- 编辑模式 ?edit=1 ---------------- */
  function initEdit() {
    if (!EDIT) return;
    var bar = document.createElement('div');
    bar.className = 'editbar';
    bar.textContent = '编辑模式：点「换图」预览新照片（刷新即还原）';
    document.body.appendChild(bar);

    var input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    var target = null, targetPage = null;

    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      if (f && target) {
        target.src = URL.createObjectURL(f);
        target.addEventListener('load', function () { measure(targetPage); }, { once: true });
      }
      input.value = '';
    });

    [].forEach.call(stage.querySelectorAll('.ph, .bleed'), function (box) {
      var b = document.createElement('button');
      b.className = 'swapbtn';
      b.textContent = '换图';
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        target = box.querySelector('img');
        targetPage = box.closest('.page');
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

    lockHeight();
    window.addEventListener('resize', lockHeight);
    stage.scrollTop = 0;
    stage.addEventListener('scroll', onScroll, { passive: true });
    ['touchstart', 'wheel', 'keydown'].forEach(function (ev) {
      stage.addEventListener(ev, userInterrupt, { passive: true });
    });
    window.addEventListener('orientationchange', function () {
      setTimeout(lockHeight, 280);
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
