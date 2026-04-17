import type { UnsignedEnvelope } from './unsigned-envelope'

const FORBIDDEN_KEYS = ['privateKey', 'signature', 'signedRawTx', 'broadcast']

export function runPreSignChecks(envelope: UnsignedEnvelope): { ok: boolean; errors: string[] } {
  const errors: string[] = []
  for (const key of FORBIDDEN_KEYS) {
    if (key in envelope.metadata) {
      errors.push(`Forbidden runtime signing field present: ${key}`)
    }
  }

  return { ok: errors.length === 0, errors }
}
