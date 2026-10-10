import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cards=fileURLToPath(new URL('../assets/cards/',import.meta.url));
const filters='color=c=0x102b59:s=256x256,format=rgba[bg];[0:v]scale=180:180,format=rgba,lutrgb=r=90:g=225:b=255[bone];[bg][bone]overlay=38:38,drawgrid=w=48:h=48:t=1:c=0x65e8ff@0.14,drawbox=x=8:y=8:w=240:h=240:color=0x65e8ff@0.9:t=5';
const result=spawnSync('ffmpeg',['-loglevel','error','-y','-i',`${cards}/bone.png`,'-filter_complex',filters,'-frames:v','1',`${cards}/xray.png`],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
