import type { DonneesNotion, QuestionChoix } from "../types";

// Règles de rédaction (série de niveau CE2-CM1) :
// - présent seulement, verbes très courants (-er, être, avoir, faire) ;
// - surtout des sujets simples, puis quelques sujets éloignés (« Les enfants de ma classe jouent ») ;
// - pas de sujet inversé dans la série (il reste un cas bonus dans la fiche) ;
// - le sujet est toujours à la 3e personne : on peut le remplacer par il, elle, ils ou elles.

type Pronom = "il" | "elle" | "ils" | "elles";

const SINGULIER: Record<Pronom, string> = { il: "il", elle: "elle", ils: "il", elles: "elle" };
const PLURIEL: Record<Pronom, string> = { il: "ils", elle: "elles", ils: "ils", elles: "elles" };

// phrase = la phrase avec « ___ » à la place du verbe.
// formes = [verbe au singulier, verbe au pluriel].
// nombre = le nombre du sujet, donc la bonne forme.
// sujet = le groupe sujet en entier, avec une majuscule (« Les chats »).
// pron = le pronom qui le remplace.
// qui = la question à poser (« Qui dort ? »).
// piege = une phrase qui explique le piège quand le sujet est éloigné du verbe.
function q(
  phrase: string,
  formes: [string, string],
  nombre: "sg" | "pl",
  sujet: string,
  pron: Pronom,
  qui: string,
  piege?: string,
): QuestionChoix {
  const [sg, pl] = formes;
  const bonne = nombre === "sg" ? sg : pl;
  const mauvaise = nombre === "sg" ? pl : sg;
  const feminin = pron === "elle" || pron === "elles";
  const attention = piege ? ` ${piege}` : "";

  const explication =
    nombre === "sg"
      ? `${qui} ${sujet}.${attention} Je remplace par « ${pron} » : « ${pron} ${sg} ». ${feminin ? "Elle est toute seule" : "Il est tout seul"} : le verbe reste au singulier.`
      : `${qui} ${sujet}.${attention} Je remplace par « ${pron} » : « ${pron} ${pl} ». ${feminin ? "Elles sont plusieurs" : "Ils sont plusieurs"} : le verbe se met au pluriel${pl.endsWith("ent") ? " et finit par -ent" : ""}.`;

  const erreur =
    nombre === "pl"
      ? `« ${mauvaise} » va avec un seul : « ${SINGULIER[pron]} ${mauvaise} ». Mais ici, « ${sujet} » = « ${pron} » : ${feminin ? "elles sont plusieurs" : "ils sont plusieurs"}.${attention}`
      : `« ${mauvaise} » va avec plusieurs : « ${PLURIEL[pron]} ${mauvaise} ». Mais ici, « ${sujet} » = « ${pron} » : ${feminin ? "elle est toute seule" : "il est tout seul"}.${attention}`;

  return {
    phrase,
    choix: [sg, pl],
    reponse: bonne,
    explication,
    erreurs: { [mauvaise]: erreur },
  };
}

// Notion accord sujet-verbe : fiche d'identité + séries.
const donnees: DonneesNotion = {
  notion: {
    id: "accord-sujet-verbe",
    titre: "L'accord sujet-verbe",
    famille: "accords",
    emoji: "🎯",
    fiche: "/fondamentaux/francais/accord-sujet-verbe",
    mots: [],
  },
  series: [
    {
      id: "accord-sujet-verbe-1",
      notion: "accord-sujet-verbe",
      titre: "L'accord sujet-verbe - série 1",
      classes: ["ce2", "cm1"],
      microRegle:
        "Demande-toi « Qui fait l'action ? » et remplace le sujet par « il » ou « ils » (« elle » ou « elles »). Avec « ils » ou « elles », le verbe se met au pluriel : souvent -ent, mais aussi « sont », « ont » ou « font ».",
      nbQuestions: 10,
      questions: [
        q("Les chats ___ sur le canapé.", ["dort", "dorment"], "pl", "Les chats", "ils", "Qui dort ?"),
        q("Mon frère ___ un gâteau au chocolat.", ["prépare", "préparent"], "sg", "Mon frère", "il", "Qui prépare un gâteau ?"),
        q("Les avions ___ très haut.", ["vole", "volent"], "pl", "Les avions", "ils", "Qui vole très haut ?"),
        q("Ma sœur ___ ses devoirs avant le dîner.", ["fait", "font"], "sg", "Ma sœur", "elle", "Qui fait ses devoirs ?"),
        q("Les voitures ___ doucement dans la rue.", ["roule", "roulent"], "pl", "Les voitures", "elles", "Qui roule doucement ?"),
        q(
          "Lou et Sam ___ des dessins pour leur mamie.",
          ["dessine", "dessinent"],
          "pl",
          "Lou et Sam",
          "ils",
          "Qui dessine ?",
          "Avec « et », il y a deux personnes.",
        ),
        q("Mon voisin ___ sa voiture tous les samedis.", ["lave", "lavent"], "sg", "Mon voisin", "il", "Qui lave sa voiture ?"),
        q("La fleur ___ dans le vase.", ["est", "sont"], "sg", "La fleur", "elle", "Qui est dans le vase ?"),
        q("Mon chien ___ très faim.", ["a", "ont"], "sg", "Mon chien", "il", "Qui a très faim ?"),
        q(
          "Les enfants de ma classe ___ dans la cour.",
          ["joue", "jouent"],
          "pl",
          "Les enfants de ma classe",
          "ils",
          "Qui joue dans la cour ?",
          "Attention : « classe » est au singulier, mais ce sont les enfants qui jouent.",
        ),
        q(
          "Le chien des voisins ___ toute la nuit.",
          ["aboie", "aboient"],
          "sg",
          "Le chien des voisins",
          "il",
          "Qui aboie ?",
          "Attention : « voisins » est au pluriel, mais c'est le chien qui aboie.",
        ),
        q(
          "Le sac de mes cousins ___ sur la chaise.",
          ["est", "sont"],
          "sg",
          "Le sac de mes cousins",
          "il",
          "Qui est sur la chaise ?",
          "Attention : « cousins » est au pluriel, mais c'est le sac qui est sur la chaise.",
        ),
        q(
          "Les chaussures de mon père ___ dans l'entrée.",
          ["reste", "restent"],
          "pl",
          "Les chaussures de mon père",
          "elles",
          "Qui reste dans l'entrée ?",
          "Attention : « père » est au singulier, mais ce sont les chaussures qui restent.",
        ),
        q("Le poisson ___ dans l'aquarium.", ["nage", "nagent"], "sg", "Le poisson", "il", "Qui nage dans l'aquarium ?"),
        q(
          "Tous les matins, les oiseaux du jardin ___ très tôt.",
          ["chante", "chantent"],
          "pl",
          "Les oiseaux du jardin",
          "ils",
          "Qui chante très tôt ?",
          "Attention : « jardin » est au singulier, mais ce sont les oiseaux qui chantent.",
        ),
      ],
    },
  ],
};

export default donnees;
