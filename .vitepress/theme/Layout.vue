<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { onMounted, ref, watch, computed, onUnmounted } from 'vue'
import { ElLink, ElMessageBox } from 'element-plus'

// 1. 基础变量（提前定义，避免作用域问题）
const { frontmatter, page, site } = useData()
const route = useRoute()
const commentRef = ref<HTMLDivElement>(null)
let gitalkScript: HTMLScriptElement | null = null
let isGitalkLoaded = false

// 2. 评论区显示逻辑
const showComment = computed(() => {
    return page.path !== '/' && frontmatter.comment !== false
})

// 3. Gitalk 核心配置（替换为你的信息）
const gitalkConfig = {
    clientID: 'Ov23liDgWI9RBb21UXjZ',
    clientSecret: 'b6c9d9d8c4b79ad7e98369c649cf80aa493f837e',
    repo: 'enterdawn.edu.kg', // 存储评论的 GitHub 仓库名
    owner: 'enterdawn',
    admin: ['enterdawn'],
    id: computed(() => page.path), // 按页面路径生成唯一 ID
    proxy: 'https://github-proxy.enterdawn.edu.kg/login/oauth/access_token', // 代理地址
    language: 'zh-CN',
    distractionFreeMode: false // 关闭无干扰模式
}


// 4. 清空 Gitalk（替代 destroy 方法）
const clearGitalk = () => {
    if (!commentRef.value) return
    commentRef.value.innerHTML = '' // 清空DOM销毁实例
    const styleLink = document.querySelector('link[href*="gitalk.min.css"]')
    if (styleLink) styleLink.remove()
    isGitalkLoaded = false
}

// 5. 渲染 Gitalk
const renderGitalk = () => {
    if (!commentRef.value || !isGitalkLoaded || !(window as any).Gitalk) return

    const gitalk = new (window as any).Gitalk({
        clientID: gitalkConfig.clientID,
        clientSecret: gitalkConfig.clientSecret,
        repo: gitalkConfig.repo,
        owner: gitalkConfig.owner,
        admin: gitalkConfig.admin,
        id: encodeURIComponent(page.path), // 编码特殊字符避免报错
        proxy: gitalkConfig.proxy,
        language: 'zh-CN',
        distractionFreeMode: false
    })
    gitalk.render(commentRef.value)
}

// 6. 初始化 Gitalk
const initGitalk = () => {
    if (!showComment.value) {
        clearGitalk()
        return
    }

    clearGitalk() // 清空旧内容

    // 已加载脚本直接渲染
    if (isGitalkLoaded && (window as any).Gitalk) {
        renderGitalk()
        return
    }

    // 加载 Gitalk 脚本和样式
    gitalkScript = document.createElement('script')
    gitalkScript.src = 'https://cdn.staticfile.org/gitalk/1.8.0/gitalk.min.js'
    gitalkScript.async = true
    gitalkScript.onload = () => {
        // 加载样式
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdn.staticfile.org/gitalk/1.8.0/gitalk.min.css'
        document.head.appendChild(link)

        isGitalkLoaded = true
        renderGitalk()
    }
    // 脚本加载失败提示
    gitalkScript.onerror = () => {
        console.error('Gitalk 脚本加载失败，请检查网络或CDN地址')
    }
    document.body.appendChild(gitalkScript)
}

// 7. 友情链接弹窗（保留你的原有功能）
const openFriendLink = () => {
    const linkNode = h(
        ElLink,
        { href: 'https://enterdawn.top', target: '_blank', type: 'primary', underline: true },
        'enterdawn的主页'
    )
    ElMessageBox.alert(linkNode, '友情链接', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定'
    })
}

// 8. 路由监听 + 生命周期
watch(() => route.path, () => initGitalk(), { immediate: true })
onUnmounted(() => {
    clearGitalk()
    if (gitalkScript) gitalkScript.remove()
})
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
      <div ref="commentRef" class="comment-section" v-if="showComment"></div>
  </div>
   <div class="footer">
      <div v-html="site.themeConfig.footer.message"></div>
      <div v-html="site.themeConfig.footer.copyright"></div>
      <div @click="open">友情链接：点击查看</div>
      <div>Designed by <a href="https://enterdawn.top/article/others/about.html">enterdawn</a></div>
      <div>&copy;2026 enterdawn.edu.kg</div>
  </div>
</template>
