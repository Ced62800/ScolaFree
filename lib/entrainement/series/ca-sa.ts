import type { DonneesNotion, QuestionChoix } from "../types";

const CHOIX = ["ça", "sa"];

// Réponse « ça » : on vérifie avec « cela ».
// essai = la phrase où « cela » remplace le trou.
// suivant = le mot qui suit le trou (absent si aucun mot ne suit).
function qCa(phrase: string, essai: string, suivant?: string): QuestionChoix {
  return {
    phrase,
    choix: CHOIX,
    reponse: "ça",
    explication: `On peut dire « ${essai} » : ça marche. Donc ça, qui veut dire « cela ».`,
    erreurs: {
      sa: suivant
        ? `Le mot sa va devant un nom, comme « sa robe ». Ici, il serait suivi de « ${suivant} », qui n'est pas un nom.`
        : "Le mot sa va toujours devant un nom, comme « sa robe ». Ici, aucun nom ne suit.",
    },
  };
}

// Réponse « sa » : la chose est à quelqu'un, et on peut dire « ma ».
// aQui = « La patte est au chat », essaiMa = « ma patte », essaiCela = la phrase avec « cela ».
function qSa(phrase: string, aQui: string, essaiMa: string, essaiCela: string): QuestionChoix {
  return {
    phrase,
    choix: CHOIX,
    reponse: "sa",
    explication: `${aQui} : c'est « la sienne ». Et on peut dire « ${essaiMa} ». Donc sa.`,
    erreurs: {
      ça: `Essaie avec « cela » : « ${essaiCela} », ça ne veut rien dire.`,
    },
  };
}

// Notion ça / sa : fiche d'identité + séries.
const donnees: DonneesNotion = {
  notion: {
    id: "ca-sa",
    titre: "Ça / Sa",
    famille: "homophones",
    emoji: "🔀",
    fiche: "/fondamentaux/francais/ca-sa",
    mots: ["ça", "sa"],
  },
  series: [
    {
      id: "ca-sa-1",
      notion: "ca-sa",
      titre: "Ça / Sa - série 1",
      classes: ["ce2", "cm1"],
      microRegle:
        "Tu peux dire « cela » ? Écris ça, avec une cédille. Tu peux dire « ma » devant le nom ? Écris sa : c'est « la sienne ».",
      nbQuestions: 10,
      questions: [
        qCa("Regarde, ___ brille dans l'herbe !", "Regarde, cela brille dans l'herbe", "brille"),
        qSa(
          "Le chat lèche ___ patte.",
          "La patte est au chat",
          "ma patte",
          "Le chat lèche cela patte",
        ),
        qCa("Je n'aime pas ___, c'est trop piquant.", "Je n'aime pas cela"),
        qSa(
          "Mon frère cherche ___ casquette partout.",
          "La casquette est à mon frère",
          "ma casquette",
          "Mon frère cherche cela casquette",
        ),
        qCa("Est-ce que ___ te plaît ?", "Est-ce que cela te plaît ?", "te plaît"),
        qSa(
          "Léa met ___ trousse dans son cartable.",
          "La trousse est à Léa",
          "ma trousse",
          "Léa met cela trousse",
        ),
        qCa("Range tes jouets, ___ traîne partout !", "Range tes jouets, cela traîne partout", "traîne"),
        qSa(
          "Mamie prépare ___ tarte aux pommes.",
          "La tarte est à Mamie, c'est elle qui la fait",
          "ma tarte",
          "Mamie prépare cela tarte",
        ),
        qCa("Écoute, ___ fait du bruit dans le grenier !", "Écoute, cela fait du bruit", "fait"),
        qSa(
          "Le garçon a oublié ___ gourde à l'école.",
          "La gourde est au garçon",
          "ma gourde",
          "Le garçon a oublié cela gourde",
        ),
        qCa("Comment ___ marche, ce jeu ?", "Comment cela marche, ce jeu ?", "marche"),
        qSa(
          "Ma cousine promène ___ chienne au parc.",
          "La chienne est à ma cousine",
          "ma chienne",
          "Ma cousine promène cela chienne",
        ),
        qCa("Après la pluie, ___ sent bon dans le jardin.", "Après la pluie, cela sent bon", "sent"),
        qSa(
          "Le bébé serre ___ peluche très fort.",
          "La peluche est au bébé",
          "ma peluche",
          "Le bébé serre cela peluche",
        ),
        qSa(
          "Le facteur ouvre ___ sacoche.",
          "La sacoche est au facteur",
          "ma sacoche",
          "Le facteur ouvre cela sacoche",
        ),
      ],
    },
  ],
};

export default donnees;
