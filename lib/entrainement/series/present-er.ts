import { qConj, sujet } from "../conjugaison";
import {
  CHANTER,
  COMMENCER,
  DANSER,
  DESSINER,
  ECOUTER,
  JOUER,
  LANCER,
  MANGER,
  NAGER,
  PARLER,
  PORTER,
  RANGER,
  REGARDER,
} from "../tableaux-conjugaison";
import type { DonneesNotion } from "../types";

// Série de saisie, tout au présent (le titre le dit). Une seule réponse par phrase.
// Verbes en -er réguliers seulement ; pièges : -ent (ils), -geons et -çons (nous).

const donnees: DonneesNotion = {
  notion: {
    id: "present-er",
    titre: "Le présent des verbes en -er",
    famille: "conjugaison",
    emoji: "🎵",
    fiche: "/fondamentaux/francais/present-er",
    mots: [],
  },
  series: [
    {
      id: "present-er-1",
      notion: "present-er",
      titre: "Le présent des verbes en -er - série 1",
      classes: ["ce1", "ce2"],
      microRegle:
        "Trouve qui fait l'action, puis ajoute la bonne fin au verbe : -e, -es, -e, -ons, -ez, -ent. Avec « ils », la fin -ent ne s'entend pas, mais il faut l'écrire.",
      nbQuestions: 10,
      questions: [
        qConj(CHANTER, "ils", "Les élèves ___ une chanson.", {
          sujet: sujet("les élèves", "ils", "Qui chante ?"),
          pourquoi: "Avec « ils », le verbe finit par -ent. On ne l'entend pas, mais il faut l'écrire !",
        }),
        qConj(MANGER, "nous", "Nous ___ à la cantine.", {
          pourquoi: "On garde le e : sans lui, « mangons » se lirait avec le g de « gâteau ».",
          erreurs: {
            mangons:
              "Il manque le e : sans lui, le g se lit comme dans « gâteau ». On écrit « mangeons ».",
          },
        }),
        qConj(JOUER, "tu", "Tu ___ au ballon dans la cour.", {
          pourquoi: "Avec « tu », il y a toujours un s à la fin.",
        }),
        qConj(REGARDER, "vous", "Vous ___ un film.", {
          pourquoi: "Avec « vous », la fin est toujours -ez.",
        }),
        qConj(DESSINER, "il", "Mon frère ___ un chat.", {
          sujet: sujet("mon frère", "il", "Qui dessine un chat ?"),
          pourquoi: "Pas de s à la fin avec « il ».",
        }),
        qConj(PARLER, "je", "Je ___ doucement.", {
          pourquoi: "Pas de s à la fin avec « je ».",
        }),
        qConj(COMMENCER, "nous", "Nous ___ la leçon.", {
          pourquoi: "On garde la cédille : sans elle, « commencons » se lirait avec le c de « cadeau ».",
          erreurs: {
            commencons:
              "Il manque la cédille : sans elle, le c se lit comme dans « cadeau ». On écrit « commençons ».",
          },
        }),
        qConj(RANGER, "ils", "Les enfants ___ leurs jouets.", {
          sujet: sujet("les enfants", "ils", "Qui range ses jouets ?"),
          pourquoi: "Avec « ils », la fin est toujours -ent.",
        }),
        qConj(ECOUTER, "je", "J'___ la maîtresse.", {
          pourquoi: "Devant une voyelle, « je » devient « j' ».",
        }),
        qConj(DANSER, "il", "Ma sœur ___ très bien.", {
          sujet: sujet("ma sœur", "elle", "Qui danse ?"),
          pourquoi: "Pas de s à la fin avec « elle ».",
        }),
        qConj(PORTER, "vous", "Vous ___ un sac lourd.", {
          pourquoi: "Avec « vous », la fin est toujours -ez.",
        }),
        qConj(NAGER, "tu", "Tu ___ très vite.", {
          pourquoi: "Avec « tu », il y a toujours un s à la fin.",
        }),
        qConj(JOUER, "nous", "Nous ___ dans le jardin.", {
          pourquoi: "Avec « nous », la fin est toujours -ons.",
        }),
        qConj(REGARDER, "ils", "Les chats ___ par la fenêtre.", {
          sujet: sujet("les chats", "ils", "Qui regarde par la fenêtre ?"),
          pourquoi: "Avec « ils », la fin est toujours -ent.",
        }),
        qConj(LANCER, "il", "Il ___ la balle.", {
          sujet: sujet("il", "il"),
          pourquoi: "Pas de s à la fin avec « il ».",
        }),
      ],
    },
  ],
};

export default donnees;
