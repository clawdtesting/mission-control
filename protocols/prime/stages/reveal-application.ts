import type { StageContext } from '../../../runtime/engine/stage-context'
import { guardRevealWindow } from '../guards'
import { buildRevealTx } from '../tx/build-reveal-tx'
import type { PrimeJob, PrimeState } from '../types'

export async function revealApplicationStage(ctx: StageContext<PrimeState, PrimeJob>): Promise<PrimeState> {
  if (!guardRevealWindow(ctx.now, ctx.job.deadlines)) return 'BLOCKED_DEADLINE'
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'reveal_unsigned_envelope.json', buildRevealTx(ctx.job.procurementId))
  return 'REVEALED_UNSIGNED'
}
