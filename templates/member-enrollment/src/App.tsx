import AppLayout from './layout/AppLayout'
import MemberEnrollment from './pages/MemberEnrollment'

export default function App() {
  return (
    <AppLayout
      active="member-enrollment"
      referenceUrl="https://adminlte.io/themes/v3/pages/forms/validation.html"
      referenceTitle="AdminLTE 3: Validation"
    >
      <MemberEnrollment />
    </AppLayout>
  )
}
