import type { StageContext } from '../../../runtime/engine/stage-context'
import type { PrimeJob, PrimeState } from '../types'

export async function finalizeWinnerStage(ctx: StageContext<PrimeState, PrimeJob>): Promise<PrimeState> {
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'findings.json', { winner: ctx.job.id })
  return 'WINNER_DESIGNATED'
}
