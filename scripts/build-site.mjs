// Builds every template and assembles one static demo site in site/:
//   site/index.html            landing page (from showcase/)
//   site/<template>/           each template's production build
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { TEMPLATES } from './templates.mjs'

const build = spawnSync('node', ['scripts/each-template.mjs', 'run', 'build'], {
  stdio: 'inherit',
  shell: true,
})
if (build.status !== 0) process.exit(build.status ?? 1)

rmSync('site', { recursive: true, force: true })
cpSync('showcase', 'site', { recursive: true })
for (const name of TEMPLATES) cpSync(`templates/${name}/dist`, `site/${name}`, { recursive: true })

// The landing page uses the same AdminLTE CSS and font as the templates, served locally.
const modules = 'templates/project-brief/node_modules'
mkdirSync('site/vendor/fonts', { recursive: true })
cpSync(`${modules}/admin-lte/dist/css/adminlte.min.css`, 'site/vendor/adminlte.min.css')
for (const weight of [400, 600])
  cpSync(
    `${modules}/@fontsource/source-sans-3/files/source-sans-3-latin-${weight}-normal.woff2`,
    `site/vendor/fonts/source-sans-3-latin-${weight}-normal.woff2`,
  )
console.log('\nDemo site written to site/')
