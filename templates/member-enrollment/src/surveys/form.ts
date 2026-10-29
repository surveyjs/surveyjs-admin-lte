import { Model } from 'survey-core'

export type FormData = Record<string, unknown>

const roles = [
  { value: 'member', text: 'Member' },
  { value: 'reviewer', text: 'Reviewer' },
  { value: 'manager', text: 'Project manager' },
]

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
      type: 'text',
      name: 'fullName',
      title: 'Full name',
      isRequired: true,
      placeholder: 'Alex Morgan',
      maxLength: 120,
    },
    {
      // A text input with the email validator: SurveyJS 3.2.3 does not update
      // HTML email inputs while typing, which delays error feedback.
      type: 'text',
      name: 'email',
      title: 'Email address',
      autocomplete: 'email',
      isRequired: true,
      placeholder: 'alex@example.com',
      validators: [{ type: 'email', text: 'Enter a valid email address.' }],
    },
    {
      type: 'text',
      name: 'password',
      title: 'Password',
      inputType: 'password',
      isRequired: true,
      maxLength: 128,
      autocomplete: 'new-password',
      validators: [
        { type: 'text', minLength: 5, text: 'Use at least 5 characters.' },
      ],
    },
    {
      type: 'dropdown',
      name: 'role',
      title: 'Workspace role',
      defaultValue: 'member',
      choices: roles,
    },
    {
      type: 'checkbox',
      name: 'terms',
      titleLocation: 'hidden',
      isRequired: true,
      requiredErrorText: 'Accept the demo terms to continue.',
      choices: [
        {
          value: 'accepted',
          text: 'I accept the demo terms of participation.',
        },
      ],
    },
  ],
}

export function createSurvey(data?: FormData) {
  const model = new Model(surveyJson)
  // Show the email keyboard on mobile devices.
  model.onAfterRenderQuestion.add((_, options) => {
    if (options.question.name !== 'email') return
    const input = options.htmlElement.querySelector('input')
    if (input) input.inputMode = 'email'
  })
  if (data) model.data = data
  return model
}

// Fictional identity only: the example never fills a password or consent.
export function exampleData(): FormData {
  return {
    fullName: 'Alex Morgan',
    email: 'alex@example.com',
    role: 'member',
  }
}

export function roleLabel(value: unknown) {
  return roles.find((role) => role.value === value)?.text ?? 'Member'
}
