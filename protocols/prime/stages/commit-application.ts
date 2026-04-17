import type { StageContext } from '../../../runtime/engine/stage-context'
import { guardCommitWindow } from '../guards'
import { buildCommitTx } from '../tx/build-commit-tx'
import type { PrimeJob, PrimeState } from '../types'

export async function commitApplicationStage(ctx: StageContext<PrimeState, PrimeJob>): Promise<PrimeState> {
  if (!guardCommitWindow(ctx.now, ctx.job.deadlines)) return 'BLOCKED_DEADLINE'
  if (!ctx.job.operatorApproved) return 'BLOCKED_OPERATOR_REVIEW'
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'commit_unsigned_envelope.json', buildCommitTx(ctx.job.procurementId))
  return 'COMMITTED_UNSIGNED'
}
