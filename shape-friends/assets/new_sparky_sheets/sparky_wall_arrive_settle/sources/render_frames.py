from pathlib import Path
import json,math,struct,zlib
import numpy as np
from PIL import Image,ImageDraw,ImageCms
from scipy.interpolate import RBFInterpolator
from scipy.ndimage import map_coordinates,label,binary_dilation
ROOT=Path(__file__).resolve().parents[1]
BASE=np.array(Image.open(ROOT/'sources/master_neutral.png').convert('RGBA'))
KEY=np.array(Image.open(ROOT/'sources/prepare_key_aligned.png').convert('RGBA'))
Y,X=np.mgrid[:512,:512];profile=ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
def pm(a):
 a=a.astype(float)/255;return np.dstack((a[:,:,:3]*a[:,:,3,None],a[:,:,3]))
def rgba(p):
 a=np.clip(p[:,:,3],0,1);c=np.divide(p[:,:,:3],a[:,:,None],out=np.zeros_like(p[:,:,:3]),where=a[:,:,None]>1e-8)
 out=np.uint8(np.round(np.dstack((np.clip(c,0,1),a))*255));out[out[:,:,3]==0,:3]=0;return out
P=pm(BASE);Q=pm(KEY)
# Head is the approved drawing throughout. Torso, knees and feet have separate motion controls.
HM=((Y<216)&(X>184)&((Y<208)|(X>219))).astype(float)
HEAD=P*HM[:,:,None]
def polygon(points):
 im=Image.new('L',(512,512));ImageDraw.Draw(im).polygon(points,fill=255);return np.array(im,float)/255
SM0=polygon([(190,328),(197,319),(217,322),(230,334),(241,353),(234,366),(218,373),(178,373),(171,360),(176,343)])
SM1=polygon([(251,347),(260,331),(278,330),(296,340),(308,365),(300,382),(265,383),(247,367)])
SH0=P*SM0[:,:,None];SH1=P*SM1[:,:,None]
BODY=P*(1-HM[:,:,None])*(1-SM0[:,:,None])*(1-SM1[:,:,None])
def shoe(p,cx,cy,dx,dy,angle):
 t=math.radians(angle);sx=cx+(X-cx-dx)*math.cos(t)+(Y-cy-dy)*math.sin(t);sy=cy-(X-cx-dx)*math.sin(t)+(Y-cy-dy)*math.cos(t)
 out=np.zeros_like(p)
 for k in range(4):out[:,:,k]=map_coordinates(p[:,:,k],[sy,sx],order=1,mode='constant',cval=0)
 return out

N=np.array([[120,205],[400,205],[120,405],[400,405],[230,213],[294,213],[238,226],[302,226],
 [187,229],[163,183],[340,289],[310,268],[256,256],[226,261],[290,262],[256,300],
 [215,287],[274,296],[196,307],[298,314],[210,323],[278,333],[209,333],[278,341],[198,354],[276,362],
 [172,378],[312,386],[175,265],[320,352]],float)
# Measured/visually traced garment cage from the new bent-knee drawing; no generated face/props/shoes are used.
K=N.copy();K[12:16]=[[256,248],[224,251],[293,253],[256,278]]
K[16:26]=[[219,272],[274,281],[199,282],[303,298],[224,301],[285,312],[228,313],[285,320],[229,334],[289,340]]
mask=Image.new('L',(512,512));ImageDraw.Draw(mask).polygon([(190,254),(242,249),(301,261),(311,312),(285,320),(251,316),(224,308),(199,306),(188,291)],fill=255)
KM=np.array(mask,float)/255
KP=Q*KM[:,:,None]
vy,vx=np.mgrid[159:398,125:397];queries=np.c_[vx.ravel(),vy.ravel()]
def warp(p,src,dst):
 r=RBFInterpolator(dst,src-dst,kernel='thin_plate_spline',smoothing=0)(queries);c=queries+r;out=np.zeros_like(p)
 for k in range(4):out[159:398,125:397,k]=map_coordinates(p[:,:,k],[c[:,1],c[:,0]],order=1,mode='constant',cval=0).reshape(vx.shape)
 return out
