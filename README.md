# Telecom Expenses for Claude Code

Own the records behind your carrier bill review: services, invoices, allocations, disputes and credits in a database you control.

## Three ways to use it

**Do it yourself.** Free, open source. Install the project, run the demo and bring mapped exports across. Use Claude Code, Codex, OpenCode or Cursor. Hosting and your agent subscription are separate.

**We customise it.** Enterprise DNA maps your Calero exports, adds your fields and review rules, and builds the screens or connections you need. A different stack is available. One setup fee, then a retainer.

**We run it for you.** Omni by Enterprise DNA installs, connects and operates your version. One setup fee, then a monthly retainer. [Book a 30-minute call](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=calero&utm_medium=github).

## Quick start

Node 22 or newer on Linux, Windows or macOS.

```bash
npm install
npm test
npm run demo
```

The demo creates a disposable fictional database and prints its report folder. Tests and demo ignore DATABASE_URL. For a persistent demo, run npm run migrate, npm run seed, then npm run telecom -- weekly-review. For real records, migrate only and use the import guide. DATA_DIR selects the embedded PGlite directory; DATABASE_URL selects PostgreSQL. Remote TLS certificates are verified.

## What ships

42 slash commands, 40 CLI commands, three printable dashboards and three document types: invoice reviews, draft carrier dispute letters and renewal briefs. Set your name, colours and logo in brand.json. No server, send action or payment connection.

The desk checks recurring charges against a service's monthly reference, identifies charges after cessation, tracks incomplete allocations and reconciles accepted disputes against evidenced credits. A monthly rate flag requires review of proration, tax and billing periods. Credits stay in a recovery register and are not subtracted twice from invoice totals. Currencies are never combined.

[CLI reference](docs/cli.md) · [Move from Calero](docs/replace-calero.md) · [Compliance prompts](docs/compliance.md) · [Scope and screens](docs/why-no-front-end.md) · [Research](docs/research.md).

## Bring your records across

```bash
npm run telecom -- import calero ./imports/cutover --mapping=./imports/field-map.json --batch=cutover --actor="Operator" --dry-run
```

Preview and reconcile counts and account totals, then repeat without --dry-run. Calero documents Excel export; save the selected sheets as CSV and map their fields first. The included fixtures are synthetic, not a universal Calero export. One command imports the mapped carrier, account, cost-centre, service, invoice and charge files transactionally. Original documents, allocations, dispute history and payment workflows require separate reconciliation.

## Ten questions to ask today

Run npm run telecom -- insights. Each question has a real query. Calero also has reporting; this is not a claim that it cannot answer similar questions.

1. Which ceased services are still billed?
2. Which recurring charges exceed the service reference?
3. Which charges have no known service?
4. Which service decisions are due before renewal?
5. Which accepted disputes still await a credit?
6. Which charges remain partly or wholly unallocated?
7. Which invoices disagree with loaded charge totals?
8. Which active services have no cost centre?
9. Which unreviewed invoices are overdue?
10. Which billed services also need a privacy review?

## Your first hour: ten things to ask for

1. Find the charges on services we already ceased.
2. Show rate differences and their source invoice.
3. List unallocated costs before the month closes.
4. Read the history of our Auckland fibre.
5. Show accepted claims without all their credits.
6. Draft the carrier follow-up for review.
7. Show decisions due before a renewal notice date.
8. Preview a small exported billing period.
9. Put our name and colours on the renewal brief.
10. Add our allocation rule with /customise and a report with /new-view.

## Commands

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

## Operating scope

Trusted operator workspace. Actor labels are not sign-in. Row security is enabled and public access is revoked; configure authentication, least privilege, access reviews and backups before shared use. Do not store production credentials in the repository. Invoice evidence is a reference to a document you keep separately. The compliance command checks record fields and prompts review; it cannot certify legal compliance.

Tests exercise all CLI commands, valid and refused transitions, allocation limits, account and currency guards, CSV preview/replay/rollback, complete exports, private drafts and escaped HTML. The workflow runs Windows, Linux and PostgreSQL 16. Read the actual workflow results for execution evidence.

MIT. Copyright (c) 2026 Enterprise DNA. Not affiliated with Calero.
