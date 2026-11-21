import { qConj, sujet } from "../conjugaison";
import { AVOIR, ETRE } from "../tableaux-conjugaison";
import type { DonneesNotion } from "../types";

// Série de saisie, tout au présent (le titre le dit). Une seule réponse par phrase.
// Les messages « à », « et », « on », « son » relient la série aux séries d'homophones.

const A_ACCENT =
  "Tu as écrit à, avec un accent. Ici, c'est le verbe avoir : tu peux dire « il avait ». Donc a, sans accent.";

const donnees: DonneesNotion = {
  notion: {
    id: "etre-avoir",
    titre: "Être et avoir au présent",
    famille: "conjugaison",
    emoji: "🎭",
    fiche: "/fondamentaux/francais/etre-avoir",
    mots: [],
  },
  series: [
    {
      id: "etre-avoir-1",
      notion: "etre-avoir",
      titre: "Être et avoir au présent - série 1",
      classes: ["cp", "ce1"],
      microRegle:
        "Trouve qui fait l'action (je, tu, il, nous, vous, ils), puis écris la bonne forme. Ces deux verbes changent beaucoup : apprends-les par cœur. Pour est et a, essaie « il était » et « il avait ».",
      nbQuestions: 10,
      questions: [
        qConj(ETRE, "nous", "Nous ___ en classe.", {
          pourquoi: "Ce verbe change beaucoup, il faut l'apprendre par cœur.",
          erreurs: { somme: "Il manque le s : avec « nous », on écrit « sommes »." },
        }),
        qConj(AVOIR, "il", "Mon frère ___ un vélo.", {
          sujet: sujet("mon frère", "il", "Qui a un vélo ?"),
          pourquoi: "Tu peux dire « il avait » : ça marche, donc a, sans accent.",
          erreurs: { à: A_ACCENT },
        }),
        qConj(ETRE, "tu", "Tu ___ dans ma classe.", {
          pourquoi: "Pas de t avec « tu » : le t, c'est pour « il est ».",
        }),
        qConj(AVOIR, "ils", "Les enfants ___ faim.", {
          sujet: sujet("les enfants", "ils", "Qui a faim ?"),
          pourquoi: "Tu peux dire « ils avaient » : ça marche, donc ont, avec un t.",
          erreurs: {
            on: "Tu as écrit on. Ici, c'est le verbe avoir : tu peux dire « ils avaient ». Donc ont, avec un t.",
          },
        }),
        qConj(ETRE, "je", "Je ___ en retard.", {
          pourquoi: "C'est une forme à apprendre par cœur.",
        }),
        qConj(ETRE, "il", "Léa ___ à la maison.", {
          sujet: sujet("Léa", "elle", "Qui est à la maison ?"),
          pourquoi: "Tu peux dire « elle était » : ça marche, donc est, avec un s et un t.",
          erreurs: {
            et: "Tu as écrit et. Ici, c'est le verbe être : tu peux dire « elle était ». Donc est, avec un s et un t.",
          },
        }),
        qConj(AVOIR, "vous", "Vous ___ un beau chien.", {
          pourquoi: "La fin est -ez, comme pour la plupart des verbes.",
        }),
        qConj(ETRE, "ils", "Ils ___ au parc.", {
          sujet: sujet("ils", "ils"),
          pourquoi: "Tu peux dire « ils étaient » : ça marche, donc sont, avec un t.",
        }),
        qConj(AVOIR, "je", "J'___ sept ans.", {
          pourquoi: "Devant une voyelle, « je » devient « j' ».",
        }),
        qConj(AVOIR, "nous", "Nous ___ un chat.", {
          pourquoi: "La fin est -ons, comme pour la plupart des verbes.",
        }),
        qConj(AVOIR, "tu", "Tu ___ une belle robe.", {
          pourquoi: "Il y a un s à la fin. Sans s, c'est « il a ».",
        }),
        qConj(ETRE, "vous", "Vous ___ très gentils.", {
          pourquoi:
            "Attention, trois verbes ne finissent pas par -ez avec « vous » : vous êtes, vous faites, vous dites.",
        }),
        qConj(AVOIR, "il", "Maman ___ les clés.", {
          sujet: sujet("Maman", "elle", "Qui a les clés ?"),
          pourquoi: "Tu peux dire « elle avait » : ça marche, donc a, sans accent.",
          erreurs: { à: A_ACCENT },
        }),
        qConj(ETRE, "ils", "Les chiens ___ dans le jardin.", {
          sujet: sujet("les chiens", "ils", "Qui est dans le jardin ?"),
          pourquoi: "Tu peux dire « ils étaient » : ça marche, donc sont, avec un t.",
          erreurs: {
            son: "Tu as écrit son. Ici, c'est le verbe être : tu peux dire « ils étaient ». Donc sont, avec un t.",
          },
        }),
        qConj(AVOIR, "ils", "Mes parents ___ une voiture.", {
          sujet: sujet("mes parents", "ils", "Qui a une voiture ?"),
          pourquoi: "Tu peux dire « ils avaient » : ça marche, donc ont, avec un t.",
          erreurs: {
            on: "Tu as écrit on. Ici, c'est le verbe avoir : tu peux dire « ils avaient ». Donc ont, avec un t.",
          },
        }),
      ],
    },
  ],
};

export default donnees;
