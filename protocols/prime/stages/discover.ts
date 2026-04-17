import type { StageContext } from '../../../runtime/engine/stage-context'
import type { PrimeJob, PrimeState } from '../types'

export async function discoverStage(ctx: StageContext<PrimeState, PrimeJob>): Promise<PrimeState> {
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'job_spec.json', { objective: ctx.job.objective, procurementId: ctx.job.procurementId })
  return 'EVALUATED'
}
