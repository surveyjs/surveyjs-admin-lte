# AdminLTE + SurveyJS templates

Three [AdminLTE 4](https://adminlte.io) templates whose forms are built with the free, MIT-licensed [SurveyJS Form Library](https://surveyjs.io/form-library). Each one rebuilds an AdminLTE example page: stock AdminLTE layout and styling, with SurveyJS handling fields, validation, repeatable items, and calculations declared in JSON.

Each template is a standalone React + Vite project. Copy any folder out of `templates/` and it installs, builds, and runs on its own, like a downloaded gallery template.

| Template | Based on AdminLTE example | What SurveyJS adds |
| --- | --- | --- |
| [Project Brief](templates/project-brief/) | [Project Add](https://adminlte.io/themes/v3/pages/examples/project-add.html) | Validation, collapsible panels, draft saving with reload/cancel/reset, live budget summary |
| [Member Enrollment](templates/member-enrollment/) | [Validation](https://adminlte.io/themes/v3/pages/forms/validation.html) | Email, password-length and consent rules as SurveyJS validators; simulated submission that never stores the password |
| [Invoice Studio](templates/invoice-studio/) | [Invoice](https://adminlte.io/themes/v3/pages/examples/invoice.html) | Editable invoice with repeatable line items, tax/shipping/total expressions, preview, and print |

The original AdminLTE pages are references for the workflows. Their demo content, images, and payment logos are not copied. The original Project Add and Invoice pages have Save, Submit Payment, and Generate PDF buttons that do nothing; these templates do not pretend to process payments or generate PDFs directly (Invoice Studio prints through the browser, which can save as PDF).

## Run one template

Requires Node.js 22.12+.

```bash
cd templates/project-brief    # or member-enrollment, invoice-studio
npm install
npm run dev
```

Each template's README lists its commands, file layout, and behavior.

## Work on all templates

```bash
npm install            # root tooling (Playwright for the site test)
npm run install:all    # npm ci in every template
npm run lint
npm test               # unit tests in every template
npm run test:e2e       # browser tests in every template (run `npx playwright install chromium` once)
npm run check:standalone   # copy each template outside the repo, then install, build and test it there
```

## Demo site

```bash
npm run build:site     # builds all templates into site/
npm run serve:site     # serves site/ at http://127.0.0.1:4180/demo/
npm run test:site      # builds the site and tests it under /demo/
```

`site/` is a static folder: a landing page plus one subfolder per template. All paths are relative, so it can be published to any web server or subfolder (for example GitHub Pages). The sidebar in each template links to its siblings with relative paths (`../member-enrollment/`); edit `src/layout/links.ts` in a template if you use it on its own.

## Versions

AdminLTE 4.10.0, Bootstrap 5.3.8, Bootstrap Icons 1.13.1, SurveyJS `survey-core` / `survey-react-ui` 3.2.3, React 19, Vite 8, TypeScript 7. Each template pins its own versions in its `package.json` and `package-lock.json`.

SurveyJS renders with Bootstrap markup through the official theme adapter (`survey-core/themes/adapters/bootstrap-default.css` + `setupThemeAdapter('bootstrap')`). AdminLTE's and Bootstrap's JavaScript are not loaded; React toggles the AdminLTE sidebar classes.

## License

MIT — see [LICENSE](LICENSE). Third-party credits:

- [AdminLTE](https://github.com/ColorlibHQ/AdminLTE) — MIT
- [Bootstrap](https://getbootstrap.com) and [Bootstrap Icons](https://icons.getbootstrap.com) — MIT
- [SurveyJS Form Library](https://github.com/surveyjs/survey-library) — MIT
- [React](https://react.dev) — MIT
- [Source Sans 3](https://github.com/adobe-fonts/source-sans) — SIL Open Font License 1.1

These templates are independently maintained and are not an official AdminLTE release.
