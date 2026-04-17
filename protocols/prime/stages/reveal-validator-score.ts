import type { StageContext } from '../../../runtime/engine/stage-context'
import { guardScoreCommitWindow, guardScoreRevealWindow } from '../guards'
import type { PrimeJob, PrimeState } from '../types'

export async function revealValidatorScoreStage(ctx: StageContext<PrimeState, PrimeJob>): Promise<PrimeState> {
  if (!guardScoreCommitWindow(ctx.now, ctx.job.deadlines) || !guardScoreRevealWindow(ctx.now, ctx.job.deadlines)) {
    return 'BLOCKED_DEADLINE'
  }

  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'validator_packet.json', { score: 0.95 })
  return 'WINNER_PENDING'
}
