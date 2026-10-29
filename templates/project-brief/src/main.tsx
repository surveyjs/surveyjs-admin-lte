import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setupThemeAdapter } from 'survey-core'
import '@fontsource/source-sans-3/400.css'
import '@fontsource/source-sans-3/600.css'
import '@fontsource/source-sans-3/700.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import 'admin-lte/dist/css/adminlte.min.css'
import 'survey-core/survey-core.css'
import 'survey-core/themes/adapters/bootstrap-default.css'
import './styles/template.css'
import App from './App'

// Render SurveyJS questions with Bootstrap markup and classes.
setupThemeAdapter('bootstrap')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
