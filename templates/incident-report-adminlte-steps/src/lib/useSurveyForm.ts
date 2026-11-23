import { useEffect, useState } from 'react'
import type { SurveyModel } from 'survey-core'
import { releaseFiles } from '../surveys/files'

export type FormData = Record<string, unknown>

// Page state for a multi-page SurveyJS form: re-renders on every answer (for the
// live summary), tracks unsaved answers with a beforeunload guard, keeps the
// submitted result, and restarts the form empty or with example data.
export function useSurveyForm(model: SurveyModel, exampleData: () => FormData) {
  const [, setRevision] = useState(0)
  const [dirty, setDirty] = useState(false)
  const [result, setResult] = useState<FormData | null>(null)

  useEffect(() => {
    const changed = () => {
      setRevision((revision) => revision + 1)
      setDirty(true)
    }
    const completed = () => {
      setResult(model.data)
      setDirty(false)
    }
    model.onValueChanged.add(changed)
    model.onComplete.add(completed)
    return () => {
      model.onValueChanged.remove(changed)
      model.onComplete.remove(completed)
    }
  }, [model])
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  function restart(data?: FormData) {
    releaseFiles(model.data)
    model.clear(true, true)
    if (data) model.mergeData(data)
    setResult(null)
    setDirty(Boolean(data))
    setRevision((revision) => revision + 1)
  }

  return {
    dirty,
    result,
    loadExample: () => restart(exampleData()),
    reset: () => restart(),
  }
}
