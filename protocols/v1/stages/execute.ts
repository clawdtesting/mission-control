import type { StageContext } from '../../../runtime/engine/stage-context'
import type { V1Job, V1State } from '../types'
import { guardRetrievalBeforeSolve } from '../guards'

export async function executeStage(ctx: StageContext<V1State, V1Job>): Promise<V1State> {
  const retrieval = await guardRetrievalBeforeSolve(ctx.job, ctx.services.artifacts)
  if (!retrieval.ok) {
    return 'BLOCKED_RETRIEVAL_REQUIRED'
  }

  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'execution_trace.jsonl', '{"event":"execute"}')
  return 'EXECUTED'
}
