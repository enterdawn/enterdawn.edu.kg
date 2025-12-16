---
outline: 本站的简要构建过程
title: 如何使用VitePress搭建一个简单的网站
date: 2025-12-16
comment: true
---
# 如何使用VitePress搭建一个简单的网站
## 0.引言
对于个人站长来说Wordpress等CMS系统似乎是一个很好的选择，但是需要服务器或虚拟主机，要支付一定的费用。并且附加的功能和主题看软件的生态环境，例如Wordpress的生态就断崖式领先。但是Wordpress的运行效率很差，在国内服务器普遍超售的情况下，加几个插件就运行的很慢。而对于我这种二把刀来说各种CMS的限制也颇多，开发新功能还要先熟悉对应的API规范，更何况有很多CMS的文档也不是很全面。Vue.js是一个被广泛使用的前端框架，但是直接使用Vue构建网站对于非专业人士来说比较麻烦，中间需要踩的坑也很多。所以以上种种原因选择使用VitePress进行开发。

VitePress可以快速使用markdown编写的内容自定义网站，做了很多抽象，作为开发者只需要关注主题和内容就好，省略了很多步骤。并且基于Vue也有大把的组件库和功能可以用，我这里完全自定义了主题，并基于Element-Plus做了一些小功能。并且有一个好处就是生成的页面是纯静态的，也就是说可以部署到github上，无需支付服务器费用。

## 1.准备
最基础的，需要安装一个node.js环境，不过这里我更建议使用nvm进行版本管理，我这里也不算生产环境，个人还是愿意尝试一些新功能的，如果出问题方便回滚版本。

然后去往你想要放置代码的目录，直接运行：
```shell
npx vitepress init
```
输入配置文件目录，站点标题和副标题，然后选择主题模式就可以了。

如果你对前端一窍不通，选择第一个或第二个，然后就可以直接使用了，如果是第三个需要自定义css，不过不是很难。

我们在这里选择第三个，同时选择启用ts（现在组件库一般也全都用ts）并添加进package.json（这个为什么不添加）：
```shell
┌  Welcome to VitePress!
│
◇  Where should VitePress initialize the config?
│  ./
│
◇  Site title:
│  My Awesome Project
│
◇  Site description:
│  A VitePress Site
│
◇  Theme:
│  Custom Theme
│
◇  Use TypeScript for config and theme files?
│  Yes
│
◇  Add VitePress npm scripts to package.json?
│  Yes
│
└  Done! Now run npm run docs:dev and start writing.
```

然后会得到一些文件:
```shell
.
├─ .vitepress
│  ├─ config.mts //你的网站的配置文件，你可以在里面引入你想要的组件库，并修改网站配置
│  ├─ theme
│  │  ├─ index.ts //全局ts，一般不用动
│  │  ├─ layout.vue //首页样式，按照自己喜好改
│  │  └─ style.css //全局css
│   api-examples.md //两个示例文件，删了就行
│   markdown-examples.md
│   index.md //一般不用动
└─ package.json //一般不用动
```

这时候运行`npm run docs:dev`就可以启动了，开发的同时可以实时预览页面。

然后你需要在网站目录下创建一个`public`文件夹，这个文件夹目的是存储图片或脚本等静态资源，构建的时候会直接放到根目录中。（个人推测是为了保持根目录整洁的设计）

之后我个人建议再另外创建一个或文件夹用于存储`.md`文件，同样也是为了保持根目录整洁。存储后的`.md`文件会自动构建为html，这个在添加超链接的时候需要注意。

## config.mts
`config.mts`这个文件的主要目的是网站的配置，包括主标题，副标题和主题配置。

本站的`config.mts`目前是这样的：
```typescript
import { defineConfig } from 'vitepress'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Enterdawn University",
    description: "Official website of Enterdawn University",
    themeConfig: {
        logo: 'logo.png',
        footer: {
            message: 'Enterdawn Universuty并不是一所真正的大学，详情请阅读<a style="color: deepskyblue;" href="/article/others/about.html">关于本站</a>',
            copyright: 'Enterdawn University is not a real university. For more details, please read <a style="color: deepskyblue;"  href="/article/others/about.html">about us</a>'
        }
    },
    vite: {
        plugins: [
            // ...
            AutoImport({
                resolvers: [ElementPlusResolver()],
            }),
            Components({
                resolvers: [ElementPlusResolver()],
            }),
        ],
    }
})
```

