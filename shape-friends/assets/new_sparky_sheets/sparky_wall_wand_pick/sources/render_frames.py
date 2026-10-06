from pathlib import Path
import math,json,shutil
import numpy as np
from PIL import Image,ImageDraw,ImageCms
from scipy.ndimage import map_coordinates
from scipy.interpolate import RBFInterpolator
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT.parent
BASE=np.array(Image.open(ROOT/'sources/master_neutral.png').convert('RGBA'))
Y,X=np.mgrid[:512,:512];profile=ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
def pm(a):
 a=a.astype(float)/255;return np.dstack((a[:,:,:3]*a[:,:,3,None],a[:,:,3]))
def rgba(p):
 al=np.clip(p[:,:,3],0,1);c=np.divide(p[:,:,:3],al[:,:,None],out=np.zeros_like(p[:,:,:3]),where=al[:,:,None]>1e-8)
 a=np.uint8(np.round(np.dstack((np.clip(c,0,1),al))*255));a[a[:,:,3]==0,:3]=0;return a
def poly(points):
 im=Image.new('L',(512,512));ImageDraw.Draw(im).polygon(points,fill=255);return np.array(im,float)/255
def sample(p,sx,sy):
 return np.stack([map_coordinates(p[:,:,k],[sy,sx],order=1,mode='constant',cval=0) for k in range(4)],2)
def over(front,back):return front+back*(1-front[:,:,3,None])
P=pm(BASE)
WM=poly([(139,161),(184,161),(184,207),(195,208),(204,218),(217,230),(217,244),(209,273),(186,280),(160,253),(154,218),(139,205)])
WM*=np.where(X>207,np.clip((219-X)/12,0,1),1)
WP=P*WM[:,:,None]
def wand(back,angle):
 if angle==0:return back.copy(),X,Y
 th=math.radians(angle);cx,cy=211,230
 sx=cx+(X-cx)*math.cos(th)+(Y-cy)*math.sin(th);sy=cy-(X-cx)*math.sin(th)+(Y-cy)*math.cos(th)
 layer=sample(WP,sx,sy);back=back*(1-(WM>=.999)[:,:,None]);return over(layer,back),sx,sy
FM=poly([(291,216),(292,235),(295,252),(299,267),(306,282),(306,303),(395,303),(395,216)])
FM*=np.where(Y<266,np.clip((X-291)/8,0,1),1)
HM=poly([(289,188),(307,187),(317,195),(321,213),(317,227),(313,241),(299,237),(291,227),(282,218),(280,207),(285,198)])
RESTHM=poly([(324,276),(343,273),(360,280),(371,286),(371,296),(358,303),(340,302),(324,296),(317,286)])
T=np.array([[275,175],[397,175],[397,310],[275,310],[296,220],[300,237],[306,256],[320,272],[337,260],[316,237]],float)
S=T.copy();S[4:]=np.array([[296,220],[300,237],[307,260],[310,288],[334,269],[335,280]])
yy,xx=np.mgrid[175:310,275:397];queries=np.c_[xx.ravel(),yy.ravel()]
def warp_sleeve(src,ctrl,dst):
 d=RBFInterpolator(dst,ctrl-dst,kernel='thin_plate_spline',smoothing=3)(queries);c=queries+d;o=np.zeros_like(src)
 for k in range(4):o[175:310,275:397,k]=map_coordinates(src[:,:,k],[c[:,1],c[:,0]],order=1,mode='constant',cval=0).reshape(xx.shape)
 return o
def rigid_hand(src,src_center,dst_center,angle):
 th=math.radians(angle);cx,cy=dst_center;ox,oy=src_center
 sx=ox+(X-cx)*math.cos(th)+(Y-cy)*math.sin(th);sy=oy-(X-cx)*math.sin(th)+(Y-cy)*math.cos(th)
 return sample(src,sx,sy)
def free_arm(choose,t):
 if t>=1:return choose.copy()
 if t<=0:return P.copy()
 warm=(choose[:,:,0]>choose[:,:,2]*1.4)&(choose[:,:,0]>.36)
 handMask=HM.copy();handMask[warm]=0
 glove=choose*handMask[:,:,None]
 fullMask=FM.copy();fullMask=np.maximum(fullMask,handMask)
 # Only the chin glove and attached sleeve are removed; the neutral torso is the back plate.
 back=P*(1-(FM>=.999)[:,:,None])
 sleeve=choose*FM[:,:,None]*(1-HM[:,:,None])
 dest=S*(1-t)+T*t
 sl=warp_sleeve(sleeve,T,dest) if t>=.6 else warp_sleeve(P*FM[:,:,None]*(1-RESTHM[:,:,None]),S,dest)
 pos=(345+(302-345)*t-4*math.sin(math.pi*t),289+(212-289)*t)
 sl[(Y>pos[1]+12)&(X>313)]=0
 h=rigid_hand(glove,(302,212),pos,-65*(1-t)) if t>=.3 else rigid_hand(P*RESTHM[:,:,None],(345,289),pos,20*t)
 return over(h,over(sl,back))
