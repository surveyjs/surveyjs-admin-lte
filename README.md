# SurveyJS Admin: AdminLTE Integration

Three independently designed admin workflows in one local React application. The shell uses the real AdminLTE 4 package and Bootstrap 5; every business-form input, validation rule, repeating invoice item, and invoice calculation is powered by the free SurveyJS Form Library. No paid SurveyJS packages, server, accounts, payment processor, or cloud services are required.

## Run locally

Requires Node.js 22.12+ (tested with Node.js 24) and npm. From this repository's root:

```powershell
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
```

Open **http://127.0.0.1:5173/**. Vite chooses the next available port if 5173 is occupied; use the URL it prints. Keep the same host and port when testing saved drafts, since browser storage is origin-specific. Stop with Ctrl+C.

| Local page                                              | Original AdminLTE template                                                   | What to compare                                                                                                 |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [Project Brief](http://127.0.0.1:5173/#/projects)       | [Project Add](https://adminlte.io/themes/v3/pages/examples/project-add.html) | Project scope, status, client, lead, budget, spent amount, duration, collapsible sections                       |
| [Member Enrollment](http://127.0.0.1:5173/#/enrollment) | [Validation](https://adminlte.io/themes/v3/pages/forms/validation.html)      | Required email, valid email syntax, password minimum, explicit terms acceptance, successful submission feedback |
| [Invoice Studio](http://127.0.0.1:5173/#/invoices)      | [Invoice](https://adminlte.io/themes/v3/pages/examples/invoice.html)         | Sender/recipient, invoice metadata, item references, quantities, totals, tax, shipping, printable output        |

Each page includes a **Reference Example** link; **Original templates** opens all reference links. The original pages are AdminLTE 3 examples used as workflow references, not visual designs to copy. SurveyJS Admin uses new titles, a different layout, original fictional content, and three restrained accent themes.

## Try the workflows

- **Project Brief:** use Load example or enter your own fictional project. Save draft permits incomplete input; Save project validates first. Reload to restore the saved record. Cancel returns to the last saved version. The reset icon clears the form and removes its saved draft. Overspend is permitted and highlighted in the remaining budget. Duration is explicitly in weeks.
- **Member Enrollment:** test missing fields, an invalid email, a password shorter than five characters, and missing consent. Load example fills only fictional identity information, never a password or consent. Complete enrollment displays a simulation result and clears the password. Demo terms opens a real dialog. No account is created, and no enrollment data is persisted or submitted to a server. The five-character minimum matches the reference; it is not a recommended production policy.
- **Invoice Studio:** starts with a fictional, arithmetically consistent invoice. Edit parties/dates, add or remove items, and change quantities/prices/tax/shipping. Preview and Print / PDF use a separate invoice layout without navigation. Choose your browser's Save as PDF destination to produce a PDF. No direct PDF download or payment processing is claimed.

Only one project and one invoice draft are stored per browser origin. Saves are explicit, not automatic. Leaving a page with unsaved edits asks for confirmation. Use fictional, nonsensitive information: localStorage is not encrypted. Storage failures produce visible errors instead of false save confirmations.

## Original behavior versus additions

| Workflow   | Original behavior retained                                            | Added by SurveyJS Admin                                                                                             |
| ---------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Project    | Editable project/budget fields and collapsible groups                 | Validation, browser persistence, reload/reset/cancel, live budget summary, additional planning/in-progress statuses |
| Enrollment | Email/password/consent validation and success feedback                | Full name and role, inline result screen, actual demo-terms dialog, password clearing                               |
| Invoice    | Invoice information, item table, tax/shipping/total display, printing | SurveyJS editor, repeatable items, calculated values, date/range validation, saved drafts, live preview             |

The original project Save/Cancel and invoice Submit Payment/Generate PDF buttons do not implement those operations. SurveyJS Admin does not imitate working payment or direct-PDF actions where none existed. The original invoice's hard-coded totals do not reconcile; its amounts are not reused. See [the primary-source research](docs/template-research.md).

### Invoice calculation rules

Currency is USD. Each line amount is `round(quantity * unitPrice, 2)`. Subtotal is the sum of rounded line amounts; tax is `round(subtotal * taxRate / 100, 2)`. Shipping is added after tax; the total is rounded to two decimal places. These are SurveyJS expressions, not a second React calculation engine. Quantity must be at least one; prices/shipping must be nonnegative and tax must be between 0 and 100. Fractional quantities are allowed. There is a 30-line limit. This is a demonstration, not an accounting/tax engine.

## Integration details

- AdminLTE **4.10.0**, Bootstrap **5.3.8**, matching `survey-core` / `survey-react-ui` **3.2.3**. Exact installed versions are captured in [package-lock.json](package-lock.json).
- [src/main.tsx](src/main.tsx) loads Bootstrap, AdminLTE, SurveyJS core CSS, then the **official** `survey-core/themes/adapters/bootstrap-default.css`, and calls `setupThemeAdapter('bootstrap')` once. The general docs show `bootstrap.css`, but the installed 3.2.3 package exports `bootstrap-default.css`; no adapter is copied or reimplemented.
- [src/workflows.ts](src/workflows.ts) owns the form schemas and SurveyJS expressions. Invoice lines use a dynamic panel to remain usable on mobile. Email uses a text input with the SurveyJS email validator, email autocomplete, and `inputmode=email`: this installed version excludes HTML email inputs from typing updates, which can move the submit button as errors disappear on blur.
- [src/storage.ts](src/storage.ts) owns explicit browser draft operations, field allowlisting, malformed-draft handling, and storage-error reporting. Enrollment bypasses storage entirely.
- [src/App.tsx](src/App.tsx) owns navigation, actions, confirmation dialogs, summaries, and the invoice document. React controls the AdminLTE sidebar; jQuery and AdminLTE's global DOM-mutating JavaScript are not needed.
- [src/App.css](src/App.css) contains scoped layout/theme adjustments and print rules. Fonts and icons are packaged locally; no CDN or remote image is needed at runtime.

## Verify

```powershell
npm test
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite builds the application and starts a production preview on port 4173. It tests desktop (1440px) and mobile (390px) workflows, validation, password non-persistence, invoice calculations/rows, save/reload/reset/cancel, storage failure, source links, navigation guards, viewport overflow, and print CSS. Screenshots are written to `artifacts/`; failed-test traces go to `test-results/`. Actual printer output and the browser's native Save as PDF dialog are manual checks; automated tests verify the print invocation and print-media DOM.

The production build currently reports a bundle-size advisory because the full SurveyJS renderer is bundled. It is not a build failure. This demo prioritizes straightforward integration over production code splitting.

## Licensing

AdminLTE, Bootstrap, React, and SurveyJS Form Library are MIT-licensed. Lucide uses ISC; DM Sans and Manrope use SIL Open Font License. Their package notices remain in the installed dependencies and generated CSS notices are retained. No AdminLTE demo-specific HTML, brand imagery, or payment logos were copied. Survey Creator, Dashboard, and SurveyJS PDF Generator are not included. Review dependency notices before redistributing a packaged build.
