import { createWriteStream } from 'node:fs'
import { mkdir, unlink, rename } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import https from 'node:https'
import { detectPlatform } from './detect-platform.mjs'
import { packageJson as pkg } from './package.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

function defaultRepoSlug() {
    const repo = pkg.repository
    if (typeof repo === 'string') {
        const m = repo.match(/github:(.+)/i)
        if (m) return m[1]
        if (/^[\w-]+\/[\w.-]+$/.test(repo)) return repo
    } else if (repo && typeof repo === 'object' && repo.url) {
        const m = repo.url.match(/github\.com[:/]+([^#]+?)(?:\.git)?$/i)
        if (m) return m[1]
    }
    return `${pkg.author}/${pkg.name}`
}

function buildBaseURL() {
    const repo = defaultRepoSlug()
    const versionTag = `v${pkg.version}`
    const baseURL = `https://github.com/${repo}/releases/download/${versionTag}`
    return baseURL.replace(/\/$/, '')
}

function httpGet(url) {
    return new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    return resolve(httpGet(res.headers.location))
                }
                if (res.statusCode !== 200) {
                    return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
                }
                resolve(res)
            })
            .on('error', reject)
    })
}

async function downloadTo(url, dstPath) {
    await mkdir(dirname(dstPath), { recursive: true })
    const tmp = `${dstPath}.download`
    try { await unlink(tmp) } catch {}
    const res = await httpGet(url)
    await new Promise((resolve, reject) => {
        const out = createWriteStream(tmp)
        res.pipe(out)
        res.on('error', reject)
        out.on('error', reject)
        out.on('finish', resolve)
    })
    await rename(tmp, dstPath)
}

export async function downloadPrebuilt() {
    const { triplet, ext } = detectPlatform()
    const baseURL = buildBaseURL()
    const filename = `messagix-${triplet}.${ext}`
    const url = `${baseURL}/${filename}`

    const out = join(__dirname, '..', 'build', `messagix.${ext}`)
    try {
        await downloadTo(url, out)
        console.log(`[${pkg.name}] Downloaded prebuilt from ${url}`)
        return true
    } catch (err) {
        console.warn(`[${pkg.name}] No remote prebuilt found at ${url}:`, err?.message || String(err))
        return false
    }
}

// node scripts/download-prebuilt.mjs
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
    downloadPrebuilt()
        .then((ok) => { if (!ok) process.exit(1) })
        .catch((err) => {
            console.error(`[${pkg.name}] download-prebuilt failed:`, err?.message || String(err))
            process.exit(1)
        })
}
