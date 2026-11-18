---
description: Record a reviewed rate, renewal and cost centre
---

# Record a reviewed rate, renewal and cost centre

Read CLAUDE.md. Confirm the record and evidence from the operator brief before writing. Use the operator name with --actor.

```bash
npm run telecom -- review-service AKL-FIBRE --monthly_cents=30000 --renewal_on=2027-11-18 --notice_days=30 --centre=OFFICE --evidence="Reviewed carrier contract" --actor="<operator name>"
```

Replace angle-bracket values with the supplied facts. Examples use fictional data and dates. Use --json for exact records; money is integer cents and every amount retains its currency. List ambiguous matches and ask which one. 

Present the result in plain language. Drafts stay in drafts/. Never send, pay, provision or disconnect a carrier service.
