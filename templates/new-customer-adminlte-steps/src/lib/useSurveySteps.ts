import { useEffect, useState } from 'react'
import type { SurveyModel } from 'survey-core'

export type Step = { name: string; title: string }

// Drives SurveyJS page navigation from AdminLTE controls. Steps are read from
// the survey's visible pages on every render, so pages hidden by `visibleIf`
// drop out of the list as soon as an answer changes.
export function useSurveySteps(model: SurveyModel) {
  const [, setRevision] = useState(0)
  useEffect(() => {
    const update = () => setRevision((revision) => revision + 1)
    model.onCurrentPageChanged.add(update)
    model.onPageVisibleChanged.add(update)
    return () => {
      model.onCurrentPageChanged.remove(update)
      model.onPageVisibleChanged.remove(update)
    }
  }, [model])

  const steps: Step[] = model.visiblePages.map((page) => ({
    name: page.name,
    title: page.navigationTitle || page.title || page.name,
  }))
  const current = model.currentPageNo

  // Going back never validates. Going forward validates every page on the way
  // and stops on the first page with errors.
  function goTo(index: number) {
    while (model.currentPageNo > index) if (!model.prevPage()) break
    while (model.currentPageNo < index) if (!model.nextPage()) break
  }

  return {
    steps,
    current,
    isFirst: current === 0,
    isLast: current === steps.length - 1,
    goTo,
    back: () => goTo(current - 1),
    next: () => goTo(current + 1),
    complete: () => model.completeLastPage(),
  }
}
