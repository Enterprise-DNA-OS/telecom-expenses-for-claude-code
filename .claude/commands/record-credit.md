---
description: Reconcile an evidenced credit against an accepted dispute
---

# Reconcile an evidenced credit against an accepted dispute

Read CLAUDE.md. Confirm the record and evidence from the operator brief before writing. Use the operator name with --actor.

```bash
npm run telecom -- record-credit DSP-001 --invoice=DEMO-NOV --code=CR-002 --name="Balance credit" --cents=15000 --received_on=2026-11-18 --evidence="Credit note reference" --actor="<operator name>"
```

Replace angle-bracket values with the supplied facts. Examples use fictional data and dates. Use --json for exact records; money is integer cents and every amount retains its currency. List ambiguous matches and ask which one. 

Present the result in plain language. Drafts stay in drafts/. Never send, pay, provision or disconnect a carrier service.
