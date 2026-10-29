// Runs one npm command in every template, in order, stopping at the first failure.
// Usage: node scripts/each-template.mjs ci | run <script>
import { spawnSync } from 'node:child_process'
import { TEMPLATES } from './templates.mjs'

const args = process.argv.slice(2)
for (const name of TEMPLATES) {
  console.log(`\n=== ${name}: npm ${args.join(' ')} ===`)
  const result = spawnSync('npm', args, {
    cwd: `templates/${name}`,
    stdio: 'inherit',
    shell: true,
  })
  if (result.status !== 0) {
    console.error(`\n${name}: npm ${args.join(' ')} failed`)
    process.exit(result.status ?? 1)
  }
}
