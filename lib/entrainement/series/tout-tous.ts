import type { DonneesNotion, QuestionChoix } from "../types";

type Forme = "tout" | "toute" | "tous" | "toutes";
const CHOIX: Forme[] = ["tout", "toute", "tous", "toutes"];

// Astuce de la série : regarder le petit mot qui suit le trou.
// le → tout, la → toute, les + nom masculin → tous, les + nom féminin → toutes.
// Règle de rédaction : toujours « le », « la » ou « les » juste après le trou
// (jamais « l' »), et jamais de nom qui peut être masculin ou féminin
// (élèves, enfants, camarades…).

// Pourquoi chaque mauvaise forme ne marche pas, selon la bonne réponse.
// unNom = le nom avec « un » ou « une », ex. « un bonbon » (utile pour « les »).
function erreursPour(reponse: Forme, unNom: string): Record<string, string> {
  const raisons: Record<Forme, string> = {
    tout: "Tout va devant « le ».",
    toute: "Toute va devant « la ».",
    tous: "Tous va devant « les » suivi d'un nom masculin.",
    toutes: "Toutes va devant « les » suivi d'un nom féminin.",
  };
  const ici: Record<Forme, string> = {
    tout: "Ici, le petit mot qui suit est « le » : c'est tout.",
    toute: "Ici, le petit mot qui suit est « la » : c'est toute.",
    tous: `Ici, il y a « les » et on dit « ${unNom} » : c'est un nom masculin, donc tous.`,
    toutes: `Ici, il y a « les » et on dit « ${unNom} » : c'est un nom féminin, donc toutes.`,
  };
  const erreurs: Record<string, string> = {};
  for (const forme of CHOIX) {
    if (forme !== reponse) erreurs[forme] = `${raisons[forme]} ${ici[reponse]}`;
  }
  return erreurs;
}

// unNom : seulement pour « les », pour vérifier si le nom est masculin ou féminin.
function q(phrase: string, reponse: Forme, groupe: string, unNom = ""): QuestionChoix {
  const explications: Record<Forme, string> = {
    tout: `Juste après le trou, il y a le petit mot « le » : on écrit tout. « Tout ${groupe} ».`,
    toute: `Juste après le trou, il y a le petit mot « la » : on écrit toute. « Toute ${groupe} ».`,
    tous: `Juste après le trou, il y a « les ». On dit « ${unNom} » : c'est un nom masculin. Donc tous. « Tous ${groupe} ».`,
    toutes: `Juste après le trou, il y a « les ». On dit « ${unNom} » : c'est un nom féminin. Donc toutes. « Toutes ${groupe} ».`,
  };
  return {
    phrase,
    choix: CHOIX,
    reponse,
    explication: explications[reponse],
    erreurs: erreursPour(reponse, unNom),
  };
}

// Notion tout / tous / toute / toutes : fiche d'identité + séries.
const donnees: DonneesNotion = {
  notion: {
    id: "tout-tous",
    titre: "Tout / Tous / Toute / Toutes",
    famille: "homophones",
    emoji: "🌐",
    fiche: "/fondamentaux/francais/tout-tous",
    mots: ["tout", "tous", "toute", "toutes"],
  },
  series: [
    {
      id: "tout-tous-1",
      notion: "tout-tous",
      titre: "Tout / Tous / Toute / Toutes - série 1",
      classes: ["ce2", "cm1", "cm2"],
      microRegle:
        "Regarde le petit mot qui suit. « le » : tout. « la » : toute. « les » et un nom masculin (un bonbon) : tous. « les » et un nom féminin (une fleur) : toutes.",
      nbQuestions: 10,
      questions: [
        q("J'ai mangé ___ le gâteau, il n'en reste pas une miette.", "tout", "le gâteau"),
        q("Ma sœur a bu ___ la bouteille de jus.", "toute", "la bouteille"),
        q("Je fais du vélo ___ les dimanches.", "tous", "les dimanches", "un dimanche"),
        q("Mamie a arrosé ___ les fleurs du balcon.", "toutes", "les fleurs", "une fleur"),
        q("Mon petit frère a dormi pendant ___ le voyage.", "tout", "le voyage"),
        q("Il a plu ___ la matinée.", "toute", "la matinée"),
        q("Le magicien a fait disparaître ___ les bonbons !", "tous", "les bonbons", "un bonbon"),
        q("J'ai colorié ___ les pages de mon cahier.", "toutes", "les pages", "une page"),
        q("Le chien a couru dans ___ le jardin.", "tout", "le jardin"),
        q("Nous avons fait le tour de ___ la ville à vélo.", "toute", "la ville"),
        q("Ce matin, ___ les oiseaux chantent dans l'arbre.", "tous", "les oiseaux", "un oiseau"),
        q("Tu as ramassé ___ les pommes tombées par terre ?", "toutes", "les pommes", "une pomme"),
        q("La neige a recouvert ___ le village.", "tout", "le village"),
        q("Le chat a renversé ___ la boîte de croquettes.", "toute", "la boîte"),
        q("Mon frère sait dessiner ___ les dinosaures.", "tous", "les dinosaures", "un dinosaure"),
      ],
    },
  ],
};

export default donnees;
