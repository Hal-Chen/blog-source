import { defineConfig } from 'vitepress';
import sidebar from './sidebar';

export default defineConfig({
  lang: 'zh-CN',
  title: 'Hal',
  description: "Hal Chen-技术输出",
  base: '/blog/',
  cacheDir: './cache',
  srcDir: './src',
  outDir: './dist',
  themeConfig: {
    siteTitle: 'An Enlightened Mule',
    logo: '/logo.jpg',
    nav: [
      { text: '前端', link: '/frontend/' },
      { text: '后端', link: '/backend/' },
      { text: '算法', link: '/algorithm/' },
      { text: '工具', link: '/toolkit/' },
      { text: '面试', link: '/interview/' },
    ],
    sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://gitee.com/Hal-Chen' }
    ],
    search: {
      provider: 'local',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © Hal Chen',
    },
  },
});
