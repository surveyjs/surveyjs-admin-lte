import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSurvey, exampleData } from '../src/surveys/form'
import {
  STORAGE_KEY,
  deleteDraft,
  readDraft,
  writeDraft,
} from '../src/lib/storage'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('invoice form', () => {
  it('calculates lines, tax, shipping and totals through SurveyJS expressions', () => {
    const model = createSurvey(exampleData())
    expect(model.validate()).toBe(true)
    expect(model.getValue('subtotal')).toBe(4700)
    expect(model.getValue('tax')).toBe(387.75)
    expect(model.getValue('total')).toBe(5087.75)
    model.setValue('shipping', 12.5)
    expect(model.getValue('total')).toBe(5100.25)
    model.setValue('items', [
      { description: 'Precision test', quantity: 3, price: 0.335 },
    ])
    expect(model.getValue('subtotal')).toBe(1.01)
    model.setValue('taxRate', 0)
    expect(model.getValue('total')).toBe(13.51)
    model.dispose()
  })
  it('rejects invalid quantities, rates and due dates', () => {
    const model = createSurvey(exampleData())
    model.setValue('items', [{ description: 'Invalid', quantity: 0, price: -1 }])
    expect(model.validate()).toBe(false)
    model.data = exampleData()
    model.setValue('due', '2026-10-01')
    expect(model.validate()).toBe(false)
    model.data = exampleData()
    model.setValue('taxRate', 101)
    expect(model.validate()).toBe(false)
    model.dispose()
  })
})

describe('local drafts', () => {
  it('round-trips and removes the invoice draft', () => {
    expect(writeDraft(exampleData(), 'draft').error).toBeUndefined()
    expect(readDraft().value?.data).toEqual(exampleData())
    expect(deleteDraft().value).toBe(true)
    expect(readDraft().value).toBeNull()
  })
  it('stores only invoice fields, not calculated totals or unknown fields', () => {
    const model = createSurvey(exampleData())
    writeDraft({ ...model.data, password: 'secret' }, 'draft')
    const stored = localStorage.getItem(STORAGE_KEY)!
    expect(stored).not.toContain('secret')
    expect(JSON.parse(stored).data).not.toHaveProperty('total')
    model.dispose()
  })
  it('handles malformed data and storage failures without throwing', () => {
    localStorage.setItem(STORAGE_KEY, '{broken')
    expect(readDraft().error).toBeTruthy()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded')
    })
    expect(writeDraft(exampleData(), 'draft').error).toBeTruthy()
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    expect(deleteDraft().value).toBe(false)
  })
})
