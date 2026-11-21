// Tableaux de conjugaison au présent, écrits à la main.
// Ils servent à deux choses : fabriquer les messages d'erreur des séries de saisie
// (lib/entrainement/conjugaison.ts) et afficher les tableaux dans les fiches Fondamentaux.
// Chaque forme est relue : une faute ici se retrouverait dans tous les exercices.

export type Verbe = {
  infinitif: string;
  je: string;
  tu: string;
  il: string; // vaut aussi pour « elle »
  nous: string;
  vous: string;
  ils: string; // vaut aussi pour « elles »
};

function verbe(
  infinitif: string,
  je: string,
  tu: string,
  il: string,
  nous: string,
  vous: string,
  ils: string,
): Verbe {
  return { infinitif, je, tu, il, nous, vous, ils };
}

// Être et avoir
export const ETRE = verbe("être", "suis", "es", "est", "sommes", "êtes", "sont");
export const AVOIR = verbe("avoir", "ai", "as", "a", "avons", "avez", "ont");

// Verbes en -er
export const CHANTER = verbe("chanter", "chante", "chantes", "chante", "chantons", "chantez", "chantent");
export const MANGER = verbe("manger", "mange", "manges", "mange", "mangeons", "mangez", "mangent");
export const JOUER = verbe("jouer", "joue", "joues", "joue", "jouons", "jouez", "jouent");
export const REGARDER = verbe("regarder", "regarde", "regardes", "regarde", "regardons", "regardez", "regardent");
export const DESSINER = verbe("dessiner", "dessine", "dessines", "dessine", "dessinons", "dessinez", "dessinent");
export const PARLER = verbe("parler", "parle", "parles", "parle", "parlons", "parlez", "parlent");
export const COMMENCER = verbe("commencer", "commence", "commences", "commence", "commençons", "commencez", "commencent");
export const RANGER = verbe("ranger", "range", "ranges", "range", "rangeons", "rangez", "rangent");
export const ECOUTER = verbe("écouter", "écoute", "écoutes", "écoute", "écoutons", "écoutez", "écoutent");
export const DANSER = verbe("danser", "danse", "danses", "danse", "dansons", "dansez", "dansent");
export const PORTER = verbe("porter", "porte", "portes", "porte", "portons", "portez", "portent");
export const NAGER = verbe("nager", "nage", "nages", "nage", "nageons", "nagez", "nagent");
export const LANCER = verbe("lancer", "lance", "lances", "lance", "lançons", "lancez", "lancent");

// Verbes courants
export const ALLER = verbe("aller", "vais", "vas", "va", "allons", "allez", "vont");
export const FAIRE = verbe("faire", "fais", "fais", "fait", "faisons", "faites", "font");
export const DIRE = verbe("dire", "dis", "dis", "dit", "disons", "dites", "disent");
export const VENIR = verbe("venir", "viens", "viens", "vient", "venons", "venez", "viennent");
export const PRENDRE = verbe("prendre", "prends", "prends", "prend", "prenons", "prenez", "prennent");
export const POUVOIR = verbe("pouvoir", "peux", "peux", "peut", "pouvons", "pouvez", "peuvent");
