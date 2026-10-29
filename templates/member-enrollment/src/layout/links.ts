// Navigation between the SurveyJS templates. The relative hrefs work when the
// three templates are deployed side by side (see the repository's showcase site).
// Change them if you copy a single template into your own project.
export type TemplateId = 'project-brief' | 'member-enrollment' | 'invoice-studio'

export const TEMPLATES: {
  id: TemplateId
  title: string
  icon: string
  href: string
}[] = [
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
]

export const HOME_URL = '../'
export const SURVEYJS_DOCS_URL =
  'https://surveyjs.io/form-library/documentation/overview'
