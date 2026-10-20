import { ArrowLeft, Info, Sparkles } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { HeroProfileViewModel } from './heroProfile.ts';

export function HeroProfile({ profile, onBack, onCombat }: { profile: HeroProfileViewModel; onBack: () => void; onCombat: () => void }) {
  const power = profile.power.status;
  return <section className="hero-profile" style={{ '--hero-accent': profile.presentation.accent } as CSSProperties} aria-labelledby="hero-profile-name">
    <button className="text-button" type="button" onClick={onBack}><ArrowLeft size={16}/> Volver a Mis héroes</button>
    <div className="hero-profile-grid">
      <div className="game-panel hero-profile-stage"><div className="hero-profile-symbol" aria-hidden>{profile.presentation.symbol}</div><span className="game-section-kicker">PRESENTACIÓN PROVISIONAL · SIN ILUSTRACIÓN ASIGNADA</span><h1 id="hero-profile-name">{profile.name}</h1><p>{profile.type} · Nivel {profile.level}</p><div className="hero-profile-resource"><span>HP máximo <b>{profile.maxHp}</b></span><span>MP máximo <b>{profile.maxMp}</b></span></div></div>
      <div className="game-panel"><span className="game-section-kicker">PERFIL DE COMBATE</span><h2>Estadísticas de configuración</h2><p className="hero-profile-note">Estos valores pertenecen al héroe demo. No son HP/MP finales de un combate guardado.</p><div className="game-stat-list">{profile.stats.map(stat => <div className="game-stat" key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong></div>)}</div></div>
      <div className="game-panel hero-profile-power"><span className="game-section-kicker">PODER · NIVEL {profile.power.level}</span><h2><Sparkles size={18}/> {profile.power.name}</h2><p>{power.description}</p>{power.kind === 'documented' ? <div className="hero-profile-facts"><span>Coste MP documentado <b>{power.mpCost}</b></span>{power.nominalDamage !== undefined && <span>Magnitud nominal <b>{power.nominalDamage}</b></span>}</div> : <div className="hero-profile-facts"><span>Coste MP <b>No catalogado</b></span></div>}<div className="hero-profile-status"><Info size={16}/><span>{power.implementation}</span></div><button type="button" className="game-action game-action--secondary" onClick={onCombat}>Abrir simulador</button></div>
    </div>
  </section>;
}
