# Forma CRM / ERP — Business Documentation

**Document date:** 4 October 2026  
**Audience:** Business owners, sales teams, account managers, finance coordinators and operations staff  
**Scope:** Current functionality implemented in this repository

## 1. Business purpose

Forma brings customer relationships and everyday business operations into one workspace. It helps a team maintain customer information, track sales opportunities, monitor invoice payment statuses, keep a basic product stock register and organize follow-up tasks.

The business objectives are to improve visibility of open opportunities, make outstanding invoices easier to identify, clarify responsibility for records and support daily prioritization through a shared overview.

The current application is a local, single-workspace CRM with basic ERP-style registers. The interface is in English and monetary values use United States dollars (USD).

## 2. Business users and responsibilities

The following responsibilities describe how a business can use the application. They are organizational responsibilities, not access roles enforced by the system.

| Business user | Typical responsibilities | Primary areas |
| --- | --- | --- |
| Business owner or manager | Review revenue, customer activity, pipeline value and outstanding invoices | Overview, all modules |
| Sales representative | Record prospects, maintain opportunities and update deal stages | Customers, Sales pipeline, Tasks |
| Account manager | Maintain customer details, relationship value and follow-up work | Customers, Tasks |
| Finance coordinator | Maintain invoice records, record payment status and follow up on overdue amounts | Invoices, Tasks, notifications |
| Operations coordinator | Maintain product prices, quantities and stock labels | Products, Tasks |

The displayed profile, **Alex Morgan — Workspace admin**, is a preset persona. There is no login, user management or permission enforcement. The record editor offers three owner labels: Alex Morgan, Jamie Lee and Sam Wilson. Selecting an owner records responsibility; it does not grant access or notify that person.

## 3. Functional scope

| Area | Business capability |
| --- | --- |
| Overview | Review key totals, historical paid-invoice revenue, sales stages, customer records and tasks |
| Customers | Maintain customer names, companies, optional email addresses, relationship status and manually entered lifetime value |
| Sales pipeline | Track opportunities in a board organized by sales stage |
| Invoices | Track invoice references, amounts and payment statuses |
| Products | Maintain categories, unit prices, quantities and stock statuses |
| Tasks | Assign work, specify due dates and record progress or completion |
| Search and filters | Narrow the current module by text and status |
| Export | Download the current module selection or the entire workspace as CSV |
| Notifications | Review invoices marked overdue and unfinished tasks due today or earlier |
| Settings | Switch appearance and export the current view; view the fixed USD currency |

Each of the five record modules supports creating, viewing, editing and permanently deleting records.

## 4. Core business information

All modules use a common record structure, with field meanings adapted to the module.

| Information | Business meaning and rules |
| --- | --- |
| Record ID | Automatically assigned internal identifier; separate from the user-entered name or invoice reference |
| Record type | Customer, deal, invoice, product or task; cannot be changed after creation |
| Name | Required; customer full name or record title/reference; maximum 120 characters |
| Company / Category | Required; company text for customers, deals, invoices and tasks; category text for products; maximum 120 characters |
| Status | Required; must be one of the statuses allowed for that module |
| Email | Optional; exposed in the customer editor; maximum 160 characters when provided; subject to email-format validation |
| Amount | Nonnegative USD value with up to two decimal places; maximum 9,999,999,999.99 |
| Date | Required valid calendar date; shown as Due date for tasks and Date in other editors |
| Owner | Required responsibility label; maximum 80 characters; selected from three preset names in the interface |
| Quantity | Nonnegative whole number, maximum 2,147,483,647; exposed in the product editor |
| Notes | Optional business context; maximum 2,000 characters |

For customers, amount means **Lifetime value**. For deals and invoices, it means the recorded deal or invoice amount. For products, it means **Unit price**. Tasks have no amount field in the editor; new tasks store zero. New non-product records also store zero quantity by default.

There is one date per record. The invoice notification panel labels that date as a due date, while the revenue chart uses the same date for reporting. Separate invoice issue, payment and due dates are not available. A business should agree on a consistent convention for invoice dates before relying on period reports.

Company names are entered as text. A company repeated across a customer, deal, invoice or task does not create a formal relationship between those records. There are no separate company accounts or linked customer IDs in these modules.

