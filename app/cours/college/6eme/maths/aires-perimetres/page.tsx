"use client";

import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "maths";
const THEME = "aires-perimetres";

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
    question:
      "Quel est le périmètre d'un rectangle de longueur 8 cm et de largeur 5 cm ?",
    options: ["26 cm", "40 cm", "13 cm", "20 cm"],
    answer: "26 cm",
    fiche: {
      regle:
        "Périmètre d'un rectangle = 2 x (longueur + largeur). On additionne les 4 côtés.",
      exemple: "✅ P = 2 x (8 + 5) = 2 x 13 = 26 cm",
      piege:
        "Ne pas faire 8 + 5 = 13 cm ! Le périmètre c'est le tour complet : 8+5+8+5 = 26 cm.",
      astuce:
        "Rectangle : P = 2 x (L + l). Carré : P = 4 x côté. Retiens ces deux formules !",
    },
  },
  {
    question:
      "Quelle est l'aire d'un rectangle de longueur 7 cm et de largeur 4 cm ?",
    options: ["22 cm2", "28 cm2", "11 cm2", "14 cm2"],
    answer: "28 cm2",
    fiche: {
      regle:
        "Aire d'un rectangle = longueur x largeur. L'aire se mesure en cm2 (centimètres carrés).",
      exemple: "✅ A = 7 x 4 = 28 cm2",
      piege:
        "Le périmètre se mesure en cm (longueur) et l'aire en cm2 (surface). Ne pas confondre !",
      astuce:
        "Rectangle : A = L x l. C'est comme compter le nombre de petits carrés d'1 cm de côté qui rentrent dedans.",
    },
  },
  {
    question: "Quel est le périmètre d'un carré de côté 6 cm ?",
    options: ["12 cm", "18 cm", "24 cm", "36 cm"],
    answer: "24 cm",
    fiche: {
      regle: "Périmètre d'un carré = 4 x côté. Un carré a 4 côtés égaux.",
      exemple: "✅ P = 4 x 6 = 24 cm",
      piege:
        "Ne pas faire 6 x 6 = 36 (c'est l'aire !). Le périmètre c'est 4 x côté = 24 cm.",
      astuce:
        "Carré : P = 4 x côté et A = côté x côté. Ne pas confondre les deux formules !",
    },
  },
  {
    question:
      "Quelle est l'aire d'un triangle de base 10 cm et de hauteur 6 cm ?",
    options: ["60 cm2", "30 cm2", "16 cm2", "32 cm2"],
    answer: "30 cm2",
    fiche: {
      regle: "Aire d'un triangle = (base x hauteur) divise par 2.",
      exemple: "✅ A = (10 x 6) / 2 = 60 / 2 = 30 cm2",
      piege:
        "Ne pas oublier de diviser par 2 ! Un triangle = la moitié d'un rectangle de mêmes dimensions.",
      astuce:
        "Triangle : A = (b x h) / 2. Imagine le rectangle de même base et hauteur, le triangle en est la moitié !",
    },
  },
  {
    question: "Le périmètre d'un carré est 36 cm. Quel est son côté ?",
    options: ["6 cm", "9 cm", "12 cm", "18 cm"],
    answer: "9 cm",
    fiche: {
      regle: "P = 4 x côté donc côté = P divise par 4. 36 divise par 4 = 9 cm.",
      exemple: "✅ côté = 36 / 4 = 9 cm. Vérification : 4 x 9 = 36 cm.",
      piege:
        "Ne pas diviser par 2 ! Un carré a 4 côtés, donc on divise le périmètre par 4.",
      astuce:
        "côté = périmètre / 4. Si P = 36, côté = 36/4 = 9 cm. Toujours vérifier : 4 x 9 = 36.",
    },
  },
  {
    question: "Quelle est l'aire d'un carré de côté 5 cm ?",
    options: ["10 cm2", "20 cm2", "25 cm2", "15 cm2"],
    answer: "25 cm2",
    fiche: {
      regle: "Aire d'un carré = côté x côté = côté au carré.",
      exemple: "✅ A = 5 x 5 = 25 cm2",
      piege:
        "Ne pas faire 4 x 5 = 20 (c'est le périmètre !). L'aire c'est côté x côté = 25 cm2.",
      astuce:
        "Carré : A = côté x côté. Périmètre = 4 x côté. Ici A = 5 x 5 = 25 cm2.",
    },
  },
  {
    question:
      "Quelle est la circonférence d'un cercle de rayon 7 cm ? (prendre pi = 3,14)",
    options: ["21,98 cm", "43,96 cm", "153,86 cm", "14 cm"],
    answer: "43,96 cm",
    fiche: {
      regle:
        "Circonférence (périmètre du cercle) = 2 x pi x rayon = pi x diamètre. Avec pi = 3,14.",
      exemple: "✅ C = 2 x 3,14 x 7 = 6,28 x 7 = 43,96 cm",
      piege:
        "Ne pas confondre rayon et diamètre ! Diamètre = 2 x rayon. Ici rayon = 7 donc diamètre = 14.",
      astuce:
        "Circonférence = 2 x pi x r = pi x d. Retiens : C = 2pir ou C = pid !",
    },
  },
  {
    question:
      "Quelle est l'aire d'un cercle de rayon 5 cm ? (prendre pi = 3,14)",
    options: ["15,7 cm2", "31,4 cm2", "78,5 cm2", "157 cm2"],
    answer: "78,5 cm2",
    fiche: {
      regle: "Aire d'un disque = pi x rayon x rayon = pi x r2. Avec pi = 3,14.",
      exemple: "✅ A = 3,14 x 5 x 5 = 3,14 x 25 = 78,5 cm2",
      piege:
        "Ne pas confondre avec la circonférence ! L'aire du disque = pi x r2 et non 2 x pi x r.",
      astuce:
        "Aire du disque = pi x r x r. Circonférence = 2 x pi x r. Retiens les deux formules !",
    },
  },
  {
    question:
      "Un rectangle a un périmètre de 30 cm et une longueur de 10 cm. Quelle est sa largeur ?",
    options: ["3 cm", "5 cm", "8 cm", "20 cm"],
    answer: "5 cm",
    fiche: {
      regle:
        "P = 2 x (L + l) donc L + l = P/2 = 30/2 = 15. Largeur = 15 - longueur = 15 - 10 = 5 cm.",
      exemple:
        "✅ L + l = 30/2 = 15. l = 15 - 10 = 5 cm. Vérif : 2 x (10+5) = 30.",
      piege:
        "Ne pas faire P divise par 4 (c'est pour le carré). Pour le rectangle : L + l = P/2.",
      astuce:
        "P = 2(L+l) donc L+l = P/2. Trouve l : l = P/2 - L = 15 - 10 = 5 cm.",
    },
  },
  {
    question:
      "Quelle est l'aire d'un triangle rectangle de côtés 3 cm et 4 cm ?",
    options: ["12 cm2", "6 cm2", "7 cm2", "24 cm2"],
    answer: "6 cm2",
    fiche: {
      regle:
        "Aire d'un triangle = (base x hauteur) / 2. Dans un triangle rectangle, les deux côtés de l'angle droit sont la base et la hauteur.",
      exemple: "✅ A = (3 x 4) / 2 = 12 / 2 = 6 cm2",
      piege:
        "Ne pas oublier de diviser par 2 ! Et ne pas confondre avec l'hypoténuse (le grand côté).",
      astuce:
        "Triangle rectangle : les deux côtés de l'angle droit = base et hauteur. A = (3 x 4)/2 = 6 cm2.",
    },
  },
];

export default function AiresPerimetresPage() {
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
          <h1 className="lecon-titre">Aires et périmètres</h1>
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
            Le <strong>périmètre</strong> est la longueur du contour d'une
            figure. L'<strong>aire</strong> est la surface intérieure. Ces deux
            mesures n'ont pas les mêmes unités !
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
              <div className="lecon-point-titre">📐 Périmètres des figures</div>
              <div className="lecon-point-texte">
                Rectangle : P = 2 x (L + l). Carré : P = 4 x côté. Cercle : C =
                2 x pi x r.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Rectangle 8x5 :
                P = 2 x (8+5) = 26 cm
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📏 Aires des figures</div>
              <div className="lecon-point-texte">
                Rectangle : A = L x l. Carré : A = c x c. Triangle : A = (b x h)
                / 2. Disque : A = pi x r x r.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Triangle base
                10, hauteur 6 : A = (10 x 6) / 2 = 30 cm2
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">⚠️ Périmètre vs Aire</div>
              <div className="lecon-point-texte">
                Le périmètre se mesure en cm (ou m, km...). L'aire se mesure en
                cm2 (ou m2, km2...).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Carré côté 5 cm :</span> P = 4 x
                5 = 20 cm et A = 5 x 5 = 25 cm2
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
