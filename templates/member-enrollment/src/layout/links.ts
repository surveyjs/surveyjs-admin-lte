// Navigation between the SurveyJS templates. The relative hrefs work when the
// templates are deployed side by side (see the repository's showcase site).
// Change them if you copy a single template into your own project.
export type TemplateId =
  | 'project-brief'
  | 'member-enrollment'
  | 'invoice-studio'
  | 'new-customer-surveyjs-nav'
  | 'new-customer-adminlte-steps'
  | 'incident-report-surveyjs-nav'
  | 'incident-report-adminlte-steps'

export type TemplateLink = {
  id: TemplateId
  title: string
  // Accessible name when the visible title only makes sense under its group header.
  label?: string
  icon: string
  href: string
}

export const TEMPLATE_GROUPS: { title: string; templates: TemplateLink[] }[] = [
  {
    title: 'SURVEYJS TEMPLATES',
    templates: [
      {
        id: 'project-brief',
        title: 'Project Brief',
        icon: 'bi-briefcase',
        href: '../project-brief/',
      },
      {
        id: 'member-enrollment',
        title: 'Member Enrollment',
        icon: 'bi-person-plus',
        href: '../member-enrollment/',
      },
      {
        id: 'invoice-studio',
        title: 'Invoice Studio',
        icon: 'bi-receipt',
        href: '../invoice-studio/',
      },
    ],
  },
  {
    title: 'NEW CUSTOMER',
    templates: [
      {
        id: 'new-customer-surveyjs-nav',
        title: 'SurveyJS navigation',
        label: 'New Customer: SurveyJS navigation',
        icon: 'bi-window-stack',
        href: '../new-customer-surveyjs-nav/',
      },
      {
        id: 'new-customer-adminlte-steps',
        title: 'AdminLTE steps',
        label: 'New Customer: AdminLTE steps',
        icon: 'bi-list-ol',
        href: '../new-customer-adminlte-steps/',
      },
    ],
  },
  {
    title: 'INCIDENT REPORT',
    templates: [
      {
        id: 'incident-report-surveyjs-nav',
        title: 'SurveyJS navigation',
        label: 'Incident Report: SurveyJS navigation',
        icon: 'bi-window-stack',
        href: '../incident-report-surveyjs-nav/',
      },
      {
        id: 'incident-report-adminlte-steps',
        title: 'AdminLTE steps',
        label: 'Incident Report: AdminLTE steps',
        icon: 'bi-list-ol',
        href: '../incident-report-adminlte-steps/',
      },
    ],
  },
]

export const HOME_URL = '../'
export const SURVEYJS_DOCS_URL =
  'https://surveyjs.io/form-library/documentation/overview'
