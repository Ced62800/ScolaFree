import type { DonneesNotion } from "../types";

// Notion son / sont : fiche d'identité + séries.
const donnees: DonneesNotion = {
  notion: {
    id: "son-sont",
    titre: "Son / Sont",
    famille: "homophones",
    emoji: "🔊",
    fiche: "/fondamentaux/francais/son-sont",
    mots: ["son", "sont"],
  },
  series: [
    {
      id: "son-sont-1",
      notion: "son-sont",
      titre: "Son / Sont - série 1",
      classes: ["ce2", "cm1"],
      microRegle:
        "Si tu peux dire « étaient », écris sont. Si tu peux dire « mon », écris son.",
      nbQuestions: 10,
      questions: [
        {
          phrase: "Lucas range ___ bureau.",
          choix: ["son", "sont"],
          reponse: "son",
          explication: "On peut dire « Lucas range mon bureau » : le bureau est à Lucas, donc son.",
          erreurs: {
            sont: "Essaie avec « étaient » : « Lucas range étaient bureau », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Les biscuits ___ dans la boîte.",
          choix: ["son", "sont"],
          reponse: "sont",
          explication: "« Les biscuits étaient dans la boîte » : ça marche, donc sont, le verbe être.",
          erreurs: {
            son: "Essaie avec « mon » : « Les biscuits mon dans la boîte », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Mes amis ___ venus à mon anniversaire.",
          choix: ["son", "sont"],
          reponse: "sont",
          explication: "« Mes amis étaient venus » : ça marche, donc sont.",
          erreurs: {
            son: "Essaie avec « mon » : « Mes amis mon venus », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Lina promène ___ chien après l'école.",
          choix: ["son", "sont"],
          reponse: "son",
          explication: "On peut dire « Lina promène mon chien » : le chien est à Lina, donc son.",
          erreurs: {
            sont: "Essaie avec « étaient » : « Lina promène étaient chien », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Les fenêtres ___ ouvertes.",
          choix: ["son", "sont"],
          reponse: "sont",
          explication: "« Les fenêtres étaient ouvertes » : ça marche, donc sont.",
          erreurs: {
            son: "Essaie avec « mon » : « Les fenêtres mon ouvertes », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Le bébé serre ___ doudou.",
          choix: ["son", "sont"],
          reponse: "son",
          explication: "On peut dire « Le bébé serre mon doudou » : le doudou est au bébé, donc son.",
          erreurs: {
            sont: "Essaie avec « étaient » : « Le bébé serre étaient doudou », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Mes chaussures ___ trop petites.",
          choix: ["son", "sont"],
          reponse: "sont",
          explication: "« Mes chaussures étaient trop petites » : ça marche, donc sont.",
          erreurs: {
            son: "Essaie avec « mon » : « Mes chaussures mon trop petites », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Hugo a cassé ___ crayon.",
          choix: ["son", "sont"],
          reponse: "son",
          explication: "On peut dire « Hugo a cassé mon crayon » : le crayon est à Hugo, donc son.",
          erreurs: {
            sont: "Essaie avec « étaient » : « Hugo a cassé étaient crayon », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Les pommes ___ mûres.",
          choix: ["son", "sont"],
          reponse: "sont",
          explication: "« Les pommes étaient mûres » : ça marche, donc sont.",
          erreurs: {
            son: "Essaie avec « mon » : « Les pommes mon mûres », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Chloé fête ___ anniversaire samedi.",
          choix: ["son", "sont"],
          reponse: "son",
          explication: "On peut dire « Chloé fête mon anniversaire » : c'est l'anniversaire de Chloé, donc son.",
          erreurs: {
            sont: "Essaie avec « étaient » : « Chloé fête étaient anniversaire », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Les lumières ___ éteintes.",
          choix: ["son", "sont"],
          reponse: "sont",
          explication: "« Les lumières étaient éteintes » : ça marche, donc sont.",
          erreurs: {
            son: "Essaie avec « mon » : « Les lumières mon éteintes », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Le facteur pose ___ vélo contre le mur.",
          choix: ["son", "sont"],
          reponse: "son",
          explication: "On peut dire « Le facteur pose mon vélo » : le vélo est au facteur, donc son.",
          erreurs: {
            sont: "Essaie avec « étaient » : « Le facteur pose étaient vélo », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Nos voisins ___ partis en voyage.",
          choix: ["son", "sont"],
          reponse: "sont",
          explication: "« Nos voisins étaient partis en voyage » : ça marche, donc sont.",
          erreurs: {
            son: "Essaie avec « mon » : « Nos voisins mon partis », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Mon frère cherche ___ ballon partout.",
          choix: ["son", "sont"],
          reponse: "son",
          explication: "On peut dire « Mon frère cherche mon ballon » : le ballon est à mon frère, donc son.",
          erreurs: {
            sont: "Essaie avec « étaient » : « Mon frère cherche étaient ballon », ça ne veut rien dire.",
          },
        },
        {
          phrase: "Les cartes ___ sur la table.",
          choix: ["son", "sont"],
          reponse: "sont",
          explication: "« Les cartes étaient sur la table » : ça marche, donc sont.",
          erreurs: {
            son: "Essaie avec « mon » : « Les cartes mon sur la table », ça ne veut rien dire.",
          },
        },
      ],
    },
  ],
};

export default donnees;