其中只导入了ElementPlus一个第三方库，导入方法完全参考ElementPlus官方文档即可。`themeConfig`字段如果使用第三方主题就按照开发者的说明来，如果像我一样自己构建主题随便写，只要合法就行，这里的设置的变量可以很方便的使用。

## layout.vue 和 style.css

这两个文件决定了网站的界面。css文件这里不多赘述，如果你完全不懂前端估计也看不到这，重点说layout.vue ：
```vue
<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { onMounted, ref, watch, computed, onUnmounted, h } from 'vue'

const { frontmatter, page, site } = useData()
const route = useRoute()

import hljs from 'highlight.js'
import 'highlight.js/styles/rainbow.css' // 可选样式（推荐：atom-one-dark / monokai / github）
// 代码高亮初始化函数
const initHighlight = () => {
  if (route.path === '/') return
  hljs.highlightAll() // 一键高亮所有 <pre><code> 标签，无需手动遍历
}
onMounted(() => {
  initHighlight() // 初始化高亮

  watch(
      () => route.path,
      () => {
        setTimeout(() => {
          initHighlight() // 路由切换后重新高亮
        }, 150)
      },
      { deep: true }
  )
})

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
```

这是一个典型的`vue`页面结构，包括ts脚本和页面的html结构。和一般的vue项目不同的是，全站只需要这一个页面就能实现全部的功能（当然你要抬杠非要创建别的页面也不是不行，自己开发的优点之一就是自由）。

我们先观察下面被`<template></template>`标签包裹的页面html结构，可以发现整个页面被我分为了三部分：页头、页中和页脚：
```vue
<div class="head">

</div>
<div class="middle-homepage" v-if="frontmatter.home">

</div>
<div class="middle-otherpage" v-else>
    
</div>
<div class="footer">

</div>
```

页头包括大标题，小标题和Logo：
```vue
<div class="head">
<a href="/"><img style="width: 50px" src="/logo.png"><h1>{{ site.title }}</h1></a>
<p>{{ site.description }}</p>
</div>
```
这里可以看出，我们可以直接通过`{{site.title}}`对网站的标题进行复用，如果你想要做顶部导航栏（我也计划做一个，不过很可能鸽穿）可以这样去引用这些信息。

然后我们看页脚：
```vue
<div class="footer">
    <div v-html="site.themeConfig.footer.message"></div>
    <div v-html="site.themeConfig.footer.copyright"></div>
    <div @click="openFriendLink">友情链接：点击查看</div>
    <div>Designed by <a href="https://enterdawn.top/article/others/about.html">enterdawn</a></div>
    <div>&copy;2026 enterdawn.edu.kg</div>
</div>
```

这里也可以看出我们之前在`config.mts`里面的信息得到了复用，然后我利用ElementPlus制作了点击查看友情链接的功能，还有后面的作者和版权信息，~~不过这个变量命名很不规范，实际上除了友情链接应该都抽出来写进配置文件~~。

最后说页中部分：
```vue
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
    <div class="no-comment" v-else><br>评论区已关闭</div>
</div>
```

这里用了`v-if`判断是否为首页，如果是首页显示我手动制作的文章列表（未来打算做自动带翻页的，但说不定也会鸽），如果非首页使用`<Content />`展示文章内容和评论区（评论区怎么做之后再说，这篇文章先就写这么多）。

上面的ts部分主要配合下面的部分进行，例如引入站点配置：
```typescript
import { useData } from 'vitepress'
const { site, frontmatter } = useData()
```

然后就是建议把各种功能拆开降低代码耦合度，你也不想最后维护一个几千行的文件吧？

## md文件

VitePress可以获取markdown的页面信息，在页面最顶部设置，例如：
```md
---
outline: 本站的简要构建过程
title: 如何使用VitePress搭建一个简单的网站
date: 2025-12-16
comment: true
---
```
在开发过程可以通过`page.value.frontmatter.`获取，便于管理。