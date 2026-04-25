"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "maths";
const THEME = "nombres-relatifs-2";

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
    question: "Calcule : (-3) × (+5)",
    options: ["+15", "-15", "+8", "-8"],
    answer: "-15",
    fiche: {
      regle:
        "Multiplication de relatifs : signes différents → résultat négatif. (-) × (+) = (-).",
      exemple: "✅ (-3) × (+5) = -(3×5) = -15. Même règle pour la division.",
      piege: "Ne pas oublier la règle des signes ! (-) × (+) = NÉGATIF.",
      astuce: "Signes identiques → +. Signes différents → -. Vaut pour × et ÷.",
    },
  },
  {
    question: "Calcule : (-4) × (-6)",
    options: ["-24", "+24", "-10", "+10"],
    answer: "+24",
    fiche: {
      regle: "Deux négatifs multipliés → résultat positif. (-) × (-) = (+).",
      exemple: "✅ (-4) × (-6) = +(4×6) = +24. Deux moins font un plus !",
      piege: "Deux négatifs = positif ! Beaucoup pensent que ça reste négatif.",
      astuce:
        "(-) × (-) = (+). Paire de signes moins → positif. Impair → négatif.",
    },
  },
  {
    question: "Calcule : (-18) ÷ (+3)",
    options: ["+6", "-6", "+54", "-54"],
    answer: "-6",
    fiche: {
      regle:
        "Division : signes différents → résultat négatif. (-18) ÷ (+3) = -(18÷3) = -6.",
      exemple:
        "✅ (-18) ÷ (+3) = -6. Même règle des signes que pour la multiplication.",
      piege:
        "Division = même règle des signes que multiplication. (-) ÷ (+) = (-).",
      astuce:
        "(-) ÷ (-) = (+). (-) ÷ (+) = (-). Identique à la multiplication !",
    },
  },
  {
    question: "Calcule : (-2)³",
    options: ["-8", "+8", "-6", "+6"],
    answer: "-8",
    fiche: {
      regle:
        "(-2)³ = (-2) × (-2) × (-2). On compte les signes moins : 3 (impair) → résultat négatif.",
      exemple:
        "✅ (-2)³ = (-2)×(-2)×(-2) = (+4)×(-2) = -8. 3 signes moins = impair = négatif.",
      piege:
        "(-2)³ ≠ -(2³). (-2)³ = -8. Mais -(2³) = -8 aussi ici par coïncidence. Attention au contexte !",
      astuce:
        "Puissance paire de négatif → positif. Puissance impaire → négatif. (-2)² = +4. (-2)³ = -8.",
    },
  },
  {
    question: "Priorités opératoires : (-3) + 2 × (-4)",
    options: ["-20", "+5", "-11", "+11"],
    answer: "-11",
    fiche: {
      regle:
        "Priorités : × et ÷ avant + et -. D'abord 2×(-4) = -8, puis (-3) + (-8) = -11.",
      exemple:
        "✅ (-3) + 2×(-4) = (-3) + (-8) = -11. La multiplication passe avant l'addition.",
      piege:
        "Ne pas faire (-3+2) × (-4) = (-1)×(-4) = +4 ! Les priorités s'appliquent aussi avec les relatifs.",
      astuce:
        "Toujours faire × ÷ AVANT + -. Même règle que pour les positifs, mais attention aux signes.",
    },
  },
  {
    question: "Simplifie : -(-5)",
    options: ["-5", "+5", "0", "-10"],
    answer: "+5",
    fiche: {
      regle:
        "Le signe moins devant une parenthèse change le signe de tout ce qui est à l'intérieur. -(-5) = +5.",
      exemple:
        "✅ -(-5) = +5. -(+3) = -3. -(-a) = +a. Double négatif = positif.",
      piege: "-(-5) ≠ -5. Deux signes moins consécutifs = plus. -(-5) = +5.",
      astuce:
        "Deux moins = un plus. -(-5) = +5. Comme en français : 'pas sans abri' = 'logé'.",
    },
  },
  {
    question: "Calcule : (-2) × 3 × (-5)",
    options: ["-30", "+30", "-15", "+10"],
    answer: "+30",
    fiche: {
      regle:
        "On compte le nombre de facteurs négatifs : (-2) et (-5) = 2 négatifs (pair) → résultat positif. 2×3×5 = 30.",
      exemple:
        "✅ (-2) × 3 × (-5) : 2 signes négatifs (pair) → +. 2×3×5 = 30 → résultat : +30.",
      piege:
        "Ne pas calculer de gauche à droite sans tenir compte de tous les signes d'abord.",
      astuce:
        "Compte les signes - : pair → +, impair → -. Ici 2 négatifs → positif. 2×3×5=30 → +30.",
    },
  },
  {
    question: "Quel est le carré de -7 ?",
    options: ["-49", "+49", "-14", "+14"],
    answer: "+49",
    fiche: {
      regle:
        "(-7)² = (-7) × (-7) = +49. Le carré d'un nombre négatif est toujours positif (puissance paire).",
      exemple:
        "✅ (-7)² = +49. (-3)² = +9. (-10)² = +100. Puissance paire → toujours positif.",
      piege:
        "(-7)² = +49 ≠ -49. Attention : -7² = -(7²) = -49. Les parenthèses font toute la différence !",
      astuce:
        "AVEC parenthèses : (-7)² = +49. SANS parenthèses : -7² = -49. Parenthèses = différence !",
    },
  },
  {
    question: "Calcule : [(-3) + 5] × (-2)",
    options: ["-4", "+4", "-16", "+16"],
    answer: "-4",
    fiche: {
      regle:
        "Priorité aux parenthèses. D'abord (-3)+5 = +2. Puis (+2) × (-2) = -4.",
      exemple:
        "✅ [(-3)+5] × (-2) = [+2] × (-2) = -4. Parenthèses en premier, puis multiplication.",
      piege:
        "Ne pas commencer par la multiplication ! Les crochets/parenthèses passent toujours en premier.",
      astuce:
        "Ordre : Parenthèses → × ÷ → + -. Ici crochets d'abord : -3+5=2, puis 2×(-2)=-4.",
    },
  },
  {
    question: "Quel est le résultat de (-1)^100 ?",
    options: ["-100", "+100", "-1", "+1"],
    answer: "+1",
    fiche: {
      regle:
        "(-1) élevé à une puissance paire = +1. (-1) élevé à une puissance impaire = -1.",
      exemple:
        "✅ (-1)^100 : 100 est pair → (+1)^100 = +1. (-1)^99 = -1 (impair).",
      piege:
        "(-1)^100 ≠ -100. C'est (-1)×(-1)×...×(-1) (100 fois) = +1 (100 facteurs négatifs = pair).",
      astuce:
        "(-1)^pair = +1. (-1)^impair = -1. Simple à retenir ! Pair → positif. Impair → négatif.",
    },
  },
];

