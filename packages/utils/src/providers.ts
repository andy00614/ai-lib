export type Provider = "openai" | "mistral" | "gemini";

export function resolveProvider(name: string): Provider {
  const id = name.toLowerCase();
  if (id === "openai") return "openai";
  if (id === "mistral") return "mistral";
  if (id === "gemini") return "gemini";
  throw new Error(`Unknown provider: ${name}`);
}
