import fs from 'node:fs/promises'

export async function pruneStateFiles(baseDir: string, olderThanDays: number): Promise<number> {
  const threshold = Date.now() - olderThanDays * 24 * 60 * 60 * 1000
  const entries = await fs.readdir(baseDir, { withFileTypes: true }).catch(() => [])
  let removed = 0

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.state.json')) {
      continue
    }

    const filePath = `${baseDir}/${entry.name}`
    const stats = await fs.stat(filePath)
    if (stats.mtimeMs < threshold) {
      await fs.rm(filePath)
      removed += 1
    }
  }

  return removed
}
