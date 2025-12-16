<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { onMounted, ref, watch } from 'vue'

const { site, frontmatter } = useData()
const route = useRoute()
const commentRef = ref<HTMLElement>(null)

const loadGiscus = () => {
    // 清空容器，避免重复加载/残留错误配置
    if (commentRef.value) {
        commentRef.value.innerHTML = '<h3 class="comment-title">评论区</h3>'
        // 清除可能的全局错误配置
        if (window.giscusConfig) delete window.giscusConfig
    }

    const isCommentOpen = !frontmatter.home && frontmatter.comment !== false
    if (isCommentOpen && commentRef.value) {
        const script = document.createElement('script')
        script.src = 'https://giscus.app/client.js'

        // 标准 data-* 属性配置（修复格式错误）
        script.setAttribute('data-repo', 'enterdawn/enterdawn.edu.kg')
        script.setAttribute('data-repo-id', 'R_kgDOQpHIKg')
        script.setAttribute('data-category', 'Announcements')
        script.setAttribute('data-category-id', 'DIC_kwDOQpHIKs4Cz0lr')
        script.setAttribute('data-mapping', 'pathname')
        script.setAttribute('data-reactions-enabled', '1')
        script.setAttribute('data-emit-metadata', '0')
        script.setAttribute('data-input-position', 'top')
        script.setAttribute('data-theme', 'light')
        script.setAttribute('data-lang', 'zh-CN')
        script.setAttribute('data-loading', 'lazy')
        // 关键：正确配置子域名代理（格式为完整URL）
        script.setAttribute('data-api-url', 'https://github-proxy.enterdawn.edu.kg/graphql')
        script.setAttribute('data-origin', 'http://localhost:5173') // 本地开发环境；生产环境改为 https://enterdawn.edu.kg
        script.setAttribute('crossorigin', 'anonymous')
        script.async = true

        // 移除旧脚本，避免冲突
        const oldScript = document.querySelector('script[src="https://giscus.app/client.js"]')
        if (oldScript) oldScript.remove()

        commentRef.value.appendChild(script)
    } else if (commentRef.value) {
        commentRef.value.innerHTML = `
      <h3 class="comment-title">评论区</h3>
      <div class="comment-closed">
        <p class="closed-title">评论区已关闭</p>
        <p class="closed-desc">本页面暂未开放评论功能，感谢你的理解~</p>
      </div>
    `
    }
}

// 首次挂载 + 路由监听（延长延迟，适配本地开发）
onMounted(() => loadGiscus())
watch(
    () => route.path,
    () => setTimeout(() => loadGiscus(), 300), // 延长延迟到300ms，确保容器加载完成
    { immediate: true }
)
</script>

<script lang="ts">
import { h } from 'vue';
import { ElLink,ElMessage, ElMessageBox } from 'element-plus'
import type { Action } from 'element-plus'
const open = () => {
    const linkNode = h(
        ElLink,
        {
            href: 'https://enterdawn.top' ,
            target: '_blank',
            type: 'primary', // 可以使用 ElLink 的所有 props
            underline: true, // 是否显示下划线
        },
        'enterdawn的主页'
    );
    ElMessageBox.alert(linkNode, '友情链接', {
    // if you want to disable its autofocus
    // autofocus: false,
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
    })

}
</script>


<template>
    <div class="head">
        <a href="/"><img style="width: 50px" src="/logo.png"><h1>{{ site.title }}</h1></a>
        <p>{{ site.description }}</p>
    </div>
  <div class="middle-homepage" v-if="frontmatter.home">
    <ul>
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
      <div class="comment-section" ref="commentRef">
          <h3 class="comment-title">评论区</h3>
      </div>
  </div>
   <div class="footer">
      <div v-html="site.themeConfig.footer.message"></div>
      <div v-html="site.themeConfig.footer.copyright"></div>
      <div @click="open">友情链接：点击查看</div>
      <div>Designed by <a href="https://enterdawn.top/article/others/about.html">enterdawn</a></div>
      <div>&copy;2026 enterdawn.edu.kg</div>
  </div>
</template>
