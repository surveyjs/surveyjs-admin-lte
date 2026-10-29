import type { FormData } from '../surveys/form'
import { money } from '../lib/format'

export default function ProjectSummary({ data }: { data: FormData }) {
  const budget = Number(data.budget) || 0
  const spent = Number(data.spent) || 0
  const usedPercent = Math.min(100, Math.max(0, (spent / (budget || 1)) * 100))
  const readiness = [
    ['Project named', data.name],
    ['Client assigned', data.client],
    ['Lead assigned', data.lead],
  ] as const
  return (
    <div className="card card-secondary card-outline">
      <div className="card-header">
        <h3 className="card-title">At a glance</h3>
      </div>
      <div className="card-body">
        <h5 className="mb-0">{String(data.name || 'Your next project')}</h5>
        <p className="text-secondary">
          {String(data.client || 'Client not assigned')}
        </p>
        <div className="fs-3 fw-semibold">{money(budget)}</div>
        <div className="text-secondary small mb-2">Planned budget</div>
        <div
          className="progress mb-3"
          role="progressbar"
          aria-label="Budget spent"
          aria-valuenow={Math.round(usedPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`progress-bar ${spent > budget ? 'bg-danger' : 'bg-success'}`}
            style={{ width: `${usedPercent}%` }}
          />
        </div>
        <dl className="row mb-0">
          <dt className="col-6 fw-normal text-secondary">Spent to date</dt>
          <dd className="col-6 text-end">{money(spent)}</dd>
          <dt className="col-6 fw-normal text-secondary">Remaining</dt>
          <dd className={`col-6 text-end ${spent > budget ? 'text-danger' : ''}`}>
            {money(budget - spent)}
          </dd>
          <dt className="col-6 fw-normal text-secondary">Time frame</dt>
          <dd className="col-6 text-end">{String(data.duration || 0)} weeks</dd>
          <dt className="col-6 fw-normal text-secondary">Project lead</dt>
          <dd className="col-6 text-end">{String(data.lead || 'Unassigned')}</dd>
        </dl>
      </div>
      <ul className="list-group list-group-flush">
        {readiness.map(([label, complete]) => (
          <li className="list-group-item" key={label}>
            <i
              className={`bi me-2 ${complete ? 'bi-check-circle-fill text-success' : 'bi-circle text-secondary'}`}
              aria-hidden="true"
            />
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}
