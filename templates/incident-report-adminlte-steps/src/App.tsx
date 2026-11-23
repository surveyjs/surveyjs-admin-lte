import AppLayout from './layout/AppLayout'
import IncidentReport from './pages/IncidentReport'

export default function App() {
  return (
    <AppLayout
      active="incident-report-adminlte-steps"
      referenceUrl="https://surveyjs.io/form-library/documentation/design-survey-create-a-multi-page-survey#Switch-Between-Pages"
      referenceTitle="SurveyJS: Create a Multi-Page Survey"
      referenceLabel="SurveyJS multi-page docs"
    >
      <IncidentReport />
    </AppLayout>
  )
}
