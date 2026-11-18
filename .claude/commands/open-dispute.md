---
description: Register a disputed amount and supporting evidence
---

# Register a disputed amount and supporting evidence

Read CLAUDE.md. Confirm the record and evidence from the operator brief before writing. Use the operator name with --actor.

```bash
npm run telecom -- open-dispute CH-001 --code=DSP-002 --name="Rate difference" --cents=5000 --reason="Above agreed rate" --follow_up_on=2026-12-01 --evidence="Contract reference" --actor="<operator name>"
```

Replace angle-bracket values with the supplied facts. Examples use fictional data and dates. Use --json for exact records; money is integer cents and every amount retains its currency. List ambiguous matches and ask which one. 

Present the result in plain language. Drafts stay in drafts/. Never send, pay, provision or disconnect a carrier service.
