---
description: Record a completed carrier cessation
---

# Record a completed carrier cessation

Read CLAUDE.md. Confirm the record and evidence from the operator brief before writing. Use the operator name with --actor.

```bash
npm run telecom -- service-status AKL-BACKUP --status=ceased --ceased_on=2026-11-01 --evidence="Carrier cessation confirmation" --actor="<operator name>"
```

Replace angle-bracket values with the supplied facts. Examples use fictional data and dates. Use --json for exact records; money is integer cents and every amount retains its currency. List ambiguous matches and ask which one. 

Present the result in plain language. Drafts stay in drafts/. Never send, pay, provision or disconnect a carrier service.
