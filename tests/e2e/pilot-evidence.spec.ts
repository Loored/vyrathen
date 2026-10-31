import { test, expect } from '@playwright/test';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { INITIAL_SAVE } from '../../src/data/demo';
import { pilotFixture } from '../fixtures/pilot-scenarios';
import { frameFullScene } from './sequence-helpers';
import { inspectPose, openPilot, sceneView, seekPilot } from './pilot-helpers';

test.use({ video:{ mode:'on',size:{width:1366,height:768} } });
const sha=process.env.EVIDENCE_SHA||execFileSync('git',['rev-parse','HEAD']).toString().trim();
for(const [width,height] of [[1366,768],[1440,900],[1920,1080],[320,720]])test(`pilot candidate ${width}x${height}: tactical, poses, K.O., reduced motion and fallback`,async({page},info)=>{
  test.setTimeout(60000);
  await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'no-preference'});
  let battle=pilotFixture(),fixture='production-demo-patrulla-1024';
  await openPilot(page,battle);
  const dir='output/playwright/pilot-after';mkdirSync(dir,{recursive:true});
  mkdirSync('output/playwright/pilot-art',{recursive:true});
  for(const name of ['nyra-poses.png','grim-poses.png','manifest.json'])copyFileSync(`public/combat-pilot/${name}`,`output/playwright/pilot-art/${name}`);
  const prefix=`${dir}/${process.platform}-${width}x${height}`,captures:unknown[]=[];
  async function capture(state:string){
    await expect(page.getByRole('button',{name:'Pausar',exact:true})).toHaveCount(0);
    // Never await animation.finished: inspection cancels transient motion, including paused CSS.
    await page.evaluate(async()=>{await document.fonts.ready;window.scrollTo({top:0,behavior:'instant'});await new Promise<void>(done=>requestAnimationFrame(()=>requestAnimationFrame(()=>done())));});
    const metadata=await page.evaluate(()=>{
      const root=document.querySelector<HTMLElement>('.vyr-combat')!,scene=root.querySelector<HTMLElement>('.vyr-pilot-scene');
      return {cursor:Number(root.dataset.cursor),view:root.dataset.view,phase:scene?.dataset.phase??null,visualSerial:scene?.dataset.visualSerial??null,
        animated:scene?.dataset.animated??null,actorId:scene?.dataset.actorId??null,targetId:scene?.dataset.targetId??null,actionId:scene?.dataset.actionId??null,
        poses:[...root.querySelectorAll<HTMLElement>('[data-pilot-id]')].map(el=>({id:el.dataset.pilotId,pose:el.dataset.pose,art:el.dataset.art,ko:el.dataset.ko??false})),
        controlRect:(()=>{const r=root.querySelector<HTMLButtonElement>('button[aria-label],button')?.getBoundingClientRect();return r?{top:r.top,bottom:r.bottom}:null})(),
        dimensions:{width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight},
        reducedMotion:matchMedia('(prefers-reduced-motion:reduce)').matches,fonts:document.fonts.status};
    });
    expect(metadata.dimensions.scrollWidth).toBe(width);
    captures.push({state,fixture,seed:battle.seed,eventId:battle.rounds.flatMap(r=>r.events)[metadata.cursor]?.id??null,recordVersion:battle.trace?.version??null,...metadata});
    for(const fullPage of [false,true]){
      const path=`${prefix}-${state}-${fullPage?'full':'viewport'}.png`;await page.screenshot({path,fullPage,animations:'disabled'});await info.attach(state,{path,contentType:'image/png'});
    }
    writeFileSync(`${prefix}.json`,JSON.stringify({sha,base:'b86a9765ef51aa24fdaab1ea915daaaee1c897ab',status:'candidate_pending_owner_art_review',captures},null,2));
  }
  await capture('tactical-idle');await sceneView(page);await capture('scene-idle');
  await page.locator('.vyr-pilot-inspection summary').click();
  await page.getByLabel('Encuadre de revisión').selectOption('compact');await capture('scene-compact');await page.getByLabel('Encuadre de revisión').selectOption('expanded');
  await page.getByLabel('Mostrar anclas de depuración').check();await capture('scene-anchor-debug');await page.getByLabel('Mostrar anclas de depuración').uncheck();
  await seekPilot(page,battle,0);
  await page.getByRole('button',{name:'Vista táctica',exact:true}).click();await capture('tactical-power');
  await sceneView(page);
  for(const [phase,name] of [['anticipation','scene-anticipation'],['action','scene-action'],['reaction','scene-impact']]){await inspectPose(page,phase);await capture(name);}
  await page.emulateMedia({reducedMotion:'reduce'});await capture('scene-reduced');
  await page.route('**/combat-pilot/*.png',route=>route.abort());
  await openPilot(page,battle);await sceneView(page);await seekPilot(page,battle,0);await inspectPose(page,'reaction');await capture('scene-art-fallback');
  await page.unroute('**/combat-pilot/*.png');
  battle=pilotFixture('grim-fragile');fixture='test-only-patrulla-grim-hp70-1024';
  await page.evaluate(save=>localStorage.setItem('vyrathen-v01',JSON.stringify(save)),{...INITIAL_SAVE,battles:3,lastBattle:battle});
  await openPilot(page,battle);await seekPilot(page,battle,1);
  await capture('tactical-ko');await sceneView(page);await capture('scene-ko');
  await page.getByRole('button',{name:'Avanzar un evento'}).click();await capture('scene-ko-later');
  await page.getByRole('button',{name:'Ir al final'}).click();await capture('scene-final');
  const legacy=JSON.parse(readFileSync(new URL('../fixtures/combat-v01-1024.json',import.meta.url),'utf8'));
  battle=legacy;fixture='actual-pre-v02-patrulla-1024';
  await page.evaluate(save=>localStorage.setItem('vyrathen-v01',JSON.stringify(save)),{...INITIAL_SAVE,battles:3,lastBattle:legacy});
  await openPilot(page,legacy);await capture('legacy-fallback');
});

