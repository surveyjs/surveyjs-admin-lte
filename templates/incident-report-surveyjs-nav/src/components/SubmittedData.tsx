import type { FormData } from '../lib/useSurveyForm'

export default function SubmittedData({ data }: { data: FormData }) {
  return (
    <div className="card card-success card-outline mb-4 submitted-data">
      <div className="card-header">
        <h3 className="card-title">
          <i className="bi bi-braces me-2" aria-hidden="true" />
          Submitted data
        </h3>
      </div>
      <div className="card-body">
        <p className="small text-secondary">
          The JSON result SurveyJS produced. Send it to your backend; this demo
          only shows it here.
        </p>
        <pre
          className="submitted-json mb-0"
          tabIndex={0}
          aria-label="Submitted data as JSON"
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
}
