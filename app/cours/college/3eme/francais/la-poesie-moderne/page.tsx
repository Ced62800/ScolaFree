"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "francais";
const THEME = "la-poesie-moderne";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type Question = {
  question: string;
  options: string[];
  answer: string;
  fiche: { regle: string; exemple: string; piege: string; astuce: string };
};

const questionsBase: Question[] = [
  {
    question: "Qu'est-ce que le vers libre ?",
    options: [
      "Un vers qui ne respecte aucune règle de longueur ni de rime",
      "Un vers de 12 syllabes sans rime",
      "Un vers traduit librement d'une autre langue",
      "Un vers anonyme sans auteur connu",
    ],
    answer: "Un vers qui ne respecte aucune règle de longueur ni de rime",
    fiche: {
      regle:
        "Le vers libre, apparu à la fin du XIXe siècle, rompt avec les contraintes classiques : pas de rime obligatoire, pas de longueur fixe, pas de régularité rythmique. Il libère le poète des règles traditionnelles pour privilégier l'expression.",
      exemple:
        "✅ Guillaume Apollinaire, Pablo Neruda, Jacques Prévert utilisent le vers libre. 'Le Pont Mirabeau' d'Apollinaire mêle vers libres et rimes.",
      piege:
        "Vers libre ne signifie pas que le poème est sans travail ! Le poète choisit soigneusement chaque mot, chaque image, chaque rupture de ligne.",
      astuce:
        "Vers libre = liberté de forme. Pas de compte de syllabes, pas de rime obligatoire. Mais le fond (images, émotions) reste très travaillé.",
    },
  },
  {
    question: "Qu'est-ce que le surréalisme en poésie ?",
    options: [
      "Un mouvement qui décrit la réalité avec précision",
      "Un mouvement qui explore l'inconscient et le rêve pour créer des images insolites",
      "Un mouvement qui revient aux formes classiques",
      "Un mouvement uniquement pictural",
    ],
    answer:
      "Un mouvement qui explore l'inconscient et le rêve pour créer des images insolites",
    fiche: {
      regle:
        "Le surréalisme (années 1920-1940, André Breton) cherche à dépasser la réalité en explorant l'inconscient, le rêve et les associations libres. Il produit des images inattendues, parfois choquantes ou absurdes.",
      exemple:
        "✅ Paul Eluard : 'La terre est bleue comme une orange' — image surréaliste par excellence. Robert Desnos, René Char participent au mouvement.",
      piege:
        "Surréaliste ne veut pas dire 'bizarre sans raison'. Les images surréalistes ont une logique émotionnelle et inconsciente, même si elle semble irrationnelle.",
      astuce:
        "Surréalisme = au-delà du réel. Inconscient + rêve + associations libres = images inattendues. André Breton = fondateur.",
    },
  },
  {
    question: "Qu'est-ce qu'une métaphore filée ?",
    options: [
      "Une métaphore très courte",
      "Une métaphore développée sur plusieurs vers ou tout un poème",
      "Une comparaison avec 'comme'",
      "Une image empruntée à un autre poète",
    ],
    answer: "Une métaphore développée sur plusieurs vers ou tout un poème",
    fiche: {
      regle:
        "La métaphore filée est une métaphore qui se prolonge et se développe tout au long d'un passage ou d'un poème entier. Elle crée une cohérence imageante et approfondit la comparaison initiale.",
      exemple:
        "✅ Si un poème compare la vie à un voyage depuis le début jusqu'à la fin (départ, route, obstacles, arrivée), c'est une métaphore filée du voyage.",
      piege:
        "Métaphore filée ≠ simple métaphore. La métaphore filée revient et se développe. Une seule métaphore isolée n'est pas filée.",
      astuce:
        "Filée = qui se prolonge, comme un fil. Si l'image revient plusieurs fois et s'enrichit, c'est une métaphore filée.",
    },
  },
  {
    question: "Qu'est-ce que l'anaphore dans un poème ?",
    options: [
      "La répétition d'un mot ou groupe de mots en début de vers",
      "La rime entre deux vers",
      "Un retour en arrière dans le poème",
      "La dernière strophe d'un poème",
    ],
    answer: "La répétition d'un mot ou groupe de mots en début de vers",
    fiche: {
      regle:
        "L'anaphore est une figure de style qui consiste à répéter un même mot ou groupe de mots au début de plusieurs vers ou phrases consécutifs. Elle crée un effet d'insistance et de rythme.",
      exemple:
        "✅ 'Je t'aime pour ta sagesse / Je t'aime pour ta beauté / Je t'aime pour ton silence' — 'Je t'aime' est une anaphore.",
      piege:
        "Anaphore ≠ refrain. L'anaphore répète en début de vers/phrase. Le refrain est une strophe entière qui revient dans une chanson ou un poème.",
      astuce:
        "Anaphore = répétition en DEBUT de vers. Ana = en arrière, retour. Crée insistance et rythme martelé.",
    },
  },
  {
    question: "Qu'est-ce que la poésie engagée ?",
    options: [
      "Une poésie d'amour très intense",
      "Une poésie qui prend position sur des questions politiques ou sociales",
      "Une poésie réservée aux adultes",
      "Une poésie écrite lors d'un concours",
    ],
    answer:
      "Une poésie qui prend position sur des questions politiques ou sociales",
    fiche: {
      regle:
        "La poésie engagée utilise la forme poétique pour défendre une cause, critiquer l'injustice, dénoncer la guerre ou l'oppression. Le poète devient une voix politique et sociale.",
      exemple:
        "✅ Paul Eluard 'Liberté' (Résistance). Louis Aragon 'La Rose et le Réséda'. Aimé Césaire et la négritude. Pablo Neruda contre la dictature.",
      piege:
        "Poésie engagée ≠ propagande. Le poète exprime sa vision avec des images et une forme travaillée, pas avec des slogans simplistes.",
      astuce:
        "Engagée = le poète s'engage, prend position. Résistance, liberté, justice sociale = thèmes classiques. Eluard, Aragon, Césaire = figures majeures.",
    },
  },
  {
    question: "Qu'est-ce que le calligramme ?",
    options: [
      "Un poème chanté",
      "Un poème dont la disposition visuelle forme une image en rapport avec le sujet",
      "Un poème sans ponctuation",
      "Un poème traduit en plusieurs langues",
    ],
    answer:
      "Un poème dont la disposition visuelle forme une image en rapport avec le sujet",
    fiche: {
      regle:
        "Le calligramme est un poème dont les mots sont disposés de façon à former une image visuelle liée au sujet du poème. Guillaume Apollinaire est le maître du calligramme.",
      exemple:
        "✅ Apollinaire a écrit des calligrammes en forme de Tour Eiffel, de pluie, de coeur. Les mots forment l'image qu'ils décrivent.",
      piege:
        "Calligramme ≠ simple illustration. Le texte LUI-MEME forme l'image. Ce n'est pas une image ajoutée à côté du poème.",
      astuce:
        "Calligramme = calli (beau) + gramme (écriture). Les mots SONT l'image. Apollinaire = le créateur du terme et du genre moderne.",
    },
  },
  {
    question: "Qu'est-ce que l'enjambement dans un poème ?",
    options: [
      "Une rime entre deux strophes éloignées",
      "Le fait qu'une phrase se poursuit au-delà de la fin d'un vers",
      "Un vers plus long que les autres",
      "La répétition du même vers en fin de strophe",
    ],
    answer: "Le fait qu'une phrase se poursuit au-delà de la fin d'un vers",
    fiche: {
      regle:
        "L'enjambement se produit quand une phrase ou un groupe syntaxique déborde sur le vers suivant, sans pause à la fin du vers. Il crée un effet de fluidité, de mouvement ou de surprise.",
      exemple:
        "✅ 'Le vent se lève... il faut / Tenter de vivre !' (Valéry) — la phrase enjambe du premier au deuxième vers, créant un effet de suspense.",
      piege:
        "Enjambement ≠ rejet. Le rejet est le petit élément qui passe au vers suivant. L'enjambement désigne le procédé global de débordement.",
      astuce:
        "Enjambement = la phrase 'enjambe' la fin du vers pour continuer. Crée fluidité ou rupture selon l'effet voulu.",
    },
  },
  {
    question: "Qu'est-ce que la synesthésie en poésie ?",
    options: [
      "La répétition de sons identiques",
      "L'association de sensations appartenant à des sens différents",
      "La description d'un paysage naturel",
      "Un poème écrit à plusieurs voix",
    ],
    answer: "L'association de sensations appartenant à des sens différents",
    fiche: {
      regle:
        "La synesthésie consiste à décrire une sensation d'un sens par un autre sens (ex: une couleur qui a un son, un parfum qui a une couleur). Baudelaire et Rimbaud sont maîtres de ce procédé.",
      exemple:
        "✅ Rimbaud 'Voyelles' : 'A noir, E blanc, I rouge...' attribue des couleurs à des sons. Baudelaire : 'Les parfums, les couleurs et les sons se répondent.'",
      piege:
        "Synesthésie ≠ métaphore simple. C'est spécifiquement un croisement entre deux SENS différents (vue + ouïe, odorat + couleur, etc.).",
      astuce:
        "Synesthésie = mélange de sens. Vue + ouïe, odorat + couleur. Rimbaud colore les voyelles. Baudelaire : 'Correspondances'.",
    },
  },
  {
    question: "Qu'est-ce que la poésie de la négritude ?",
    options: [
      "Un mouvement poétique africain du Moyen Age",
      "Un mouvement littéraire affirmant la valeur des cultures et identités noires",
      "Un mouvement contre la poésie classique française",
      "Un courant poétique uniquement américain",
    ],
    answer:
      "Un mouvement littéraire affirmant la valeur des cultures et identités noires",
    fiche: {
      regle:
        "La négritude est un mouvement littéraire et politique né dans les années 1930 parmi des écrivains africains et antillais francophones. Il affirme la fierté de l'identité noire, dénonce le colonialisme et revendique les cultures africaines.",
      exemple:
        "✅ Aimé Césaire (Martinique), Léopold Sédar Senghor (Sénégal), Léon-Gontran Damas (Guyane) sont les trois pères de la négritude.",
      piege:
        "Négritude ne désigne pas une origine géographique unique. C'est un mouvement d'affirmation culturelle et politique transatlantique.",
      astuce:
        "Négritude = fierté + identité + résistance. Césaire + Senghor + Damas = les trois fondateurs. Contre le colonialisme et l'assimilation forcée.",
    },
  },
  {
    question: "Qu'est-ce que le poème en prose ?",
    options: [
      "Un poème très long",
      "Un texte en prose qui possède les qualités poétiques (images, rythme, musicalité) sans vers",
      "Un poème traduit en prose",
      "Un texte narratif avec des rimes",
    ],
    answer:
      "Un texte en prose qui possède les qualités poétiques (images, rythme, musicalité) sans vers",
    fiche: {
      regle:
        "Le poème en prose est un texte sans vers ni rime qui possède néanmoins des qualités poétiques : richesse des images, travail du rythme, musicalité, densité du langage. Aloysius Bertrand et Baudelaire l'ont inventé.",
      exemple:
        "✅ Baudelaire 'Petits Poèmes en prose' ('Le Spleen de Paris'). Rimbaud 'Les Illuminations'. Textes courts, denses, poétiques mais sans vers.",
      piege:
        "Poème en prose ≠ paragraphe ordinaire. La prose devient poétique par la densité des images, la musicalité et le travail du langage.",
      astuce:
        "Poème en prose = forme prose + essence poésie. Pas de vers, mais rythme + images + musicalité. Baudelaire = le maître du genre.",
    },
  },
];

