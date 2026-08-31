/* ═══════════════════════════════════════════════════════════
   婚礼请帖 · 总配置（改这一个文件，五个模板全部同步）
   ═══════════════════════════════════════════════════════════ */
window.WEDDING = {

  /* ★ 定稿开关：和对象商量好用哪个模板后，把编号填进来（"1"~"5"），
     打开首页就会直接进入那一款，客人看不到选稿页；留空 = 显示五款选择页 */
  finalTemplate: "",

  /* ── 新人姓名（所有模板自动替换）── */
  groom: "秦钰杰",                    // 如：李承泽
  bride: "吴雅男",                    // 如：王小雅
  groomParents: "",                 // 敬邀落款（新郎父母名），留空不显示

  /* ── 婚礼日期 ── */
  dateISO: "2026-10-06",   // 吉时（倒计时用）
  dateText: "2026年10月6日",
  weekday:  "星期二",
  lunarText:"农历八月廿六",

  /* ── 婚礼地点 ── */
  venue:   "陈庄村",
  address: "陈庄村（沿乡道至学校路口，按路线图进村）",
  /* 一键导航：https://lbs.amap.com/tools/picker 拾取坐标后填这里，
     「一键导航」按钮自动出现；留空隐藏 */
  lng: "113.89",
  lat: "35.78",
  poiName: "陈庄村",

  /* ── 当天安排（可增删）── */
  timeline: [
    { time: "09:00", label: "迎宾入席" },
    { time: "09:58", label: "婚礼仪式" },
    { time: "11:58", label: "喜宴开席" },
  ],

  /* ── 文案 ── */
  coverSlogan: "诚 邀 您 见 证 我 们 的 幸 福 时 刻",
  inviteLine1: "谨定于二〇二六年十月六日（农历八月廿六）",
  inviteLine2: "为 新郎 与 新娘 举行婚礼",
  inviteLine3: "谨备喜筵 · 恭候光临",
  loveQuote: "春来无事，只为花忙；\n往后余生，请多指教。",

  /* ── 照片（替换 assets/photos/ 同名文件即可；加照片：放入 6.jpg 后加一行）── */
  photos: [
    { src: "assets/photos/1.jpg", caption: "", note: "人海茫茫，一眼就认定了你" },
    { src: "assets/photos/2.jpg", caption: "", note: "把喜欢，慢慢熬成了爱" },
    { src: "assets/photos/3.jpg", caption: "", note: "平凡的日子，有你都在发光" },
    { src: "assets/photos/4.jpg", caption: "", note: "你点头那一刻，星星落进了眼里" },
    { src: "assets/photos/5.jpg", caption: "", note: "往后余生，请多指教" },
  ],

  /* ── 背景音乐：换成别的歌时，把 mp3 放进 assets/music/ 再改这里的路径即可 ──
     当前：Canon in D Major（Kevin MacLeod 演奏版，CC BY 4.0 免费可用）
     署名由 core.js 自动显示在页面底部，无需手动维护 */
  music: "assets/music/canon-in-d.mp3",
};
