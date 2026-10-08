#!/usr/bin/env python3
"""Build a tiny on-site silhouette catalog from public Charm reference images.

This never reads player screenshots. Only 24×24 one-bit glyph silhouettes
are stored in the Pages artifact; the source reference artwork stays on
its original host. Network/Pillow problems must not break normal Pages deploy.
"""
import base64
import colorsys
import concurrent.futures
import io
import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

SOURCE = "https://kingshotoptimizer.com/images/charms-cards/infantry_lvl{}.webp"


def signature(level):
    try:
        from PIL import Image
        request = urllib.request.Request(
            SOURCE.format(level),
            headers={"User-Agent": "Mozilla/5.0 (compatible; NRW Bear Optimizer build/1.0)"}
        )
        with urllib.request.urlopen(request, timeout=9) as response:
            if response.status != 200:
                return level, None
            data = response.read(3000000)
        im = Image.open(io.BytesIO(data)).convert("RGBA")
        width, height = im.size
        if width < 40 or height < 40 or width > 1200 or height > 1200:
            return level, None
        mask = Image.new("L", im.size, 0)
        pixels = im.load()
        dst = mask.load()
        coords = []
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                if a < 90:
                    continue
                h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
                if 68 <= h * 360 <= 182 and s >= 0.37 and v >= 0.36:
                    dst[x, y] = 255
                    coords.append((x, y))
        if len(coords) < 120:
            return level, None
        left = min(p[0] for p in coords)
        right = max(p[0] for p in coords)
        top = min(p[1] for p in coords)
        bottom = max(p[1] for p in coords)
        img = mask.crop((left, top, right + 1, bottom + 1))
        side = max(img.size)
        padded = Image.new("L", (side, side), 0)
        padded.paste(img, ((side - img.width) // 2, (side - img.height) // 2))
        norm = padded.resize((24, 24), Image.Resampling.BOX)
        bits = bytearray(72)
        for i, p in enumerate(norm.getdata()):
            if p >= 128:
                bits[i // 8] |= 1 << (7 - (i % 8))
        return level, base64.b64encode(bits).decode("ascii")
    except Exception as e:
        print(f"Charm reference Lv{level}: {type(e).__name__}", file=sys.stderr)
        return level, None


def main():
    output = Path(sys.argv[1] if len(sys.argv) > 1 else "_site/charm-signatures.json")
    try:
        from PIL import Image  # noqa: F401
    except ImportError:
        print("Pillow missing: reference catalog build skipped")
        return 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        rows = dict(pool.map(signature, range(1, 23)))
    available = {str(k): v for k, v in sorted(rows.items()) if v}
    # Incomplete catalogs are allowed; clients still have user-guide Lv3..Lv8.
    if len(available) < 4:
        print("Remote charm reference unavailable; local Lv3..8 fallback only.")
        return 0
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps({
        "source": "https://kingshotoptimizer.com/charms/references/",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "class": "infantry",
        "shape_only": True,
        "levels": available
    }, separators=(",", ":")))
    print(f"Charm signatures built: {len(available)}/22 shape-only levels")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
