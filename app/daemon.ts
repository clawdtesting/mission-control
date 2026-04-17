import type { RuntimeServices } from '../runtime/engine/stage-context'
import { runJob } from './runner'

export async function runDaemon(
  jobs: Array<Record<string, unknown>>,
  services: RuntimeServices,
): Promise<Array<{ id: string; finalState: string }>> {
  const results: Array<{ id: string; finalState: string }> = []
  for (const job of jobs) {
    const id = String(job.id ?? 'unknown')
    const finalState = await runJob(job, services)
    results.push({ id, finalState })
  }
  return results
}
