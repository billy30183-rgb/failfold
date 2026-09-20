# Verification record — local v0.1.0 candidate

This record describes commands actually executed while preparing this delivery. It does not certify security, production readiness, Windows compatibility, remote CI or public deployment.

## Environment

Linux x64 container; Node.js v22.16.0; Python 3.13.5; Python Playwright 1.57.0; system Chromium 144.0.7559.96 (Debian 13). The container could not resolve external npm hosts, so no live npm registry integrity/advisory audit was completed. The XML parser was vendored from an already-installed package; see THIRD_PARTY_NOTICES.md.

## Executed checks

| Check | Actual result |
| --- | --- |
| `npm test` | 68 tests passed, 0 failed, 0 skipped. Includes unit tests, CLI/filesystem tests and an actual Node JUnit exporter integration fixture. |
| `npm run build` | Built the standalone `dist/index.html` (302,106 bytes), combined license notice and synthetic XML fixtures. |
| Build reproducibility | Successive builds from the same source produced the same HTML SHA-256, listed below. |
| Synthetic demo CLI | 240 failure/error records, 3 signature groups, 1 new vs supplied baseline, 0 warnings. Markdown and JSON written to `docs/demo-report.*`. |
| Chromium acceptance | 17 checks passed in the explicitly documented in-memory harness. |
| Browser/CLI parity | Demo JSON data and Markdown output compared exactly against the shared Node core. |
| Runtime network observation | Zero external HTTP(S) requests and zero page errors during the offline in-memory acceptance run. |
| Desktop/mobile visual review | Actual browser screenshots captured and inspected, including the 390px mobile viewport. |
| Synthetic benchmark | 10,000 failure records / 20 signatures / 1,638,944 bytes; 7 timed runs after one warm-up. Median 155.542 ms in this shared container. |

### Browser command actually run

```sh
FAILFOLD_IN_MEMORY_TEST=1 PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium python scripts/browser_test.py
```

The managed browser blocks direct `file://` and localhost HTTP navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. Accordingly, the harness loaded the **built HTML using Playwright `page.set_content`** with networking disabled. It exercised Chromium DOM, Blob Workers, real file inputs, exports, cancellation, search, baseline controls, malformed/DTD/oversize input, hostile text handling, pagination and responsive layout.

This is meaningful browser execution but **not** evidence of successful direct-file opening, localhost navigation, correct deployed MIME/CSP headers, or public website availability. The normal harness mode supports localhost or an explicit `LIVE_URL`; those navigation paths must be exercised in an unrestricted authorized environment before claiming them verified. Do not bypass organizational browser restrictions to obtain a green check.

Screenshots are actual test output, not generated mockups. `docs/browser-test-results.json` lists all 17 acceptance checks and marks the harness mode. `docs/unit-test-output.txt` is the actual 68-test runner output. The included CI workflow has not executed on GitHub.

### Built HTML SHA-256

```text
36de13e94ac83bf0840bd128f238ca99ae1f7f09cefbe2e435e8774f1a70e5e9
```

## Benchmark interpretation

See `docs/benchmark-results.json` and `scripts/benchmark.js`. This measures input-byte validation, parsing, structural/summary checks and exact grouping of deliberately repetitive synthetic failures. It excludes file I/O, fixture generation, Markdown, browser rendering and human triage. It is not a comparison with another product. No percentage of human time saved was measured. Dynamic traces may produce far less folding.

## Not yet verified or completed

Windows/macOS execution; direct-file opening and normal HTTP navigation; GitHub Actions or Pages; public repository/tag/release/name availability; npm publishing; current upstream package integrity/advisory audit; comprehensive emitter compatibility; a security review or hostile-input resource audit; actual users, usage statistics, human productivity improvement, or OpenAI application approval.

The tested Node emitter fixture is synthetic data emitted by the real Node runner. It is not a real maintainer's CI report. The other exporter-format tests are synthetic fixtures. Python Playwright UI acceptance does not validate Playwright test-runner JUnit report compatibility.

## Release handoff

Read `CODEX_HANDOFF.zh-TW.md`. Verify the actual GitHub identity as `billy30183-rgb`, request authorization before creating a new public repository, retain upstream licenses, perform the outstanding checks, and tie release/CI/deployment to the same verified commit. Do not modify another repository or interpret previous GlobGap publication consent as authorization for this project.
