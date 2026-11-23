import { useState } from 'react'
import { Survey } from 'survey-react-ui'
import ContentHeader from '../layout/ContentHeader'
import Dialog from '../components/Dialog'
import FormSteps from '../components/FormSteps'
import SummaryCard from '../components/SummaryCard'
import SubmittedData from '../components/SubmittedData'
import { useSurveyForm } from '../lib/useSurveyForm'
import { useSurveySteps } from '../lib/useSurveySteps'
import { createSurvey, exampleData, summarize, surveyJson } from '../surveys/form'

// Page navigation is AdminLTE's: the step list and the Back / Continue / Submit
// buttons in the card footer call the SurveyJS page API. SurveyJS's own buttons
// and progress bar are turned off in surveys/form.ts; button labels still come
// from the form JSON. Nothing on this page is sent or stored.
export default function IncidentReport() {
  const [model] = useState(() => createSurvey())
  const { result, loadExample, reset } = useSurveyForm(model, exampleData)
  const nav = useSurveySteps(model)
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <>
      <ContentHeader
        title="Incident Report"
        breadcrumb={['Home', 'Service desk', 'Incident Report']}
      />
      <div className="app-content">
        <div className="container-fluid">
          <p className="text-secondary form-intro">{surveyJson.description}</p>
          <div className="row">
            <div className="col-xl-9">
              <div className="card card-primary card-outline mb-4">
                <div className="card-header">
                  <h3 className="card-title">
                    {result ? 'Report submitted' : 'Report details'}
                  </h3>
                  {!result && (
                    <div className="card-tools">
                      <button
                        type="button"
                        className="btn btn-tool"
                        onClick={loadExample}
                      >
                        <i className="bi bi-magic me-1" aria-hidden="true" />
                        Load example
                      </button>
                    </div>
                  )}
                </div>
                {!result && (
                  <div className="card-body border-bottom form-steps-bar">
                    <FormSteps
                      steps={nav.steps}
                      current={nav.current}
                      onSelect={nav.goTo}
                    />
                  </div>
                )}
                <div className="card-body">
                  <Survey model={model} />
                </div>
                <div className="card-footer form-actions">
                  <span className="save-state text-secondary small">
                    {result
                      ? 'Nothing is sent or stored'
                      : `Step ${nav.current + 1} of ${nav.steps.length}`}
                  </span>
                  <div className="form-actions-buttons">
                    {result ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={reset}
                      >
                        Report another incident
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          title="Start over"
                          aria-label="Start over"
                          onClick={() => setConfirmReset(true)}
                        >
                          <i
                            className="bi bi-arrow-counterclockwise"
                            aria-hidden="true"
                          />
                        </button>
                        {!nav.isFirst && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={nav.back}
                          >
                            <i
                              className="bi bi-chevron-left me-1"
                              aria-hidden="true"
                            />
                            {model.pagePrevText}
                          </button>
                        )}
                        {nav.isLast ? (
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={nav.complete}
                          >
                            <i
                              className="bi bi-check-lg me-1"
                              aria-hidden="true"
                            />
                            {model.completeText}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={nav.next}
                          >
                            {model.pageNextText}
                            <i
                              className="bi bi-chevron-right ms-1"
                              aria-hidden="true"
                            />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3">
              <SummaryCard
                title="Report summary"
                icon="bi-clipboard-pulse"
                rows={summarize(model)}
              />
              {result && <SubmittedData data={result} />}
            </div>
          </div>
        </div>
      </div>
      {confirmReset && (
        <Dialog
          title="Start over?"
          onClose={() => setConfirmReset(false)}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmReset(false)}
              >
                Keep working
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  reset()
                  setConfirmReset(false)
                }}
              >
                Clear form
              </button>
            </>
          }
        >
          <p className="mb-0">
            All answers on every page will be removed and the form returns to
            the first page.
          </p>
        </Dialog>
      )}
    </>
  )
}