export default function LaPoesieModernePage() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useContext(DecouverteContext);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [etape, setEtape] = useState<"intro" | "quiz" | "resultat">("intro");
  const [index, setIndex] = useState(0);
  const [reponseChoisie, setReponseChoisie] = useState<string | null>(null);
  const [estCorrecte, setEstCorrecte] = useState<boolean | null>(null);
  const [ficheOuverte, setFicheOuverte] = useState(false);
  const [ficheObligatoireLue, setFicheObligatoireLue] = useState(true);
  const [bestScore, setBestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [lastScore, setLastScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const scoreRef = useRef(0);
  const scoreSaved = useRef(false);
  const fautesRef = useRef(0);

  useEffect(() => {
    if (estConnecte) {
      getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
      getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
    }
  }, [estConnecte]);

  const demarrer = () => {
    const q = shuffleArray(questionsBase)
      .slice(0, maxQuestions)
      .map((q) => ({ ...q, options: shuffleArray(q.options) }));
    setQuestions(q);
    scoreRef.current = 0;
    fautesRef.current = 0;
    scoreSaved.current = false;
    setIndex(0);
    setReponseChoisie(null);
    setEstCorrecte(null);
    setFicheOuverte(false);
    setFicheObligatoireLue(true);
    setEtape("quiz");
  };

  const choisirReponse = (option: string) => {
    if (reponseChoisie) return;
    setReponseChoisie(option);
    const correct = option === questions[index].answer;
    setEstCorrecte(correct);
    if (correct) {
      scoreRef.current += 1;
    } else {
      fautesRef.current += 1;
      if (fautesRef.current === 1) setFicheOuverte(true);
      if (fautesRef.current === 6) setFicheObligatoireLue(false);
    }
  };

  const questionSuivante = async () => {
    setFicheOuverte(false);
    if (index + 1 >= questions.length) {
      if (!scoreSaved.current && estConnecte) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score: scoreRef.current,
          total: questions.length,
        });
        getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
        getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
      }
      setEtape("resultat");
    } else {
      setIndex(index + 1);
      setReponseChoisie(null);
      setEstCorrecte(null);
    }
  };

  const total = questions.length;
  const est6emeFaute = fautesRef.current >= 6;
  const boutonBloque = !estCorrecte && est6emeFaute && !ficheObligatoireLue;

  if (etape === "intro")
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">✍️ Français — 3ème</div>
          <h1 className="lecon-titre">La poésie moderne</h1>
          {!estConnecte && (
            <div
              style={{
                background: "rgba(79,142,247,0.1)",
                border: "1px solid rgba(79,142,247,0.3)",
                borderRadius: "10px",
                padding: "10px 16px",
                marginBottom: "16px",
                fontSize: "0.85rem",
                color: "#aaa",
                textAlign: "center",
              }}
            >
              📖 Mode découverte — 5 questions ·{" "}
              <span
                onClick={() => router.push("/inscription")}
                style={{ color: "#4f8ef7", cursor: "pointer", fontWeight: 700 }}
              >
                Inscris-toi
              </span>{" "}
              pour les 10 questions complètes !
            </div>
          )}
          <div className="lecon-intro">
            En 3ème, tu explores la <strong>poésie moderne</strong> : vers
            libre, surréalisme, poésie engagée, calligrammes et grandes figures
            du XXe siècle comme Apollinaire, Eluard et Césaire.
          </div>
          {estConnecte && (bestScore || lastScore) && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(46,196,182,0.1)",
                    border: "1px solid rgba(46,196,182,0.3)",
                    borderRadius: "12px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    🏆 Meilleur score
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#2ec4b6",
                    }}
                  >
                    {bestScore.score}/{bestScore.total}
                  </div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    🕐 Dernier score
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#4f8ef7",
                    }}
                  >
                    {lastScore.score}/{lastScore.total}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="lecon-points">
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🆓 Vers libre et formes modernes
              </div>
              <div className="lecon-point-texte">
                Le vers libre rompt avec les contraintes classiques. Le
                calligramme (Apollinaire) forme une image avec les mots. Le
                poème en prose (Baudelaire) est poétique sans vers.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Apollinaire :
                calligramme en forme de Tour Eiffel. Baudelaire : 'Petits Poèmes
                en prose'.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🌀 Surréalisme et images insolites
              </div>
              <div className="lecon-point-texte">
                Le surréalisme (Breton, Eluard, Desnos) explore l'inconscient et
                le rêve. Les images sont inattendues, irrationnelles mais
                chargées d'émotion.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Eluard : 'La
                terre est bleue comme une orange.' Rimbaud : 'Voyelles' —
                couleurs des sons.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ✊ Poésie engagée et négritude
              </div>
              <div className="lecon-point-texte">
                La poésie engagée (Eluard, Aragon) dénonce l'injustice. La
                négritude (Césaire, Senghor) affirme la fierté des cultures
                noires et résiste au colonialisme.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Eluard
                'Liberté' (Résistance). Césaire 'Cahier d'un retour au pays
                natal' (négritude).
              </div>
            </div>
          </div>
          <button className="lecon-btn" onClick={demarrer}>
            🚀 Commencer les exercices →
          </button>
        </div>
      </div>
    );

  if (etape === "quiz" && questions.length > 0) {
    const q = questions[index];
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="progression-wrapper">
          <div className="progression-info">
            <span>
              Question {index + 1} / {total}
            </span>
            <span>
              {scoreRef.current} bonne{scoreRef.current > 1 ? "s" : ""} réponse
              {scoreRef.current > 1 ? "s" : ""}
            </span>
          </div>
          <div className="progression-bar">
            <div
              className="progression-fill"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>
        <div className="qcm-wrapper">
          <div className="qcm-question">{q.question}</div>
          <div className="qcm-options">
            {q.options.map((option) => {
              let cn = "qcm-option";
              if (reponseChoisie) {
                if (option === q.answer) cn += " correct";
                else if (option === reponseChoisie) cn += " incorrect";
                else cn += " disabled";
              }
              return (
                <button
                  key={option}
                  className={cn}
                  onClick={() => choisirReponse(option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {reponseChoisie && (
            <div
              className={`qcm-feedback ${estCorrecte ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <span className="feedback-icon">{estCorrecte ? "✅" : "❌"}</span>
              <div className="feedback-texte">
                <strong>
                  {estCorrecte ? "Bravo !" : "Pas tout à fait..."}
                </strong>
                <p>
                  {estCorrecte
                    ? "Excellente réponse !"
                    : `La bonne réponse est : "${q.answer}"`}
                </p>
                {!estCorrecte && est6emeFaute && !ficheObligatoireLue && (
                  <div
                    style={{
                      marginTop: "10px",
                      background: "rgba(255,209,102,0.15)",
                      border: "1px solid rgba(255,209,102,0.4)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                    }}
                  >
                    <p
                      style={{
                        color: "#ffd166",
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      😅 6 erreurs !
                    </p>
                    <p style={{ color: "#ddd", fontSize: "0.85rem" }}>
                      Relis la fiche avant de continuer ! 💪
                    </p>
                  </div>
                )}
                {!estCorrecte && (
                  <button
                    onClick={() => setFicheOuverte(true)}
                    style={{
                      marginTop: "10px",
                      background: "rgba(255,209,102,0.2)",
                      border: "1px solid rgba(255,209,102,0.4)",
                      borderRadius: "8px",
                      padding: "6px 14px",
                      color: "#ffd166",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    📖 Voir la fiche pédagogique
                  </button>
                )}
              </div>
            </div>
          )}
          {reponseChoisie && (
            <div style={{ marginTop: "16px" }}>
              {boutonBloque && (
                <p
                  style={{
                    textAlign: "center",
                    color: "#ffd166",
                    fontSize: "0.85rem",
                    marginBottom: "8px",
                  }}
                >
                  📖 Lis la fiche pour débloquer !
                </p>
              )}
              <button
                className="lecon-btn"
                onClick={questionSuivante}
                disabled={boutonBloque}
                style={{
                  opacity: boutonBloque ? 0.4 : 1,
                  cursor: boutonBloque ? "not-allowed" : "pointer",
                }}
              >
                {index + 1 >= total
                  ? "Voir mon résultat →"
                  : "Question suivante →"}
              </button>
            </div>
          )}
        </div>
        {ficheOuverte && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1a1a2e, #16213e)",
                border: "1px solid rgba(255,209,102,0.4)",
                borderRadius: "20px",
                padding: "28px",
                maxWidth: "500px",
                width: "100%",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "#ffd166",
                  marginBottom: "20px",
                }}
              >
                📖 Fiche pédagogique
              </div>
              <div
                style={{
                  marginBottom: "16px",
                  background: "rgba(79,142,247,0.1)",
                  border: "1px solid rgba(79,142,247,0.3)",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#4f8ef7",
                    fontWeight: 700,
                    marginBottom: "6px",
                    textTransform: "uppercase",
                  }}
                >
                  📚 La règle
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#ddd",
                    lineHeight: "1.6",
                  }}
                >
                  {q.fiche.regle}
                </div>
              </div>
              <div
                style={{
                  marginBottom: "16px",
                  background: "rgba(46,196,182,0.1)",
                  border: "1px solid rgba(46,196,182,0.3)",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#2ec4b6",
                    fontWeight: 700,
                    marginBottom: "6px",
                    textTransform: "uppercase",
                  }}
                >
                  ✏️ Exemple
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#ddd",
                    lineHeight: "1.6",
                  }}
                >
                  {q.fiche.exemple}
                </div>
              </div>
              <div
                style={{
                  marginBottom: "16px",
                  background: "rgba(255,107,107,0.1)",
                  border: "1px solid rgba(255,107,107,0.3)",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#ff6b6b",
                    fontWeight: 700,
                    marginBottom: "6px",
                    textTransform: "uppercase",
                  }}
                >
                  ⚠️ Le piège
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#ddd",
                    lineHeight: "1.6",
                  }}
                >
                  {q.fiche.piege}
                </div>
              </div>
              <div
                style={{
                  marginBottom: "20px",
                  background: "rgba(255,209,102,0.1)",
                  border: "1px solid rgba(255,209,102,0.3)",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#ffd166",
                    fontWeight: 700,
                    marginBottom: "6px",
                    textTransform: "uppercase",
                  }}
                >
                  💡 L'astuce
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#ddd",
                    lineHeight: "1.6",
                  }}
                >
                  {q.fiche.astuce}
                </div>
              </div>
              <button
                onClick={() => {
                  setFicheOuverte(false);
                  setFicheObligatoireLue(true);
                }}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                J'ai compris ! Continuer →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (etape === "resultat") {
    const pourcentage = Math.round((scoreRef.current / total) * 100);
    const emoji = pourcentage >= 80 ? "🏆" : pourcentage >= 60 ? "👍" : "💪";
    const message =
      pourcentage >= 80
        ? "Excellent travail !"
        : pourcentage >= 60
          ? "Bien joué !"
          : "Continue à t'entraîner !";
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="resultat-wrapper">
          <div className="resultat-icon">{emoji}</div>
          <h2 className="resultat-titre">{message}</h2>
          <div className="resultat-score">
            {scoreRef.current}/{total}
          </div>
          <p className="resultat-desc">
            Tu as répondu correctement à {scoreRef.current} question
            {scoreRef.current > 1 ? "s" : ""} sur {total} ({pourcentage}%).
          </p>
          {!estConnecte && (
            <div
              style={{
                background: "rgba(79,142,247,0.1)",
                border: "1px solid rgba(79,142,247,0.3)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "#aaa",
                  fontSize: "0.9rem",
                  marginBottom: "12px",
                }}
              >
                📖 Mode découverte. Inscris-toi pour les 10 questions !
              </p>
              <button
                onClick={() => router.push("/inscription")}
                style={{
                  background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                ✨ S'inscrire gratuitement →
              </button>
            </div>
          )}
          {estConnecte && (bestScore || lastScore) && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(46,196,182,0.1)",
                    border: "1px solid rgba(46,196,182,0.3)",
                    borderRadius: "12px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    🏆 Meilleur score
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#2ec4b6",
                    }}
                  >
                    {bestScore.score}/{bestScore.total}
                  </div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    🕐 Dernier score
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#4f8ef7",
                    }}
                  >
                    {lastScore.score}/{lastScore.total}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="resultat-actions">
            <button className="lecon-btn" onClick={demarrer}>
              🔄 Réessayer
            </button>
            <button className="lecon-btn-outline" onClick={() => router.back()}>
              ← Retour aux cours
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
