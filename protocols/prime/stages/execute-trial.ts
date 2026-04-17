import type { StageContext } from '../../../runtime/engine/stage-context'
import { guardTrialWindow } from '../guards'
import { buildTrialTx } from '../tx/build-trial-tx'
import type { PrimeJob, PrimeState } from '../types'

export async function executeTrialStage(ctx: StageContext<PrimeState, PrimeJob>): Promise<PrimeState> {
  if (!guardTrialWindow(ctx.now, ctx.job.deadlines)) return 'BLOCKED_DEADLINE'
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'trial_unsigned_envelope.json', buildTrialTx(ctx.job.procurementId))
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'execution_trace.jsonl', '{"event":"prime_trial_execution"}')
  return 'TRIAL_EXECUTED'
}
