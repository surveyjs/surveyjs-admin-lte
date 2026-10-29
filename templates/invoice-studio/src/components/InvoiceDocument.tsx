import type { FormData } from '../surveys/form'
import { money } from '../lib/format'

// Read-only invoice laid out like the AdminLTE invoice example.
export default function InvoiceDocument({ data }: { data: FormData }) {
  const items = Array.isArray(data.items) ? (data.items as FormData[]) : []
  return (
    <div className="invoice p-3" aria-label="Invoice document">
      <div className="row">
        <div className="col-12">
          <h4 className="invoice-heading">
            <i className="bi bi-globe me-2" aria-hidden="true" />
            {String(data.sender || 'Your company')}
            <small className="float-end">Date: {String(data.issued || '')}</small>
          </h4>
        </div>
      </div>
      <div className="row invoice-info">
        <div className="col-sm-4 invoice-col">
          From
          <address>
            <strong>{String(data.sender || '')}</strong>
            <br />
            {String(data.senderAddress || '')}
          </address>
        </div>
        <div className="col-sm-4 invoice-col">
          To
          <address>
            <strong>{String(data.recipient || '')}</strong>
            <br />
            {String(data.recipientAddress || '')}
          </address>
        </div>
        <div className="col-sm-4 invoice-col">
          <b>Invoice {String(data.number || 'Draft')}</b>
          <br />
          <b>Payment due:</b> {String(data.due || '')}
        </div>
      </div>
      <div className="row">
        <div className="col-12 table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Qty</th>
                <th>Product</th>
                <th>Reference</th>
                <th className="text-end">Unit price</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{String(item.quantity || 0)}</td>
                  <td>{String(item.description || 'Untitled item')}</td>
                  <td>{String(item.reference || '')}</td>
                  <td className="text-end">{money(item.price)}</td>
                  <td className="text-end">{money(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-6">
          <p className="lead">Payment terms</p>
          <p className="text-secondary invoice-notes">
            {String(data.notes || 'Payment terms not specified.')}
          </p>
        </div>
        <div className="col-sm-6">
          <p className="lead">Amount due {String(data.due || '')}</p>
          <div className="table-responsive">
            <table className="table">
              <tbody>
                <tr>
                  <th style={{ width: '50%' }}>Subtotal:</th>
                  <td className="text-end">{money(data.subtotal)}</td>
                </tr>
                <tr>
                  <th>Tax ({String(data.taxRate ?? 0)}%):</th>
                  <td className="text-end">{money(data.tax)}</td>
                </tr>
                <tr>
                  <th>Shipping:</th>
                  <td className="text-end">{money(data.shipping)}</td>
                </tr>
                <tr>
                  <th>Total:</th>
                  <td className="text-end fw-bold">{money(data.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
