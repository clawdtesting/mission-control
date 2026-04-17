import type { StageContext } from '../../../runtime/engine/stage-context'
import type { V1Job, V1State } from '../types'

export async function confirmStage(ctx: StageContext<V1State, V1Job>): Promise<V1State> {
  return ctx.job.operatorApproved ? 'APPLIED_CONFIRMED' : 'BLOCKED_OPERATOR_REVIEW'
}
