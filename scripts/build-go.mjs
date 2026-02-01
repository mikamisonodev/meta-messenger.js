import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { mkdirSync, existsSync } from 'node:fs'
import { packageJson } from './package.mjs'
import { detectPlatform } from './detect-platform.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const { ext } = detectPlatform()
const name = packageJson.name

function runGo(args) {
    const res = spawnSync(process.env.GO_BIN || 'go', args, {
        cwd: join(__dirname, '..', 'bridge-go'),
        stdio: 'inherit',
        env: process.env
    })
    if (res.status !== 0) process.exit(res.status || 1)
}

const buildDir = join(__dirname, '..', 'build')
if (!existsSync(buildDir)) mkdirSync(buildDir, { recursive: true })

console.log(`[${name}] Tidying Go modules...`)
runGo(['mod', 'tidy'])

console.log(`[${name}] Building native library (release mode)...`)
runGo(['build', '-buildmode=c-shared', '-ldflags=-s -w', '-o', join('..', 'build', `messagix.${ext}`), '.'])

console.log(`[${name}] Built native: build/messagix.${ext}`)
