import { ArrowRight, Check, Swords } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { HeroProfileViewModel } from './heroProfile';
import { HeroSigil, HeroVitals } from './HeroPresentation';
import './characters.css';

export function HeroRoster({ profiles, selectedId, onSelect, onOpen, onCombat }: {
  profiles: readonly HeroProfileViewModel[]; selectedId: string;
  onSelect: (id: string) => void; onOpen: (id: string) => void; onCombat: () => void;
}) {
  return <section className="vyr-characters vyr-roster" aria-labelledby="roster-title">
    <header className="vyr-characters-heading"><div><span className="game-section-kicker">PERSONAJES / LABORATORIO AURORA</span><h1 id="roster-title">Tu escuadrón</h1><p>Cinco héroes demo. Selecciona para consultar; tu formación no cambia.</p></div><span className="vyr-characters-edition">REGISTRO DE HÉROES<br/><b>05 / ALFA</b></span></header>
    <div className="vyr-roster-grid">{profiles.map(profile => <article className={`hero-card vyr-roster-entry ${selectedId === profile.id ? 'is-selected' : ''}`} key={profile.id} style={{ '--hero-accent': profile.presentation.accent } as CSSProperties}>
      <button type="button" className="vyr-roster-select" aria-pressed={selectedId === profile.id} onClick={() => onSelect(profile.id)}>
        <span className="vyr-roster-index"><span>Seleccionar <span className="sr-only">{profile.name}</span>{selectedId === profile.id && <Check aria-hidden="true" size={13}/>}</span></span>
      </button>
      <HeroSigil profile={profile}/>
      <div className="vyr-roster-identity"><span>{profile.type} · Nivel {profile.level}</span><h2>{profile.name}</h2></div>
      <div className="vyr-roster-data"><HeroVitals profile={profile}/><div className="vyr-roster-power"><span>PODER · NIVEL {profile.power.level}</span><h3>{profile.power.name}</h3></div><button id={`hero-open-${profile.id}`} className="game-action game-action--secondary vyr-roster-open" type="button" aria-label={`Consultar ficha de ${profile.name}`} onClick={() => onOpen(profile.id)}>Consultar ficha <ArrowRight size={16}/></button></div>
    </article>)}</div>
    <footer className="vyr-roster-footer"><p>Identidades simbólicas provisionales · Sin ilustraciones asignadas.<br/>Valores de configuración, no resultados de un combate.</p><button type="button" className="game-action game-action--secondary" onClick={onCombat}><Swords size={17}/> Probar escuadrón</button></footer>
    <details className="vyr-type-reference"><summary>Referencia de tipos y ventajas</summary><p>Defensa → Psico → Energía → Control → Defensa. Cada pareja entre los cinco héroes de ambos equipos concede un punto cuando uno tiene ventaja sobre el otro. Conteo documentado; bonus sin aplicar porque su fórmula es desconocida.</p></details>
  </section>;
}
