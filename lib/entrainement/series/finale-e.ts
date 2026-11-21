import type { DonneesNotion, QuestionChoix } from "../types";

// Règles de rédaction :
// - une seule bonne fin possible par phrase (on teste vendre, vendu, vendez, vendait) ;
// - verbes du 1er groupe seulement ;
// - pas de « je » ni de « tu » à l'imparfait (la fin serait -ais, absente des boutons) ;
// - participe passé : sujet masculin avec être, jamais de COD placé avant le verbe
//   (sinon il faudrait écrire -ée, -és...) ;
// - pas d'ordre (impératif) : « Écouter bien ! » passerait aussi.
// - jamais une apostrophe juste devant le radical (« j'aim___ ») : le test ne marcherait pas.

const CHOIX = ["er", "é", "ez", "ait"];

// Le verbe qui sert d'astuce pour chaque fin.
const TEST: Record<string, string> = {
  er: "vendre",
  é: "vendu",
  ez: "vendez",
  ait: "vendait",
};

// Ce que veut dire une fin, affiché quand l'élève l'a choisie à tort.
const SENS: Record<string, string> = {
  er: "-er, c'est le verbe tout seul, comme « vendre ».",
  é: "-é, c'est le verbe quand il suit « a », « est » ou « ai », comme « vendu ».",
  ez: "-ez, c'est quand le sujet est « vous », comme « vendez ».",
  ait: "-ait, c'est quand on raconte ce qui se passait avant, avec « il » ou « elle », comme « vendait ».",
};

// phrase = la phrase, le radical du verbe suivi de « ___ » (« jou___ »).
// reponse = la bonne fin parmi CHOIX.
// indice = pourquoi cette fin, à compléter après « Ici, » (« le verbe est tout seul après « aime » »).
function q(phrase: string, reponse: string, indice: string): QuestionChoix {
  const m = phrase.match(/(\p{L}+)___/u);
  if (!m) throw new Error(`Phrase sans trou : ${phrase}`);
  const radical = m[1];
  const majuscule = radical.charAt(0) !== radical.charAt(0).toLowerCase();
  // La phrase avec vendre / vendu / vendez / vendait à la place du trou.
  const test = (fin: string) => {
    const mot = TEST[fin];
    return phrase.replace(m[0], majuscule ? mot.charAt(0).toUpperCase() + mot.slice(1) : mot);
  };
  const erreurs: Record<string, string> = {};
  for (const c of CHOIX) {
    if (c !== reponse) {
      erreurs[c] = `« ${test(c)} » ne marche pas. ${SENS[c]} Ici, ${indice}.`;
    }
  }
  return {
    phrase,
    choix: CHOIX,
    reponse,
    explication: `Remplace par vendre, vendu, vendez ou vendait : seul « ${test(reponse)} » marche. Ici, ${indice}. Donc ${radical}${reponse}.`,
    erreurs,
  };
}

// Notion finale en [é] : fiche d'identité + séries.
const donnees: DonneesNotion = {
  notion: {
    id: "finale-e",
    titre: "La finale en [é] : é, er, ez, ait",
    famille: "accords",
    emoji: "🔚",
    fiche: "/fondamentaux/francais/finale-e",
    mots: [],
  },
  series: [
    {
      id: "finale-e-1",
      notion: "finale-e",
      titre: "La finale en [é] - série 1",
      classes: ["ce2", "cm1", "cm2", "6eme"],
      microRegle:
        "Remplace par « vendre, vendu, vendez ou vendait ». Vendre → -er. Vendu → -é. Vendez → -ez. Vendait → -ait.",
      nbQuestions: 10,
      questions: [
        q("Mon frère aime jou___ dans le jardin.", "er", "le verbe est tout seul après « aime »"),
        q("Maman va prépar___ le goûter.", "er", "le verbe est tout seul après « va »"),
        q("Pour gagn___ la course, Inès s'entraîne tous les jours.", "er", "le verbe est tout seul après « pour »"),
        q("Mon petit frère refuse de mang___ sa soupe.", "er", "le verbe est tout seul après « refuse de »"),
        q("Hier, Léa a mang___ une pomme.", "é", "« a » est juste devant le verbe"),
        q("Papa a répar___ mon vélo.", "é", "« a » est juste devant le verbe"),
        q("Mon frère est tomb___ dans la cour.", "é", "« est » est juste devant le verbe"),
        q("Nous avons visit___ un château pendant les vacances.", "é", "« avons » est juste devant le verbe"),
        q("Vous cherch___ vos clés ?", "ez", "le sujet est « vous »"),
        q("Les enfants, vous march___ trop vite !", "ez", "le sujet est « vous »"),
        q("Vous rang___ vos jouets dans la caisse ?", "ez", "le sujet est « vous »"),
        q("Quand il était petit, il chant___ tout le temps.", "ait", "on raconte ce qui se passait quand il était petit"),
        q("Autrefois, ma grand-mère travaill___ dans une ferme.", "ait", "on raconte ce qui se passait autrefois"),
        q("Chaque été, mon oncle pêch___ dans la rivière.", "ait", "on raconte une habitude des étés d'avant"),
        q("Pendant que Mamie cuisin___, nous jouions aux cartes.", "ait", "deux choses se passaient en même temps dans le passé"),
      ],
    },
  ],
};

export default donnees;
