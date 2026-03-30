"use client";

import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "maths";
const THEME = "nombres-entiers";

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
    question: "Quel est le chiffre des milliers dans le nombre 47 382 ?",
    options: ["4", "7", "3", "8"],
    answer: "7",
    fiche: {
      regle:
        "Dans un nombre, chaque chiffre a une valeur selon sa position : unités, dizaines, centaines, milliers, dizaines de milliers...",
      exemple:
        "✅ 47 382 → 4 = dizaines de milliers / 7 = milliers / 3 = centaines / 8 = dizaines / 2 = unités",
      piege:
        "On lit de droite à gauche : unités d'abord, puis dizaines, centaines, milliers...",
      astuce:
        "Compte depuis la droite : 1=unités, 2=dizaines, 3=centaines, 4=milliers, 5=dizaines de milliers !",
    },
  },
  {
    question: "Lequel de ces nombres est le plus grand ?",
    options: ["9 999", "10 001", "10 000", "9 998"],
    answer: "10 001",
    fiche: {
      regle:
        "Pour comparer des nombres entiers, on compare d'abord le nombre de chiffres. S'ils ont le même nombre de chiffres, on compare chiffre par chiffre en partant de la gauche.",
      exemple: "✅ 10 001 a 5 chiffres / 9 999 a 4 chiffres → 10 001 > 9 999",
      piege:
        "Un nombre avec plus de chiffres est toujours plus grand, même si ses chiffres semblent petits !",
      astuce:
        "Compte d'abord le nombre de chiffres — plus il y en a, plus le nombre est grand !",
    },
  },
  {
    question:
      "Comment écrit-on « deux cent mille quatre-vingt-trois » en chiffres ?",
    options: ["200 083", "200 830", "20 083", "200 803"],
    answer: "200 083",
    fiche: {
      regle:
        "Pour écrire un nombre en chiffres : décompose par classe (millions, milliers, unités) et remplis les cases vides avec des zéros.",
      exemple:
        "✅ deux cent mille = 200 000 / quatre-vingt-trois = 83 → 200 083",
      piege:
        "Attention aux zéros ! 'deux cent mille quatre-vingt-trois' n'a pas de centaines ni de dizaines de milliers.",
      astuce:
        "Écris d'abord 200 000, puis ajoute 83 → 200 083. Les zéros comblent les cases vides !",
    },
  },
  {
    question: "Quelle est la valeur du chiffre 6 dans 364 052 ?",
    options: ["6", "600", "6 000", "60 000"],
    answer: "60 000",
    fiche: {
      regle:
        "La valeur d'un chiffre = chiffre × sa valeur de position. Le 6 est en 5ème position (dizaines de milliers) donc sa valeur est 6 × 10 000 = 60 000.",
      exemple:
        "✅ 364 052 : le 6 est en position 5 (dizaines de milliers) → 6 × 10 000 = 60 000",
      piege: "Ne pas confondre le chiffre (6) et sa valeur (60 000) !",
      astuce:
        "Valeur = chiffre × sa position. Le 6 est au 5ème rang → 6 × 10 000 = 60 000 !",
    },
  },
  {
    question:
      "Range ces nombres dans l'ordre croissant : 1 025 / 1 205 / 1 052 / 1 250",
    options: [
      "1 025 < 1 052 < 1 205 < 1 250",
      "1 025 < 1 205 < 1 052 < 1 250",
      "1 052 < 1 025 < 1 205 < 1 250",
      "1 250 < 1 205 < 1 052 < 1 025",
    ],
    answer: "1 025 < 1 052 < 1 205 < 1 250",
    fiche: {
      regle:
        "Ordre croissant = du plus petit au plus grand. On compare chiffre par chiffre en partant de la gauche.",
      exemple:
        "✅ 1 025 / 1 052 / 1 205 / 1 250 : tous ont 1 au millier. Aux centaines : 0 < 0 < 2 < 2. Aux dizaines : 2 < 5 → 1 025 < 1 052. 0 < 5 → 1 205 < 1 250.",
      piege:
        "Croissant = petit vers grand (comme une montée). Décroissant = grand vers petit (comme une descente).",
      astuce:
        "Croissant = comme une escalier qui monte ! Commence par le plus petit !",
    },
  },
  {
    question: "Quel est l'arrondi de 4 763 à la centaine près ?",
    options: ["4 700", "4 800", "5 000", "4 760"],
    answer: "4 800",
    fiche: {
      regle:
        "Pour arrondir à la centaine : regarde le chiffre des dizaines. Si ≥ 5 → on arrondit à la centaine supérieure. Si < 5 → on arrondit à la centaine inférieure.",
      exemple:
        "✅ 4 763 : chiffre des dizaines = 6 ≥ 5 → arrondit à 4 800 (centaine supérieure)",
      piege:
        "On regarde le chiffre juste APRÈS la position d'arrondi, pas la position elle-même !",
      astuce:
        "Règle du 5 : si le chiffre suivant ≥ 5 → monte / < 5 → reste. 4 763 → 6 ≥ 5 → 4 800 !",
    },
  },
  {
    question: "Quelle est la décomposition de 53 407 ?",
    options: [
      "5 × 10 000 + 3 × 1 000 + 4 × 100 + 7",
      "5 × 10 000 + 3 × 1 000 + 4 × 10 + 7",
      "5 × 1 000 + 3 × 100 + 4 × 10 + 7",
      "5 × 10 000 + 3 × 1 000 + 0 × 100 + 4 × 10 + 7",
    ],
    answer: "5 × 10 000 + 3 × 1 000 + 0 × 100 + 4 × 10 + 7",
    fiche: {
      regle:
        "La décomposition d'un nombre = chaque chiffre × sa valeur de position.",
      exemple: "✅ 53 407 = 5×10 000 + 3×1 000 + 0×100 + 4×10 + 7×1",
      piege: "N'oublie pas le 0 des centaines ! 53 407 a bien 0 centaine.",
      astuce: "Écris chaque chiffre avec sa position, même les zéros !",
    },
  },
  {
    question: "Combien y a-t-il de dizaines dans 1 000 ?",
    options: ["10", "100", "1 000", "10 000"],
    answer: "100",
    fiche: {
      regle:
        "1 000 = 10 × 100 = 100 dizaines. Plus généralement : 1 centaine = 10 dizaines / 1 millier = 100 dizaines.",
      exemple: "✅ 1 000 ÷ 10 = 100 → il y a 100 dizaines dans 1 000",
      piege:
        "Ne pas confondre '10 dizaines = 1 centaine' et 'combien de dizaines dans 1 000' !",
      astuce:
        "1 000 ÷ 10 = 100 dizaines. Divise le nombre par 10 pour trouver le nombre de dizaines !",
    },
  },
  {
    question: "Quel nombre vient juste avant 100 000 ?",
    options: ["99 000", "99 999", "100 001", "99 990"],
    answer: "99 999",
    fiche: {
      regle:
        "Le nombre juste avant = nombre - 1. Le nombre juste après = nombre + 1.",
      exemple: "✅ 100 000 - 1 = 99 999 / 100 000 + 1 = 100 001",
      piege: "Attention : juste avant 100 000, c'est 99 999 et non 99 000 !",
      astuce:
        "Juste avant = enlève 1. Juste après = ajoute 1. 100 000 - 1 = 99 999 !",
    },
  },
  {
    question:
      "Quel est le plus grand nombre qu'on peut écrire avec les chiffres 3, 7, 1, 5, 0 (chaque chiffre utilisé une seule fois) ?",
    options: ["75 310", "75 130", "73 510", "75 301"],
    answer: "75 310",
    fiche: {
      regle:
        "Pour former le plus grand nombre : place le plus grand chiffre au rang le plus élevé, puis le 2ème plus grand au rang suivant, etc.",
      exemple: "✅ Chiffres disponibles : 7, 5, 3, 1, 0 → plus grand = 75 310",
      piege:
        "Ne pas mettre 0 en première position — un nombre ne commence pas par 0 !",
      astuce:
        "Range les chiffres du plus grand au plus petit : 7 → 5 → 3 → 1 → 0 = 75 310 !",
    },
  },
];

