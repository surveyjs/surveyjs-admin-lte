import AppLayout from './layout/AppLayout'
import NewCustomer from './pages/NewCustomer'

export default function App() {
  return (
    <AppLayout
      active="new-customer-surveyjs-nav"
      referenceUrl="https://surveyjs.io/form-library/documentation/design-survey-create-a-multi-page-survey#Page-Navigation-UI"
      referenceTitle="SurveyJS: Create a Multi-Page Survey"
      referenceLabel="SurveyJS multi-page docs"
    >
      <NewCustomer />
    </AppLayout>
  )
}
