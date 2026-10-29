import type { FormData } from '../surveys/form'
import { money } from '../lib/format'

export default function InvoiceSummary({ data }: { data: FormData }) {
  return (
    <div className="card card-secondary card-outline">
      <div className="card-header">
        <h3 className="card-title">Balance due</h3>
      </div>
      <div className="card-body">
        <div className="fs-2 fw-semibold text-primary invoice-total">
          {money(data.total)}
        </div>
        <div className="text-secondary small mb-3">USD</div>
        <dl className="row mb-0">
          <dt className="col-6 fw-normal text-secondary">Subtotal</dt>
          <dd className="col-6 text-end">{money(data.subtotal)}</dd>
          <dt className="col-6 fw-normal text-secondary">
            Tax ({String(data.taxRate ?? 0)}%)
          </dt>
          <dd className="col-6 text-end">{money(data.tax)}</dd>
          <dt className="col-6 fw-normal text-secondary">Shipping</dt>
          <dd className="col-6 text-end">{money(data.shipping)}</dd>
          <dt className="col-6 fw-normal text-secondary">Due date</dt>
          <dd className="col-6 text-end">{String(data.due || 'Not set')}</dd>
          <dt className="col-6 fw-normal text-secondary">Line items</dt>
          <dd className="col-6 text-end">
            {Array.isArray(data.items) ? data.items.length : 0}
          </dd>
        </dl>
      </div>
      <div className="card-footer small text-secondary">
        <i className="bi bi-info-circle me-1" aria-hidden="true" />
        Tax applies to the item subtotal. Shipping is added after tax.
      </div>
    </div>
  )
}
