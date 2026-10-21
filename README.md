# FangYang · 技术手记

简洁浅色的中文个人博客。支持 Markdown 文章、分类、标签、归档、全文搜索、深浅色主题、文章目录、代码复制和 RSS。

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

`tags` 用英文逗号分隔。设置 `featured: true` 可以置顶。示例文章带有 `demo: true`；替换成自己的内容后删除该字段。文件名使用小写英文字母、数字和连字符，作为文章地址。

编辑 `site.config.json` 修改昵称、标题、简介、GitHub 链接、主题分类和站点地址。关于页文字在 `scripts/build.mjs` 中。

## 发布到 GitHub Pages

目标用户名为 `fangyang970206`。推荐创建公开仓库 `fangyang970206.github.io`，然后把本项目文件提交到 `main` 分支。仓库根目录应包含 `package.json`、`content/`、`scripts/`、`public/` 和 `.github/workflows/pages.yml`。

在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。提交到 `main` 后，工作流会自动构建和发布。成功后的个人主页地址为 https://fangyang970206.github.io/ 。这只是预期地址，须以 GitHub Actions 的部署成功结果为准。

工作流也兼容其他仓库名称，会从 `configure-pages` 获取实际域名和路径。使用其他域名时，同步更新 `site.config.json` 中的 `url`。

参考 [GitHub 官方部署说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 目录

- `content/posts/`：Markdown 原文
- `public/`：样式、交互和图标
- `scripts/build.mjs`：生成文章、列表、标签、RSS、站点地图及搜索索引
- `.github/workflows/pages.yml`：GitHub Pages 自动部署
- `.openai/hosting.json`：Sites 预览身份配置，GitHub Pages 不依赖它
- `dist/`：构建输出，无需提交

文章作为可信作者内容进行构建，请不要将未经审核的外部 Markdown 自动发布到本站。网页字体会优先请求 Google Fonts，无法加载时使用系统中文字体。
