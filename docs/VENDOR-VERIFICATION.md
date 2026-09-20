# Vendored xmldom verification

Verified on 2026-09-20. `vendor/xmldom` contains the complete, unmodified npm package `@xmldom/xmldom` 0.9.12 under its retained MIT license.

## Decision

The previous vendor tree matched the official 0.9.8 tarball byte-for-byte, but 0.9.8 is in 17 published upstream advisory ranges. The compatible 0.9.x fixes accumulated through 0.9.12, so the vendor was replaced with 0.9.12 rather than upgraded merely because a newer version existed.

Official upstream advisories affecting 0.9.8, grouped by the first patched 0.9.x release:

- 0.9.9: [GHSA-wh4c-j3r5-mjhp](https://github.com/xmldom/xmldom/security/advisories/GHSA-wh4c-j3r5-mjhp).
- 0.9.10: [GHSA-2v35-w6hq-6mfw](https://github.com/xmldom/xmldom/security/advisories/GHSA-2v35-w6hq-6mfw), [GHSA-f6ww-3ggp-fr8h](https://github.com/xmldom/xmldom/security/advisories/GHSA-f6ww-3ggp-fr8h), [GHSA-j759-j44w-7fr8](https://github.com/xmldom/xmldom/security/advisories/GHSA-j759-j44w-7fr8), and [GHSA-x6wf-f3px-wcqx](https://github.com/xmldom/xmldom/security/advisories/GHSA-x6wf-f3px-wcqx).
- 0.9.11: [GHSA-4w3w-2rp5-g8jm](https://github.com/xmldom/xmldom/security/advisories/GHSA-4w3w-2rp5-g8jm), [GHSA-g53g-w8rj-fmg7](https://github.com/xmldom/xmldom/security/advisories/GHSA-g53g-w8rj-fmg7), and [GHSA-w2rr-34g9-rvrj](https://github.com/xmldom/xmldom/security/advisories/GHSA-w2rr-34g9-rvrj).
- 0.9.12: [GHSA-27p8-2357-5qqv](https://github.com/xmldom/xmldom/security/advisories/GHSA-27p8-2357-5qqv), [GHSA-3px3-54cx-rmw9](https://github.com/xmldom/xmldom/security/advisories/GHSA-3px3-54cx-rmw9), [GHSA-6gmq-8vp8-gcm6](https://github.com/xmldom/xmldom/security/advisories/GHSA-6gmq-8vp8-gcm6), [GHSA-6h8r-xr42-gp59](https://github.com/xmldom/xmldom/security/advisories/GHSA-6h8r-xr42-gp59), [GHSA-6mj3-qw4j-hgrw](https://github.com/xmldom/xmldom/security/advisories/GHSA-6mj3-qw4j-hgrw), [GHSA-8344-3jmq-59r6](https://github.com/xmldom/xmldom/security/advisories/GHSA-8344-3jmq-59r6), [GHSA-93r5-fhx6-vmg9](https://github.com/xmldom/xmldom/security/advisories/GHSA-93r5-fhx6-vmg9), [GHSA-965w-775f-mr7g](https://github.com/xmldom/xmldom/security/advisories/GHSA-965w-775f-mr7g), and [GHSA-c7q8-3ch8-vqpv](https://github.com/xmldom/xmldom/security/advisories/GHSA-c7q8-3ch8-vqpv).

The advisory snapshot came from the upstream repository's [published security advisories API](https://api.github.com/repos/xmldom/xmldom/security-advisories). Advisories whose affected ranges begin at 0.9.10 or apply only to 0.9.11 were reviewed but do not affect 0.9.8.

## Registry and file evidence

| Version | Official registry metadata | Official tarball | Registry SHA-1 | Registry SHA-512 SRI | Downloaded tarball SHA-256 |
| --- | --- | --- | --- | --- | --- |
| 0.9.8 | [metadata](https://registry.npmjs.org/@xmldom%2fxmldom/0.9.8) | [tarball](https://registry.npmjs.org/@xmldom/xmldom/-/xmldom-0.9.8.tgz) | `1471e82bdff9e8f20ee8bbe60d4ffa8a516e78d8` | `sha512-p96FSY54r+WJ50FIOsCOjyj/wavs8921hG5+kVMmZgKcvIKxMXHTrjNJvRgWa/zuX3B6t2lijLNFaOyuxUH+2A==` | `eb85b871f14f569d1fd93b951cddfb22c9e9de1e8010838dbf256bafb67fc1fc` |
| 0.9.12 | [metadata](https://registry.npmjs.org/@xmldom%2fxmldom/0.9.12) | [tarball](https://registry.npmjs.org/@xmldom/xmldom/-/xmldom-0.9.12.tgz) | `1f84c07cb95ccf28202299f77b5fd7fc257151e8` | `sha512-5AXjrcMClTryPe9LgZrygpB1lj7s0S9E0+W+AHaVKAVyHanafK86iPSvG5xHVSp/jC+VH1UXu0TAEmY279xH7A==` | `08245e18c248b957b4c6e07f8549ad5f55ae11b7a8abd4c1113a0fd61ddc67ee` |

For both downloads, the computed SHA-1 and SHA-512 SRI matched the values returned by the registry. Each tarball declared and contained 15 regular package files. Before replacement, the old vendor tree had the same 15 relative paths and SHA-256 value as the extracted 0.9.8 file at every path. After replacement, the shipped tree has the same 15 relative paths and SHA-256 value as the extracted 0.9.12 file at every path. The per-file hashes are in `docs/vendor-sha256.json`.

## Limits

This verifies the downloaded archives against npm registry metadata and verifies the shipped bytes against those archives. The npm integrity value is a content digest, not an upstream signature. This audit did not reproduce the npm package from the Git tag, prove the publisher's identity, audit all parser source code, or predict future advisories. The advisory result is a snapshot of the upstream published feed on the verification date. Application regression and browser tests are separate checks and must pass before release.
