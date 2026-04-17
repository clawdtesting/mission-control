export async function readRpc(method: string, _params: unknown[]): Promise<{ method: string; source: string }> {
  return { method, source: 'read-only-rpc-stub' }
}
