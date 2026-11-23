import { describe, expect, it, vi } from 'vitest'
import type { Model } from 'survey-core'
import {
  annualRevenue,
  createSurvey,
  exampleData,
  summarize,
  surveyJson,
} from '../src/surveys/form'

// true: SurveyJS renders its own navigation; false: the page renders AdminLTE steps.
const SURVEYJS_NAVIGATION = true

function invalidQuestions(model: Model) {
  return model
    .getAllQuestions(true)
    .filter((question) => question.hasErrors(true))
    .map((question) => question.name)
}

describe('new customer form', () => {
  it('loads the JSON without unknown properties', () => {
    const model = createSurvey()
    expect(model.jsonErrors ?? []).toEqual([])
    expect(model.showTitle).toBe(false)
    model.dispose()
  })

  it('uses the navigation this template is built around', () => {
    const model = createSurvey()
    expect(model.isNavigationButtonsShowing).toBe(
      SURVEYJS_NAVIGATION ? 'bottom' : 'none',
    )
    expect(Boolean(model.showProgressBar)).toBe(SURVEYJS_NAVIGATION)
    model.dispose()
  })

  it('example data is valid everywhere except the final confirmation', () => {
    const model = createSurvey(exampleData())
    expect(invalidQuestions(model)).toEqual(['confirmAccuracy'])
    model.setValue('confirmAccuracy', true)
    expect(invalidQuestions(model)).toEqual([])
    model.dispose()
  })

  it('stores annual revenue once, as the expression question', () => {
    expect(surveyJson).not.toHaveProperty('calculatedValues')
    const model = createSurvey({ estimatedMonthlySpend: 1000 })
    expect(model.getValue('annualRevenuePreview')).toBe(12000)
    expect(Object.keys(model.data).filter((key) => /annual/i.test(key))).toEqual([
      'annualRevenuePreview',
    ])
    model.dispose()
  })

  it('boolean questions default to real booleans', () => {
    const model = createSurvey()
    expect(model.getValue('needsSeparateBillingContact')).toBe(false)
    expect(model.getValue('confirmAccuracy')).toBe(false)
    expect(model.getPanelByName('externalBillingContact').isVisible).toBe(false)
    model.setValue('needsSeparateBillingContact', true)
    expect(model.getPanelByName('externalBillingContact').isVisible).toBe(true)
    model.dispose()
  })

  it('keeps uploaded documents out of the result as base64', () => {
    const create = vi.fn(() => 'blob:doc-1')
    vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: vi.fn() })
    const model = createSurvey()
    expect(
      model.getQuestionByName('supportingDocuments').storeDataAsText,
    ).toBe(false)
    const callback = vi.fn()
    const file = new File(['%PDF'], 'certificate.pdf')
    model.onUploadFiles.fire(model, { files: [file], callback } as never)
    expect(callback).toHaveBeenCalledWith([{ file, content: 'blob:doc-1' }])
    model.dispose()
    vi.unstubAllGlobals()
  })

  it('summarizes the customer with display text and formatted revenue', () => {
    const model = createSurvey(exampleData())
    const rows = Object.fromEntries(
      summarize(model).map((row) => [row.label, row.value]),
    )
    expect(rows).toEqual({
      Company: 'Northline Mobility Ltd',
      Type: 'Business (B2B)',
      Contacts: '2',
      'Lifecycle stage': 'Qualified prospect',
      'Account owner': 'Sam Patel',
      'Annual revenue': '$54,000',
    })
    model.setValue('currency', 'EUR')
    expect(annualRevenue(model)).toBe('€54,000')
    model.dispose()
  })

  it('leaves revenue empty until a monthly estimate is entered', () => {
    const model = createSurvey()
    expect(annualRevenue(model)).toBe('')
    model.dispose()
  })
})
