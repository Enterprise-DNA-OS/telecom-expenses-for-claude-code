# CLI reference

Node 22 or newer. Run npm run telecom -- help --json for field metadata. Flags use --field=value; quote values containing spaces. Calendar dates use YYYY-MM-DD. Codes are stable keys. Names match case-insensitively; ambiguous names and identifier prefixes exit 1 with candidates. Missing or invalid input exits 1.

Use npm run migrate before first use. npm run seed is for fictional demo workspaces only. npm test and npm run demo always use disposable embedded databases and ignore DATABASE_URL.

## Reads

- carriers: List carrier identities.
- accounts: List carrier accounts and currencies.
- centres: List cost centres.
- services: Read the service inventory.
- invoices: Reconcile invoice headers to charge totals.
- charges: Read charge evidence and audit flags.
- bill-audit: Find unknown services, ceased lines and rate differences.
- allocation-review: Find charges without complete cost allocation.
- cost-centres: Read allocated costs by centre and currency.
- renewals-due: Review notice dates before renewal.
- disputes: Read all dispute states and credits.
- credit-chase: Chase outstanding carrier credits.
- compliance: Check invoice retention and owner-information review.
- audit: Read operator actions.
- imports: Read import batches and counts.
- attention: Review the current exception queues.
- insights: Answer ten joined expense questions.
- weekly-review: Prepare Monday carrier expense review.
- history: Read a service, its charges, notes and actions.
- export: Export every business record and action.
- draft-disputes: Prepare a private carrier credit review.

## Add records

- add-carrier: code, name. A trailing ? means optional.
- add-account: code, name, carrier, currency. A trailing ? means optional.
- add-centre: code, name. A trailing ? means optional.
- add-service: code, name, account, centre?, owner_name?, location?, monthly_cents, renewal_on, notice_days?, purpose?, privacy_review_on?. A trailing ? means optional.
- add-invoice: code, name, account, issued_on, period_start, period_end, due_on, total_cents, tax_year_end, retain_until, evidence?. A trailing ? means optional.
- add-charge: code, name, invoice, service?, service_ref?, kind, amount_cents. A trailing ? means optional.

Use --actor for every add. References accept code, name or identifier prefix. Services start active; invoices start draft. A charge kind is recurring, usage, one_off or tax. Tax can have no service. A missing service on any other charge creates an audit flag. Credit notes are reconciled with record-credit, not a negative charge.

## Changes and import

### invoice-evidence

`npm run telecom -- invoice-evidence TEST-INV --evidence="Original invoice reference" --tax_year_end=2026-12-31 --retain_until=2033-12-31 --actor="Operator"`

Record invoice evidence and retention dates.

### allocate

`npm run telecom -- allocate CH-002 --centre=OPS --cents=20000 --actor="Operator"`

Allocate charge cents to a cost centre.

### link-charge

`npm run telecom -- link-charge CH-003 --service=AKL-BACKUP --evidence="Checked inventory reference" --actor="Operator"`

Match an orphan charge to an existing service.

### review-service

`npm run telecom -- review-service AKL-FIBRE --monthly_cents=30000 --renewal_on=2027-11-18 --notice_days=30 --centre=OFFICE --evidence="Reviewed carrier contract" --actor="Operator"`

Record a reviewed rate, renewal and cost centre.

### follow-up

`npm run telecom -- follow-up DSP-001 --follow_up_on=2026-12-01 --note="Carrier case review" --actor="Operator"`

Record the next carrier follow-up date.

### open-dispute

`npm run telecom -- open-dispute CH-001 --code=DSP-002 --name="Rate difference" --cents=5000 --reason="Above agreed rate" --follow_up_on=2026-12-01 --evidence="Contract reference" --actor="Operator"`

Register a disputed amount and supporting evidence.

### dispute-status

`npm run telecom -- dispute-status DSP-002 --status=submitted --evidence="Carrier case reference" --actor="Operator"`

Record a documented carrier dispute decision.

### record-credit

`npm run telecom -- record-credit DSP-001 --invoice=DEMO-NOV --code=CR-002 --name="Balance credit" --cents=15000 --received_on=2026-11-18 --evidence="Credit note reference" --actor="Operator"`

Reconcile an evidenced credit against an accepted dispute.

### service-status

`npm run telecom -- service-status AKL-BACKUP --status=ceased --ceased_on=2026-11-01 --evidence="Carrier cessation confirmation" --actor="Operator"`

Record a completed carrier cessation.

### review-invoice

`npm run telecom -- review-invoice DEMO-NOV --evidence="Compared with source invoice" --actor="Operator"`

Lock a reconciled and allocated invoice.

### review-privacy

`npm run telecom -- review-privacy AKL-FIBRE --purpose="Service contact" --review_on=2027-11-18 --evidence="Owner information review" --actor="Operator"`

Record purpose and next owner-information review.

### log

`npm run telecom -- log AKL-FIBRE --body="Carrier confirmed renewal terms" --actor="Operator"`

Add a service note.

### import

`npm run telecom -- import calero ./examples/calero --batch=example-cutover --dry-run --actor="Operator"`

Preview and import mapped Calero reports.

Allocation replaces the amount for that charge and centre; it never appends a duplicate. Sum allocations cannot exceed the charge. Service and charge accounts must match. Credits require accepted disputes and the same carrier account. Do not reuse a credit-note line under a different code. These are operator-entered references, not an automated carrier feed.

Exports contain every domain entity, import batch and action with a format version. They are a complete structured backup; restore requires a reviewed database restore process. The Calero importer is for initial mapped reports, not a general JSON restore tool. Output files refuse overwrite and path traversal.
