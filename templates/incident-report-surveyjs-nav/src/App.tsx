import AppLayout from './layout/AppLayout'
import IncidentReport from './pages/IncidentReport'

export default function App() {
  return (
    <AppLayout
      active="incident-report-surveyjs-nav"
      referenceUrl="https://surveyjs.io/form-library/documentation/design-survey-create-a-multi-page-survey#Page-Navigation-UI"
      referenceTitle="SurveyJS: Create a Multi-Page Survey"
      referenceLabel="SurveyJS multi-page docs"
    >
      <IncidentReport />
    </AppLayout>
  )
}
