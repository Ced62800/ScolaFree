import type { DonneesNotion } from "../types";

const CHOIX = ["ces", "ses", "c'est", "s'est"];

// Notion ces / ses / c'est / s'est : fiche d'identité + séries.
const donnees: DonneesNotion = {
  notion: {
    id: "ces-ses",
    titre: "Ces / Ses / C'est / S'est",
    emoji: "🔄",
    fiche: "/fondamentaux/francais/ces-ses",
    mots: ["ces", "ses", "c'est", "s'est"],
  },
  series: [
    {
      id: "ces-ses-1",
      notion: "ces-ses",
      titre: "Ces / Ses / C'est / S'est - série 1",
      classes: ["ce2", "cm1"],
      microRegle:
        "Tu montres ? ces (« ces …-là »). C'est à lui ou à elle ? ses (« les siens »). Tu peux dire « cela est » ? c'est. Tu peux dire « s'était » ? s'est.",
      nbQuestions: 10,
      questions: [
        {
          phrase: "Le lapin dresse ___ oreilles.",
          choix: CHOIX,
          reponse: "ses",
          explication: "Les oreilles sont au lapin : ce sont « les siennes ». Donc ses.",
          erreurs: {
            ces: "Le mot ces sert à montrer. Ici, on ne montre pas : on dit à qui sont les oreilles, au lapin.",
            "c'est": "Essaie avec « cela est » : « Le lapin dresse cela est oreilles », ça ne veut rien dire.",
            "s'est": "Essaie avec « s'était » : « Le lapin dresse s'était oreilles », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Regarde ___ étoiles dans le ciel !",
          choix: CHOIX,
          reponse: "ces",
          explication: "Tu montres les étoiles : tu pourrais dire « ces étoiles-là ». Donc ces.",
          erreurs: {
            ses: "Les étoiles ne sont à personne : on ne peut pas dire « les siennes ». Ce n'est donc pas ses.",
            "c'est": "Essaie avec « cela est » : « Regarde cela est étoiles », ça ne veut rien dire.",
            "s'est": "Essaie avec « s'était » : « Regarde s'était étoiles », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Mardi, ___ mon jour préféré.",
          choix: CHOIX,
          reponse: "c'est",
          explication: "« Mardi, cela est mon jour préféré » : ça marche, donc c'est.",
          erreurs: {
            ces: "Le mot ces va devant un nom, comme « ces fleurs ». Ici, il serait suivi de « mon » : ça ne marche pas.",
            ses: "Le mot ses va devant un nom, comme « ses jouets ». Ici, il serait suivi de « mon » : ça ne marche pas.",
            "s'est": "Essaie avec « s'était » : « Mardi, s'était mon jour préféré », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Le chat ___ caché sous le lit.",
          choix: CHOIX,
          reponse: "s'est",
          explication: "« Le chat s'était caché » : ça marche, donc s'est.",
          erreurs: {
            ces: "Le mot ces va devant un nom. Ici, il serait suivi de « caché », qui n'est pas un nom.",
            ses: "Le mot ses va devant un nom. Ici, il serait suivi de « caché », qui n'est pas un nom.",
            "c'est": "Essaie avec « cela est » : « Le chat cela est caché », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Julie brosse ___ cheveux.",
          choix: CHOIX,
          reponse: "ses",
          explication: "Les cheveux sont à Julie : ce sont « les siens ». Donc ses.",
          erreurs: {
            ces: "Le mot ces sert à montrer. Ici, on ne montre pas : on dit à qui sont les cheveux, à Julie.",
            "c'est": "Essaie avec « cela est » : « Julie brosse cela est cheveux », ça ne veut rien dire.",
            "s'est": "Essaie avec « s'était » : « Julie brosse s'était cheveux », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Tu entends ___ oiseaux qui chantent ?",
          choix: CHOIX,
          reponse: "ces",
          explication: "Tu parles des oiseaux que tu entends : tu pourrais dire « ces oiseaux-là ». Donc ces.",
          erreurs: {
            ses: "Les oiseaux ne sont à personne : on ne peut pas dire « les siens ». Ce n'est donc pas ses.",
            "c'est": "Essaie avec « cela est » : « Tu entends cela est oiseaux », ça ne veut rien dire.",
            "s'est": "Essaie avec « s'était » : « Tu entends s'était oiseaux », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Viens voir, ___ trop drôle !",
          choix: CHOIX,
          reponse: "c'est",
          explication: "« Viens voir, cela est trop drôle » : ça marche, donc c'est.",
          erreurs: {
            ces: "Le mot ces va devant un nom. Ici, il serait suivi de « trop drôle », qui n'est pas un nom.",
            ses: "Le mot ses va devant un nom. Ici, il serait suivi de « trop drôle », qui n'est pas un nom.",
            "s'est": "Essaie avec « s'était » : « Viens voir, s'était trop drôle », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Ma sœur ___ levée très tôt.",
          choix: CHOIX,
          reponse: "s'est",
          explication: "« Ma sœur s'était levée très tôt » : ça marche, donc s'est.",
          erreurs: {
            ces: "Le mot ces va devant un nom. Ici, il serait suivi de « levée », qui n'est pas un nom.",
            ses: "Le mot ses va devant un nom. Ici, il serait suivi de « levée », qui n'est pas un nom.",
            "c'est": "Essaie avec « cela est » : « Ma sœur cela est levée », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Le bébé agite ___ petits pieds.",
          choix: CHOIX,
          reponse: "ses",
          explication: "Les pieds sont au bébé : ce sont « les siens ». Donc ses.",
          erreurs: {
            ces: "Le mot ces sert à montrer. Ici, on ne montre pas : on dit à qui sont les pieds, au bébé.",
            "c'est": "Essaie avec « cela est » : « Le bébé agite cela est petits pieds », ça ne veut rien dire.",
            "s'est": "Essaie avec « s'était » : « Le bébé agite s'était petits pieds », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Tu vois ___ nuages gris ? Il va pleuvoir.",
          choix: CHOIX,
          reponse: "ces",
          explication: "Tu montres les nuages : tu pourrais dire « ces nuages-là ». Donc ces.",
          erreurs: {
            ses: "Les nuages ne sont à personne : on ne peut pas dire « les siens ». Ce n'est donc pas ses.",
            "c'est": "Essaie avec « cela est » : « Tu vois cela est nuages gris », ça ne veut rien dire.",
            "s'est": "Essaie avec « s'était » : « Tu vois s'était nuages gris », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Écoute, ___ notre chanson !",
          choix: CHOIX,
          reponse: "c'est",
          explication: "« Écoute, cela est notre chanson » : ça marche, donc c'est.",
          erreurs: {
            ces: "Le mot ces va devant un nom, comme « ces fleurs ». Ici, il serait suivi de « notre » : ça ne marche pas.",
            ses: "Le mot ses va devant un nom, comme « ses jouets ». Ici, il serait suivi de « notre » : ça ne marche pas.",
            "s'est": "Essaie avec « s'était » : « Écoute, s'était notre chanson », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Le petit garçon ___ endormi dans la voiture.",
          choix: CHOIX,
          reponse: "s'est",
          explication: "« Le petit garçon s'était endormi » : ça marche, donc s'est.",
          erreurs: {
            ces: "Le mot ces va devant un nom. Ici, il serait suivi de « endormi », qui n'est pas un nom.",
            ses: "Le mot ses va devant un nom. Ici, il serait suivi de « endormi », qui n'est pas un nom.",
            "c'est": "Essaie avec « cela est » : « Le petit garçon cela est endormi », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Le coq ouvre ___ ailes.",
          choix: CHOIX,
          reponse: "ses",
          explication: "Les ailes sont au coq : ce sont « les siennes ». Donc ses.",
          erreurs: {
            ces: "Le mot ces sert à montrer. Ici, on ne montre pas : on dit à qui sont les ailes, au coq.",
            "c'est": "Essaie avec « cela est » : « Le coq ouvre cela est ailes », ça ne veut rien dire.",
            "s'est": "Essaie avec « s'était » : « Le coq ouvre s'était ailes », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Tu as vu ___ gros camions dans la rue ?",
          choix: CHOIX,
          reponse: "ces",
          explication: "Tu parles des camions que tu as vus : tu pourrais dire « ces camions-là ». Donc ces.",
          erreurs: {
            ses: "Les camions ne sont à personne dans la phrase : on ne peut pas dire « les siens ». Ce n'est donc pas ses.",
            "c'est": "Essaie avec « cela est » : « Tu as vu cela est gros camions », ça ne veut rien dire.",
            "s'est": "Essaie avec « s'était » : « Tu as vu s'était gros camions », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Vite, ___ l'heure du goûter !",
          choix: CHOIX,
          reponse: "c'est",
          explication: "« Vite, cela est l'heure du goûter » : ça marche, donc c'est.",
          erreurs: {
            ces: "« ces l'heure », ça ne se dit pas. Le mot ces va directement devant un nom, comme « ces heures ».",
            ses: "« ses l'heure », ça ne se dit pas. Le mot ses va directement devant un nom, comme « ses jouets ».",
            "s'est": "Essaie avec « s'était » : « Vite, s'était l'heure du goûter », ça ne veut rien dire.",
          },
        },
      ],
    },
  ],
};

export default donnees;
