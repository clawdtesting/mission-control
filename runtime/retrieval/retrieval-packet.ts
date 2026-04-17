export interface RetrievalPacket {
  sources: Array<{ id: string; uri: string; reason: string }>
  query: string
  generatedAt: string
}

export function createRetrievalPacket(query: string, sources: RetrievalPacket['sources']): RetrievalPacket {
  return {
    query,
    sources,
    generatedAt: new Date().toISOString(),
  }
}

export function validateRetrievalPacket(packet: RetrievalPacket | null | undefined): boolean {
  return Boolean(packet && packet.query && packet.sources.length > 0)
}
