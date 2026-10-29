import { describe, expect, it, vi, afterEach } from 'vitest'
import { createForm, sampleData } from './workflows'
import { deleteDraft, readDraft, storageKey, writeDraft } from './storage'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('Project Brief', () => {
  it('requires project details and accepts the complete example', () => {
    const model = createForm('projects')
    expect(model.validate()).toBe(false)
    model.data = sampleData('projects')
    expect(model.validate()).toBe(true)
    model.setValue('budget', -1)
    expect(model.validate()).toBe(false)
    model.dispose()
  })
  it('allows overspend rather than silently inventing a business restriction', () => {
    const model = createForm('projects', {
      ...sampleData('projects'),
      spent: 30000,
    })
    expect(model.validate()).toBe(true)
    model.dispose()
  })
})

describe('Member Enrollment', () => {
  it('requires a valid email, five-character password, and explicit consent', () => {
    const model = createForm('enrollment', sampleData('enrollment'))
    expect(model.validate()).toBe(false)
    model.setValue('password', '1234')
    model.setValue('terms', ['accepted'])
    expect(model.validate()).toBe(false)
    model.setValue('password', 'abcde')
    model.setValue('email', 'not-an-email')
    expect(model.validate()).toBe(false)
    model.setValue('email', 'alex@example.com')
    expect(model.validate()).toBe(true)
    model.setValue('terms', [])
    expect(model.validate()).toBe(false)
    model.dispose()
  })
})

describe('Invoice Studio', () => {
  it('calculates lines, tax, shipping and totals through SurveyJS expressions', () => {
    const model = createForm('invoices', sampleData('invoices'))
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
    const model = createForm('invoices', sampleData('invoices'))
    model.setValue('items', [
      { description: 'Invalid', quantity: 0, price: -1 },
    ])
    expect(model.validate()).toBe(false)
    model.data = sampleData('invoices')
    model.setValue('due', '2026-10-01')
    expect(model.validate()).toBe(false)
    model.data = sampleData('invoices')
    model.setValue('taxRate', 101)
    expect(model.validate()).toBe(false)
    model.dispose()
  })
})

describe('local drafts', () => {
  it('round-trips and removes project and invoice drafts', () => {
    for (const workflow of ['projects', 'invoices'] as const) {
      expect(
        writeDraft(workflow, sampleData(workflow), 'draft').error,
      ).toBeUndefined()
      expect(readDraft(workflow).value?.data).toEqual(sampleData(workflow))
      expect(deleteDraft(workflow).value).toBe(true)
      expect(readDraft(workflow).value).toBeNull()
    }
  })
  it('never persists enrollment or top-level password fields', () => {
    writeDraft('enrollment', { password: 'secret' }, 'saved')
    expect(localStorage.length).toBe(0)
    writeDraft(
      'projects',
      { ...sampleData('projects'), password: 'secret' },
      'draft',
    )
    expect(localStorage.getItem(storageKey('projects'))).not.toContain('secret')
  })
  it('handles malformed data and storage failures without throwing', () => {
    localStorage.setItem(storageKey('projects'), '{broken')
    expect(readDraft('projects').error).toBeTruthy()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded')
    })
    expect(
      writeDraft('invoices', sampleData('invoices'), 'draft').error,
    ).toBeTruthy()
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    expect(deleteDraft('projects').value).toBe(false)
  })
})
