import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity, ArrowUpRight, BookOpen, Boxes, Brain,
  Check, ChevronDown, Compass, Database,
  History, Info, Layers, Play,
  Shield, ShieldCheck, Skull, Sparkles, Swords, Target, Zap,
} from 'lucide-react';
import { PLAYER_TEAM, ENEMIES, INITIAL_SAVE } from './data/demo.ts';
import PODERES from './data/poderes.json';
import PASIVAS from './data/pasivas.json';
import { countTypePoints, NOMINAL_POWER_DAMAGE } from './engine/rules.ts';
import { simulateCombat } from './engine/simulator.ts';
import { advanceStarterQuest, claimStarterQuest } from './engine/quest.ts';
import type { CombatResult, HeroType, SaveData } from './engine/types.ts';
import { HeroRoster } from './features/heroes/HeroRoster';
import { HeroProfile } from './features/heroes/HeroProfile.tsx';
import { toHeroProfile } from './features/heroes/heroProfile.ts';
import { GameTabs } from './ui/GameTabs.tsx';
import './styles.css';
import './ui/game-ui.css';

import { Home } from './features/home/Home';
import { GameFrame, type Section } from './app/GameFrame';
type ArchiveTab = 'poderes' | 'pasivas' | 'estructuras';
type Filter = 'Todos' | HeroType;
const STORE_KEY = 'vyrathen-v01';
const TYPES: HeroType[] = ['Psico','Energía','Defensa','Control'];
const typeIcon = { 'Psico': Brain, 'Energía': Zap, 'Defensa': Shield, 'Control': Compass };
const typeClass = (type:HeroType) => ({'Psico':'psico','Energía':'energia','Defensa':'defensa','Control':'control'})[type];

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
export default function App(){
  const [section,setSection]=useState<Section>('inicio');
  const [save,setSave]=useState<SaveData>(loadSave);
  const [archiveTab,setArchiveTab]=useState<ArchiveTab>('poderes');
  const [typeFilter,setTypeFilter]=useState<Filter>('Todos');
  const [search,setSearch]=useState('');
  const [viewRound,setViewRound]=useState(1);
  const [notice,setNotice]=useState('');
  const [lastConsultedHeroId,setLastConsultedHeroId]=useState<string | null>(null);
  const [selectedHeroId,setSelectedHeroId]=useState<string | null>(null);
  const [restoreHeroFocusId,setRestoreHeroFocusId]=useState<string | null>(null);
  useEffect(()=>{
    if (selectedHeroId!==null || restoreHeroFocusId===null) return;
    const origin=document.getElementById(`hero-open-${restoreHeroFocusId}`);
    if (origin?.tagName === 'BUTTON') origin.focus();
    setRestoreHeroFocusId(null);
  },[selectedHeroId,restoreHeroFocusId]);
  useEffect(()=>{try{localStorage.setItem(STORE_KEY,JSON.stringify(save));}catch{/* sin permiso de almacenamiento */}},[save]);
  const visiblePowers=useMemo(()=>PODERES.filter(p=>(typeFilter==='Todos'||p.tipo===typeFilter)
    && `${p.nombre} ${p.descripcion}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())),[typeFilter,search]);
  const score=useMemo(()=>countTypePoints(PLAYER_TEAM,ENEMIES[save.selectedEnemy].heroes),[save.selectedEnemy]);
  const lastBattle=save.lastBattle;

  function go(next:Section) {setSection(next);window.scrollTo?.({top:0,behavior:'instant'});}
  function runBattle(){
    try{
      const battle=simulateCombat(PLAYER_TEAM,ENEMIES[save.selectedEnemy].heroes,save.seed);
      setSave(s=>({...s,lastBattle:battle,battles:s.battles+1}));
      setViewRound(1);setNotice('Combate simulado. Abre las rondas para revisar los eventos.');
    }catch(e){setNotice(e instanceof Error?e.message:'No fue posible simular.');}
  }
  function progressQuest(){
    const next=advanceStarterQuest(save);
    if(next===save) return;
    setSave(next);
    setNotice(`Misión: ${next.questProgress} / 10 pasos. −1 turno · ${next.turns} disponibles.`);
  }
  function claimQuest(){
    const next=claimStarterQuest(save,1);
    if(next===save) return;
    setSave(next);setNotice('Recompensa incorporada: +$12,000,000. Misión disponible de nuevo.');
  }
  function reset(){if(window.confirm('¿Restablecer todos los datos de la demo local?')){setSave({...INITIAL_SAVE});setViewRound(1);setNotice('Datos de demostración restablecidos.');}}

  return <GameFrame section={section} save={save} notice={notice} onNavigate={go} onReset={reset} onDismissNotice={()=>setNotice('')}>
        {section==='inicio'&&<Home save={save} heroes={PLAYER_TEAM} onHeroes={()=>go('heroes')} onCombat={()=>go('combate')} onArchive={()=>go('archivo')} onAdvance={progressQuest} onClaim={claimQuest}/>}
        {section==='heroes'&& (selectedHeroId ? <HeroProfile profile={toHeroProfile(PLAYER_TEAM.find(hero=>hero.id===selectedHeroId) ?? PLAYER_TEAM[0])} onBack={()=>{setRestoreHeroFocusId(selectedHeroId);setSelectedHeroId(null);}} onCombat={()=>go('combate')}/> : <HeroRoster profiles={PLAYER_TEAM.map(toHeroProfile)} lastConsultedId={lastConsultedHeroId} onOpen={id=>{setRestoreHeroFocusId(null);setLastConsultedHeroId(id);setSelectedHeroId(id);}} onCombat={()=>go('combate')}/> )}
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
          <GameTabs label="Secciones del archivo" panelId="archive-panel" active={archiveTab} onChange={id=>setArchiveTab(id as ArchiveTab)} tabs={[{id:'poderes',label:'Poderes · 24 + 3'},{id:'pasivas',label:'Pasivas · 15'},{id:'estructuras',label:'Estructuras · 16'}]}/>
          <section id="archive-panel" role="tabpanel" aria-labelledby={`archive-panel-tab-${archiveTab}`} tabIndex={0}>
          {archiveTab==='poderes'&&<><div className="archive-tools"><label className="search-box"><span className="sr-only">Buscar poder</span><BookOpen size={17}/><input placeholder="Buscar nombre o descripción..." value={search} onChange={e=>setSearch(e.target.value)}/></label><div className="filter-types"><button className={typeFilter==='Todos'?'active':''} onClick={()=>setTypeFilter('Todos')}>Todos</button>{TYPES.map(t=><button key={t} className={typeFilter===t?'active':''} onClick={()=>setTypeFilter(t)}>{t}</button>)}</div></div>
            <div className="powers-list">{visiblePowers.map(p=><article className="power-entry" key={p.id}><div className={`power-type-icon ${typeClass(p.tipo as HeroType)}`}><TypeIcon type={p.tipo as HeroType} size={20}/></div><div><div className="power-entry-name"><h2>{p.nombre}</h2><TypePill type={p.tipo as HeroType}/></div><p>{p.descripcion}</p><div className="power-metadata"><span>ALCANCE {p.alcance}</span><span>{p.categoria}</span>{NOMINAL_POWER_DAMAGE[p.nombre]&&<span>Daño nominal · fórmula conocida</span>}</div></div><span className="source-flag">REFERENCIA</span></article>)}{visiblePowers.length===0&&<div className="nothing-found">No hay poderes con ese filtro.</div>}</div>
            <div className="unknown-powers"><div><History size={17}/><b>Conceptos pendientes de diseño</b></div><p>Hay capacidades reservadas para futuras versiones. No se mostrarán como jugables hasta tener reglas y pruebas.</p></div>
          </>}
          {archiveTab==='pasivas'&&<div className="powers-list passive-list">{PASIVAS.map((p,i)=><article className="power-entry" key={i}><div className="power-type-icon neutral"><Sparkles size={19}/></div><div><h2>{p.habilidad_pasiva}</h2><p>{p.efecto_declarado}</p><div className="power-metadata"><span>HABILIDAD PASIVA</span><span>2010</span></div></div><span className="source-flag">REFERENCIA</span></article>)}</div>}
          {archiveTab==='estructuras'&&<div className="panel structure-content"><h2>Arquitectura del laboratorio</h2><p>El árbol de construcción de Vyrathen se está diseñando con recursos gráficos originales. Por ahora, las estructuras son una referencia de progresión y todavía no son construibles.</p><div className="panel-footnote"><Boxes size={18}/> Próximamente: edificios, requisitos y rutas de especialización propios.</div><div className="panel-footnote"><Info size={15}/> El coste de construcción de cada edificio no está documentado: aún no se permite construir para evitar inventar precios.</div></div>}
          </section>
          <div className="provenance-panel"><div><Layers size={19}/><strong>Origen de las reglas</strong></div><ul><li><span className="source-dot verified-dot"/><b>Documentación de referencia:</b> tipos, diez rondas, K.O. y reglas nominales auditables.</li><li><span className="source-dot observed-dot"/><b>Observación externa:</b> evidencia de sistemas en juegos clásicos, no implementación propia.</li><li><span className="source-dot assumption-dot"/><b>Decisión nueva:</b> estadísticas demo, IA, precisión, iniciativa, coste por paso y mitigación.</li></ul></div>
        </>}
  </GameFrame>;
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
