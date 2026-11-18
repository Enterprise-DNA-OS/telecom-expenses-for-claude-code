---
description: Add a service note
---

# Add a service note

Read CLAUDE.md. Confirm the record and evidence from the operator brief before writing. Use the operator name with --actor.

```bash
npm run telecom -- log AKL-FIBRE --body="Carrier confirmed renewal terms" --actor="<operator name>"
```

Replace angle-bracket values with the supplied facts. Examples use fictional data and dates. Use --json for exact records; money is integer cents and every amount retains its currency. List ambiguous matches and ask which one. 

Present the result in plain language. Drafts stay in drafts/. Never send, pay, provision or disconnect a carrier service.
