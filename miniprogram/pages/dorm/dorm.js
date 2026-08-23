const data = require('../../utils/data.js');

Page({
  data: { cat: '', list: [], current: 0 },

  onLoad() {
    this.setData({ list: this.build('') });
  },

  build(cat) {
    const base = cat ? data.IMAGES.filter((i) => i.cat === cat) : data.IMAGES;
    return base.map((i) => ({
      ...i,
      src: data.COS + '/img/ann/' + i.id + '.jpg',
      thumb: data.COS + '/img/thumbs/' + i.id + '.jpg',
    }));
  },

  setCat(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({ cat, list: this.build(cat), current: 0 });
  },

  onChange(e) {
    this.setData({ current: e.detail.current });
  },

  goTo(e) {
    this.setData({ current: e.currentTarget.dataset.index });
  },

  preview() {
    const urls = this.data.list.map((i) => i.src);
    wx.previewImage({ current: urls[this.data.current], urls });
  },
});
