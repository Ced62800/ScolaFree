import type { DonneesNotion } from "../types";

// Notion on / ont : fiche d'identité + séries.
const donnees: DonneesNotion = {
  notion: {
    id: "on-ont",
    titre: "On / Ont",
    emoji: "👥",
    fiche: "/fondamentaux/francais/on-ont",
    mots: ["on", "ont"],
  },
  series: [
    {
      id: "on-ont-1",
      notion: "on-ont",
      titre: "On / Ont - série 1",
      classes: ["ce1", "ce2"],
      microRegle:
        "Si tu peux dire « avaient », écris ont. Si tu peux dire « il », écris on.",
      nbQuestions: 10,
      questions: [
        {
          phrase: "Mes cousins ___ un chien très gentil.",
          choix: ["on", "ont"],
          reponse: "ont",
          explication: "« Mes cousins avaient un chien » : ça marche, donc ont, le verbe avoir.",
          erreurs: {
            on: "Essaie avec « il » : « Mes cousins il un chien », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Ce soir, ___ mange des crêpes.",
          choix: ["on", "ont"],
          reponse: "on",
          explication: "« Ce soir, il mange des crêpes » : ça marche, donc on.",
          erreurs: {
            ont: "Essaie avec « avaient » : « Ce soir, avaient mange des crêpes », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Les enfants ___ fini leurs devoirs.",
          choix: ["on", "ont"],
          reponse: "ont",
          explication: "« Les enfants avaient fini leurs devoirs » : ça marche, donc ont.",
          erreurs: {
            on: "Essaie avec « il » : « Les enfants il fini », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Quand il pleut, ___ joue dans le salon.",
          choix: ["on", "ont"],
          reponse: "on",
          explication: "« Quand il pleut, il joue dans le salon » : ça marche, donc on.",
          erreurs: {
            ont: "Essaie avec « avaient » : « avaient joue dans le salon », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Mes parents ___ peint ma chambre en bleu.",
          choix: ["on", "ont"],
          reponse: "ont",
          explication: "« Mes parents avaient peint ma chambre » : ça marche, donc ont.",
          erreurs: {
            on: "Essaie avec « il » : « Mes parents il peint ma chambre », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Demain, ___ part en vacances !",
          choix: ["on", "ont"],
          reponse: "on",
          explication: "« Demain, il part en vacances » : ça marche, donc on.",
          erreurs: {
            ont: "Essaie avec « avaient » : « Demain, avaient part en vacances », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Les oiseaux ___ construit un nid.",
          choix: ["on", "ont"],
          reponse: "ont",
          explication: "« Les oiseaux avaient construit un nid » : ça marche, donc ont.",
          erreurs: {
            on: "Essaie avec « il » : « Les oiseaux il construit un nid », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Le soir, ___ entend la pluie sur le toit.",
          choix: ["on", "ont"],
          reponse: "on",
          explication: "« Le soir, il entend la pluie » : ça marche, donc on.",
          erreurs: {
            ont: "Essaie avec « avaient » : « Le soir, avaient entend la pluie », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Mes copines ___ gagné le match.",
          choix: ["on", "ont"],
          reponse: "ont",
          explication: "« Mes copines avaient gagné le match » : ça marche, donc ont.",
          erreurs: {
            on: "Essaie avec « il » : « Mes copines il gagné », ça ne veut rien dire.",
          },
        },
        {
          phrase: "À la cantine, ___ attend son tour.",
          choix: ["on", "ont"],
          reponse: "on",
          explication: "« À la cantine, il attend son tour » : ça marche, donc on.",
          erreurs: {
            ont: "Essaie avec « avaient » : « avaient attend son tour », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Les voisins ___ un grand jardin.",
          choix: ["on", "ont"],
          reponse: "ont",
          explication: "« Les voisins avaient un grand jardin » : ça marche, donc ont.",
          erreurs: {
            on: "Essaie avec « il » : « Les voisins il un grand jardin », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Au parc, ___ fait du toboggan.",
          choix: ["on", "ont"],
          reponse: "on",
          explication: "« Au parc, il fait du toboggan » : ça marche, donc on.",
          erreurs: {
            ont: "Essaie avec « avaient » : « Au parc, avaient fait du toboggan », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Tes amis ___ apporté un gâteau.",
          choix: ["on", "ont"],
          reponse: "ont",
          explication: "« Tes amis avaient apporté un gâteau » : ça marche, donc ont.",
          erreurs: {
            on: "Essaie avec « il » : « Tes amis il apporté un gâteau », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Avec Papi, ___ va à la pêche.",
          choix: ["on", "ont"],
          reponse: "on",
          explication: "« Avec Papi, il va à la pêche » : ça marche, donc on.",
          erreurs: {
            ont: "Essaie avec « avaient » : « Avec Papi, avaient va à la pêche », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Les élèves ___ chanté à la fête.",
          choix: ["on", "ont"],
          reponse: "ont",
          explication: "« Les élèves avaient chanté à la fête » : ça marche, donc ont.",
          erreurs: {
            on: "Essaie avec « il » : « Les élèves il chanté », ça ne veut rien dire.",
          },
        },
      ],
    },
  ],
};

export default donnees;
