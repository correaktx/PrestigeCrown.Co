from PIL import Image
from pathlib import Path
import shutil, os, json, re

root=Path('/mnt/data/pc_site')
src=root/'assets/products'
dst=root/'assets/webp'
dst.mkdir(exist_ok=True)
# Page ranges inferred from the catalog's black brand divider pages.
brands=[
 ('BOSS',4,22),('HUGO',24,40),('KARL LAGERFELD',42,53),('MOSCHINO',55,61),
 ('PSYCHO BUNNY',63,72),('PRADA',74,78),('COACH',80,83),('DOLCE & GABBANA',85,92),
 ('ALEXANDER MCQUEEN',94,98),('ERMENEGILDO ZEGNA',100,104),('M — POR CONFIRMAR',106,114),('Y/OUT',116,125)
]
page_brand={}
for b,a,z in brands:
    for p in range(a,z+1): page_brand[p]=b
products=[]
for p in range(4,126):
    if p not in page_brand: continue
    fn=f'p-{p:03d}.jpg'; s=src/fn
    out=dst/f'{p:03d}.webp'
    im=Image.open(s).convert('RGB')
    # Resize while retaining a crisp catalog look.
    maxw=700
    if im.width>maxw:
        h=round(im.height*maxw/im.width); im=im.resize((maxw,h),Image.Resampling.LANCZOS)
    im.save(out,'WEBP',quality=78,method=6)
    products.append({
      'id':f'PC-{p:03d}','page':p,'brand':page_brand[p],
      'name':f'Referencia PC-{p:03d}','price':120000,
      'image':f'assets/webp/{p:03d}.webp','sizes':['M','L','XL','XXL'],
      'colors':['Negro','Blanco'],'limited':True
    })
(root/'products.json').write_text(json.dumps(products,ensure_ascii=False,indent=2),encoding='utf-8')
print('products',len(products),'webp MB',sum(x.stat().st_size for x in dst.glob('*.webp'))/1e6)
