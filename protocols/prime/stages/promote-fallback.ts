import type { StageContext } from '../../../runtime/engine/stage-context'
import { guardFallbackPromotionWindow } from '../guards'
import type { PrimeJob, PrimeState } from '../types'

export async function promoteFallbackStage(ctx: StageContext<PrimeState, PrimeJob>): Promise<PrimeState> {
  return guardFallbackPromotionWindow(ctx.now, ctx.job.deadlines) ? 'FINALIST' : 'BLOCKED_DEADLINE'
}
