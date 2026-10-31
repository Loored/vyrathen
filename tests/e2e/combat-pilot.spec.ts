import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { pilotFixture } from '../fixtures/pilot-scenarios';
import { inspectPose, openPilot, outcomeFixture, sceneView, seekPilot } from './pilot-helpers';

test('same ten participants, ID roles, stable pose inspection, rapid keyboard/mouse views and unchanged save', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openPilot(page);
  const before = await page.evaluate(() => localStorage.getItem('vyrathen-v01'));
  await expect(page.locator('[data-fighter-id]')).toHaveCount(10);
  const switcher = page.getByRole('button', { name: 'Escena 2D · candidata', exact: true });
  await switcher.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('[data-pilot-id][data-art="ready"]')).toHaveCount(2);
  await expect(page.locator('[data-pilot-id="h4"]')).toHaveAttribute('data-pose','idle');
  await page.getByRole('button', { name:'Avanzar un evento' }).click();
  const scene = page.getByLabel('Escena piloto 2D');
  await expect(scene).toHaveAttribute('data-actor-id','h4');
  await expect(scene).toHaveAttribute('data-target-id','e3');
  await expect(page.locator('[data-pilot-id="h4"]')).toHaveAttribute('data-pose','power');
  await expect(page.locator('[data-pilot-id="e3"]')).toHaveAttribute('data-pose','hit');
  const resources = await page.locator('.vyr-combat-resources').allTextContents();
  for (const phase of ['anticipation','action','reaction']) {
    await inspectPose(page, phase);
    await expect(scene).toHaveAttribute('data-phase',phase);
    await expect(page.getByLabel('Reproducción del encuentro')).toHaveAttribute('data-cursor','0');
    expect(await page.locator('.vyr-combat-resources').allTextContents()).toEqual(resources);
  }
  for (let i=0;i<3;i++) {
    await page.getByRole('button',{name:'Vista táctica',exact:true}).click();
    await switcher.click();
  }
  await expect(scene).toHaveAttribute('data-animated','false');
  await expect(scene).toHaveAttribute('data-phase','rest');
  await expect(page.locator('[data-pilot-id="h4"]')).toHaveAttribute('data-pose','idle');
  await expect(page.locator('[data-fighter-id]')).toHaveCount(10);
  expect(await page.evaluate(() => localStorage.getItem('vyrathen-v01'))).toBe(before);
});

test('pause freezes CSS, resume keeps action serial, view changes preserve timeout and exit cancels', async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'no-preference' });
  await page.addInitScript(() => {
    const tracked = new Set<number>();
    Object.assign(window,{ pilotTimers:tracked });
    const schedule=window.setTimeout.bind(window),cancel=window.clearTimeout.bind(window);
    window.setTimeout=((handler:TimerHandler,delay?:number,...args:unknown[])=>{
      if(delay!==2500)return schedule(handler,delay,...args);
      const id=schedule(()=>{tracked.delete(id);if(typeof handler==='function')handler(...args);},delay);tracked.add(id);return id;
    }) as typeof window.setTimeout;
    window.clearTimeout=id=>{tracked.delete(id!);cancel(id);};
  });
  await openPilot(page); await sceneView(page);
  await page.getByRole('button',{name:'Continuar reproducción'}).click();
  await expect(page.getByLabel('Reproducción del encuentro')).toHaveAttribute('data-cursor','0',{timeout:6000});
  await page.getByRole('button',{name:'Pausar',exact:true}).click();
  const scene=page.getByLabel('Escena piloto 2D');
  const serial=await scene.getAttribute('data-visual-serial');
  const paused=await scene.evaluate(el=>el.getAnimations({subtree:true}).map(a=>({time:Number(a.currentTime),state:a.playState})));
  expect(paused.length).toBeGreaterThan(0); expect(paused.every(a=>a.state==='paused')).toBe(true);
  await page.waitForTimeout(350);
  expect(await scene.evaluate(el=>el.getAnimations({subtree:true}).map(a=>({time:Number(a.currentTime),state:a.playState})))).toEqual(paused);
  await page.getByRole('button',{name:'Continuar reproducción'}).click();
  await expect(scene).toHaveAttribute('data-visual-serial',serial!);
  const readTimers=()=>page.evaluate(()=>[...(window as Window & {pilotTimers:Set<number>}).pilotTimers]);
  const timers=await readTimers(); expect(timers).toHaveLength(1);
  await page.getByRole('button',{name:'Vista táctica',exact:true}).click(); await sceneView(page);
  expect(await readTimers()).toEqual(timers);
  await expect(scene).toHaveAttribute('data-animated','false');
  await page.getByRole('navigation').getByRole('button',{name:'Centro de control',exact:true}).click();
  expect(await readTimers()).toHaveLength(0);
  await page.waitForTimeout(2800);
  await page.getByRole('navigation').getByRole('button',{name:'Simulador de combate',exact:true}).click();
  await expect(page.getByLabel('Reproducción del encuentro')).toHaveAttribute('data-cursor','-1');
  await expect(page.getByLabel('Reproducción del encuentro')).toHaveAttribute('data-view','tactical');
});

