import AppLayout from './layout/AppLayout'
import InvoiceStudio from './pages/InvoiceStudio'

export default function App() {
  return (
    <AppLayout
      active="invoice-studio"
      referenceUrl="https://adminlte.io/themes/v3/pages/examples/invoice.html"
      referenceTitle="AdminLTE 3: Invoice"
    >
      <InvoiceStudio />
    </AppLayout>
  )
}
