---
title: 用 Markdown，专注内容本身
date: 2026-10-20
category: 工具与方法
tags: Markdown, 写作
description: 标题、代码、链接与清单。一份可以直接照着修改的博客写作示例。
demo: true
---

这是一篇排版示例，展示这个博客如何呈现 Markdown。发布自己的文章时，可以保留需要的部分并替换内容。

## 从一个文件开始

在 `content/posts/` 新建一个 Markdown 文件。文件名会成为文章地址，因此建议使用简短的英文名称。

```markdown
---
title: 我的第一篇技术文章
date: 2026-10-21
category: 工程实践
tags: JavaScript, 学习笔记
description: 用一句话介绍这篇文章。
---

从正文开始写。
```

## 让结构帮助阅读

用二级标题划分主要部分，用三级标题补充细节。页面右侧会自动生成目录，方便读者在长文中定位。

### 代码与解释放在一起

代码块适合放完整示例，行内代码适合提到一个名称，例如 `Array.map()`。

```javascript
const notes = ['阅读', '实践', '记录'];

function dailyNote(items) {
  return items.map(item => `今天做一点${item}`);
}

console.log(dailyNote(notes));
```

### 对照信息用表格

| 元素 | 用途 |
| --- | --- |
| 标题 | 帮助读者建立文章结构 |
| 代码块 | 保留可复制的示例 |
| 引用 | 强调一段值得留意的话 |
| 清单 | 把步骤写得更清楚 |

## 发布前的小检查

- [ ] 标题能说明文章讨论的问题
- [ ] 代码示例可以独立理解
- [ ] 引用提供了来源
- [ ] 清除了示例说明和占位内容

保存文件后运行 `npm run build`，即可生成静态页面。具体发布步骤见项目 README。
