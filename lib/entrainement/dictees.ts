import type { Dictee } from "./types";

// Les MP3 sont dans public/audio/dictees/<id>/ (voix Piper fr_FR-siwis-medium).
export const DICTEES: Dictee[] = [
  {
    id: "ce2-1",
    classe: "ce2",
    titre: "Au parc",
    notions: ["et-est"],
    audioComplet: "/audio/dictees/ce2-1/complet.mp3",
    phrases: [
      {
        texte: "Le parc est grand et très joli.",
        audio: "/audio/dictees/ce2-1/01.mp3",
      },
      {
        texte: "Paul et sa sœur jouent près du lac.",
        audio: "/audio/dictees/ce2-1/02.mp3",
      },
      {
        texte: "Le soleil est chaud.",
        audio: "/audio/dictees/ce2-1/03.mp3",
      },
      {
        texte: "Un canard nage et un oiseau chante.",
        audio: "/audio/dictees/ce2-1/04.mp3",
      },
      {
        texte: "Maman est assise sur un banc.",
        audio: "/audio/dictees/ce2-1/05.mp3",
      },
    ],
  },
];

export function getDictee(id: string): Dictee | undefined {
  return DICTEES.find((d) => d.id === id);
}
