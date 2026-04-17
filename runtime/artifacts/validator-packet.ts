export interface ValidatorPacket {
  protocol: 'v1' | 'prime'
  checks: Array<{ name: string; passed: boolean; note?: string }>
}

export function buildValidatorPacket(protocol: 'v1' | 'prime', checks: ValidatorPacket['checks']): ValidatorPacket {
  return { protocol, checks }
}
