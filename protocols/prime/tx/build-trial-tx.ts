import { buildUnsignedEnvelope } from '../../../runtime/tx/unsigned-envelope'

export function buildTrialTx(procurementId: string) {
  return buildUnsignedEnvelope({
    chainId: 1,
    to: '0x0000000000000000000000000000000000000002',
    data: `0xtrial${Buffer.from(procurementId).toString('hex')}`,
    value: '0',
    metadata: { type: 'prime-trial' },
  })
}
