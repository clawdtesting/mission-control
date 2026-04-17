import type { StageContext } from '../../../runtime/engine/stage-context'
import { buildCompletionTx } from '../tx/build-completion-tx'
import type { V1Job, V1State } from '../types'

export async function applyStage(ctx: StageContext<V1State, V1Job>): Promise<V1State> {
  const envelope = ctx.job.applyEnvelope ?? buildCompletionTx(ctx.jobId)
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'apply_unsigned_envelope.json', envelope)
  return 'APPLIED_UNSIGNED'
}
