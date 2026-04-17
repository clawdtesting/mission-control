export type SupportedProtocol = 'v1' | 'prime'

export interface RoutableJob {
  protocol?: string
  mode?: string
  type?: string
  procurementId?: string
  commitDeadline?: string
}

export function routeProtocol(job: RoutableJob): SupportedProtocol {
  if (job.protocol === 'prime' || job.mode === 'prime') {
    return 'prime'
  }

  if (job.procurementId || job.commitDeadline || job.type === 'procurement') {
    return 'prime'
  }

  return 'v1'
}
