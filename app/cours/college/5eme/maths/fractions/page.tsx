"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "maths";
const THEME = "fractions";

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
    question: "Simplifiez la fraction 12/18.",
    options: ["6/9", "2/3", "4/6", "1/2"],
    answer: "2/3",
    fiche: {
      regle:
        "Pour simplifier une fraction, on divise le numérateur et le dénominateur par leur PGCD (Plus Grand Commun Diviseur).",
      exemple:
        "✅ 12/18 : PGCD(12,18)=6. 12÷6=2, 18÷6=3 → 2/3. C'est la fraction irréductible.",
      piege:
        "6/9 n'est pas simplifié au maximum : 6/9 = 2/3 (encore divisible par 3).",
      astuce:
        "Cherche le plus grand nombre qui divise les deux. 12 et 18 : divisibles par 2, 3, 6. Le plus grand = 6.",
    },
  },
  {
    question: "Calculez : 1/4 + 2/4",
    options: ["3/8", "2/8", "3/4", "1/2"],
    answer: "3/4",
    fiche: {
      regle:
        "Pour additionner des fractions de même dénominateur : on additionne les numérateurs et on garde le dénominateur.",
      exemple:
        "✅ 1/4 + 2/4 = (1+2)/4 = 3/4. Même dénominateur (4) → on additionne juste les numérateurs.",
      piege: "Ne pas additionner les dénominateurs : 1/4 + 2/4 ≠ 3/8 !",
      astuce:
        "Même dénominateur → additionne les numérateurs, garde le dénominateur. 1/4+2/4 = 3/4.",
    },
  },
  {
    question: "Calculez : 1/3 + 1/4",
    options: ["2/7", "2/12", "7/12", "4/12"],
    answer: "7/12",
    fiche: {
      regle:
        "Pour additionner des fractions de dénominateurs différents : trouver le dénominateur commun (PPCM), réduire au même dénominateur, puis additionner.",
      exemple:
        "✅ 1/3 + 1/4 : PPCM(3,4)=12. 1/3=4/12, 1/4=3/12. 4/12+3/12=7/12.",
      piege:
        "1/3 + 1/4 ≠ 2/7. On ne peut PAS additionner numérateurs et dénominateurs séparément !",
      astuce:
        "Dénominateurs différents → réduis au même dénominateur d'abord. 1/3=4/12, 1/4=3/12 → 7/12.",
    },
  },
  {
    question: "Calculez : 2/3 × 3/5",
    options: ["5/8", "6/15", "2/5", "6/8"],
    answer: "2/5",
    fiche: {
      regle:
        "Pour multiplier deux fractions : on multiplie les numérateurs entre eux et les dénominateurs entre eux. On simplifie si possible.",
      exemple:
        "✅ 2/3 × 3/5 = (2×3)/(3×5) = 6/15. On simplifie : PGCD(6,15)=3 → 6/15 = 2/5.",
      piege:
        "Ne pas additionner les fractions ! On multiplie numérateur × numérateur et dénominateur × dénominateur.",
      astuce:
        "Multiplication : croise numérateurs et dénominateurs. 2/3 × 3/5 = 6/15 = 2/5. Simplifie à la fin !",
    },
  },
  {
    question: "Calculez : 3/4 ÷ 3/8",
    options: ["9/32", "1/2", "2", "6/12"],
    answer: "2",
    fiche: {
      regle:
        "Pour diviser par une fraction, on multiplie par son inverse. a/b ÷ c/d = a/b × d/c.",
      exemple: "✅ 3/4 ÷ 3/8 = 3/4 × 8/3 = (3×8)/(4×3) = 24/12 = 2.",
      piege:
        "Ne pas diviser numérateur par numérateur et dénominateur par dénominateur !",
      astuce:
        "Division de fractions = multiplier par l'INVERSE. ÷ 3/8 = × 8/3. Retourne la 2ème fraction !",
    },
  },
  {
    question: "Comparez 3/4 et 5/6.",
    options: ["3/4 > 5/6", "3/4 = 5/6", "3/4 < 5/6", "Impossible à comparer"],
    answer: "3/4 < 5/6",
    fiche: {
      regle:
        "Pour comparer des fractions, on les réduit au même dénominateur puis on compare les numérateurs.",
      exemple:
        "✅ 3/4 et 5/6 : dénominateur commun = 12. 3/4=9/12, 5/6=10/12. 9<10 donc 3/4 < 5/6.",
      piege:
        "Ne pas comparer directement les numérateurs ou les dénominateurs séparément !",
      astuce:
        "Réduis au même dénominateur puis compare les numérateurs. 9/12 < 10/12 → 3/4 < 5/6.",
    },
  },
  {
    question: "Qu'est-ce qu'une fraction irréductible ?",
    options: [
      "Une fraction dont le numérateur est 1",
      "Une fraction qu'on ne peut plus simplifier",
      "Une fraction supérieure à 1",
      "Une fraction négative",
    ],
    answer: "Une fraction qu'on ne peut plus simplifier",
    fiche: {
      regle:
        "Une fraction est irréductible quand son numérateur et son dénominateur sont premiers entre eux (PGCD = 1).",
      exemple:
        "✅ 2/3 est irréductible (PGCD(2,3)=1). 4/6 n'est pas irréductible (PGCD(4,6)=2 → 2/3).",
      piege:
        "Irréductible ≠ la plus petite possible. C'est celle où on ne peut plus diviser par rien.",
      astuce:
        "Irréductible = PGCD du numérateur et dénominateur = 1. Plus aucun nombre entier (>1) ne les divise tous les deux.",
    },
  },
  {
    question: "Calculez : 5/6 - 1/4",
    options: ["4/2", "7/12", "4/12", "1/2"],
    answer: "7/12",
    fiche: {
      regle:
        "Soustraction de fractions : même méthode que l'addition. Trouver le dénominateur commun, réduire, puis soustraire.",
      exemple:
        "✅ 5/6 - 1/4 : PPCM(6,4)=12. 5/6=10/12, 1/4=3/12. 10/12-3/12=7/12.",
      piege:
        "5/6 - 1/4 ≠ 4/2. On ne peut pas soustraire numérateurs et dénominateurs séparément !",
      astuce:
        "Même dénominateur commun 12 : 5/6=10/12, 1/4=3/12. Soustrait : 10-3=7 → 7/12.",
    },
  },
  {
    question: "Quelle est la fraction égale à 0,75 ?",
    options: ["1/4", "3/4", "7/5", "3/5"],
    answer: "3/4",
    fiche: {
      regle:
        "0,75 = 75/100. On simplifie : PGCD(75,100)=25. 75÷25=3, 100÷25=4 → 3/4.",
      exemple: "✅ 0,75 = 75/100 = 3/4. Vérifie : 3÷4 = 0,75 ✓.",
      piege:
        "0,75 ≠ 1/4 (=0,25). 0,75 = 3/4. Les décimaux courants : 0,5=1/2, 0,25=1/4, 0,75=3/4.",
      astuce:
        "Décimaux importants : 0,5=1/2, 0,25=1/4, 0,75=3/4, 0,1=1/10, 0,2=1/5. À mémoriser !",
    },
  },
  {
    question: "Calculez : 2/5 × 10",
    options: ["4", "20/5", "2/50", "12/5"],
    answer: "4",
    fiche: {
      regle:
        "Multiplier une fraction par un entier : on multiplie le numérateur par l'entier et on garde le dénominateur. 2/5 × 10 = (2×10)/5 = 20/5 = 4.",
      exemple:
        "✅ 2/5 × 10 = 20/5 = 4. On peut aussi simplifier avant : 2/5 × 10 = 2 × (10/5) = 2 × 2 = 4.",
      piege: "Ne pas multiplier aussi le dénominateur. 2/5 × 10 ≠ 20/50 !",
      astuce:
        "Fraction × entier = (numérateur × entier) / dénominateur. Simplifie si possible avant de calculer !",
    },
  },
];

export default function FractionsPage() {
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
          <h1 className="lecon-titre">Les fractions</h1>
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
            Maîtrise les <strong>fractions</strong> : simplification,
            comparaison, addition, soustraction, multiplication et division.
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
                ✂️ Simplifier une fraction
              </div>
              <div className="lecon-point-texte">
                Divise numérateur et dénominateur par leur PGCD. La fraction
                irréductible ne peut plus être simplifiée.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 12/18 → PGCD=6
                → 2/3
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ➕➖ Addition et soustraction
              </div>
              <div className="lecon-point-texte">
                Même dénominateur → additionne les numérateurs. Dénominateurs
                différents → réduis au même dénominateur d'abord.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 1/3+1/4 =
                4/12+3/12 = 7/12
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ✖️÷ Multiplication et division
              </div>
              <div className="lecon-point-texte">
                Multiplication : numérateur × numérateur, dénominateur ×
                dénominateur. Division : multiplier par l'inverse.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span>{" "}
                2/3×3/5=6/15=2/5 | 3/4÷3/8=3/4×8/3=2
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
