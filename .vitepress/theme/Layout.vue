<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { onMounted, ref, watch, computed, onUnmounted, h } from 'vue'

const { frontmatter, page, site } = useData()
const route = useRoute()

// import hljs from 'highlight.js'
// import 'highlight.js/styles/github.css' // 可选样式（推荐：atom-one-dark / monokai / github）
// //代码高亮初始化函数
// const initHighlight = () => {
//     if (route.path === '/') return
//     hljs.configure({
//         cssSelector: 'code'
//     });
//     hljs.highlightAll() // 一键高亮所有 <pre><code> 标签，无需手动遍历
//
// }
// onMounted(() => {
//     initHighlight() // 初始化高亮
//
//     watch(
//         () => route.path,
//         () => {
//             setTimeout(() => {
//                 initHighlight() // 路由切换后重新高亮
//             }, 150)
//         },
//         { deep: true }
//     )
// })

import openFriendLink from './friend_link/friend_link.ts'

import { useGitalk } from './gitalk/gitalk';

const { commentRef, isShowComment } = useGitalk();
</script>



<template>
    <div class="head">
        <a href="/"><img style="width: 50px" src="/logo.png"><h1>{{ site.title }}</h1></a>
        <p>{{ site.description }}</p>
    </div>
  <div class="middle-homepage" v-if="frontmatter.home">
    <ul>
        <li>
            <a href="/article/2025/how_to_build_a_website_by_vitepress.html">
                <h2>如何使用VitePress搭建一个简单的网站</h2>
                <p>本站的简要搭建过程</p>
            </a>
        </li>
        <li>
            <a href="/markdown-examples.html">
                <h2>示例页面1</h2>
                <p>示例页面1示例页面1示例页面1示例页面1</p>
            </a>
        </li>
        <li>
            <a href="/api-examples.html">
                <h2>示例页面2</h2>
                <p>示例页面2示例页面2示例页面2示例页面2</p>
            </a>
        </li>
        <li>
            <a href="/api-examples.html">
                <h2>示例页面3</h2>
                <p>示例页面3示例页面3示例页面3示例页面3</p>
            </a>
        </li>
    </ul>
  </div>
  <div class="middle-otherpage" v-else>
    <Content />
      <div ref="commentRef" class="comment-section" v-if="isShowComment"></div>
      <div class="no-comment" v-else><br>评论区已关闭</div>
  </div>
   <div class="footer">
      <div v-html="site.themeConfig.footer.message"></div>
      <div v-html="site.themeConfig.footer.copyright"></div>
      <div @click="openFriendLink">友情链接：点击查看</div>
      <div>Designed by <a href="https://enterdawn.top/article/others/about.html">enterdawn</a></div>
      <div>&copy;2026 enterdawn.edu.kg</div>
  </div>
</template>
