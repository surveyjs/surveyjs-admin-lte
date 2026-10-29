import { HOME_URL, TEMPLATES } from './links'
import type { TemplateId } from './links'

export default function Sidebar({
  active,
  referenceUrl,
  referenceTitle,
}: {
  active: TemplateId
  referenceUrl: string
  referenceTitle: string
}) {
  return (
    <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
      <div className="sidebar-brand">
        <a href={HOME_URL} className="brand-link">
          <img
            src="./favicon.svg"
            alt=""
            // Explicit size: the SVG has no intrinsic width, so without it the brand
            // link is sized as if the image were 0px wide and the text overflows.
            width={33}
            height={33}
            className="brand-image opacity-75 shadow"
          />
          <span className="brand-text fw-light">AdminLTE + SurveyJS</span>
        </a>
      </div>
      <div className="sidebar-wrapper">
        <nav className="mt-2" aria-label="Main navigation">
          <ul className="nav sidebar-menu flex-column">
            <li className="nav-header">SURVEYJS TEMPLATES</li>
            {TEMPLATES.map((template) => (
              <li className="nav-item" key={template.id}>
                <a
                  href={template.href}
                  className={`nav-link ${template.id === active ? 'active' : ''}`}
                  aria-current={template.id === active ? 'page' : undefined}
                >
                  <i
                    className={`nav-icon bi ${template.icon}`}
                    aria-hidden="true"
                  />
                  <p>{template.title}</p>
                </a>
              </li>
            ))}
            <li className="nav-header">REFERENCE</li>
            <li className="nav-item">
              <a
                href={referenceUrl}
                className="nav-link"
                target="_blank"
                rel="noreferrer"
                title={referenceTitle}
              >
                <i
                  className="nav-icon bi bi-box-arrow-up-right"
                  aria-hidden="true"
                />
                <p>Original AdminLTE page</p>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  )
}
