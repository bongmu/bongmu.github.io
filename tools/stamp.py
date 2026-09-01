# -*- coding: utf-8 -*-
"""给 index.html 里的 css/js 打版本号（缓存击穿）

为什么需要它：
  GitHub Pages 给 style.css / app.js 发的是 Cache-Control: max-age=600，
  但微信内置浏览器（X5 / WKWebView）比这激进得多，会把旧文件缓存很久。
  结果就是：你明明已经发了新版，手机上打开还是上一版的样子。

做法是给链接加一个内容指纹：
  <link href="style.css?v=a1b2c3d4">
文件内容一变，指纹就变，浏览器被迫重新下载；内容没变则指纹不变，缓存照常复用。

改完 css/js 后跑一次：
    python tools/stamp.py
"""
import hashlib
import io
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
HTML = os.path.join(DIST, "index.html")

# 需要打指纹的文件（照片/音乐不用：它们的文件名一旦定了就不会再改内容）
TARGETS = ["style.css", "app.js", "config.js"]


def digest(path):
    """按二进制取 md5 前 8 位；顺手把 CRLF 归一，免得换行符导致指纹抖动"""
    with open(path, "rb") as f:
        raw = f.read().replace(b"\r\n", b"\n")
    return hashlib.md5(raw).hexdigest()[:8]


html = io.open(HTML, encoding="utf-8").read()
changed = []

for name in TARGETS:
    path = os.path.join(DIST, name)
    if not os.path.exists(path):
        print("跳过（文件不存在）：%s" % name)
        continue
    v = digest(path)
    # 匹配 href="style.css" 或 href="style.css?v=旧指纹"，两种都能换
    pat = re.compile(r'((?:href|src)=")' + re.escape(name) + r'(?:\?v=[0-9a-f]+)?(")')
    html, n = pat.subn(lambda m: m.group(1) + name + "?v=" + v + m.group(2), html)
    if n:
        changed.append("%s -> ?v=%s（%d 处）" % (name, v, n))
    else:
        print("警告：index.html 里没引用 %s" % name)

io.open(HTML, "w", encoding="utf-8", newline="").write(html)

print("已更新 %s" % os.path.relpath(HTML, ROOT))
for c in changed:
    print("  ·", c)
