import { useEffect, useRef } from 'react'
import type { Step } from '../lib/useSurveySteps'

// AdminLTE-styled step list (modeled on the bs-stepper used in AdminLTE 3's
// Advanced Forms page). Every step is a button: earlier steps open directly,
// later steps validate the pages in between first.
export default function FormSteps({
  steps,
  current,
  onSelect,
}: {
  steps: Step[]
  current: number
  onSelect: (index: number) => void
}) {
  const active = useRef<HTMLButtonElement>(null)
  const previous = useRef(current)
  useEffect(() => {
    // After a page change, bring the steps into view and move focus to the
    // current step so keyboard and screen reader users land at the top of the page.
    if (previous.current === current) return
    previous.current = current
    const button = active.current
    if (!button) return
    if (button.getBoundingClientRect().top < 0)
      button.scrollIntoView({ block: 'start' })
    button.focus({ preventScroll: true })
  }, [current])

  return (
    <nav aria-label="Form steps">
      <ol className="form-steps">
        {steps.map((step, index) => {
          const status =
            index < current ? 'done' : index === current ? 'active' : 'todo'
          return (
            <li key={step.name} className={`form-step is-${status}`}>
              <button
                type="button"
                className="form-step-trigger"
                ref={index === current ? active : undefined}
                aria-current={index === current ? 'step' : undefined}
                onClick={() => onSelect(index)}
              >
                <span className="form-step-circle" aria-hidden="true">
                  {status === 'done' ? <i className="bi bi-check-lg" /> : index + 1}
                </span>
                <span className="form-step-label">
                  <span className="visually-hidden">
                    Step {index + 1} of {steps.length}:{' '}
                  </span>
                  {step.title}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
