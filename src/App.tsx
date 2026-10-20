import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity, ArrowRight, ArrowUpRight, BookOpen, Boxes, Brain,
  Check, ChevronDown, CircleHelp, Clock3, Compass, Database, Dna, FlaskConical,
  Hexagon, History, House, Info, Layers, Menu, Play, RotateCcw,
  Shield, ShieldCheck, Skull, Sparkles, Swords, Target, Wallet, X, Zap,
} from 'lucide-react';
import { PLAYER_TEAM, ENEMIES, INITIAL_SAVE } from './data/demo.ts';
import PODERES from './data/poderes.json';
import PASIVAS from './data/pasivas.json';
import { countTypePoints, NOMINAL_POWER_DAMAGE } from './engine/rules.ts';
import { simulateCombat } from './engine/simulator.ts';
import { advanceStarterQuest, claimStarterQuest } from './engine/quest.ts';
import type { CombatResult, Hero, HeroType, SaveData } from './engine/types.ts';
import { HeroProfile } from './features/heroes/HeroProfile.tsx';
import { toHeroProfile } from './features/heroes/heroProfile.ts';
import { GameTabs } from './ui/GameTabs.tsx';
import './styles.css';
import './ui/game-ui.css';

type Section = 'inicio' | 'heroes' | 'combate' | 'archivo';
type ArchiveTab = 'poderes' | 'pasivas' | 'estructuras';
type Filter = 'Todos' | HeroType;
const STORE_KEY = 'vyrathen-v01';
const TYPES: HeroType[] = ['Psico','Energía','Defensa','Control'];
const typeIcon = { 'Psico': Brain, 'Energía': Zap, 'Defensa': Shield, 'Control': Compass };
const typeClass = (type:HeroType) => ({'Psico':'psico','Energía':'energia','Defensa':'defensa','Control':'control'})[type];
const intfmt = new Intl.NumberFormat('es-MX');
const money = (num:number) => `$${intfmt.format(num)}`;

function loadSave(): SaveData {
  try {
    const raw=localStorage.getItem(STORE_KEY);
    if(!raw) return {...INITIAL_SAVE};
    const data:unknown=JSON.parse(raw);
    if(data && typeof data === 'object' && 'version' in data && data.version===1 && 'turns' in data && typeof data.turns==='number')
      return {...INITIAL_SAVE,...(data as SaveData),version:1};
  } catch { /* localStorage puede estar deshabilitado; usar sesión volátil */ }
  return {...INITIAL_SAVE};
}

function TypeIcon({type,size=18}:{type:HeroType,size?:number}){
  const Icon=typeIcon[type];return <Icon aria-hidden size={size} strokeWidth={1.9}/>;
}
function TypePill({type}:{type:HeroType}){
  return <span className={`type-pill ${typeClass(type)}`}><TypeIcon type={type} size={13}/>{type}</span>;
}
function Eyebrow({children}:{children:ReactNode}) { return <span className="eyebrow">{children}</span>; }
function StatBar({value,max,color}:{value:number,max:number,color?:string}) {
  return <div className="stat-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
    <div style={{width:`${Math.max(0,Math.min(100,(value/max)*100))}%`,background:color}}/>
  </div>;
}
function Avatar({hero,large=false}:{hero:Hero,large?:boolean}) {
  return <div className={`hero-avatar ${typeClass(hero.type)} ${large?'large':''}`} aria-hidden>
    <div className="avatar-halo"/><TypeIcon type={hero.type} size={large?42:28}/>
  </div>;
}
function HeroCard({hero,expanded=false,onOpen}:{hero:Hero,expanded?:boolean,onOpen?:()=>void}) {
  return <article className={`hero-card ${expanded?'expanded':''}`}>
    <div className="hero-card-top"><Avatar hero={hero} large={expanded}/><div className="hero-card-level">LV <strong>{String(hero.level).padStart(2,'0')}</strong></div></div>
    <div className="hero-card-details"><h3>{hero.name}</h3><TypePill type={hero.type}/></div>
    <div className="hero-card-power"><Sparkles size={13}/><span>{hero.power}</span><span className="power-lvl">NV {hero.powerLevel}</span></div>
    {expanded && <div className="hero-expanded-stats">
      <div className="hero-stat-line"><span>Vitalidad · HP</span><b>{hero.maxHp}</b></div><StatBar value={hero.maxHp} max={500} color="var(--mint)"/>
      <div className="hero-stat-line"><span>Energía · MP</span><b>{hero.maxMp}</b></div><StatBar value={hero.maxMp} max={200} color="var(--violet)"/>
      <div className="mini-stats">{[['Golpear',hero.hit],['Bloquear',hero.block],['Esquivar',hero.dodge],['Mental',hero.mental],['Velocidad',hero.speed]].map(([k,v])=><div key={k}><span>{k}</span><b>{v}</b></div>)}</div>
      {onOpen&&<button type="button" className="text-button hero-card-open" onClick={onOpen}>Consultar ficha <ArrowRight size={14}/></button>}
    </div>}
  </article>;
}

