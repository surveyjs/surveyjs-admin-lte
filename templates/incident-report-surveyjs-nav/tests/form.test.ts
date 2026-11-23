import { describe, expect, it, vi } from 'vitest'
import type { Model } from 'survey-core'
import { createSurvey, exampleData, summarize } from '../src/surveys/form'
import { keepFilesInBrowser, releaseFiles } from '../src/surveys/files'

// true: SurveyJS renders its own navigation; false: the page renders AdminLTE steps.
const SURVEYJS_NAVIGATION = true

function invalidQuestions(model: Model) {
  return model
    .getAllQuestions(true)
    .filter((question) => question.hasErrors(true))
    .map((question) => question.name)
}

describe('incident report form', () => {
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

  it('shows the details page that matches the incident type', () => {
    const model = createSurvey()
    const pages = () => model.visiblePages.map((page) => page.name)
    expect(pages()).toEqual(['initial', 'impact', 'people_evidence', 'review'])
    model.setValue('incident_type', 'security')
    expect(pages()).toEqual([
      'initial',
      'security_details',
      'impact',
      'people_evidence',
      'review',
    ])
    model.dispose()
  })

  it('example data is valid everywhere except the final confirmation', () => {
    const model = createSurvey(exampleData())
    expect(invalidQuestions(model)).toEqual(['confirmations'])
    model.setValue('confirmations', ['accurate', 'policy'])
    expect(invalidQuestions(model)).toEqual([])
    model.dispose()
  })

  it('requires both confirmation statements, not just one', () => {
    const model = createSurvey()
    const question = model.getQuestionByName('confirmations')
    question.value = ['accurate']
    expect(question.hasErrors(true)).toBe(true)
    expect(question.errors[0].text).toBe(
      'Confirm both statements to submit the report.',
    )
    question.value = ['accurate', 'policy']
    expect(question.hasErrors(true)).toBe(false)
    model.dispose()
  })

  it('asks about remaining hazards only after the area is reported unsafe or unknown', () => {
    const model = createSurvey({ incident_type: 'workplace' })
    const hazards = model.getQuestionByName('workplace_hazards')
    expect(hazards.isVisible).toBe(false)
    model.setValue('workplace_area_safe', 'yes')
    expect(hazards.isVisible).toBe(false)
    model.setValue('workplace_area_safe', 'no')
    expect(hazards.isVisible).toBe(true)
    model.setValue('workplace_area_safe', 'unknown')
    expect(hazards.isVisible).toBe(true)
    model.dispose()
  })

  it('requires an incident title and description', () => {
    const model = createSurvey()
    expect(model.getQuestionByName('incident_title').isRequired).toBe(true)
    expect(model.getQuestionByName('incident_description').isRequired).toBe(true)
    model.dispose()
  })

  it('numbers pages through navigation, not in page titles', () => {
    const model = createSurvey()
    for (const page of model.pages) expect(page.title).not.toMatch(/^\d/)
    model.dispose()
  })

  it('summarizes answers with display text', () => {
    const model = createSurvey(exampleData())
    const rows = Object.fromEntries(
      summarize(model).map((row) => [row.label, row.value]),
    )
    expect(rows).toMatchObject({
      Type: 'IT incident',
      'Still ongoing': 'Yes',
      Severity: '4 of 5',
      Occurred: '2026-11-20 09:15',
      'Reported by': 'Alex Morgan',
    })
    model.dispose()
  })
})

describe('file handling', () => {
  it('keeps uploads in the browser as object URLs and revokes them', () => {
    const create = vi.fn(() => 'blob:demo-1')
    const revoke = vi.fn()
    vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: revoke })
    const model = createSurvey()
    expect(model.getQuestionByName('evidence_files').storeDataAsText).toBe(false)
    const file = new File(['log line'], 'server.log', { type: 'text/plain' })
    const uploaded = vi.fn()
    model.onUploadFiles.fire(model, {
      files: [file],
      callback: uploaded,
    } as never)
    expect(uploaded).toHaveBeenCalledWith([{ file, content: 'blob:demo-1' }])
    const cleared = vi.fn()
    model.onClearFiles.fire(model, {
      fileName: null,
      value: [{ name: 'server.log', content: 'blob:demo-1' }],
      callback: cleared,
    } as never)
    expect(revoke).toHaveBeenCalledWith('blob:demo-1')
    expect(cleared).toHaveBeenCalledWith('success')
    releaseFiles({ a: [{ content: 'blob:demo-2' }], b: 'plain text' })
    expect(revoke).toHaveBeenCalledWith('blob:demo-2')
    expect(revoke).toHaveBeenCalledTimes(2)
    model.dispose()
    vi.unstubAllGlobals()
  })

  it('registers handlers on any model', () => {
    const model = createSurvey()
    const before = model.onUploadFiles.length
    keepFilesInBrowser(model)
    expect(model.onUploadFiles.length).toBe(before + 1)
    model.dispose()
  })
})
