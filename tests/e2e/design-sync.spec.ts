import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const catalog = 'http://127.0.0.1:4174/catalog.html';
const output = 'output/playwright/design-sync';
const sha = process.env.EVIDENCE_SHA || execFileSync('git', ['rev-parse', 'HEAD']).toString().trim();
async function ready(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.decode()));
    await Promise.all(document.getAnimations().filter(a => a.effect?.getComputedTiming().iterations !== Infinity).map(a => a.finished.catch(() => {})));
  });
}
async function relations(page: Page) {
  expect(await page.locator('[id]').evaluateAll(nodes => {
    const ids = nodes.map(node => node.id); return ids.filter((id, i) => ids.indexOf(id) !== i);
  })).toEqual([]);
  for (const tab of await page.getByRole('tab', { selected: true }).all()) {
    const id = await tab.getAttribute('aria-controls');
    const panel = page.locator(`[id="${id}"]`);
    await expect(panel).toHaveAttribute('role', 'tabpanel');
    await expect(panel).toHaveAttribute('aria-labelledby', (await tab.getAttribute('id'))!);
  }
}
async function font(page: Page, selector: string) {
  const computed = await page.locator(selector).first().evaluate(element => {
    const style = getComputedStyle(element);
    return { family: style.fontFamily, size: style.fontSize, weight: style.fontWeight, letterSpacing: style.letterSpacing, color: style.color, faces: [...document.fonts].map(face => ({ family: face.family, status: face.status })) };
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
  const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
  await cdp.detach();
  return { ...computed, actualFonts: fonts };
}

test('catalog loads every preview of all eight exported components without game side effects', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const interRequests: string[] = []; page.on('request', request => { if (/fonts.googleapis.com.*family=Inter/.test(request.url())) interRequests.push(request.url()); });
  await page.goto(catalog);
  const stories = page.locator('[data-story]');
  expect(await stories.count()).toBe(25);
  expect(await stories.evaluateAll(nodes => [...new Set(nodes.map(n => n.getAttribute('data-story')!.split('.')[0]))].sort())).toEqual(['CharacterDetails','CharacterRail','CharacterStage','CharacterTabs','GameTabs','HeroSigil','HeroVitals','SwitchFX']);
  await ready(page); await relations(page);
  expect(await page.locator('img').evaluateAll(images => images.some(img => /character-lab\/art|combat-pilot/.test(img.getAttribute('src') || '')))).toBe(false);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(errors).toEqual([]); expect(interRequests).toEqual([]);
});

test('independent tabs use keyboard, unique panels and isolated selected backgrounds', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(catalog);
  const first = page.locator('[data-story="CharacterTabs.Estadisticas"]');
  const other = page.locator('[data-story="CharacterTabs.Habilidades"]');
  await first.getByRole('tab').first().focus();
  await page.keyboard.press('End');
  await expect(first.getByRole('tab').last()).toBeFocused();
  await expect(other.getByRole('tab').nth(1)).toHaveAttribute('aria-selected','true');
  await page.keyboard.press('Home'); await page.keyboard.press('ArrowLeft');
  await expect(first.getByRole('tab').last()).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(first.getByRole('tab').first()).toBeFocused();
  await ready(page); await relations(page);
  for (const instance of [first, other]) {
    const button = await instance.getByRole('tab', { selected: true }).boundingBox();
    const background = await instance.locator('.tab-active-bg').boundingBox();
    expect(Math.abs(background!.x + background!.width/2 - button!.x - button!.width/2)).toBeLessThan(2);
  }
  const game = page.locator('[data-story="GameTabs.Poderes"]');
  await game.getByRole('tab').first().focus(); await page.keyboard.press('End');
  await expect(game.getByRole('tabpanel')).toHaveAccessibleName(/Estructuras/);
});

