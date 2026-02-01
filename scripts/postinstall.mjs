/*
 * meta-messenger.js, Unofficial Meta Messenger Chat API for NodeJS
 * Copyright (c) 2026 Elysia and contributors
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { detectPlatform } from "./detect-platform.mjs";
import { downloadPrebuilt } from "./download-prebuilt.mjs";
import { packageJson as pkg } from "./package.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function copyIfExists(src, dst) {
    try {
        await mkdir(dirname(dst), { recursive: true });
        await copyFile(src, dst);
        return true;
    } catch (err) {
        if (err?.code === "ENOENT") return false;
        throw err;
    }
}

async function run() {
    if (process.env.MESSAGIX_SKIP_POSTINSTALL === "true") {
        console.log(`[${pkg.name}] Skipping postinstall (MESSAGIX_SKIP_POSTINSTALL=true)`);
        return;
    }

    const { triplet, ext } = detectPlatform();
    const buildOut = join(__dirname, "..", "build", `messagix.${ext}`);

    // 1) Prefer local prebuilt shipped in npm tarball
    const prebuiltDir = join(__dirname, "..", "prebuilt", triplet);
    const prebuilt = join(prebuiltDir, `messagix.${ext}`);
    if (await copyIfExists(prebuilt, buildOut)) {
        console.log(`[${pkg.name}] Using local prebuilt for ${triplet}`);
        if (process.env.MESSAGIX_KEEP_PREBUILT !== "true") {
            try {
                await rm(prebuiltDir, { recursive: true, force: true });
            } catch (error) {
                console.error(error);
            }
        }
        return;
    }
    console.log(`[${pkg.name}] No local prebuilt found`);

    // 2) Try remote prebuilt from GitHub Releases
    try {
        if (await downloadPrebuilt()) return;
    } catch (error) {
        console.error(error);
    }

    // 3) No prebuilt available. Try local build if allowed
    if (process.env.MESSAGIX_BUILD_FROM_SOURCE === "true") {
        console.log(`[${pkg.name}] No prebuilt found. Attempting local build...`);
        try {
            const res = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build:go"], {
                cwd: join(__dirname, ".."),
                stdio: "inherit",
                env: process.env,
            });
            if (res.status === 0 && existsSync(buildOut)) return;
            console.warn(`[${pkg.name}] Local build did not produce the native library.`);
        } catch (err) {
            console.warn(`[${pkg.name}] Local build failed:`, err?.message || String(err));
        }
    }

    console.warn(`[${pkg.name}] No prebuilt found (local/remote) and no local build completed.`);
    console.warn(`[${pkg.name}] Expected triplet: ${triplet}, file: messagix-${triplet}.${ext}`);
    console.warn(
        `[${pkg.name}] You can:\n` +
            "  - set MESSAGIX_BUILD_FROM_SOURCE=true and re-run install\n" +
            "  - or build manually with: npm run build:go",
    );
}

run().catch(err => {
    console.error(`[${pkg.name}] postinstall failed:`, err?.message || String(err));
});
