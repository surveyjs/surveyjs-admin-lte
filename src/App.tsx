import { useEffect, useRef, useState } from 'react'
import { Survey } from 'survey-react-ui'
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  CheckCheck,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  ClipboardList,
  ExternalLink,
  FileText,
  FlaskConical,
  Layers2,
  Menu,
  Plus,
  Printer,
  RotateCcw,
  Save,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { createForm, money, sampleData, workflows } from './workflows'
import type { FormData, Workflow } from './workflows'
import { deleteDraft, readDraft, writeDraft } from './storage'
import type { SavedDraft } from './storage'
import './App.css'

const icons = {
  projects: BriefcaseBusiness,
  enrollment: Users,
  invoices: FileText,
}
const routes: Workflow[] = ['projects', 'enrollment', 'invoices']

function currentRoute(): Workflow {
  const route = window.location.hash.replace('#/', '')
  return routes.includes(route as Workflow) ? (route as Workflow) : 'projects'
}

function App() {
  const [route, setRoute] = useState<Workflow>(currentRoute)
  const [menuOpen, setMenuOpen] = useState(false)
  const [references, setReferences] = useState(false)
  const dirty = useRef(false)
  useEffect(() => {
    function navigate() {
      const next = currentRoute()
      if (next === route) return
      if (
        dirty.current &&
        !window.confirm('Leave this page and discard unsaved changes?')
      ) {
        window.history.replaceState(null, '', `#/${route}`)
        return
      }
      dirty.current = false
      setRoute(next)
      setMenuOpen(false)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', navigate)
    return () => window.removeEventListener('hashchange', navigate)
  }, [route])
  const meta = workflows[route]
  return (
    <div
      className={`app-wrapper forma-shell ${menuOpen ? 'mobile-open' : ''}`}
      data-workflow={route}
    >
      <a
        className="skip-link"
        href="#workspace-main"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('workspace-main')?.focus()
        }}
      >
        Skip to content
      </a>
      <aside className="app-sidebar" aria-label="Workspace navigation">
        <a className="sidebar-brand" href="#/projects" aria-label="SurveyJS Admin">
          <span className="brand-mark">
            <Layers2 size={21} />
          </span>
          <span className="brand-title">
            SurveyJS
            <small>Admin</small>
          </span>
        </a>
        <div className="workspace-switch">
          <span className="workspace-avatar">SJ</span>
          <div>
            <strong>Studio workspace</strong>
            <small>Operations & delivery</small>
          </div>
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="sidebar-menu">
          {routes.map((key) => {
            const Icon = icons[key]
            return (
              <a
                key={key}
                href={`#/${key}`}
                className={`nav-link ${route === key ? 'active' : ''}`}
                aria-current={route === key ? 'page' : undefined}
              >
                <Icon size={19} />
                <span>{workflows[key].title}</span>
                <small>{workflows[key].number}</small>
              </a>
            )
          })}
        </nav>
        <div className="sidebar-bottom">
          <button
            className="nav-link reference-button"
            onClick={() => setReferences(true)}
          >
            <CircleHelp size={18} />
            Original templates
            <ArrowUpRight size={15} />
          </button>
          <div className="local-indicator">
            <span className="status-dot" />
            <div>
              <strong>Local workspace</strong>
              <small>AdminLTE + SurveyJS</small>
            </div>
          </div>
        </div>
      </aside>
      {menuOpen && (
        <button
          className="sidebar-shade"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <header className="app-header navbar">
        <button
          className="icon-button mobile-menu"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="breadcrumbs">
          <span>Workspace</span>
          <ChevronRight size={14} />
          <span>{meta.section}</span>
          <ChevronRight size={14} />
          <strong>{meta.title}</strong>
        </div>
        <div className="header-end">
          <span className="demo-chip">
            <FlaskConical size={13} />
            Demo workspace
          </span>
          <span className="user-avatar" title="Alex Morgan">
            AM
          </span>
        </div>
      </header>
      <main className="app-main" id="workspace-main" tabIndex={-1}>
        <WorkflowPage
          key={route}
          workflow={route}
          onDirty={(value) => {
            dirty.current = value
          }}
        />
      </main>
      <footer className="app-footer">
        <span>SurveyJS Admin / Local edition</span>
        <span>
          AdminLTE 4 <span className="footer-divider">/</span> SurveyJS Form
          Library
        </span>
      </footer>
      {references && (
        <Modal title="Original templates" onClose={() => setReferences(false)}>
          <div className="reference-list">
            {routes.map((key) => (
              <a
                href={workflows[key].original}
                target="_blank"
                rel="noreferrer"
                key={key}
              >
                <span className="reference-number">
                  {workflows[key].number}
                </span>
                <span>
                  <strong>AdminLTE / {workflows[key].originalTitle}</strong>
                  <small>{workflows[key].title}</small>
                </span>
                <ExternalLink size={17} />
              </a>
            ))}
          </div>
          <a
            className="adapter-link"
            href="https://surveyjs.io/documentation/theme-adapters"
            target="_blank"
            rel="noreferrer"
          >
            SurveyJS Bootstrap adapter
            <ArrowUpRight size={16} />
          </a>
        </Modal>
      )}
    </div>
  )
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return (
    <dialog
      ref={dialog}
      className="forma-dialog"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      aria-label={title}
    >
      <div className="dialog-heading">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  )
}

function WorkflowPage({
  workflow,
  onDirty,
}: {
  workflow: Workflow
  onDirty: (value: boolean) => void
}) {
  const [initial] = useState(() => readDraft(workflow))
  const [model] = useState(() =>
    createForm(
      workflow,
      initial.value?.data ??
        (workflow === 'invoices' ? sampleData('invoices') : undefined),
    ),
  )
  const [data, setData] = useState<FormData>(() => ({ ...model.data }))
  const [saved, setSaved] = useState<SavedDraft | null>(initial.value)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState<{
    text: string
    error?: boolean
  } | null>(initial.error ? { text: initial.error, error: true } : null)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [modal, setModal] = useState<'reset' | 'terms' | null>(null)
  const [enrolled, setEnrolled] = useState<{
    name: string
    email: string
    role: string
  } | null>(null)
  const meta = workflows[workflow]
  const Icon = icons[workflow]
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
    onDirty(dirty)
  }, [dirty, onDirty])
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])
  function notifyStorage(status: 'draft' | 'saved') {
    const result = writeDraft(workflow, model.data, status)
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
          : workflow === 'projects'
            ? 'Project saved in this browser.'
            : 'Invoice saved in this browser.',
    })
  }
  function submit() {
    if (!model.validate(true, true)) {
      setTab('edit')
      setMessage({
        text: 'Please review the highlighted fields before continuing.',
        error: true,
      })
      return
    }
    if (workflow === 'enrollment') {
      setEnrolled({
        name: String(model.getValue('fullName')),
        email: String(model.getValue('email')),
        role: String(model.getValue('role')),
      })
      model.clear()
      setData({})
      setDirty(false)
      setMessage(null)
    } else notifyStorage('saved')
  }
  function reset() {
    const result = deleteDraft(workflow)
    if (!result.value) {
      setMessage({ text: result.error!, error: true })
      setModal(null)
      return
    }
    model.clear()
    setData({ ...model.data })
    setSaved(null)
    setDirty(false)
    setEnrolled(null)
    setTab('edit')
    setMessage({ text: 'Form cleared. Saved draft removed.' })
    setModal(null)
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
  function printInvoice() {
    if (!model.validate()) {
      setTab('edit')
      setMessage({
        text: 'Complete the required invoice fields before printing.',
        error: true,
      })
      return
    }
    window.print()
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span>{meta.number}</span>
            {meta.section.toUpperCase()}
          </div>
          <h1>{meta.title}</h1>
          <p>{meta.subtitle}</p>
        </div>
        <a
          className="btn btn-outline-secondary original-link"
          href={meta.original}
          target="_blank"
          rel="noreferrer"
        >
          Reference Example
          <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="record-strip">
        <div className="record-title">
          <span className="record-icon">
            <Icon size={19} />
          </span>
          <strong>
            {workflow === 'projects'
              ? saved?.status === 'saved'
                ? 'Project record'
                : 'New engagement'
              : workflow === 'enrollment'
                ? 'Workspace access'
                : String(data.number || 'New invoice')}
          </strong>
          <span
            className={`status-label ${saved?.status === 'saved' && !dirty ? 'is-saved' : ''}`}
          >
            {enrolled
              ? 'Completed'
              : dirty
                ? 'Unsaved changes'
                : saved?.status === 'saved'
                  ? 'Saved'
                  : 'Draft'}
          </span>
        </div>
        <div className="record-meta">
          {workflow === 'invoices'
            ? 'USD / US Dollar'
            : workflow === 'enrollment'
              ? 'Demo enrollment'
              : 'Project workspace'}
        </div>
      </div>
      {message && (
        <div
          role={message.error ? 'alert' : 'status'}
          className={`notice ${message.error ? 'notice-error' : ''}`}
        >
          <span>
            {message.error ? (
              <CircleHelp size={17} />
            ) : (
              <CircleCheck size={17} />
            )}
            {message.text}
          </span>
          <button
            aria-label="Dismiss message"
            className="icon-button"
            onClick={() => setMessage(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {workflow === 'invoices' && (
        <div className="invoice-toolbar">
          <div className="view-tabs" role="tablist" aria-label="Invoice view">
            <button
              role="tab"
              aria-selected={tab === 'edit'}
              onClick={() => setTab('edit')}
            >
              <ClipboardList size={16} />
              Editor
            </button>
            <button
              role="tab"
              aria-selected={tab === 'preview'}
              onClick={() => setTab('preview')}
            >
              <FileText size={16} />
              Preview
            </button>
          </div>
          <button className="btn btn-outline-secondary" onClick={printInvoice}>
            <Printer size={16} />
            Print / PDF
          </button>
        </div>
      )}
      <div className="workspace-grid">
        <section className="form-workspace" aria-label={`${meta.title} form`}>
          {enrolled ? (
            <div className="enrollment-success" role="status">
              <span className="success-mark">
                <CheckCheck size={30} />
              </span>
              <div className="eyebrow">ENROLLMENT COMPLETE</div>
              <h2>Welcome, {enrolled.name.split(' ')[0]}.</h2>
              <p>Your demo enrollment is ready.</p>
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{enrolled.email}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{enrolled.role}</dd>
                </div>
                <div>
                  <dt>Account</dt>
                  <dd>Simulation only</dd>
                </div>
              </dl>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEnrolled(null)
                  setDirty(false)
                }}
              >
                <Plus size={16} />
                Enroll another member
              </button>
            </div>
          ) : (
            <>
              {!(workflow === 'invoices' && tab === 'preview') && (
                <div className="form-topline">
                  <span>
                    {workflow === 'projects'
                      ? 'PROJECT DETAILS'
                      : workflow === 'enrollment'
                        ? 'NEW MEMBER'
                        : 'BILLING DETAILS'}
                  </span>
                  <button
                    className="text-button"
                    onClick={() => {
                      model.clear()
                      model.mergeData(sampleData(workflow))
                      setData({ ...model.data })
                      setDirty(true)
                    }}
                  >
                    <FlaskConical size={14} />
                    Load example
                  </button>
                </div>
              )}
              <div
                className={
                  workflow === 'invoices' && tab === 'preview'
                    ? 'editor-hidden'
                    : 'survey-host'
                }
              >
                <Survey model={model} />
              </div>
              {workflow === 'enrollment' && (
                <div className="terms-footnote">
                  <button
                    className="text-button"
                    onClick={() => setModal('terms')}
                  >
                    Demo terms
                    <ArrowUpRight size={14} />
                  </button>
                  <span>No real account will be created.</span>
                </div>
              )}
              {workflow === 'invoices' && tab === 'preview' && (
                <InvoiceDocument data={data} />
              )}
            </>
          )}
        </section>
        <aside className="context-panel" aria-label="Summary">
          {workflow === 'projects' && (
            <>
              <div className="context-label">AT A GLANCE</div>
              <h2>{String(data.name || 'Your next project')}</h2>
              <p className="muted">
                {String(data.client || 'Client not assigned')}
              </p>
              <div className="budget-amount">{money(data.budget)}</div>
              <span className="muted small">Planned investment</span>
              <div className="spend-track">
                <span
                  style={{
                    width: `${Math.min(100, Math.max(0, (Number(data.spent) / (Number(data.budget) || 1)) * 100))}%`,
                  }}
                />
              </div>
              <div className="summary-row">
                <span>Spent to date</span>
                <strong>{money(data.spent)}</strong>
              </div>
              <div className="summary-row">
                <span>Remaining</span>
                <strong
                  className={
                    Number(data.spent) > Number(data.budget)
                      ? 'text-danger'
                      : ''
                  }
                >
                  {money(Number(data.budget || 0) - Number(data.spent || 0))}
                </strong>
              </div>
              <div className="summary-divider" />
              <div className="summary-row">
                <span>Time frame</span>
                <strong>{String(data.duration || 0)} weeks</strong>
              </div>
              <div className="summary-row">
                <span>Project lead</span>
                <strong>{String(data.lead || 'Unassigned')}</strong>
              </div>
              <div className="context-label checklist-title">READINESS</div>
              {[
                ['Project named', data.name],
                ['Client assigned', data.client],
                ['Lead assigned', data.lead],
              ].map(([label, complete]) => (
                <div
                  className={`checklist-row ${complete ? 'complete' : ''}`}
                  key={String(label)}
                >
                  <CircleCheck size={16} />
                  {String(label)}
                </div>
              ))}
            </>
          )}
          {workflow === 'enrollment' && (
            <>
              <div className="people-art" aria-hidden="true">
                <div className="people-art-grid" />
                <span className="person-tile person-one">AM</span>
                <span className="person-tile person-two">JL</span>
                <span className="person-tile person-three">
                  <Plus size={26} />
                </span>
                <span className="people-art-check">
                  <Check size={18} />
                </span>
              </div>
              <div className="context-label">ONE WORKSPACE</div>
              <h2>Made for working together.</h2>
              <p className="muted">Good projects start with the right team.</p>
              <div className="summary-divider" />
              <div className="security-heading">
                <ShieldCheck size={18} />
                <strong>Private by default</strong>
              </div>
              <p className="muted small">
                Passwords are never saved. Enrollment is a local demonstration,
                not an authentication service.
              </p>
              <div className="summary-row">
                <span>Role</span>
                <strong>
                  {String(data.role || enrolled?.role || 'member')}
                </strong>
              </div>
            </>
          )}
          {workflow === 'invoices' && (
            <>
              <div className="context-label">INVOICE SUMMARY</div>
              <h2>Balance due</h2>
              <div className="invoice-total">{money(data.total)}</div>
              <span className="muted small">USD</span>
              <div className="summary-divider" />
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>{money(data.subtotal)}</strong>
              </div>
              <div className="summary-row">
                <span>Tax ({String(data.taxRate ?? 0)}%)</span>
                <strong>{money(data.tax)}</strong>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <strong>{money(data.shipping)}</strong>
              </div>
              <div className="summary-divider" />
              <div className="summary-row">
                <span>Due date</span>
                <strong>{String(data.due || 'Not set')}</strong>
              </div>
              <div className="summary-row">
                <span>Line items</span>
                <strong>
                  {Array.isArray(data.items) ? data.items.length : 0}
                </strong>
              </div>
              <div className="billing-note">
                <FileText size={18} />
                <p>
                  Tax applies to the item subtotal. Shipping is added after tax.
                </p>
              </div>
            </>
          )}
        </aside>
      </div>
      {!enrolled && (
        <div className="action-bar">
          <div className="save-state">
            <span className={`status-dot ${dirty ? 'unsaved' : ''}`} />
            <span>
              {dirty
                ? 'Changes not saved'
                : saved
                  ? `Saved ${new Date(saved.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : workflow === 'enrollment'
                    ? 'No data stored'
                    : 'Not saved yet'}
            </span>
          </div>
          <div className="action-buttons">
            <button
              className="icon-button reset-button"
              title="Clear form and saved draft"
              aria-label="Clear form and saved draft"
              onClick={() => setModal('reset')}
            >
              <RotateCcw size={17} />
            </button>
            <button className="btn btn-link cancel-button" onClick={cancel}>
              <ArrowLeft size={15} />
              Cancel
            </button>
            {workflow !== 'enrollment' && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => notifyStorage('draft')}
              >
                <Save size={16} />
                Save draft
              </button>
            )}
            <button className="btn btn-primary" onClick={submit}>
              {workflow === 'enrollment' ? (
                <Users size={16} />
              ) : (
                <Check size={17} />
              )}
              {workflow === 'projects'
                ? 'Save project'
                : workflow === 'enrollment'
                  ? 'Complete enrollment'
                  : 'Save invoice'}
            </button>
          </div>
        </div>
      )}
      {workflow === 'invoices' && (
        <div className="print-only">
          <InvoiceDocument data={data} />
        </div>
      )}
      {modal === 'reset' && (
        <Modal title="Clear this form?" onClose={() => setModal(null)}>
          <p>
            Current values and the saved draft for this page will be removed.
            This cannot be undone.
          </p>
          <div className="dialog-actions">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setModal(null)}
            >
              Keep working
            </button>
            <button className="btn btn-danger" onClick={reset}>
              <RotateCcw size={16} />
              Clear form
            </button>
          </div>
        </Modal>
      )}
      {modal === 'terms' && (
        <Modal
          title="Demo terms of participation"
          onClose={() => setModal(null)}
        >
          <p>
            This is a fictional local workspace. Use example details only.
            Submitting this form does not create an account, send an invitation,
            grant access, or transmit your information.
          </p>
          <p>
            The five-character password minimum matches the original validation
            demo. It is not a production security policy. Your password is
            cleared after successful submission and is never saved to browser
            storage.
          </p>
          <button className="btn btn-primary" onClick={() => setModal(null)}>
            <Check size={16} />
            Understood
          </button>
        </Modal>
      )}
    </>
  )
}

function InvoiceDocument({ data }: { data: FormData }) {
  const items = Array.isArray(data.items) ? (data.items as FormData[]) : []
  return (
    <article className="invoice-document" aria-label="Invoice document">
      <div className="invoice-document-heading">
        <div>
          <div className="invoice-wordmark">
            {String(data.sender || 'Your studio')}
            <span>.</span>
          </div>
          <div className="document-kicker">PROFESSIONAL SERVICES</div>
        </div>
        <div className="invoice-label">
          INVOICE<strong>{String(data.number || 'Draft')}</strong>
        </div>
      </div>
      <div className="invoice-parties">
        <div>
          <span className="document-kicker">FROM</span>
          <strong>{String(data.sender || '')}</strong>
          <p>{String(data.senderAddress || '')}</p>
        </div>
        <div>
          <span className="document-kicker">BILL TO</span>
          <strong>{String(data.recipient || '')}</strong>
          <p>{String(data.recipientAddress || '')}</p>
        </div>
        <div className="invoice-dates">
          <span className="document-kicker">ISSUED</span>
          <strong>{String(data.issued || '')}</strong>
          <span className="document-kicker">DUE DATE</span>
          <strong>{String(data.due || '')}</strong>
        </div>
      </div>
      <div className="invoice-table-wrap">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item / Reference</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <strong>{String(item.description || 'Untitled item')}</strong>
                  <small>{String(item.reference || '')}</small>
                </td>
                <td>{String(item.quantity || 0)}</td>
                <td>{money(item.price)}</td>
                <td>{money(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="invoice-bottom">
        <div className="invoice-notes">
          <span className="document-kicker">PAYMENT TERMS</span>
          <p>{String(data.notes || 'Payment terms not specified.')}</p>
        </div>
        <div className="document-totals">
          <div>
            <span>Subtotal</span>
            <strong>{money(data.subtotal)}</strong>
          </div>
          <div>
            <span>Tax ({String(data.taxRate ?? 0)}%)</span>
            <strong>{money(data.tax)}</strong>
          </div>
          <div>
            <span>Shipping</span>
            <strong>{money(data.shipping)}</strong>
          </div>
          <div className="document-grand-total">
            <span>Total due</span>
            <strong>{money(data.total)}</strong>
          </div>
        </div>
      </div>
      <div className="invoice-signoff">Thank you for your business.</div>
    </article>
  )
}

export default App
