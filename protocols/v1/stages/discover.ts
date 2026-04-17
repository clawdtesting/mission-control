import type { StageContext } from '../../../runtime/engine/stage-context'
import type { V1Job, V1State } from '../types'

export async function discoverStage(ctx: StageContext<V1State, V1Job>): Promise<V1State> {
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'job_spec.json', { objective: ctx.job.objective })
  return 'EVALUATED'
}
