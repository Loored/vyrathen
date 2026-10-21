import { ArrowLeft, ArrowUpRight, Info } from 'lucide-react';
import { useEffect, useRef, type CSSProperties } from 'react';
import type { HeroProfileViewModel } from './heroProfile';
import { HeroSigil, HeroVitals } from './HeroPresentation';
import './characters.css';

export function HeroProfile({ profile, onBack, onCombat }: { profile: HeroProfileViewModel; onBack: () => void; onCombat: () => void }) {
  const power = profile.power.status;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo?.({ top: 0, behavior: 'instant' }); }, [profile.id]);
  return <section className="vyr-characters hero-profile" style={{ '--hero-accent': profile.presentation.accent } as CSSProperties} aria-labelledby="hero-profile-name">
    <div className="vyr-profile-toolbar"><button className="game-action game-action--secondary" type="button" onClick={onBack}><ArrowLeft size={16}/> Volver a Mis héroes</button><span className="game-section-kicker">PERSONAJES / FICHA DE CONSULTA</span></div>
    <div className="vyr-profile-layout">
      <div className="vyr-profile-identity"><div className="vyr-profile-class"><span>{profile.type}</span><span>NIVEL <b>{String(profile.level).padStart(2, '0')}</b></span></div><h1 id="hero-profile-name" ref={heading} tabIndex={-1}>{profile.name}</h1><HeroSigil profile={profile}/><HeroVitals profile={profile}/><p className="vyr-profile-art-note">Presentación simbólica provisional.<br/>Sin ilustración asignada.</p></div>
      <div className="vyr-profile-dossier">
        <section className="vyr-profile-stats" aria-labelledby="hero-stats-title"><span className="game-section-kicker">01 / PERFIL DE COMBATE</span><h2 id="hero-stats-title">Estadísticas de configuración</h2><dl>{profile.stats.map((stat, index) => <div key={stat.label}><dt><span aria-hidden="true">0{index + 1}</span>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl><p>Valores del héroe demo. HP y MP indican máximos de configuración, no valores actuales de un combate guardado.</p></section>
        <section className="vyr-profile-power" aria-labelledby="hero-power-title"><div className="vyr-profile-power-heading"><div><span className="game-section-kicker">02 / PODER · NIVEL {profile.power.level}</span><h2 id="hero-power-title">{profile.power.name}</h2></div><span className="vyr-profile-power-mark" aria-hidden="true">↗</span></div><p>{power.description}</p><dl className="vyr-profile-facts"><div><dt>Coste MP documentado</dt><dd>{power.kind === 'documented' ? power.mpCost : 'No catalogado'}</dd></div>{power.kind === 'documented' && power.nominalDamage !== undefined && <div><dt>Magnitud nominal</dt><dd>{power.nominalDamage}</dd></div>}</dl><div className="vyr-profile-status"><Info size={16}/><span>{power.implementation}</span></div></section>
      </div>
    </div>
    <footer className="vyr-profile-footer"><p>Consulta de configuración · Sin cambios en tu partida.</p><button type="button" className="game-action" onClick={onCombat}>Abrir simulador <ArrowUpRight size={17}/></button></footer>
  </section>;
}