seatY=[278,282,286,290,294,297,299,300,300,300,300,300,300,300,300,300,300,300,300,300]
leg=[1,.98,.95,.9,.84,.77,.7,.62,.53,.4,.25,.12,.06,.025,.01,.005,.002,.001,.0003,0]
headY=[-3,-2.8,-2.4,-2,-1.4,-.8,-.3,0,1.8,1.5,1,.7,.35,.2,.12,.06,.03,.02,.01,0]
compression=[0,0,0,0,0,0,0,0,.02,.014,.006,0,0,0,0,0,0,0,0,0]
handHover=[14,13,11,9,6,3,1,0,0,0,0,0,0,0,0,0,0,0,0,0]
wandY=[-5,-4.5,-4,-3.2,-2.4,-1.6,-.8,0,.5,.4,.3,.2,.12,.06,.03,.02,0,0,0,0]
pend=[0,0,0,0,0,0,0,0,0,0,0,.5,2,1.1,.4,.12,.03,.01,.001,0]
records=[];frames=[]
for i in range(20):
 if i==19:a=BASE.copy()
 else:
  d=N.copy();h=seatY[i]-300;g=leg[i]
  d[4:8,1]+=headY[i]*.6
  d[8:10,1]+=wandY[i];d[10,1]-=handHover[i]
  d[12:15,1]+=h*.4;d[15,1]=seatY[i]
  d[16:26,1]+=g*np.array([-9,-10,-19,-20,-26,-28,-30,-31,-37,-40])
  d[16:26,0]+=g*np.array([4,1,8,-1,6,2,9,3,16,9])
  d[24:26,0]+=pend[i]*.5;d[24:26,1]-=pend[i]
  # Soft compression is local to the trunk: no full-frame scaling or second bounce.
  d[4:8,1]+=compression[i]*75;d[12:15,1]+=compression[i]*28
  b=warp(BODY,N,d)
  # Action-specific knee folds replace only the registered trousers, fading into neutral folds.
  if i<11:
   trousers=warp(KP,K,d);mix=max(0,(10-i)/10)*.7
   b=trousers*mix+b*(1-trousers[:,:,3,None]*mix)
  sl=shoe(SH0,198,354,16*g+pend[i]*.5,-37*g-pend[i],-8*g-pend[i]*.5)
  sr=shoe(SH1,276,362,9*g+pend[i]*.5,-40*g-pend[i],7*g+pend[i]*.4)
  b=sl+b*(1-sl[:,:,3,None]);b=sr+b*(1-sr[:,:,3,None])
  # The original head is translated by a compact follow-through; its outline, eye proportions and smile are never regenerated.
  hd=np.zeros_like(HEAD)
  for k in range(4):hd[:,:,k]=map_coordinates(HEAD[:,:,k],[Y-headY[i],X],order=1,mode='constant',cval=0)
  tipAmt=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,.12,.35,.2,.06,.01,0][i]
  if tipAmt:
   u=np.clip((X-255)/64,0,1);v=np.clip((Y-28)/80,0,1);field=np.sin(np.pi*u)**2*np.sin(np.pi*v)**2*((X>255)&(X<319)&(Y>28)&(Y<108))
   for k in range(4):hd[:,:,k]=map_coordinates(hd[:,:,k],[Y+tipAmt*.55*field,X-tipAmt*.35*field],order=1,mode='constant',cval=0)
  gaze=[1,1,1,1,1,1,.9,.85,.8,.75,.7,.6,.4,.2,0,0,0,0,0,0][i]
  if gaze:
   def bell(x0,y0,x1,y1):
    u=np.clip((X-x0)/(x1-x0),0,1);v=np.clip((Y-y0)/(y1-y0),0,1);return np.sin(np.pi*u)**2*np.sin(np.pi*v)**2*((X>x0)&(X<x1)&(Y>y0)&(Y<y1))
   eyeField=bell(221,137+headY[i],250,179+headY[i])+bell(282,142+headY[i],315,187+headY[i])
   for k in range(4):hd[:,:,k]=map_coordinates(hd[:,:,k],[Y-gaze*.85*eyeField,X],order=1,mode='constant',cval=0)
  a=rgba(hd+b*(1-hd[:,:,3,None]))
  # Mouth region follows the rigid head; pelvis is exactly registered after contact.
  if i>=7:a[294:307,250:265]=BASE[294:307,250:265]
  lab,n=label(a[:,:,3]>4);sz=np.bincount(lab.ravel());keep=binary_dilation(lab==(1+sz[1:].argmax()),iterations=2);a[~keep]=0
  a[a[:,:,3]==0,:3]=0
 im=Image.fromarray(a,'RGBA');name=f'sparky_wall_arrive_settle_{i:03d}.png';im.save(ROOT/name,icc_profile=profile);frames.append(im)
 def centroid(m):
  yy,xx=np.where(m);assert len(xx)>0;return [round(float(xx.mean()),3),round(float(yy.mean()),3)]
 rgb=a[:,:,:3].astype(float);alpha=a[:,:,3]>200
 white=(rgb.min(2)>180)&((rgb.max(2)-rgb.min(2))<65)&alpha
 gold=(rgb[:,:,0]>200)&(rgb[:,:,1]>145)&(rgb[:,:,2]<120)&alpha
 dark=(rgb.max(2)<100)&alpha;blue=(rgb[:,:,2]>70)&(rgb[:,:,2]>rgb[:,:,0]*1.45)&(rgb[:,:,0]<90)&alpha
 def box(x0,y0,x1,y1):return (X>=x0)&(X<x1)&(Y>=y0)&(Y<y1)
 anchors={'seatAnchor':[256,seatY[i]],'mouthAnchor':centroid(dark&box(248,173+headY[i],279,190+headY[i])),'wandHandPivot':centroid(white&box(165,207+wandY[i],203,257+wandY[i])),'wandTip':centroid(gold&box(142,165+wandY[i],183,200+wandY[i])),
 'balanceHand':centroid(white&box(312,265,378,309)),'leftFoot':centroid(blue&box(172+leg[i]*16,339-leg[i]*37-pend[i],241+leg[i]*16,379-leg[i]*37-pend[i])),'rightFoot':centroid(blue&box(248+leg[i]*9,345-leg[i]*40-pend[i],308+leg[i]*9,383-leg[i]*40-pend[i]))}
 records.append({'index':i,'file':name,'durationMs':1000/24,'seatState':'approaching' if i<7 else 'seated','anchors':anchors,'boundingBox':list(im.getchannel('A').getbbox())})
