import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

// 'surveyjs': SurveyJS renders the progress bar and Back / Continue / Submit.
// 'steps': the page renders an AdminLTE step list and card-footer buttons.
const VARIANT = 'surveyjs' as 'surveyjs' | 'steps'

const heading = (page: Page, name: string) =>
  page.getByRole('heading', { name, exact: true })
const button = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true })

test('uses only its own navigation style', async ({ page }) => {
  await page.goto('/')
  await expect(heading(page, 'Incident overview')).toBeVisible()
  if (VARIANT === 'surveyjs') {
    await expect(page.locator('.sd-progress-buttons')).toBeVisible()
    await expect(page.locator('.sd-navigation__next-btn')).toBeVisible()
    await expect(page.locator('.form-steps')).toHaveCount(0)
  } else {
    await expect(page.locator('.sd-progress-buttons')).toHaveCount(0)
    await expect(page.locator('.sd-navigation__next-btn')).toHaveCount(0)
    await expect(
      page.getByRole('navigation', { name: 'Form steps' }),
    ).toBeVisible()
    await expect(page.locator('.card-footer')).toContainText('Step 1 of')
  }
})

test('an unanswered page blocks Continue', async ({ page }) => {
  await page.goto('/')
  await button(page, 'Continue').click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await expect(heading(page, 'Incident overview')).toBeVisible()
})

test('loading the example arms the beforeunload guard', async ({ page }) => {
  await page.goto('/')
  await button(page, 'Load example').click()
  let seen = ''
  page.once('dialog', async (dialog) => {
    seen = dialog.type()
    await dialog.dismiss()
  })
  await page.close({ runBeforeUnload: true })
  await expect.poll(() => seen).toBe('beforeunload')
})

test('renders the AdminLTE shell without errors and fits the viewport', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page).toHaveTitle('Incident Report (SurveyJS navigation) | AdminLTE + SurveyJS')
  await expect(page.locator('.app-header')).toBeVisible()
  await expect(page.locator('.app-footer')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(heading(page, 'Incident Report')).toBeVisible()
  const sidebar = page.locator('.app-sidebar')
  await expect(
    sidebar.getByRole('link', { name: 'SurveyJS multi-page docs' }),
  ).toHaveAttribute('href', 'https://surveyjs.io/form-library/documentation/design-survey-create-a-multi-page-survey#Page-Navigation-UI')
  await expect(
    sidebar.getByRole('link', { name: 'Project Brief' }),
  ).toHaveAttribute('href', '../project-brief/')
  await expect(
    sidebar.getByRole('link', { name: 'Incident Report: AdminLTE steps' }),
  ).toHaveAttribute('href', '../incident-report-adminlte-steps/')
  await expect(
    sidebar.getByRole('link', { name: 'Incident Report: SurveyJS navigation' }),
  ).toHaveAttribute('aria-current', 'page')
  await button(page, 'Load example').click()
  // Phones widen the layout viewport when content overflows, so check both.
  expect(await page.evaluate(() => window.innerWidth)).toBe(
    page.viewportSize()!.width,
  )
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({
    path: `artifacts/incident-report-surveyjs-nav-${testInfo.project.name}.png`,
    fullPage: true,
  })
  expect(errors).toEqual([])
})

test('sidebar toggles on mobile and desktop', async ({ page }, testInfo) => {
  await page.goto('/')
  const body = page.locator('body')
  const toggle = page.getByRole('button', { name: 'Toggle navigation' })
  if (testInfo.project.name === 'mobile') {
    await toggle.click()
    await expect(body).toHaveClass(/sidebar-open/)
    await expect(page.locator('.app-sidebar')).toBeInViewport()
    await page.locator('.sidebar-overlay').click({ position: { x: 370, y: 400 } })
    await expect(body).not.toHaveClass(/sidebar-open/)
  } else {
    await toggle.click()
    await expect(body).toHaveClass(/sidebar-collapse/)
    await toggle.click()
    await expect(body).not.toHaveClass(/sidebar-collapse/)
  }
})

