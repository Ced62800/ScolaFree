// Outil pour écrire les questions de saisie de conjugaison.
// À partir du tableau d'un verbe, il fabrique l'explication et un message d'erreur
// pour chaque autre personne : « Cette forme va avec « ils ». Ici, le sujet est « nous ». »
// Les fautes fréquentes (« somme », « disez »…) s'ajoutent à la main avec `erreurs`.
//
// Règle de rédaction : UNE seule réponse possible par phrase.
// - la série ne travaille qu'un temps et son titre le dit ;
// - le sujet se voit dans la phrase (pas de « il » qui pourrait être « je »).

import type { Verbe } from "./tableaux-conjugaison";
import type { QuestionSaisie } from "./types";
import { normaliserSaisie } from "./saisie";

export type Personne = "je" | "tu" | "il" | "nous" | "vous" | "ils";
export type Pronom = "je" | "tu" | "il" | "elle" | "nous" | "vous" | "ils" | "elles";

// Le sujet quand ce n'est pas simplement « je », « tu », « nous » ou « vous ».
// qui = la question à poser (« Qui chante ? ») : seulement pour un groupe nominal.
// Sans qui, le sujet est un pronom (« Elle », « Ils », « Il »).
export type Sujet = { texte: string; pron: Pronom; qui?: string };

export function sujet(texte: string, pron: Pronom, qui?: string): Sujet {
  return { texte, pron, qui };
}

const PERSONNES: Personne[] = ["je", "tu", "il", "nous", "vous", "ils"];

// Les pronoms qui partagent la forme d'une personne
const PRONOMS_DE: Record<Personne, Pronom[]> = {
  je: ["je"],
  tu: ["tu"],
  il: ["il", "elle"],
  nous: ["nous"],
  vous: ["vous"],
  ils: ["ils", "elles"],
};

function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

// « je » devient « j' » devant une voyelle ou un h muet
function avecPronom(pron: Pronom, forme: string): string {
  return pron === "je" && /^[aeiouyéèêâîôûh]/i.test(forme) ? `j'${forme}` : `${pron} ${forme}`;
}

// « a », « b » ou « c »
function liste(elements: string[]): string {
  const guilles = elements.map((e) => `« ${e} »`);
  if (guilles.length === 1) return guilles[0];
  return `${guilles.slice(0, -1).join(", ")} ou ${guilles[guilles.length - 1]}`;
}

export function qConj(
  verbe: Verbe,
  personne: Personne,
  phrase: string,
  options: {
    sujet?: Sujet;
    pourquoi?: string; // phrase en plus dans l'explication : le piège de cette question
    erreurs?: Record<string, string>; // fautes fréquentes, écrites à la main
  } = {},
): QuestionSaisie {
  if (phrase.split("___").length !== 2) {
    throw new Error(`La phrase doit avoir un seul trou : ${phrase}`);
  }
  const pron: Pronom = options.sujet?.pron ?? personne;
  if (!PRONOMS_DE[personne].includes(pron)) {
    throw new Error(`Le sujet « ${pron} » ne va pas avec la personne « ${personne} » : ${phrase}`);
  }
  const reponse = verbe[personne];

  const debut = options.sujet?.qui
    ? `${options.sujet.qui} ${majuscule(options.sujet.texte)}. Je remplace par « ${pron} » : « ${avecPronom(pron, reponse)} ».`
    : `Avec « ${pron} », le verbe ${verbe.infinitif} s'écrit « ${reponse} » : ${avecPronom(pron, reponse)}.`;
  const explication = [debut, options.pourquoi].filter(Boolean).join(" ");

  const contexte = options.sujet?.qui
    ? `« ${options.sujet.texte} » = « ${pron} »`
    : `le sujet est « ${pron} »`;

  // Une erreur pour chaque autre forme du tableau, avec les pronoms qui l'utilisent.
  const pronomsParForme = new Map<string, string[]>();
  for (const autre of PERSONNES) {
    const forme = verbe[autre];
    if (forme === reponse) continue;
    pronomsParForme.set(forme, [...(pronomsParForme.get(forme) ?? []), ...PRONOMS_DE[autre]]);
  }
  const erreurs: Record<string, string> = {};
  for (const [forme, pronoms] of pronomsParForme) {
    erreurs[forme] = `Cette forme va avec ${liste(pronoms)}. Ici, ${contexte}.`;
  }
  for (const [forme, message] of Object.entries(options.erreurs ?? {})) {
    if (normaliserSaisie(forme) === normaliserSaisie(reponse)) {
      throw new Error(`L'erreur « ${forme} » est la bonne réponse : ${phrase}`);
    }
    erreurs[forme] = message;
  }

  return {
    type: "saisie",
    phrase,
    verbe: verbe.infinitif,
    reponse,
    explication,
    erreurs,
  };
}
