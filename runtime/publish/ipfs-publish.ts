import crypto from 'node:crypto'

export function publishToIpfs(artifact: string): { cid: string; note: string } {
  const cid = crypto.createHash('sha256').update(artifact).digest('hex').slice(0, 46)
  return { cid, note: 'Deterministic local CID simulation; no network write' }
}