LOCK=[(248,173,279,189),(174,300,309,384),(248,280,280,310)]
angles=[0,1,3,5,8,11,14,11,-22,-39,-57,-66,-70,-71,-71,-71,-71,-69,-58,-42,-24,-9,-2,0]
armT=[1]*18+[.93,.73,.47,.22,.07,0]
headT=[1]*18+[.96,.86,.65,.34,.12,0]
ticks=[6,1,1,1,1,1,2,1,1,1,1,1,1,2,8,8,8,2,1,1,1,1,2,12]
duration=[n*1000/24 for n in ticks]
VAR={'left':0,'center':-7,'right':-14}
allFrames={};variants={}
def measured(a,sx,sy):
 rgb=a[:,:,:3].astype(float);al=a[:,:,3]>200
 white=(rgb.min(2)>180)&((rgb.max(2)-rgb.min(2))<65)&al
 gold=(rgb[:,:,0]>200)&(rgb[:,:,1]>145)&(rgb[:,:,2]<120)&al
 dark=(rgb.max(2)<100)&al
 def box(x0,y0,x1,y1,rx=X,ry=Y):return (rx>=x0)&(rx<x1)&(ry>=y0)&(ry<y1)
 def cen(m):
  yy,xx=np.where(m);assert len(xx)>0;return [round(float(xx.mean()),3),round(float(yy.mean()),3)]
 return {'seatAnchor':[256,300],'mouthAnchor':cen(dark&box(248,173,279,190)),
 'wandHandPivot':cen(white&box(165,207,203,257,sx,sy)),
 'wandTip':cen(gold&box(142,165,183,200,sx,sy))}
def wall(im,small=False):
 if small:
  b=Image.new('RGB',(260,240),'#f7efdf');d=ImageDraw.Draw(b);dim=146;line=round(55+300*dim/512);d.rectangle((30,line,230,210),fill='#cdbba1');d.rectangle((30,line,230,line+2),fill='#e3d3bc');sm=im.resize((dim,dim),Image.Resampling.LANCZOS);b.paste(sm,(55,55),sm)
 else:
  b=Image.new('RGB',(640,560),'#f7efdf');d=ImageDraw.Draw(b);d.rectangle((42,340,598,510),fill='#cdbba1');d.rectangle((42,340,598,347),fill='#e3d3bc');b.paste(im,(64,40),im)
 return b
