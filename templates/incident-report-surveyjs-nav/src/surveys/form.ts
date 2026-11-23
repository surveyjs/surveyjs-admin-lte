import { Model } from 'survey-core'
import type { FormData } from '../lib/useSurveyForm'
import type { SummaryRow } from '../components/SummaryCard'
import { keepFilesInBrowser } from './files'
import surveyJson from './incident-report.json'

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

// A fictional IT incident that fills every page except the final confirmation.
export function exampleData(): FormData {
  return {
    incident_type: 'it',
    incident_title: 'Customer portal returns errors after release',
    incident_description:
      'After the 09:00 release, customers saw "502 Bad Gateway" when opening invoices in the customer portal. The status page still showed all systems operational.',
    occurred_at: '2026-11-20T09:15',
    ongoing: 'yes',
    location: 'Customer portal (production)',
    reported_by: 'employee',
    reporter_name: 'Alex Morgan',
    reporter_email: 'alex@example.com',
    reporter_department: 'Customer Support',
    anonymous_request: 'no',
    it_category: 'outage',
    it_service: 'Customer portal: invoice viewer',
    it_symptoms: ['unavailable', 'error'],
    it_error_code: '502 Bad Gateway',
    it_users_affected: 'multiple',
    it_workaround: 'yes',
    it_workaround_details:
      'Support staff email invoice PDFs from the back office on request.',
    it_troubleshooting: ['restart', 'support'],
    impact_severity: 4,
    impact_areas: ['operations', 'customers'],
    business_disruption: 'yes',
    business_disruption_details:
      'Customers cannot view or download invoices online.',
    immediate_actions:
      'Rolled back the release on one node and opened a ticket with the platform team.',
    manager_notified: 'yes',
    notified_contact: 'Jamie Taylor, Support Team Lead',
    followup_needed: 'yes',
    followup_actions: [
      {
        action: 'Review the release checklist for gateway configuration changes.',
        owner: 'Platform team',
        due_date: '2026-11-27',
      },
    ],
    witnesses_present: 'no',
    evidence_available: 'no',
    additional_contact: 'yes',
  }
}

function display(model: Model, name: string) {
  const question = model.getQuestionByName(name)
  return !question || question.isEmpty() ? '' : String(question.displayValue)
}

export function summarize(model: Model): SummaryRow[] {
  const severity = model.getValue('impact_severity')
  const occurred = model.getValue('occurred_at')
  return [
    { label: 'Type', value: display(model, 'incident_type') },
    { label: 'Title', value: display(model, 'incident_title') },
    {
      label: 'Occurred',
      value: typeof occurred === 'string' ? occurred.replace('T', ' ') : '',
    },
    { label: 'Still ongoing', value: display(model, 'ongoing') },
    { label: 'Severity', value: severity ? `${severity} of 5` : '' },
    { label: 'Reported by', value: display(model, 'reporter_name') },
  ]
}
