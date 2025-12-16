// https://vitepress.dev/guide/custom-theme
import Layout from './Layout.vue'
import type { Theme } from 'vitepress'
import './style.css'
import 'highlight.js/styles/github-dark.css'
import 'element-plus/theme-chalk/index.css'
export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    //app.component('GiscusComment', () => import('./components/GiscusComment.vue'))
  }
} satisfies Theme

