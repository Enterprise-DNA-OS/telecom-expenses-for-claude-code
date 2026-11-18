---
description: Preview and import mapped Calero reports
---

# Preview and import mapped Calero reports

Read CLAUDE.md. Confirm the record and evidence from the operator brief before writing. Use the operator name with --actor.

```bash
npm run telecom -- import calero ./examples/calero --batch=example-cutover --dry-run --actor="<operator name>"
```

Replace angle-bracket values with the supplied facts. Examples use fictional data and dates. Use --json for exact records; money is integer cents and every amount retains its currency. List ambiguous matches and ask which one. Read docs/replace-calero.md. Preview first, reconcile source counts and currency totals, then repeat with the same batch name without --dry-run. Never invent a missing source field.

Present the result in plain language. Drafts stay in drafts/. Never send, pay, provision or disconnect a carrier service.
