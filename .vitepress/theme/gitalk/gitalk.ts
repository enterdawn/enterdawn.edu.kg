// .vitepress/theme/composables/useGitalk.ts

import { computed, ref, watch } from 'vue';
import { useData } from 'vitepress';

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
        const gitalk = new (window as any).Gitalk({
            ...gitalkConfig,
            id: encodeURIComponent(page.value.relativePath),
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