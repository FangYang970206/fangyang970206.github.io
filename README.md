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

源码保存在公开仓库 `FangYang970206/fangyang970206.github.io`。网站通过 GitHub Pages 发布，正式地址为 https://fangyang970206.github.io/ 。

提交到 `main` 后，GitHub Actions 自动安装依赖、构建、检查站内链接并部署。仓库 Settings → Pages 的 Source 应设为 GitHub Actions。也可以在 Actions 页面手动运行 Publish blog to GitHub Pages 工作流。

站点地址由 `site.config.json` 中的 `url` 配置；GitHub Actions 构建时使用 Pages 返回的域名和路径，保证文章规范地址、RSS 与站点地图一致。

## 当前文章

首篇文章为《联邦图查询的新进展与发展方向》，整理自多数据源图查询报告和配套术语表。正文保留官方文档与论文链接，原始报告和聊天记录不随博客发布。

## 目录

- `content/posts/`：Markdown 原文
- `public/`：样式、交互和图标
- `scripts/build.mjs`：生成文章、列表、标签、RSS、站点地图及搜索索引
- `.github/workflows/pages.yml`：构建检查与 Pages 自动部署
- `.openai/hosting.json`：Sites 预览身份配置，GitHub Pages 不依赖它
- `dist/`：构建输出，无需提交

文章作为可信作者内容进行构建，请不要将未经审核的外部 Markdown 自动发布到本站。网页字体采用与参考站相同的仓耳今楷 02，从公开 CDN 按需加载，无法加载时使用系统楷体。个人用途及字体来源见 FONT-NOTICE.md。
