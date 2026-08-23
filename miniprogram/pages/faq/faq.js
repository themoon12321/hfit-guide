const data = require('../../utils/data.js');

Page({
  data: {
    updated: data.FAQ_UPDATED,
    openIndex: -1,
    // rich-text 需要数组形式的 nodes；字符串 HTML 也可以直接传
    list: data.FAQ.map((f) => ({ ...f, aHtml: f.a })),
  },

  toggle(e) {
    const idx = e.currentTarget.dataset.index;
    // 直接给 openIndex（字符串转数字）
    const cur = this.data.openIndex;
    this.setData({ openIndex: cur === idx ? -1 : idx });
  },

  previewImg(e) {
    const src = e.currentTarget.dataset.src;
    wx.previewImage({ urls: [src], current: src });
  },
});
