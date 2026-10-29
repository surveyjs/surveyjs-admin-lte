import type { FormData } from '../surveys/form'

// One draft per browser origin, kept in localStorage (not encrypted).
export const STORAGE_KEY = 'adminlte-surveyjs:invoice-studio:v1'
const ALLOWED_FIELDS = [
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

export type SavedDraft = {
  data: FormData
  savedAt: string
  status: 'draft' | 'saved'
}
export type StorageResult<T> = { value: T; error?: string }

function safeData(data: FormData): FormData {
  return Object.fromEntries(
    ALLOWED_FIELDS.filter((key) => key in data).map((key) => [key, data[key]]),
  )
}

export function readDraft(): StorageResult<SavedDraft | null> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
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
        data: safeData(parsed.data as FormData),
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
  data: FormData,
  status: SavedDraft['status'],
): StorageResult<SavedDraft | null> {
  try {
    const value = {
      data: safeData(data),
      savedAt: new Date().toISOString(),
      status,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    return { value }
  } catch {
    return {
      value: null,
      error:
        'Browser storage is unavailable or full. Your changes are still on this page, but were not saved.',
    }
  }
}

export function deleteDraft(): StorageResult<boolean> {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return { value: true }
  } catch {
    return {
      value: false,
      error: 'The saved draft could not be removed from browser storage.',
    }
  }
}
