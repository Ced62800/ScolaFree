import { DONNEES } from "./series";
import type { Notion } from "./types";

// Registre des notions, construit à partir des fichiers series/<notion>.ts.
// L'identifiant est le même que le dossier de la fiche Fondamentaux
// (app/fondamentaux/francais/<id>).
export const NOTIONS: Record<string, Notion> = Object.fromEntries(
  DONNEES.map((d) => [d.notion.id, d.notion])
);

export function getNotion(id: string): Notion | undefined {
  return NOTIONS[id];
}
