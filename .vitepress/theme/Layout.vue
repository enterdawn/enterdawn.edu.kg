<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { onMounted, ref, watch, computed, onUnmounted, h } from 'vue'
import { ElLink, ElMessageBox } from 'element-plus'

// 1. 基础变量（提前定义，避免作用域问题）
const { frontmatter, page, site } = useData()
const route = useRoute()
const commentRef = ref<HTMLDivElement>(null)
let gitalkScript: HTMLScriptElement | null = null
let isGitalkLoaded = false


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


// 3. 评论区显示逻辑（精准检测 frontmatter.comment）
// 优先级：页面 frontmatter.comment > 默认显示（非首页）
const isShowComment = computed(() => {
    console.log(page.value.frontmatter.comment)
    // 1. 如果页面明确设置 comment: false，直接隐藏
    if (page.value.frontmatter.comment=== false) return false
    // 2. 首页默认隐藏
    if (page.path === '/') return false
    // 3. 其他页面默认显示（未设置 comment 时）
    return true
})

// 4. 强制销毁 Gitalk（确保彻底停止加载）
const destroyGitalk = () => {
    // 1. 清空评论区 DOM
    if (commentRef.value) commentRef.value.innerHTML = ''
    // 2. 移除脚本和样式
    if (gitalkScript) {
        gitalkScript.remove()
        gitalkScript = null
    }
    const styleLink = document.querySelector('link[href*="gitalk.min.css"]')
    if (styleLink) styleLink.remove()
    // 3. 重置状态
    isGitalkLoaded = false
    // 4. 移除全局实例
    if ((window as any).Gitalk) delete (window as any).Gitalk
}

// 5. 渲染 Gitalk（仅在允许显示时执行）
const renderGitalk = () => {
    if (!isShowComment.value) return // 核心：先判断是否允许显示

    if (!commentRef.value || !(window as any).Gitalk) return

    const gitalk = new (window as any).Gitalk({
        clientID: gitalkConfig.clientID,
        clientSecret: gitalkConfig.clientSecret,
        repo: gitalkConfig.repo,
        owner: gitalkConfig.owner,
        admin: gitalkConfig.admin,
        id: encodeURIComponent(page.path),
        proxy: gitalkConfig.proxy,
        language: 'zh-CN',
        distractionFreeMode: false
    })
    gitalk.render(commentRef.value)
}

// 6. 初始化 Gitalk（增加前置判断）
const initGitalk = () => {
    // 第一步：如果不显示评论，直接销毁
    if (!isShowComment.value) {
        destroyGitalk()
        return
    }

    // 第二步：需要显示时，先清理旧实例
    destroyGitalk()

    // 第三步：加载脚本（未加载时）
    if (!isGitalkLoaded) {
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
            renderGitalk() // 加载完成后渲染
        }
        gitalkScript.onerror = () => {
            console.error('Gitalk 脚本加载失败')
        }
        document.body.appendChild(gitalkScript)
    } else {
        // 脚本已加载，直接渲染
        renderGitalk()
    }
}

// 7. 友情链接弹窗
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

// 8. 深度监听（确保 frontmatter 变化时触发）
watch(
    () => [route.path, frontmatter.comment], // 监听 path + comment 变化
    () => initGitalk(),
    { immediate: true, deep: true } // 立即执行 + 深度监听
)

onUnmounted(() => {
    destroyGitalk()
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
        <li>
            <a href="/api-examples.html">
                <h2>示例页面4</h2>
                <p>示例页面3示例页面3示例页面3示例页面3</p>
            </a>
        </li>

    </ul>
  </div>
  <div class="middle-otherpage" v-else>
    <Content />
      <div ref="commentRef" class="comment-section" v-if="isShowComment"></div>
  </div>
   <div class="footer">
      <div v-html="site.themeConfig.footer.message"></div>
      <div v-html="site.themeConfig.footer.copyright"></div>
      <div @click="openFriendLink">友情链接：点击查看</div>
      <div>Designed by <a href="https://enterdawn.top/article/others/about.html">enterdawn</a></div>
      <div>&copy;2026 enterdawn.edu.kg</div>
  </div>
</template>
