"use client";

import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "maths";
const THEME = "calcul";

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
    question: "Combien vaut 3 + 4 x 2 ?",
    options: ["14", "11", "10", "24"],
    answer: "11",
    fiche: {
      regle:
        "La multiplication est prioritaire sur l'addition et la soustraction. On calcule toujours les multiplications et divisions AVANT les additions et soustractions.",
      exemple: "✅ 3 + 4 x 2 = 3 + 8 = 11 (on calcule 4 x 2 d'abord)",
      piege:
        "Ne pas calculer de gauche à droite ! 3 + 4 = 7 puis 7 x 2 = 14 est FAUX.",
      astuce:
        "Priorités : parenthèses d'abord, puis x et divise, puis + et -. Retiens : P puis x/ puis +-",
    },
  },
  {
    question: "Combien vaut (5 + 3) x 4 ?",
    options: ["17", "32", "23", "20"],
    answer: "32",
    fiche: {
      regle:
        "Les parenthèses sont prioritaires sur tout le reste. On calcule toujours ce qui est entre parenthèses EN PREMIER.",
      exemple:
        "✅ (5 + 3) x 4 = 8 x 4 = 32 (on calcule 5+3 dans les parenthèses d'abord)",
      piege:
        "Sans parenthèses 5 + 3 x 4 = 5 + 12 = 17. Avec parenthèses (5+3) x 4 = 32. La difference est enorme !",
      astuce:
        "Parenthèses = priorité absolue ! Calcule toujours ce qu'il y a dedans en premier.",
    },
  },
  {
    question: "Quel est le résultat de 456 x 7 ?",
    options: ["3 192", "3 092", "3 182", "3 292"],
    answer: "3 192",
    fiche: {
      regle:
        "Pour multiplier par un seul chiffre : multiplie chaque chiffre en partant de la droite et n'oublie pas les retenues.",
      exemple:
        "✅ 456 x 7 : 6x7=42 (écris 2 retiens 4), 5x7=35+4=39 (écris 9 retiens 3), 4x7=28+3=31 → 3 192",
      piege: "Ne pas oublier d'ajouter les retenues au rang suivant !",
      astuce:
        "Multiplie chiffre par chiffre de droite à gauche et ajoute les retenues au fur et à mesure.",
    },
  },
  {
    question: "Combien vaut 84 divise par 6 ?",
    options: ["12", "14", "16", "13"],
    answer: "14",
    fiche: {
      regle:
        "Pour diviser : cherche combien de fois le diviseur tient dans le dividende. 84 divise par 6 : combien de fois 6 tient dans 84 ?",
      exemple:
        "✅ 6 x 14 = 84 donc 84 divise par 6 = 14. Vérification : 14 x 6 = 84.",
      piege:
        "La division est l'opération inverse de la multiplication. Pour vérifier : résultat x diviseur = dividende.",
      astuce:
        "Pour vérifier une division : multiplie le résultat par le diviseur. 14 x 6 = 84, c'est bon !",
    },
  },
  {
    question: "Combien vaut 20 - 3 x 5 + 1 ?",
    options: ["86", "6", "16", "76"],
    answer: "6",
    fiche: {
      regle:
        "Ordre des priorités : 1) parenthèses, 2) x et divise, 3) + et -. On calcule de gauche à droite pour les opérations de même priorité.",
      exemple:
        "✅ 20 - 3 x 5 + 1 = 20 - 15 + 1 = 5 + 1 = 6 (on calcule 3x5=15 d'abord)",
      piege:
        "Ne pas calculer de gauche à droite ! 20-3=17, 17x5=85, 85+1=86 est FAUX.",
      astuce:
        "Repère les x et divise en premier, calcule-les, puis fais les + et - de gauche à droite.",
    },
  },
  {
    question: "Quel est le reste de 29 divise par 4 ?",
    options: ["1", "2", "3", "0"],
    answer: "1",
    fiche: {
      regle:
        "Division euclidienne : dividende = quotient x diviseur + reste. Le reste est toujours plus petit que le diviseur.",
      exemple:
        "✅ 29 = 7 x 4 + 1 → quotient = 7, reste = 1. Vérif : 7x4=28, 28+1=29.",
      piege:
        "Le reste doit toujours etre plus petit que le diviseur. Si reste est 4 ou plus avec diviseur 4 c'est faux !",
      astuce:
        "Cherche le plus grand multiple du diviseur qui ne dépasse pas le dividende. 7x4=28, 28+1=29, reste=1.",
    },
  },
  {
    question: "Combien vaut 125 x 8 ?",
    options: ["900", "1 000", "1 100", "800"],
    answer: "1 000",
    fiche: {
      regle:
        "125 x 8 = 1000 car 125 = 1000 divise par 8. C'est un résultat à connaitre par coeur !",
      exemple:
        "✅ 125 x 8 = 1 000. Autre méthode : 125 x 4 = 500, puis 500 x 2 = 1 000.",
      piege:
        "Ne pas confondre 125 x 8 = 1 000 et 125 + 8 = 133. C'est une multiplication !",
      astuce:
        "125 x 8 = 1 000 est un résultat célèbre à connaitre ! Comme 25 x 4 = 100.",
    },
  },
  {
    question: "Quel est le quotient et le reste de 47 divise par 5 ?",
    options: [
      "quotient 8 reste 7",
      "quotient 9 reste 2",
      "quotient 8 reste 2",
      "quotient 9 reste 7",
    ],
    answer: "quotient 9 reste 2",
    fiche: {
      regle:
        "47 divise par 5 : 5 x 9 = 45 et 45 est le plus grand multiple de 5 qui ne dépasse pas 47. Reste = 47 - 45 = 2.",
      exemple:
        "✅ 47 = 9 x 5 + 2 → quotient = 9, reste = 2. Vérif : 9x5=45, 45+2=47.",
      piege:
        "5 x 8 = 40 et 47-40=7, mais 7 est plus grand que 5 donc 8 n'est pas le bon quotient !",
      astuce:
        "Le quotient est le plus grand entier tel que quotient x diviseur soit inferieur ou egal au dividende.",
    },
  },
  {
    question: "Combien vaut 36 divise par 4 x 3 ?",
    options: ["3", "48", "27", "9"],
    answer: "27",
    fiche: {
      regle:
        "Division et multiplication ont la même priorité : on calcule de gauche à droite. 36 divise par 4 x 3 = (36 divise par 4) x 3.",
      exemple:
        "✅ 36 divise par 4 x 3 = 9 x 3 = 27 (on calcule 36 divise par 4 = 9 d'abord puis x3)",
      piege:
        "Ne pas faire 36 divise par (4x3) = 36 divise par 12 = 3. Sans parenthèses on calcule de gauche à droite.",
      astuce:
        "x et divise ont la même priorité : calcule de gauche à droite. 36 divise par 4 = 9, puis 9 x 3 = 27.",
    },
  },
  {
    question: "Quel est le résultat de 1 000 - 347 ?",
    options: ["753", "663", "653", "763"],
    answer: "653",
    fiche: {
      regle:
        "Pour soustraire de 1 000 : méthode du complément à 1 000. On peut aussi poser la soustraction en colonne.",
      exemple: "✅ 1 000 - 347 = 653. Vérification : 653 + 347 = 1 000.",
      piege:
        "Attention aux emprunts ! 0 - 7 nécessite un emprunt au rang des dizaines, qui lui-même doit emprunter.",
      astuce:
        "Pour 1 000 - n : soustrait chaque chiffre de 9 sauf le dernier qu'on soustrait de 10. 9-3=6, 9-4=5, 10-7=3 → 653.",
    },
  },
];

