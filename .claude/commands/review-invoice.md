---
description: Lock a reconciled and allocated invoice
---

# Lock a reconciled and allocated invoice

Read CLAUDE.md. Confirm the record and evidence from the operator brief before writing. Use the operator name with --actor.

```bash
npm run telecom -- review-invoice DEMO-NOV --evidence="Compared with source invoice" --actor="<operator name>"
```

Replace angle-bracket values with the supplied facts. Examples use fictional data and dates. Use --json for exact records; money is integer cents and every amount retains its currency. List ambiguous matches and ask which one. Read the invoice and allocation-review first. Review locks the original charges; it does not approve or make a payment.

Present the result in plain language. Drafts stay in drafts/. Never send, pay, provision or disconnect a carrier service.
