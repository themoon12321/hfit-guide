Page({
  data: { stars: [], meteors: [] },

  onLoad() {
    // 星空：40 颗随机星，逐颗独立闪烁
    const stars = [];
    for (let i = 0; i < 40; i++) {
      const r = Math.random();
      stars.push({
        left: (Math.random() * 100).toFixed(1),
        top: (Math.random() * 92).toFixed(1),
        size: r < 0.78 ? 3 : (r < 0.95 ? 4 : 5),
        dur: (2 + Math.random() * 3).toFixed(2),
        delay: (Math.random() * 4).toFixed(2),
      });
    }
    // 流星：3 颗，第一颗很快出现，之后间隔约 7 秒
    const meteors = [];
    for (let i = 0; i < 3; i++) {
      meteors.push({
        top: (5 + Math.random() * 25).toFixed(1),
        left: (55 + Math.random() * 35).toFixed(1),
        dur: (3.5 + Math.random() * 2).toFixed(2),
        delay: (1 + i * 7 + Math.random() * 2).toFixed(2),
      });
    }
    this.setData({ stars, meteors });
  },

  goDorm() { wx.navigateTo({ url: '/pages/dorm/dorm' }); },
  goQuick() { wx.navigateTo({ url: '/pages/quick/quick' }); },
  goFaq() { wx.navigateTo({ url: '/pages/faq/faq' }); },
  goAbout() { wx.navigateTo({ url: '/pages/about/about' }); },
});
