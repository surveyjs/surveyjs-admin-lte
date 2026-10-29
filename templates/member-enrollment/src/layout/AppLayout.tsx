import { useEffect } from 'react'
import type { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import type { TemplateId } from './links'

// Matches the body class `sidebar-expand-lg` in index.html.
const EXPAND_BREAKPOINT = 992

function toggleSidebar() {
  const { classList } = document.body
  if (window.innerWidth >= EXPAND_BREAKPOINT) classList.toggle('sidebar-collapse')
  else classList.toggle('sidebar-open')
}

function closeSidebar() {
  document.body.classList.remove('sidebar-open')
}

export default function AppLayout({
  active,
  referenceUrl,
  referenceTitle,
  children,
}: {
  active: TemplateId
  referenceUrl: string
  referenceTitle: string
  children: ReactNode
}) {
  useEffect(() => {
    // AdminLTE keeps layout transitions off until the app is loaded.
    document.body.classList.add('app-loaded')
  }, [])
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        Skip to main content
      </a>
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar
        active={active}
        referenceUrl={referenceUrl}
        referenceTitle={referenceTitle}
      />
      <main className="app-main" id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <div className="sidebar-overlay" onClick={closeSidebar} />
    </>
  )
}
