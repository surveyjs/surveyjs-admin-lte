import { describe, expect, it } from 'vitest'
import { createSurvey, exampleData, roleLabel } from '../src/surveys/form'

describe('enrollment form', () => {
  it('requires a valid email, five-character password, and explicit consent', () => {
    const model = createSurvey(exampleData())
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
  it('example data never includes a password or consent', () => {
    expect(exampleData()).not.toHaveProperty('password')
    expect(exampleData()).not.toHaveProperty('terms')
  })
})

describe('roleLabel', () => {
  it('maps role values to their display text', () => {
    expect(roleLabel('manager')).toBe('Project manager')
    expect(roleLabel('reviewer')).toBe('Reviewer')
    expect(roleLabel(undefined)).toBe('Member')
  })
})
