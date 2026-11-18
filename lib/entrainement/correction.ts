// Correction d'une dictée, mot par mot.
// Trois catégories d'erreurs, comptées séparément :
// - orthographe : mot différent (en ignorant majuscules et ponctuation), mot oublié ou mot en trop
// - majuscule   : seule la casse diffère
// - ponctuation : la ponctuation collée au mot diffère ou manque

export type TypeErreur = "orthographe" | "majuscule" | "ponctuation";

export type MotCorrige = {
  attendu: string | null; // null = mot en trop
  saisi: string | null; // null = mot oublié
  erreurs: TypeErreur[];
  position: number | null; // rang du mot attendu dans la phrase (0 = premier)
  ligature: boolean; // « oe » écrit à la place de « œ » (accepté, pas une faute)
};

export type ResultatCorrection = {
  mots: MotCorrige[];
  nbMotsAttendus: number;
  nbMotsJustes: number;
  nbOrthographe: number;
  nbMajuscule: number;
  nbPonctuation: number;
};

const PONCTUATION = ".,;:!?«»\"()…[]";
const RE_DEBUT = /^[.,;:!?«»"()…[\]]+/;
const RE_FIN = /[.,;:!?«»"()…[\]]+$/;

function estPonctuationSeule(token: string): boolean {
  return [...token].every((c) => PONCTUATION.includes(c));
}

// Uniformise le texte : apostrophes courbes, espaces insécables, espaces multiples.
function normaliser(texte: string): string {
  return texte
    .replace(/[’‘ʼ]/g, "'")
    .replace(/[  ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Découpe en mots. Une ponctuation isolée ("joli ." ou "« Bonjour »")
// est recollée au mot voisin : l'espace avant un point n'est pas une faute.
export function decouperMots(texte: string): string[] {
  const bruts = normaliser(texte).split(" ").filter(Boolean);
  const mots: string[] = [];
  let enAttente = "";
  for (const token of bruts) {
    if (estPonctuationSeule(token)) {
      if (mots.length > 0) mots[mots.length - 1] += token;
      else enAttente += token;
    } else {
      mots.push(enAttente + token);
      enAttente = "";
    }
  }
  if (enAttente && mots.length > 0) mots[mots.length - 1] += enAttente;
  return mots;
}

// Le mot sans la ponctuation collée autour
export function coeur(mot: string): string {
  return mot.replace(RE_DEBUT, "").replace(RE_FIN, "");
}

function ponctuationDe(mot: string): string {
  const debut = mot.match(RE_DEBUT)?.[0] ?? "";
  const fin = mot.match(RE_FIN)?.[0] ?? "";
  return debut + "|" + fin;
}

// « oe » est accepté pour « œ » (difficile à taper au clavier)
function sansLigature(mot: string): string {
  return mot
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "Oe")
    .replace(/æ/g, "ae")
    .replace(/Æ/g, "Ae");
}

function sansAccent(mot: string): string {
  return mot.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function memeMot(a: string, b: string): boolean {
  return (
    sansLigature(coeur(a)).toLowerCase() === sansLigature(coeur(b)).toLowerCase()
  );
}

// Aligne les deux listes de mots (distance d'édition) pour repérer
// les mots oubliés ou en trop sans décaler toute la suite.
export function corrigerTexte(
  texteAttendu: string,
  texteSaisi: string,
): ResultatCorrection {
  const attendus = decouperMots(texteAttendu);
  const saisis = decouperMots(texteSaisi);
  const n = attendus.length;
  const m = saisis.length;

  const d: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = 0; i <= n; i++) d[i][0] = i;
  for (let j = 0; j <= m; j++) d[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cout = memeMot(attendus[i - 1], saisis[j - 1]) ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j - 1] + cout,
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
      );
    }
  }

  // Remontée du chemin
  const mots: MotCorrige[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const cout = memeMot(attendus[i - 1], saisis[j - 1]) ? 0 : 1;
      if (d[i][j] === d[i - 1][j - 1] + cout) {
        mots.push(comparerMot(attendus[i - 1], saisis[j - 1], i - 1));
        i--;
        j--;
        continue;
      }
    }
    if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      mots.push({
        attendu: attendus[i - 1],
        saisi: null,
        erreurs: ["orthographe"],
        position: i - 1,
        ligature: false,
      });
      i--;
    } else {
      mots.push({
        attendu: null,
        saisi: saisis[j - 1],
        erreurs: ["orthographe"],
        position: null,
        ligature: false,
      });
      j--;
    }
  }
  mots.reverse();

  let nbMotsJustes = 0;
  let nbMotsEnTrop = 0;
  let nbOrthographe = 0;
  let nbMajuscule = 0;
  let nbPonctuation = 0;
  for (const mot of mots) {
    if (mot.attendu !== null && mot.erreurs.length === 0) nbMotsJustes++;
    if (mot.attendu === null) nbMotsEnTrop++;
    if (mot.erreurs.includes("orthographe")) nbOrthographe++;
    if (mot.erreurs.includes("majuscule")) nbMajuscule++;
    if (mot.erreurs.includes("ponctuation")) nbPonctuation++;
  }

  return {
    mots,
    nbMotsAttendus: n,
    // Un mot en trop retire un mot juste (sinon on pourrait avoir 4/4 avec une faute)
    nbMotsJustes: Math.max(0, nbMotsJustes - nbMotsEnTrop),
    nbOrthographe,
    nbMajuscule,
    nbPonctuation,
  };
}

