import type { StageContext } from '../../../runtime/engine/stage-context'
import { guardFinalistAcceptWindow } from '../guards'
import type { PrimeJob, PrimeState } from '../types'

export async function acceptFinalistStage(ctx: StageContext<PrimeState, PrimeJob>): Promise<PrimeState> {
  if (!guardFinalistAcceptWindow(ctx.now, ctx.job.deadlines)) return 'BLOCKED_DEADLINE'
  if (!ctx.job.operatorApproved) return 'BLOCKED_OPERATOR_REVIEW'
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'finalist_acceptance.json', { accepted: true })
  return 'FINALIST_ACCEPTED_UNSIGNED'
}
