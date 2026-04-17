export interface ReproEnvelope {
  runId: string
  protocol: 'v1' | 'prime'
  state: string
  artifactPaths: string[]
}

export function buildReproEnvelope(input: ReproEnvelope): ReproEnvelope {
  return input
}
