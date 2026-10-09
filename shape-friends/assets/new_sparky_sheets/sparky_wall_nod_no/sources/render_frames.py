from pathlib import Path
import json,math,shutil,hashlib
import numpy as np
from PIL import Image,ImageDraw,ImageCms
from scipy.ndimage import map_coordinates
R=Path(__file__).resolve().parents[1]
PROFILE=ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
MASTER=R/'sources/approved_idle_000.png';BASE=np.array(Image.open(MASTER).convert('RGBA'))
Y,X=np.mgrid[:512,:512]
RGB=BASE[:,:,:3].astype(float);AL=BASE[:,:,3]>200
def centroid(mask):
 y,x=np.where(mask);assert len(x);return [round(float(x.mean()),4),round(float(y.mean()),4)]
def box(x0,y0,x1,y1):return (X>=x0)&(X<x1)&(Y>=y0)&(Y<y1)
def measure(a):
 rgb=a[:,:,:3].astype(float);opaque=a[:,:,3]>200
 white=(rgb.min(2)>180)&(rgb.max(2)-rgb.min(2)<65)&opaque
 dark=(rgb.max(2)<100)&opaque
 gold=(rgb[:,:,0]>200)&(rgb[:,:,1]>145)&(rgb[:,:,2]<120)&opaque
 blue=(rgb[:,:,2]>70)&(rgb[:,:,2]>rgb[:,:,0]*1.45)&(rgb[:,:,0]<90)&opaque
 neck=(rgb[:,:,0]>205)&(rgb[:,:,1]>150)&(rgb[:,:,2]<150)&opaque
 return {'seatAnchor':[256,300],'mouthAnchor':centroid(dark&box(248,173,279,190)),
 'headPivot':centroid(neck&box(248,207,282,222)),'wandHandPivot':centroid(white&box(165,207,203,257)),
 'wandTip':centroid(gold&box(142,165,183,200)),'gloveAnchors':{'viewerLeft':centroid(white&box(165,207,203,257)),'viewerRight':centroid(white&box(313,275,376,306))},
 'shoeAnchors':{'viewerLeft':centroid(blue&box(172,339,241,379)),'viewerRight':centroid(blue&box(248,345,308,383))}}
ANCHORS=measure(BASE);(R/'sources/measured_reference_anchors.json').write_text(json.dumps(ANCHORS,indent=2)+'\n')
P=BASE.astype(float)/255;P[:,:,:3]*=P[:,:,3,None]
def rgba(p):
 a=np.clip(p[:,:,3],0,1);rgb=np.divide(p[:,:,:3],a[:,:,None],out=np.zeros_like(p[:,:,:3]),where=a[:,:,None]>1e-8)
 q=np.uint8(np.round(np.dstack((np.clip(rgb,0,1),a))*255));q[q[:,:,3]==0,:3]=0;return q
def ease(a,b,v):
 t=np.clip((v-a)/(b-a),0,1);return t*t*(3-2*t)
headArea=(X>=174)&(X<390)&(Y<211)
mouthDistance=np.sqrt(((X-261.4842)/18)**2+((Y-180.6842)/13)**2)
mouthProtect=ease(.7,1.7,mouthDistance)
neckBlend=1-ease(196,211,Y)
weight=neckBlend*mouthProtect*headArea*ease(184,205,X)
# Rotation about the measured upper-neck proxy; local mouth pin preserves the exact smile.
def bell(x0,y0,x1,y1):
 u=np.clip((X-x0)/(x1-x0),0,1);v=np.clip((Y-y0)/(y1-y0),0,1);return np.sin(np.pi*u)**2*np.sin(np.pi*v)**2*box(x0,y0,x1,y1)
BW0=bell(223,115,253,143);BW1=bell(281,122,316,148)
def pupil(cx,cy,rx,ry,ex,ey,erx,ery):
 rr=np.sqrt(((X-cx)/rx)**2+((Y-cy)/ry)**2);e=np.sqrt(((X-ex)/erx)**2+((Y-ey)/ery)**2)
 return np.clip((1.25-rr)/.5,0,1)*np.clip((.96-e)/.13,0,1)
