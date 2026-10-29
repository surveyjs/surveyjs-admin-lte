import { Model } from 'survey-core'

export type FormData = Record<string, unknown>

// SurveyJS form definition. Edit fields here; the page renders whatever this JSON describes.
export const surveyJson = {
  showQuestionNumbers: 'off',
  showNavigationButtons: false,
  showCompletedPage: false,
  checkErrorsMode: 'onValueChanged',
  textUpdateMode: 'onTyping',
  clearInvisibleValues: 'none',
  widthMode: 'responsive',
  elements: [
    {
      type: 'panel',
      name: 'scope',
      title: 'The engagement',
      state: 'expanded',
      elements: [
        {
          type: 'text',
          name: 'name',
          title: 'Project title',
          isRequired: true,
          placeholder: 'e.g. Northline brand refresh',
          maxLength: 120,
        },
        {
          type: 'comment',
          name: 'description',
          title: 'Scope & objectives',
          placeholder: 'What does a successful outcome look like?',
          rows: 3,
          maxLength: 2000,
        },
        {
          type: 'text',
          name: 'client',
          title: 'Client organization',
          isRequired: true,
          maxLength: 120,
        },
        {
          type: 'text',
          name: 'lead',
          title: 'Engagement lead',
          isRequired: true,
          startWithNewLine: false,
          maxLength: 120,
        },
        {
          type: 'dropdown',
          name: 'status',
          title: 'Project stage',
          isRequired: true,
          defaultValue: 'planning',
          choices: [
            { value: 'planning', text: 'Planning' },
            { value: 'active', text: 'In progress' },
            { value: 'hold', text: 'On hold' },
            { value: 'canceled', text: 'Canceled' },
            { value: 'success', text: 'Completed' },
          ],
        },
      ],
    },
    {
      type: 'panel',
      name: 'budgetPanel',
      title: 'Time & investment',
      state: 'expanded',
      elements: [
        {
          type: 'text',
          inputType: 'number',
          name: 'budget',
          title: 'Planned budget (USD)',
          isRequired: true,
          min: 0,
          max: 100000000,
          defaultValue: 0,
        },
        {
          type: 'text',
          inputType: 'number',
          name: 'spent',
          title: 'Spent to date (USD)',
          min: 0,
          max: 100000000,
          defaultValue: 0,
          startWithNewLine: false,
        },
        {
          type: 'text',
          inputType: 'number',
          name: 'duration',
          title: 'Estimated duration (weeks)',
          min: 1,
          max: 520,
          defaultValue: 6,
          isRequired: true,
        },
      ],
    },
  ],
}

export function createSurvey(data?: FormData) {
  const model = new Model(surveyJson)
  if (data) model.data = data
  return model
}

export function exampleData(): FormData {
  return {
    name: 'Northline brand refresh',
    description:
      'Refresh the identity and digital experience for a new generation of urban commuters.',
    client: 'Northline Mobility',
    lead: 'Alex Morgan',
    status: 'active',
    budget: 24000,
    spent: 6800,
    duration: 8,
  }
}
