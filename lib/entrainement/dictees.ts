import type { Dictee } from "./types";

// Les MP3 sont dans public/audio/dictees/<id>/ (voix Piper fr_FR-siwis-medium).
export const DICTEES: Dictee[] = [
  {
    id: "ce1-1",
    classe: "ce1",
    titre: "Les petits mots",
    notions: ["a-as-a", "on-ont", "pluriel-noms"],
    audioComplet: "/audio/dictees/ce1-1/complet.mp3",
    phrases: [
      {
        texte: "Léa a un chat à la maison.",
        audio: "/audio/dictees/ce1-1/01.mp3",
        aides: {
          a: "Tu peux dire « Léa avait un chat » ? Oui ! Alors on écrit a, sans accent.",
          à: "Tu peux dire « Léa a un chat avait la maison » ? Non, ça ne veut rien dire. Ici, à est un petit mot qui dit où : on écrit à, avec l'accent.",
          chat: "Chat finit par un t qu'on n'entend pas. Pense à « chaton » : là, on entend le t !",
          maison: "Maison s'écrit avec ai : m-ai-s-o-n.",
        },
      },
      {
        texte: "Les enfants ont des ballons dans la cour.",
        audio: "/audio/dictees/ce1-1/02.mp3",
        aides: {
          ont: "Tu peux dire « Les enfants avaient des ballons » ? Oui ! Alors on écrit ont, avec un t.",
          enfants: "Un enfant, des enfants : il y en a plusieurs, donc on ajoute un s. Le t est déjà dans le mot !",
          ballons: "Un ballon, des ballons : il y en a plusieurs, donc on ajoute un s. Ballon s'écrit avec deux l.",
          cour: "La cour de l'école : cour s'écrit sans s ni t à la fin.",
        },
      },
      {
        texte: "Demain, on va à la piscine.",
        audio: "/audio/dictees/ce1-1/03.mp3",
        aides: {
          on: "Tu peux dire « Demain, il va à la piscine » ? Oui ! Alors on écrit on, sans t.",
          à: "Tu peux dire « Demain, on va avait la piscine » ? Non, ça ne veut rien dire. Ici, à est un petit mot qui dit où on va : on écrit à, avec l'accent.",
          piscine: "Dans piscine, le son s s'écrit sc.",
        },
      },
      {
        texte: "Maman a des gâteaux sur la table.",
        audio: "/audio/dictees/ce1-1/04.mp3",
        aides: {
          a: "Tu peux dire « Maman avait des gâteaux » ? Oui ! Alors on écrit a, sans accent.",
          gâteaux: "Un gâteau, des gâteaux : les mots en -eau prennent un x au pluriel.",
          table: "Table finit par un e qu'on n'entend presque pas. Écris bien les deux lettres de la fin : -le.",
        },
      },
    ],
  },
  {
    id: "ce2-1",
    classe: "ce2",
    titre: "Au parc",
    notions: ["et-est"],
    audioComplet: "/audio/dictees/ce2-1/complet.mp3",
    phrases: [
      {
        texte: "Le parc est joli et très grand.",
        audio: "/audio/dictees/ce2-1/01.mp3",
        aides: {
          est: "Tu peux dire « Le parc était joli » ? Oui ! Alors on écrit est, avec s et t.",
          et: "Tu peux dire « joli était très grand » ? Non, ça ne veut rien dire. Ici, et relie deux mots, comme « et puis » : on écrit et.",
          joli: "On dit « un parc », c'est masculin. Donc joli s'écrit sans e. Avec e, c'est pour le féminin : une fleur jolie.",
          très: "Très s'écrit avec è, l'accent qui descend vers la gauche, comme dans près.",
          grand: "Grand finit par un d qu'on n'entend pas. Pense à « grande » : là, on entend le d !",
        },
      },
      {
        texte: "Paul et sa sœur jouent près du lac.",
        audio: "/audio/dictees/ce2-1/02.mp3",
        aides: {
          et: "Tu peux dire « Paul était sa sœur » ? Non. Ici, et veut dire « et aussi » : on écrit et.",
          jouent: "Qui joue ? Paul et sa sœur. Ils sont deux, c'est « ils ». Avec ils, le verbe finit par -ent. On ne l'entend pas, mais il faut l'écrire !",
          près: "Près s'écrit avec è, comme très et après.",
        },
      },
      {
        texte: "Le soleil est chaud.",
        audio: "/audio/dictees/ce2-1/03.mp3",
        aides: {
          est: "Tu peux dire « Le soleil était chaud » ? Oui ! Alors on écrit est.",
          soleil: "Soleil finit par -eil, comme réveil et pareil.",
          chaud: "Chaud finit par un d qu'on n'entend pas. Pense à « chaude » : là, on entend le d !",
        },
      },
      {
        texte: "Un canard nage et un oiseau chante.",
        audio: "/audio/dictees/ce2-1/04.mp3",
        aides: {
          et: "Tu peux dire « nage était un oiseau » ? Non. Ici, et relie deux actions : on écrit et.",
          canard: "Canard finit par un d qu'on n'entend pas, comme bavard.",
          nage: "Qui nage ? Un canard, il est tout seul. Donc pas de -nt : il nage.",
          oiseau: "Oiseau finit par -eau, comme bateau et gâteau.",
          chante: "Qui chante ? Un oiseau, il est tout seul. Donc pas de -nt : il chante.",
        },
      },
      {
        texte: "Maman est assise sur un banc.",
        audio: "/audio/dictees/ce2-1/05.mp3",
        aides: {
          est: "Tu peux dire « Maman était assise » ? Oui ! Alors on écrit est.",
          assise: "C'est Maman qui est assise. Maman est une fille, donc on ajoute un e : assise.",
          banc: "Banc finit par un c qu'on n'entend pas. Pense à « une banquette » : là, on entend le son k.",
        },
      },
    ],
  },
];

export function getDictee(id: string): Dictee | undefined {
  return DICTEES.find((d) => d.id === id);
}