const navigation:{id:Section;label:string;icon:typeof House}[]=[
  {id:'inicio',label:'Centro de control',icon:House},
  {id:'heroes',label:'Mis héroes',icon:Dna},
  {id:'combate',label:'Simulador de combate',icon:Swords},
  {id:'archivo',label:'Archivo de reglas',icon:BookOpen},
];

export default function App(){
  const [section,setSection]=useState<Section>('inicio');
  const [mobileMenu,setMobileMenu]=useState(false);
  const [save,setSave]=useState<SaveData>(loadSave);
  const [archiveTab,setArchiveTab]=useState<ArchiveTab>('poderes');
  const [typeFilter,setTypeFilter]=useState<Filter>('Todos');
  const [search,setSearch]=useState('');
  const [viewRound,setViewRound]=useState(1);
  const [notice,setNotice]=useState('');
  const [selectedHeroId,setSelectedHeroId]=useState<string | null>(null);
  useEffect(()=>{try{localStorage.setItem(STORE_KEY,JSON.stringify(save));}catch{/* sin permiso de almacenamiento */}},[save]);
  const visiblePowers=useMemo(()=>PODERES.filter(p=>(typeFilter==='Todos'||p.tipo===typeFilter)
    && `${p.nombre} ${p.descripcion}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())),[typeFilter,search]);
  const score=useMemo(()=>countTypePoints(PLAYER_TEAM,ENEMIES[save.selectedEnemy].heroes),[save.selectedEnemy]);
  const lastBattle=save.lastBattle;

  function go(next:Section) {setSection(next);setMobileMenu(false);window.scrollTo?.({top:0,behavior:'smooth'});}
  function runBattle(){
    try{
      const battle=simulateCombat(PLAYER_TEAM,ENEMIES[save.selectedEnemy].heroes,save.seed);
      setSave(s=>({...s,lastBattle:battle,battles:s.battles+1}));
      setViewRound(1);setNotice('Combate simulado. Abre las rondas para revisar los eventos.');
    }catch(e){setNotice(e instanceof Error?e.message:'No fue posible simular.');}
  }
  function progressQuest(){setSave(advanceStarterQuest);}
  function claimQuest(){setSave(s=>claimStarterQuest(s,1));setNotice('Recompensa de misión incorporada al laboratorio.');}
  function reset(){if(window.confirm('¿Restablecer todos los datos de la demo local?')){setSave({...INITIAL_SAVE});setViewRound(1);setNotice('Datos de demostración restablecidos.');}}

  return <div className="shell">
    <aside className={`sidebar ${mobileMenu?'open':''}`}>
      <div className="brand"><div className="brand-emblem"><Hexagon size={29} strokeWidth={1.7}/><span>✦</span></div><div className="brand-text"><strong>VYRA<span>THEN</span></strong><small>ALPHA / 0.1</small></div><button className="mobile-close icon-button" aria-label="Cerrar menú" onClick={()=>setMobileMenu(false)}><X size={20}/></button></div>
      <div className="sidebar-body"><div className="nav-label">NAVEGACIÓN</div><nav aria-label="Navegación principal">
        {navigation.map(item=>{const Icon=item.icon;return <button key={item.id} className={`nav-item ${section===item.id?'active':''}`} onClick={()=>go(item.id)}><Icon size={18}/><span>{item.label}</span>{section===item.id&&<span className="nav-active-dot"/>}</button>;})}
        <a className="nav-item" href="/character-lab" style={{textDecoration:'none'}}><Sparkles size={18}/><span>Character Lab · estudio visual</span></a>
      </nav><div className="nav-label nav-label-spaced">TU MUNDO</div>
      <div className="world-card"><span className="world-orbit"><span/></span><div><strong>Laboratorio local</strong><small>Partida de demostración</small></div><span className="online-dot"/></div>
      <div className="side-explainer"><span className="small-tag"><ShieldCheck size={13}/> BASADO EN ARCHIVOS</span><p>Reglas documentadas en 2010 + simulación transparente cuando falta código original.</p><button onClick={()=>go('archivo')}>Ver procedencia <ArrowRight size={14}/></button></div></div>
      <div className="sidebar-footer"><button onClick={reset} className="reset-button"><RotateCcw size={15}/> Reiniciar demo</button><span>Prototipo local independiente</span></div>
    </aside>
    {mobileMenu&&<div className="mobile-overlay" onClick={()=>setMobileMenu(false)}/>}
    <div className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" aria-label="Abrir menú" onClick={()=>setMobileMenu(true)}><Menu size={21}/></button><span className="topbar-path">SISTEMA / <strong>{navigation.find(n=>n.id===section)?.label}</strong></span></div><div className="topbar-right"><span className="chip-alpha"><span className="spark-dot"/> ALPHA LOCAL</span><span className="topbar-divider"/><span className="topbar-version">VERSIÓN · 0.1 ALPHA</span></div></header>
      <main className="content">
        {notice&&<div className="toast" role="status"><Info size={17}/><span>{notice}</span><button aria-label="Cerrar aviso" onClick={()=>setNotice('')}><X size={16}/></button></div>}
        {section==='inicio'&&<>
          <div className="welcome-head"><div><Eyebrow>ESTACIÓN DE MANDO / AURORA</Eyebrow><h1>Tu laboratorio.<br/><span>Tu próxima leyenda.</span></h1><p>Explora un universo de laboratorios, héroes extraordinarios y conflictos tácticos.</p></div><button className="primary-button game-action hero-cta" onClick={()=>go('combate')}><Play size={17} fill="currentColor"/> Iniciar combate <ArrowUpRight size={16}/></button></div>
          <div className="metric-grid">
            <Metric icon={<FlaskConical/>} label="LABORATORIO" value="Nivel 01" sub="Base experimental" tone="mint"/>
            <Metric icon={<Wallet/>} label="FONDOS" value={money(save.funds)} sub="Economía de demostración" tone="blue"/>
            <Metric icon={<Clock3/>} label="TURNOS DISPONIBLES" value={intfmt.format(save.turns)} sub="Límite histórico: 2,000" tone="violet"/>
            <Metric icon={<Swords/>} label="COMBATES" value={String(save.battles).padStart(2,'0')} sub="Simulaciones locales" tone="orange"/>
          </div>
          <section className="overview-grid">
            <div className="panel roster-panel"><div className="panel-head"><div><Eyebrow>ESCUADRÓN ACTIVO</Eyebrow><h2>Tus cinco héroes <span className="subtle-count">05 / 05</span></h2></div><button className="text-button" onClick={()=>go('heroes')}>Gestionar <ArrowUpRight size={16}/></button></div>
              <div className="hero-roster">{PLAYER_TEAM.map(hero=><HeroCard key={hero.id} hero={hero}/>)}</div>
              <div className="panel-footnote"><Info size={14}/> Personajes y estadísticas creados para esta demo; las categorías y nombres de poderes proceden del manual.</div>
            </div>
            <div className="panel next-quest"><div className="panel-head"><div><Eyebrow>PROGRESIÓN</Eyebrow><h2>Primera misión</h2></div><span className="quest-icon"><Target size={19}/></span></div>
              <div className="quest-city"><Compass size={15}/> Pekín · Nivel de laboratorio 1</div><h3>Un trabajo bien remunerado</h3><p>Completa los diez pasos documentados y reclama la recompensa histórica de 12 millones de dólares por nivel del laboratorio.</p>
              <div className="progress-head"><span>Progreso de misión</span><b>{save.questProgress} / 10 pasos</b></div><StatBar value={save.questProgress} max={10} color="var(--mint)"/>
              <div className="quest-reward"><span><Wallet size={17}/> RECOMPENSA</span><b>+ $12,000,000</b></div>
              {save.questProgress===10?<button className="primary-button block" onClick={claimQuest}><Check size={18}/> Reclamar recompensa</button>:<button className="primary-button block" onClick={progressQuest} disabled={save.turns===0}><ArrowRight size={17}/> Avanzar un paso <span>−1 turno*</span></button>}
              <p className="assumption-note">*Coste de un turno por paso: decisión provisional del remake. Recompensa y diez pasos: documentados.</p>
            </div>
          </section>
          <section className="overview-bottom"><div className="panel taxonomy-panel"><div className="panel-head"><div><Eyebrow>REGLA DOCUMENTADA</Eyebrow><h2>Ventajas elementales</h2></div><span className="verified"><Check size={13}/> VERIFICADA</span></div>
            <div className="taxonomy-types">{TYPES.map((type,i)=><div className="type-path" key={type}><div className={`type-node ${typeClass(type)}`}><TypeIcon type={type}/><span>{type}</span></div><ArrowRight size={17} className="path-arrow"/>{i===3&&<span className="loop-caption">vuelve a Defensa</span>}</div>)}</div>
            <div className="taxonomy-notice"><CircleHelp size={15}/><span>Defensa vence a Psico, Psico a Energía, Energía a Control y Control a Defensa. La conversión de puntos a bonus aún es desconocida.</span></div>
          </div><div className="panel source-panel"><div className="source-icon"><Database size={24}/></div><div><Eyebrow>ARCHIVO HISTÓRICO</Eyebrow><h2>Un legado recuperado</h2><p>24 poderes documentados, 15 habilidades pasivas y reglas extraídas de la biblioteca original de 2010.</p><button className="text-button" onClick={()=>go('archivo')}>Explorar las reglas <ArrowRight size={16}/></button></div></div></section>
        </>}
        {section==='heroes'&& (selectedHeroId ? <HeroProfile profile={toHeroProfile(PLAYER_TEAM.find(hero=>hero.id===selectedHeroId) ?? PLAYER_TEAM[0])} onBack={()=>setSelectedHeroId(null)} onCombat={()=>go('combate')}/> : <>
          <PageHead eyebrow="PERSONAJES / ESTADÍSTICAS" title="Tu escuadrón" desc="Cinco héroes de ejemplo para probar el sistema de tipos, poderes y combate." right={<span className="outline-tag"><Dna size={16}/> COMPOSICIÓN DEMO</span>}/>
          <div className="hero-grid-full">{PLAYER_TEAM.map(hero=><HeroCard hero={hero} key={hero.id} expanded onOpen={()=>setSelectedHeroId(hero.id)}/>)}</div>
          <div className="panel type-explainer"><div className="panel-head"><div><Eyebrow>IDENTIDAD DE COMBATE</Eyebrow><h2>Cuatro tipos, un sistema de ventajas</h2></div><button onClick={()=>go('combate')} className="text-button">Probar escuadrón <ArrowRight size={16}/></button></div><p>Cada pareja entre los cinco héroes de ambos equipos concede un punto cuando uno tiene ventaja sobre el otro. Esta parte sí puede calcularse exactamente como en el manual.</p><div className="type-card-grid">{TYPES.map(type=><div className={`type-card ${typeClass(type)}`} key={type}><TypeIcon type={type} size={26}/><b>{type}</b><small>Ventaja frente a {({Defensa:'Psico',Psico:'Energía','Energía':'Control',Control:'Defensa'} as Record<HeroType,string>)[type]}</small></div>)}</div></div>
        </>)}
        {section==='combate'&&<>
          <PageHead eyebrow="SIMULADOR / 5 CONTRA 5" title="Cámara de combate" desc="Diez rondas, ventaja de tipos y resultado por K.O. Usa una semilla para obtener reportes reproducibles." right={<span className="outline-tag"><ShieldCheck size={16}/> MOTOR EXPERIMENTAL</span>}/>
          <div className="battle-grid"><div className="panel match-setup"><div className="panel-head"><div><Eyebrow>CONFIGURAR ENCUENTRO</Eyebrow><h2>Prepara tu equipo</h2></div><span className="match-crest"><Swords size={22}/></span></div>
            <div className="combat-label">OPONENTE</div><div className="enemy-options">{(Object.keys(ENEMIES) as SaveData['selectedEnemy'][]).map(key=><button key={key} className={`enemy-option ${save.selectedEnemy===key?'selected':''}`} onClick={()=>setSave(s=>({...s,selectedEnemy:key,lastBattle:undefined}))}><span className="enemy-symbol">{key==='patrulla'?<Target size={20}/>:<Shield size={20}/>}</span><span><strong>{ENEMIES[key].label}</strong><small>{ENEMIES[key].subtitle}</small></span><span className="enemy-radio"/></button>)}</div>
            <div className="combat-label seed-caption">SEMILLA DEL SIMULADOR <span>Reproduce la misma batalla</span></div><input aria-label="Semilla del simulador" className="seed-input" type="number" min="1" max="2147483647" value={save.seed} onChange={e=>setSave(s=>({...s,seed:Math.min(2147483647,Math.max(1,Math.trunc(Number(e.target.value)||1)))}))}/>
            <div className="matchup"><div className="matchup-side"><span className="matchup-team-name">AURORA</span><strong>5</strong><span>Atacante</span></div><div className="matchup-versus">VS</div><div className="matchup-side"><span className="matchup-team-name">{save.selectedEnemy==='patrulla'?'PATRULLA':'GUARDIANES'}</span><strong>5</strong><span>Defensor</span></div></div>
            <div className="type-score"><div><span>Puntos de ventaja</span><b>{score.attacker} : {score.defender}</b></div><small>Conteo histórico exacto · bonus sin aplicar (fórmula desconocida)</small></div>
            <button className="primary-button game-action block simulate-button" onClick={runBattle}><Play size={18} fill="currentColor"/> {lastBattle?'Repetir simulación':'Iniciar simulación'} <ArrowUpRight size={16}/></button>
            <div className="simulation-warning"><Info size={16}/> Probabilidad de actuar, precisión, daño final, defensa y selección de objetivo: simulados, no recuperados del servidor original.</div>
          </div><div className="panel battle-report"><div className="panel-head"><div><Eyebrow>REGISTRO TÁCTICO</Eyebrow><h2>{lastBattle?'Resultado del enfrentamiento':'Esperando combate'}</h2></div><Activity size={19} className="muted-icon"/></div>
            {lastBattle?<BattleReport battle={lastBattle} viewRound={viewRound} setViewRound={setViewRound}/>:<div className="empty-battle"><div className="battle-orbit"><Swords size={42}/></div><h3>Todo listo para la primera ronda</h3><p>Configura tu rival e inicia una simulación. Aquí aparecerán los K.O., las acciones y las diez rondas.</p><span>REPORTE SIN GENERAR</span></div>}
          </div></div>
        </>}
        {section==='archivo'&&<>
          <PageHead eyebrow="CÓDICE / SISTEMAS" title="Archivo de reglas" desc="Consulta las capacidades disponibles y conoce qué reglas del prototipo siguen en revisión." right={<span className="outline-tag"><BookOpen size={16}/> REGLAS EN DESARROLLO</span>}/>
          <div className="evidence-banner"><Database size={23}/><div><strong>Códice de habilidades · versión alfa</strong><span>Catálogo provisional de 24 poderes y 15 pasivas de referencia. Los nombres, efectos y balance se revisarán para la identidad propia de Vyrathen.</span></div><span className="verified"><Check size={13}/> REFERENCIA</span></div>
          <GameTabs label="Secciones del archivo" active={archiveTab} onChange={id=>setArchiveTab(id as ArchiveTab)} tabs={[{id:'poderes',label:'Poderes · 24 + 3'},{id:'pasivas',label:'Pasivas · 15'},{id:'estructuras',label:'Estructuras · 16'}]}/>
          {archiveTab==='poderes'&&<><div className="archive-tools"><label className="search-box"><span className="sr-only">Buscar poder</span><BookOpen size={17}/><input placeholder="Buscar nombre o descripción..." value={search} onChange={e=>setSearch(e.target.value)}/></label><div className="filter-types"><button className={typeFilter==='Todos'?'active':''} onClick={()=>setTypeFilter('Todos')}>Todos</button>{TYPES.map(t=><button key={t} className={typeFilter===t?'active':''} onClick={()=>setTypeFilter(t)}>{t}</button>)}</div></div>
            <div className="powers-list">{visiblePowers.map(p=><article className="power-entry" key={p.id}><div className={`power-type-icon ${typeClass(p.tipo as HeroType)}`}><TypeIcon type={p.tipo as HeroType} size={20}/></div><div><div className="power-entry-name"><h3>{p.nombre}</h3><TypePill type={p.tipo as HeroType}/></div><p>{p.descripcion}</p><div className="power-metadata"><span>ALCANCE {p.alcance}</span><span>{p.categoria}</span>{NOMINAL_POWER_DAMAGE[p.nombre]&&<span>Daño nominal · fórmula conocida</span>}</div></div><span className="source-flag">REFERENCIA</span></article>)}{visiblePowers.length===0&&<div className="nothing-found">No hay poderes con ese filtro.</div>}</div>
            <div className="unknown-powers"><div><History size={17}/><b>Conceptos pendientes de diseño</b></div><p>Hay capacidades reservadas para futuras versiones. No se mostrarán como jugables hasta tener reglas y pruebas.</p></div>
          </>}
          {archiveTab==='pasivas'&&<div className="powers-list passive-list">{PASIVAS.map((p,i)=><article className="power-entry" key={i}><div className="power-type-icon neutral"><Sparkles size={19}/></div><div><h2>{p.habilidad_pasiva}</h2><p>{p.efecto_declarado}</p><div className="power-metadata"><span>HABILIDAD PASIVA</span><span>2010</span></div></div><span className="source-flag">REFERENCIA</span></article>)}</div>}
          {archiveTab==='estructuras'&&<div className="panel structure-content"><h2>Arquitectura del laboratorio</h2><p>El árbol de construcción de Vyrathen se está diseñando con recursos gráficos originales. Por ahora, las estructuras son una referencia de progresión y todavía no son construibles.</p><div className="panel-footnote"><Boxes size={18}/> Próximamente: edificios, requisitos y rutas de especialización propios.</div><div className="panel-footnote"><Info size={15}/> El coste de construcción de cada edificio no está documentado: aún no se permite construir para evitar inventar precios.</div></div>}
          <div className="provenance-panel"><div><Layers size={19}/><strong>Origen de las reglas</strong></div><ul><li><span className="source-dot verified-dot"/><b>Documentación de referencia:</b> tipos, diez rondas, K.O. y reglas nominales auditables.</li><li><span className="source-dot observed-dot"/><b>Observación externa:</b> evidencia de sistemas en juegos clásicos, no implementación propia.</li><li><span className="source-dot assumption-dot"/><b>Decisión nueva:</b> estadísticas demo, IA, precisión, iniciativa, coste por paso y mitigación.</li></ul></div>
        </>}
        <footer className="main-footer"><span>VYRATHEN / ALPHA EXPERIMENTAL</span><span>Un universo independiente · Mecánicas en evolución</span></footer>
      </main>
    </div>
  </div>;
}
function Metric({icon,label,value,sub,tone}:{icon:ReactNode;label:string;value:string;sub:string;tone:string}){
  return <div className={`metric metric-${tone}`}><div className="metric-top"><span>{label}</span><span className="metric-icon">{icon}</span></div><strong>{value}</strong><small>{sub}</small></div>;
}
function PageHead({eyebrow,title,desc,right}:{eyebrow:string;title:string;desc:string;right:ReactNode}){
  return <div className="page-head"><div><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{desc}</p></div><div>{right}</div></div>;
}
function BattleReport({battle,viewRound,setViewRound}:{battle:CombatResult;viewRound:number;setViewRound:(n:number)=>void}){
  const round=battle.rounds[viewRound-1];
  return <><div className={`victory-box ${battle.victor==='atacante'?'won':'lost'}`}><div className="victory-icon">{battle.victor==='atacante'?<ShieldCheck size={25}/>:<Skull size={25}/>}</div><div><span>{battle.victor==='atacante'?'VICTORIA ATACANTE':'VICTORIA DEFENSORA'}</span><strong>{battle.summary}</strong><small>Semilla #{battle.seed} · 10 rondas calculadas</small></div></div>
    <div className="ko-totals"><div><span>K.O. causados · Aurora</span><strong>{battle.attackerKOs}<small> / 5</small></strong></div><div><span>K.O. causados · Rival</span><strong>{battle.defenderKOs}<small> / 5</small></strong></div></div>
    <div className="rounds-heading"><span>REGISTRO DE RONDAS</span><span>{battle.rounds.reduce((a,r)=>a+r.events.length,0)} EVENTOS</span></div>
    <div className="round-picker" aria-label="Seleccionar ronda">{battle.rounds.map(r=><button key={r.round} className={viewRound===r.round?'selected':''} onClick={()=>setViewRound(r.round)} aria-label={`Ronda ${r.round}`}>{r.round}</button>)}</div>
    <div className="round-details"><div className="round-title"><b>Ronda {String(viewRound).padStart(2,'0')}</b><small>En pie: {round.attackerAlive} aliados · {round.defenderAlive} rivales</small></div><div className="event-list">{round.events.map(event=><div className={`event-row ${event.kind}`} key={event.id}><span className="event-indicator"/><p>{event.message}</p>{event.damage!==undefined&&<b>−{event.damage}</b>}</div>)}</div></div>
    <details className="combat-method"><summary>¿Qué reglas usa esta simulación? <ChevronDown size={16}/></summary><p><b>Históricas:</b> cinco por bando, diez rondas, K.O., desempate favorable al defensor, conteo de ventajas, costes generales y daño nominal aproximado de seis poderes.</p><p><b>Provisionales:</b> actuación por velocidad, orden, selección de objetivos, precisión, bloqueo, esquiva, daño aplicado y poderes complejos aún no simulados. El bonus de tipos no se aplica porque se desconoce su fórmula.</p></details>
  </>;
}
