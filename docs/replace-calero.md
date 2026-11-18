# Move a Calero expense review desk

Start with one account and one closed billing period. Keep the original exports and invoice documents. The free base replaces the internal review workflow; agree separate carrier collection, procurement and payment connections before ending any managed service.

## Export and map

Calero's [VITA Rebilling User Guide](https://www.vita.virginia.gov/media/vitavirginiagov/services/pdf/tems/VITA-Agency---Rebilling-User-Guide.pdf), edited 1 June 2026, documents list-view Excel export on pages 12-13. Its invoice pages describe inventory references, charge categories, descriptions, amounts and cost centres. Permissions and selected views determine what the operator can export.

Export the relevant account, inventory, invoice and charge lists with their stable identifiers. Save each selected worksheet as UTF-8 CSV. Preserve codes as text. Reconcile all exported rows, not just the current page. Supply carrier and cost-centre reference lists, agreed monthly rates, notice periods, tax-year dates and evidence references from your source documents. There is no universal Calero column layout supplied here.

The input folder accepts carriers.csv, accounts.csv, centres.csv, services.csv, invoices.csv and charges.csv, in that order. Headers are the fields in docs/cli.md. Money must be converted to integer cents without rounding losses; dates must be ISO calendar dates. Translate charge categories to recurring, usage, one_off or tax. Keep currencies on the account, and split accounts when currencies differ.

examples/calero contains synthetic examples. examples/calero-map.json shows how an exported charge report can map headers. Map each target field to its source header. Mapping renames headers only: it does not silently convert money, dates or category values. Export layouts and mapping must be verified with your own records.

## One import command

```bash
npm run telecom -- import calero ./imports/cutover --mapping=./imports/field-map.json --batch=cutover --actor="Operator" --dry-run
```

Preview, check row counts and totals by account and currency, then repeat without --dry-run. Use no mapping flag when the files already use canonical headers. Every row is checked in one transaction. A failure rolls back the entire batch. Repeating a successful batch with identical bytes and mapping returns its original counts. Reusing a batch name with changed input fails. Existing record codes fail rather than overwrite history. For a later billing period, supply only new invoice and charge files referencing existing codes.

## Reconcile before using it

Run invoices, bill-audit, allocation-review, cost-centres and compliance. Match source counts and loaded totals. Match orphan charges using link-charge. Enter allocations using allocate. Record existing open claims with open-dispute and documented status changes. Record evidenced credits only after acceptance. The importer does not import allocation splits, dispute histories, attachments, payments, call records, device policies, carrier feeds or provisioning actions. Preserve those originals and scope any further migration separately.

Retention evidence is a reference, not an uploaded document. Keep original invoices and credit notes in controlled storage. Review-invoice checks header totals, evidence, known services and complete allocations, then locks original charges. It does not make or authorise a payment. Test a complete month and the next bill before switching your review process.