for(const kind of ['power','blocked','miss','dodged'] as const)test(`real seeded Nyra → Grim power ${kind}: pose and contact follow recorded outcome`,async({page})=>{
  const fixture=outcomeFixture(kind);
  test.info().annotations.push({type:'fixture',description:`patrulla seed ${fixture.seed} cursor ${fixture.cursor}`});
  await openPilot(page,fixture.battle);await sceneView(page);await seekPilot(page,fixture.battle,fixture.cursor);await inspectPose(page,'event');
  await expect(page.locator('[data-pilot-id="h4"]')).toHaveAttribute('data-pose','power');
  await expect(page.locator('[data-pilot-id="e3"]')).toHaveAttribute('data-pose',kind==='blocked'?'block':kind==='dodged'?'dodge':kind==='miss'?'idle':'hit');
  await expect(page.locator('[data-contact]')).toHaveCount(kind==='miss'||kind==='dodged'?0:1);
  await expect(page.getByLabel('Escena piloto 2D')).toHaveAttribute('data-outcome',kind);
});

test('one visual action for lethal damage and K.O.; restart/final and result change cancel old scene',async({page})=>{
  await openPilot(page,pilotFixture('grim-fragile'));await sceneView(page);
  await page.getByRole('button',{name:'Avanzar un evento'}).click();
  await expect(page.getByLabel('Escena piloto 2D')).toHaveAttribute('data-action-id','a1');
  await expect(page.locator('[data-pilot-id="e3"]')).toHaveAttribute('data-ko','true');
  await page.getByRole('button',{name:'Avanzar un evento'}).click();
  await expect(page.getByLabel('Escena piloto 2D')).not.toHaveAttribute('data-action-id');
  await expect(page.locator('.vyr-pilot-effect')).toHaveCount(0);
  await page.getByRole('button',{name:'Avanzar un evento'}).click();
  await expect(page.locator('[data-pilot-id="e3"]')).toHaveAttribute('data-pose','ko');
  await page.getByRole('button',{name:'Ir al final'}).click();
  await expect(page.locator('[data-pilot-id="e3"]')).toHaveAttribute('data-pose','ko');
  await page.getByRole('button',{name:'Reiniciar reproducción'}).click();
  await expect(page.locator('[data-pilot-id="e3"]')).toHaveAttribute('data-pose','idle');
  await page.getByRole('button',{name:'Continuar reproducción'}).click();
  await page.getByText('Configurar nueva simulación · rival y semilla',{exact:true}).click();
  await page.getByLabel('Semilla del simulador').fill('42');
  await page.getByRole('button',{name:/Guardianes/}).click();
  await page.getByRole('button',{name:'Nueva simulación',exact:true}).click();
  await expect(page.getByLabel('Reproducción del encuentro')).toHaveAttribute('data-cursor','-1');
  await expect(page.getByLabel('Reproducción del encuentro')).toHaveAttribute('data-view','tactical');
  await sceneView(page);
  await expect(page.locator('[data-pilot-id]')).toHaveCount(1);
  await expect(page.locator('[data-pilot-id="e3"]')).toHaveCount(0);
  await expect(page.locator('[data-fighter-id]')).toHaveCount(10);
  await expect(page.getByLabel('Escena piloto 2D')).toContainText('1 DE 10');
});

test('missing art keeps readable symbols, data and controls without pretending to animate sprites',async({page})=>{
  await page.route('**/combat-pilot/*.png',route=>route.abort());
  await openPilot(page);const before=await page.evaluate(()=>localStorage.getItem('vyrathen-v01'));await sceneView(page);
  await expect(page.locator('[data-art="fallback"]')).toHaveCount(2);
  await page.getByRole('button',{name:'Avanzar un evento'}).click();
  await expect(page.getByText('Arte no disponible',{exact:true})).toHaveCount(2);
  await expect(page.locator('[data-fighter-id="e3"] [data-resource="HP"]')).toHaveText('HP 317/405');
  expect(await page.evaluate(()=>localStorage.getItem('vyrathen-v01'))).toBe(before);
});

test('a symbolic participant stays the real target instead of assigning its hit to the other pilot actor',async({page})=>{
  const battle=pilotFixture(),cursor=battle.trace!.events.findIndex(r=>r.actorId==='e3'&&r.targetId==='h3'&&r.attempt);
  expect(cursor).toBeGreaterThan(0);await openPilot(page,battle);await sceneView(page);await seekPilot(page,battle,cursor);await inspectPose(page,'event');
  await expect(page.getByLabel('Escena piloto 2D')).toHaveAttribute('data-target-id','h3');
  await expect(page.locator('[data-symbol-id="h3"]')).toContainText('Astra');
  await expect(page.locator('[data-pilot-id="h4"]')).toHaveAttribute('data-pose','idle');
  await expect(page.locator('[data-pilot-id="e3"]')).toHaveAttribute('data-pose','basic');
  await expect(page.locator('[data-fighter-id]')).toHaveCount(10);
});

for(const kind of ['legacy','invalid'] as const)test(`${kind} recording keeps tactical fallback and requests no character art`,async({page})=>{
  const battle=kind==='legacy'?JSON.parse(readFileSync(new URL('../fixtures/combat-v01-1024.json',import.meta.url),'utf8')):pilotFixture();
  if(kind==='invalid')battle.trace.events.pop();
  let requests=0;page.on('request',r=>{if(r.url().includes('/combat-pilot/'))requests++;});
  await openPilot(page,battle);
  await expect(page.getByRole('button',{name:'Escena 2D · candidata',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Avanzar un evento'}).click();
  await expect(page.locator('[data-pilot-id]')).toHaveCount(0);expect(requests).toBe(0);
});

test('reduced motion, keyboard inspection and accessibility retain complete poses and numbers',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await openPilot(page);await sceneView(page);
  await page.getByRole('button',{name:'Avanzar un evento'}).focus();await page.keyboard.press('Enter');
  await inspectPose(page,'reaction');
  await expect(page.locator('[data-pilot-id="e3"]')).toHaveAttribute('data-pose','hit');
  expect(await page.getByLabel('Escena piloto 2D').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
