"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "maths";
const THEME = "nombres-relatifs";

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
    question: "Quel est le résultat de (+5) + (-3) ?",
    options: ["+8", "+2", "-2", "-8"],
    answer: "+2",
    fiche: {
      regle:
        "Signes différents → on soustrait les valeurs absolues et on garde le signe du plus grand.",
      exemple:
        "✅ (+5) + (-3) = +(5-3) = +2. Le plus grand est 5 (positif) → résultat positif.",
      piege:
        "Ne pas additionner 5+3=8. Signes différents → on soustrait : 5-3=2, signe du plus grand = +.",
      astuce:
        "Signes DIFFÉRENTS → soustrait. Signes PAREILS → additionne. Garde le signe du plus grand !",
    },
  },
  {
    question: "Quel est le résultat de (-4) + (-6) ?",
    options: ["+10", "-10", "+2", "-2"],
    answer: "-10",
    fiche: {
      regle:
        "Même signe → on additionne les valeurs absolues et on garde le signe commun.",
      exemple:
        "✅ (-4) + (-6) = -(4+6) = -10. Les deux sont négatifs → résultat négatif.",
      piege:
        "Ne pas faire -4+6=+2. Les deux sont négatifs donc 4+6=10, résultat = -10.",
      astuce:
        "Même signe → additionne et garde ce signe. (-4)+(-6) : même signe (-), 4+6=10 → -10.",
    },
  },
  {
    question: "Quel est le résultat de (+3) - (+8) ?",
    options: ["+11", "-11", "+5", "-5"],
    answer: "-5",
    fiche: {
      regle:
        "Soustraire un nombre = additionner son opposé. (+3) - (+8) = (+3) + (-8).",
      exemple:
        "✅ (+3) - (+8) = (+3) + (-8) = -(8-3) = -5. Signes différents, 8>3, signe dominant = -.",
      piege: "3-8 : puisque 8>3 et signe dominant -, résultat = -5, pas +5.",
      astuce:
        "Soustraction = addition de l'opposé. a - b = a + (-b). Transforme toujours en addition !",
    },
  },
  {
    question: "Placez dans l'ordre croissant : -3, +1, -7, +4, 0",
    options: [
      "-7 < -3 < 0 < +1 < +4",
      "+4 < +1 < 0 < -3 < -7",
      "-3 < -7 < 0 < +1 < +4",
      "0 < -3 < -7 < +1 < +4",
    ],
    answer: "-7 < -3 < 0 < +1 < +4",
    fiche: {
      regle:
        "Sur la droite numérique : négatifs à gauche, 0 au centre, positifs à droite. Plus à gauche = plus petit.",
      exemple:
        "✅ -7 < -3 < 0 < +1 < +4. Sur la droite : -7 est le plus à gauche donc le plus petit.",
      piege:
        "-7 est plus petit que -3. Pour les négatifs : plus le chiffre est grand, plus le nombre est PETIT.",
      astuce:
        "Pour les négatifs : -7 < -3 < -1 < 0. Plus le chiffre est grand, plus le relatif est PETIT.",
    },
  },
  {
    question: "Quel est l'opposé de -5 ?",
    options: ["-5", "0", "+5", "+10"],
    answer: "+5",
    fiche: {
      regle:
        "L'opposé d'un nombre relatif a la même valeur absolue mais le signe contraire.",
      exemple: "✅ Opposé de -5 = +5. Opposé de +3 = -3. a + (-a) = 0.",
      piege: "L'opposé change SEULEMENT le signe, pas la valeur !",
      astuce:
        "Opposé = même valeur, signe contraire. -5 → +5. +3 → -3. Toujours !",
    },
  },
  {
    question: "Quel est le résultat de (-2) × (+6) ?",
    options: ["+12", "-12", "+8", "-8"],
    answer: "-12",
    fiche: {
      regle:
        "Règle des signes : même signe → positif. Signes différents → négatif.",
      exemple:
        "✅ (-2) × (+6) : signes différents (- et +) → négatif. 2×6=12 → -12.",
      piege: "(-2)×(+6) ≠ +12. Signes DIFFÉRENTS → toujours négatif !",
      astuce:
        "Même signe → POSITIF. Signes différents → NÉGATIF. Retiens cette règle pour × et ÷ !",
    },
  },
  {
    question: "Quel est le résultat de (-3) × (-4) ?",
    options: ["-12", "+12", "-7", "+7"],
    answer: "+12",
    fiche: {
      regle:
        "Deux négatifs multipliés donnent un résultat positif : (-)×(-)=+.",
      exemple:
        "✅ (-3) × (-4) = +12. Même signe (tous les deux -) → positif. 3×4=12 → +12.",
      piege: "(-3)×(-4) ≠ -12. Deux négatifs × = POSITIF !",
      astuce:
        "(-) × (-) = (+). Comme double négation en français : pas mal = bien !",
    },
  },
  {
    question: "Calculez : (-12) ÷ (+4)",
    options: ["+3", "-3", "+8", "-8"],
    answer: "-3",
    fiche: {
      regle:
        "Division : mêmes règles de signes que multiplication. Signes différents → négatif.",
      exemple: "✅ (-12) ÷ (+4) : signes différents → négatif. 12÷4=3 → -3.",
      piege: "(-12)÷(+4) ≠ +3. Signes différents → négatif !",
      astuce:
        "Division = mêmes règles que multiplication. Différents → négatif. Pareils → positif.",
    },
  },
  {
    question: "Quelle est la valeur absolue de -8 ?",
    options: ["-8", "0", "+8", "8"],
    answer: "8",
    fiche: {
      regle:
        "La valeur absolue est la distance à zéro, toujours positive. Notation : |-8| = 8.",
      exemple: "✅ |-8| = 8. |+5| = 5. |0| = 0. Toujours positive ou nulle.",
      piege: "La valeur absolue n'est jamais négative. |-8| = 8 (pas -8).",
      astuce:
        "Valeur absolue = distance à 0. Toujours positive ! |-8| = |+8| = 8.",
    },
  },
  {
    question: "Quel est le résultat de -3 + 5 - 2 + 1 ?",
    options: ["+1", "-1", "+11", "-11"],
    answer: "+1",
    fiche: {
      regle: "Regroupe les positifs et les négatifs séparément puis calcule.",
      exemple:
        "✅ -3+5-2+1 = (5+1)+(-3-2) = 6+(-5) = +1. Positifs: 6. Négatifs: 5. 6-5=1.",
      piege:
        "Calculer de gauche à droite : -3+5=2, 2-2=0, 0+1=1. Même résultat mais plus lent.",
      astuce:
        "Regroupe positifs d'un côté, négatifs de l'autre. (+5+1)+(−3−2) = 6+(−5) = +1.",
    },
  },
];

export default function NombresRelatifsPage() {
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
          <div className="lecon-badge">🔢 Maths — 5ème</div>
          <h1 className="lecon-titre">Les nombres relatifs</h1>
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
            Les <strong>nombres relatifs</strong> sont des nombres positifs ou
            négatifs. Apprends à les manipuler : addition, soustraction,
            multiplication et division.
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
              <div className="lecon-point-titre">📍 La droite numérique</div>
              <div className="lecon-point-texte">
                Négatifs à gauche de 0, positifs à droite. Plus on va à gauche,
                plus le nombre est petit.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> -7 &lt; -3 &lt;
                0 &lt; +2 &lt; +5
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ➕➖ Addition et soustraction
              </div>
              <div className="lecon-point-texte">
                Même signe → additionne et garde le signe. Signes différents →
                soustrait et garde le signe du plus grand.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> (+5)+(−3)=+2 |
                (−4)+(−6)=−10
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ✖️ Multiplication et division
              </div>
              <div className="lecon-point-texte">
                Même signe → résultat positif (+). Signes différents → résultat
                négatif (−).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> (−3)×(−4)=+12 |
                (−2)×(+6)=−12
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
                      😅 Aïe, 6 erreurs !
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