EF=pupil(235,158,13,17,229,156,20,21)+pupil(298,164,15,18,305,164,23,23)
# Canvas positive angle turns the top toward viewer-left.
ANGLES=[0,0,2,4,0,-4,-3.5,-1.6,1.5,0,0,0]
TIP_LAG=[0,0,-.2,-.5,.45,.5,.15,-.4,-.3,.3,.12,0]
BROWS=[0,.7,.6,.45,.45,.4,.4,.45,.5,.45,.12,0]
GAZE=[0,-.6,-1,-.35,.75,.45,.1,-.15,-.15,0,0,0]
DUR=[120,67,67,83,67,83,100,67,67,100,67,120]
tipWeight=np.exp(-((X-294)/25)**2-((Y-42)/26)**2)
PROP_ZONE=box(140,164,184,205)|box(162,196,194,215)|box(162,204,207,262)
PROP_LOCK=PROP_ZONE
LOCK=box(248,173,279,189)|box(248,207,282,222)|PROP_LOCK|(Y>=211)
def draw(i):
 if i in [0,11]:return BASE.copy()
 theta=math.radians(ANGLES[i]);cx,cy=ANCHORS['headPivot']
 rx=cx+(X-cx)*math.cos(theta)+(Y-cy)*math.sin(theta)
 ry=cy-(X-cx)*math.sin(theta)+(Y-cy)*math.cos(theta)
 sx=X+(rx-X)*weight-GAZE[i]*EF-TIP_LAG[i]*tipWeight
 sy=Y+(ry-Y)*weight+BROWS[i]*(BW0+BW1)
 out=np.stack([map_coordinates(P[:,:,k],[sy,sx],order=1,mode='constant',cval=0) for k in range(4)],2)
 aa=rgba(out);aa[~headArea]=BASE[~headArea];aa[LOCK]=BASE[LOCK];aa[aa[:,:,3]==0,:3]=0;return aa
frames=[];records=[]
for i in range(12):
 a=draw(i);p=R/f'sparky_wall_nod_no_{i:03d}.png'
 if i in [0,11]:shutil.copyfile(MASTER,p)
 else:Image.fromarray(a).save(p,icc_profile=PROFILE)
 with Image.open(p) as im:im.load();assert im.size==(512,512) and im.mode=='RGBA';assert im.info.get('icc_profile');assert np.array_equal(np.array(im),a)
 im=Image.fromarray(a);frames.append(im);anc=measure(a);assert anc==ANCHORS,(i,anc,ANCHORS)
 bb=list(im.getchannel('A').getbbox());assert min(bb[0],bb[1],512-bb[2],512-bb[3])>=24
 assert np.array_equal(a[Y>=211],BASE[Y>=211]);assert np.array_equal(a[LOCK],BASE[LOCK])
 records.append({'index':i,'file':p.name,'durationMs':DUR[i],**anc,'characterBounds':bb,'headRotationDegrees':ANGLES[i],'rotationHasLocalMouthCompensation':True,'flameTipFollowThroughPixels':TIP_LAG[i]})
