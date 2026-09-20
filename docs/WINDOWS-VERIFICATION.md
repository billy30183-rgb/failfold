# Windows source verification — 2026-09-20

This is a new verification of the supplied source, not a restatement of the original Linux results in VERIFICATION.md. Original supplied records were preserved separately before rerunning generators.

## Environment and results

Windows x64, Node v24.14.1, Python 3.12.14, Python Playwright 1.57.0, installed Microsoft Edge 153.0.4234.32 (Chromium). No in-memory HTML fallback was enabled.

- `npm.cmd test`: 73 passed, zero failed/skipped. Core, CLI, real Node JUnit exporter, Unicode/space paths, input overwrite protection, hard-linked output protection, and stale Worker event regressions.
- `npm.cmd run build`: passed twice; identical HTML SHA-256 `0b4099c10016529872dc26784090312e28daef1c2f36a8fd287526824aa5ffb7`.
- `npm.cmd run test:browser`: 17/17 with actual loopback HTTP navigation, then 17/17 with actual file URL navigation. Each run disables network after navigation and verifies demo, uploads, search, baseline removal, exports matching Node, malformed XML, DTD rejection, uninformative failures, size limits, cancellation, 390px layout, and zero external requests/page errors. File URL automation is not a claim that a human double-clicked the file.
- `node src/cli.js examples/current --baseline examples/baseline --output docs/demo-report.md --json docs/demo-report.json --force`: 240 records, 3 groups, zero warnings.
- `npm.cmd run benchmark`: synthetic 10,000 failure records / 20 signatures, seven timed iterations, median 209.637 ms. This excludes human reading, browser rendering, disk IO and Markdown export; it is not measured debugging time saved.

## Necessary corrections

Retain matched baseline records in JSON/Markdown; normalize colon-form ANSI SGR only in formatting mode; prevent stale Worker errors from cancelling newer work; reject hard-linked Markdown/JSON output destinations before writing; read browser-test exports explicitly as UTF-8 on Windows. Regressions exposed product defects before their fixes. The original browser harness failed on Windows cp950 before the explicit UTF-8 correction.

The vendored XML parser was updated from 0.9.8 to verified, unmodified 0.9.12 because of published upstream security advisories. See VENDOR-VERIFICATION.md. MIT notices remain in source and the built single-file app.

## Publication status at local handoff and limits

Subsequent authorized publication is recorded in [PUBLICATION-VERIFICATION.md](PUBLICATION-VERIFICATION.md). The paragraph below preserves the earlier local-only status.

No FailFold public repository, remote CI, Pages deployment or release has been created in this verification. The workflow is prepared with pinned official action commits; deployment depends on both Windows/Linux core checks and browser checks of the same commit. Only dist is uploaded, only main deploys, and PR jobs have read-only contents permission. Remote execution remains unverified.

Current desktop/mobile screenshots are from the rebuilt application. Local file and HTTP results apply to the recorded Edge environment, not every browser or managed policy. Cancellation and late events were tested; no real 15-second timeout run was performed. Source inspection and tests are not a security certification or an OpenAI acceptance guarantee. Public links and launch copy must be finalized after authorized live deployment.
