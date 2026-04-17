export function verifyIpfsCid(cid: string): boolean {
  return /^[a-f0-9]{32,46}$/.test(cid)
}
