"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "maths";
const THEME = "equations";

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
    question: "Résous : x + 5 = 12",
    options: ["x = 17", "x = 7", "x = -7", "x = 60"],
    answer: "x = 7",
    fiche: {
      regle:
        "Pour isoler x, on fait la même opération des deux côtés. x + 5 = 12 → x = 12 - 5 = 7.",
      exemple:
        "✅ x + 5 = 12. On soustrait 5 des deux côtés : x = 12 - 5 = 7. Vérif : 7+5=12 ✓",
      piege: "Ne pas additionner 12+5=17. Il faut SOUSTRAIRE 5 des deux côtés.",
      astuce:
        "Isole x : fais l'opération inverse. +5 → -5. ×3 → ÷3. Même opération des DEUX côtés.",
    },
  },
  {
    question: "Résous : 3x = 15",
    options: ["x = 45", "x = 12", "x = 5", "x = -5"],
    answer: "x = 5",
    fiche: {
      regle: "3x = 15. On divise les deux membres par 3 : x = 15/3 = 5.",
      exemple: "✅ 3x = 15 → x = 15÷3 = 5. Vérif : 3×5=15 ✓",
      piege: "Ne pas multiplier 3×15=45. Il faut DIVISER par 3 des deux côtés.",
      astuce:
        "3x → divise par 3. x/2 → multiplie par 2. Toujours l'opération INVERSE.",
    },
  },
  {
    question: "Résous : 2x - 3 = 7",
    options: ["x = 2", "x = 5", "x = 8", "x = -2"],
    answer: "x = 5",
    fiche: {
      regle:
        "2x - 3 = 7. Étape 1 : +3 des deux côtés → 2x = 10. Étape 2 : ÷2 → x = 5.",
      exemple: "✅ 2x-3=7 → 2x=10 → x=5. Vérif : 2×5-3=10-3=7 ✓",
      piege:
        "Ne pas diviser avant d'isoler les termes en x. D'abord +3, PUIS ÷2.",
      astuce:
        "2 étapes : 1) Isole le terme en x (±). 2) Isole x (×÷). 2x-3=7 → 2x=10 → x=5.",
    },
  },
  {
    question: "Résous : x/4 = 3",
    options: ["x = 4/3", "x = 3/4", "x = 12", "x = 7"],
    answer: "x = 12",
    fiche: {
      regle: "x/4 = 3. On multiplie les deux membres par 4 : x = 3×4 = 12.",
      exemple: "✅ x/4 = 3 → x = 3×4 = 12. Vérif : 12/4=3 ✓",
      piege:
        "Ne pas diviser 3÷4. x/4=3 → x=3×4=12. Division → multiplication des deux côtés.",
      astuce:
        "x/4 = 3 → multiplie par 4. x×4 = 3 → divise par 4. Opération inverse !",
    },
  },
  {
    question: "Résous : 5x + 2 = 3x + 10",
    options: ["x = 4", "x = 6", "x = 2", "x = 8"],
    answer: "x = 4",
    fiche: {
      regle: "Rassemble les x d'un côté. 5x - 3x = 10 - 2 → 2x = 8 → x = 4.",
      exemple:
        "✅ 5x+2=3x+10 → 5x-3x=10-2 → 2x=8 → x=4. Vérif : 5×4+2=22 et 3×4+10=22 ✓",
      piege:
        "Ne pas additionner 5x+3x ! On SOUSTRAIT 3x des deux côtés pour l'amener à gauche.",
      astuce:
        "X des deux côtés → transpose (change de signe). 5x+2=3x+10 → 5x-3x=10-2 → 2x=8.",
    },
  },
  {
    question: "Résous : -2x + 6 = 0",
    options: ["x = -3", "x = 3", "x = 12", "x = -12"],
    answer: "x = 3",
    fiche: {
      regle: "-2x + 6 = 0 → -2x = -6 → x = (-6)/(-2) = 3.",
      exemple: "✅ -2x+6=0 → -2x=-6 → x=3. Vérif : -2×3+6=-6+6=0 ✓",
      piege: "(-6)÷(-2) = +3 (pas -3). Deux négatifs → positif !",
      astuce:
        "-2x=-6 → x=(-6)/(-2)=+3. Règle des signes en division : (-)÷(-)=(+).",
    },
  },
  {
    question: "Résous : 3(x + 2) = 15",
    options: ["x = 3", "x = 5", "x = 1", "x = 7"],
    answer: "x = 3",
    fiche: {
      regle:
        "Option 1 : développe d'abord. 3x+6=15 → 3x=9 → x=3. Option 2 : divise d'abord par 3. x+2=5 → x=3.",
      exemple: "✅ 3(x+2)=15 → x+2=5 → x=3. Ou : 3x+6=15 → 3x=9 → x=3.",
      piege: "Ne pas calculer (3+2)×15=75. D'abord résous l'équation !",
      astuce:
        "Parenthèse × nombre → divise les deux membres par ce nombre OU développe. Les deux marchent !",
    },
  },
  {
    question: "Résous : x² = 25",
    options: ["x = 5", "x = -5", "x = 5 ou x = -5", "x = 625"],
    answer: "x = 5 ou x = -5",
    fiche: {
      regle:
        "x² = 25 → x = √25 ou x = -√25 → x = 5 ou x = -5. Une équation du 2ème degré a 2 solutions.",
      exemple: "✅ x²=25 → x=5 ou x=-5. Vérif : 5²=25 ✓ et (-5)²=25 ✓",
      piege:
        "x²=25 a DEUX solutions ! Ne pas oublier la solution négative x=-5.",
      astuce:
        "x²=a → x=√a ou x=-√a. Deux solutions (si a>0). Une seule si a=0. Aucune si a<0.",
    },
  },
  {
    question: "Vérifie : x = 2 est-il solution de 4x - 3 = 5 ?",
    options: ["Oui", "Non", "Impossible à dire", "Seulement si x > 0"],
    answer: "Oui",
    fiche: {
      regle:
        "Vérification : remplace x par 2. 4×2-3 = 8-3 = 5. Le membre gauche = le membre droit → x=2 est solution.",
      exemple: "✅ 4×2-3 = 5. 8-3 = 5. 5 = 5 ✓ → x=2 est bien solution.",
      piege:
        "La vérification est essentielle ! Toujours remplacer x par la solution trouvée pour vérifier.",
      astuce:
        "Vérification = remplace x → calcule des deux côtés → si égaux → solution correcte.",
    },
  },
  {
    question: "Quel est le premier degré d'une équation ?",
    options: [
      "L'exposant de x est 2",
      "L'exposant de x est 1 (x apparaît sans puissance)",
      "x est absent",
      "x est à la puissance 3",
    ],
    answer: "L'exposant de x est 1 (x apparaît sans puissance)",
    fiche: {
      regle:
        "Équation du 1er degré : x apparaît à la puissance 1 (pas de x², x³...). Forme ax + b = 0. Une seule solution.",
      exemple:
        "✅ 3x+2=0 (1er degré). x²+1=0 (2ème degré). 2x-5=7 (1er degré).",
      piege:
        "1er degré ≠ simple. Le degré = la plus haute puissance de x. 3x+2=0 → degré 1.",
      astuce:
        "Degré = puissance max de x. 1er degré : 1 solution. 2ème degré : 0, 1 ou 2 solutions.",
    },
  },
];

export default function EquationsPage() {
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
          <div className="lecon-badge">🔤 Maths — 4ème</div>
          <h1 className="lecon-titre">Les équations</h1>
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
            Les <strong>équations du 1er degré</strong> sont fondamentales en
            maths. Apprends à résoudre, vérifier et interpréter les solutions.
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
              <div className="lecon-point-titre">🎯 Principe de résolution</div>
              <div className="lecon-point-texte">
                Même opération des DEUX côtés. Opération inverse pour isoler x.
                2 étapes : 1) Isole le terme en x. 2) Isole x.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 2x-3=7 → 2x=10
                → x=5.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔄 X des deux côtés</div>
              <div className="lecon-point-texte">
                Transpose les termes : change de côté = change de signe.
                Rassemble les x d'un côté, les nombres de l'autre.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 5x+2=3x+10 →
                2x=8 → x=4.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">✅ Vérification</div>
              <div className="lecon-point-texte">
                Toujours vérifier en remplaçant x par la valeur trouvée. Les
                deux membres doivent être égaux.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> x=5 dans 2x-3=7
                → 2×5-3=7 ✓
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
