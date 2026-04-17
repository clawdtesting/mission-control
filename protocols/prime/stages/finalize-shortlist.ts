import type { StageContext } from '../../../runtime/engine/stage-context'
import type { PrimeJob, PrimeState } from '../types'

export async function finalizeShortlistStage(_ctx: StageContext<PrimeState, PrimeJob>): Promise<PrimeState> {
  return 'FINALIST'
}
