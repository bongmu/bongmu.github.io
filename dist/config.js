/* =======================================================================
   婚礼请柬 · 内容配置
   ——————————————————————————————————————————————————————
   这是你唯一需要改的文件。改完保存、刷新页面即可看到效果。
   照片：把你的照片改名成 01.jpg ~ 09.jpg，覆盖 assets/photos/ 里的同名文件。
        竖版 3:4 效果最好（例如 900×1200 / 1200×1600）。
   ======================================================================= */

window.INVITE = {

  /* ---------- 新人 ---------- */
  couple: {
    groom:   '秦钰杰',
    bride:   '吴雅男',
    groomEn: 'YUJIE',
    brideEn: 'YANAN',
    // 页面标题 / 微信分享标题
    shareTitle: '秦钰杰 & 吴雅男 · 婚礼邀请函',
    shareDesc:  '2026.10.06　诚邀您来见证我们的幸福'
  },

  /* ---------- 时间 ---------- */
  wedding: {
    // 婚礼时间（用于倒计时，务必写成这个格式，+08:00 是北京时间）
    datetime: '2026-10-06T12:00:00+08:00',
    dateText: '2026.10.06',
    dateCn:   '二〇二六年十月六日',
    week:     '星期二',
    // ⚠ 农历日期请自行核对后填写
    lunar:    '农历八月廿六',
    timeText: '中午 12:00',
    // 入场提醒（邀请函页小字）
    tips:     '请于 11:30 前入席'
  },

  /* ---------- 地点 ---------- */
  venue: {
    name:    '临淇镇陈庄村',
    hall:    '南大街',
    address: '临淇镇陈庄村',
    // 高德坐标（GCJ-02）。在 https://lbs.amap.com/tools/picker 上取点后填这里
    lng: 113.89,
    lat: 35.78,
    // 联系人
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
    // 是否循环播放
    loop: true
  },

  /* ---------- 播放设置 ---------- */
  player: {
    // 打开后是否自动逐屏滚动
    autoScroll: true,
    // 每屏停留时间（毫秒），单页可用 dwell 覆盖
    dwell: 6800
  },

  /* ---------- 页面内容 ----------
     type 说明：
       cover      封面
       verse      纯文字诗页（背景是虚化照片）
       single     一张大图 + 文案（align: 'left' | 'right'）
       duo        两张错落图 + 文案
       collage    三张拼贴图 + 文案
       invite     邀请函正文
       countdown  倒计时
       map        地点与导航
       ending     结尾
     photo 里的 focus 是裁切焦点，人脸偏上就写 '50% 30%'
  ------------------------------------------------------------------- */
  pages: [

    { type: 'cover',
      photo: { src: 'assets/photos/01.jpg', focus: '50% 42%' },
      eyebrow: 'WE ARE GETTING MARRIED',
      hint: '上滑，看我们的故事',
      dwell: 9000
    },

    { type: 'verse',
      photo: { src: 'assets/photos/02.jpg', focus: '50% 40%' },
      no: '序',
      eyebrow: 'PROLOGUE',
      lines: [
        '春天的第一场雨',
        '夏夜的第一颗星',
        '冬日的第一场烟花',
        '我都想和你一起等'
      ]
    },

    { type: 'single', align: 'left',
      photo: { src: 'assets/photos/03.jpg', focus: '50% 38%' },
      no: '01', label: '初 见',
      title: '那年人海里的一眼',
      text: '后来才明白，那不是偶然。\n是许多个错过的路口，\n都朝着你的方向拐了个弯。'
    },

    { type: 'single', align: 'right',
      photo: { src: 'assets/photos/04.jpg', focus: '50% 38%' },
      no: '02', label: '心 动',
      title: '你把普通的一天\n过成了节日',
      text: '从此，路灯下的影子有了同伴，\n深夜的消息有了回音。'
    },

    { type: 'duo',
      photos: [
        { src: 'assets/photos/05.jpg', focus: '50% 35%' },
        { src: 'assets/photos/06.jpg', focus: '50% 40%' }
      ],
      no: '03', label: '相 知',
      title: '我们把爱藏在日常里',
      text: '一起去过的三十七个地方，\n吵过的四次架，和好的四次，\n还有数不清的、只属于我们的笑点。'
    },

    { type: 'verse',
      photo: { src: 'assets/photos/07.jpg', focus: '50% 40%' },
      no: '誓', eyebrow: 'OUR VOW',
      lines: [
        '往后余生',
        '风雪是你　平淡是你',
        '清贫是你　荣华是你',
        '目光所致　也是你'
      ]
    },

    { type: 'collage',
      photos: [
        { src: 'assets/photos/08.jpg', focus: '50% 35%' },
        { src: 'assets/photos/09.jpg', focus: '50% 40%' },
        { src: 'assets/photos/01.jpg', focus: '50% 45%' }
      ],
      no: '04', label: '此 刻',
      title: '我们决定\n把余生也交给彼此',
      text: '所有的准备，都是为了这一天。'
    },

    { type: 'invite',
      photo: { src: 'assets/photos/02.jpg', focus: '50% 40%' },
      eyebrow: 'INVITATION',
      title: '邀 请 函',
      body: '谨定于以下佳期\n举行结婚典礼　敬备喜筵\n恭请　阁下光临'
    },

    { type: 'countdown',
      photo: { src: 'assets/photos/06.jpg', focus: '50% 40%' },
      eyebrow: 'COUNTDOWN',
      title: '距离婚礼还有',
      passed: '我们已经携手'
    },

    { type: 'map',
      eyebrow: 'LOCATION',
      title: '婚 礼 地 点',
      note: '我们等你。'
    },

    { type: 'ending',
      photo: { src: 'assets/photos/05.jpg', focus: '50% 38%' },
      lines: ['这 一 天', '我们想和最重要的人', '一起等一场烟花'],
      sign: '敬请光临',
      dwell: 12000
    }

  ]
};
