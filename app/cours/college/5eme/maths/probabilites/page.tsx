"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "maths";
const THEME = "probabilites";

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
      "On lance un dé à 6 faces. Quelle est la probabilité d'obtenir 3 ?",
    options: ["1/3", "1/6", "3/6", "1/2"],
    answer: "1/6",
    fiche: {
      regle:
        "Probabilité = nombre de cas favorables ÷ nombre de cas possibles. Un dé a 6 faces. 1 seule face porte le 3. P(3) = 1/6.",
      exemple:
        "✅ P(3) = 1/6 ≈ 0,167 ≈ 16,7%. Le dé équilibré donne chaque face avec la même probabilité.",
      piege:
        "Ne pas écrire P(3) = 3/6. La face '3' n'apparaît qu'une seule fois (pas 3 fois).",
      astuce:
        "P(événement) = cas favorables / cas possibles. Dé → 1/6 pour chaque face.",
    },
  },
  {
    question:
      "Quelle est la probabilité d'obtenir un nombre pair en lançant un dé à 6 faces ?",
    options: ["1/6", "2/6", "3/6", "4/6"],
    answer: "3/6",
    fiche: {
      regle:
        "Nombres pairs sur un dé : 2, 4, 6 → 3 cas favorables. Cas possibles = 6. P(pair) = 3/6 = 1/2.",
      exemple:
        "✅ P(pair) = 3/6 = 1/2. Il y a autant de nombres pairs que impairs sur un dé.",
      piege:
        "3/6 est correct mais peut être simplifié en 1/2. Les deux sont acceptés.",
      astuce:
        "Pairs : 2, 4, 6 → 3 faces. Impairs : 1, 3, 5 → 3 faces. P(pair) = 3/6 = 1/2.",
    },
  },
  {
    question:
      "Une urne contient 3 boules rouges et 2 boules bleues. Quelle est la probabilité de tirer une boule rouge ?",
    options: ["2/5", "3/5", "3/2", "1/3"],
    answer: "3/5",
    fiche: {
      regle: "Total de boules = 3+2 = 5. Boules rouges = 3. P(rouge) = 3/5.",
      exemple: "✅ P(rouge) = 3/5 = 0,6 = 60%. 3 boules rouges sur 5 au total.",
      piege:
        "Ne pas faire 3/2 (rapport rouges/bleues). Diviser par le TOTAL (pas par les bleues).",
      astuce: "P = cas favorables / cas TOTAUX. Total = 3+2=5. P(rouge) = 3/5.",
    },
  },
  {
    question: "Qu'est-ce qu'un événement certain ?",
    options: [
      "Un événement de probabilité 1/2",
      "Un événement qui ne peut pas se produire",
      "Un événement qui se produit à coup sûr (probabilité = 1)",
      "Un événement rare",
    ],
    answer: "Un événement qui se produit à coup sûr (probabilité = 1)",
    fiche: {
      regle:
        "Probabilité 1 = événement certain (se produit toujours). Probabilité 0 = événement impossible. 0 ≤ P ≤ 1.",
      exemple:
        "✅ Lancer un dé : obtenir un nombre entre 1 et 6 = certain (P=1). Obtenir 7 = impossible (P=0).",
      piege:
        "Certain ≠ fréquent. Un événement certain a P=1 (pas juste probable).",
      astuce:
        "P=0 → impossible. P=1 → certain. 0<P<1 → possible. P=1/2 → équiprobable.",
    },
  },
  {
    question:
      "On lance une pièce 100 fois et on obtient 48 fois face. Quelle est la fréquence de face ?",
    options: ["48%", "52%", "50%", "0,48%"],
    answer: "48%",
    fiche: {
      regle:
        "Fréquence = (nombre d'occurrences / nombre total d'expériences) × 100 = (48/100) × 100 = 48%.",
      exemple: "✅ 48 face sur 100 lancers → fréquence = 48/100 = 0,48 = 48%.",
      piege:
        "La fréquence observée (48%) peut différer de la probabilité théorique (50%).",
      astuce:
        "Fréquence = résultats observés / total. Plus on répète, plus la fréquence se rapproche de la probabilité.",
    },
  },
  {
    question:
      "Dans un jeu de 52 cartes, quelle est la probabilité de tirer un as ?",
    options: [
      "1/52",
      "4/52",
      "1/13",
      "Toutes les réponses b et c sont correctes",
    ],
    answer: "Toutes les réponses b et c sont correctes",
    fiche: {
      regle:
        "Il y a 4 as dans un jeu de 52 cartes. P(as) = 4/52 = 1/13. Les deux formes sont correctes.",
      exemple: "✅ P(as) = 4/52 = 1/13 ≈ 7,7%. 4 as (♠♥♦♣) sur 52 cartes.",
      piege:
        "4/52 et 1/13 sont ÉGAUX. Ne pas choisir l'un contre l'autre quand les deux sont corrects.",
      astuce: "4/52 = 1/13 (divise par 4). P(as) = 4/52 = 1/13 ≈ 7,7%.",
    },
  },
  {
    question: "Quelle est la probabilité d'un événement impossible ?",
    options: ["1", "0,5", "0", "Indéfinie"],
    answer: "0",
    fiche: {
      regle:
        "Un événement impossible ne peut jamais se produire. Sa probabilité est 0.",
      exemple:
        "✅ Obtenir 7 avec un dé à 6 faces = impossible. P = 0. Obtenir pile sur un dé = P = 0.",
      piege:
        "Impossible ≠ rare. Un événement rare a une petite probabilité, mais non nulle.",
      astuce:
        "P=0 → jamais. P=1 → toujours. P=1/2 → une fois sur deux. 0 ≤ P ≤ 1.",
    },
  },
  {
    question:
      "On tire une carte dans un jeu de 52 cartes. Quelle est la probabilité d'obtenir un cœur ?",
    options: ["1/52", "1/13", "1/4", "13/52"],
    answer: "1/4",
    fiche: {
      regle:
        "Il y a 4 couleurs (♠♥♦♣) dans un jeu, chacune avec 13 cartes. P(cœur) = 13/52 = 1/4.",
      exemple:
        "✅ P(cœur) = 13/52 = 1/4 = 25%. 13 cartes de cœur sur 52 total.",
      piege:
        "13/52 et 1/4 sont équivalents. 1/13 serait P(une valeur précise, ex: as de cœur).",
      astuce:
        "4 couleurs équiprobables → P(une couleur) = 1/4. 13 cartes/couleur → P(valeur précise) = 1/13.",
    },
  },
  {
    question: "Qu'est-ce qu'une expérience aléatoire ?",
    options: [
      "Une expérience dont on connaît le résultat à l'avance",
      "Une expérience dont le résultat dépend du hasard",
      "Une expérience de physique",
      "Une expérience qui dure longtemps",
    ],
    answer: "Une expérience dont le résultat dépend du hasard",
    fiche: {
      regle:
        "Une expérience aléatoire est une expérience dont on ne peut pas prédire le résultat avec certitude. Ex: lancer un dé, tirer une carte.",
      exemple:
        "✅ Lancer un dé = aléatoire (on ne sait pas quelle face). Additionner 2+2 = déterministe (toujours 4).",
      piege:
        "Aléatoire ≠ incontrôlable. Une expérience aléatoire a des résultats possibles définis (1 à 6 pour un dé).",
      astuce:
        "Aléatoire = hasard. Les résultats POSSIBLES sont connus, mais pas lequel se produira.",
    },
  },
  {
    question:
      "Si P(A) = 0,3, quelle est la probabilité de l'événement contraire (non A) ?",
    options: ["0,3", "0,7", "0,6", "1,3"],
    answer: "0,7",
    fiche: {
      regle:
        "P(non A) = 1 - P(A). La somme des probabilités d'un événement et de son contraire = 1.",
      exemple:
        "✅ P(A) = 0,3 → P(non A) = 1 - 0,3 = 0,7. Soit A se produit, soit non A. P(A) + P(non A) = 1.",
      piege:
        "P(non A) ≠ 1 - 0,3 seulement si les événements sont bien A et non-A (complémentaires).",
      astuce:
        "P(A) + P(non A) = 1 TOUJOURS. P(non A) = 1 - P(A). 0,3 + 0,7 = 1 ✓",
    },
  },
];

export default function ProbabilitesPage() {
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
          <div className="lecon-badge">🎲 Maths — 5ème</div>
          <h1 className="lecon-titre">Les probabilités</h1>
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
            Les <strong>probabilités</strong> mesurent les chances qu'un
            événement se produise. Dés, cartes, urnes... le hasard obéit à des
            règles mathématiques !
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
                🎯 Calcul d'une probabilité
              </div>
              <div className="lecon-point-texte">
                P(événement) = cas favorables ÷ cas possibles. 0 ≤ P ≤ 1. P=0 →
                impossible. P=1 → certain.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Dé : P(3) =
                1/6. P(pair) = 3/6 = 1/2.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔄 Événement contraire</div>
              <div className="lecon-point-texte">
                P(non A) = 1 - P(A). La somme des probabilités d'un événement et
                son contraire = 1.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> P(A)=0,3 →
                P(non A)=0,7.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                📊 Fréquence et probabilité
              </div>
              <div className="lecon-point-texte">
                La fréquence observée se rapproche de la probabilité théorique
                quand on répète l'expérience. Loi des grands nombres.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 1000 lancers
                d'une pièce → fréquence face ≈ 50%.
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
