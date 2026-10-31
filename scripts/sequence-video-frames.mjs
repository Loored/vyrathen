import {existsSync,readdirSync,mkdirSync,readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {homedir} from 'node:os';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const root='output/playwright';
const files=path=>existsSync(path)?readdirSync(path,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(path,e.name)):[join(path,e.name)]):[];
const standardCache=join(homedir(),process.platform==='darwin'?'Library/Caches/ms-playwright':'.cache/ms-playwright');
const localCache=join(dirname(createRequire(import.meta.url).resolve('playwright-core/package.json')),'.local-browsers');
const caches=[localCache,standardCache,process.env.PLAYWRIGHT_BROWSERS_PATH].filter(p=>p&&existsSync(p));
const bundled=caches.flatMap(cache=>readdirSync(cache).filter(s=>s.startsWith('ffmpeg-')).sort().reverse().map(s=>join(cache,s,process.platform==='darwin'?'ffmpeg-mac':'ffmpeg-linux'))).find(existsSync);
const ffmpeg=process.env.FFMPEG_PATH||bundled||'ffmpeg',records=[];
for(const phase of ['before','after']){
 const metadata=files(`${root}/sequence-${phase}`).find(p=>p.endsWith('normal-video.json'));
 const video=files(`${root}/sequence-${phase}`).find(p=>p.endsWith('normal.webm'));
 if(!metadata||!video){records.push({phase,status:'missing-video-or-metadata'});continue;}
 const meta=JSON.parse(readFileSync(metadata,'utf8')),dir=`${root}/sequence-video-frames/${phase}`;mkdirSync(dir,{recursive:true});
 try{
  for(const path of files(dir))if(/\/frame-\d+\.png$/.test(path))unlinkSync(path);
  // Decode the whole recording at 10 fps. This includes every >=140ms beat and avoids
  // relying on the approximate test-body/encoder offset to find the attack's beginning.
  execFileSync(ffmpeg,['-loglevel','error','-y','-i',video,'-r','10',`${dir}/frame-%03d.png`],{stdio:'pipe'});
  const frames=files(dir).filter(p=>p.endsWith('.png')&&/frame-\d{3}\.png$/.test(p)).sort();
  if(!frames.length)throw Error('Decoder produced no frames');
  for(const [i,path] of frames.entries())records.push({phase,sha:meta.sha,video,seconds:i/10,path,status:'decoded'});
 }catch(error){records.push({phase,status:'decoder-unavailable',detail:String(error.message).slice(0,250)});}
}
mkdirSync(root,{recursive:true});writeFileSync(`${root}/sequence-video-frames.json`,JSON.stringify(records,null,2));
console.log(JSON.stringify(records.reduce((counts,r)=>({...counts,[r.status]:(counts[r.status]||0)+1}),{})));
if(process.env.CI&&records.some(r=>r.phase==='after'&&r.status!=='decoded'))process.exitCode=1;
