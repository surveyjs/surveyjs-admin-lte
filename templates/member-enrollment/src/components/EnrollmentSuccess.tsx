import { roleLabel } from '../surveys/form'

export default function EnrollmentSuccess({
  name,
  email,
  role,
  onReset,
}: {
  name: string
  email: string
  role: unknown
  onReset: () => void
}) {
  return (
    <div className="card card-success card-outline mb-4 enrollment-success">
      <div className="card-body text-center py-5" role="status">
        <i
          className="bi bi-check-circle-fill text-success display-4"
          aria-hidden="true"
        />
        <h2 className="h4 mt-3">Welcome, {name.split(' ')[0]}.</h2>
        <p className="text-secondary">Your demo enrollment is ready.</p>
        <dl className="row text-start mx-auto mb-4 enrollment-details">
          <dt className="col-5 fw-normal text-secondary">Email</dt>
          <dd className="col-7">{email}</dd>
          <dt className="col-5 fw-normal text-secondary">Role</dt>
          <dd className="col-7">{roleLabel(role)}</dd>
          <dt className="col-5 fw-normal text-secondary">Account</dt>
          <dd className="col-7">Simulation only</dd>
        </dl>
        <button type="button" className="btn btn-primary" onClick={onReset}>
          <i className="bi bi-person-plus me-1" aria-hidden="true" />
          Enroll another member
        </button>
      </div>
    </div>
  )
}
