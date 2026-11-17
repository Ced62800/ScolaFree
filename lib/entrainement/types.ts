// Types de la section Entraînement.
// Les données (séries, dictées) sont séparées des moteurs d'affichage :
// ajouter une série = ajouter un objet, sans créer de nouvelle page.

// Classes utilisées partout sur le site (mêmes valeurs que profiles.classe).
export type Classe =
  | "cp"
  | "ce1"
  | "ce2"
  | "cm1"
  | "cm2"
  | "6eme"
  | "5eme"
  | "4eme"
  | "3eme";

export const LIBELLES_CLASSES: Record<Classe, string> = {
  cp: "CP",
  ce1: "CE1",
  ce2: "CE2",
  cm1: "CM1",
  cm2: "CM2",
  "6eme": "6e",
  "5eme": "5e",
  "4eme": "4e",
  "3eme": "3e",
};

// Une notion = un identifiant commun avec la fiche Fondamentaux.
export type Notion = {
  id: string; // ex. "et-est", identique au dossier de la fiche
  titre: string;
  emoji: string;
  fiche: string; // lien vers la règle complète
};

export type QuestionChoix = {
  phrase: string; // la phrase avec "___" à la place du mot
  choix: string[];
  reponse: string;
  explication: string;
};

export type Serie = {
  id: string; // ex. "et-est-1"
  notion: string; // identifiant de notion
  titre: string;
  classes: Classe[]; // étiquette de niveau, sert à la mise en avant
  microRegle: string; // rappel court, la règle complète reste dans la fiche
  nbQuestions: number; // nombre de questions tirées à chaque partie
  questions: QuestionChoix[];
};

export type PhraseDictee = {
  texte: string;
  audio: string; // chemin dans public/, ex. "/audio/dictees/ce2-1/01.mp3"
};

export type Dictee = {
  id: string; // ex. "ce2-1"
  classe: Classe;
  titre: string;
  notions: string[];
  audioComplet: string;
  phrases: PhraseDictee[];
};
