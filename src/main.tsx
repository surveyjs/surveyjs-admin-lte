import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setupThemeAdapter } from 'survey-core'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/600.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'admin-lte/dist/css/adminlte.min.css'
import 'survey-core/survey-core.css'
import 'survey-core/themes/adapters/bootstrap-default.css'
import './index.css'
import App from './App.tsx'

setupThemeAdapter('bootstrap')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
