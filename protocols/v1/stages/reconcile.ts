import type { StageContext } from '../../../runtime/engine/stage-context'
import type { V1Job, V1State } from '../types'

export async function reconcileStage(ctx: StageContext<V1State, V1Job>): Promise<V1State> {
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'reconcile_record.json', { doneAt: ctx.now.toISOString() })
  return 'DONE'
}
