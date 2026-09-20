# Third-party notices

## @xmldom/xmldom 0.9.12

Source: https://github.com/xmldom/xmldom
Registry: https://registry.npmjs.org/@xmldom%2fxmldom/0.9.12

The unmodified package files in `vendor/xmldom` match the official npm 0.9.12 tarball byte-for-byte. Its registry SHA-512 integrity value was verified before extraction. The MIT license and original notices are retained in `vendor/xmldom/LICENSE`; they are also included in `dist/LICENSE.txt` and the standalone HTML. The browser build wraps, but does not edit, the package's CommonJS library modules.

`docs/vendor-sha256.json` records the shipped files' SHA-256 hashes. `docs/VENDOR-VERIFICATION.md` records the registry integrity, complete file comparison, advisory decision and verification limits. Vendoring means npm's empty top-level dependency tree does not establish that dependencies are vulnerability-free.

## Development dependencies

Python Playwright 1.57.0 is pinned in `requirements-dev.txt` to reproduce the tested harness API. It and Chromium are development tools, not shipped application runtime libraries. Their own distribution licenses apply. No browser executable or font file is included in this project archive.

## GitHub Actions

The workflows pin official releases to immutable commits verified through each action repository's GitHub API on 2026-09-20: `actions/checkout` v7.0.1 (`3d3c42e5aac5ba805825da76410c181273ba90b1`), `actions/setup-node` v7.0.0 (`820762786026740c76f36085b0efc47a31fe5020`), `actions/setup-python` v7.0.0 (`5fda3b95a4ea91299a34e894583c3862153e4b97`), `actions/upload-pages-artifact` v5.0.0 (`fc324d3547104276b827a68afc52ff2a11cc49c9`), and `actions/deploy-pages` v5.0.1 (`368f82528645a54fb793d4d04e342629a3f51346`). Actions run remotely only after an authorized repository publication.
