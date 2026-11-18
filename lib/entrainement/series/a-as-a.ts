import type { DonneesNotion } from "../types";

// Notion a / as / à : fiche d'identité + séries.
const donnees: DonneesNotion = {
  notion: {
    id: "a-as-a",
    titre: "A / As / À",
    emoji: "✏️",
    fiche: "/fondamentaux/francais/a-as-a",
    mots: ["a", "as", "à"],
  },
  series: [
    {
      id: "a-as-a-1",
      notion: "a-as-a",
      titre: "A / As / À - série 1",
      classes: ["ce1", "ce2"],
      microRegle:
        "Si tu peux dire « avait », écris a. Avec « tu », si tu peux dire « avais », écris as. Sinon, écris à.",
      nbQuestions: 10,
      questions: [
        {
          phrase: "Tom ___ un nouveau cartable.",
          choix: ["a", "as", "à"],
          reponse: "a",
          explication: "« Tom avait un nouveau cartable » : ça marche, donc a, le verbe avoir.",
          erreurs: {
            as: "Le mot as va seulement avec « tu ». Ici, c'est Tom.",
            "à": "Ici, on peut dire « avait ». Quand « avait » marche, ce n'est jamais à.",
          },
        },
        {
          phrase: "Nous allons ___ la piscine mercredi.",
          choix: ["a", "as", "à"],
          reponse: "à",
          explication: "On ne peut pas dire « avait » ici. Le mot à dit où on va : à la piscine. Donc à, avec l'accent.",
          erreurs: {
            a: "Essaie avec « avait » : « Nous allons avait la piscine », ça ne veut rien dire.",
            as: "Le mot as va seulement avec « tu ». Ici, il n'y a pas de « tu ».",
          },
        },
        {
          phrase: "Tu ___ un joli dessin sur ton cahier.",
          choix: ["a", "as", "à"],
          reponse: "as",
          explication: "« Tu avais un joli dessin » : ça marche, et il y a « tu », donc as.",
          erreurs: {
            a: "Avec « tu », le verbe avoir prend un s : tu as, il a.",
            "à": "Ici, on peut dire « Tu avais un joli dessin ». C'est donc le verbe avoir, pas à.",
          },
        },
        {
          phrase: "Ma sœur ___ perdu sa dent.",
          choix: ["a", "as", "à"],
          reponse: "a",
          explication: "« Ma sœur avait perdu sa dent » : ça marche, donc a.",
          erreurs: {
            as: "Le mot as va seulement avec « tu ». Ici, c'est ma sœur.",
            "à": "Ici, on peut dire « avait ». Ce n'est donc pas à.",
          },
        },
        {
          phrase: "Je donne une carotte ___ mon lapin.",
          choix: ["a", "as", "à"],
          reponse: "à",
          explication: "On ne peut pas dire « avait » ici. Le mot à dit à qui on donne la carotte : à mon lapin.",
          erreurs: {
            a: "Essaie avec « avait » : « une carotte avait mon lapin », ça ne veut rien dire.",
            as: "Il n'y a pas de « tu » devant, et « avais » ne marche pas.",
          },
        },
        {
          phrase: "Est-ce que tu ___ faim ?",
          choix: ["a", "as", "à"],
          reponse: "as",
          explication: "« Est-ce que tu avais faim ? » : ça marche, et il y a « tu », donc as.",
          erreurs: {
            a: "Avec « tu », on écrit as : tu as faim, il a faim.",
            "à": "Ici, on peut dire « tu avais faim ». C'est le verbe avoir, pas à.",
          },
        },
        {
          phrase: "Papa ___ préparé une bonne soupe.",
          choix: ["a", "as", "à"],
          reponse: "a",
          explication: "« Papa avait préparé une bonne soupe » : ça marche, donc a.",
          erreurs: {
            as: "Le mot as va seulement avec « tu ». Ici, c'est Papa.",
            "à": "Ici, on peut dire « Papa avait préparé ». Ce n'est donc pas à.",
          },
        },
        {
          phrase: "Le chien dort ___ côté de la cheminée.",
          choix: ["a", "as", "à"],
          reponse: "à",
          explication: "On ne peut pas dire « avait » ici. « À côté de » dit où le chien dort : donc à.",
          erreurs: {
            a: "Essaie avec « avait » : « Le chien dort avait côté », ça ne veut rien dire.",
            as: "Il n'y a pas de « tu » devant, et « avais » ne marche pas.",
          },
        },
        {
          phrase: "Tu ___ oublié ta gourde !",
          choix: ["a", "as", "à"],
          reponse: "as",
          explication: "« Tu avais oublié ta gourde » : ça marche, et il y a « tu », donc as.",
          erreurs: {
            a: "Avec « tu », on écrit as : tu as oublié, il a oublié.",
            "à": "Ici, on peut dire « Tu avais oublié ». C'est le verbe avoir, pas à.",
          },
        },
        {
          phrase: "Léo ___ deux poissons rouges.",
          choix: ["a", "as", "à"],
          reponse: "a",
          explication: "« Léo avait deux poissons rouges » : ça marche, donc a.",
          erreurs: {
            as: "Le mot as va seulement avec « tu ». Ici, c'est Léo.",
            "à": "Ici, on peut dire « avait ». Ce n'est donc pas à.",
          },
        },
        {
          phrase: "On mange ___ midi.",
          choix: ["a", "as", "à"],
          reponse: "à",
          explication: "On ne peut pas dire « avait » ici. Le mot à dit l'heure : à midi. Donc à.",
          erreurs: {
            a: "Essaie avec « avait » : « On mange avait midi », ça ne veut rien dire.",
            as: "Il n'y a pas de « tu » devant, et « avais » ne marche pas.",
          },
        },
        {
          phrase: "Ce matin, tu ___ bien couru.",
          choix: ["a", "as", "à"],
          reponse: "as",
          explication: "« Ce matin, tu avais bien couru » : ça marche, et il y a « tu », donc as.",
          erreurs: {
            a: "Avec « tu », on écrit as : tu as couru, il a couru.",
            "à": "Ici, on peut dire « tu avais bien couru ». C'est le verbe avoir, pas à.",
          },
        },
        {
          phrase: "La maîtresse ___ lu une histoire.",
          choix: ["a", "as", "à"],
          reponse: "a",
          explication: "« La maîtresse avait lu une histoire » : ça marche, donc a.",
          erreurs: {
            as: "Le mot as va seulement avec « tu ». Ici, c'est la maîtresse.",
            "à": "Ici, on peut dire « avait ». Ce n'est donc pas à.",
          },
        },
        {
          phrase: "Ce soir, je vais ___ la fête de l'école.",
          choix: ["a", "as", "à"],
          reponse: "à",
          explication: "On ne peut pas dire « avait » ici. Le mot à dit où je vais : à la fête. Donc à.",
          erreurs: {
            a: "Essaie avec « avait » : « je vais avait la fête », ça ne veut rien dire.",
            as: "Le mot as va seulement avec « tu ». Ici, c'est « je », et « avais » ne marche pas.",
          },
        },
        {
          phrase: "Mon chat ___ grimpé dans l'arbre.",
          choix: ["a", "as", "à"],
          reponse: "a",
          explication: "« Mon chat avait grimpé dans l'arbre » : ça marche, donc a.",
          erreurs: {
            as: "Le mot as va seulement avec « tu ». Ici, c'est mon chat.",
            "à": "Ici, on peut dire « avait ». Ce n'est donc pas à.",
          },
        },
      ],
    },
  ],
};

export default donnees;
