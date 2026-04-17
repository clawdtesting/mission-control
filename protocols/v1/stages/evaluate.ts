import type { StageContext } from '../../../runtime/engine/stage-context'
import { buildArchiveQuery } from '../../../runtime/retrieval/archive-query'
import { createRetrievalPacket } from '../../../runtime/retrieval/retrieval-packet'
import type { V1Job, V1State } from '../types'

export async function evaluateStage(ctx: StageContext<V1State, V1Job>): Promise<V1State> {
  const query = buildArchiveQuery('v1-job', [ctx.job.objective])
  const packet = createRetrievalPacket(query, [{ id: 'archive-1', uri: 'archive://jobs', reason: 'protocol grounding' }])
  if (!ctx.job.omitRetrievalPacket) {
    await ctx.services.artifacts.writeArtifact(ctx.jobId, 'retrieval_packet.json', packet)
  }
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'decomposition_plan.json', { steps: ['apply', 'execute', 'validate'] })
  return 'APPLY_READY'
}
