import { useEffect, useState } from 'react'
import { Survey } from 'survey-react-ui'
import ContentHeader from '../layout/ContentHeader'
import Dialog from '../components/Dialog'
import ProjectSummary from '../components/ProjectSummary'
import { createSurvey, exampleData } from '../surveys/form'
import type { FormData } from '../surveys/form'
import { deleteDraft, readDraft, writeDraft } from '../lib/storage'
import type { SavedDraft } from '../lib/storage'

type Message = { text: string; error?: boolean }

export default function ProjectBrief() {
  const [initial] = useState(readDraft)
  const [model] = useState(() => createSurvey(initial.value?.data))
  const [data, setData] = useState<FormData>(() => ({ ...model.data }))
  const [saved, setSaved] = useState<SavedDraft | null>(initial.value)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState<Message | null>(
    initial.error ? { text: initial.error, error: true } : null,
  )
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    const handler = () => {
      setData({ ...model.data })
      setDirty(true)
      setMessage(null)
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

  function save(status: SavedDraft['status']) {
    const result = writeDraft(model.data, status)
    if (result.error) {
      setMessage({ text: result.error, error: true })
      return
    }
    setSaved(result.value)
    setDirty(false)
    setMessage({
      text:
        status === 'draft'
          ? 'Draft saved in this browser.'
          : 'Project saved in this browser.',
    })
  }
  function submit() {
    if (!model.validate(true, true)) {
      setMessage({
        text: 'Please review the highlighted fields before continuing.',
        error: true,
      })
      return
    }
    save('saved')
  }
  function loadExample() {
    model.clear()
    model.mergeData(exampleData())
    setData({ ...model.data })
    setDirty(true)
  }
  function cancel() {
    model.clear()
    if (saved) model.mergeData(saved.data)
    setData({ ...model.data })
    setDirty(false)
    setMessage({
      text: saved
        ? 'Returned to your last saved version.'
        : 'Unsaved changes discarded.',
    })
  }
  function reset() {
    setConfirmReset(false)
    const result = deleteDraft()
    if (!result.value) {
      setMessage({ text: result.error!, error: true })
      return
    }
    model.clear()
    setData({ ...model.data })
    setSaved(null)
    setDirty(false)
    setMessage({ text: 'Form cleared. Saved draft removed.' })
  }

  const statusBadge = dirty
    ? ['Unsaved changes', 'text-bg-warning']
    : saved?.status === 'saved'
      ? ['Saved', 'text-bg-success']
      : ['Draft', 'text-bg-secondary']

  return (
    <>
      <ContentHeader
        title="Project Brief"
        breadcrumb={['Home', 'Projects', 'Project Brief']}
      />
      <div className="app-content">
        <div className="container-fluid">
          {message && (
            <div
              role={message.error ? 'alert' : 'status'}
              className={`alert alert-dismissible ${message.error ? 'alert-danger' : 'alert-success'}`}
            >
              {message.text}
              <button
                type="button"
                className="btn-close"
                aria-label="Dismiss message"
                onClick={() => setMessage(null)}
              />
            </div>
          )}
          <div className="row">
            <div className="col-lg-8">
              <div className="card card-primary card-outline mb-4">
                <div className="card-header">
                  <h3 className="card-title">
                    Project details
                    <span className={`badge ms-2 ${statusBadge[1]}`}>
                      {statusBadge[0]}
                    </span>
                  </h3>
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
                </div>
                <div className="card-body">
                  <Survey model={model} />
                </div>
                <div className="card-footer form-actions">
                  <span className="save-state text-secondary small">
                    {dirty
                      ? 'Changes not saved'
                      : saved
                        ? `Saved ${new Date(saved.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'Not saved yet'}
                  </span>
                  <div className="form-actions-buttons">
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      title="Clear form and saved draft"
                      aria-label="Clear form and saved draft"
                      onClick={() => setConfirmReset(true)}
                    >
                      <i
                        className="bi bi-arrow-counterclockwise"
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={cancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => save('draft')}
                    >
                      Save draft
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={submit}
                    >
                      Save project
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <ProjectSummary data={data} />
            </div>
          </div>
        </div>
      </div>
      {confirmReset && (
        <Dialog
          title="Clear this form?"
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
              <button type="button" className="btn btn-danger" onClick={reset}>
                Clear form
              </button>
            </>
          }
        >
          <p className="mb-0">
            Current values and the saved draft for this page will be removed.
            This cannot be undone.
          </p>
        </Dialog>
      )}
    </>
  )
}
