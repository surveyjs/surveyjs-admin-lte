import { Model } from 'survey-core'

export type FormData = Record<string, unknown>

// SurveyJS form definition. Line totals, subtotal, tax and total are SurveyJS
// expressions, so the page never recalculates money itself.
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
      // A dynamic panel (not a matrix) keeps line items readable on phones.
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

export function createSurvey(data?: FormData) {
  const model = new Model(surveyJson)
  if (data) model.data = data
  return model
}

export function exampleData(): FormData {
  return {
    number: 'INV-2026-042',
    issued: '2026-10-29',
    due: '2026-11-28',
    sender: 'SurveyJS Demo Studio',
    senderAddress: '128 Market Street\nPortland, OR 97205\nhello@example.com',
    recipient: 'Northline Mobility',
    recipientAddress: '42 Union Avenue\nSeattle, WA 98101\naccounts@example.com',
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
