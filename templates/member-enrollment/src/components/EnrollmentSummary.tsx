import { roleLabel } from '../surveys/form'

export default function EnrollmentSummary({ role }: { role: unknown }) {
  return (
    <div className="card card-secondary card-outline enrollment-summary">
      <div className="card-header">
        <h3 className="card-title">
          <i className="bi bi-shield-check me-2" aria-hidden="true" />
          Private by default
        </h3>
      </div>
      <div className="card-body">
        <p className="text-secondary">
          Passwords are never saved. Enrollment is a local demonstration, not an
          authentication service.
        </p>
        <dl className="row mb-0">
          <dt className="col-6 fw-normal text-secondary">Role</dt>
          <dd className="col-6 text-end mb-0">{roleLabel(role)}</dd>
        </dl>
      </div>
    </div>
  )
}
