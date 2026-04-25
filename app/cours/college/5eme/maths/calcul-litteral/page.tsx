"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "maths";
const THEME = "calcul-litteral";

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
    question: "Que signifie 3x dans une expression algébrique ?",
    options: ["3 + x", "3 - x", "3 × x", "3 ÷ x"],
    answer: "3 × x",
    fiche: {
      regle:
        "En calcul littéral, lorsqu'un chiffre est collé à une lettre (comme 3x), cela signifie une multiplication : 3x = 3 × x.",
      exemple:
        "✅ 3x = 3 × x. 5y = 5 × y. ab = a × b. Le signe × est omis par convention.",
      piege:
        "3x ≠ 3 + x. La juxtaposition d'un nombre et d'une lettre signifie toujours la multiplication !",
      astuce:
        "Lettre collée à un chiffre = multiplication. 3x = 3 fois x. xy = x fois y. Toujours !",
    },
  },
  {
    question: "Développez : 3(x + 4)",
    options: ["3x + 4", "3x + 12", "x + 12", "3x + 7"],
    answer: "3x + 12",
    fiche: {
      regle:
        "Pour développer : on distribue le facteur à chaque terme entre parenthèses. k(a+b) = ka + kb.",
      exemple:
        "✅ 3(x+4) = 3×x + 3×4 = 3x + 12. On multiplie 3 par CHAQUE terme.",
      piege:
        "3(x+4) ≠ 3x + 4. Il faut multiplier 3 par x ET par 4. 3×4=12, pas 3+4=7.",
      astuce:
        "Développer = distribuer. 3(x+4) : 3 distribué sur x → 3x, 3 distribué sur 4 → 12. Total : 3x+12.",
    },
  },
  {
    question: "Développez : 2(3x - 5)",
    options: ["6x - 5", "3x - 10", "6x - 10", "6x + 10"],
    answer: "6x - 10",
    fiche: {
      regle:
        "k(a-b) = ka - kb. Attention au signe : on distribue le facteur et on garde le signe de chaque terme.",
      exemple:
        "✅ 2(3x-5) = 2×3x - 2×5 = 6x - 10. On multiplie 2 par 3x et par 5, en gardant le signe -.",
      piege: "2(3x-5) ≠ 6x+10. Le signe - reste : 2×(-5) = -10, pas +10 !",
      astuce:
        "Distribue le facteur sur chaque terme avec son signe. 2×3x=6x, 2×(-5)=-10 → 6x-10.",
    },
  },
  {
    question: "Factorisez : 6x + 9",
    options: ["3(2x + 3)", "6(x + 3)", "3(6x + 9)", "2x(3 + 9)"],
    answer: "3(2x + 3)",
    fiche: {
      regle:
        "Factoriser = mettre en facteur commun. On cherche le plus grand facteur commun des termes.",
      exemple:
        "✅ 6x + 9 : PGCD(6,9)=3. 6x=3×2x, 9=3×3. Donc 6x+9 = 3(2x+3). Vérifie : 3×2x+3×3=6x+9 ✓.",
      piege:
        "3(6x+9) n'est pas factorisé car on peut encore sortir un 3 : 3×(6x+9) ≠ factorisation correcte.",
      astuce:
        "Factoriser = INVERSE de développer. Cherche le plus grand nombre qui divise tous les coefficients.",
    },
  },
  {
    question: "Calculez l'expression 2x + 3 pour x = 4.",
    options: ["11", "14", "10", "9"],
    answer: "11",
    fiche: {
      regle:
        "Pour calculer une expression avec x : remplace x par sa valeur numérique et calcule.",
      exemple:
        "✅ 2x+3 pour x=4 : 2×4+3 = 8+3 = 11. On remplace x par 4 partout.",
      piege: "Ne pas oublier de calculer 2×4=8 (pas 2+4=6) avant d'ajouter 3.",
      astuce:
        "Substitution : remplace la lettre par le nombre, puis calcule normalement. x=4 → 2(4)+3=8+3=11.",
    },
  },
  {
    question: "Simplifiez : 5x + 3x",
    options: ["8x²", "15x", "8x", "53x"],
    answer: "8x",
    fiche: {
      regle:
        "On peut additionner les termes semblables (même lettre, même exposant). 5x + 3x = (5+3)x = 8x.",
      exemple: "✅ 5x + 3x = 8x. Même comme 5 pommes + 3 pommes = 8 pommes.",
      piege:
        "5x + 3x ≠ 8x². Pas d'exposant ! On additionne les coefficients : 5+3=8, la variable reste x.",
      astuce:
        "Termes semblables = même lettre. 5x + 3x = (5+3)x = 8x. Comme des fruits : 5 pommes + 3 pommes = 8 pommes.",
    },
  },
  {
    question: "Simplifiez : 4x + 2 + 3x - 5",
    options: ["9x - 3", "7x - 3", "7x + 7", "7x - 7"],
    answer: "7x - 3",
    fiche: {
      regle:
        "Regroupe les termes semblables : termes en x d'un côté, nombres de l'autre. 4x+3x=7x, 2-5=-3.",
      exemple: "✅ 4x+2+3x-5 = (4x+3x)+(2-5) = 7x+(-3) = 7x-3.",
      piege:
        "Ne pas mélanger termes en x et nombres. 4x et 2 ne peuvent pas être additionnés ensemble.",
      astuce:
        "Regroupe x avec x, nombres avec nombres. (4x+3x)+(2-5) = 7x-3. Toujours séparer lettres et nombres.",
    },
  },
  {
    question: "Que vaut 2(x + 3) - 4 pour x = 1 ?",
    options: ["4", "6", "2", "-2"],
    answer: "4",
    fiche: {
      regle:
        "D'abord développer, puis substituer, ou substituer directement. Les deux méthodes donnent le même résultat.",
      exemple:
        "✅ Méthode 1 : 2(1+3)-4 = 2×4-4 = 8-4 = 4. Méthode 2 : développe d'abord 2x+6-4=2x+2, puis x=1 : 2+2=4.",
      piege:
        "Respecter les priorités : d'abord les parenthèses. 2(1+3) = 2×4 = 8, puis 8-4=4.",
      astuce:
        "Avec une valeur, substitue directement dans l'expression. 2(1+3)-4 = 2×4-4 = 8-4 = 4.",
    },
  },
  {
    question: "Développez et simplifiez : 3(x + 2) + 2(x - 1)",
    options: ["5x + 4", "5x + 8", "5x - 4", "6x + 4"],
    answer: "5x + 4",
    fiche: {
      regle:
        "Développe chaque parenthèse, puis regroupe les termes semblables.",
      exemple: "✅ 3(x+2)+2(x-1) = 3x+6+2x-2 = (3x+2x)+(6-2) = 5x+4.",
      piege:
        "Attention au 2(x-1) : 2×(-1)=-2 (pas +2). Le signe - doit être distribué !",
      astuce:
        "Développe tout d'abord : 3x+6+2x-2. Regroupe ensuite : (3x+2x)+(6-2) = 5x+4.",
    },
  },
  {
    question: "Factorisez : 4x + 8",
    options: ["2(2x + 4)", "4(x + 2)", "4(x + 8)", "2(4x + 8)"],
    answer: "4(x + 2)",
    fiche: {
      regle:
        "PGCD(4,8)=4. On sort 4 en facteur : 4x=4×x, 8=4×2. Donc 4x+8 = 4(x+2).",
      exemple:
        "✅ 4x+8 = 4(x+2). Vérifie : 4×x+4×2=4x+8 ✓. 2(2x+4) est aussi correct mais pas complètement factorisé.",
      piege:
        "2(2x+4) n'est pas la factorisation maximale car 2x+4 peut encore être factorisé par 2.",
      astuce:
        "Prendre le PLUS GRAND facteur commun. PGCD(4,8)=4, donc 4(x+2) est la factorisation maximale.",
    },
  },
];

export default function CalculLitteralPage() {
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
          <h1 className="lecon-titre">Le calcul littéral</h1>
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
            Le <strong>calcul littéral</strong> utilise des lettres pour
            représenter des nombres. Apprends à développer, factoriser et
            simplifier des expressions algébriques.
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
                📐 Les expressions littérales
              </div>
              <div className="lecon-point-texte">
                3x = 3×x. On peut substituer une valeur à la lettre pour
                calculer le résultat.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 2x+3 pour x=4 :
                2×4+3 = 11
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📤 Développer</div>
              <div className="lecon-point-texte">
                k(a+b) = ka + kb. On distribue le facteur à chaque terme entre
                parenthèses.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 3(x+4) = 3x+12
                | 2(3x-5) = 6x-10
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📥 Factoriser</div>
              <div className="lecon-point-texte">
                Inverse du développement. On met le facteur commun en évidence.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 6x+9 = 3(2x+3)
                | 4x+8 = 4(x+2)
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
