import type { StageContext } from '../../../runtime/engine/stage-context'
import { CANONICAL_ARTIFACTS } from '../../../runtime/artifacts/manifest'
import { buildReproEnvelope } from '../../../runtime/artifacts/repro-envelope'
import type { PrimeJob, PrimeState } from '../types'

export async function settleStage(ctx: StageContext<PrimeState, PrimeJob>): Promise<PrimeState> {
  const canonical = await ctx.services.artifacts.ensureCanonicalBundle(ctx.jobId, CANONICAL_ARTIFACTS)
  if (!canonical.ok) {
    await ctx.services.artifacts.writeArtifact(ctx.jobId, 'missing_artifacts.json', canonical)
    return 'BLOCKED_ARTIFACT_EMISSION_REQUIRED'
  }

  await ctx.services.artifacts.writeArtifact(
    ctx.jobId,
    'repro_envelope.json',
    buildReproEnvelope({ runId: ctx.jobId, protocol: 'prime', state: ctx.currentState, artifactPaths: [] }),
  )
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'archive_index_record.json', { runId: ctx.jobId })
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'metrics_record.json', { winnerDesignated: true })
  return 'DONE'
}