test('sidebar brand is centered and fits inside the sidebar', async ({ page }, testInfo) => {
  await page.goto('/')
  if (testInfo.project.name === 'mobile')
    await page.getByRole('button', { name: 'Toggle navigation' }).click()
  const box = async (selector: string) =>
    (await page.locator(selector).boundingBox())!
  const brand = await box('.sidebar-brand')
  const link = await box('.sidebar-brand .brand-link')
  const text = await box('.sidebar-brand .brand-text')
  const brandCenter = brand.x + brand.width / 2
  const linkCenter = link.x + link.width / 2
  expect(Math.abs(linkCenter - brandCenter)).toBeLessThanOrEqual(1)
  expect(text.x + text.width).toBeLessThanOrEqual(link.x + link.width + 0.5)
})

test('step list jumps back freely and validates before jumping ahead', async ({
  page,
}) => {
  test.skip(VARIANT !== 'steps', 'AdminLTE steps only')
  await page.goto('/')
  const steps = page.getByRole('navigation', { name: 'Form steps' })
  const step = (index: number) =>
    steps.getByRole('button', { name: new RegExp(`^Step ${index} of`) })
  // Nothing answered: jumping to step 3 stops on step 1 with errors.
  await step(3).click()
  await expect(heading(page, 'Incident overview')).toBeVisible()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await button(page, 'Load example').click()
  await step(3).click()
  await expect(step(3)).toHaveAttribute('aria-current', 'step')
  await expect(step(3)).toBeFocused()
  await expect(page.locator('.card-footer')).toContainText('Step 3 of')
  await step(1).click()
  await expect(heading(page, 'Incident overview')).toBeVisible()
  await button(page, 'Continue').click()
  await expect(step(2)).toBeFocused()
  await button(page, 'Back').click()
  await expect(step(1)).toHaveAttribute('aria-current', 'step')
})

test('report an incident end to end with the example data', async ({ page }) => {
  await page.goto('/')
  const summary = page.locator('.form-summary')
  await expect(summary).toContainText('Type—')
  await button(page, 'Load example').click()
  await expect(summary).toContainText('IT incident')
  await expect(summary).toContainText('4 of 5')
  for (const title of [
    'IT incident details',
    'Impact and immediate response',
    'Witnesses and supporting evidence',
    'Review and submit',
  ]) {
    await button(page, 'Continue').click()
    await expect(heading(page, title)).toBeVisible()
  }
  // One of two statements is not enough (fixed in the JSON).
  await page
    .getByText('I have provided information that is accurate', { exact: false })
    .click()
  await button(page, 'Submit incident report').click()
  await expect(
    page.getByText('Confirm both statements to submit the report.'),
  ).toBeVisible()
  await page
    .getByText('I understand this report does not replace', { exact: false })
    .click()
  await button(page, 'Submit incident report').click()
  await expect(heading(page, 'Report completed')).toBeVisible()
  await expect(page.locator('.card-title').first()).toHaveText('Report submitted')
  await expect(page.locator('.submitted-json')).toContainText(
    '"incident_title": "Customer portal returns errors after release"',
  )
  await button(page, 'Report another incident').click()
  await expect(heading(page, 'Incident overview')).toBeVisible()
  await expect(summary).toContainText('Type—')
  await expect(page.locator('.submitted-data')).toHaveCount(0)
})

test('the details page follows the incident type', async ({ page }) => {
  await page.goto('/')
  await button(page, 'Load example').click()
  await page.getByText('Workplace incident', { exact: true }).click()
  await button(page, 'Continue').click()
  await expect(heading(page, 'Workplace incident details')).toBeVisible()
  // The remaining-hazards question waits for the area safety answer (fixed in the JSON).
  const hazards = page.getByText('Describe any remaining hazards')
  await expect(hazards).toBeHidden()
  await page
    .locator('[data-name="workplace_area_safe"]')
    .getByText('No', { exact: true })
    .click()
  await expect(hazards).toBeVisible()
})

test('start over clears every page after confirmation', async ({ page }) => {
  await page.goto('/')
  await button(page, 'Load example').click()
  await button(page, 'Continue').click()
  await expect(heading(page, 'IT incident details')).toBeVisible()
  await page.getByRole('button', { name: 'Start over' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('All answers on every page will be removed')
  await dialog.getByRole('button', { name: 'Clear form' }).click()
  await expect(dialog).toBeHidden()
  await expect(heading(page, 'Incident overview')).toBeVisible()
  await expect(
    page.getByRole('textbox', { name: 'Short incident title' }),
  ).toHaveValue('')
})
