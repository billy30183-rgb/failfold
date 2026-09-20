# Public deployment verification — 2026-09-20

Repository: https://github.com/billy30183-rgb/failfold

Live site: https://billy30183-rgb.github.io/failfold/

Initial verified source commit: `853fddc4acd63db5ee118c6959bda7b316dad889`.

[CI and deployment run](https://github.com/billy30183-rgb/failfold/actions/runs/35478554874): Windows core, Linux core, Chromium browser and dependent Pages deployment all succeeded. Each core run executes 73 tests and verifies generated dist/examples against source. The browser job executes 17 acceptance checks. Deployment publishes dist only.

The public URL then passed all 17 acceptance checks through normal navigation in Edge 153, driven by Playwright 1.57. Network is disabled after the initial page load. The run checks demo counts, evidence expansion, search, baseline filters and clearing, Node/browser JSON and Markdown equality, uploads, malicious text, malformed XML, DTDs, unknown failures, size guard, cancellation, 390px mobile layout, and zero additional external requests/page errors. Current README screenshots came from this live-site run and were visually reviewed.

Both deployed HTML and LICENSE.txt SHA-256 values matched local dist. HTML: `0b4099c10016529872dc26784090312e28daef1c2f36a8fd287526824aa5ffb7`.

Private vulnerability reporting is enabled. No npm publication, promotional posting or application submission was performed. Repository stars/adoption and human time savings are not claimed. Original delivery evidence remains historical and must not be substituted for current checks.

The final documentation commit must pass the same workflow and live acceptance again before v0.1.0 is tagged; final SHA and run URLs are recorded in the release and external handoff to avoid changing an already verified commit merely to record its own hash.
