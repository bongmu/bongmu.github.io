/* ═══════════════════════════════════════════════════════════
   婚礼请帖 · 公共逻辑（模板页共用，一般不用改这个文件）
   约定：
   - <body data-template="1..5">  模板编号（路线图换肤用）
   - [data-n="groom|bride|parents"] 姓名填充
   - [data-d="configKey"]           文案填充
   - [data-gallery]                 照片容器
   - [data-timeline]                当天安排容器
   - #cd-d #cd-h #cd-m #cd-s        倒计时
   - #cover                         封面（点击开启，模板用 CSS 定义 .open 动画）
   - #disc / #bgm                   背景音乐按钮
   - a[data-route]                  自动指向路线图（带模板编号）
   - a[data-nav]                    一键导航（填了坐标才显示）
   ═══════════════════════════════════════════════════════════ */
(function(){
  var C = window.WEDDING = window.WEDDING || {};
  var $ = function(s){ return document.querySelector(s); };
  var $$ = function(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var html = document.documentElement;
  html.classList.add('js');
  html.classList.add('lock');

  /* ── 全局氛围层 + 照片出场动画 + 图间文案（所有模板共用） ── */
  (function(){
    var st = document.createElement('style');
    st.textContent =
      /* 氛围层：顶部/底部金色光晕 + 四枚缓浮囍字水印 */
      '.bg-deco{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;}'
      + '.bg-deco::before{content:"";position:absolute;inset:0;background:'
      + 'radial-gradient(90% 55% at 50% -10%,rgba(201,169,79,.16),transparent 62%),'
      + 'radial-gradient(85% 50% at 50% 112%,rgba(201,169,79,.11),transparent 60%);}'
      + '.bg-deco i{position:absolute;font-style:normal;font-family:"Ma Shan Zheng",cursive;'
      + 'line-height:1;color:rgba(201,169,79,.07);user-select:none;}'
      + '.bg-deco .g1{font-size:290px;top:4%;left:-56px;animation:bgd1 26s ease-in-out infinite;}'
      + '.bg-deco .g2{font-size:200px;top:36%;right:-46px;animation:bgd2 31s ease-in-out infinite;}'
      + '.bg-deco .g3{font-size:250px;bottom:-4%;left:-44px;animation:bgd1 29s ease-in-out infinite reverse;}'
      + '.bg-deco .g4{font-size:150px;bottom:20%;right:-30px;animation:bgd2 24s ease-in-out infinite reverse;}'
      + '@keyframes bgd1{0%,100%{transform:translate(0,0) rotate(-5deg);}50%{transform:translate(16px,-20px) rotate(3deg);}}'
      + '@keyframes bgd2{0%,100%{transform:translate(0,0) rotate(6deg);}50%{transform:translate(-18px,16px) rotate(-3deg);}}'
      /* 照片出场：上浮 + 展开。translate 与 transform 互相独立，不破坏模板里的拍立得倾斜 */
      + 'html.js .gal .ph{opacity:0;translate:0 38px;clip-path:inset(12% 6% 12% 6%);}'
      + 'html.js .gal .ph.on{opacity:1;translate:0 0;clip-path:inset(-30% -30% -30% -30%);'
      + 'transition:opacity .8s ease,translate .95s cubic-bezier(.22,1,.36,1),clip-path 1.05s cubic-bezier(.22,1,.36,1);}'
      /* 照片之间的小文案 */
      + '.ph-note{text-align:center;font-size:13px;letter-spacing:2.5px;line-height:2;'
      + 'margin:2px auto 0;max-width:30em;color:#9A7E58;}'
      + '.ph-note::before{content:"";display:block;width:5px;height:5px;margin:0 auto 9px;'
      + 'background:currentColor;opacity:.5;transform:rotate(45deg);}'
      + 'body[data-template="1"] .ph-note,body[data-template="3"] .ph-note,body[data-template="5"] .ph-note{color:rgba(235,205,130,.8);}'
      + '@media (prefers-reduced-motion:reduce){.bg-deco i{animation:none;}'
      + 'html.js .gal .ph{opacity:1;translate:0 0;clip-path:none;transition:none;}}';
    document.head.appendChild(st);
    var deco = document.createElement('div');
    deco.className = 'bg-deco';
    deco.setAttribute('aria-hidden', 'true');
    deco.innerHTML = '<i class="g1">囍</i><i class="g2">囍</i><i class="g3">囍</i><i class="g4">囍</i>';
    document.body.appendChild(deco);
  })();

  /* ── 填充姓名 / 文案 ── */
  $$('[data-n="groom"]').forEach(function(el){ el.textContent = C.groom || '新郎'; });
  $$('[data-n="bride"]').forEach(function(el){ el.textContent = C.bride || '新娘'; });
  $$('[data-d]').forEach(function(el){
    var k = el.getAttribute('data-d');
    if (C[k]) el.textContent = C[k];
  });
  document.title = (C.groom || '') + ' ♥ ' + (C.bride || '') + ' · 婚礼邀请函';
  var par = $('#parents');
  if (C.groomParents && par) { par.hidden = false; var t = par.querySelector('[data-n="parents"]'); if (t) t.textContent = C.groomParents; }

  /* ── 照片 ── */
  $$('[data-gallery]').forEach(function(box){
    (C.photos || []).forEach(function(p, i){
      var fig = document.createElement('figure');
      fig.className = 'ph rv';
      fig.innerHTML = '<span class="cap"></span><img loading="lazy" alt="">';
      fig.querySelector('.cap').textContent = p.caption || '';
      var img = fig.querySelector('img');
      img.src = p.src; img.alt = p.caption || '婚纱照';
      box.appendChild(fig);
      if (p.note) {
        var note = document.createElement('div');
        note.className = 'ph-note rv';
        note.textContent = p.note;
        box.appendChild(note);
      }
    });
  });

  /* ── 当天安排 ── */
  $$('[data-timeline]').forEach(function(box){
    (C.timeline || []).forEach(function(it){
      var div = document.createElement('div');
      div.className = 'tl-item';
      div.innerHTML = '<b></b><span></span>';
      div.querySelector('b').textContent = it.time;
      div.querySelector('span').textContent = it.label;
      box.appendChild(div);
    });
  });

  /* ── 路线图 / 导航链接 ── */
  var tid = document.body.getAttribute('data-template') || (C.finalTemplate || '');
  $$('a[data-route]').forEach(function(a){ a.href = 'route.html?t=' + tid; });
  if (C.lng && C.lat) {
    $$('a[data-nav]').forEach(function(a){
      a.hidden = false;
      a.href = 'https://uri.amap.com/navigation?to=' + C.lng + ',' + C.lat + ',' + encodeURIComponent(C.poiName || '婚礼地点') +
               '&mode=car&policy=1&src=WeddingInvitation&coordinate=gaode&callnative=1';
    });
  }

  /* ── 倒计时 ── */
  var target = new Date(C.dateISO || '2026-10-06T09:58:00+08:00').getTime();
  var pad = function(n){ return (n < 10 ? '0' : '') + n; };
  function tick(){
    var d = $('#cd-d'); if (!d) return;
    var diff = target - Date.now();
    if (diff <= 0) {
      d.textContent = '0'; $('#cd-h').textContent = '00';
      $('#cd-m').textContent = '00'; $('#cd-s').textContent = '00';
      var lb = $('.cd-label'); if (lb) lb.textContent = '我 们 结 婚 啦';
      return;
    }
    d.textContent = Math.floor(diff / 864e5);
    $('#cd-h').textContent = pad(Math.floor(diff / 36e5) % 24);
    $('#cd-m').textContent = pad(Math.floor(diff / 6e4) % 60);
    $('#cd-s').textContent = pad(Math.floor(diff / 1e3) % 60);
    setTimeout(tick, 1000);
  }
  tick();

  /* ── 背景音乐 ── */
  var bgm = $('#bgm'), disc = $('#disc');
  if (bgm && disc && C.music) {
    bgm.src = C.music;
    bgm.addEventListener('error', function(){ disc.classList.remove('show'); });
    disc.classList.add('show');
  }
  function toggleBgm(play){
    if (!bgm || !C.music) return;
    if (play) {
      var p = bgm.play();
      if (p && p.catch) p.catch(function(){ if (disc) disc.classList.remove('playing'); });
      if (disc) disc.classList.add('playing');
    } else {
      bgm.pause();
      if (disc) disc.classList.remove('playing');
    }
  }
  if (disc) disc.addEventListener('click', function(){ bgm.paused ? toggleBgm(true) : toggleBgm(false); });

  /* ── 封面开启 ── */
  var cover = $('#cover');
  function revealBook(){
    html.classList.remove('lock');
    toggleBgm(true);
  }
  if (cover) {
    if (location.hash === '#book') {
      cover.style.display = 'none';
      revealBook();
    } else {
      var opened = false;
      var open = function(){
        if (opened) return;
        opened = true;
        cover.classList.add('open');
        revealBook();
        setTimeout(function(){ cover.style.display = 'none'; }, parseInt(cover.getAttribute('data-delay') || '1200', 10));
      };
      cover.addEventListener('click', open);
      cover.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    }
  } else {
    revealBook();
  }

  /* ── 进场动画 ── */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rvs = $$('.rv');
  if (reduced || !('IntersectionObserver' in window)) {
    rvs.forEach(function(el){ el.classList.add('on'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    rvs.forEach(function(el){ io.observe(el); });
  }

  /* ── 背景音乐署名（CC BY 4.0 要求署名，自动显示在页面底部） ── */
  if (C.music && C.musicCredit !== false) {
    var st = document.createElement('style');
    st.textContent = '.bgm-credit{display:block;width:max-content;max-width:92%;margin:22px auto 10px;'
      + 'padding:5px 14px;border-radius:999px;font-size:11px;letter-spacing:.5px;text-decoration:none;'
      + 'color:#8A7256;background:rgba(251,245,232,.85);border:1px solid rgba(138,114,86,.28);}';
    document.head.appendChild(st);
    var cr = document.createElement('a');
    cr.className = 'bgm-credit';
    cr.href = 'https://incompetech.com/music/royalty-free/music.html';
    cr.target = '_blank'; cr.rel = 'noopener';
    cr.textContent = '背景音乐 Canon in D Major · Kevin MacLeod (incompetech.com) · CC BY 4.0';
    document.body.appendChild(cr);
  }
})();