atlas=Image.new('RGBA',(2560,2048));contact=Image.new('RGB',(1120,960),'#f7efdf');dc=ImageDraw.Draw(contact)
for i,im in enumerate(frames):
 atlas.paste(im,(i%5*512,i//5*512));sm=im.resize((208,208),Image.Resampling.LANCZOS);x=i%5*224+8;y=i//5*240+4;contact.paste(sm,(x,y),sm);dc.text((x+3,y+214),f'{i:03d}'+(' SEAT_CONTACT' if i==7 else ' NEUTRAL_HANDOFF' if i==19 else ''),fill='#263651')
atlas.save(ROOT/'sparky_wall_arrive_settle_atlas.png',icc_profile=profile);contact.save(ROOT/'contact_sheet.png',icc_profile=profile)
dur=[1000/24]*20
frames[0].save(ROOT/'transparent_preview.png',save_all=True,append_images=frames[1:],duration=dur,loop=1,disposal=0,blend=0,icc_profile=profile)
# APNG uses exact rational 1/24-second delays, avoiding millisecond rounding.
ap=ROOT/'transparent_preview.png';data=ap.read_bytes();encoded=data[:8];pos=8;nframes=0
while pos<len(data):
 n=struct.unpack('>I',data[pos:pos+4])[0];typ=data[pos+4:pos+8];chunk=data[pos+8:pos+8+n]
 if typ==b'fcTL':chunk=chunk[:20]+struct.pack('>HH',1,24)+chunk[24:];nframes+=1
 encoded+=struct.pack('>I',len(chunk))+typ+chunk+struct.pack('>I',zlib.crc32(typ+chunk)&0xffffffff);pos+=12+n
assert nframes==20;ap.write_bytes(encoded)

def wall(im,small=False):
 if not small:
  bg=Image.new('RGB',(640,560),'#f7efdf');d=ImageDraw.Draw(bg);d.rectangle((42,340,598,510),fill='#cdbba1');d.rectangle((42,340,598,347),fill='#e3d3bc');bg.paste(im,(64,40),im)
 else:
  bg=Image.new('RGB',(260,240),'#f7efdf');d=ImageDraw.Draw(bg);dim=146;line=round(55+300*dim/512);d.rectangle((30,line,230,210),fill='#cdbba1');d.rectangle((30,line,230,line+2),fill='#e3d3bc');sm=im.resize((dim,dim),Image.Resampling.LANCZOS);bg.paste(sm,(55,55),sm)
 return bg
ws=[wall(im) for im in frames];ss=[wall(im,True) for im in frames]
ws[0].save(ROOT/'wall_composite_preview.png',save_all=True,append_images=ws[1:]+[ws[-1]],duration=dur+[1200],loop=0)
ss[0].save(ROOT/'preview_100px.png',save_all=True,append_images=ss[1:]+[ss[-1]],duration=dur+[1200],loop=0)
strip=Image.new('RGB',(640,560*20));[strip.paste(v,(0,j*560)) for j,v in enumerate(ws)];pal=strip.quantize(colors=240)
gif=[v.quantize(palette=pal,dither=Image.Dither.NONE) for v in ws];gif[0].save(ROOT/'wall_composite_preview.gif',save_all=True,append_images=gif[1:]+[gif[-1]],duration=dur+[1200],loop=0,disposal=1)
sg=[v.quantize(palette=pal,dither=Image.Dither.NONE) for v in ss];sg[0].save(ROOT/'preview_100px.gif',save_all=True,append_images=sg[1:]+[sg[-1]],duration=dur+[1200],loop=0,disposal=1)
vdir=ROOT/'sources/video_frames';vdir.mkdir(exist_ok=True)
for j,i in enumerate(list(range(20))+[19]*30):ws[i].save(vdir/f'{j:04d}.png')
# Handoff preview uses the actual approved idle sequence after arrival.
id=[Image.open(ROOT/'sources/approved_idle_reference'/f'sparky_wall_idle_blink_{i:03d}.png').convert('RGBA') for i in range(16)]
idur=[900,120,120,160,140,450,70,42,42,42,84,42,42,42,180,850]
seq=ws+[wall(v) for v in id];seq[0].save(ROOT/'arrive_idle_preview.png',save_all=True,append_images=seq[1:],duration=dur+idur,loop=0)
edge=Image.new('RGB',(1024,512))
for j,col in enumerate(['#f7efdf','#122445']):
 bg=Image.new('RGB',(512,512),col);bg.paste(frames[8],(0,0),frames[8]);edge.paste(bg,(j*512,0))
edge.save(ROOT/'edge_check.png')
manifest={'clip':'sparky_wall_arrive_settle','canvas':{'width':512,'height':512},'frameRate':24,'durationMs':20*1000/24,'colorSpace':'sRGB','alphaFormat':'straight/unmatted RGBA','coordinateSystem':'top-left, frame-local pixels','wallPlaneY':300,
 'loop':{'enabled':False,'mode':'one-shot'},'events':{'SEAT_CONTACT':7,'NEUTRAL_HANDOFF':19},'safeHandoffFrames':[19],
 'construction':'Rigged draft: original head, torso, props, gloves and shoes with independent body/joint controls; generated action-specific trouser folds. Compact descent to maintain original scale and 24px padding. Not 20 independently redrawn poses.',
 'anchorMeasurement':'seatAnchor is an authored registration path, fixed (256,300) from frame007. Other anchors are measured pixel centroids from exported art (dark smile, white wand grip/balance glove, gold wand star, blue shoe pixels). They are raster feature measurements, not claimed anatomical joints.',
 'facialActingStatus':'Original eyes use a tiny local downward-gaze deformation and return to neutral. Not separately drawn gaze in-betweens.',
 'frames':records,'atlas':{'file':'sparky_wall_arrive_settle_atlas.png','columns':5,'rows':4,'cellWidth':512,'cellHeight':512},'productionStatus':'Export-ready rigged draft; trouser drawing transitions, gaze refinement and actual game placement need production review.'}
(ROOT/'animation-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
assert np.array_equal(np.array(frames[-1]),BASE)
for i,r in enumerate(records):
 b=r['boundingBox'];assert min(b[0],b[1],512-b[2],512-b[3])>=24,(i,b)
 if i>=7:assert np.array_equal(np.array(frames[i])[294:307,250:265],BASE[294:307,250:265]),i
qa={'frames':20,'transparentAPNGDelay':{'numerator':1,'denominator':24,'frameCount':20},'canvas512':True,'atlasSize':[2560,2048],'finalFramePixelIdenticalToIdle000':True,'minimumPaddingPx':min(min(r['boundingBox'][0],r['boundingBox'][1],512-r['boundingBox'][2],512-r['boundingBox'][3]) for r in records),'fixedPelvisPatchAfterSeatContact':True,'uniqueRasterFrames':len({np.array(v).tobytes() for v in frames}),'facialActing':'original eye art with local downward-gaze deformation; no independent facial-acting drawings'}
(ROOT/'qa-report.json').write_text(json.dumps(qa,indent=2)+'\n');print(json.dumps(qa,indent=2))
