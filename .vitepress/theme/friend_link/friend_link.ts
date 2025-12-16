import {h} from 'vue';
import {ElLink, ElMessageBox, ElSpace} from "element-plus";

const openFriendLink = () => {
    // 用 ElSpace 包裹多个链接（自动添加间距，Element Plus 推荐）
    const linkNode = h(
        ElSpace, // 布局容器：自动给子元素加间距
        { direction: 'vertical', size: 'small' }, // 垂直排列，小间距
        [
            // 第一个链接
            h(
                ElLink,
                { href: 'https://enterdawn.top', target: '_blank', type: 'primary', underline: true },
                'enterdawn的主页'
            ),
            // 第二个链接（按需修改 href 和文字）
            h('div', { style: 'color: #666; line-height: 1.5;' }, '添加友情链接请联系enterdawn'),
        ]
    )

    ElMessageBox.alert(linkNode, '友情链接', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        // 可选：调整弹窗宽度，适配多个链接
        customClass: 'friend-link-box'
    })
}

export default openFriendLink