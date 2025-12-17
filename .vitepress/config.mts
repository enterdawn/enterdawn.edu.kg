import { defineConfig } from 'vitepress'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createPreventVueParsePlugin} from './plugins/disableCodeInterpolation'
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
    markdown: {
       // lineNumbers: true,
        math: true,
        shikiConfig: {
            theme: 'github-light',
            wrap: true, // 自动换行，避免横向滚动
            langs: [
                // 必须添加需要高亮的语言（不能为空！）
                'javascript', 'typescript', 'vue', 'html',
                'css', 'markdown', 'json', 'bash', 'tsx', 'cpp'
            ],
            drafts: false
        },
        //highlight:true,
        config: (md) => {
            const plugin = createPreventVueParsePlugin({
                // 将 languages 设置为空数组，意味着对所有语言（包括行内代码）都进行内容检查
                languages: [],
                patterns: [
                    // 默认的 {{...}} 和 v- 指令
                    /\{\{.*?\}\}/,
                    /v-[a-zA-Z-]+/,
                    // 你自己的特定模式
                    'vite',
                    /site\.(title|themeConfig\.footer\.message)/,
                ]
            });
            plugin.extendMarkdown(md);
        }
    },

    vite: {
        plugins: [
            AutoImport({
                resolvers: [ElementPlusResolver()],
            }),
            Components({
                resolvers: [ElementPlusResolver()],
            }),
        ],
    }
})
