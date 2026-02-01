import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'))