export default function NombresRelatifs2Page() {
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
          <div className="lecon-badge">🔢 Maths — 4ème</div>
          <h1 className="lecon-titre">Les nombres relatifs (×÷)</h1>
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
            En 4ème, tu maîtrises la <strong>multiplication et division</strong>{" "}
            des nombres relatifs, les puissances et les priorités opératoires.
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
              <div className="lecon-point-titre">✖️ Règle des signes</div>
              <div className="lecon-point-texte">
                Mêmes signes → +. Signes différents → -. Vaut pour × ET ÷.
                Nombre pair de négatifs → +. Impair → -.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> (-3)×(-4)=+12.
                (-3)×(+4)=-12. (-18)÷(-3)=+6.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔢 Puissances</div>
              <div className="lecon-point-texte">
                (-a)^pair = positif. (-a)^impair = négatif. (-7)² = +49. (-2)³ =
                -8.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> (-5)² = +25.
                (-2)³ = -8. (-1)^100 = +1.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">⚡ Priorités opératoires</div>
              <div className="lecon-point-texte">
                1) Parenthèses. 2) × et ÷. 3) + et -. S'applique aussi avec les
                relatifs.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> (-3)+2×(-4) =
                (-3)+(-8) = -11. Pas (-3+2)×(-4).
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
                    📖 Voir la fiche
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
