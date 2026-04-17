import type { StageContext } from '../../../runtime/engine/stage-context'
import { buildValidatorPacket } from '../../../runtime/artifacts/validator-packet'
import type { V1Job, V1State } from '../types'

export async function validateStage(ctx: StageContext<V1State, V1Job>): Promise<V1State> {
  if (!ctx.job.omitFindings) {
    await ctx.services.artifacts.writeArtifact(ctx.jobId, 'findings.json', { passed: true })
    await ctx.services.artifacts.writeArtifact(
      ctx.jobId,
      'validator_packet.json',
      buildValidatorPacket('v1', [{ name: 'basic', passed: true }]),
    )
  }
  return 'VALIDATED'
}
