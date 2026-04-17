import type { StageContext } from '../../../runtime/engine/stage-context'
import { buildReproEnvelope } from '../../../runtime/artifacts/repro-envelope'
import type { V1Job, V1State } from '../types'
import { guardCanonicalArtifacts } from '../guards'

export async function submitStage(ctx: StageContext<V1State, V1Job>): Promise<V1State> {
  const preBoundary = [
    'job_spec.json',
    'retrieval_packet.json',
    'decomposition_plan.json',
    'execution_trace.jsonl',
    'findings.json',
    'validator_packet.json',
    'completion_manifest.json',
  ] as const

  const artifacts = await ctx.services.artifacts.ensureCanonicalBundle(ctx.jobId, preBoundary)
  if (!artifacts.ok) {
    await ctx.services.artifacts.writeArtifact(ctx.jobId, 'missing_artifacts.json', artifacts)
    return 'BLOCKED_ARTIFACT_EMISSION_REQUIRED'
  }

  await ctx.services.artifacts.writeArtifact(
    ctx.jobId,
    'repro_envelope.json',
    buildReproEnvelope({ runId: ctx.jobId, protocol: 'v1', state: ctx.currentState, artifactPaths: [] }),
  )
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'archive_index_record.json', { runId: ctx.jobId })
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'metrics_record.json', { success: true })

  const finalArtifacts = await guardCanonicalArtifacts(ctx.jobId, ctx.services.artifacts)
  if (!finalArtifacts.ok) {
    return 'BLOCKED_ARTIFACT_EMISSION_REQUIRED'
  }

  return 'SUBMITTED_UNSIGNED'
}
