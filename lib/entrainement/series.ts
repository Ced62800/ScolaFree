import type { Serie } from "./types";

export const SERIES: Serie[] = [
  {
    id: "et-est-1",
    notion: "et-est",
    titre: "Et / Est - série 1",
    classes: ["ce1", "ce2"],
    microRegle:
      "Si tu peux dire « était », écris est. Sinon, écris et.",
    nbQuestions: 10,
    questions: [
      {
        phrase: "Le gâteau ___ délicieux.",
        choix: ["et", "est"],
        reponse: "est",
        explication: "« Le gâteau était délicieux » : ça marche, donc est.",
      },
      {
        phrase: "Léa ___ Tom jouent au ballon.",
        choix: ["et", "est"],
        reponse: "et",
        explication: "« Léa était Tom » ne veut rien dire : et relie deux prénoms.",
      },
      {
        phrase: "Mon frère ___ malade aujourd'hui.",
        choix: ["et", "est"],
        reponse: "est",
        explication: "« Mon frère était malade » : ça marche, donc est.",
      },
      {
        phrase: "J'ai un crayon rouge ___ une gomme.",
        choix: ["et", "est"],
        reponse: "et",
        explication: "« un crayon rouge était une gomme » ne marche pas : et.",
      },
      {
        phrase: "La porte ___ ouverte.",
        choix: ["et", "est"],
        reponse: "est",
        explication: "« La porte était ouverte » : ça marche, donc est.",
      },
      {
        phrase: "Il saute ___ il crie de joie.",
        choix: ["et", "est"],
        reponse: "et",
        explication: "« Il saute était il crie » ne marche pas : et relie deux actions.",
      },
      {
        phrase: "Cette fleur ___ jaune.",
        choix: ["et", "est"],
        reponse: "est",
        explication: "« Cette fleur était jaune » : ça marche, donc est.",
      },
      {
        phrase: "Nous avons des pommes ___ des poires.",
        choix: ["et", "est"],
        reponse: "et",
        explication: "« des pommes était des poires » ne marche pas : et.",
      },
      {
        phrase: "Le bébé ___ endormi dans son lit.",
        choix: ["et", "est"],
        reponse: "est",
        explication: "« Le bébé était endormi » : ça marche, donc est.",
      },
      {
        phrase: "Le chat ___ le chien dorment ensemble.",
        choix: ["et", "est"],
        reponse: "et",
        explication: "« Le chat était le chien » ne veut rien dire : et.",
      },
      {
        phrase: "La soupe ___ trop chaude.",
        choix: ["et", "est"],
        reponse: "est",
        explication: "« La soupe était trop chaude » : ça marche, donc est.",
      },
      {
        phrase: "Elle prend son sac ___ elle part à l'école.",
        choix: ["et", "est"],
        reponse: "et",
        explication: "« Elle prend son sac était elle part » ne marche pas : et.",
      },
      {
        phrase: "Mon vélo ___ tout neuf.",
        choix: ["et", "est"],
        reponse: "est",
        explication: "« Mon vélo était tout neuf » : ça marche, donc est.",
      },
      {
        phrase: "Il fait froid ___ il neige.",
        choix: ["et", "est"],
        reponse: "et",
        explication: "« Il fait froid était il neige » ne marche pas : et.",
      },
      {
        phrase: "Mamie ___ contente de nous voir.",
        choix: ["et", "est"],
        reponse: "est",
        explication: "« Mamie était contente » : ça marche, donc est.",
      },
    ],
  },
];

export function getSerie(id: string): Serie | undefined {
  return SERIES.find((s) => s.id === id);
}

export function getSeriesPourNotion(notion: string): Serie[] {
  return SERIES.filter((s) => s.notion === notion);
}
