import {existsSync,readdirSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {homedir} from 'node:os';
import {execFileSync} from 'node:child_process';
const root='output/playwright';
const files=path=>existsSync(path)?readdirSync(path,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(path,e.name)):[join(path,e.name)]):[];
const caches=join(homedir(),process.platform==='darwin'?'Library/Caches/ms-playwright':'.cache/ms-playwright');
const bundled=existsSync(caches)?readdirSync(caches).filter(s=>s.startsWith('ffmpeg-')).sort().reverse().map(s=>join(caches,s,process.platform==='darwin'?'ffmpeg-mac':'ffmpeg-linux')).find(existsSync):undefined;
const ffmpeg=process.env.FFMPEG_PATH||bundled||'ffmpeg';
const records=[];
for(const phase of ['before','after']){
 const metadata=files(`${root}/sequence-${phase}`).find(p=>p.endsWith('normal-video.json'));
 const video=files(`${root}/sequence-${phase}`).find(p=>p.endsWith('normal.webm'));
 if(!metadata||!video){records.push({phase,status:'missing-video-or-metadata'});continue;}
 const meta=JSON.parse(readFileSync(metadata,'utf8')),dir=`${root}/sequence-video-frames/${phase}`;mkdirSync(dir,{recursive:true});
 // Closely spaced actual decoded video frames, not re-rendered screenshots. Offset is
 // approximate (page fixture begins recording just before the test body); inspect the strip.
 for(let i=0;i<18;i++){
  const seconds=Math.max(0,(meta.attackVideoOffsetSeconds||3.5)-.15+i*.15),path=`${dir}/frame-${String(i).padStart(2,'0')}.png`;
  try{execFileSync(ffmpeg,['-loglevel','error','-y','-ss',String(seconds),'-i',video,'-frames:v','1',path],{stdio:'pipe'});records.push({phase,sha:meta.sha,video,seconds,path,status:existsSync(path)?'decoded':'missing-frame'});}
  catch(error){records.push({phase,status:'decoder-unavailable',detail:String(error.message).slice(0,250)});break;}
 }
}
mkdirSync(root,{recursive:true});writeFileSync(`${root}/sequence-video-frames.json`,JSON.stringify(records,null,2));
console.log(JSON.stringify(records.reduce((counts,r)=>({...counts,[r.status]:(counts[r.status]||0)+1}),{})));
