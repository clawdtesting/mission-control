export async function readContractField(contract: string, field: string): Promise<{ contract: string; field: string }> {
  return { contract, field }
}
