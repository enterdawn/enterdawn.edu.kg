// vitepress-plugin-prevent-vue-parse.js
import * as cheerio from 'cheerio';

/**
 * 检查内容是否需要被 v-pre 保护
 * @param {string} content - 代码内容
 * @param {string} lang - 语言 (对于行内代码为空)
 * @param {object} options - 插件配置
 * @returns {boolean}
 */
function shouldProcess(content, lang, options) {
    // 1. 检查内容是否匹配任何一个模式
    const contentMatches = options.patterns.some(pattern => {
        if (typeof pattern === 'string') {
            return content.includes(pattern);
        }
        if (pattern instanceof RegExp) {
            return pattern.test(content);
        }
        return false;
    });

    if (!contentMatches) {
        return false;
    }

    // 2. 如果内容匹配，再检查语言
    // 如果 languages 列表为空，则对所有语言生效
    // 对于行内代码，lang 为空字符串，如果 languages 不为空，则不会被处理
    return options.languages.length === 0 || options.languages.includes(lang);
}

/**
 * 创建一个 VitePress 插件，用于防止代码块和行内代码中的特定内容被 Vue 解析
 * @param {import('./types').PreventVueParseOptions} options - 插件配置选项
 * @returns {import('vitepress').Plugin} VitePress 插件
 */
export function createPreventVueParsePlugin(options = {}) {
    const defaultOptions = {
        // 需要检查的语言。如果为空数组，则检查所有语言（包括行内代码）
        languages: ['js', 'javascript', 'ts', 'typescript', 'vue', 'html', 'md'],
        patterns: [
            /\{\{.*?\}\}/, // 匹配 {{ ... }} 插值
            /v-[a-zA-Z-]+/, // 匹配 v- 指令
        ],
    };

    const finalOptions = {
        ...defaultOptions,
        ...options,
        patterns: [...defaultOptions.patterns, ...(options.patterns || [])],
    };

    return {
        name: 'vitepress-prevent-vue-parse',
        extendMarkdown: (md) => {
            // --- 处理代码块 ---
            const defaultFenceRender = md.renderer.rules.fence;
            md.renderer.rules.fence = (tokens, idx, options, env, renderer) => {
                const token = tokens[idx];
                const lang = token.info.trim();
                const codeContent = token.content;

                if (shouldProcess(codeContent, lang, finalOptions)) {
                    let html = defaultFenceRender(tokens, idx, options, env, renderer);
                    const $ = cheerio.load(html);
                    $('div[class*="language-"]').attr('v-pre', '');
                    return $.html();
                }

                return defaultFenceRender(tokens, idx, options, env, renderer);
            };

            // --- 处理行内代码 ---
            const defaultCodeInlineRender = md.renderer.rules.code_inline;
            md.renderer.rules.code_inline = (tokens, idx, options, env, renderer) => {
                const token = tokens[idx];
                const codeContent = token.content;

                // 对于行内代码，lang 参数我们传空字符串 ''
                if (shouldProcess(codeContent, '', finalOptions)) {
                    let html = defaultCodeInlineRender(tokens, idx, options, env, renderer);
                    const $ = cheerio.load(html);
                    // 为 <code> 标签添加 v-pre
                    $('code').attr('v-pre', '');
                    return $.html();
                }

                return defaultCodeInlineRender(tokens, idx, options, env, renderer);
            };
        },
    };
}
