import { buildUnsignedEnvelope, type UnsignedEnvelope } from '../../../runtime/tx/unsigned-envelope'

export function buildCompletionTx(jobId: string): UnsignedEnvelope {
  return buildUnsignedEnvelope({
    chainId: 1,
    to: '0x0000000000000000000000000000000000000001',
    data: `0xcomplete${Buffer.from(jobId).toString('hex')}`,
    value: '0',
    metadata: { type: 'v1-completion' },
  })
}
