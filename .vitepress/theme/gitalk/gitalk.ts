// .vitepress/theme/composables/useGitalk.ts
import { computed, ref, watch, onUnmounted } from 'vue';
import { useData } from 'vitepress';
import md5 from 'md5'; // 确保已安装：npm i md5

// 类型声明：移除冗余的 GITALK_CLIENT_SECRET，仅保留 Gitalk 核心类型
declare global {
    interface Window {
        Gitalk: new (config: Gitalk.Config) => Gitalk.Instance;
    }
}

// Gitalk 类型定义（简化版）
namespace Gitalk {
    export interface Config {
        clientID: string;
        clientSecret: string; // 前端留空，Worker 自动填充
        repo: string;
        owner: string;
        admin: string[];
        proxy?: string; // 指向你的 Cloudflare Worker 地址
        language: string;
        distractionFreeMode: boolean;
        id: string;
    }
    export interface Instance {
        render: (el: HTMLElement) => void;
        destroy: () => void;
    }
}

// 生成合规的 Gitalk ID（基于标准 MD5）
const generateSafeGitalkId = (path: string): string => {
    if (!path) return 'enterdawn_university_home';

    const normalizedPath = path
        .trim()
        .replace(/^\/+|\/+$/g, '')
        .replace(/\/+/g, '/')
        .toLowerCase();

    return normalizedPath ? md5(normalizedPath) : 'enterdawn_university_home';
};

export function useGitalk() {
    const { page } = useData();
    const commentRef = ref<HTMLDivElement | null>(null);
    let gitalkScript: HTMLScriptElement | null = null;
    let gitalkInstance: Gitalk.Instance | null = null;
    let isGitalkLoaded = ref(false);
    let isGitalkLoading = ref(false);

    // 核心修改：适配 Worker 方案的 Gitalk 配置
    // 👉 关键：clientSecret 留空，proxy 指向你的 Cloudflare Worker 地址
    const getGitalkConfig = (): Gitalk.Config => {
        return {
            clientID: 'Ov23liDgWI9RBb21UXjZ', // 仅暴露 Client ID（无风险）
            clientSecret: '', // 前端留空！Worker 转发时自动填充
            repo: 'enterdawn.edu.kg',
            owner: 'enterdawn',
            admin: ['enterdawn'],
            proxy: 'https://github-proxy.enterdawn.edu.kg/',
            language: 'zh-CN',
            distractionFreeMode: false,
            id: generateSafeGitalkId(page.value.relativePath),
        };
    };

    // 判断是否显示评论（逻辑保留）
    const isShowComment = computed(() => {
        if (!page.value) return false;
        if (page.value.frontmatter.comment === false) return false;
        const isHome = ['/', 'index.md', 'index.html'].includes(page.value.relativePath);
        return !isHome;
    });

    // 销毁 Gitalk 实例（逻辑保留）
    const destroyGitalk = () => {
        if (gitalkInstance) {
            gitalkInstance.destroy();
            gitalkInstance = null;
        }
        if (commentRef.value) {
            commentRef.value.innerHTML = '';
        }
    };

    // 渲染 Gitalk（移除 ClientSecret 校验）
    const renderGitalk = () => {
        if (!isShowComment.value || !commentRef.value || !window.Gitalk) {
            destroyGitalk();
            return;
        }

        try {
            destroyGitalk();
            const config = getGitalkConfig();
            gitalkInstance = new window.Gitalk(config);
            gitalkInstance.render(commentRef.value);
        } catch (error) {
            console.error('Gitalk 渲染失败:', error);
            destroyGitalk();
        }
    };

    // 加载 Gitalk 脚本和样式（移除 ClientSecret 依赖）
    const loadGitalkAssets = () => {
        if (isGitalkLoaded.value || isGitalkLoading.value) return;

        isGitalkLoading.value = true;
        gitalkScript = document.createElement('script');
        // 主 CDN + 备用 CDN 提升稳定性
        gitalkScript.src = 'https://cdn.staticfile.org/gitalk/1.8.0/gitalk.min.js';
        gitalkScript.async = true;

        gitalkScript.onload = () => {
            // 加载样式（去重）
            if (!document.querySelector('link[href$="gitalk.min.css"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdn.staticfile.org/gitalk/1.8.0/gitalk.min.css';
                document.head.appendChild(link);
            }
            isGitalkLoaded.value = true;
            isGitalkLoading.value = false;
            renderGitalk(); // 加载完成直接渲染，无需等 ClientSecret
        };

        gitalkScript.onerror = (error) => {
            // 主 CDN 失败，切换备用 CDN
            if (gitalkScript?.src.includes('staticfile.org')) {
                gitalkScript.src = 'https://cdn.jsdelivr.net/npm/gitalk@1.8.0/dist/gitalk.min.js';
                document.body.appendChild(gitalkScript);
                return;
            }
            console.error('Gitalk 脚本加载失败:', error);
            isGitalkLoading.value = false;
            destroyGitalk();
        };

        document.body.appendChild(gitalkScript);
    };

    // 初始化 Gitalk（移除 ClientSecret 轮询）
    const initGitalk = () => {
        if (!isShowComment.value) {
            destroyGitalk();
            return;
        }
        loadGitalkAssets(); // 直接加载脚本，无需等 Secret
    };

    // 监听路径变化（逻辑保留）
    watch(
        () => page.value?.relativePath,
        () => initGitalk(),
        { flush: 'post', immediate: true, deep: false }
    );

    // 组件卸载清理（逻辑保留）
    onUnmounted(() => {
        destroyGitalk();
        if (gitalkScript && document.body.contains(gitalkScript)) {
            document.body.removeChild(gitalkScript);
        }
        isGitalkLoaded.value = false;
        isGitalkLoading.value = false;
    });

    return { commentRef, isShowComment };
}