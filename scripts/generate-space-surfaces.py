#!/usr/bin/env python3
"""Developer-only offline PNG generation (Pillow). No runtime dependency or remote requests.
Coastlines: Natural Earth 1:110m public domain, retained in scripts/data. Colors are stylized,
not elevation/season/vegetation measurements. Clouds/craters are original illustrative art.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter
import json,math,random,sys
root=Path(__file__).resolve().parent.parent
out=Path(sys.argv[1]) if len(sys.argv)>1 else root/'public/assets/space';out.mkdir(parents=True,exist_ok=True)
w,h=1024,512
mask=Image.new('L',(w,h));d=ImageDraw.Draw(mask)
for f in json.loads((root/'scripts/data/ne_110m_land.geojson').read_text())['features']:
 g=f['geometry'];polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
 for poly in polys:
  for i,ring in enumerate(poly):d.polygon([((lon+180)/360*(w-1),(90-lat)/180*(h-1)) for lon,lat,*_ in ring],fill=255 if i==0 else 0)
img=Image.new('RGB',(w,h));pix=img.load();land=mask.load()
for y in range(h):
 lat=90-y/h*180
 for x in range(w):
  lon=x/w*360-180
  if land[x,y]:
   ice=max(0,min(1,(abs(lat)-58)/18));desert=sum(math.exp(-((lon-a)/dx)**2-((lat-b)/dy)**2)*k for a,b,dx,dy,k in [(12,24,38,12,.82),(135,-25,18,12,.72),(-112,32,14,10,.5)])
   green=(91,143,88);sand=(179,152,96);col=tuple(round(((1-desert)*green[i]+desert*sand[i])*(1-ice)+(226,236,230)[i]*ice) for i in range(3))
  else:col=(24+int(9*abs(lat)/90),80+int(14*abs(lat)/90),142+int(12*abs(lat)/90))
  pix[x,y]=col
img.save(out/'earth.png',optimize=True)
# Fractal cloud cover, not coastlines: fixed seed, smooth puffs, no repeating painted arcs.
rng=random.Random(721);fields=[]
for size in [(16,8),(32,16),(64,32)]:
 layer=Image.new('L',size);layer.putdata([rng.randrange(256) for _ in range(size[0]*size[1])]);tiled=Image.new('L',(size[0]*3,size[1]));[tiled.paste(layer,(i*size[0],0)) for i in range(3)];fields.append(tiled.resize((w*3,h),Image.Resampling.BICUBIC).crop((w,0,w*2,h)))
cloud=Image.new('RGBA',(w,h));cp=cloud.load()
for y in range(h):
 for x in range(w):
  v=sum(field.getpixel((x,y))*weight for field,weight in zip(fields,[.55,.3,.15]))/255
  alpha=round(max(0,min(1,(v-.49)*3.3))*120)
  cp[x,y]=(245,251,255,alpha)
cloud.save(out/'clouds.png',optimize=True)
moon=Image.new('RGB',(w*3,h),(168,170,169));d=ImageDraw.Draw(moon)
for i in range(11):
 x=(i*193+160)%w;y=100+(i*77)%320;r=25+i%4*12
 for shift in [0,w,w*2]:d.ellipse((x+shift-r*1.5,y-r,x+shift+r*1.5,y+r),fill=(126+i%3*5,131+i%3*4,132+i%3*3))
moon=moon.filter(ImageFilter.GaussianBlur(8));d=ImageDraw.Draw(moon)
for i in range(125):
 x=int(((i*.61803398875+.13)%1)*w);y=math.acos(1-2*(i+.5)/125)/math.pi*h;r=3+(i*7)%13
 for shift in [0,w,w*2]:
  d.ellipse((x+shift-r,y-r*.7,x+shift+r,y+r*.7),fill=(157,160,160),outline=(178,180,177),width=2);d.arc((x+shift-r+1,y-r*.7+2,x+shift+r,y+r*.7),15,180,fill=(141,144,146),width=2)
moon.crop((w,0,w*2,h)).save(out/'moon.png',optimize=True)

# Inspect boundary continuity: cloud/terrain must not draw a visible longitude stripe.
for name in ['clouds','moon']:
 im=Image.open(out/(name+'.png'));channels=3 if name=='clouds' else None
 differences=[]
 for y in range(im.height):
  a,b=im.getpixel((0,y)),im.getpixel((im.width-1,y))
  differences.extend([abs(a[3]-b[3])] if channels==3 else [abs(x-y) for x,y in zip(a,b)])
 print(json.dumps({'asset':name,'longitudeEdgeMeanDifference':sum(differences)/len(differences),'longitudeEdgeMaxDifference':max(differences)}))
