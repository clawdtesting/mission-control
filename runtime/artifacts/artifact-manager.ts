import fs from 'node:fs/promises'
import path from 'node:path'
import { CANONICAL_ARTIFACTS } from './manifest'

export class ArtifactManager {
  constructor(private readonly rootDir: string) {}

  private dir(jobId: string): string {
    return path.join(this.rootDir, jobId)
  }

  async writeArtifact(jobId: string, name: string, data: unknown): Promise<string> {
    await fs.mkdir(this.dir(jobId), { recursive: true })
    const artifactPath = path.join(this.dir(jobId), name)
    const payload = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    await fs.writeFile(artifactPath, payload.endsWith('\n') ? payload : `${payload}\n`, 'utf-8')
    return artifactPath
  }

  async hasArtifact(jobId: string, name: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.dir(jobId), name))
      return true
    } catch {
      return false
    }
  }

  async ensureCanonicalBundle(jobId: string, required: readonly string[] = CANONICAL_ARTIFACTS): Promise<{ ok: boolean; missing: string[] }> {
    const missing: string[] = []
    for (const artifact of required) {
      if (!(await this.hasArtifact(jobId, artifact))) {
        missing.push(artifact)
      }
    }

    return { ok: missing.length === 0, missing }
  }
}
