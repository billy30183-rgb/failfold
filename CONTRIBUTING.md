# Contributing

Keep FailFold a small local tool. Changes should solve a demonstrated JUnit compatibility or triage problem without requiring accounts, telemetry, cloud services or AI inference.

Run `npm test` and `npm run build`. UI, parser or export changes also require `npm run test:browser` with Python/Playwright installed. Keep the browser/CLI parity assertion. Record actual OS, Node, Python, browser and command results; do not claim Windows or live deployment verification from Linux or in-memory testing.

A parser change needs a minimal synthetic or permission-cleared fixture, preserved failure evidence, expected counts and regression tests. Unsupported extensions must never silently turn a failed or retried test into a pass. Do not mask paths, numbers or stack lines as an undocumented grouping optimization. Baseline absence is not a repaired bug; matching signatures are not proven common causes.

Include MIT-compatible provenance for contributed code. Preserve third-party notices. Never commit private CI logs, tokens, personal paths, screenshots of private dashboards or real user reports without explicit authorization. Use synthetic fixtures by default. Benchmarks must disclose workload and environment and distinguish algorithm latency from human time savings.

Before publishing a release, review SECURITY.md and docs/VERIFICATION.md. Public release, npm publication, external issue creation and promotional posts require the maintainer's approval.
