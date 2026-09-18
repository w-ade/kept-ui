"""Copy folders of images into a Kept lab collection.

Writes web-sized copies (metadata stripped) to public/collections/<id>/{full,thumb}/ and a manifest
of the originals' file facts to src/kept/data/<id>.json. Originals are never modified.

Usage: python3 scripts/import-images.py <collection-id> <folder> [<folder> ...]
"""
import hashlib, json, os, sys
from PIL import Image, ImageOps

FULL, THUMB = 1600, 480
EXTS = {'.jpg', '.jpeg', '.png', '.webp'}
TYPES = {'JPEG': 'JPEG', 'PNG': 'PNG', 'WEBP': 'WebP', 'MPO': 'JPEG'}

collection, folders = sys.argv[1], sys.argv[2:]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'public', 'collections', collection)
os.makedirs(os.path.join(out, 'full'), exist_ok=True)
os.makedirs(os.path.join(out, 'thumb'), exist_ok=True)

seen, items = set(), []
for folder in folders:
    for name in sorted(os.listdir(folder)):
        path = os.path.join(folder, name)
        if os.path.splitext(name)[1].lower() not in EXTS or not os.path.isfile(path):
            continue
        data = open(path, 'rb').read()
        digest = hashlib.sha1(data).hexdigest()
        if digest in seen:
            print('skip duplicate', name)
            continue
        seen.add(digest)
        with Image.open(path) as im:
            kind = TYPES.get(im.format, im.format)
            im = ImageOps.exif_transpose(im).convert('RGB')
            width, height = im.size
            stem = f'{len(items) + 1:03d}'
            for size, sub in ((FULL, 'full'), (THUMB, 'thumb')):
                copy = im.copy()
                copy.thumbnail((size, size), Image.LANCZOS)
                # Saving without exif/icc drops camera and location metadata.
                copy.save(os.path.join(out, sub, stem + '.jpg'), 'JPEG', quality=82, optimize=True, progressive=True)
        items.append({'file': stem + '.jpg', 'fileName': name, 'fileType': kind,
                      'width': width, 'height': height, 'bytes': len(data)})

os.makedirs(os.path.join(root, 'src', 'kept', 'data'), exist_ok=True)
with open(os.path.join(root, 'src', 'kept', 'data', collection + '.json'), 'w') as f:
    json.dump(items, f, indent=1)
print(len(items), 'images ->', out)