test('selection composition keeps one SELECT and resolves reduced motion immediately', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${catalog}?story=CharacterStage.PantallaDeSeleccion`);
  await page.getByRole('button', { name: 'Seleccionar Kael' }).click();
  await expect(page.locator('.edge-select')).toHaveCount(1);
  await expect(page.locator('.switch-overlay')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Kael', exact: true })).toBeVisible();
  await expect(page.locator('.switch-overlay')).toHaveCount(0);
  await page.getByRole('button', { name: 'Seleccionar Astra' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('heading', { name: 'Astra', exact: true })).toBeVisible();
  await expect(page.locator('.switch-overlay')).toHaveCount(0);
  await page.getByRole('button', { name: 'Seleccionar Vesper' }).click();
  await expect(page.getByRole('heading', { name: 'Vesper', exact: true })).toBeVisible();
  await expect(page.locator('.glitch-reveal')).toHaveCount(0);
  await expect(page.locator('.switch-overlay')).toHaveCount(0);
  await expect(page.locator('.edge-select')).toHaveCount(1);
  await relations(page);
  expect(errors).toEqual([]); expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

for (const [width,height] of [[1440,900],[320,720]]) {
  test(`catalog / production parity candidates ${width}x${height}`, async ({ page, browserName }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width,height });
    // Same network-independent fallback in both surfaces; no OS pixel equality asserted.
    await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    mkdirSync(output, { recursive: true });
    const prefix = `${process.platform}-${width}x${height}`;
    const captures: unknown[] = [];
    for (const [surface,url] of [['production','/character-lab'],['catalog',`${catalog}?story=CharacterStage.PantallaDeSeleccion`]]) {
      await page.goto(url); await expect(page.locator('.character-name')).toBeVisible(); await ready(page);
      const nameFont = await font(page,'.character-name-fill');
      const tabsFont = await font(page,'.tab-button-text');
      const scene = await page.locator('.game-screen').boundingBox();
      if (surface === 'catalog' && width === 1440) {
        expect(scene!.height).toBe(740); expect(scene!.y + scene!.height).toBeLessThanOrEqual(height);
        expect(await page.locator('.detail-content').evaluate(container => [...container.querySelectorAll('.stat-row')].every(row => row.getBoundingClientRect().bottom <= container.getBoundingClientRect().bottom + 1))).toBe(true);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      for (const fullPage of [false,true]) await page.screenshot({ path: `${output}/${prefix}-${surface}-${fullPage ? 'full' : 'viewport'}.png`, fullPage, animations: 'disabled' });
      await page.locator('.tabs-bar').screenshot({ path: `${output}/${prefix}-${surface}-tabs.png`, animations: 'disabled' });
      captures.push({ surface, nameFont,tabsFont, scene });
    }
    const [prod,cat] = captures as { nameFont: Awaited<ReturnType<typeof font>>; tabsFont: Awaited<ReturnType<typeof font>> }[];
    for (const field of ['family','size','weight','letterSpacing'] as const) {
      expect(cat.nameFont[field]).toBe(prod.nameFont[field]);
      expect(cat.tabsFont[field]).toBe(prod.tabsFont[field]);
    }
    expect(cat.nameFont.actualFonts.map(f => f.familyName)).toEqual(prod.nameFont.actualFonts.map(f => f.familyName));
    await page.goto('/');
    if (width === 320) await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('button', { name: 'Mis héroes', exact: true }).click();
    await page.getByRole('button', { name: 'Consultar ficha de Vesper' }).click(); await ready(page);
    const prodVitals = await font(page, '.vyr-hero-vitals dd');
    await page.locator('.vyr-hero-vitals').screenshot({ path: `${output}/${prefix}-production-hero.png` });
    await page.locator('.vyr-hero-sigil').screenshot({ path: `${output}/${prefix}-production-sigil.png` });
    const prodGlyph = await font(page,'.vyr-hero-glyph');
    if (width === 320) await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('button', { name: 'Archivo de reglas', exact: true }).click();
    const prodGameTab = await font(page,'.game-tabs [aria-selected=true]');
    await page.locator('.game-tabs').screenshot({ path: `${output}/${prefix}-production-archive.png` });
    await page.goto(`${catalog}?story=GameTabs.Poderes`); await ready(page);
    const catGameTab = await font(page,'.game-tabs [aria-selected=true]');
    for (const field of ['family','size','weight','color'] as const) expect(catGameTab[field]).toBe(prodGameTab[field]);
    await page.locator('.game-tabs').screenshot({ path: `${output}/${prefix}-catalog-archive.png` });
    await page.goto(`${catalog}?story=HeroVitals.FichaDeHeroe`); await ready(page);
    const catVitals = await font(page,'.vyr-hero-vitals dd');
    for (const field of ['family','size','weight'] as const) expect(catVitals[field]).toBe(prodVitals[field]);
    await page.locator('.vyr-hero-vitals').screenshot({ path: `${output}/${prefix}-catalog-hero.png` });
    await page.goto(`${catalog}?story=HeroSigil.FichaDeHeroe`); await ready(page);
    const catGlyph = await font(page,'.vyr-hero-glyph');
    for (const field of ['family','size','weight','color'] as const) expect(catGlyph[field]).toBe(prodGlyph[field]);
    await page.locator('.vyr-hero-sigil').screenshot({ path: `${output}/${prefix}-catalog-sigil.png` });
    await page.goto(`${catalog}?story=CharacterDetails.Habilidades`); await ready(page);
    await expect(page.locator('.fixture-annotation')).toContainText(/demostrativa; no representa reglas históricas/i);
    await page.screenshot({ path: `${output}/${prefix}-skills-full.png`, fullPage: true, animations:'disabled' });
    await page.goto(`${catalog}?story=CharacterDetails.Equipo`); await ready(page);
    await expect(page.locator('.fixture-annotation')).toContainText('ilustrativos');
    await page.screenshot({ path: `${output}/${prefix}-equipment-full.png`, fullPage:true, animations:'disabled' });
    expect(errors).toEqual([]);
    writeFileSync(`${output}/${prefix}.json`,JSON.stringify({sha,browserName,viewport:{width,height},status:'candidate_pending_owner_approval',network:'Google Fonts blocked equally to verify fallback',context:'Production Lab has shell/header/art and conceptual Selene; catalog uses existing PantallaDeSeleccion at 740px desktop, automatic mobile height, demo Vesper and original geometric marker. Hero comparison uses same Vesper profile at natural production width versus 280px catalog.',reducedMotion: 'reduce', captures,prodVitals,catVitals,prodGlyph,catGlyph,prodGameTab,catGameTab},null,2));
  });
}