## 5. Customer management

### Purpose and statuses

The customer register supports relationship tracking for named contacts and their companies.

| Status | Suggested business interpretation |
| --- | --- |
| Lead | A prospective relationship under consideration |
| Active | A currently active customer relationship |
| Inactive | A relationship not currently active |

These interpretations guide business use. The system permits users to select any of the three statuses without enforcing a transition sequence.

### Working process

1. Open **Customers** and select **Add customer**, or use **Add customer** on the Overview page.
2. Enter the full name, company, status, lifetime value, date and owner. Add an email address and notes if available.
3. Save the record. It becomes available in the register and contributes to relevant overview figures.
4. Open the record to update contact details, status, value or notes as the relationship changes.
5. Create follow-up tasks separately when action is needed.

Lifetime value is entered manually; it is not calculated from that customer's invoices or deals. Duplicate names and email addresses are not automatically blocked or merged.

## 6. Sales pipeline

### Purpose and stages

The sales board groups opportunities into five columns.

| Stage | Suggested business interpretation | Included in open pipeline value? |
| --- | --- | --- |
| Qualified | Opportunity considered suitable for pursuit | Yes |
| Proposal | Offer or proposal being prepared or discussed | Yes |
| Negotiation | Commercial terms being discussed | Yes |
| Won | Opportunity successfully closed | No |
| Lost | Opportunity closed unsuccessfully | No |

### Working process

1. Open **Sales pipeline** and add a deal. Adding from a board column preselects that column's stage.
2. Enter the opportunity name, company, expected value, date, owner and notes.
3. Open the deal card and edit its status as discussions progress.
4. Mark the opportunity **Won** or **Lost** when it closes.
5. Create any related invoice or operational task separately.

Stages are changed through the editor; the board does not implement drag-and-drop stage changes. Any allowed stage can be selected directly. Winning a deal does not generate an invoice, update customer lifetime value or change inventory. The application does not calculate probability-weighted forecasts or retain stage history.

## 7. Invoice tracking

### Purpose and statuses

Invoices are tracking records for business follow-up.

| Status | Suggested business interpretation | Reporting effect |
| --- | --- | --- |
| Draft | Record being prepared | Excluded from paid revenue and outstanding invoices |
| Sent | Invoice considered issued and awaiting payment | Included in outstanding invoices |
| Paid | Payment considered received | Included in total revenue and eligible chart periods |
| Overdue | Invoice manually identified as past due | Included in outstanding invoices and invoice notifications |

### Working process

1. Add an invoice and enter a reference as its name, company, amount, date, owner and notes.
2. Set **Draft** while preparing the record and **Sent** when the business considers the invoice issued.
3. Review outstanding invoices and set **Overdue** when follow-up is needed.
4. Create a separate collection task if appropriate.
5. Set **Paid** after confirming payment outside the application.

Setting **Sent** does not send an email or document. Setting **Paid** does not process or verify a payment. Overdue status is not calculated automatically from the date. Statuses can be selected directly without a required sequence.

The module has no invoice line items, taxes, credit notes, partial-payment tracking, generated invoice documents or automatic invoice numbering. Its revenue figures are sums of tracked invoice amounts and should be interpreted using the reporting definitions below.

## 8. Product and stock register

Products contain a name, category, unit price, quantity, date, owner and notes. Available stock labels are **In stock**, **Low stock** and **Out of stock**.

### Working process

1. Add a product with its category, USD unit price and current quantity.
2. Select the appropriate stock status.
3. Update quantity and status manually when availability changes.
4. Review inventory value and filter by stock status when planning follow-up work.

Inventory value is the sum of **unit price × quantity** for all products. It uses the entered price and is not a cost-based accounting valuation.

Stock labels are independent of quantity. The system does not enforce a low-stock threshold or automatically change a status when quantity reaches zero. Deals and invoices do not consume stock. Purchase orders, warehouses, reservations and stock movement history are outside the current scope.

## 9. Task management

Tasks contain a name, company, due date, owner, status and optional notes. Available statuses are **To do**, **In progress** and **Done**.

### Working process

