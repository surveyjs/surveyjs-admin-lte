import { test, expect } from '@playwright/test'

test('enrollment validates and never stores passwords or creates accounts', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Complete enrollment' }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await page.getByRole('button', { name: 'Load example' }).click()
  const password = page.getByRole('textbox', { name: 'Password', exact: true })
  await password.fill('1234')
  await page
    .getByText('I accept the demo terms of participation.', { exact: true })
    .click()
  await expect(page.getByRole('checkbox')).toBeChecked()
  await page.getByRole('button', { name: 'Complete enrollment' }).click()
  await expect(
    page.getByText('Use at least 5 characters.', { exact: true }),
  ).toBeVisible()
  await password.fill('demo-secret')
  const email = page.getByRole('textbox', { name: 'Email address', exact: true })
  await email.fill('invalid-email')
  await page.getByRole('button', { name: 'Complete enrollment' }).click()
  await expect(
    page.getByText('Enter a valid email address.', { exact: true }),
  ).toBeVisible()
  await email.fill('alex@example.com')
  await expect(
    page.getByText('Enter a valid email address.', { exact: true }),
  ).toBeHidden()
  await page.locator('[data-name="role"] .sd-dropdown').click()
  await page.getByRole('option', { name: 'Project manager' }).click()
  await expect(page.locator('.enrollment-summary')).toContainText(
    'Project manager',
  )
  await page.getByRole('button', { name: 'Complete enrollment' }).click()
  await expect(page.getByRole('heading', { name: 'Welcome, Alex.' })).toBeVisible()
  await expect(page.locator('.enrollment-success')).toContainText(
    'Project manager',
  )
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    'demo-secret',
  )
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await page.getByRole('button', { name: 'Enroll another member' }).click()
  await expect(password).toHaveValue('')
  await page.getByRole('button', { name: 'Demo terms', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText(
    'not a production security policy',
  )
  await page.getByRole('button', { name: 'Understood' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('unsaved changes trigger the beforeunload guard', async ({ page }) => {
  await page.goto('/')
  await page
    .getByRole('textbox', { name: 'Full name', exact: true })
    .fill('Unsubmitted member')
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
  await expect(page).toHaveTitle('Member Enrollment | AdminLTE + SurveyJS')
  await expect(page.locator('.app-header')).toBeVisible()
  await expect(page.locator('.app-footer')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Member Enrollment', exact: true }),
  ).toBeVisible()
  const sidebar = page.locator('.app-sidebar')
  await expect(
    sidebar.getByRole('link', { name: 'Original AdminLTE page' }),
  ).toHaveAttribute(
    'href',
    'https://adminlte.io/themes/v3/pages/forms/validation.html',
  )
  await expect(
    sidebar.getByRole('link', { name: 'Project Brief' }),
  ).toHaveAttribute('href', '../project-brief/')
  await expect(
    sidebar.getByRole('link', { name: 'Invoice Studio' }),
  ).toHaveAttribute('href', '../invoice-studio/')
  await expect(
    sidebar.getByRole('link', { name: 'Member Enrollment' }),
  ).toHaveAttribute('aria-current', 'page')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({
    path: `artifacts/member-enrollment-${testInfo.project.name}.png`,
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
