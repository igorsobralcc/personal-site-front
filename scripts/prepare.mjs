import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

if (existsSync('.git')) {
  const huskyBin = fileURLToPath(new URL('../node_modules/husky/bin.js', import.meta.url))
  execFileSync(process.execPath, [huskyBin], { stdio: 'inherit' })
}
