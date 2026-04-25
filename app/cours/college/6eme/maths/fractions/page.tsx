"use client";

import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
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
    question: "Dans la fraction 3/5, que représente le 5 ?",
    options: ["Le numérateur", "Le dénominateur", "Le quotient", "Le reste"],
    answer: "Le dénominateur",
    fiche: {
      regle:
        "Une fraction a/b : a = numérateur (en haut) / b = dénominateur (en bas). Le dénominateur indique en combien de parts égales on divise le tout.",
      exemple:
        "✅ 3/5 : 5 = dénominateur (5 parts égales) / 3 = numérateur (on prend 3 parts)",
      piege: "Le dénominateur est TOUJOURS en bas de la fraction !",
      astuce:
        "Dénominateur → en bas. Numérateur → en haut. D avant N dans l'alphabet = Dessous !",
    },
  },
  {
    question: "Quelle fraction est égale à 1/2 ?",
    options: ["2/3", "3/6", "2/5", "4/9"],
    answer: "3/6",
    fiche: {
      regle:
        "Des fractions équivalentes représentent la même quantité. On les obtient en multipliant (ou divisant) le numérateur ET le dénominateur par le même nombre.",
      exemple: "✅ 1/2 = 2/4 = 3/6 = 4/8... (multiplie par 2, 3, 4...)",
      piege:
        "Pour des fractions équivalentes, il faut multiplier numérateur ET dénominateur par le MÊME nombre !",
      astuce:
        "1/2 × (3/3) = 3/6. Multiplie en haut ET en bas par le même nombre !",
    },
  },
  {
    question:
      "Quelle est la fraction de la figure si 3 cases sur 8 sont coloriées ?",
    options: ["8/3", "5/8", "3/8", "3/5"],
    answer: "3/8",
    fiche: {
      regle:
        "Fraction = (nombre de parts prises) / (nombre total de parts). Numérateur = parts prises / Dénominateur = total.",
      exemple: "✅ 3 cases coloriées sur 8 au total = 3/8",
      piege:
        "Ne pas inverser ! 3/8 et non 8/3. Le total est TOUJOURS le dénominateur.",
      astuce: "Fraction = ce qu'on prend / total. Coloriées / Total = 3/8 !",
    },
  },
  {
    question: "Laquelle de ces fractions est supérieure à 1 ?",
    options: ["3/4", "5/7", "7/5", "2/3"],
    answer: "7/5",
    fiche: {
      regle:
        "Une fraction est > 1 si le numérateur > dénominateur. = 1 si numérateur = dénominateur. < 1 si numérateur < dénominateur.",
      exemple:
        "✅ 7/5 : 7 > 5 → fraction > 1 (= 1 et 2/5) / 3/4 : 3 < 4 → fraction < 1",
      piege:
        "Quand le numérateur est plus grand que le dénominateur, la fraction dépasse 1 !",
      astuce:
        "numérateur > dénominateur → fraction > 1 / numérateur < dénominateur → fraction < 1 !",
    },
  },
  {
    question: "Quelle fraction est la plus grande : 3/4 ou 5/8 ?",
    options: ["3/4", "5/8", "Elles sont égales", "Impossible à comparer"],
    answer: "3/4",
    fiche: {
      regle:
        "Pour comparer des fractions : ramène-les au même dénominateur. 3/4 = 6/8 et 5/8 → 6/8 > 5/8 donc 3/4 > 5/8.",
      exemple: "✅ 3/4 = 6/8 / 5/8 → 6/8 > 5/8 → 3/4 > 5/8",
      piege:
        "On ne peut pas comparer directement 3/4 et 5/8 sans les mettre au même dénominateur !",
      astuce: "Même dénominateur → compare les numérateurs. 3/4 = 6/8 > 5/8 !",
    },
  },
  {
    question: "Quelle est la fraction simplifiée de 6/9 ?",
    options: ["3/4", "2/3", "1/3", "6/9"],
    answer: "2/3",
    fiche: {
      regle:
        "Pour simplifier : divise le numérateur ET le dénominateur par leur plus grand commun diviseur (PGCD).",
      exemple: "✅ 6/9 : PGCD(6,9) = 3 → 6÷3 / 9÷3 = 2/3",
      piege:
        "Divise numérateur ET dénominateur par le même nombre. 6÷3=2 et 9÷3=3 → 2/3.",
      astuce:
        "Cherche un nombre qui divise exactement les deux. 6 et 9 sont tous deux divisibles par 3 → 2/3 !",
    },
  },
  {
    question: "À quel nombre décimal correspond 3/4 ?",
    options: ["0,34", "0,75", "1,33", "0,43"],
    answer: "0,75",
    fiche: {
      regle:
        "Pour convertir une fraction en décimal : divise le numérateur par le dénominateur.",
      exemple: "✅ 3/4 = 3 ÷ 4 = 0,75 / 1/2 = 1 ÷ 2 = 0,5 / 1/4 = 0,25",
      piege: "3/4 ≠ 0,34 ! Il faut DIVISER : 3 ÷ 4 = 0,75.",
      astuce: "Fraction → décimal : numérateur ÷ dénominateur. 3 ÷ 4 = 0,75 !",
    },
  },
  {
    question:
      "Si une pizza est coupée en 8 parts égales et que tu en manges 3, quelle fraction reste-t-il ?",
    options: ["3/8", "5/8", "8/5", "5/3"],
    answer: "5/8",
    fiche: {
      regle: "Total = 8/8. Mangées = 3/8. Reste = 8/8 - 3/8 = 5/8.",
      exemple:
        "✅ 8/8 - 3/8 = 5/8 (on soustrait les numérateurs, le dénominateur reste le même)",
      piege:
        "Pour soustraire des fractions de même dénominateur : garde le dénominateur, soustrait les numérateurs !",
      astuce:
        "Même dénominateur → soustrait juste les numérateurs. 8-3=5 → 5/8 !",
    },
  },
  {
    question: "Laquelle de ces fractions est égale à 2 ?",
    options: ["2/1", "1/2", "4/1", "2/4"],
    answer: "2/1",
    fiche: {
      regle:
        "Tout entier peut s'écrire comme une fraction avec 1 au dénominateur : n = n/1.",
      exemple: "✅ 2 = 2/1 / 5 = 5/1 / 3 = 3/1",
      piege: "2/4 = 1/2 ≠ 2. Et 4/1 = 4 ≠ 2. Seul 2/1 = 2 !",
      astuce: "Un entier n = n/1. Donc 2 = 2/1 !",
    },
  },
  {
    question: "Quelle est la somme de 1/4 + 2/4 ?",
    options: ["3/8", "3/4", "2/8", "1/2"],
    answer: "3/4",
    fiche: {
      regle:
        "Pour additionner des fractions de même dénominateur : additionne les numérateurs, garde le même dénominateur.",
      exemple: "✅ 1/4 + 2/4 = (1+2)/4 = 3/4",
      piege: "Ne pas additionner les dénominateurs ! 1/4 + 2/4 ≠ 3/8.",
      astuce:
        "Même dénominateur → additionne juste les numérateurs. 1+2=3 → 3/4 !",
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
          <div className="lecon-badge">🔢 Maths — 6ème</div>
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
            Une <strong>fraction</strong> représente une partie d'un tout. Elle
            s'écrit a/b où a est le numérateur et b le dénominateur.
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
                🍕 Numérateur et dénominateur
              </div>
              <div className="lecon-point-texte">
                <strong>Numérateur</strong> (haut) = parts prises ·{" "}
                <strong>Dénominateur</strong> (bas) = total de parts
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 3/8 d'une pizza
                = 3 parts prises sur 8 parts au total
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔄 Fractions équivalentes</div>
              <div className="lecon-point-texte">
                Multiplier ou diviser numérateur ET dénominateur par le même
                nombre donne une fraction équivalente.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 1/2 = 2/4 = 3/6
                = 4/8...
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📊 Comparer des fractions</div>
              <div className="lecon-point-texte">
                Pour comparer, ramène au même dénominateur puis compare les
                numérateurs.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 3/4 vs 5/8 →
                6/8 vs 5/8 → 3/4 &gt; 5/8
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
                      Tu dois relire la fiche avant de continuer ! 💪
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
