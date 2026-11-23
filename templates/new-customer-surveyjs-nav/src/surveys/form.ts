import { Model } from 'survey-core'
import type { FormData } from '../lib/useSurveyForm'
import type { SummaryRow } from '../components/SummaryCard'
import { keepFilesInBrowser } from './files'
import surveyJson from './new-customer.json'

// SurveyJS's own page navigation: the progress bar and the Back / Continue /
// Submit buttons are configured in the form JSON and rendered by SurveyJS.
const NAVIGATION = {}

export { surveyJson }

export function createSurvey(data?: FormData) {
  const model = new Model({
    ...surveyJson,
    // The page header already shows the form title and description.
    showTitle: false,
    ...NAVIGATION,
  })
  // The Bootstrap theme adapter renders page titles as <div>. Make them headings
  // (below the card's h3) so screen reader users can jump between form pages.
  model.onGetTitleTagName.add((_, options) => {
    if (options.element.isPage) options.tagName = 'h4'
  })
  keepFilesInBrowser(model)
  if (data) model.mergeData(data)
  return model
}

// A fictional B2B customer that fills every page except the final confirmation.
export function exampleData(): FormData {
  return {
    companyName: 'Northline Mobility Ltd',
    tradingName: 'Northline',
    customerType: 'business',
    industry: 'Logistics & transportation',
    website: 'https://example.com',
    registrationNumber: 'NL-204518',
    taxId: 'US-98-7654321',
    addressLine1: '42 Union Avenue',
    city: 'Seattle',
    region: 'WA',
    postalCode: '98101',
    country: 'United States',
    customerTags: ['Strategic account', 'Priority onboarding'],
    contacts: [
      {
        fullName: 'Jordan Reyes',
        jobTitle: 'Operations Director',
        email: 'jordan.reyes@example.com',
        phone: '+1 555 0100',
        contactRole: 'primary',
        preferredChannel: 'Email',
      },
      {
        fullName: 'Priya Nair',
        jobTitle: 'Finance Manager',
        email: 'priya.nair@example.com',
        contactRole: 'billing',
      },
    ],
    needsSeparateBillingContact: false,
    customerStatus: 'Qualified prospect',
    leadSource: 'Referral',
    leadSourceDetails: 'Introduced by a partner agency',
    accountManager: 'Sam Patel',
    priority: 'High',
    businessNeeds:
      'Replace the spreadsheets used to schedule 300 delivery vehicles with a shared dispatch platform.',
    currency: 'USD',
    estimatedMonthlySpend: 4500,
    paymentTerms: 'Net 30',
    requiresPurchaseOrder: true,
    poNumber: 'PO-88213',
    differentBillingAddress: false,
    requestedServices: [
      'Software subscription',
      'Implementation & onboarding',
      'Training',
    ],
    handlesSensitiveData: 'yes',
    dataTypes: ['Personal data', 'Employee records'],
    dataNotes: 'Driver records must stay in the US region.',
    requiresDpa: true,
    requiresSecurityReview: false,
    hasTargetGoLiveDate: true,
    targetGoLive: '2027-02-01',
    nextAction: 'Start onboarding',
    internalHandoverNotes:
      'Kick-off call requested for the first week of December.',
  }
}

function display(model: Model, name: string) {
  const question = model.getQuestionByName(name)
  return !question || question.isEmpty() ? '' : String(question.displayValue)
}

export function annualRevenue(model: Model) {
  const value = Number(model.getValue('annualRevenuePreview'))
  const currency = String(model.getValue('currency') || 'USD')
  if (!Number.isFinite(value) || model.getValue('estimatedMonthlySpend') == null)
    return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function summarize(model: Model): SummaryRow[] {
  const contacts = model.getValue('contacts')
  const count = Array.isArray(contacts)
    ? contacts.filter((row) => row && row.fullName).length
    : 0
  return [
    { label: 'Company', value: display(model, 'companyName') },
    { label: 'Type', value: display(model, 'customerType') },
    { label: 'Contacts', value: count ? String(count) : '' },
    { label: 'Lifecycle stage', value: display(model, 'customerStatus') },
    { label: 'Account owner', value: display(model, 'accountManager') },
    { label: 'Annual revenue', value: annualRevenue(model) },
  ]
}
