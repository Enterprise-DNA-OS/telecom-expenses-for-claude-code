---
description: Record invoice evidence and retention dates
---

# Record invoice evidence and retention dates

Read CLAUDE.md. Confirm the record and evidence from the operator brief before writing. Use the operator name with --actor.

```bash
npm run telecom -- invoice-evidence TEST-INV --evidence="Original invoice reference" --tax_year_end=2026-12-31 --retain_until=2033-12-31 --actor="<operator name>"
```

Replace angle-bracket values with the supplied facts. Examples use fictional data and dates. Use --json for exact records; money is integer cents and every amount retains its currency. List ambiguous matches and ask which one. 

Present the result in plain language. Drafts stay in drafts/. Never send, pay, provision or disconnect a carrier service.
