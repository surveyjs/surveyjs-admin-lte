import { useEffect, useState } from 'react'
import { Survey } from 'survey-react-ui'
import ContentHeader from '../layout/ContentHeader'
import Dialog from '../components/Dialog'
import EnrollmentSummary from '../components/EnrollmentSummary'
import EnrollmentSuccess from '../components/EnrollmentSuccess'
import { createSurvey, exampleData } from '../surveys/form'

type Enrolled = { name: string; email: string; role: unknown }

// Nothing on this page is stored or sent anywhere: the password stays in
// memory and is cleared after a successful submission.
export default function MemberEnrollment() {
  const [model] = useState(() => createSurvey())
  const [role, setRole] = useState<unknown>(() => model.getValue('role'))
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enrolled, setEnrolled] = useState<Enrolled | null>(null)
  const [dialog, setDialog] = useState<'reset' | 'terms' | null>(null)

  useEffect(() => {
    const handler = () => {
      setRole(model.getValue('role'))
      setDirty(true)
      setError(null)
    }
    model.onValueChanged.add(handler)
    return () => model.onValueChanged.remove(handler)
  }, [model])
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  function submit() {
    if (!model.validate(true, true)) {
      setError('Please review the highlighted fields before continuing.')
      return
    }
    setEnrolled({
      name: String(model.getValue('fullName')),
      email: String(model.getValue('email')),
      role: model.getValue('role'),
    })
    model.clear()
    setRole(model.getValue('role'))
    setDirty(false)
    setError(null)
  }
  function loadExample() {
    model.clear()
    model.mergeData(exampleData())
    setRole(model.getValue('role'))
    setDirty(true)
  }
  function clearForm() {
    model.clear()
    setRole(model.getValue('role'))
    setDirty(false)
    setError(null)
  }

  return (
    <>
      <ContentHeader
        title="Member Enrollment"
        breadcrumb={['Home', 'People', 'Member Enrollment']}
      />
      <div className="app-content">
        <div className="container-fluid">
          {error && (
            <div role="alert" className="alert alert-danger alert-dismissible">
              {error}
              <button
                type="button"
                className="btn-close"
                aria-label="Dismiss message"
                onClick={() => setError(null)}
              />
            </div>
          )}
          <div className="row">
            <div className="col-lg-8">
              {enrolled ? (
                <EnrollmentSuccess
                  {...enrolled}
                  onReset={() => setEnrolled(null)}
                />
              ) : (
                <div className="card card-primary mb-4">
                  <div className="card-header">
                    <h3 className="card-title">Member details</h3>
                    <div className="card-tools">
                      <button
                        type="button"
                        className="btn btn-tool text-white"
                        onClick={loadExample}
                      >
                        <i className="bi bi-magic me-1" aria-hidden="true" />
                        Load example
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <Survey model={model} />
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 small mt-3">
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0"
                        onClick={() => setDialog('terms')}
                      >
                        Demo terms
                      </button>
                      <span className="text-secondary">
                        No real account will be created.
                      </span>
                    </div>
                  </div>
                  <div className="card-footer form-actions">
                    <span className="save-state text-secondary small">
                      No data stored
                    </span>
                    <div className="form-actions-buttons">
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        title="Reset form"
                        aria-label="Reset form"
                        onClick={() => setDialog('reset')}
                      >
                        <i
                          className="bi bi-arrow-counterclockwise"
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={clearForm}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={submit}
                      >
                        Complete enrollment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="col-lg-4">
              <EnrollmentSummary role={role} />
            </div>
          </div>
        </div>
      </div>
      {dialog === 'reset' && (
        <Dialog
          title="Clear this form?"
          onClose={() => setDialog(null)}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDialog(null)}
              >
                Keep working
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  clearForm()
                  setDialog(null)
                }}
              >
                Clear form
              </button>
            </>
          }
        >
          <p className="mb-0">Current values on this page will be removed.</p>
        </Dialog>
      )}
      {dialog === 'terms' && (
        <Dialog
          title="Demo terms of participation"
          onClose={() => setDialog(null)}
          footer={
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setDialog(null)}
            >
              Understood
            </button>
          }
        >
          <p>
            This is a fictional local workspace. Use example details only.
            Submitting this form does not create an account, send an invitation,
            grant access, or transmit your information.
          </p>
          <p className="mb-0">
            The five-character password minimum matches the original validation
            demo. It is not a production security policy. Your password is
            cleared after successful submission and is never saved to browser
            storage.
          </p>
        </Dialog>
      )}
    </>
  )
}
