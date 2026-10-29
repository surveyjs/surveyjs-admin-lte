import AppLayout from './layout/AppLayout'
import ProjectBrief from './pages/ProjectBrief'

export default function App() {
  return (
    <AppLayout
      active="project-brief"
      referenceUrl="https://adminlte.io/themes/v3/pages/examples/project-add.html"
      referenceTitle="AdminLTE 3: Project Add"
    >
      <ProjectBrief />
    </AppLayout>
  )
}