1. Add a task from **Tasks** or the Overview task panel.
2. Enter a clear action, company, due date and owner.
3. Use the editor to set **In progress** while work is underway.
4. Use the checkbox to complete a task. Checking an unfinished task changes it to **Done**.
5. Use the checkbox again to reopen it. Reopening changes the status to **To do**, including when the earlier status was **In progress**.

The navigation badge counts all tasks that are not Done. The task module summary counts completed tasks. Notifications include tasks that are not Done and whose due date is today or earlier.

Tasks are independent records; they are not formally linked to specific customers, deals or invoices. Recurrence, dependencies, time tracking and external reminders are not implemented.

## 10. Management overview and reporting definitions

### Key indicators

| Indicator | Calculation | Business interpretation |
| --- | --- | --- |
| Total revenue | Sum of amounts of all invoices with status Paid | All recorded paid-invoice value, with no period filter on this card |
| Active customers | Count of customers with status Active | Number of active contact records, not distinct companies |
| Open pipeline | Sum of deal amounts excluding Won and Lost | Unweighted value of open opportunities |
| Outstanding invoices | Sum of amounts of invoices with status Sent or Overdue | Recorded value still awaiting payment |

### Revenue chart

The chart offers the last 3, 6 or 12 completed calendar months; 6 is the default. It excludes the current month. Each month's value is the sum of invoices currently marked Paid whose record date falls in that month.

The chart total sums only the selected completed months. It can differ from the Total revenue card, which includes all paid invoices. Changing an invoice's status, amount or date can change historical chart values because there is no separate payment date or reporting snapshot.

### Other overview panels

- **Sales pipeline:** Shows counts and values for Qualified, Proposal, Negotiation and Won. Lost deals are omitted from this panel. Won values appear in its stage breakdown but remain excluded from the open pipeline total.
- **Customer connections:** Shows up to four customer records, ordered by the entered date from newest to oldest. Editing a record does not automatically update that date.
- **On your radar:** Shows up to four tasks in record order, including completed tasks. It is not a due-date priority list; its badge counts all unfinished tasks in the workspace.

### Module summaries and display precision

Module totals use all records in the module, even when search or status filters narrow the visible results. Customer, deal and invoice total value is the sum of their recorded amounts across all statuses. Product inventory value sums price multiplied by quantity. Tasks show a completed count.

Currency labels, tables and charts display whole dollars, even though saved amounts can retain cents. CSV exports retain the underlying numeric amounts. Use those amounts when reviewing cent-level differences.

## 11. Search, filters and CSV export

Search applies to the currently open module. It performs a case-insensitive substring search across name, company or category, email and owner. Notes are not searched. A status filter can be applied at the same time. Moving to another module resets the search and status filter.

Export behavior depends on the current page:

| Page | Exported records |
| --- | --- |
| Overview | All records from all five modules |
| Customers, Sales pipeline, Invoices, Products or Tasks | Current module records matching the active search and status filter |
| Settings export action | Same selection as the page currently open behind Settings |

The CSV contains type, name, company, email, status, amount, date, owner, quantity and notes. Internal record IDs are not included. Filenames follow `forma-<page>.csv`; the pipeline page uses `forma-deals.csv`.

Text is quoted and embedded quotation marks are escaped. Values beginning with `=`, `+`, `@` or `-` receive an apostrophe prefix to reduce spreadsheet formula interpretation. Consequently, an exported text value may carry that additional prefix.

CSV export is a reporting extract. The user interface does not provide a CSV or Excel import or a restore operation.

## 12. Notifications and daily routine

The notification panel is generated from records currently loaded in the workspace. It lists every invoice marked Overdue and every unfinished task due today or earlier. Selecting an entry opens its editor. The bell indicator appears when at least one invoice is marked Overdue; due tasks alone do not trigger that indicator.

A suggested daily routine is:

1. Review the Overview for open pipeline and outstanding invoice values.
2. Check notifications and prioritize due tasks and collection follow-ups.
3. Update opportunities and customer records after business conversations.
4. Confirm payments externally and update invoice statuses.
5. Update product quantities and stock labels when availability changes.
6. Complete tasks and export filtered records when a report is required.

This routine is guidance. The application does not enforce it or send scheduled reminders.

## 13. Record lifecycle and data quality

