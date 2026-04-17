import type { StageContext } from '../../../runtime/engine/stage-context'
import { publishToIpfs } from '../../../runtime/publish/ipfs-publish'
import type { V1Job, V1State } from '../types'

export async function publishStage(ctx: StageContext<V1State, V1Job>): Promise<V1State> {
  const published = publishToIpfs(ctx.jobId)
  await ctx.services.artifacts.writeArtifact(ctx.jobId, 'completion_manifest.json', published)
  return 'PUBLISHED'
}
