import type { DonneesNotion, QuestionChoix } from "../types";

// Règles de rédaction :
// - adjectifs réguliers seulement (on ajoute e et s), jamais blanc/blanche,
//   beau/belle, gentil/gentille, ni d'adjectif qui finit déjà par s ou x (gris, heureux) ;
// - noms dont le genre est évident (jamais élève, enfant, camarade…) ;
// - jamais « des » + adjectif + nom (la règle écrite demande « de grands arbres »).

type Genre = "m" | "f";
type Nombre = "sg" | "pl";

// Pourquoi une forme fausse ne marche pas, d'après le genre et le nombre attendus.
function raisons(
  attendu: { genre: Genre; nombre: Nombre },
  donne: { genre: Genre; nombre: Nombre },
  unNom: string,
  det: string,
): string {
  const phrases: string[] = [];
  if (donne.genre !== attendu.genre) {
    phrases.push(
      attendu.genre === "f"
        ? `On dit « ${unNom} » : le nom est féminin, il faut un e.`
        : `On dit « ${unNom} » : le nom est masculin, pas de e.`,
    );
  }
  if (donne.nombre !== attendu.nombre) {
    phrases.push(
      attendu.nombre === "pl"
        ? `Avec « ${det} », il y en a plusieurs : il faut un s.`
        : `Il n'y en a ${attendu.genre === "f" ? "qu'une" : "qu'un"} : pas de s.`,
    );
  }
  return phrases.join(" ");
}

// Adjectif régulier : formes = [masculin, féminin, masculin pluriel, féminin pluriel].
// unNom = le nom avec « un » ou « une » (ex. « une robe »), det = le petit mot de la phrase,
// gn = le groupe nominal corrigé (ex. « une robe verte »).
function q4(
  phrase: string,
  formes: [string, string, string, string],
  genre: Genre,
  nombre: Nombre,
  unNom: string,
  det: string,
  gn: string,
): QuestionChoix {
  const cases: { genre: Genre; nombre: Nombre }[] = [
    { genre: "m", nombre: "sg" },
    { genre: "f", nombre: "sg" },
    { genre: "m", nombre: "pl" },
    { genre: "f", nombre: "pl" },
  ];
  const i = cases.findIndex((c) => c.genre === genre && c.nombre === nombre);
  const debut = `On dit « ${unNom} » : ${genre === "f" ? "féminin" : "masculin"}.`;
  const fin = {
    "m-sg": `Et il n'y en a qu'un. L'adjectif ne change pas : ${gn}.`,
    "f-sg": `Et il n'y en a qu'une. L'adjectif prend un e : ${gn}.`,
    "m-pl": `Avec « ${det} », ils sont plusieurs. L'adjectif prend un s : ${gn}.`,
    "f-pl": `Avec « ${det} », elles sont plusieurs. L'adjectif prend un e et un s : ${gn}.`,
  }[`${genre}-${nombre}`];
  const erreurs: Record<string, string> = {};
  formes.forEach((forme, j) => {
    if (j !== i) erreurs[forme] = raisons({ genre, nombre }, cases[j], unNom, det);
  });
  return { phrase, choix: [...formes], reponse: formes[i], explication: `${debut} ${fin}`, erreurs };
}

// Adjectif qui finit déjà par e (rouge, jaune) : seulement le s du pluriel.
function q2(
  phrase: string,
  adjectif: string,
  nombre: Nombre,
  det: string,
  gn: string,
): QuestionChoix {
  const pluriel = `${adjectif}s`;
  const rappel = `${adjectif.charAt(0).toUpperCase() + adjectif.slice(1)} finit déjà par e : on n'en ajoute jamais d'autre.`;
  return nombre === "pl"
    ? {
        phrase,
        choix: [adjectif, pluriel],
        reponse: pluriel,
        explication: `Avec « ${det} », il y en a plusieurs : on ajoute un s. ${rappel} Donc ${gn}.`,
        erreurs: { [adjectif]: `Avec « ${det} », il y en a plusieurs : l'adjectif prend un s, lui aussi.` },
      }
    : {
        phrase,
        choix: [adjectif, pluriel],
        reponse: adjectif,
        explication: `Avec « ${det} », il n'y en a qu'un : pas de s. ${rappel} Donc ${gn}.`,
        erreurs: { [pluriel]: `Avec « ${det} », il n'y en a qu'un : pas de s.` },
      };
}

// Notion accord dans le groupe nominal : fiche d'identité + séries.
const donnees: DonneesNotion = {
  notion: {
    id: "accord-groupe-nominal",
    titre: "L'accord dans le groupe nominal",
    famille: "accords",
    emoji: "🤝",
    fiche: "/fondamentaux/francais/accord-groupe-nominal",
    mots: [],
  },
  series: [
    {
      id: "accord-groupe-nominal-1",
      notion: "accord-groupe-nominal",
      titre: "L'accord dans le groupe nominal - série 1",
      classes: ["ce1", "ce2", "cm1"],
      microRegle:
        "Dis « un » ou « une » devant le nom : avec une, l'adjectif prend un e. Avec les ou des, il prend un s. Les deux : es. S'il finit déjà par e, n'en ajoute pas d'autre.",
      nbQuestions: 10,
      questions: [
        q4("Ma sœur porte une robe ___.", ["vert", "verte", "verts", "vertes"], "f", "sg", "une robe", "une", "une robe verte"),
        q4("Les ___ chiens jouent dans le jardin.", ["petit", "petite", "petits", "petites"], "m", "pl", "un chien", "les", "les petits chiens"),
        q2("J'ai cueilli des fleurs ___.", "rouge", "pl", "des", "des fleurs rouges"),
        q4("Papa a un ___ parapluie.", ["grand", "grande", "grands", "grandes"], "m", "sg", "un parapluie", "un", "un grand parapluie"),
        q4("Mamie a tricoté une écharpe ___.", ["chaud", "chaude", "chauds", "chaudes"], "f", "sg", "une écharpe", "une", "une écharpe chaude"),
        q4("Les tomates ___ sont dans le panier.", ["mûr", "mûre", "mûrs", "mûres"], "f", "pl", "une tomate", "les", "les tomates mûres"),
        q4("Le chat a des oreilles ___.", ["pointu", "pointue", "pointus", "pointues"], "f", "pl", "une oreille", "des", "des oreilles pointues"),
        q4("Mon frère a des cheveux ___.", ["noir", "noire", "noirs", "noires"], "m", "pl", "un cheveu", "des", "des cheveux noirs"),
        q4("Léo joue avec une ___ voiture.", ["joli", "jolie", "jolis", "jolies"], "f", "sg", "une voiture", "une", "une jolie voiture"),
        q4("Les ballons ___ montent dans le ciel.", ["bleu", "bleue", "bleus", "bleues"], "m", "pl", "un ballon", "les", "les ballons bleus"),
        q4("Après le sport, je bois un jus ___.", ["froid", "froide", "froids", "froides"], "m", "sg", "un jus", "un", "un jus froid"),
        q2("Mon cousin porte un pull ___.", "rouge", "sg", "un", "un pull rouge"),
        q4("Maman a acheté une table ___.", ["rond", "ronde", "ronds", "rondes"], "f", "sg", "une table", "une", "une table ronde"),
        q4("Les crêpes ___ sont mes préférées.", ["sucré", "sucrée", "sucrés", "sucrées"], "f", "pl", "une crêpe", "les", "les crêpes sucrées"),
        q2("Au marché, j'ai vu des citrons ___.", "jaune", "pl", "des", "des citrons jaunes"),
      ],
    },
  ],
};

export default donnees;
