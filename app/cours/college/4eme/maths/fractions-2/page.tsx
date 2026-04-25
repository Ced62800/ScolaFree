"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "maths";
const THEME = "fractions-2";

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
    question: "Calcule : 2/3 + 5/4",
    options: ["7/7", "23/12", "7/12", "10/12"],
    answer: "23/12",
    fiche: {
      regle:
        "Dénominateurs différents → PPCM. PPCM(3,4)=12. 2/3=8/12. 5/4=15/12. 8/12+15/12=23/12.",
      exemple: "✅ 2/3 + 5/4 = 8/12 + 15/12 = 23/12. PPCM(3,4)=12.",
      piege: "Ne pas additionner numérateurs ET dénominateurs ! 7/7 est faux.",
      astuce:
        "PPCM d'abord, puis convertis, puis additionne seulement les numérateurs.",
    },
  },
  {
    question: "Calcule : 3/4 - 1/6",
    options: ["2/2", "7/12", "1/6", "11/12"],
    answer: "7/12",
    fiche: {
      regle: "PPCM(4,6)=12. 3/4=9/12. 1/6=2/12. 9/12-2/12=7/12.",
      exemple: "✅ 3/4 - 1/6 = 9/12 - 2/12 = 7/12.",
      piege:
        "PPCM(4,6)=12 (pas 24). Le plus petit commun multiple, pas le produit.",
      astuce:
        "Liste les multiples : 4,8,12... et 6,12... Premier commun = 12 = PPCM.",
    },
  },
  {
    question: "Calcule : (2/3) × (9/4)",
    options: ["18/12", "3/2", "11/7", "6/7"],
    answer: "3/2",
    fiche: {
      regle:
        "Multiplication : (2×9)/(3×4) = 18/12 = 3/2. On peut simplifier avant : 2/4 × 9/3 = 1/2 × 3 = 3/2.",
      exemple:
        "✅ 2/3 × 9/4 = 18/12 = 3/2. Simplification avant : (2×9)/(3×4) → divise 2 et 4 par 2, 9 et 3 par 3.",
      piege:
        "18/12 est correct mais pas simplifié. La fraction irréductible est 3/2.",
      astuce:
        "Simplifie AVANT de multiplier : croise les facteurs. 2 et 4 → divise par 2. 9 et 3 → divise par 3.",
    },
  },
  {
    question: "Calcule : (5/6) ÷ (5/9)",
    options: ["25/54", "3/2", "1/2", "10/15"],
    answer: "3/2",
    fiche: {
      regle:
        "Division = multiplier par l'inverse. 5/6 ÷ 5/9 = 5/6 × 9/5 = 45/30 = 3/2.",
      exemple: "✅ 5/6 ÷ 5/9 = 5/6 × 9/5 = (5×9)/(6×5) = 45/30 = 3/2.",
      piege:
        "Division ≠ multiplication. Diviser par 5/9 = multiplier par 9/5 (l'inverse).",
      astuce:
        "a/b ÷ c/d = a/b × d/c. Inverse = retourne la fraction du diviseur.",
    },
  },
  {
    question: "Quelle fraction est entre 1/3 et 1/2 ?",
    options: ["1/6", "2/5", "2/3", "3/4"],
    answer: "2/5",
    fiche: {
      regle:
        "1/3 ≈ 0,333 et 1/2 = 0,5. 2/5 = 0,4. Qui est entre 0,333 et 0,5 ? 0,4 ✓",
      exemple:
        "✅ 1/3 = 0,333... 2/5 = 0,4. 1/2 = 0,5. 0,333 < 0,4 < 0,5 → 2/5 est entre 1/3 et 1/2.",
      piege:
        "1/6 ≈ 0,167 (trop petit). 2/3 ≈ 0,667 (trop grand). 3/4 = 0,75 (trop grand).",
      astuce:
        "Convertis en décimaux pour comparer facilement : 1/3≈0,33, 2/5=0,4, 1/2=0,5.",
    },
  },
  {
    question: "Simplifie au maximum : 36/48",
    options: ["18/24", "6/8", "3/4", "9/12"],
    answer: "3/4",
    fiche: {
      regle:
        "PGCD(36,48). 36=4×9=2²×3². 48=16×3=2⁴×3. PGCD=2²×3=12. 36÷12=3. 48÷12=4 → 3/4.",
      exemple:
        "✅ PGCD(36,48)=12. 36/12=3. 48/12=4 → 3/4. Vérifie : PGCD(3,4)=1 ✓ irréductible.",
      piege:
        "18/24, 6/8, 9/12 sont des simplifications mais pas MAXIMALES. 3/4 est la forme irréductible.",
      astuce:
        "Divise par le PGCD en une fois → forme irréductible directement. PGCD(36,48)=12 → 3/4.",
    },
  },
  {
    question: "Calcule : 1 + 2/3 - 1/4",
    options: ["3/4", "19/12", "17/12", "5/6"],
    answer: "19/12",
    fiche: {
      regle: "1 = 12/12. 2/3 = 8/12. 1/4 = 3/12. 12/12 + 8/12 - 3/12 = 17/12.",
      exemple: "✅ 1+2/3-1/4 : PPCM(1,3,4)=12. 12/12+8/12-3/12=17/12.",
      piege:
        "1 = 12/12 (avec dénominateur 12). Ne pas oublier de convertir le nombre entier !",
      astuce:
        "Entier → fraction : 1 = 12/12 = 4/4 = 3/3... Choisis le bon dénominateur commun.",
    },
  },
  {
    question: "Résous : x/3 = 4/5",
    options: ["x = 12/5", "x = 12", "x = 20/3", "x = 3/20"],
    answer: "x = 12/5",
    fiche: {
      regle: "x/3 = 4/5. Multiplication en croix : 5×x = 4×3 = 12. x = 12/5.",
      exemple: "✅ x/3 = 4/5 → 5x = 12 → x = 12/5 = 2,4.",
      piege:
        "x = 12 serait vrai si x/3 = 4. Mais ici c'est 4/5. Multiplication en croix correcte : 5x=4×3=12.",
      astuce:
        "a/b = c/d → ad = bc (multiplication en croix). x/3 = 4/5 → 5x = 12 → x = 12/5.",
    },
  },
  {
    question: "Quel est le résultat de (-2/3) × (3/4) ?",
    options: ["6/12", "-1/2", "+1/2", "-6/7"],
    answer: "-1/2",
    fiche: {
      regle:
        "(-2/3) × (3/4) = -(2×3)/(3×4) = -6/12 = -1/2. Signe négatif car (-) × (+).",
      exemple:
        "✅ (-2/3) × (3/4) = -6/12 = -1/2. Règle des signes + simplification.",
      piege:
        "Ne pas oublier le signe ! (-) × (+) = (-). -6/12 = -1/2 (simplification par 6).",
      astuce:
        "Fractions négatives : applique la règle des signes ET simplifie. -6/12 → ÷6 → -1/2.",
    },
  },
  {
    question: "Quel nombre est égal à 0,125 ?",
    options: ["1/8", "1/5", "1/4", "1/125"],
    answer: "1/8",
    fiche: {
      regle:
        "0,125 = 125/1000 = 1/8. Ou : 1÷8 = 0,125. Fractions usuelles à connaître.",
      exemple:
        "✅ 1/8 = 0,125. 1/4 = 0,25. 1/5 = 0,2. 3/4 = 0,75. 1/3 ≈ 0,333.",
      piege:
        "0,125 ≠ 1/125. 1/125 = 0,008. 0,125 = 125 millièmes = 125/1000 = 1/8.",
      astuce:
        "Fractions clés : 1/2=0,5. 1/4=0,25. 1/8=0,125. 1/5=0,2. 1/3≈0,333. À mémoriser !",
    },
  },
];

export default function Fractions2Page() {
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
          <h1 className="lecon-titre">Les fractions avancées</h1>
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
            Approfondis les <strong>fractions</strong> : opérations complexes,
            fractions négatives, équations et conversions décimales.
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
                ➕➖ Addition/soustraction
              </div>
              <div className="lecon-point-texte">
                PPCM des dénominateurs → convertis → additionne les numérateurs.
                Entier = n/1.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 2/3+5/4 :
                PPCM=12 → 8/12+15/12=23/12.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ✖️➗ Multiplication/division
              </div>
              <div className="lecon-point-texte">
                ×: numérateur×numérateur / dénominateur×dénominateur. ÷:
                multiplier par l'inverse. Simplifie avant si possible.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 2/3 × 9/4 =
                18/12 = 3/2. 5/6 ÷ 5/9 = 5/6 × 9/5 = 3/2.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔢 Fractions et décimaux</div>
              <div className="lecon-point-texte">
                1/2=0,5. 1/4=0,25. 1/8=0,125. 1/5=0,2. 1/3≈0,333. Multiplication
                en croix pour résoudre x/a=b/c.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> x/3=4/5 → 5x=12
                → x=12/5.
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
