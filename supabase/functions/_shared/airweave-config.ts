export const AIRWEAVE_CONFIG = {
  apiKey: "9SgFMLVZ_T-p3GITcm8x7l7f7L1Q2Qy-5D4Py2UhebU",
  collectionId: "thongtu-wm5xmf",
  baseUrl: "https://api.airweave.ai",
  searchConfig: {
    limit: 20,
    retrieval_strategy: "hybrid" as const,
    rerank: true,
    generate_answer: true,
  },
};

export function getSearchUrl(): string {
  return `${AIRWEAVE_CONFIG.baseUrl}/collections/${AIRWEAVE_CONFIG.collectionId}/search`;
}
export function getAirweaveHeaders(): Record<string, string> {
  return {
    "x-api-key": AIRWEAVE_CONFIG.apiKey,
    "Content-Type": "application/json",
  };
}
