# -*- coding: utf-8 -*-
"""婚纱照处理流水线

把 photos-original/ 里的原图 →  dist/assets/photos/01.jpg ... 09.jpg

做四件事：
  1. 按 EXIF 方向把照片摆正（手机/相机竖拍的照片会带旋转标记）
  2. 长边缩到 2200px —— 3 倍高清屏放大看也不糊
  3. 存成渐进式 JPEG，质量 80，去掉 EXIF（体积能小 95% 以上）
  4. 统一成小写 .jpg —— GitHub Pages 区分大小写，.JPG 会 404

原图不会被动，随时可以重跑：
    python tools/prepare_photos.py
"""
import os
import glob
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "photos-original")
DST = os.path.join(ROOT, "dist", "assets", "photos")

LONG_EDGE = 2200      # 长边像素（3x 高清屏也够锐）
QUALITY = 82          # JPEG 质量
EXTS = (".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff")

os.makedirs(DST, exist_ok=True)

files = sorted(
    f for f in glob.glob(os.path.join(SRC, "*"))
    if f.lower().endswith(EXTS)
)
if not files:
    raise SystemExit("photos-original/ 里没有找到图片，先把原图放进去")

print("源目录 %s（%d 张）\n" % (SRC, len(files)))
total_in = total_out = 0

for i, path in enumerate(files, 1):
    name = "%02d.jpg" % i
    out = os.path.join(DST, name)

    im = Image.open(path)
    im = ImageOps.exif_transpose(im)          # 把 EXIF 旋转烘焙进像素
    if im.mode not in ("RGB", "L"):
        im = im.convert("RGB")

    w, h = im.size
    scale = LONG_EDGE / float(max(w, h))
    if scale < 1:
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

    im.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)

    a = os.path.getsize(path)
    b = os.path.getsize(out)
    total_in += a
    total_out += b
    nw, nh = im.size
    print("  %-24s -> %s  %dx%d %s  %.1fMB -> %dKB" % (
        os.path.basename(path), name, nw, nh,
        "横版" if nw > nh else "竖版", a / 1048576.0, b / 1024))

print("\n合计 %.1fMB -> %.1fMB（省了 %.0f%%）" % (
    total_in / 1048576.0, total_out / 1048576.0,
    (1 - total_out / float(total_in)) * 100))
