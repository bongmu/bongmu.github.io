# 婚礼请帖站

纯静态 H5 电子请帖。部署：**GitHub Pages（发布 dist/）+ Cloudflare DNS/CDN 加速**。

## 文件结构

```
.github/workflows/deploy.yml   GitHub Actions 自动部署（push 即发布）
dist/
  index.html     模板选择页（定稿后自动跳转定稿模板）
  t1~t5.html     五套请帖模板（中式红金 / 清新花园 / 光影暗金 / 粉彩浪漫 / 国潮剪纸）
  route.html     路线图（?t=1~5 跟随模板换肤）
  config.js      ★ 所有可编辑内容都在这里
  core.js        公共逻辑（无需改动）
  CNAME          自定义域名（qyj-tools.eu.cc）
  assets/        照片 / 音乐 / 路线图 PNG
```

## 一键部署（GitHub Pages）

1. GitHub 仓库 → **Settings → Pages → Build and deployment → Source 选「GitHub Actions」**（只需设一次）
2. 之后每次 `git push` 自动部署到 https://bongmu.github.io/toolhub/

## 绑定域名 + Cloudflare 加速（国内访问）

域名：`qyj-tools.eu.cc`（已在 Cloudflare）。按顺序做：

1. **Cloudflare 控制台**：Workers 和 Pages 里把旧的 Pages 项目（melodious-dodol-a2856d）**删掉**，避免域名冲突
2. **Cloudflare DNS**：添加记录
   - 类型 `CNAME`，名称 `@`（或 `qyj-tools`），目标 `bongmu.github.io`
   - **代理状态先选「仅 DNS」（灰云）** ← 关键，让 GitHub 能验证域名、签发证书
3. **GitHub 仓库** → Settings → Pages → Custom domain 填 `qyj-tools.eu.cc` → 等「DNS check successful」→ 出现 Enforce HTTPS 后**勾选**
4. 证书签发后，回到 **Cloudflare DNS** 把那条记录的代理状态改为「**已代理**」（橙云）
5. **Cloudflare** → SSL/TLS → 概述 → 加密模式选 **完全（严格）Full (strict)**

完成后：客人访问 `https://qyj-tools.eu.cc` → 命中 Cloudflare 边缘节点（CDN 缓存）→ 回源 GitHub Pages，国内不直连 github.io。

> 提示：Cloudflare 免费版对大陆的加速是「能用、更稳」，不是极致快（那是企业版中国网络的能力）。
> 页面本体只有几十 KB，正文已做非阻塞字体加载（fonts.loli.net 国内镜像，加载失败自动回退系统字体），微信里打开体验是有保障的。

## 定稿与编辑（只动 dist/config.js）

1. **定稿**：`finalTemplate` 填 `"1"`~`"5"`，首页直接进定稿请帖
2. **姓名**：`groom` / `bride`（可选 `groomParents` 落款）
3. **照片**：同名替换 `dist/assets/photos/1.jpg ~ 5.jpg`；加照片往 `photos` 数组加一行
4. **音乐**：`music.mp3` 放入 `dist/assets/music/`
5. **一键导航**：https://lbs.amap.com/tools/picker 拾取坐标填 `lng` / `lat`
