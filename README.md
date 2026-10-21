# FangYang · 技术手记

参考 Tw93 风格的中文个人博客，采用米白底色、深棕横幅、单栏白色文章卡片和仓耳今楷字体。支持 Markdown 文章、分类、标签、归档、全文搜索、深浅色主题、文章目录、代码复制和 RSS。

## 本地使用

需要 Node.js 22 或更新版本。

```sh
npm ci
npm run build
npm run check
npm run dev
```

打开 http://127.0.0.1:4173 。修改内容后重新运行构建即可。

## 写一篇文章

在 `content/posts/` 下创建一个 Markdown 文件，例如 `my-first-post.md`。

```markdown
---
title: 我的第一篇文章
date: 2026-10-21
category: 工程实践
tags: JavaScript, 学习笔记
description: 一句话摘要。
---

## 开始写作

这里是正文。
```

`tags` 用英文逗号分隔。文件名使用小写英文字母、数字和连字符，作为文章地址。

编辑 `site.config.json` 修改昵称、标题、简介、首页寄语（motto）、GitHub 链接、主题分类和站点地址。关于页文字在 `scripts/build.mjs` 中。

## 源码与发布

源码保存在私有仓库 `FangYang970206/fangyang970206.github.io`。当前网站通过 Sites 部署，沿用仅所有者可访问的权限。

提交到 `main` 后，GitHub Actions 会安装依赖、构建并检查站内链接。当前账户方案不支持从此私有仓库启用 GitHub Pages，因此默认不运行 Pages 部署。

如以后具备私有仓库的 Pages 权限，可先在仓库 Settings → Pages 中启用 GitHub Actions，再手动运行工作流并勾选 `deploy_pages`。部署成功后同步更新 `site.config.json` 中的 `url`。

## 当前文章

首篇文章为《多数据源图查询，先把联邦的边界看清楚》，整理自多数据源图查询报告和配套术语表。正文保留官方文档与论文链接，原始报告和聊天记录不随博客发布。

## 目录

- `content/posts/`：Markdown 原文
- `public/`：样式、交互和图标
- `scripts/build.mjs`：生成文章、列表、标签、RSS、站点地图及搜索索引
- `.github/workflows/pages.yml`：内容检查及可选的 Pages 手动部署
- `.openai/hosting.json`：Sites 预览身份配置，GitHub Pages 不依赖它
- `dist/`：构建输出，无需提交

文章作为可信作者内容进行构建，请不要将未经审核的外部 Markdown 自动发布到本站。网页字体采用与参考站相同的仓耳今楷 02，从公开 CDN 按需加载，无法加载时使用系统楷体。个人用途及字体来源见 FONT-NOTICE.md。
