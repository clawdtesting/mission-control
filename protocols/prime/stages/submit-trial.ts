import type { StageContext } from '../../../runtime/engine/stage-context'
import { publishToIpfs } from '../../../runtime/publish/ipfs-publish'
import type { PrimeJob, PrimeState } from '../types'

export async function submitTrialStage(ctx: StageContext<PrimeState, PrimeJob>): Promise<PrimeState> {
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'completion_manifest.json', publishToIpfs(ctx.jobId))
  return 'TRIAL_PUBLISHED'
}
