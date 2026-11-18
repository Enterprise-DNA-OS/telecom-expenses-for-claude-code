---
description: Prepare Monday carrier expense review
---

# Prepare Monday carrier expense review

Read CLAUDE.md. Read the current data before answering.

```bash
npm run telecom -- weekly-review
```

Replace angle-bracket values with the supplied facts. Examples use fictional data and dates. Use --json for exact records; money is integer cents and every amount retains its currency. List ambiguous matches and ask which one. Run bill-audit, credit-chase and renewals-due separately first. Name each unresolved item, owner and next date. Do not report a credit as recovered until it appears in the evidence records.

Present the result in plain language. Drafts stay in drafts/. Never send, pay, provision or disconnect a carrier service.
