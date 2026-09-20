# FailFold v0.1.0

Group matching JUnit XML failure signatures locally, compare an optional baseline, inspect original occurrences, and export Markdown or JSON. The standalone browser page and Node CLI share the same engine. No accounts, uploads, telemetry or AI inference.

The synthetic demonstration folds 240 failure records into 3 signature groups. This reduces reading entries, not a measured amount of debugging time; matching signatures do not prove a shared root cause.

Includes exact and opt-in formatting modes, source preservation including matching baseline records, malformed/unsupported XML rejection, input limits, cancellable browser analysis, and CLI overwrite safeguards. Vendored xmldom 0.9.12 retains its MIT license.

Known limits: only the documented JUnit subset is supported; exports can contain private information and are not automatically redacted. “Seen” is relative to the supplied baseline; “not observed” does not mean fixed. No npm package is published.
