// Proves each template works outside this repository: copies it to a scratch
// folder outside the repository (without node_modules or build output), so no
// package can resolve from a parent node_modules; then runs npm ci, build and tests there.
import { spawnSync } from 'node:child_process'
import { cpSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { TEMPLATES } from './templates.mjs'

const scratch = mkdtempSync(join(tmpdir(), 'adminlte-surveyjs-'))
const skip = new Set(['node_modules', 'dist', 'test-results', 'playwright-report', 'artifacts'])
let failed = false
for (const name of TEMPLATES) {
  const target = join(scratch, name)
  cpSync(`templates/${name}`, target, {
    recursive: true,
    filter: (source) => !skip.has(basename(source)),
  })
  for (const args of [['ci'], ['run', 'build'], ['test']]) {
    console.log(`\n=== ${name} (standalone): npm ${args.join(' ')} ===`)
    const result = spawnSync('npm', args, { cwd: target, stdio: 'inherit', shell: true })
    if (result.status !== 0) {
      console.error(`\n${name}: npm ${args.join(' ')} failed outside the repository`)
      failed = true
      break
    }
  }
}
rmSync(scratch, { recursive: true, force: true })
if (failed) process.exit(1)
console.log('\nAll templates install, build and test on their own.')
