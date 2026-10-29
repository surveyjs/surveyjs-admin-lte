import { test, expect } from '@playwright/test'

test('keyboard skip link, source dialog, and unsaved navigation guard', async ({
  page,
}, testInfo) => {
  await page.goto('/#/enrollment')
  await page.getByRole('link', { name: 'Skip to content' }).focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#\/enrollment$/)
  await expect(page.locator('#workspace-main')).toBeFocused()
  if (testInfo.project.name === 'mobile')
    await page.getByRole('button', { name: 'Open navigation' }).click()
  await page
    .getByRole('button', { name: 'Original templates', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('link')).toHaveCount(4)
  await page.getByRole('button', { name: 'Close dialog' }).click()
  if (testInfo.project.name === 'mobile')
    await page.locator('.sidebar-shade').click({ position: { x: 350, y: 200 } })
  await page
    .getByRole('textbox', { name: 'Full name', exact: true })
    .fill('Unsubmitted member')
  if (testInfo.project.name === 'mobile')
    await page.getByRole('button', { name: 'Open navigation' }).click()
  page.once('dialog', (dialog) => dialog.dismiss())
  await page
    .getByRole('link', { name: 'Project Brief 01', exact: true })
    .click()
  await expect(page).toHaveURL(/#\/enrollment$/)
  page.once('dialog', (dialog) => dialog.accept())
  await page
    .getByRole('link', { name: 'Project Brief 01', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Project Brief', exact: true }),
  ).toBeVisible()
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})

test('project validation, save, reload, collapse, cancel, and clear', async ({
  page,
}) => {
  await page.goto('/#/projects')
  await page.getByRole('button', { name: 'Save project', exact: true }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await page.getByRole('button', { name: 'Load example' }).click()
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Draft saved')
  await page.reload()
  await expect(
    page.getByRole('textbox', { name: 'Project title', exact: true }),
  ).toHaveValue('Northline brand refresh')
  await page
    .getByRole('button', { name: 'The engagement', exact: true })
    .click()
  await expect(
    page.getByRole('textbox', { name: 'Project title', exact: true }),
  ).toBeHidden()
  await page
    .getByRole('button', { name: 'The engagement', exact: true })
    .click()
  await expect(
    page.getByRole('textbox', { name: 'Project title', exact: true }),
  ).toHaveValue('Northline brand refresh')
  await page.getByRole('spinbutton', { name: 'Spent to date (USD)' }).fill('-5')
  await page.getByRole('button', { name: 'Save project', exact: true }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await page
    .getByRole('spinbutton', { name: 'Spent to date (USD)' })
    .fill('1000')
  await page.getByRole('button', { name: 'Save project', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Project saved')
  await page
    .getByRole('textbox', { name: 'Project title', exact: true })
    .fill('Changed title')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(
    page.getByRole('textbox', { name: 'Project title', exact: true }),
  ).toHaveValue('Northline brand refresh')
  await page.getByRole('button', { name: 'Clear form and saved draft' }).click()
  await page.getByRole('button', { name: 'Clear form', exact: true }).click()
  await page.reload()
  await expect(
    page.getByRole('textbox', { name: 'Project title', exact: true }),
  ).toHaveValue('')
})

test('enrollment validates and never stores passwords or creates accounts', async ({
  page,
}) => {
  await page.goto('/#/enrollment')
  await page.getByRole('button', { name: 'Complete enrollment' }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await page.getByRole('button', { name: 'Load example' }).click()
  await page
    .getByRole('textbox', { name: 'Password', exact: true })
    .fill('1234')
  await page
    .getByText('I accept the demo terms of participation.', { exact: true })
    .click()
  await expect(page.getByRole('checkbox')).toBeChecked()
  await page.getByRole('button', { name: 'Complete enrollment' }).click()
  await expect(
    page.getByText('Use at least 5 characters.', { exact: true }),
  ).toBeVisible()
  await page
    .getByRole('textbox', { name: 'Password', exact: true })
    .fill('demo-secret')
  await page
    .getByRole('textbox', { name: 'Email address', exact: true })
    .fill('invalid-email')
  await page.getByRole('button', { name: 'Complete enrollment' }).click()
  await expect(
    page.getByText('Enter a valid email address.', { exact: true }),
  ).toBeVisible()
  await page
    .getByRole('textbox', { name: 'Email address', exact: true })
    .fill('alex@example.com')
  await expect(
    page.getByText('Enter a valid email address.', { exact: true }),
  ).toBeHidden()
  await page.getByRole('button', { name: 'Complete enrollment' }).click()
  await expect(
    page.getByRole('heading', { name: 'Welcome, Alex.' }),
  ).toBeVisible()
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    'demo-secret',
  )
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await page.getByRole('button', { name: 'Enroll another member' }).click()
  await expect(
    page.getByRole('textbox', { name: 'Password', exact: true }),
  ).toHaveValue('')
  await page.getByRole('button', { name: 'Demo terms', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText(
    'not a production security policy',
  )
  await page.getByRole('button', { name: 'Understood' }).click()
})

test('invoice rows recalculate, persist, preview, and print without navigation', async ({
  page,
}, testInfo) => {
  await page.goto('/#/invoices')
  await expect(page.locator('.invoice-total')).toHaveText('$5,087.75')
  await page
    .getByRole('spinbutton', { name: 'Quantity', exact: true })
    .first()
    .fill('3')
  await page
    .getByRole('heading', { name: 'Invoice Studio', exact: true })
    .click()
  await expect(page.locator('.invoice-total')).toHaveText('$5,899.63')
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
  await page
    .getByRole('heading', { name: 'Invoice Studio', exact: true })
    .click()
  await expect(page.locator('.invoice-total')).toHaveText('$6,007.88')
  await page
    .getByRole('button', { name: 'Remove item', exact: true })
    .last()
    .click()
  await expect(page.locator('.invoice-total')).toHaveText('$5,899.63')
  await page.getByRole('button', { name: 'Save invoice', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Invoice saved')
  await page.reload()
  await expect(page.locator('.invoice-total')).toHaveText('$5,899.63')
  await page.getByRole('tab', { name: 'Preview', exact: true }).click()
  await expect(page.locator('.form-workspace .invoice-document')).toContainText(
    'Brand strategy workshop',
  )
  await page.screenshot({
    path: `artifacts/invoice-preview-${testInfo.project.name}.png`,
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
  await expect(page.locator('.app-sidebar')).toBeHidden()
  await expect(page.locator('.action-bar')).toBeHidden()
  await expect(page.locator('.workspace-grid')).toBeHidden()
  await page.screenshot({
    path: `artifacts/invoice-print-${testInfo.project.name}.png`,
    fullPage: true,
  })
})

test('storage failures are visible and do not claim a save', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Storage blocked')
    }
  })
  await page.goto('/#/projects')
  await page.getByRole('button', { name: 'Load example' }).click()
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('not saved')
  await expect(page.locator('.save-state')).toContainText('Changes not saved')
})

test('all pages have original links, fit the viewport, and render without errors', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const [route, heading, path] of [
    ['projects', 'Project Brief', 'examples/project-add'],
    ['enrollment', 'Member Enrollment', 'forms/validation'],
    ['invoices', 'Invoice Studio', 'examples/invoice'],
  ]) {
    await page.goto(`/#/${route}`)
    await expect(page).toHaveTitle('SurveyJS Admin | AdminLTE Integration')
    await expect(
      page.getByRole('link', { name: 'SurveyJS Admin', exact: true }),
    ).toHaveAttribute('href', '#/projects')
    await expect(
      page.getByRole('heading', { name: heading, exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Reference Example' }),
    ).toHaveAttribute(
      'href',
      `https://adminlte.io/themes/v3/pages/${path}.html`,
    )
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: `artifacts/${route}-${testInfo.project.name}.png`,
      fullPage: true,
    })
  }
  expect(errors).toEqual([])
  if (testInfo.project.name === 'mobile')
    await page.getByRole('button', { name: 'Open navigation' }).click()
  await page
    .getByRole('link', { name: 'Project Brief 01', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Project Brief', exact: true }),
  ).toBeVisible()
})
