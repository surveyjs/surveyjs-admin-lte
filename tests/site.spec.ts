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

const DEMOS: [link: string, heading: string][] = [
  ['Project Brief', 'Project Brief'],
  ['Member Enrollment', 'Member Enrollment'],
  ['Invoice Studio', 'Invoice Studio'],
  ['New Customer (SurveyJS navigation)', 'New Customer'],
  ['New Customer (AdminLTE steps)', 'New Customer'],
  ['Incident Report (SurveyJS navigation)', 'Incident Report'],
  ['Incident Report (AdminLTE steps)', 'Incident Report'],
]

test('landing page links to seven working demos', async ({ page }, testInfo) => {
  const problems = trackProblems(page)
  await page.goto('./')
  await expect(page).toHaveTitle('AdminLTE + SurveyJS Templates')
  const demos = page.getByRole('link', { name: /^Open demo/ })
  await expect(demos).toHaveCount(DEMOS.length)
  await page.screenshot({
    path: `artifacts/landing-${testInfo.project.name}.png`,
    fullPage: true,
  })
  for (const [link, heading] of DEMOS) {
    await page.getByRole('link', { name: `Open demo: ${link}`, exact: true }).click()
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
  await page
    .locator('.app-sidebar')
    .getByRole('link', { name: 'Incident Report: AdminLTE steps' })
    .click()
  await expect(page).toHaveTitle(/^Incident Report \(AdminLTE steps\)/)
  if (testInfo.project.name === 'mobile')
    await page.getByRole('button', { name: 'Toggle navigation' }).click()
  await page.locator('.sidebar-brand a').click()
  await expect(page).toHaveTitle('AdminLTE + SurveyJS Templates')
  expect(problems).toEqual([])
})
