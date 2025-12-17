// .vitepress/theme/composables/useGitalk.ts

import { computed, ref, watch } from 'vue';
import { useData } from 'vitepress';

// 1. 纯 JS 实现 MD5 哈希（无额外依赖，固定 32 位）
const md5 = (str: string): string => {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转为 32 位整数
    }
    // 转为 16 进制字符串，固定 32 位（补零）
    return Math.abs(hash).toString(16).padStart(32, '0');
};

// 2. 生成合规的 Gitalk ID（32 位哈希，≤50 字符，唯一）
const generateSafeGitalkId = (path: string): string => {
    // 步骤1：标准化路径（消除冗余/特殊字符）
    const normalizedPath = path
        .trim()
        .replace(/^\/+|\/+$/g, '') // 移除首尾斜杠
        .replace(/\/+/g, '/') // 多个斜杠转为一个
        .toLowerCase(); // 统一小写

    // 步骤2：生成 32 位 MD5 哈希（固定长度，无超限风险）
    const hashId = md5(normalizedPath);

    // 步骤3：兜底（首页/空路径）
    return normalizedPath ? hashId : 'enterdawn_university_home';
};

export function useGitalk() {
    const { page } = useData();

    const commentRef = ref<HTMLDivElement>(null);
    let gitalkScript: HTMLScriptElement | null = null;
    let isGitalkLoaded = false;

    const gitalkConfig = {
        clientID: 'Ov23liDgWI9RBb21UXjZ',
        clientSecret: '',
        repo: 'enterdawn.edu.kg',
        owner: 'enterdawn',
        admin: ['enterdawn'],
        proxy: 'https://github-proxy.enterdawn.edu.kg/login/oauth/access_token',
        language: 'zh-CN',
        distractionFreeMode: false,
    };

    const isShowComment = computed(() => {
        if (page.value.frontmatter.comment === false) return false;
        if (page.value.path === '/') return false;
        return true;
    });

    const destroyGitalk = () => {
        if (commentRef.value) {
            // 彻底清空容器，防止旧实例残留
            commentRef.value.innerHTML = '';
        }
        // 不需要移除脚本和样式，它们只需要加载一次
        // isGitalkLoaded = true; // 保持 true
        // 不需要删除 window.Gitalk，因为它需要被复用
    };

    const renderGitalk = () => {
        if (!isShowComment.value || !commentRef.value || !(window as any).Gitalk) {
            return;
        }

        // 先销毁旧的实例
        destroyGitalk();
        console.log(page.value.relativePath)
        console.log(generateSafeGitalkId(page.value.relativePath))
        const gitalk = new (window as any).Gitalk({
            ...gitalkConfig,
            id: encodeURIComponent(generateSafeGitalkId(page.value.relativePath)),
        });
        gitalk.render(commentRef.value);
    };

    const initGitalk = () => {
        // 如果不需要显示，清空并返回
        if (!isShowComment.value) {
            destroyGitalk();
            return;
        }

        // 如果脚本还没加载，则加载
        if (!isGitalkLoaded) {
            gitalkScript = document.createElement('script');
            gitalkScript.src = 'https://cdn.staticfile.org/gitalk/1.8.0/gitalk.min.js';
            gitalkScript.async = true;
            gitalkScript.onload = () => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdn.staticfile.org/gitalk/1.8.0/gitalk.min.css';
                document.head.appendChild(link);

                isGitalkLoaded = true;
                renderGitalk(); // 脚本加载完成后渲染
            };
            document.body.appendChild(gitalkScript);
        } else {
            // 脚本已加载，直接渲染
            renderGitalk();
        }
    };

    // 核心：使用 watch + flush: 'post' 来监听路由变化
    watch(
        () => page.value,
        () => {
            initGitalk();
        },
        {
            flush: 'post', // 关键：确保在 DOM 更新后执行
            immediate: true // 关键：组件初始化时也执行一次，替代 onMounted
        }
    );

    return {
        commentRef,
        isShowComment,
    };
}