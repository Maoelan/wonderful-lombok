"""Create responsive WebP delivery variants from generated source images.

Usage: python scripts/build-demo-images.py path/to/private-input-map.json
The input maps manifest keys to local source filenames and is never committed.
"""
import json
import sys
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
target = root / 'static' / 'images' / 'lombok-ai'
inputs = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
manifest = json.loads((target / 'manifest.json').read_text(encoding='utf-8'))
for asset in manifest['assets']:
    key = asset['key']
    with Image.open(inputs[key]) as source:
        source = source.convert('RGB')
        for width in (480, 720, 960, 1280, 1600):
            height = round(source.height * width / source.width)
            source.resize((width, height), Image.Resampling.LANCZOS).save(
                target / f'{key}-{width}.webp', 'WEBP', quality=80, method=6)
    print(key)
