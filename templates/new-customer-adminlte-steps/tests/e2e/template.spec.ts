import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

// 'surveyjs': SurveyJS renders the progress bar and Back / Continue / Submit.
// 'steps': the page renders an AdminLTE step list and card-footer buttons.
const VARIANT = 'steps' as 'surveyjs' | 'steps'

const heading = (page: Page, name: string) =>
  page.getByRole('heading', { name, exact: true })
const button = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true })

test('uses only its own navigation style', async ({ page }) => {
  await page.goto('/')
  await expect(heading(page, 'Customer profile')).toBeVisible()
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
  await expect(heading(page, 'Customer profile')).toBeVisible()
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
  await expect(page).toHaveTitle('New Customer (AdminLTE steps) | AdminLTE + SurveyJS')
  await expect(page.locator('.app-header')).toBeVisible()
  await expect(page.locator('.app-footer')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(heading(page, 'New Customer')).toBeVisible()
  const sidebar = page.locator('.app-sidebar')
  await expect(
    sidebar.getByRole('link', { name: 'SurveyJS multi-page docs' }),
  ).toHaveAttribute('href', 'https://surveyjs.io/form-library/documentation/design-survey-create-a-multi-page-survey#Switch-Between-Pages')
  await expect(
    sidebar.getByRole('link', { name: 'Project Brief' }),
  ).toHaveAttribute('href', '../project-brief/')
  await expect(
    sidebar.getByRole('link', { name: 'New Customer: SurveyJS navigation' }),
  ).toHaveAttribute('href', '../new-customer-surveyjs-nav/')
  await expect(
    sidebar.getByRole('link', { name: 'New Customer: AdminLTE steps' }),
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
    path: `artifacts/new-customer-adminlte-steps-${testInfo.project.name}.png`,
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
  await expect(heading(page, 'Customer profile')).toBeVisible()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await button(page, 'Load example').click()
  await step(3).click()
  await expect(step(3)).toHaveAttribute('aria-current', 'step')
  await expect(step(3)).toBeFocused()
  await expect(page.locator('.card-footer')).toContainText('Step 3 of')
  await step(1).click()
  await expect(heading(page, 'Customer profile')).toBeVisible()
  await button(page, 'Continue').click()
  await expect(step(2)).toBeFocused()
  await button(page, 'Back').click()
  await expect(step(1)).toHaveAttribute('aria-current', 'step')
})

test('create a customer end to end with the example data', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  const summary = page.locator('.form-summary')
  await button(page, 'Load example').click()
  await expect(summary).toContainText('Northline Mobility Ltd')
  await expect(summary).toContainText('$54,000')
  await button(page, 'Continue').click()
  await expect(heading(page, 'People and contacts')).toBeVisible()
  // Desktop is wide enough for the contacts table the JSON describes; every
  // row can expand to the secondary contact details.
  const contacts = page.locator('[data-name="contacts"]').first()
  if (testInfo.project.name === 'desktop')
    await expect(
      contacts.getByRole('columnheader', { name: /Work email/ }),
    ).toBeVisible()
  await contacts.getByRole('button', { name: 'Show Details' }).first().click()
  await expect(
    contacts.getByText('Preferred communication channel').first(),
  ).toBeVisible()
  for (const title of [
    'Commercial profile',
    'Onboarding and compliance',
    'Review and create',
  ]) {
    await button(page, 'Continue').click()
    await expect(heading(page, title)).toBeVisible()
  }
  await expect(page.locator('[data-name="summaryHeading"]')).toContainText(
    'Business (B2B)',
  )
  await button(page, 'Create customer').click()
  await expect(
    page.getByText('Please confirm before creating the customer.'),
  ).toBeVisible()
  await page
    .locator('[data-name="confirmAccuracy"]')
    .getByText('Confirmed', { exact: true })
    .click()
  await button(page, 'Create customer').click()
  await expect(heading(page, 'Customer profile submitted')).toBeVisible()
  await expect(page.locator('.card-title').first()).toHaveText('Customer created')
  const json = page.locator('.submitted-json')
  await expect(json).toContainText('"companyName": "Northline Mobility Ltd"')
  await expect(json).toContainText('"annualRevenuePreview": 54000')
  await expect(json).not.toContainText('estimatedAnnualRevenue')
  await button(page, 'Add another customer').click()
  await expect(heading(page, 'Customer profile')).toBeVisible()
  await expect(summary).toContainText('Company—')
})

test('start over clears every page after confirmation', async ({ page }) => {
  await page.goto('/')
  await button(page, 'Load example').click()
  await button(page, 'Continue').click()
  await expect(heading(page, 'People and contacts')).toBeVisible()
  await page.getByRole('button', { name: 'Start over' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('All answers on every page will be removed')
  await dialog.getByRole('button', { name: 'Clear form' }).click()
  await expect(dialog).toBeHidden()
  await expect(heading(page, 'Customer profile')).toBeVisible()
  await expect(
    page.getByRole('textbox', { name: 'Legal company name' }),
  ).toHaveValue('')
})
