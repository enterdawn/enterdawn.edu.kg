<script setup lang="ts">
import { useData } from 'vitepress'

// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter } = useData()
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
  </div>
   <div class="footer">
      <div v-html="site.themeConfig.footer.message"></div>
      <div v-html="site.themeConfig.footer.copyright"></div>
      <div @click="open">友情链接：点击查看</div>
      <div>Designed by <a href="https://enterdawn.top/article/others/about.html">enterdawn</a></div>
      <div>&copy;2026 enterdawn.edu.kg</div>
  </div>
</template>
