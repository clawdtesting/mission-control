import { routeProtocol, type RoutableJob } from '../runtime/engine/protocol-router'
import type { RuntimeServices } from '../runtime/engine/stage-context'
import { runPrimePipeline } from '../protocols/prime/pipeline'
import { runV1Pipeline } from '../protocols/v1/pipeline'
import type { PrimeJob } from '../protocols/prime/types'
import type { V1Job } from '../protocols/v1/types'

export async function runJob(job: RoutableJob & Record<string, unknown>, services: RuntimeServices): Promise<string> {
  const protocol = routeProtocol(job)
  if (protocol === 'prime') {
    return runPrimePipeline(job as unknown as PrimeJob, services)
  }

  return runV1Pipeline(job as unknown as V1Job, services)
}
