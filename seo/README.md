# 光伏储能地图站 GEO 优化说明

## 概述

本目录包含光伏储能地图站为生成式引擎优化（GEO）而创建的所有SEO和AI友好文件。

## 文件说明

### 技术基础设施

| 文件 | 说明 | 放置位置 |
|------|------|---------|
| `llms.txt` | AI内容使用政策声明 | 网站根目录 |
| `robots.txt` | AI爬虫友好配置 | 网站根目录 |
| `sitemap.xml` | 网站地图 | 网站根目录 |

### 结构化数据

| 文件 | 说明 | 放置位置 |
|------|------|---------|
| `seo/structured-data.json` | 完整JSON-LD结构化数据 | seo目录 |
| `seo/schema-snippets.html` | Schema代码片段 | seo目录，需复制到页面head |

### 内容优化

| 文件 | 说明 | 放置位置 |
|------|------|---------|
| `seo/knowledge-snippets.html` | AI引用友好段落 | seo目录，需嵌入页面 |
| `seo/brand-signals.json` | 品牌权威信号 | seo目录 |

### 知识库

| 文件 | 说明 | 放置位置 |
|------|------|---------|
| `knowledge/index.html` | GEO知识库页面 | knowledge目录 |

## 集成指南

### 1. 在首页(index.html)集成Schema

将 `seo/schema-snippets.html` 中的代码复制到首页 `<head>` 标签内。

### 2. 在首页集成知识片段

将 `seo/knowledge-snippets.html` 中的 `<section id="knowledge-snippets">` 复制到首页底部（footer前）。

### 3. 更新robots.txt

已将AI爬虫规则整合到 `robots.txt`，直接替换原文件。

### 4. 上传llms.txt

将 `llms.txt` 上传到网站根目录。

### 5. 上传sitemap.xml

将 `sitemap.xml` 上传到网站根目录。

## 核心数据

| 指标 | 数值 |
|------|------|
| 项目总数 | 992个 |
| 总装机容量 | 68,270 MW (68.27 GW) |
| 总储能容量 | 6,179.25 MWh |
| 招标总金额 | 478.4亿元 |
| 覆盖省份 | 31个 |

## 支持的AI爬虫

- GPTBot (OpenAI)
- ClaudeBot (Anthropic)
- PerplexityBot
- Google-Extended
- Googlebot
- Bingbot
- DuckDuckBot
- 及其他所有主流AI爬虫

## 数据来源

- 北极星光伏网
- 国家能源局
- 中国招标投标公共服务平台
- 各地发改委

## 联系方式

- 邮箱：contact@pvstorage-map.com

---
*最后更新：2026年4月28日*
