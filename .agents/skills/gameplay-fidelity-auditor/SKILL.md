---
name: gameplay-fidelity-auditor
description: Use when a proposed UI, feature or implementation changes Vyrathen's battle rules, stats, economy, missions, equipment or historical claims.
---

# gameplay-fidelity-auditor

1. Read docs/HISTORICAL_RULES.md, docs/ORIGEN_REGLAS.md, docs/SOURCE_OF_TRUTH.md and docs/ARCHITECTURE_AND_QUALITY.md.
2. Keep provenance explicit in existing code enums: historical_document, observed_on_page and remake_assumption. For inference use docs schema without silently changing runtime enum.
3. Do not infer original PHP algorithms from Wayback front-end assets. Unverified AI, initiative, damage and prices are assumptions.
4. Guard 5v5, 10 rounds, defender wins ties, documented type cycle and MP/KO invariants with deterministic seeded tests.
5. Never promote Selene/Kuroe/Orion UI fixture stats, skills or slot counts to true gameplay data. Keep archive code/assets and private research out of git.
6. Return a provenance matrix, unresolved assumptions, targeted regression tests and copyright caveats.
