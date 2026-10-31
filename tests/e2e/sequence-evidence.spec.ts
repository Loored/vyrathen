import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync,copyFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {INITIAL_SAVE} from '../../src/data/demo';
import {pilotFixture} from '../fixtures/pilot-scenarios';
import {openPilot,sceneView,seekPilot,inspectPose,outcomeFixture} from './pilot-helpers';
import {frameFullScene,renderedBodies} from './sequence-helpers';
const sha=process.env.EVIDENCE_SHA||execFileSync('git',['rev-parse','HEAD']).toString().trim();
const phase=process.env.EVIDENCE_PHASE||'after',dir=`output/playwright/sequence-${phase}`;
test.use({video:{mode:'on',size:{width:1366,height:768}}});
for(const [width,height] of [[1366,768],[1440,900],[1920,1080],[320,720]])test(`sequence candidate ${width}x${height}`,async({page})=>{
 test.setTimeout(60000);await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'no-preference'});
 mkdirSync(dir,{recursive:true});mkdirSync('output/playwright/pilot-art',{recursive:true});
 for(const name of ['nyra-sequence.png','grim-sequence.png','grim-repaired.png','manifest.json'])if(existsSync(`public/combat-pilot/${name}`))copyFileSync(`public/combat-pilot/${name}`,`output/playwright/pilot-art/${name}`);
 let battle=pilotFixture(),fixture='patrulla-1024',captures:unknown[]=[];
 await openPilot(page,battle);await sceneView(page);await seekPilot(page,battle,0);
 const prefix=`${dir}/${process.platform}-${width}x${height}`;
 async function capture(state:string){
  await page.evaluate(async()=>{await document.fonts.ready;await new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r())));});
  const bodies=state==='missing-art'?[]:await frameFullScene(page);
  const visual=await page.getByLabel('Escena piloto 2D').evaluate(el=>({...((el as HTMLElement).dataset)}));
  const cursor=Number(await page.getByLabel('Reproducción del encuentro').getAttribute('data-cursor'));
  captures.push({state,sha,fixture,seed:battle.seed,cursor,eventId:battle.trace?.events[cursor]?.eventId,actionId:battle.trace?.events[cursor]?.actionId,visual,bodies,viewport:{width,height},reducedMotion:await page.evaluate(()=>matchMedia('(prefers-reduced-motion:reduce)').matches)});
  await page.screenshot({path:`${prefix}-${state}.png`});
  writeFileSync(`${prefix}.json`,JSON.stringify({sha,phase,status:'candidate-not-baseline',captures},null,2));
 }
 const enhanced=await page.getByLabel('Escena piloto 2D').getAttribute('data-clip');
 for(const [pose,name] of [['anticipation','preparation'],['action','execution'],['contact','contact'],['reaction','reaction'],['recovery','recovery'],['rest','rest']]){
  await inspectPose(page,enhanced?pose:pose==='contact'?'reaction':pose==='recovery'?'rest':pose);await capture(name);
 }
 await page.getByLabel('Mostrar anclas de depuración').check();await inspectPose(page,'action');await capture('anchors');await page.getByLabel('Mostrar anclas de depuración').uncheck();
 await page.emulateMedia({reducedMotion:'reduce'});await inspectPose(page,'reaction');await capture('reduced');
 const dodge=outcomeFixture('dodged');battle=dodge.battle;fixture=`patrulla-${dodge.seed}-dodge`;
 await page.evaluate(save=>localStorage.setItem('vyrathen-v01',JSON.stringify(save)),{...INITIAL_SAVE,battles:3,seed:battle.seed,lastBattle:battle});await openPilot(page,battle);await sceneView(page);await seekPilot(page,battle,dodge.cursor);await inspectPose(page,'reaction');await expect(page.locator('[data-pilot-id="e3"]')).toHaveAttribute('data-pose','dodge');await capture('grim-dodge');
 battle=pilotFixture('grim-fragile');fixture='grim-hp70-1024';await page.evaluate(save=>localStorage.setItem('vyrathen-v01',JSON.stringify(save)),{...INITIAL_SAVE,battles:3,seed:battle.seed,lastBattle:battle});await openPilot(page,battle);await sceneView(page);await seekPilot(page,battle,1);await expect(page.locator('[data-pilot-id="e3"]')).toHaveAttribute('data-pose','ko');await capture('grim-ko');
 await page.route('**/combat-pilot/*.png',r=>r.abort());await openPilot(page,battle);await sceneView(page);await seekPilot(page,battle,0);
 await expect(page.locator('[data-art="fallback"]')).toHaveCount(2);
 await page.getByLabel('Escena piloto 2D').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 await capture('missing-art');
});

test('sequence vídeo normal complete crossing with full scene and body bounds',async({page},info)=>{
 const videoStarted=Date.now();test.setTimeout(30000);await page.emulateMedia({reducedMotion:'no-preference'});await openPilot(page);await sceneView(page);await frameFullScene(page);
 const before=await page.evaluate(()=>localStorage.getItem('vyrathen-v01'));
 await page.getByRole('button',{name:'Continuar reproducción'}).click();
 await expect(page.getByLabel('Reproducción del encuentro')).toHaveAttribute('data-cursor','0',{timeout:6000});
 // Record the complete 2500ms event uninterrupted. The renderer supplies no timers to data.
 const samples=[],start=Date.now(),attackVideoOffsetSeconds=(start-videoStarted)/1000;while(Date.now()-start<2100){samples.push({bodies:await frameFullScene(page),elapsed:Date.now()-start});await page.waitForTimeout(100);}
 await page.getByRole('button',{name:'Pausar',exact:true}).click();
 expect(await page.evaluate(()=>localStorage.getItem('vyrathen-v01'))).toBe(before);
 mkdirSync(dir,{recursive:true});const path=`${dir}/${process.platform}-normal-video.json`;writeFileSync(path,JSON.stringify({sha,phase,attackVideoOffsetSeconds,fixture:'patrulla-1024',eventId:pilotFixture().trace!.events[0].eventId,actionId:'a1',status:'candidate',samples},null,2));await info.attach('body-bounds',{path,contentType:'application/json'});const video=page.video()!;await page.close();await video.saveAs(`${dir}/${process.platform}-normal.webm`);
});
