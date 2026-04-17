export interface UnsignedEnvelope {
  chainId: number
  to: string
  data: string
  value: string
  metadata: Record<string, unknown>
}

export function buildUnsignedEnvelope(input: UnsignedEnvelope): UnsignedEnvelope {
  return input
}
