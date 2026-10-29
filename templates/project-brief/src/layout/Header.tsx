import { HOME_URL, SURVEYJS_DOCS_URL } from './links'

export default function Header({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void
}) {
  return (
    <nav className="app-header navbar navbar-expand bg-body">
      <div className="container-fluid">
        <ul className="navbar-nav">
          <li className="nav-item">
            <button
              type="button"
              className="nav-link btn btn-link"
              aria-label="Toggle navigation"
              onClick={onToggleSidebar}
            >
              <i className="bi bi-list" aria-hidden="true" />
            </button>
          </li>
          <li className="nav-item d-none d-md-block">
            <a href={HOME_URL} className="nav-link">
              Home
            </a>
          </li>
          <li className="nav-item d-none d-md-block">
            <a
              href={SURVEYJS_DOCS_URL}
              className="nav-link"
              target="_blank"
              rel="noreferrer"
            >
              SurveyJS Docs
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}
