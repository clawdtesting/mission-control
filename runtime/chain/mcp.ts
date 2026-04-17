export async function readMcp(resource: string): Promise<{ resource: string; source: string }> {
  return { resource, source: 'mcp-read-stub' }
}
