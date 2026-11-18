import type { Notion } from "./types";

// Registre des notions. L'identifiant est le même que le dossier
// de la fiche Fondamentaux (app/fondamentaux/francais/<id>).
export const NOTIONS: Record<string, Notion> = {
  "et-est": {
    id: "et-est",
    titre: "Et / Est",
    emoji: "🔗",
    fiche: "/fondamentaux/francais/et-est",
    mots: ["et", "est"],
  },
};

export function getNotion(id: string): Notion | undefined {
  return NOTIONS[id];
}