export default function CalculPage() {
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
    setFicheObligatoireLue(true); // true = pas bloqué au départ
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
      if (fautesRef.current === 1) {
        // 1ère faute globale : ouvre la fiche automatiquement
        setFicheOuverte(true);
      }
      if (fautesRef.current === 6) {
        // 6ème faute : fiche obligatoire, bouton bloqué
        setFicheObligatoireLue(false);
      }
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
      // On ne touche PAS à ficheObligatoireLue ici !
      // Elle reste true sauf si on atteint à nouveau 6 fautes
    }
  };

  const total = questions.length;
  const est6emeFaute = fautesRef.current >= 6;
  const boutonBloque = !estCorrecte && est6emeFaute && !ficheObligatoireLue;

  if (etape === "intro") {
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">🔢 Maths — 6ème</div>
          <h1 className="lecon-titre">Le calcul</h1>
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
            En 6ème, on apprend les <strong>priorités des opérations</strong> et
            on perfectionne la multiplication et la division posées.
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
                ⚡ Les priorités opératoires
              </div>
              <div className="lecon-point-texte">
                1) Parenthèses en premier, 2) x et divise ensuite, 3) + et - en
                dernier.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 3 + 4 x 2 = 3 +
                8 = 11 et non 14
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ✖️ La multiplication posée
              </div>
              <div className="lecon-point-texte">
                On multiplie chaque chiffre de droite à gauche en ajoutant les
                retenues.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 456 x 7 = 3 192
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ➗ La division euclidienne
              </div>
              <div className="lecon-point-texte">
                dividende = quotient x diviseur + reste. Le reste est toujours
                inferieur au diviseur.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 29 divise par 4
                : quotient = 7, reste = 1 car 29 = 7 x 4 + 1
              </div>
            </div>
          </div>
          <button className="lecon-btn" onClick={demarrer}>
            🚀 Commencer les exercices →
          </button>
        </div>
      </div>
    );
  }

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
              let className = "qcm-option";
              if (reponseChoisie) {
                if (option === q.answer) className += " correct";
                else if (option === reponseChoisie) className += " incorrect";
                else className += " disabled";
              }
              return (
                <button
                  key={option}
                  className={className}
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
                {!estCorrecte &&
                  fautesRef.current >= 6 &&
                  !ficheObligatoireLue && (
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
                        😅 Aïe, 6 erreurs !
                      </p>
                      <p style={{ color: "#ddd", fontSize: "0.85rem" }}>
                        Tu dois relire la fiche avant de continuer. Elle est là
                        pour t'aider ! 💪
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
                  📖 Lis la fiche pour débloquer la question suivante !
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
                📖 Mode découverte (5 questions). Inscris-toi pour les 10
                questions !
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
