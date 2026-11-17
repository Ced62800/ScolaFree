// Correction d'une dictée, mot par mot.
// Trois catégories d'erreurs, comptées séparément :
// - orthographe : mot différent (en ignorant majuscules et ponctuation), mot oublié ou mot en trop
// - majuscule   : seule la casse diffère
// - ponctuation : seule la ponctuation collée au mot diffère ou manque

export type TypeErreur = "orthographe" | "majuscule" | "ponctuation";

export type MotCorrige = {
  attendu: string | null; // null = mot en trop
  saisi: string | null; // null = mot oublié
  erreurs: TypeErreur[];
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
const RE_BORDS = /^[.,;:!?«»"()…[\]]+|[.,;:!?«»"()…[\]]+$/g;

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

function coeur(mot: string): string {
  return mot.replace(RE_BORDS, "");
}

function ponctuationDe(mot: string): string {
  const debut = mot.match(/^[.,;:!?«»"()…[\]]+/)?.[0] ?? "";
  const fin = mot.match(/[.,;:!?«»"()…[\]]+$/)?.[0] ?? "";
  return debut + "|" + fin;
}

// « oe » est accepté pour « œ » (difficile à taper au clavier)
function sansLigature(mot: string): string {
  return mot.replace(/œ/g, "oe").replace(/Œ/g, "Oe").replace(/æ/g, "ae").replace(/Æ/g, "Ae");
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
        mots.push(comparerMot(attendus[i - 1], saisis[j - 1]));
        i--;
        j--;
        continue;
      }
    }
    if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      mots.push({ attendu: attendus[i - 1], saisi: null, erreurs: ["orthographe"] });
      i--;
    } else {
      mots.push({ attendu: null, saisi: saisis[j - 1], erreurs: ["orthographe"] });
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

function comparerMot(attendu: string, saisi: string): MotCorrige {
  const erreurs: TypeErreur[] = [];
  if (!memeMot(attendu, saisi)) {
    erreurs.push("orthographe");
  } else {
    if (sansLigature(coeur(attendu)) !== sansLigature(coeur(saisi)))
      erreurs.push("majuscule");
    if (ponctuationDe(attendu) !== ponctuationDe(saisi))
      erreurs.push("ponctuation");
  }
  return { attendu, saisi, erreurs };
}

// "2 fautes d'orthographe", "1 erreur de majuscule", "0 erreur de ponctuation"
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