Saving creates or updates a persistent record. Cancelling the editor discards unsaved changes. Failed saves display an error and require correction or retry. Deleting an existing record requires a confirmation in the editor and permanently removes it; there is no recycle bin or business audit history.

Validation requires populated names, companies/categories and owners, an allowed module status, a valid calendar date, a nonnegative amount and a nonnegative whole-number quantity. Email and notes are optional. Email validation screens format; it does not verify mailbox ownership or delivery. The backend permits single-label email domains, so public-domain requirements need a separate business policy.

Recommended operating practices are to keep company spelling consistent, agree on date conventions, check for duplicate contacts before creating them and record decisions in notes. These practices are not enforced automatically.

A separate [customer import audit](../specs/001-audit-customer-import/report.md) documents a review of a 30-record workbook. It identified duplicate-email candidates, missing names and email-format findings; the workbook was unchanged and no records were imported. This audit is supporting project evidence, not a built-in import or deduplication feature.

## 14. Operating boundaries

| Area | Current behavior and business consequence |
| --- | --- |
| Access and identity | No authentication or permission model; owner and profile labels are descriptive |
| Workspace | One local workspace; the displayed Pro plan is not a subscription-management feature |
| Persistence | Saved records persist in the local SQLite database across application restarts |
| Demonstration data | An empty database is seeded with 31 example records: 7 customers, 7 deals, 9 invoices, 4 products and 4 tasks |
| Empty-workspace restart | Deleting every record results in example records being seeded again on backend restart |
| Data refresh | Records load when the application opens; local successful edits update the visible workspace; there is no automatic live synchronization across sessions |
| Currency and language | English interface and fixed USD currency; no exchange-rate conversion or configurable localization |
| Settings | Appearance can be changed and is remembered in the browser; workspace name, owners and currency are not editable through Settings |
| Accounting and payments | No tax accounting, payment gateway, bank reconciliation or accounting-system integration |
| Communication | No outgoing emails, invoice sending or external reminder delivery |
| Data relationships | Records do not have enforced cross-module links or cascading updates |
| History and recovery | No version history, undo, recycle bin or user-facing backup/restore workflow; CSV excludes internal IDs |

## 15. Example end-to-end business scenario

The following fictional example illustrates manual coordination across modules.

1. A sales representative creates a customer for **Taylor Reed at Northstar Studio**, sets Lead and records an owner.
2. The representative creates a separate **Workspace rollout** deal for Northstar Studio worth **USD 12,000**, initially Qualified.
3. A **Prepare proposal** task is created with a due date and owner. The deal is later updated to Proposal and Negotiation through its editor.
4. After acceptance, the deal is marked Won and the customer is manually changed to Active. The deal leaves the open pipeline total.
5. A separate invoice record is created for **USD 12,000** and marked Sent. Outstanding invoices increase by that amount.
6. After payment is confirmed outside Forma, the invoice is marked Paid. Outstanding invoices decrease and total revenue increases by **USD 12,000**. The invoice appears in the revenue chart if its record date is inside the selected completed-month range.
7. Related tasks are completed. Customer lifetime value and product quantities are updated separately if required by the business.

Each step represents an independent record action. Reusing the company name helps people recognize the relationship but does not create an automated workflow.

## 16. Documentation basis

This document describes implemented behavior reviewed in repository files on the document date. It does not certify a deployed environment or report live business results. Suggested status meanings and operating routines are identified as guidance.

| Source | What it supports |
| --- | --- |
| [Project README](../README.md) | Product scope, operating model, persistence and known exclusions |
| [Application interface](../frontend/src/main.tsx) | Screens, forms, workflows, searches, exports, notifications and dashboard calculations |
| [Record types and statuses](../backend/src/records/business-record.ts) | Available modules, common record fields and allowed statuses |
| [Validation rules](../backend/src/records/record.dto.ts) | Required fields, value ranges and optional information |
| [Record service](../backend/src/records/records.service.ts) | Module status checks, immutable record type and record lifecycle |
| [Record persistence](../backend/src/records/records.repository.ts) | Saved values, permanent deletion and empty-database seeding |
| [Example dataset](../backend/src/records/seed-data.ts) | Demonstration records and sample business use |
| [Current project plan](../specs/001-audit-customer-import/plan.md) | Scope of the separate customer-import audit |
