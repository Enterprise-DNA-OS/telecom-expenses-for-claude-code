# Record checks and their sources

Checked 18 November 2026. The compliance command flags evidence gaps for human review. It does not certify legal compliance or calculate tax.

## NZ-TAX-7: invoice evidence and retention

[Inland Revenue's record keeping guidance](https://www.ird.govt.nz/records) requires records for at least seven tax years and sets language and offshore-storage conditions. Its [Smart Business guide](https://www.ird.govt.nz/-/media/project/ir/home/documents/forms-and-guides/ir300---ir399/ir320/ir320.pdf) describes retention from the end of the relevant tax year or taxable period.

An invoice stores tax_year_end, retain_until and evidence. The check flags missing evidence or a retention date earlier than tax_year_end plus seven years. The operator supplies the correct year end. An evidence reference does not prove that a file exists, is readable, or meets all tax requirements. Verify original documents, longer holds, language, backups and offshore approval separately. No automatic deletion runs.

## NZ-IPP9: owner-information review

[Privacy Principle 9](https://www.privacy.org.nz/privacy-principles/9/) limits personal-information retention to its lawful purpose. Where a service has owner_name, the check flags a missing purpose, missing review date or overdue review. The review date is an internal reminder, not a statutory retention period. review-privacy records a reviewed purpose, next review date and evidence. Do not erase financial records needed under another obligation.

## Operational controls

Money uses cents and currency-separated totals. Foreign keys preserve relationships. The CLI refuses cross-account charges and credits, over-allocation, excess claims and closing an accepted claim before its credits arrive. These are business controls, not claims that Calero lacks equivalent features. Row security and revoked public grants are a starting point; authentication, least-privilege roles, backups and access review are required for shared deployment. Actors are self-declared labels. Database administrators can alter records, so the action trail is not tamper-proof.

Australia and other jurisdictions require their own reviewed retention policies. The supplied checks are NZ record prompts, not a substitute for that review.
