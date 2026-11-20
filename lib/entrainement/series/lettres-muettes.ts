import type { DonneesNotion, QuestionChoix } from "../types";

// Règle de rédaction : seulement des mots dont le féminin ou le mot de la même
// famille est connu d'un enfant de CE1, et où l'astuce donne bien la bonne lettre.

const CHOIX = ["d", "s", "t"];

// mot = le mot complet (« gris »).
// aide = le féminin ou le mot de la même famille, la lettre entre crochets (« gri[s]e »).
function q(phrase: string, mot: string, aide: string): QuestionChoix {
  const m = aide.match(/^(.*)\[(.+)\](.*)$/);
  if (!m) throw new Error(`Aide mal écrite : ${aide}`);
  const [, avant, lettres, apres] = m;
  const lettre = lettres.charAt(0);
  const aideLue = `${avant}${lettres}${apres}`;
  const erreurs: Record<string, string> = {};
  for (const c of CHOIX) {
    if (c !== lettre) {
      erreurs[c] = `On dit « ${aideLue} », pas « ${avant}${c}${apres} ». La lettre muette est un ${lettre}.`;
    }
  }
  // Un seul s entre deux voyelles se prononce « z » (grise, reposer) : on le dit à l'enfant.
  const entendu =
    lettres === "s" ? "on entend « z », écrit avec un s" : `on entend le ${lettre}`;
  return {
    phrase,
    choix: CHOIX,
    reponse: lettre,
    explication: `Pense à « ${aideLue} » : ${entendu}. Donc ${mot}.`,
    erreurs,
  };
}

// Notion lettres muettes : fiche d'identité + séries.
const donnees: DonneesNotion = {
  notion: {
    id: "lettres-muettes",
    titre: "Les lettres muettes",
    famille: "sons",
    emoji: "🤫",
    fiche: "/fondamentaux/francais/lettres-muettes",
    mots: [],
  },
  series: [
    {
      id: "lettres-muettes-1",
      notion: "lettres-muettes",
      titre: "Les lettres muettes - série 1",
      classes: ["ce1", "ce2"],
      microRegle:
        "La lettre muette ne s'entend pas, mais elle se montre au féminin ou dans un mot de la même famille. Fais-la parler : petit, petite. Un saut, sauter.",
      nbQuestions: 10,
      questions: [
        q("Mon doudou est tout gri___.", "gris", "gri[s]e"),
        q("Mon frère est plus gran___ que moi.", "grand", "gran[d]e"),
        q("Le cha___ dort sur le canapé.", "chat", "cha[t]on"),
        q("Attention, le chocolat est très chau___ !", "chaud", "chau[d]e"),
        q("Après le match, j'ai besoin de repo___.", "repos", "repo[s]er"),
        q("Mon cousin est très gourman___ : il adore les bonbons.", "gourmand", "gourman[d]e"),
        q("Ce matin, le vent est froi___.", "froid", "froi[d]e"),
        q("J'entends le chan___ des oiseaux.", "chant", "chan[t]er"),
        q("Mon sac est trop lour___.", "lourd", "lour[d]e"),
        q("Le bébé est assi___ dans sa chaise.", "assis", "assi[s]e"),
        q("Il fait mauvai___ aujourd'hui.", "mauvais", "mauvai[s]e"),
        q("Le foot est mon spor___ préféré.", "sport", "spor[t]if"),
        q("J'ai perdu une den___ de lait.", "dent", "den[t]iste"),
        q("Mon petit frère est très conten___.", "content", "conten[t]e"),
        q("Le prince du conte est blon___.", "blond", "blon[d]e"),
      ],
    },
  ],
};

export default donnees;
