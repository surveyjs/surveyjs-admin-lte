// Dependency-free static server for site/, mounted under /demo/ to prove the
// build works from a subfolder. Usage: node scripts/serve-site.mjs [port]
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve('site')
const prefix = '/demo/'
const port = Number(process.argv[2] ?? 4180)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost')
  if (url.pathname === '/health') return response.writeHead(200).end('ok')
  if (url.pathname === '/demo') return redirect(response, prefix)
  if (!url.pathname.startsWith(prefix)) return notFound(response)
  const relative = normalize(decodeURIComponent(url.pathname.slice(prefix.length)))
  let file = join(root, relative)
  if (!file.startsWith(root)) return notFound(response)
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!url.pathname.endsWith('/')) return redirect(response, `${url.pathname}/`)
    file = join(file, 'index.html')
  }
  if (!existsSync(file)) return notFound(response)
  response.writeHead(200, {
    'Content-Type': types[extname(file)] ?? 'application/octet-stream',
  })
  createReadStream(file).pipe(response)
}).listen(port, '127.0.0.1', () => {
  console.log(`Serving site/ at http://127.0.0.1:${port}${prefix}`)
})

function redirect(response, location) {
  response.writeHead(301, { Location: location }).end()
}
function notFound(response) {
  response.writeHead(404).end('Not found')
}
