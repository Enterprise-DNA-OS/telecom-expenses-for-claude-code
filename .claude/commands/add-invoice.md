---
description: Add a invoice record
---

# Add a invoice record

Read CLAUDE.md. Confirm the record and evidence from the operator brief before writing. Use the operator name with --actor.

```bash
npm run telecom -- add-invoice --code="<code>" --name="<name>" --account="<account>" --issued_on="<issued_on>" --period_start="<period_start>" --period_end="<period_end>" --due_on="<due_on>" --total_cents="<total_cents>" --tax_year_end="<tax_year_end>" --retain_until="<retain_until>" --actor="<operator name>"
```

Replace angle-bracket values with the supplied facts. Examples use fictional data and dates. Use --json for exact records; money is integer cents and every amount retains its currency. List ambiguous matches and ask which one. 

Present the result in plain language. Drafts stay in drafts/. Never send, pay, provision or disconnect a carrier service.
