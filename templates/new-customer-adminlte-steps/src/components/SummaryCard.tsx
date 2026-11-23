export type SummaryRow = { label: string; value: string }

export default function SummaryCard({
  title,
  icon,
  rows,
}: {
  title: string
  icon: string
  rows: SummaryRow[]
}) {
  return (
    <div className="card card-secondary card-outline mb-4 form-summary">
      <div className="card-header">
        <h3 className="card-title">
          <i className={`bi ${icon} me-2`} aria-hidden="true" />
          {title}
        </h3>
      </div>
      <div className="card-body">
        <dl className="summary-list mb-0">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="small fw-normal text-secondary">{row.label}</dt>
              <dd className="mb-0 text-break">
                {row.value || <span className="text-secondary">—</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
