import type { DonneesNotion, QuestionChoix } from "../types";

// Le trou remplace la fin du mot au pluriel. Pour les mots en -al,
// le singulier est donné entre parenthèses, sinon l'enfant ne voit pas le mot entier.
// On laisse de côté les exceptions aux exceptions (pneus, bleus, landaus, bals…).

const SX = ["s", "x"];
const LISTE_OU = "bijou, caillou, chou, genou, hibou, joujou, pou";

// Mot en -eau, -au ou -eu : x.
function qX(phrase: string, mot: string, fin: "-eau" | "-au" | "-eu"): QuestionChoix {
  return {
    phrase,
    choix: SX,
    reponse: "x",
    explication: `${majuscule(mot)} finit par ${fin}. Les mots en ${fin} prennent un x au pluriel : des ${mot}x.`,
    erreurs: {
      s: `Le s, c'est la règle la plus courante. Mais les mots en -eau, -au et -eu prennent un x : des ${mot}x.`,
    },
  };
}

// Mot ordinaire : s.
function qS(phrase: string, mot: string): QuestionChoix {
  return {
    phrase,
    choix: SX,
    reponse: "s",
    explication: `${majuscule(mot)} ne finit ni par -eau, -au, -eu, ni par -al. On ajoute simplement un s : des ${mot}s.`,
    erreurs: {
      x: `Le x est réservé aux mots en -eau, -au, -eu, et à 7 mots en -ou. ${majuscule(mot)} prend un s : des ${mot}s.`,
    },
  };
}

// Un des 7 mots en -ou qui prennent un x.
function qOuX(phrase: string, mot: string): QuestionChoix {
  return {
    phrase,
    choix: SX,
    reponse: "x",
    explication: `${majuscule(mot)} fait partie des 7 mots en -ou qui prennent un x : ${LISTE_OU}. Des ${mot}x.`,
    erreurs: {
      s: `D'habitude, les mots en -ou prennent un s. Mais ${mot} fait partie des 7 exceptions qui prennent un x : des ${mot}x.`,
    },
  };
}

// Un mot en -ou ordinaire : s.
function qOuS(phrase: string, mot: string): QuestionChoix {
  return {
    phrase,
    choix: SX,
    reponse: "s",
    explication: `${majuscule(mot)} finit par -ou, mais il n'est pas dans la liste des 7 mots qui prennent un x. Il suit la règle : des ${mot}s.`,
    erreurs: {
      x: `Seuls 7 mots en -ou prennent un x : ${LISTE_OU}. ${majuscule(mot)} n'en fait pas partie : des ${mot}s.`,
    },
  };
}

// Mot en -al : -aux. singulier = « animal », pluriel = « animaux ».
function qAux(phrase: string, singulier: string, pluriel: string): QuestionChoix {
  return {
    phrase,
    choix: ["als", "aux"],
    reponse: "aux",
    explication: `Un ${singulier} finit par -al. Au pluriel, -al devient -aux : des ${pluriel}.`,
    erreurs: {
      als: `Pour les mots en -al, on n'ajoute pas de s : -al devient -aux. Un ${singulier}, des ${pluriel}.`,
    },
  };
}

function majuscule(mot: string): string {
  return mot.charAt(0).toUpperCase() + mot.slice(1);
}

// Notion pluriel des noms : fiche d'identité + séries.
const donnees: DonneesNotion = {
  notion: {
    id: "pluriel-noms",
    titre: "Le pluriel des noms",
    famille: "accords",
    emoji: "📚",
    fiche: "/fondamentaux/francais/pluriel-noms",
    mots: [],
  },
  series: [
    {
      id: "pluriel-noms-1",
      notion: "pluriel-noms",
      titre: "Le pluriel des noms - série 1",
      classes: ["ce1", "ce2"],
      microRegle:
        "Au pluriel, on ajoute un s. Les mots en -eau, -au, -eu prennent un x. Les mots en -al deviennent -aux. Et 7 mots en -ou prennent un x : bijou, caillou, chou, genou, hibou, joujou, pou.",
      nbQuestions: 10,
      questions: [
        qX("Au port, il y a trois bateau___.", "bateau", "-eau"),
        qS("Léa a deux chat___ noirs.", "chat"),
        qAux("Au zoo, on a vu beaucoup d'anim___ (un animal).", "animal", "animaux"),
        qX("Les moineau___ picorent des miettes.", "moineau", "-eau"),
        qS("J'ai mis mes chaussure___ neuves.", "chaussure"),
        qX("Maman coupe les poireau___ pour la soupe.", "poireau", "-eau"),
        qX("Les cheveu___ de ma sœur sont longs.", "cheveu", "-eu"),
        qAux("Les poissons rouges nagent dans deux boc___ (un bocal).", "bocal", "bocaux"),
        qX("Nous avons joué à des jeu___ de société.", "jeu", "-eu"),
        qOuX("Tom s'est écorché les deux genou___.", "genou"),
        qOuS("Le chien a creusé des trou___ dans le jardin.", "trou"),
        qS("Mamie a planté des tulipe___ rouges.", "tulipe"),
        qAux("Il y a deux hôpit___ dans ma ville (un hôpital).", "hôpital", "hôpitaux"),
        qX("Les noyau___ de cerise sont durs.", "noyau", "-au"),
        qS("Les enfant___ jouent dans la cour.", "enfant"),
      ],
    },
  ],
};

export default donnees;
