import type { ArtifactManager } from '../../runtime/artifacts/artifact-manager'
import { CANONICAL_ARTIFACTS } from '../../runtime/artifacts/manifest'
import type { V1Job } from './types'

export async function guardRetrievalBeforeSolve(job: V1Job, artifacts: ArtifactManager): Promise<{ ok: boolean; reason?: string }> {
  const needsRetrieval = ['protocol-correctness', 'contract-critical', 'auditable'].includes(job.family ?? '')
  if (!needsRetrieval) {
    return { ok: true }
  }

  const exists = await artifacts.hasArtifact(job.id, 'retrieval_packet.json')
  return exists ? { ok: true } : { ok: false, reason: 'retrieval_packet.json missing' }
}

export async function guardCanonicalArtifacts(jobId: string, artifacts: ArtifactManager): Promise<{ ok: boolean; missing: string[] }> {
  const result = await artifacts.ensureCanonicalBundle(jobId, CANONICAL_ARTIFACTS)
  return result
}
