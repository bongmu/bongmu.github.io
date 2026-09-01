# -*- coding: utf-8 -*-
"""把 config.js 里的姓名/日期同步到 index.html 的分享卡片信息

微信抓取链接时不执行 JS，所以标题、描述、缩略图必须写死在 HTML 里。
每次改完 dist/config.js，跑一次这个脚本就行：

    python tools/sync_meta.py

顺便会用第一张照片重新裁一张 500x500 的方形缩略图 assets/img/share.jpg
（微信缩略图要方图，300px 以上，这里给 800px）。
"""
import io
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = os.path.join(ROOT, "dist", "config.js")
HTML = os.path.join(ROOT, "dist", "index.html")
CNAME = os.path.join(ROOT, "dist", "CNAME")
PHOTO = os.path.join(ROOT, "dist", "assets", "photos", "01.jpg")
SHARE = os.path.join(ROOT, "dist", "assets", "img", "share.jpg")


def field(src, key):
    """从 config.js 里抠出 key: '值' """
    m = re.search(r"\b%s\s*:\s*'([^']*)'" % key, src)
    return m.group(1) if m else ""


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


cfg = io.open(CFG, encoding="utf-8").read()
groom = field(cfg, "groom")
bride = field(cfg, "bride")
date = field(cfg, "dateText")
title = field(cfg, "shareTitle") or "%s & %s · 婚礼邀请函" % (groom, bride)
desc = field(cfg, "shareDesc") or "%s　诚邀您来见证我们的幸福" % date

origin = "https://" + io.open(CNAME, encoding="utf-8").read().strip()

html = io.open(HTML, encoding="utf-8").read()


def sub(pattern, repl):
    global html
    html, n = re.subn(pattern, lambda _: repl, html, count=1)
    if not n:
        raise SystemExit("index.html 里找不到：%s（是不是手改坏了？）" % pattern)


sub(r"<title>.*?</title>", "<title>%s</title>" % esc(title))
sub(r'<meta name="description" content=".*?">',
    '<meta name="description" content="%s">' % esc(desc))
sub(r'<meta property="og:title" content=".*?">',
    '<meta property="og:title" content="%s">' % esc(title))
sub(r'<meta property="og:description" content=".*?">',
    '<meta property="og:description" content="%s">' % esc(desc))
sub(r'<meta property="og:image" content=".*?">',
    '<meta property="og:image" content="%s/assets/img/share.jpg">' % origin)
sub(r'<meta property="og:url" content=".*?">',
    '<meta property="og:url" content="%s/">' % origin)
sub(r'alt="[^"]*婚礼邀请函"',
    'alt="%s 婚礼邀请函"' % esc("%s & %s" % (groom, bride)))
sub(r'<div class="bname">.*?</div>',
    '<div class="bname">%s &amp; %s</div>' % (esc(groom), esc(bride)))

io.open(HTML, "w", encoding="utf-8").write(html)

# 重新生成方形缩略图
try:
    from PIL import Image, ImageOps
    im = ImageOps.exif_transpose(Image.open(PHOTO))
    w, h = im.size
    side = min(w, h)
    if h > w:                       # 竖版取上部，保住人脸
        top = min(int(h * 0.06), h - side)
        box = (0, top, side, top + side)
    else:                           # 横版取中间
        left = (w - side) // 2
        box = (left, 0, left + side, side)
    os.makedirs(os.path.dirname(SHARE), exist_ok=True)
    im.crop(box).resize((800, 800), Image.LANCZOS).save(
        SHARE, "JPEG", quality=84, optimize=True, progressive=True)
    thumb = "%dKB" % (os.path.getsize(SHARE) // 1024)
except Exception as e:
    thumb = "跳过（%s）" % e

print("已同步到 dist/index.html：")
print("  标题    %s" % title)
print("  描述    %s" % desc)
print("  缩略图  %s/assets/img/share.jpg  %s" % (origin, thumb))
print("\n注意：微信对分享卡片有缓存，改完要过一会儿、或换个链接参数才看得到新的。")
