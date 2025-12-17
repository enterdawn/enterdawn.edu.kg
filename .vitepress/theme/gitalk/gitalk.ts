// .vitepress/theme/composables/useGitalk.ts
import { computed, ref, watch, onUnmounted, nextTick } from 'vue'; // 新增 nextTick
import { useData } from 'vitepress';
import md5 from 'md5';

declare global {
    interface Window {
        Gitalk?: new (config: Gitalk.Config) => Gitalk.Instance;
    }
}

namespace Gitalk {
    export interface Config {
        clientID: string;
        clientSecret: string;
        repo: string;
        owner: string;
        admin: string[];
        proxy?: string;
        language: string;
        distractionFreeMode: boolean;
        id: string;
        asyncRender?: boolean; // 显式声明异步渲染配置
    }
    export interface Instance {
        render: (el: HTMLElement) => void;
        destroy: () => void;
    }
}

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
    const isGitalkScriptLoaded = ref(false); // 仅标记脚本是否加载完成（永久保留，不重置）
    let isGitalkLoading = ref(false);

    // 核心配置（替换为你的 Worker 地址）
    const getGitalkConfig = (): Gitalk.Config => ({
        clientID: 'Ov23liDgWI9RBb21UXjZ',
        clientSecret: '',
        repo: 'enterdawn.edu.kg',
        owner: 'enterdawn',
        admin: ['enterdawn'],
        proxy: 'https://github-proxy.enterdawn.edu.kg', // 务必替换为实际地址
        language: 'zh-CN',
        distractionFreeMode: false,
        asyncRender: false, // 禁用异步渲染，避免时机问题
        id: generateSafeGitalkId(page.value?.relativePath || ''),
    });

    // 判断是否显示评论
    const isShowComment = computed(() => {
        if (!page.value) return false;
        if (page.value.frontmatter.comment === false) return false;
        const isHome = ['/', 'index.md', 'index.html'].includes(page.value.relativePath);
        return !isHome;
    });

    // 安全销毁实例
    const safeDestroyGitalk = () => {
        try {
            if (gitalkInstance && typeof gitalkInstance.destroy === 'function') {
                gitalkInstance.destroy();
            }
        } catch (error) {
            console.warn('Gitalk 销毁异常:', error);
        } finally {
            gitalkInstance = null;
            if (commentRef.value) commentRef.value.innerHTML = '';
        }
    };

    // 🔥 核心修复：强制渲染（确保 DOM 挂载后执行）
    const forceRenderGitalk = async () => {
        // 前置校验
        if (!isShowComment.value || !window.Gitalk) {
            safeDestroyGitalk();
            return;
        }

        // 关键：等待 DOM 挂载完成（nextTick 确保评论区元素已存在）
        await nextTick();
        if (!commentRef.value) return;

        try {
            safeDestroyGitalk();
            const config = getGitalkConfig();
            if (typeof window.Gitalk === 'function') {
                gitalkInstance = new window.Gitalk(config);
                gitalkInstance.render(commentRef.value);
            }
        } catch (error) {
            console.error('Gitalk 强制渲染失败:', error);
            safeDestroyGitalk();
        }
    };

    // 加载 Gitalk 脚本（仅加载一次，加载完成后永久标记）
    const loadGitalkAssets = () => {
        if (isGitalkScriptLoaded.value || isGitalkLoading.value) {
            // 脚本已加载，直接强制渲染
            forceRenderGitalk();
            return;
        }

        isGitalkLoading.value = true;
        // 清理旧脚本
        if (gitalkScript && document.body.contains(gitalkScript)) {
            document.body.removeChild(gitalkScript);
        }

        gitalkScript = document.createElement('script');
        gitalkScript.src = 'https://cdn.staticfile.org/gitalk/1.8.0/gitalk.min.js'; // 优先用稳定 CDN
        gitalkScript.async = true;

        gitalkScript.onload = () => {
            // 加载样式（去重）
            if (!document.querySelector('link[href$="gitalk.min.css"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdn.staticfile.org/gitalk/1.8.0/gitalk.min.css';
                document.head.appendChild(link);
            }
            isGitalkScriptLoaded.value = true;
            isGitalkLoading.value = false;
            forceRenderGitalk(); // 脚本加载完成后强制渲染
        };

        gitalkScript.onerror = (error) => {
            console.error('Gitalk 脚本加载失败:', error);
            isGitalkLoading.value = false;
            safeDestroyGitalk();
        };

        document.body.appendChild(gitalkScript);
    };

    // 初始化逻辑（每次路由切换都执行）
    const initGitalk = () => {
        if (!isShowComment.value) {
            safeDestroyGitalk();
            return;
        }
        loadGitalkAssets(); // 无论脚本是否加载，都执行（已加载则直接渲染）
    };

    // 🔥 修复监听：确保每次路径变化都触发初始化，且等待 DOM 更新
    watch(
        () => page.value?.relativePath,
        () => {
            // 先销毁旧实例，再初始化（post 确保 DOM 先更新）
            safeDestroyGitalk();
            initGitalk();
        },
        {
            flush: 'post', // 关键：DOM 更新后执行
            immediate: true,
            deep: false,
        }
    );

    // 🔥 新增：监听 commentRef 变化，DOM 挂载后再次触发渲染
    watch(
        () => commentRef.value,
        () => {
            if (isShowComment.value && isGitalkScriptLoaded.value) {
                forceRenderGitalk();
            }
        }
    );

    // 组件卸载清理
    onUnmounted(() => {
        safeDestroyGitalk();
        if (gitalkScript && document.body.contains(gitalkScript)) {
            document.body.removeChild(gitalkScript);
        }
        gitalkScript = null;
        isGitalkLoading.value = false;
    });

    return { commentRef, isShowComment };
}