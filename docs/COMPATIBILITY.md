# JUnit XML compatibility

JUnit XML is a de facto interchange family, not one universal official schema. The Testmo-maintained reference explains this background and common elements: https://github.com/testmoapp/junitxml . Compatibility should be tested with actual output, not assumed because two tools both say “JUnit”.

## Accepted common subset

UTF-8 XML with a `testsuite` or `testsuites` root; nested suites and namespace prefixes; `testcase` children; `failure` and `error` text or CDATA plus optional type/message; `skipped`; optional testcase name, classname, file and line; properties/stdout/stderr as ignored metadata. XML entities built into XML are decoded normally; custom DTD/entity declarations are refused.

Counts are computed from testcase elements, never by adding parent and child summaries. Both root and nested summaries are checked for missing failure evidence. A declared testcase-count mismatch is a warning; a declared failure/error count exceeding available failure/error records is rejected. Blank failure text is retained as separate unknown evidence.

Unsupported suite-level errors, unrecognized result children, retry extensions such as `flakyFailure`/`rerunFailure`, nested markup inside failure/error text, non-UTF-8 encodings and malformed/repaired XML are refused. Some valid exporter variants are therefore intentionally unsupported in v0.1.0. This trades convenience for avoiding misleading green reports.

## Actual exporter integration exercised

The test suite invokes the **Node.js v22.16.0 built-in JUnit reporter** on three synthetic tests (one pass, one fail, one skipped), then analyzes its actual emitted XML through the CLI and checks all three outcomes. This is an integration fixture, not a claim to support every Node version or every test framework.

All other included compatibility checks are hand-authored synthetic fixtures. No end-to-end pytest, Playwright test-runner JUnit, Maven, Gradle, Jenkins or GitLab exporter compatibility has been claimed. Python Playwright is used to test our browser UI; that is a separate matter from accepting Playwright's JUnit exporter.

## Add an exporter fixture

Use the exporter's documented command on a tiny public synthetic test suite, record tool version and options, then test pass/fail/skip/error, nesting, Unicode, retries and incomplete summaries. Preserve its license/provenance. Never copy a private production test report to obtain coverage.