export default function NombresEntiersPage() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useContext(DecouverteContext);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [etape, setEtape] = useState<"intro" | "quiz" | "resultat">("intro");
  const [index, setIndex] = useState(0);
  const [reponseChoisie, setReponseChoisie] = useState<string | null>(null);
  const [estCorrecte, setEstCorrecte] = useState<boolean | null>(null);
  const [ficheOuverte, setFicheOuverte] = useState(false);
  const [ficheObligatoireLue, setFicheObligatoireLue] = useState(false);
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
    setFicheObligatoireLue(false);
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
        setFicheOuverte(true);
        setFicheObligatoireLue(false);
      } else if (fautesRef.current === 6) {
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
      setFicheObligatoireLue(false);
    }
  };

  const total = questions.length;
  const est6emeFaute = fautesRef.current === 6;
  const boutonBloque = est6emeFaute && !ficheObligatoireLue;

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
          <h1 className="lecon-titre">Les nombres entiers</h1>
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
            Les <strong>nombres entiers</strong> sont les nombres sans virgule :
            0, 1, 2, 3... jusqu'à l'infini ! En 6ème, on travaille avec de très
            grands nombres et on apprend à les lire, les écrire et les comparer.
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
                📍 La valeur positionnelle
              </div>
              <div className="lecon-point-texte">
                Chaque chiffre a une <strong>valeur</strong> selon sa position
                dans le nombre.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Dans 47 382 :
                <br />
                4 = 4 × 10 000 = 40 000
                <br />
                7 = 7 × 1 000 = 7 000
                <br />3 = 3 × 100 = 300
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📊 Comparer et ordonner</div>
              <div className="lecon-point-texte">
                Pour comparer, on regarde d'abord le{" "}
                <strong>nombre de chiffres</strong>, puis chiffre par chiffre de
                gauche à droite.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Croissant :</span> du plus petit
                au plus grand (↗)
                <br />
                <span className="exemple-label">Décroissant :</span> du plus
                grand au plus petit (↘)
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔄 Arrondir</div>
              <div className="lecon-point-texte">
                Pour arrondir, on regarde le chiffre{" "}
                <strong>juste après</strong> la position voulue.
              </div>
              <div className="lecon-point-exemple">
                Si ce chiffre ≥ 5 → on monte
                <br />
                Si ce chiffre &lt; 5 → on reste
                <br />
                <span className="exemple-label">Exemple :</span> 4 763 arrondi à
                la centaine → 4 800 (car 6 ≥ 5)
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
