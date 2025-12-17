// https://vitepress.dev/guide/custom-theme
import Layout from './Layout.vue'
import type { Theme } from 'vitepress'
import './style.css'
import 'element-plus/theme-chalk/index.css'
import DefaultTheme from 'vitepress/theme'
export default {
  //extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router, siteData }) {
    //app.component('GiscusComment', () => import('./components/GiscusComment.vue'))
  }
} satisfies Theme

