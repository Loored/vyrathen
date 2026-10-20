interface Props { active: boolean; targetName: string; sequence: number; reduced: boolean }

/**
 * One SELECT element, vertical and right-docked, both at rest and during flight.
 * The shards never reproduce an additional horizontal SELECT banner.
 */
export function SwitchFX({ active, targetName, sequence, reduced }: Props) {
  return (
    <>
      <div className={`edge-select ${active && !reduced ? 'edge-select-launch' : ''}`} aria-hidden="true" key={`edge-${sequence}`}>
        <span>SELECT</span>
      </div>
      {active && !reduced && <div className="switch-overlay" key={`fx-${sequence}`} aria-hidden="true">
        <div className="switch-shard shard-a" /><div className="switch-shard shard-b" />
        <div className="switch-shard shard-c" /><div className="switch-shard shard-d" />
        <div className="switch-scan" />
        <div className="switch-title"><small>VYRATHEN // INTERFACE</small><strong>ENTITY LINK</strong><span>{targetName.toUpperCase()} / LOADING</span></div>
        <div className="switch-cross">✳</div>
      </div>}
    </>
  );
}
