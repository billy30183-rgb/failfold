# Positioning, not a novelty claim

Existing reporting tools already support failure categorization. For example, Allure's official `categories.json` documentation describes category matching by message regex, trace regex and test status: https://allurereport.org/docs/how-it-works-categories-file/ . FailFold is not the world's first failure-grouping tool, nor has it been benchmarked against Allure.

FailFold's chosen scope is a standalone HTML plus install-free-from-source Node CLI, both sharing a deterministic parser/grouping engine. Users bring a current and optional baseline set of common JUnit XML files. There is no server integration, account, runtime network access, history database, upload or AI root-cause prediction. All original failure occurrences remain reviewable.

This combination is a product design choice, not evidence that no other software has the same combination. No exhaustive product, trademark or package-name clearance has been performed. Check the proposed name and release namespace before publication.

Good fit: repeated setup failures across jobs, small teams wanting ad-hoc local triage, and comparisons of downloaded report sets. Weak fit: predominantly distinct traces, errors that differ in source paths or dynamic IDs, exporter-specific retry metadata, or teams needing hosted collaboration and long-term flaky-test analytics.

The working hypothesis is that grouping repeated identical evidence can reduce rereading while retaining auditability. A real-user study is still required to establish the size of the benefit. Synthetic compression ratios cannot substitute for it.
