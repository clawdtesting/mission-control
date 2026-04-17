import type { UnsignedEnvelope } from './unsigned-envelope'

export function validateUnsignedEnvelope(envelope: UnsignedEnvelope): { ok: boolean; errors: string[] } {
  const errors: string[] = []
  if (!envelope.to) errors.push('Missing destination address')
  if (!envelope.data) errors.push('Missing tx calldata payload')
  if ((envelope.metadata as Record<string, unknown>).signedRawTx) {
    errors.push('Runtime envelope must remain unsigned')
  }

  return { ok: errors.length === 0, errors }
}