for variant,offset in VAR.items():
 path=ROOT/'sources'/f'choose_hold_{variant}.png'
 chooseA=np.array(Image.open(path).convert('RGBA'));C=pm(chooseA)
 (ROOT/variant).mkdir(exist_ok=True)
 fs=[];records=[]
 for i in range(24):
  ang=angles[i]+offset*math.sin(math.pi*i/23)**2
  if i in [14,15,16]:ang=angles[14]+offset*math.sin(math.pi*14/23)**2
  if i==0:a=chooseA.copy();sx,sy=X,Y
  elif i==23:a=BASE.copy();sx,sy=X,Y
  else:
   p=C.copy() if i<18 else free_arm(C,armT[i])
   if i>=18:
    # Return the exact head drawing through a small local registration deformation.
    h=headT[i];th=math.radians((-2 if variant=='left' else 2)*h);cx,cy=261.484,180.684
    w=np.clip((216-Y)/18,0,1)*((X>184)&(X<380)&(Y<216)&((Y<208)|(X>219)))
    dist=np.maximum(np.abs(X-cx)/24,np.abs(Y-cy)/17);w*=np.clip((dist-.7)/.55,0,1)
    rx=cx+(X-cx)*math.cos(th)+(Y-cy)*math.sin(th);ry=cy-(X-cx)*math.sin(th)+(Y-cy)*math.cos(th)
    head=sample(P,X+(rx-X)*w,Y+(ry-Y)*w)
    region=(Y<188)|((Y<216)&(X<280))|((Y<195)&(X>325))
    p[region]=head[region]
   p,sx,sy=wand(p,ang);a=rgba(p)
   from scipy.ndimage import label,binary_dilation
   lab,n=label(a[:,:,3]>4);sizes=np.bincount(lab.ravel());keep=binary_dilation(lab==(1+sizes[1:].argmax()),iterations=2);a[~keep]=0
   for x0,y0,x1,y1 in LOCK:a[y0:y1,x0:x1]=BASE[y0:y1,x0:x1]
  name=f'sparky_wall_wand_pick_{variant}_{i:03d}.png';im=Image.fromarray(a,'RGBA');im.save(ROOT/variant/name,icc_profile=profile);fs.append(im)
  records.append({'index':i,'file':f'{variant}/{name}','target':variant,'durationMs':round(duration[i],6),'previewTicks24fps':ticks[i],'wandRotationDegrees':round(ang,5),'anchors':measured(a,sx,sy),'boundingBox':list(im.getchannel('A').getbbox())})
 atlas=Image.new('RGBA',(3072,2048));sheet=Image.new('RGB',(1344,960),'#f7efdf');d=ImageDraw.Draw(sheet)
 for i,im in enumerate(fs):
  atlas.paste(im,(i%6*512,i//6*512));sm=im.resize((208,208),Image.Resampling.LANCZOS);x=i%6*224+8;y=i//6*240+4;sheet.paste(sm,(x,y),sm);d.text((x,y+214),f'{variant} {i:03d}'+(' RELEASE' if i==10 else ' WAIT' if 14<=i<=16 else ''),fill='#253951')
 atlas.save(ROOT/f'atlas_{variant}.png',icc_profile=profile);sheet.save(ROOT/f'contact_sheet_{variant}.png',icc_profile=profile)
 fs[0].save(ROOT/f'transparent_preview_{variant}.png',save_all=True,append_images=fs[1:],duration=duration,loop=1,disposal=0,blend=0,icc_profile=profile)
 walls=[wall(im) for im in fs];walls[0].save(ROOT/f'wall_preview_{variant}.png',save_all=True,append_images=walls[1:],duration=duration,loop=0)
 vd=ROOT/'sources'/f'video_frames_{variant}';vd.mkdir(exist_ok=True)
 for j,i in enumerate([i for i,n in enumerate(ticks) for _ in range(n)]):walls[i].save(vd/f'{j:04d}.png')
 allFrames[variant]=fs;variants[variant]={'frames':records,'CHOOSE_HOLD':0,'CAST_RELEASE':10,'STAR_WAIT_HOLD':[14,15,16],'safeRestartFrame':23,'neutralHandoff':23,'atlas':{'file':f'atlas_{variant}.png','columns':6,'rows':4,'cellSize':[512,512]}}
comp=[]
for i in range(24):
 b=Image.new('RGB',(780,264),'#f7efdf');d=ImageDraw.Draw(b)
 for j,v in enumerate(VAR):b.paste(wall(allFrames[v][i],True),(j*260,24));d.text((j*260+105,8),v,fill='#263951')
 comp.append(b)
pal=Image.new('RGB',(780,264*24));[pal.paste(v,(0,j*264)) for j,v in enumerate(comp)];pal=pal.quantize(colors=240)
gf=[v.quantize(palette=pal,dither=Image.Dither.NONE) for v in comp];gf[0].save(ROOT/'variants_100px.gif',save_all=True,append_images=gf[1:],duration=duration,loop=0,disposal=1)
manifest={'clip':'sparky_wall_wand_pick','canvas':[512,512],'colorSpace':'sRGB','alpha':'straight RGBA','coordinateSystem':'top-left, frame-local pixels','frameRate':24,'wallPlaneY':300,'durationMs':sum(duration),'events':{'CAST_RELEASE':10,'STAR_WAIT_HOLD':[14,15,16],'CONTACT_RESPONSE':17,'SAFE_RESTART':23},'variants':variants,
 'holdPolicy':'Emit exactly one separate code-driven star on first entry to010 at that frame wandTip. Hold014,015 or016 until the separate star contacts its target; contact triggers card flip/sound and resume017. Do not use a timer for contact or repeat release while paused. Home cancels; pause freezes. Restart at023 neutral.',
 'anchorMeasurement':'Seat(256,300) is inherited authored registration, not inferred anatomy. Other anchors measured from exported pixels: dark smile centroid, white wand-grip centroid, gold wand-star centroid. wandTip denotes center of the attached gold star for effect spawning. Source masks rotate at unit scale.',
 'construction':'Approved source masters; local rigid wand/glove/forearm rotation at unit scale, local sleeve and glove recovery deformation. Rigged draft, not72 independently hand-drawn frames.',
 'productionStatus':'Visual review and actual game integration required; finger securing and elbow anticipation are approximated by the local rig.'}
(ROOT/'animation-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
qa={'frames':72,'startMatchesChooseHold':True,'endMatchesNeutral':True,'waitFramesPixelIdentical':True,'lockedSeatMouthFeet':True,'minimumPaddingPx':512}
for v,fs in allFrames.items():
 aa=[np.array(im) for im in fs];src=np.array(Image.open(ROOT/'sources'/f'choose_hold_{v}.png'))
 assert np.array_equal(aa[0],src) and np.array_equal(aa[23],BASE)
 assert np.array_equal(aa[14],aa[15]) and np.array_equal(aa[15],aa[16])
 for i,a in enumerate(aa):
  b=variants[v]['frames'][i]['boundingBox'];pad=min(b[0],b[1],512-b[2],512-b[3]);qa['minimumPaddingPx']=min(qa['minimumPaddingPx'],pad);assert pad>=24,(v,i,b)
  for x0,y0,x1,y1 in LOCK:assert np.array_equal(a[y0:y1,x0:x1],BASE[y0:y1,x0:x1]),(v,i,'lock')
 lengths=[float(np.linalg.norm(np.array(r['anchors']['wandTip'])-r['anchors']['wandHandPivot'])) for r in variants[v]['frames']]
 qa[v+'WandCentroidDistanceRange']=[min(lengths),max(lengths)];assert max(lengths)-min(lengths)<.85,(v,lengths)
(ROOT/'qa-report.json').write_text(json.dumps(qa,indent=2)+'\n');print(json.dumps(qa,indent=2))
