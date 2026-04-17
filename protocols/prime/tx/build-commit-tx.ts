import { buildUnsignedEnvelope } from '../../../runtime/tx/unsigned-envelope'

export function buildCommitTx(procurementId: string) {
  return buildUnsignedEnvelope({
    chainId: 1,
    to: '0x0000000000000000000000000000000000000002',
    data: `0xcommit${Buffer.from(procurementId).toString('hex')}`,
    value: '0',
    metadata: { type: 'prime-commit' },
  })
}
