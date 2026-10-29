import type { FormData, Workflow } from './workflows'

export type SavedDraft = {
  data: FormData
  savedAt: string
  status: 'draft' | 'saved'
}
export type StorageResult<T> = { value: T; error?: string }
export const storageKey = (workflow: Workflow) => `forma:${workflow}:v1`

function safeData(workflow: Workflow, data: FormData): FormData {
  const allowed =
    workflow === 'projects'
      ? [
          'name',
          'description',
          'client',
          'lead',
          'status',
          'budget',
          'spent',
          'duration',
        ]
      : [
          'number',
          'issued',
          'due',
          'sender',
          'recipient',
          'senderAddress',
          'recipientAddress',
          'items',
          'taxRate',
          'shipping',
          'notes',
        ]
  return Object.fromEntries(
    allowed.filter((key) => key in data).map((key) => [key, data[key]]),
  )
}

export function readDraft(
  workflow: Workflow,
): StorageResult<SavedDraft | null> {
  if (workflow === 'enrollment') return { value: null }
  try {
    const raw = localStorage.getItem(storageKey(workflow))
    if (!raw) return { value: null }
    const parsed: unknown = JSON.parse(raw)
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('data' in parsed) ||
      !parsed.data ||
      typeof parsed.data !== 'object' ||
      Array.isArray(parsed.data) ||
      !('savedAt' in parsed) ||
      typeof parsed.savedAt !== 'string' ||
      !Number.isFinite(Date.parse(parsed.savedAt))
    )
      throw new Error('Invalid draft')
    return {
      value: {
        data: safeData(workflow, parsed.data as FormData),
        savedAt: parsed.savedAt,
        status:
          'status' in parsed && parsed.status === 'saved' ? 'saved' : 'draft',
      },
    }
  } catch {
    return {
      value: null,
      error:
        'Your saved draft could not be opened. You can continue without it.',
    }
  }
}

export function writeDraft(
  workflow: Workflow,
  data: FormData,
  status: SavedDraft['status'],
): StorageResult<SavedDraft | null> {
  if (workflow === 'enrollment') return { value: null }
  try {
    const value = {
      data: safeData(workflow, data),
      savedAt: new Date().toISOString(),
      status,
    }
    localStorage.setItem(storageKey(workflow), JSON.stringify(value))
    return { value }
  } catch {
    return {
      value: null,
      error:
        'Browser storage is unavailable or full. Your changes are still on this page, but were not saved.',
    }
  }
}

export function deleteDraft(workflow: Workflow): StorageResult<boolean> {
  try {
    localStorage.removeItem(storageKey(workflow))
    return { value: true }
  } catch {
    return {
      value: false,
      error: 'The saved draft could not be removed from browser storage.',
    }
  }
}
