import { test, expect } from '@playwright/test'

test('invoice rows recalculate, persist, preview, and print without navigation', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  const total = page.locator('.invoice-total')
  const heading = page.getByRole('heading', { name: 'Invoice Studio', exact: true })
  await expect(total).toHaveText('$5,087.75')
  await page
    .getByRole('spinbutton', { name: 'Quantity', exact: true })
    .first()
    .fill('3')
  await heading.click()
  await expect(total).toHaveText('$5,899.63')
  await page.getByRole('button', { name: 'Add line item', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Product or service', exact: true })
    .last()
    .fill('Delivery review')
  await page
    .getByRole('spinbutton', { name: 'Quantity', exact: true })
    .last()
    .fill('2')
  await page
    .getByRole('spinbutton', { name: 'Unit price (USD)', exact: true })
    .last()
    .fill('50')
  await heading.click()
  await expect(total).toHaveText('$6,007.88')
  await page.getByRole('button', { name: 'Remove item', exact: true }).last().click()
  await expect(total).toHaveText('$5,899.63')
  await page.getByRole('button', { name: 'Save invoice', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Invoice saved')
  await page.reload()
  await expect(total).toHaveText('$5,899.63')
  await expect(page.getByRole('tablist')).toMatchAriaSnapshot(`
    - tablist:
      - tab "Editor" [selected]
      - tab "Preview"
  `)
  await page.getByRole('tab', { name: 'Preview', exact: true }).click()
  await expect(page.locator('.app-content .invoice')).toContainText(
    'Brand strategy workshop',
  )
  await expect(page.locator('.app-content .invoice')).toContainText('$5,899.63')
  await page.screenshot({
    path: `artifacts/invoice-studio-preview-${testInfo.project.name}.png`,
    fullPage: true,
  })
  await page.evaluate(() => {
    window.print = () => {
      document.body.dataset.printed = 'yes'
    }
  })
  await page.getByRole('button', { name: 'Print / PDF', exact: true }).click()
  await expect(page.locator('body')).toHaveAttribute('data-printed', 'yes')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.print-only')).toBeVisible()
  await expect(page.locator('.print-only .invoice')).toContainText('$5,899.63')
  for (const hidden of ['.app-sidebar', '.app-header', '.app-content', '.app-footer'])
    await expect(page.locator(hidden)).toBeHidden()
  await page.screenshot({
    path: `artifacts/invoice-studio-print-${testInfo.project.name}.png`,
    fullPage: true,
  })
})

test('printing an incomplete invoice shows an error instead', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    window.print = () => {
      document.body.dataset.printed = 'yes'
    }
  })
  await page.getByRole('textbox', { name: 'Invoice number', exact: true }).fill('')
  await page.getByRole('button', { name: 'Print / PDF', exact: true }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await expect(page.locator('body')).not.toHaveAttribute('data-printed', 'yes')
})

test('renders the AdminLTE shell without errors and fits the viewport', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page).toHaveTitle('Invoice Studio | AdminLTE + SurveyJS')
  await expect(page.locator('.app-header')).toBeVisible()
  await expect(page.locator('.app-footer')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  const sidebar = page.locator('.app-sidebar')
  await expect(
    sidebar.getByRole('link', { name: 'Original AdminLTE page' }),
  ).toHaveAttribute('href', 'https://adminlte.io/themes/v3/pages/examples/invoice.html')
  await expect(
    sidebar.getByRole('link', { name: 'Project Brief' }),
  ).toHaveAttribute('href', '../project-brief/')
  await expect(
    sidebar.getByRole('link', { name: 'Member Enrollment' }),
  ).toHaveAttribute('href', '../member-enrollment/')
  await expect(
    sidebar.getByRole('link', { name: 'Invoice Studio' }),
  ).toHaveAttribute('aria-current', 'page')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({
    path: `artifacts/invoice-studio-${testInfo.project.name}.png`,
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
    await page.locator('.sidebar-overlay').click({ position: { x: 370, y: 400 } })
    await expect(body).not.toHaveClass(/sidebar-open/)
  } else {
    await toggle.click()
    await expect(body).toHaveClass(/sidebar-collapse/)
    await toggle.click()
    await expect(body).not.toHaveClass(/sidebar-collapse/)
  }
})

test('a saved draft with corrupt line items shows an alert and the example invoice', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.addInitScript(() => {
    localStorage.setItem(
      'adminlte-surveyjs:invoice-studio:v1',
      JSON.stringify({ data: { items: [null] }, savedAt: '2026-10-29T10:00:00.000Z' }),
    )
  })
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('could not be opened')
  await expect(page.locator('.invoice-total')).toHaveText('$5,087.75')
  expect(errors).toEqual([])
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
