# FailFold v0.1.1

This patch release keeps the existing parser, grouping, reports and browser behavior unchanged while fixing two CLI argument/path edge cases.

- `--` now ends option parsing before filenames such as `--help`, so help-like report names can be analyzed explicitly.
- Output validation now rejects dangling symlinks before analysis or writing, including when `--force` is supplied. This closes the gap where a forced write could follow a dangling file symlink and create its target.
- Regression coverage exercises both behaviors, including a Windows junction fallback when file-symlink creation is unavailable.

The supported JUnit subset, input limits and privacy boundaries are unchanged. Exports can contain private information and are not automatically redacted. No npm package is published.
