import type { HeroProfileViewModel } from './heroProfile';

/** Provisional symbols, never assigned character artwork. */
export function HeroSigil({ profile }: { profile: HeroProfileViewModel }) {
  return <div className="vyr-hero-sigil" aria-hidden="true"><svg className="vyr-hero-ambient" viewBox="0 0 430 100" aria-hidden="true" focusable="false"><text x="0" y="80" fill="currentColor">{profile.name.toUpperCase()}</text></svg><span className="vyr-hero-glyph">{profile.presentation.symbol}</span><span className="vyr-hero-registration">VYR / {profile.id.toUpperCase()}</span></div>;
}
export function HeroVitals({ profile }: { profile: HeroProfileViewModel }) {
  return <dl className="vyr-hero-vitals"><div><dt>HP máximo</dt><dd>{profile.maxHp}</dd></div><div><dt>MP máximo</dt><dd>{profile.maxMp}</dd></div></dl>;
}
