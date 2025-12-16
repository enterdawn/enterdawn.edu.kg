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