function comparerMot(attendu: string, saisi: string, position: number): MotCorrige {
  const erreurs: TypeErreur[] = [];
  if (!memeMot(attendu, saisi)) {
    erreurs.push("orthographe");
  } else if (sansLigature(coeur(attendu)) !== sansLigature(coeur(saisi))) {
    erreurs.push("majuscule");
  }
  if (ponctuationDe(attendu) !== ponctuationDe(saisi)) erreurs.push("ponctuation");
  const ligature =
    !erreurs.includes("orthographe") && /[œŒæÆ]/.test(attendu) &&
    !/[œŒæÆ]/.test(saisi);
  return { attendu, saisi, erreurs, position, ligature };
}

// ============================================================
// EXPLICATIONS (pour un enfant de CE2 : tutoiement, phrases courtes)
// ============================================================

export type Explication = {
  ton: "erreur" | "bravo" | "note";
  texte: string;
};

// Aide écrite à la main pour un mot (clé = mot attendu sans ponctuation)
function aideDe(attendu: string, aides?: Record<string, string>): string | undefined {
  if (!aides) return undefined;
  const c = coeur(attendu);
  return aides[c] ?? aides[c.toLowerCase()];
}

// Renvoie les explications d'un mot corrigé.
// - Les aides écrites à la main sont prioritaires pour les fautes d'orthographe.
// - Majuscules et ponctuation ont toujours leur explication automatique.
// - Un mot de la notion écrit juste reçoit « Bravo ! » + son aide.
export function expliquerMot(
  mot: MotCorrige,
  options: { aides?: Record<string, string>; motsNotion?: string[] } = {},
): Explication[] {
  const { aides, motsNotion = [] } = options;
  const resultat: Explication[] = [];

  // Mot en trop
  if (mot.attendu === null) {
    return [{ ton: "erreur", texte: "Ce mot n'est pas dans la phrase." }];
  }
  // Mot oublié
  if (mot.saisi === null) {
    return [{ ton: "erreur", texte: "Tu as oublié ce mot. Réécoute la phrase." }];
  }

  const attendu = coeur(mot.attendu);
  const saisi = coeur(mot.saisi);
  const aide = aideDe(mot.attendu, aides);

  // Mot juste
  if (mot.erreurs.length === 0) {
    if (aide && motsNotion.includes(attendu.toLowerCase())) {
      resultat.push({ ton: "bravo", texte: `Bravo ! ${aide}` });
    }
    if (mot.ligature) {
      resultat.push({
        ton: "note",
        texte: "Bien ! On peut aussi l'écrire avec le o et le e collés : œ.",
      });
    }
    return resultat;
  }

  if (mot.erreurs.includes("orthographe")) {
    if (aide) {
      resultat.push({ ton: "erreur", texte: aide });
    } else if (
      sansAccent(sansLigature(attendu)).toLowerCase() ===
      sansAccent(sansLigature(saisi)).toLowerCase()
    ) {
      resultat.push({ ton: "erreur", texte: `Attention à l'accent : on écrit ${attendu}.` });
    } else {
      resultat.push({
        ton: "erreur",
        texte: `On écrit ${attendu}. Regarde-le bien lettre par lettre.`,
      });
    }
  }

  if (mot.erreurs.includes("majuscule")) {
    const majusculeAttendue = attendu[0] !== attendu[0].toLowerCase();
    if (majusculeAttendue && mot.position === 0) {
      resultat.push({ ton: "erreur", texte: "Une phrase commence toujours par une majuscule." });
    } else if (majusculeAttendue) {
      resultat.push({ ton: "erreur", texte: "Un prénom commence toujours par une majuscule." });
    } else {
      resultat.push({
        ton: "erreur",
        texte: `Pas de majuscule ici : on écrit ${attendu}.`,
      });
    }
  }

  if (mot.erreurs.includes("ponctuation")) {
    if (mot.attendu.endsWith(".") && !mot.saisi.endsWith(".")) {
      resultat.push({ ton: "erreur", texte: "Une phrase se termine toujours par un point." });
    } else {
      resultat.push({
        ton: "erreur",
        texte: `Attention à la ponctuation : on écrit « ${mot.attendu} ».`,
      });
    }
  }

  return resultat;
}

// "2 fautes d'orthographe, 1 erreur de majuscule, 0 erreur de ponctuation"
export function resumeErreurs(r: {
  nbOrthographe: number;
  nbMajuscule: number;
  nbPonctuation: number;
}): string {
  const accord = (nb: number, singulier: string, pluriel: string) =>
    `${nb} ${nb > 1 ? pluriel : singulier}`;
  return [
    accord(r.nbOrthographe, "faute d'orthographe", "fautes d'orthographe"),
    accord(r.nbMajuscule, "erreur de majuscule", "erreurs de majuscule"),
    accord(r.nbPonctuation, "erreur de ponctuation", "erreurs de ponctuation"),
  ].join(", ");
}
