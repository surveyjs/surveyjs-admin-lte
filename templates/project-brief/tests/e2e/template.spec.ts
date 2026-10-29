import { test, expect } from '@playwright/test'

test('project validation, save, reload, collapse, cancel, and clear', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Save project', exact: true }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await page.getByRole('button', { name: 'Load example' }).click()
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Draft saved')
  await page.reload()
  const title = page.getByRole('textbox', { name: 'Project title', exact: true })
  await expect(title).toHaveValue('Northline brand refresh')
  await page.getByRole('button', { name: 'The engagement', exact: true }).click()
  await expect(title).toBeHidden()
  await page.getByRole('button', { name: 'The engagement', exact: true }).click()
  await expect(title).toHaveValue('Northline brand refresh')
  const spent = page.getByRole('spinbutton', { name: 'Spent to date (USD)' })
  await spent.fill('-5')
  await page.getByRole('button', { name: 'Save project', exact: true }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await spent.fill('1000')
  await page.getByRole('button', { name: 'Save project', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Project saved')
  await title.fill('Changed title')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(title).toHaveValue('Northline brand refresh')
  await page.getByRole('button', { name: 'Clear form and saved draft' }).click()
  await page.getByRole('button', { name: 'Clear form', exact: true }).click()
  await page.reload()
  await expect(title).toHaveValue('')
})

test('storage failures are visible and do not claim a save', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Storage blocked')
    }
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Load example' }).click()
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('not saved')
  await expect(page.locator('.save-state')).toContainText('Changes not saved')
})

test('a malformed saved draft shows an alert and leaves the form usable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('adminlte-surveyjs:project-brief:v1', '{broken')
  })
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('could not be opened')
  await page
    .getByRole('textbox', { name: 'Project title', exact: true })
    .fill('Recovered')
  await expect(page.locator('.save-state')).toContainText('Changes not saved')
})

test('renders the AdminLTE shell without errors and fits the viewport', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page).toHaveTitle('Project Brief | AdminLTE + SurveyJS')
  await expect(page.locator('.app-header')).toBeVisible()
  await expect(page.locator('.app-footer')).toBeVisible()
  await expect(page.locator('.app-sidebar')).toHaveCount(1)
  await expect(
    page.getByRole('heading', { name: 'Project Brief', exact: true }),
  ).toBeVisible()
  const sidebar = page.locator('.app-sidebar')
  await expect(
    sidebar.getByRole('link', { name: 'Original AdminLTE page' }),
  ).toHaveAttribute(
    'href',
    'https://adminlte.io/themes/v3/pages/examples/project-add.html',
  )
  await expect(
    sidebar.getByRole('link', { name: 'Member Enrollment' }),
  ).toHaveAttribute('href', '../member-enrollment/')
  await expect(
    sidebar.getByRole('link', { name: 'Invoice Studio' }),
  ).toHaveAttribute('href', '../invoice-studio/')
  await expect(
    sidebar.getByRole('link', { name: 'Project Brief' }),
  ).toHaveAttribute('aria-current', 'page')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({
    path: `artifacts/project-brief-${testInfo.project.name}.png`,
    fullPage: true,
  })
  expect(errors).toEqual([])
})

test('sidebar toggles on mobile and desktop', async ({ page }, testInfo) => {
  await page.goto('/')
  const body = page.locator('body')
  const toggle = page.getByRole('button', { name: 'Toggle navigation' })
  if (testInfo.project.name === 'mobile') {
    await expect(page.locator('.app-sidebar')).not.toBeInViewport()
    await toggle.click()
    await expect(body).toHaveClass(/sidebar-open/)
    await expect(page.locator('.app-sidebar')).toBeInViewport()
    await page.locator('.sidebar-overlay').click({ position: { x: 370, y: 400 } })
    await expect(body).not.toHaveClass(/sidebar-open/)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
  } else {
    await toggle.click()
    await expect(body).toHaveClass(/sidebar-collapse/)
    await toggle.click()
    await expect(body).not.toHaveClass(/sidebar-collapse/)
  }
})

test('skip link focuses main content', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Skip to main content' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()
})
