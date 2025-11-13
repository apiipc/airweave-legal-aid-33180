export function getAirweaveConfig() {
  return {
    apiKey: Deno.env.get("tieuchuanapi") || "",
    collectionId: Deno.env.get("tieuchuanid") || "",
    baseUrl: "https://api.airweave.ai",
    searchConfig: {
      limit: 20,
      retrieval_strategy: "hybrid" as const,
      rerank: true,
      generate_answer: true,
    },
  };
}

export function getSearchUrl(): string {
  const config = getAirweaveConfig();
  return `${config.baseUrl}/collections/${config.collectionId}/search`;
}
export function getAirweaveHeaders(): Record<string, string> {
  const config = getAirweaveConfig();
  return {
    "x-api-key": config.apiKey,
    "Content-Type": "application/json",
  };
}
