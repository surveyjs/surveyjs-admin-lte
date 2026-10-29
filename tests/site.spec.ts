import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

function trackProblems(page: Page) {
  const problems: string[] = []
  page.on('pageerror', (error) => problems.push(`error: ${error.message}`))
  page.on('requestfailed', (request) => problems.push(`failed: ${request.url()}`))
  page.on('response', (response) => {
    if (response.status() >= 400)
      problems.push(`${response.status()}: ${response.url()}`)
  })
  return problems
}

test('landing page links to three working demos', async ({ page }, testInfo) => {
  const problems = trackProblems(page)
  await page.goto('./')
  await expect(page).toHaveTitle('AdminLTE + SurveyJS Templates')
  const demos = page.getByRole('link', { name: /^Open demo/ })
  await expect(demos).toHaveCount(3)
  await page.screenshot({
    path: `artifacts/landing-${testInfo.project.name}.png`,
    fullPage: true,
  })
  for (const heading of ['Project Brief', 'Member Enrollment', 'Invoice Studio']) {
    await page.getByRole('link', { name: `Open demo: ${heading}` }).click()
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    await page.goBack()
  }
  expect(problems).toEqual([])
})

test('sidebar links move between demos', async ({ page }, testInfo) => {
  const problems = trackProblems(page)
  await page.goto('./project-brief/')
  if (testInfo.project.name === 'mobile')
    await page.getByRole('button', { name: 'Toggle navigation' }).click()
  await page.locator('.app-sidebar').getByRole('link', { name: 'Invoice Studio' }).click()
  await expect(
    page.getByRole('heading', { name: 'Invoice Studio', exact: true }),
  ).toBeVisible()
  if (testInfo.project.name === 'mobile')
    await page.getByRole('button', { name: 'Toggle navigation' }).click()
  await page.locator('.sidebar-brand a').click()
  await expect(page).toHaveTitle('AdminLTE + SurveyJS Templates')
  expect(problems).toEqual([])
})
