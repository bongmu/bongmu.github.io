/* =======================================================================
   婚礼请柬 · 内容配置（中国红 · 七页翻页版）
   ——————————————————————————————————————————————————————
   这是你唯一需要改的文件。改完保存、刷新页面即可看到效果。

   改完姓名/日期后记得跑一次：  python tools/sync_meta.py
   （同步微信分享卡片的标题和缩略图）

   换照片：原图丢进 photos-original/，跑 python tools/prepare_photos.py
   ======================================================================= */

window.INVITE = {

  /* ---------- 新人 ---------- */
  couple: {
    groom:   '秦钰杰',
    bride:   '吴雅男',
    groomEn: 'YUJIE',
    brideEn: 'YANAN',
    shareTitle: '秦钰杰 & 吴雅男 · 婚礼邀请函',
    shareDesc:  '2026.10.06　诚邀您来见证我们的幸福'
  },

  /* ---------- 时间 ---------- */
  wedding: {
    // 婚礼时间（倒计时和日历页都读这里，格式别写错）
    datetime: '2026-10-06T12:00:00+08:00',
    dateText: '2026.10.06',
    dateCn:   '二〇二六年十月六日',
    week:     '星期二',
    // ⚠ 农历日期请自行核对后填写
    lunar:    '农历八月廿六',
    timeText: '中午 12:00',
    tips:     '请于 11:30 前入席'
  },

  /* ---------- 地点 ---------- */
  venue: {
    name:    '临淇镇陈庄村',
    hall:    '南大街',
    address: '河南省林州市临淇镇陈庄村南大街',
    // 高德坐标（GCJ-02），取点：https://lbs.amap.com/tools/picker
    lng: 113.89,
    lat: 35.78,
    contacts: [
      { name: '新郎 秦钰杰', phone: '15221024542' },
      { name: '新娘 吴雅男', phone: '15665413106' }
    ]
  },

  /* ---------- 背景音乐 ---------- */
  music: {
    src:    'assets/music/he-ni-deng-yan-hua.mp3',
    title:  '和你等烟花',
    artist: '鹭卓',
    loop: true
  },

  /* ---------- 播放设置 ---------- */
  player: {
    autoScroll: true,
    dwell: 7200          // 每屏停留毫秒，单页可用 dwell 覆盖
  },

  /* ---------- 七页内容 ----------
     photo 里的 focus 是裁切焦点，人脸偏上就写 '50% 30%'，偏下写 '50% 60%'
  ------------------------------------------------------------------- */
  pages: [

    /* ---- 1/7 封面 ---- */
    { type: 'cover',
      photo: { src: 'assets/photos/01.jpg', focus: '50% 26%' },
      bigTitle: '大囍的日子',
      hint: '上滑',
      dwell: 9000
    },

    /* ---- 2/7 邀请函 ---- */
    { type: 'invite',
      photo: { src: 'assets/photos/04.jpg', focus: '50% 32%' },
      eyebrow: 'WEDDING INVITATION',
      verse: ['蓄谋已久　如我所愿', '好事发生　恰逢其时'],
      body: '终于等到了这一天\n谨于此诚挚邀请您\n见证我们人生中最重要的时刻',
      sign: '我们不见不散'
    },

    /* ---- 3/7 相册 ---- */
    { type: 'gallery',
      photos: [
        { src: 'assets/photos/03.jpg', focus: '50% 32%' },
        { src: 'assets/photos/09.jpg', focus: '50% 40%' },
        { src: 'assets/photos/08.jpg', focus: '50% 30%' }
      ],
      eyebrow: 'OUR STORY',
      title: '我们的日常',
      text: '从一句「你好」\n到「我愿意」'
    },

    /* ---- 4/7 倒计时 ---- */
    { type: 'countdown',
      photo: { src: 'assets/photos/05.jpg', focus: '50% 28%' },
      title: '距婚礼还有',
      passed: '我们已经携手',
      en: 'You are the beat of my heart,\nthe rhythm of my soul.',
      cn: '今生佳偶天成\n未来风雨同行'
    },

    /* ---- 5/7 婚礼时间（日历） ---- */
    { type: 'calendar',
      photos: [
        { src: 'assets/photos/06.jpg', focus: '50% 28%' },
        { src: 'assets/photos/07.jpg', focus: '50% 28%' }
      ],
      eyebrow: 'WEDDING TIME',
      lines: ['愿我们的爱情', '如秋日的阳光', '岁岁年年', '相伴相守']
    },

    /* ---- 6/7 婚礼地址 ---- */
    { type: 'address',
      photo: { src: 'assets/photos/02.jpg', focus: '50% 34%' },
      eyebrow: 'WEDDING ADDRESS',
      note: '导航过来时若堵车，别急，我们等你'
    },

    /* ---- 7/7 结尾 + 回执（烟花页） ---- */
    { type: 'ending',
      photo: { src: 'assets/photos/08.jpg', focus: '50% 26%' },
      bigTitle: '好久不见，婚礼见！',
      rsvpTitle: '期待您的到来',
      namePh: '您的称呼',
      countPh: '出席人数',
      submit: '提 交',
      sign: '敬请光临',
      dwell: 14000
    }

  ]
};
