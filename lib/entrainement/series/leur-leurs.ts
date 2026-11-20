import type { DonneesNotion, QuestionChoix } from "../types";

const CHOIX = ["leur", "leurs"];

// Règle de rédaction : dans chaque phrase, le nombre doit être évident
// (une seule maman, une chambre partagée, des bottes…). Jamais de phrase
// où leur et leurs seraient tous les deux possibles.

// Leur devant un verbe : il veut dire « à eux » ou « à elles », jamais de s.
// essai = la phrase redite avec « à eux » ou « à elles ».
function qVerbe(phrase: string, verbe: string, essai: string): QuestionChoix {
  return {
    phrase,
    choix: CHOIX,
    reponse: "leur",
    explication: `Ici, leur est devant le verbe « ${verbe} ». Il veut dire « à eux » ou « à elles » : ${essai}. Devant un verbe, leur ne prend jamais de s.`,
    erreurs: {
      leurs:
        "Devant un verbe, leur ne prend jamais de s, même s'il y a plusieurs personnes. C'est comme « lui » : on n'écrit jamais « luis ».",
    },
  };
}

// Leur devant un nom au singulier : une seule chose.
function qUn(phrase: string, nom: string, pourquoi: string): QuestionChoix {
  return {
    phrase,
    choix: CHOIX,
    reponse: "leur",
    explication: `Le nom qui suit, « ${nom} », est au singulier : ${pourquoi}. Donc leur, sans s.`,
    erreurs: {
      leurs: `Regarde le nom qui suit : « ${nom} » n'a pas de s, il est au singulier. Leur ne prend donc pas de s non plus.`,
    },
  };
}

// Leurs devant un nom au pluriel : plusieurs choses.
function qPlusieurs(phrase: string, nom: string, pourquoi: string): QuestionChoix {
  return {
    phrase,
    choix: CHOIX,
    reponse: "leurs",
    explication: `Le nom qui suit, « ${nom} », est au pluriel : ${pourquoi}. Donc leurs, avec un s.`,
    erreurs: {
      leur: `Regarde le nom qui suit : « ${nom} » a un s, il est au pluriel. Leurs prend donc un s, lui aussi.`,
    },
  };
}

// Notion leur / leurs : fiche d'identité + séries.
const donnees: DonneesNotion = {
  notion: {
    id: "leur-leurs",
    titre: "Leur / Leurs",
    famille: "homophones",
    emoji: "👨‍👩‍👧",
    fiche: "/fondamentaux/francais/leur-leurs",
    mots: ["leur", "leurs"],
  },
  series: [
    {
      id: "leur-leurs-1",
      notion: "leur-leurs",
      titre: "Leur / Leurs - série 1",
      classes: ["ce2", "cm1", "cm2"],
      microRegle:
        "Devant un verbe, leur veut dire « à eux » : jamais de s. Devant un nom, regarde ce nom : une seule chose, leur ; plusieurs choses, leurs avec un s.",
      nbQuestions: 10,
      questions: [
        qPlusieurs(
          "Les enfants enfilent ___ bottes pour sauter dans les flaques.",
          "bottes",
          "des bottes, ça va toujours par deux",
        ),
        qVerbe(
          "Les élèves sont sages, la maîtresse ___ lit une histoire.",
          "lit",
          "la maîtresse lit une histoire à eux",
        ),
        qUn(
          "Mes voisins promènent ___ chien, un petit caniche tout blanc.",
          "chien",
          "ils n'ont qu'un seul chien, le petit caniche",
        ),
        qPlusieurs(
          "Mes cousins m'ont montré ___ poissons rouges qui nagent dans l'aquarium.",
          "poissons",
          "il y a plusieurs poissons, qui nagent",
        ),
        qVerbe("Mes amis ont soif, je ___ apporte de l'eau.", "apporte", "j'apporte de l'eau à eux"),
        qUn(
          "Les enfants ont fêté l'anniversaire de ___ maman.",
          "maman",
          "ils n'ont qu'une maman",
        ),
        qPlusieurs(
          "Les deux sœurs rangent ___ jouets dans un grand coffre.",
          "jouets",
          "il y a beaucoup de jouets à ranger",
        ),
        qVerbe(
          "Quand je vois mes cousines, je ___ fais un gros bisou.",
          "fais",
          "je fais un gros bisou à elles",
        ),
        qUn(
          "Mes grands-parents habitent au bord de la mer, ___ maison est toute bleue.",
          "maison",
          "il y a une seule maison, qui « est » toute bleue",
        ),
        qPlusieurs(
          "Mes voisins ont planté des tomates : ___ plants poussent vite.",
          "plants",
          "il y a plusieurs plants, qui « poussent »",
        ),
        qVerbe("Les chats miaulent, Papa ___ donne à manger.", "donne", "Papa donne à manger à eux"),
        qUn(
          "Avant le match, les joueurs écoutent ___ entraîneur.",
          "entraîneur",
          "l'équipe a un seul entraîneur",
        ),
        qPlusieurs(
          "Les oiseaux nourrissent ___ petits, qui crient dans le nid.",
          "petits",
          "il y a plusieurs petits oiseaux, qui « crient »",
        ),
        qUn(
          "Les deux frères partagent ___ chambre.",
          "chambre",
          "ils partagent une seule chambre à deux",
        ),
        qVerbe(
          "Mes copains m'attendent, je ___ téléphone tout de suite.",
          "téléphone",
          "je téléphone à eux",
        ),
      ],
    },
  ],
};

export default donnees;
