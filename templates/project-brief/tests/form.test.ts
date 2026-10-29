import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSurvey, exampleData } from '../src/surveys/form'
import {
  STORAGE_KEY,
  deleteDraft,
  readDraft,
  writeDraft,
} from '../src/lib/storage'
import { money } from '../src/lib/format'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('project form', () => {
  it('requires project details and accepts the complete example', () => {
    const model = createSurvey()
    expect(model.validate()).toBe(false)
    model.data = exampleData()
    expect(model.validate()).toBe(true)
    model.setValue('budget', -1)
    expect(model.validate()).toBe(false)
    model.dispose()
  })
  it('allows overspend rather than silently inventing a business restriction', () => {
    const model = createSurvey({ ...exampleData(), spent: 30000 })
    expect(model.validate()).toBe(true)
    model.dispose()
  })
})

describe('local drafts', () => {
  it('round-trips and removes the draft', () => {
    expect(writeDraft(exampleData(), 'draft').error).toBeUndefined()
    expect(readDraft().value?.data).toEqual(exampleData())
    expect(deleteDraft().value).toBe(true)
    expect(readDraft().value).toBeNull()
  })
  it('never persists fields outside the allowlist', () => {
    writeDraft({ ...exampleData(), password: 'secret' }, 'draft')
    expect(localStorage.getItem(STORAGE_KEY)).not.toContain('secret')
  })
  it('handles malformed data and storage failures without throwing', () => {
    localStorage.setItem(STORAGE_KEY, '{broken')
    expect(readDraft().error).toBeTruthy()
    expect(readDraft().value).toBeNull()
    localStorage.setItem(STORAGE_KEY, '{"data":[1]}')
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

describe('money', () => {
  it('formats US dollars and treats missing values as zero', () => {
    expect(money(5087.75)).toBe('$5,087.75')
    expect(money(undefined)).toBe('$0.00')
  })
})
