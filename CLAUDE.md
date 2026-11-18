# Telecom Expenses for Claude Code

This is a carrier expense review desk for the organisation paying its own telecom bills. It is not a carrier, reseller billing engine, accounting ledger or payment service.

Read current records with npm run telecom before answering. Claude Code uses these commands; Codex, OpenCode and Cursor follow AGENTS.md and the same files.

## Operating rules

- Start with the operator's outcome. Read the invoice or service history before a change.
- All writes name --actor and record an action in the same transaction. Actor labels are attribution, not authentication.
- Amounts are integer cents. Do not add currencies together. Monthly reference comparisons are prompts; check taxes, proration and the service period.
- A reviewed invoice locks its charges and allocations. Review does not approve payment.
- Disputes move open, submitted, accepted, closed; open or submitted can become rejected. Accepted claims close only after evidenced credits cover the amount. Credits are a recovery register, not extra negative charge postings.
- Never send messages, submit orders, disconnect services, move money or delete records. Record a cessation only after the carrier action has happened. Draft for a person to send.
- Ambiguous names list candidates and exit. Never guess the match.
- Run npm test and npm run demo before committing. Add migrations, never edit applied ones.

## Routing

| Command | Job |
|---|---|
| /carriers | List carrier identities |
| /accounts | List carrier accounts and currencies |
| /centres | List cost centres |
| /services | Read the service inventory |
| /invoices | Reconcile invoice headers to charge totals |
| /charges | Read charge evidence and audit flags |
| /bill-audit | Find unknown services, ceased lines and rate differences |
| /allocation-review | Find charges without complete cost allocation |
| /cost-centres | Read allocated costs by centre and currency |
| /renewals-due | Review notice dates before renewal |
| /disputes | Read all dispute states and credits |
| /credit-chase | Chase outstanding carrier credits |
| /compliance | Check invoice retention and owner-information review |
| /audit | Read operator actions |
| /imports | Read import batches and counts |
| /attention | Review the current exception queues |
| /insights | Answer ten joined expense questions |
| /weekly-review | Prepare Monday carrier expense review |
| /history | Read a service, its charges, notes and actions |
| /add-carrier | Add a carrier record |
| /add-account | Add a account record |
| /add-centre | Add a centre record |
| /add-service | Add a service record |
| /add-invoice | Add a invoice record |
| /add-charge | Add a charge record |
| /allocate | Allocate charge cents to a cost centre |
| /link-charge | Match an orphan charge to an existing service |
| /review-service | Record a reviewed rate, renewal and cost centre |
| /follow-up | Record the next carrier follow-up date |
| /open-dispute | Register a disputed amount and supporting evidence |
| /dispute-status | Record a documented carrier dispute decision |
| /record-credit | Reconcile an evidenced credit against an accepted dispute |
| /service-status | Record a completed carrier cessation |
| /review-invoice | Lock a reconciled and allocated invoice |
| /invoice-evidence | Record invoice evidence and retention dates |
| /review-privacy | Record purpose and next owner-information review |
| /log | Add a service note |
| /import | Preview and import mapped Calero reports |
| /export | Export every business record and action |
| /draft-disputes | Prepare a private carrier credit review |
| /customise | Change a field or rule |
| /new-view | Add a read-only report |

## Storage

One CLI: scripts/telecom.mjs. Postgres migrations: supabase/migrations. Embedded PGlite when DATABASE_URL is empty; a PostgreSQL database when it is set. Keep data, imports, exports, drafts and generated reports private. Use a dedicated database role. Row security is enabled without public policies; shared hosting needs configured authentication, least privilege and backups.

Read docs/cli.md for arguments, docs/replace-calero.md for migration, docs/compliance.md for rule sources.

Installed and run as Omni by Enterprise DNA: https://enterprisedna.co/omni/instead-of/calero
