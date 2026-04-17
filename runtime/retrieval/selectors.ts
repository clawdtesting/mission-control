export function requiresRetrieval(job: Record<string, unknown>): boolean {
  const family = String(job.family ?? '')
  return ['protocol-correctness', 'contract-critical', 'auditable'].includes(family)
}