test('pilot vídeo normal: both actors, pause/resume, view switch, round and restart',async({page})=>{
  test.setTimeout(45000);await page.emulateMedia({reducedMotion:'no-preference'});
  const battle=pilotFixture();await openPilot(page,battle);await sceneView(page);
  async function frameScene(){
    await frameFullScene(page);
  }
  await frameScene();
  await page.getByRole('button',{name:'Continuar reproducción'}).click();
  await expect(page.getByLabel('Reproducción del encuentro')).toHaveAttribute('data-cursor','0',{timeout:6000});
  await page.waitForTimeout(850);await page.getByRole('button',{name:'Pausar',exact:true}).click();await page.waitForTimeout(300);
  await page.getByRole('button',{name:'Continuar reproducción'}).click();await page.waitForTimeout(350);await page.getByRole('button',{name:'Pausar',exact:true}).click();
  await page.getByRole('button',{name:'Vista táctica',exact:true}).click();await sceneView(page);
  const grim=battle.trace!.events.findIndex(r=>r.actorId==='e3'&&r.attempt);
  expect(grim).toBeGreaterThan(0);await seekPilot(page,battle,grim-1);
  await frameScene();
  await page.getByRole('button',{name:'Continuar reproducción'}).click();
  await expect(page.getByLabel('Reproducción del encuentro')).toHaveAttribute('data-cursor',String(grim),{timeout:6000});
  await expect(page.getByLabel('Escena piloto 2D')).toBeInViewport();
  await page.waitForTimeout(1100);await page.getByRole('button',{name:'Pausar',exact:true}).click();
  await page.getByLabel('Inspeccionar ronda').selectOption('5');await frameScene();await page.waitForTimeout(400);
  await page.getByRole('button',{name:'Reiniciar reproducción'}).click();await frameScene();await page.waitForTimeout(500);
});
