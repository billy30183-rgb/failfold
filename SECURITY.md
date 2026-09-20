# Security and privacy boundaries

FailFold reads selected reports as untrusted data. It does not execute code from them, contact their referenced URLs, upload them, or store them in browser localStorage/IndexedDB. The browser build uses a Blob Worker; displayed report data uses text nodes. A content security policy blocks connection requests. The built HTML contains the parser and application scripts; its inline-script allowance is not permission to insert untrusted HTML.

DTD/entity declarations are conservatively rejected before parsing, including declaration-looking content inside CDATA. Size, count, element and depth guards limit supported inputs. Malformed XML and unsupported result extensions fail closed. This is not a security certification or a guarantee against all hostile-input denial of service. DOM parsing occurs before DOM depth inspection, so even a byte-limited adversarial input can be expensive. The browser cancels analysis after 15 seconds; the CLI has no independent watchdog.

The Node CLI only reads explicitly selected files/directories. It does not follow symbolic-link inputs. It refuses direct, symlink and existing hard-link output aliases of input files. Checks are not an OS sandbox or a protection against a concurrently malicious local process changing paths between checks and writes. Output writes are not a multi-file atomic transaction.

The application has **no automatic secret redaction**. XML-decoded error text, test metadata and report paths can contain access tokens, internal domains, filesystem paths or personal data. They remain in exported JSON/Markdown. Browser memory is not secure erasure; downloads persist until the user deletes them. Never submit a raw private report to an issue or application form.

Vendored parser: `@xmldom/xmldom` 0.9.12, unmodified MIT. Its official npm tarball integrity and all 15 shipped files were verified on 2026-09-20. Version 0.9.8 was replaced because official upstream advisories mark it affected by XML injection and denial-of-service flaws fixed across 0.9.9–0.9.12. See `docs/VENDOR-VERIFICATION.md` for evidence and limits. The parser remains inside the input-size, declaration-rejection and timeout boundaries described above; provenance verification is not a security certification.

## Reporting a vulnerability

This is an unpublished candidate and no private reporting endpoint has been configured. The maintainer must enable and document a private reporting channel before public launch. Do not send secrets to a placeholder address or file a public exploitable proof containing private data. A sanitized minimal reproduction, affected version and expected/actual behavior are useful for responsible review.
