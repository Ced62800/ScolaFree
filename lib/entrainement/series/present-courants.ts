import { qConj, sujet } from "../conjugaison";
import { ALLER, DIRE, FAIRE, PRENDRE, POUVOIR, VENIR } from "../tableaux-conjugaison";
import type { DonneesNotion } from "../types";

// Série de saisie, tout au présent (le titre le dit). Une seule réponse par phrase.
// Verbes de la 1re série : aller, faire, dire, venir, prendre, pouvoir.
// Vouloir et voir viendront dans une 2e série.

const TROIS_VERBES =
  "Attention, trois verbes ne finissent pas par -ez avec « vous » : vous êtes, vous faites, vous dites.";

const donnees: DonneesNotion = {
  notion: {
    id: "present-courants",
    titre: "Le présent des verbes courants",
    famille: "conjugaison",
    emoji: "🚶",
    fiche: "/fondamentaux/francais/present-courants",
    mots: [],
  },
  series: [
    {
      id: "present-courants-1",
      notion: "present-courants",
      titre: "Le présent des verbes courants - série 1",
      classes: ["ce2", "cm1", "cm2", "6eme"],
      microRegle:
        "Ces verbes changent beaucoup : apprends-les par cœur. Trouve qui fait l'action, puis écris la bonne forme. Attention, trois verbes ne finissent pas par -ez avec « vous » : vous êtes, vous faites, vous dites.",
      nbQuestions: 10,
      questions: [
        qConj(ALLER, "je", "Je ___ à l'école à pied.", {
          pourquoi: "Aller change beaucoup : je vais, tu vas, il va, nous allons, vous allez, ils vont.",
          erreurs: { vai: "Il manque le s à la fin : « vais »." },
        }),
        qConj(DIRE, "vous", "Vous ___ la vérité ?", {
          pourquoi: `Ce n'est pas « disez » ! ${TROIS_VERBES}`,
          erreurs: {
            disez:
              "Avec « vous », on n'écrit pas -ez après « dis ». On écrit « dites », comme « vous faites ».",
            dîtes:
              "Ce mot existe, mais dans un autre temps (le passé simple). Ici, au présent : « dites », sans accent.",
          },
        }),
        qConj(FAIRE, "nous", "Nous ___ un gâteau au chocolat.", {
          pourquoi: "Dans « faisons », on entend « e » mais on écrit ai.",
        }),
        qConj(VENIR, "ils", "Mes cousins ___ demain.", {
          sujet: sujet("mes cousins", "ils", "Qui vient demain ?"),
          pourquoi: "Attention : deux n, et -ent à la fin.",
          erreurs: { vienent: "Il faut deux n : « viennent »." },
        }),
        qConj(PRENDRE, "tu", "Tu ___ le bus ?", {
          pourquoi: "Avec « tu », il y a un s à la fin. « Il prend » finit par d, sans s.",
        }),
        qConj(POUVOIR, "il", "Elle ___ nous aider.", {
          sujet: sujet("elle", "elle"),
          pourquoi: "Avec « elle », il y a un t à la fin.",
        }),
        qConj(ALLER, "ils", "Les enfants ___ au parc.", {
          sujet: sujet("les enfants", "ils", "Qui va au parc ?"),
          pourquoi: "Aller change beaucoup : ici, on n'écrit pas -ent.",
          erreurs: { allent: "« allent » n'existe pas : avec « ils », aller fait « vont »." },
        }),
        qConj(FAIRE, "vous", "Vous ___ trop de bruit.", {
          pourquoi: `Ce n'est pas « faisez » ! ${TROIS_VERBES}`,
          erreurs: {
            faisez:
              "Avec « vous », on n'écrit pas -ez après « fais ». On écrit « faites », comme « vous dites ».",
            faîtes: "Ici, c'est le verbe faire : on écrit « faites », sans accent.",
          },
        }),
        qConj(DIRE, "il", "Mon père ___ toujours bonjour.", {
          sujet: sujet("mon père", "il", "Qui dit bonjour ?"),
          pourquoi: "Avec « il », il y a un t à la fin.",
        }),
        qConj(VENIR, "nous", "Nous ___ en voiture.", {
          pourquoi: "Il n'y a qu'un seul n, comme dans « venir ».",
        }),
        qConj(PRENDRE, "ils", "Mes amis ___ le train.", {
          sujet: sujet("mes amis", "ils", "Qui prend le train ?"),
          pourquoi: "Attention : deux n, et -ent à la fin.",
          erreurs: {
            prendent: "Il faut deux n, et pas de d : « prennent ».",
            prenent: "Il faut deux n : « prennent ».",
          },
        }),
        qConj(POUVOIR, "ils", "Ils ___ jouer dehors.", {
          sujet: sujet("ils", "ils"),
          pourquoi: "La forme change beaucoup : « peu- » devient « peuv- ».",
        }),
        qConj(ALLER, "tu", "Tu ___ bien ?", {
          pourquoi: "Avec « tu », il y a un s à la fin. « Il va » n'en a pas.",
        }),
        qConj(FAIRE, "ils", "Les élèves ___ un exercice.", {
          sujet: sujet("les élèves", "ils", "Qui fait un exercice ?"),
          pourquoi: "Faire change beaucoup : il faut apprendre « font » par cœur.",
          erreurs: { faisent: "« faisent » n'existe pas : avec « ils », faire fait « font »." },
        }),
        qConj(POUVOIR, "je", "Je ___ t'aider ?", {
          pourquoi: "Avec « je », il y a un x à la fin : je peux, tu peux.",
          erreurs: {
            peu: "Tu as écrit peu. Ici, c'est le verbe pouvoir : avec « je », on écrit « peux », avec un x.",
          },
        }),
      ],
    },
  ],
};

export default donnees;
