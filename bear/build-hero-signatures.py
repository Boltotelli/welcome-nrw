#!/usr/bin/env python3
"""Build tiny hero portrait fingerprints from existing credited wiki links.
No game screenshots, raw portraits or provider credentials are persisted.
"""
import base64
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
import json
from pathlib import Path
import re
import sys
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parent
catalog=ROOT.joinpath('catalog.js').read_text(encoding='utf-8')
data=json.loads(re.search(r'window\.NRW_BEAR_CATALOG\s*=\s*(\{.*\})\s*;',catalog,re.S).group(1))

def get(hero):
    url=hero['img']
    req=Request(url,headers={'User-Agent':'Mozilla/5.0 NRW Bear Setup/1.0'})
    try:
        with urlopen(req,timeout=12) as res:
            raw=res.read(3000000)
        pic=Image.open(BytesIO(raw)).convert('RGB')
        pic=ImageOps.fit(pic,(12,12),method=Image.Resampling.LANCZOS)
        return {'name':hero['name'],'rgb':base64.b64encode(pic.tobytes()).decode('ascii')}
    except Exception:
        return None

def main():
    dst=Path(sys.argv[1])
    output=[]
    with ThreadPoolExecutor(max_workers=8) as pool:
        pending=[pool.submit(get,h) for h in data['heroes']]
        for future in as_completed(pending):
            item=future.result()
            if item:output.append(item)
    dst.write_text(json.dumps({'source':'Kingshot wiki catalog hero images','size':12,'portraits':sorted(output,key=lambda p:p['name'])},separators=(',',':')),encoding='utf-8')
    print(f'Hero fingerprints built: {len(output)}/{len(data["heroes"])}')

if __name__=='__main__':
    main()
