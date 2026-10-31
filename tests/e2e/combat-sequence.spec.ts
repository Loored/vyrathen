import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {CLIP_STARTS,CLIP_ID,NYRA_DRAWINGS,GRIM_DRAWINGS,GRIM_REPAIRS} from '../../src/features/combat/pilotClip';
import {openPilot,sceneView,inspectPose} from './pilot-helpers';
import {frameFullScene} from './sequence-helpers';

test('all thirteen beats render once on the shared animation, pause/resume retains time and resources',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await openPilot(page);await sceneView(page);
 const save=await page.evaluate(()=>localStorage.getItem('vyrathen-v01'));
 await page.getByRole('button',{name:'Avanzar un evento'}).click();
 for(const phase of ['anticipation','action','contact','reaction','recovery','rest']){
  await inspectPose(page,phase);
  for(const id of ['h4','e3'])expect(await page.locator(`[data-pilot-id="${id}"]`).getAttribute('data-pose')).toBe(await page.locator(`[data-render-id="${id}"]`).getAttribute('data-render-pose'));
 }
 await page.getByRole('button',{name:'Reiniciar reproducción'}).click();
 await page.getByRole('button',{name:'Continuar reproducción'}).click();
 await expect(page.getByLabel('Reproducción del encuentro')).toHaveAttribute('data-cursor','0',{timeout:6000});
 await page.getByRole('button',{name:'Pausar',exact:true}).click();
 const scene=page.getByLabel('Escena piloto 2D');await expect(scene).toHaveAttribute('data-clip',CLIP_ID);
 expect(await scene.evaluate(el=>el.querySelector('.vyr-pilot-sequence')!.getAnimations()[0].effect!.getComputedTiming().duration)).toBe(2100);
 const serial=await scene.getAttribute('data-visual-serial'),resources=await page.locator('.vyr-combat-resources').allTextContents();
 for(const [i,start] of CLIP_STARTS.entries()){
  // Test inspection of the CSS clock only, never a callback into the data/player clock.
  const visible=await scene.evaluate((el,ms)=>{const a=el.querySelector('.vyr-pilot-sequence')!.getAnimations();if(a.length!==1)throw Error('Expected one visual clock');a[0].currentTime=ms;return [...el.querySelectorAll<HTMLElement>('.vyr-pilot-beat')].filter(g=>Number(getComputedStyle(g).opacity)>.5).map(g=>Number(g.dataset.beat));},start+12);
  expect(visible).toEqual([i]);await frameFullScene(page);
 }
 expect(await page.locator('.vyr-combat-resources').allTextContents()).toEqual(resources);
 await scene.evaluate(el=>{el.querySelector('.vyr-pilot-sequence')!.getAnimations()[0].currentTime=900;});
 await page.getByRole('button',{name:'Continuar reproducción'}).click();await page.waitForTimeout(180);await page.getByRole('button',{name:'Pausar',exact:true}).click();
 await expect(scene).toHaveAttribute('data-visual-serial',serial!);
 expect(await scene.evaluate(el=>Number(el.querySelector('.vyr-pilot-sequence')!.getAnimations()[0].currentTime))).toBeGreaterThan(1000);
 expect(await page.evaluate(()=>localStorage.getItem('vyrathen-v01'))).toBe(save);
 await page.emulateMedia({reducedMotion:'reduce'});expect(await scene.evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
 expect(await scene.locator('[data-clip-step="6"]').evaluate(el=>getComputedStyle(el).opacity)).toBe('1');
});

test('supplemental PNG alpha pixels fit calibrated bounds with transparent margins and complete repair cutouts',async({page})=>{
 for(const drawing of [...NYRA_DRAWINGS,...GRIM_DRAWINGS,...Object.values(GRIM_REPAIRS)]){
  const data=readFileSync(`public${drawing.src}`).toString('base64');
  const bounds=await page.evaluate(async({data,drawing})=>{
   const im=new Image();im.src=`data:image/png;base64,${data}`;await im.decode();const c=document.createElement('canvas');c.width=512;c.height=512;const ctx=c.getContext('2d')!;ctx.drawImage(im,-drawing.column*512,-drawing.row*512);
   const d=ctx.getImageData(0,0,512,512).data;let l=512,t=512,r=0,b=0,transparent=0;
   for(let y=0;y<512;y++)for(let x=0;x<512;x++){const a=d[(y*512+x)*4+3];if(a===0)transparent++;if(a>32){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x+1);b=Math.max(b,y+1);}}
   return {l,t,r,b,transparent};
  },{data,drawing});
  expect(bounds.transparent).toBeGreaterThan(512*512/2);
  expect(bounds.l).toBeGreaterThan(1);expect(bounds.t).toBeGreaterThan(1);expect(bounds.r).toBeLessThan(511);expect(bounds.b).toBeLessThan(511);
  expect(bounds.l).toBeGreaterThanOrEqual(drawing.anchors.bounds[0]);expect(bounds.t).toBeGreaterThanOrEqual(drawing.anchors.bounds[1]);expect(bounds.r).toBeLessThanOrEqual(drawing.anchors.bounds[2]);expect(bounds.b).toBeLessThanOrEqual(drawing.anchors.bounds[3]);
 }
});

test('missing supplemental art keeps the original participant and post-event data with honest fallback',async({page})=>{
 await page.route('**/combat-pilot/nyra-sequence.png',r=>r.abort());await openPilot(page);await sceneView(page);
 await page.getByRole('button',{name:'Avanzar un evento'}).click();
 await expect(page.locator('[data-pilot-id="h4"]')).toHaveAttribute('data-art','fallback');
 await expect(page.locator('[data-pilot-id="e3"]')).toHaveAttribute('data-art','ready');
 await expect(page.locator('[data-fighter-id="e3"] [data-resource="HP"]')).toHaveText('HP 317/405');
 await expect(page.getByText('Arte no disponible',{exact:true})).toHaveCount(1);
 await page.getByRole('button',{name:'Reiniciar reproducción'}).click();await expect(page.getByLabel('Reproducción del encuentro')).toHaveAttribute('data-cursor','-1');
});