atlas=Image.new('RGBA',(2048,1536));review=Image.new('RGB',(896,720),'#f7efdf');dr=ImageDraw.Draw(review)
for i,im in enumerate(frames):
 atlas.paste(im,(i%4*512,i//4*512));s=im.resize((208,208),Image.Resampling.LANCZOS);x=i%4*224+8;y=i//4*240+4;review.paste(s,(x,y),s);marker=' NO_BEAT' if i==6 else ' TRY_AGAIN' if i==9 else ' NEUTRAL' if i in [0,11] else '';dr.text((x,y+214),f'{i:03d}{marker}',fill='#263951')
atlas.save(R/'atlas.png',icc_profile=PROFILE);review.save(R/'contact_sheet.png',icc_profile=PROFILE)
aa=np.array(Image.open(R/'atlas.png'));assert aa.shape==(1536,2048,4)
for i,im in enumerate(frames):assert np.array_equal(aa[i//4*512:(i//4+1)*512,i%4*512:(i%4+1)*512],np.array(im))
def apng(path,fs,ds):fs[0].save(path,save_all=True,append_images=fs[1:],duration=ds,loop=1,disposal=0,blend=0,icc_profile=PROFILE)
def gif(path,fs,ds,loop=None):
 strip=Image.new('RGB',(fs[0].width,fs[0].height*len(fs)));[strip.paste(v,(0,j*v.height)) for j,v in enumerate(fs)];pal=strip.quantize(colors=240)
 f=[v.quantize(palette=pal,dither=Image.Dither.NONE) for v in fs];opts={'loop':loop} if loop is not None else {};f[0].save(path,save_all=True,append_images=f[1:],duration=ds,disposal=1,**opts)
def wall(im,height=350):
 dim=round(512*height/350)
 if height==350:
  b=Image.new('RGB',(640,560),'#f7efdf');d=ImageDraw.Draw(b);d.rectangle((42,340,598,510),fill='#cdbba1');d.rectangle((42,340,598,347),fill='#e3d3bc');b.paste(im,(64,40),im)
 else:
  b=Image.new('RGB',(240,220),'#f7efdf');d=ImageDraw.Draw(b);x=(240-dim)//2;y=32;line=round(y+300*dim/512);d.rectangle((20,line,220,206),fill='#cdbba1');d.rectangle((20,line,220,line+2),fill='#e3d3bc');s=im.resize((dim,dim),Image.Resampling.LANCZOS);b.paste(s,(x,y),s)
 return b
apng(R/'transparent_one_shot.png',frames,DUR)
timeline=[frames[0]]+frames+[frames[11]];times=[1500]+DUR+[2000]
wallframes=[wall(v) for v in timeline];apng(R/'idle_nod_idle_wall.png',wallframes,times);gif(R/'idle_nod_idle_wall.gif',wallframes,times)
small=[wall(v,100) for v in timeline];gif(R/'preview_100px.gif',small,times);apng(R/'preview_100px.png',small,times)
# Additional review only: repeated100px nod with long neutral intervals, not a fast loop.
gif(R/'review_100px_repeated.gif',small,times,loop=0)
edge=Image.new('RGB',(1024,512))
for i,color in enumerate(['#f7efdf','#162b46']):
 b=Image.new('RGB',(512,512),color);b.paste(frames[3],(0,0),frames[3]);edge.paste(b,(i*512,0))
edge.save(R/'edge_review_peak.png')
peak=Image.new('RGB',(768,256),'#f7efdf');pd=ImageDraw.Draw(peak)
for j,i in enumerate([0,3,5]):
 im=frames[i].crop((180,20,380,213)).resize((240,232),Image.Resampling.LANCZOS);peak.paste(im,(j*256,0),im);pd.text((j*256+12,237),f'Frame{i:03d}',fill='#263951')
peak.save(R/'head_pose_review.png')
minpad=min(min(p['characterBounds'][0],p['characterBounds'][1],512-p['characterBounds'][2],512-p['characterBounds'][3]) for p in records)
qa={'decodedRuntimePngs':12,'canvas':[512,512],'atlas':[2048,1536],'atlasCellComparisons':12,'startAndEndFileBytesMatchApprovedIdle':(R/'sparky_wall_nod_no_000.png').read_bytes()==MASTER.read_bytes()==(R/'sparky_wall_nod_no_011.png').read_bytes(),'allMeasuredAnchorsIdentical':True,'allPixelsBelow211IdenticalToMaster':True,'mouthPatchWandHandsFeetLocked':True,'minimumPaddingPx':minpad,'durationMs':sum(DUR),'actualGameTested':False,'rigLimit':'In-plane neck-centered rotation with local pinned-mouth compensation, not a rigid3D yaw. A fixed canvas mouth requires that local compensation.','generatedPoseStudyUsedAsRuntimeReplacement':False}
(R/'qa-report.json').write_text(json.dumps(qa,indent=2)+'\n')
manifest={'clip':'sparky_wall_nod_no','frameCount':12,'canvas':[512,512],'colorSpace':'sRGB','alpha':'straight RGBA','coordinateSystem':'top-left, frame-local pixels','wallPlaneY':300,'durationMs':sum(DUR),'atlas':{'file':'atlas.png','dimensions':[2048,1536],'grid':[4,3],'cellSize':[512,512],'spacing':0},'events':{'NO_BEAT':6,'TRY_AGAIN_HOLD':9,'NEUTRAL_HANDOFF':11},'frames':records,'loop':False,'safeHandoffFrames':[0,11],'preview':'One-shot APNG preserves per-frame milliseconds; GIF timings are rounded by the GIF format to10ms resolution. Wall review adds1500ms neutral before and2000ms after.','anchorMeasurement':'SeatAnchor[256,300] is supplied authored registration, not estimated anatomy. Mouth and props/gloves/shoes are measured opaque-pixel centroids within specified semantic windows. HeadPivot is a measured yellow upper-neck region centroid, a2D rig proxy rather than an inferred physical joint. WandTip is the attached gold star centroid. Bounds have exclusive right/bottom.','construction':'Identity-preserving original-art neck-centered head rotation with local mouth compensation, small pupil/brow acknowledgement and delayed flame tip. Body and closed mouth are pixel-locked. Generated pose study is retained as a guide only because using it as the replacement master would change identity. These are local rig in-betweens, not12 independently hand-drawn full characters.','constraintResolution':'Rigid neck rotation and a fixed canvas mouth pivot cannot both hold. This drawing rig prioritizes the specified fixed mouth pivot; outer head rotates up to4degrees in the image plane while the smile and lower connection remain pinned. This is not certified3D yaw.','productionStatus':'Technical export validated. Head-shake readability and acting require animator approval; not tested in the running game.','qaReport':'qa-report.json'}
(R/'animation-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(qa,indent=2))
