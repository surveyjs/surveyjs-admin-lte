import AppLayout from './layout/AppLayout'
import NewCustomer from './pages/NewCustomer'

export default function App() {
  return (
    <AppLayout
      active="new-customer-adminlte-steps"
      referenceUrl="https://surveyjs.io/form-library/documentation/design-survey-create-a-multi-page-survey#Switch-Between-Pages"
      referenceTitle="SurveyJS: Create a Multi-Page Survey"
      referenceLabel="SurveyJS multi-page docs"
    >
      <NewCustomer />
    </AppLayout>
  )
}
