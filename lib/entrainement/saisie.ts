// Correction d'une question de saisie (« écris la bonne forme »).
//
// Acceptés sans faute : majuscules, espaces en trop, apostrophe courbe ou droite,
// « oe » pour « œ ».
// Comptés comme une faute : les accents (« mange » pour « mangé »), les lettres,
// le trait d'union.

import type { QuestionSaisie } from "./types";

export type Verdict = "correct" | "accents" | "infinitif" | "faux";

export type ResultatSaisie = {
  verdict: Verdict;
  // Phrase à afficher à l'élève quand il a faux (null = juste la bonne réponse).
  message: string | null;
};

// Uniformise ce que l'élève a tapé pour pouvoir le comparer.
export function normaliserSaisie(texte: string): string {
  return texte
    .normalize("NFC") // « é » tapé en deux caractères (e + accent) = « é » en un seul
    .replace(/[’‘ʼ]/g, "'")
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae");
}

function sansAccent(texte: string): string {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function verifierSaisie(question: QuestionSaisie, saisie: string): ResultatSaisie {
  const reponse = normaliserSaisie(saisie);
  const justes = [question.reponse, ...(question.acceptees ?? [])].map(normaliserSaisie);

  if (justes.includes(reponse)) return { verdict: "correct", message: null };

  // 1. Une erreur prévue à l'avance pour cette forme précise.
  for (const [forme, explication] of Object.entries(question.erreurs ?? {})) {
    if (normaliserSaisie(forme) === reponse) {
      return {
        verdict: "faux",
        // Un message qui commence déjà par « Tu as » est affiché tel quel.
        message: explication.startsWith("Tu as ")
          ? explication
          : `Tu as écrit « ${saisie.trim()} » ? ${explication}`,
      };
    }
  }

  // 2. Les bonnes lettres, mais pas les bons accents.
  if (justes.some((j) => sansAccent(j) === sansAccent(reponse))) {
    return {
      verdict: "accents",
      message: "Presque ! Les lettres sont bonnes, mais pas les accents.",
    };
  }

  // 3. L'élève a recopié l'infinitif au lieu de conjuguer.
  if (reponse === normaliserSaisie(question.verbe)) {
    return {
      verdict: "infinitif",
      message: "Tu as écrit l'infinitif. Ici, il faut conjuguer le verbe.",
    };
  }

  return { verdict: "faux", message: null };
}
