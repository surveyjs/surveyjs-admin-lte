import { Model } from 'survey-core'

export type Workflow = 'projects' | 'enrollment' | 'invoices'
export type FormData = Record<string, unknown>

export const workflows = {
  projects: {
    title: 'Project Brief',
    section: 'Delivery',
    subtitle: 'A clear start for your next engagement.',
    original: 'https://adminlte.io/themes/v3/pages/examples/project-add.html',
    originalTitle: 'Project Add',
    number: '01',
  },
  enrollment: {
    title: 'Member Enrollment',
    section: 'People',
    subtitle: 'Bring the right people into your workspace.',
    original: 'https://adminlte.io/themes/v3/pages/forms/validation.html',
    originalTitle: 'Validation',
    number: '02',
  },
  invoices: {
    title: 'Invoice Studio',
    section: 'Finance',
    subtitle: 'Good work deserves a well-crafted invoice.',
    original: 'https://adminlte.io/themes/v3/pages/examples/invoice.html',
    originalTitle: 'Invoice',
    number: '03',
  },
} as const

const projectSchema = {
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

const enrollmentSchema = {
  elements: [
    {
      type: 'panel',
      name: 'identity',
      title: 'Member details',
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
          choices: [
            { value: 'member', text: 'Member' },
            { value: 'reviewer', text: 'Reviewer' },
            { value: 'manager', text: 'Project manager' },
          ],
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
    },
  ],
}

const invoiceSchema = {
  elements: [
    {
      type: 'panel',
      name: 'parties',
      title: 'Invoice details',
      state: 'expanded',
      elements: [
        {
          type: 'text',
          name: 'number',
          title: 'Invoice number',
          isRequired: true,
          maxLength: 60,
        },
        {
          type: 'text',
          name: 'issued',
          title: 'Issue date',
          inputType: 'date',
          isRequired: true,
          startWithNewLine: false,
        },
        {
          type: 'text',
          name: 'due',
          title: 'Due date',
          inputType: 'date',
          isRequired: true,
          startWithNewLine: false,
          validators: [
            {
              type: 'expression',
              expression: '{due} >= {issued}',
              text: 'Due date must be on or after the issue date.',
            },
          ],
        },
        {
          type: 'text',
          name: 'sender',
          title: 'From',
          isRequired: true,
          maxLength: 120,
        },
        {
          type: 'text',
          name: 'recipient',
          title: 'Bill to',
          isRequired: true,
          startWithNewLine: false,
          maxLength: 120,
        },
        {
          type: 'comment',
          name: 'senderAddress',
          title: 'Sender address & contact',
          rows: 2,
          maxLength: 500,
        },
        {
          type: 'comment',
          name: 'recipientAddress',
          title: 'Recipient address & contact',
          startWithNewLine: false,
          rows: 2,
          maxLength: 500,
        },
      ],
    },
    {
      type: 'paneldynamic',
      name: 'items',
      title: 'Line items',
      minPanelCount: 1,
      maxPanelCount: 30,
      panelCount: 1,
      panelAddText: 'Add line item',
      panelRemoveText: 'Remove item',
      confirmDelete: false,
      templateTitle: 'Item {panelIndex}',
      templateElements: [
        {
          type: 'text',
          name: 'description',
          title: 'Product or service',
          isRequired: true,
          maxLength: 200,
        },
        {
          type: 'text',
          name: 'reference',
          title: 'Reference',
          maxLength: 60,
          startWithNewLine: false,
        },
        {
          type: 'text',
          name: 'quantity',
          title: 'Quantity',
          inputType: 'number',
          min: 1,
          max: 10000,
          isRequired: true,
          defaultValue: 1,
        },
        {
          type: 'text',
          name: 'price',
          title: 'Unit price (USD)',
          inputType: 'number',
          min: 0,
          max: 1000000,
          isRequired: true,
          defaultValue: 0,
          startWithNewLine: false,
        },
        {
          type: 'expression',
          name: 'amount',
          title: 'Line total',
          expression: 'round({panel.quantity} * {panel.price}, 2)',
          displayStyle: 'currency',
          currency: 'USD',
          startWithNewLine: false,
        },
      ],
    },
    {
      type: 'panel',
      name: 'charges',
      title: 'Adjustments',
      state: 'expanded',
      elements: [
        {
          type: 'text',
          name: 'taxRate',
          title: 'Tax rate (%)',
          inputType: 'number',
          min: 0,
          max: 100,
          isRequired: true,
          defaultValue: 8.25,
        },
        {
          type: 'text',
          name: 'shipping',
          title: 'Shipping (USD)',
          inputType: 'number',
          min: 0,
          max: 1000000,
          isRequired: true,
          defaultValue: 0,
          startWithNewLine: false,
        },
        {
          type: 'comment',
          name: 'notes',
          title: 'Payment terms & notes',
          rows: 2,
          maxLength: 1000,
        },
      ],
    },
    {
      type: 'expression',
      name: 'subtotal',
      visible: false,
      expression: "round(sumInArray({items}, 'amount'), 2)",
    },
    {
      type: 'expression',
      name: 'tax',
      visible: false,
      expression: 'round({subtotal} * {taxRate} / 100, 2)',
    },
    {
      type: 'expression',
      name: 'total',
      visible: false,
      expression: 'round({subtotal} + {tax} + {shipping}, 2)',
    },
  ],
}

export function createForm(workflow: Workflow, data?: FormData) {
  const schemas = {
    projects: projectSchema,
    enrollment: enrollmentSchema,
    invoices: invoiceSchema,
  }
  const model = new Model({
    ...schemas[workflow],
    showQuestionNumbers: 'off',
    showNavigationButtons: false,
    showCompletedPage: false,
    checkErrorsMode: 'onValueChanged',
    textUpdateMode: 'onTyping',
    clearInvisibleValues: 'none',
    widthMode: 'responsive',
  })
  if (workflow === 'enrollment')
    model.onAfterRenderQuestion.add((_, options) => {
      if (options.question.name !== 'email') return
      const input = options.htmlElement.querySelector('input')
      if (input) input.inputMode = 'email'
    })
  if (data) model.data = data
  return model
}

export function sampleData(workflow: Workflow): FormData {
  if (workflow === 'projects')
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
  if (workflow === 'enrollment')
    return {
      fullName: 'Alex Morgan',
      email: 'alex@example.com',
      role: 'member',
    }
  return {
    number: 'INV-2026-042',
    issued: '2026-10-29',
    due: '2026-11-28',
    sender: 'SurveyJS Demo Studio',
    senderAddress: '128 Market Street\nPortland, OR 97205\nhello@example.com',
    recipient: 'Northline Mobility',
    recipientAddress:
      '42 Union Avenue\nSeattle, WA 98101\naccounts@example.com',
    items: [
      {
        description: 'Brand strategy workshop',
        reference: 'STR-01',
        quantity: 2,
        price: 750,
      },
      {
        description: 'Visual identity system',
        reference: 'DSN-02',
        quantity: 1,
        price: 3200,
      },
    ],
    taxRate: 8.25,
    shipping: 0,
    notes: 'Payment due within 30 days. Thank you for your business.',
  }
}

export function money(value: unknown) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value) || 0)
}
