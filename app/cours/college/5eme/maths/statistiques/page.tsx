"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "maths";
const THEME = "statistiques";

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
    question: "Comment calcule-t-on la moyenne d'une série de données ?",
    options: [
      "On additionne et on divise par le plus grand",
      "On additionne toutes les valeurs et on divise par le nombre de valeurs",
      "On prend la valeur du milieu",
      "On prend la valeur la plus fréquente",
    ],
    answer:
      "On additionne toutes les valeurs et on divise par le nombre de valeurs",
    fiche: {
      regle: "Moyenne = (somme de toutes les valeurs) ÷ (nombre de valeurs).",
      exemple:
        "✅ Notes : 12, 15, 8, 14, 11. Somme = 60. Nombre = 5. Moyenne = 60÷5 = 12.",
      piege:
        "Diviser par le NOMBRE de valeurs (pas par la valeur maximale ou autre).",
      astuce: "Moyenne = somme ÷ effectif total. 12+15+8+14+11=60. 60÷5=12.",
    },
  },
  {
    question: "Quelle est la médiane de la série : 3, 7, 8, 12, 15 ?",
    options: ["7", "8", "9", "12"],
    answer: "8",
    fiche: {
      regle:
        "La médiane est la valeur du milieu d'une série ORDONNÉE. Ici 5 valeurs : la 3ème = 8.",
      exemple: "✅ Série ordonnée : 3, 7, 8, 12, 15. Milieu = 3ème valeur = 8.",
      piege:
        "Il faut ORDONNER la série d'abord. La médiane n'est pas la moyenne !",
      astuce:
        "Médiane = valeur du milieu (série ordonnée). n impair : milieu = rang (n+1)/2. n pair : moyenne des 2 du milieu.",
    },
  },
  {
    question: "Dans la série 5, 5, 7, 8, 5, 9, quel est le mode ?",
    options: ["5", "7", "8", "9"],
    answer: "5",
    fiche: {
      regle:
        "Le mode est la valeur qui apparaît le plus souvent (la plus fréquente) dans une série.",
      exemple:
        "✅ 5 apparaît 3 fois, 7 une fois, 8 une fois, 9 une fois. Mode = 5.",
      piege:
        "Mode ≠ médiane ≠ moyenne. Le mode est la valeur la PLUS FRÉQUENTE.",
      astuce:
        "Mode = valeur la plus fréquente. Compte les occurrences de chaque valeur.",
    },
  },
  {
    question: "Quelle est la moyenne de la série : 10, 12, 14, 16, 18 ?",
    options: ["12", "13", "14", "15"],
    answer: "14",
    fiche: {
      regle: "Moyenne = (10+12+14+16+18) ÷ 5 = 70 ÷ 5 = 14.",
      exemple:
        "✅ Somme = 10+12+14+16+18 = 70. Nombre de valeurs = 5. Moyenne = 70÷5 = 14.",
      piege:
        "Ne pas prendre la valeur du milieu (14) sans calculer. C'est parfois la même mais pas toujours.",
      astuce:
        "Pour cette série symétrique, la moyenne = valeur du milieu = 14. Mais toujours calculer !",
    },
  },
  {
    question: "Comment lit-on un diagramme en bâtons ?",
    options: [
      "La hauteur de chaque bâton représente la fréquence ou l'effectif",
      "La largeur de chaque bâton représente la valeur",
      "La couleur représente la fréquence",
      "Les bâtons sont toujours dans l'ordre alphabétique",
    ],
    answer: "La hauteur de chaque bâton représente la fréquence ou l'effectif",
    fiche: {
      regle:
        "Dans un diagramme en bâtons : l'axe horizontal = les valeurs, l'axe vertical = effectifs ou fréquences. La hauteur du bâton = combien de fois.",
      exemple: "✅ Bâton à 5 de hauteur 3 → la valeur 5 apparaît 3 fois.",
      piege:
        "Ne pas confondre diagramme en bâtons (valeurs discrètes) et histogramme (données continues).",
      astuce:
        "Diagramme en bâtons → données discrètes (notes, nombre d'enfants). Histogramme → données continues (tailles, poids).",
    },
  },
  {
    question: "Qu'est-ce que l'étendue d'une série statistique ?",
    options: [
      "La valeur la plus grande",
      "La différence entre la valeur maximale et minimale",
      "La somme de toutes les valeurs",
      "Le nombre de valeurs",
    ],
    answer: "La différence entre la valeur maximale et minimale",
    fiche: {
      regle:
        "L'étendue = valeur maximale - valeur minimale. Elle mesure la dispersion des données.",
      exemple: "✅ Série : 3, 7, 8, 12, 15. Étendue = 15 - 3 = 12.",
      piege: "Étendue = max - min (pas max seul, ni la somme).",
      astuce:
        "Étendue = écart entre le plus grand et le plus petit. 15 - 3 = 12.",
    },
  },
  {
    question:
      "Un tableau d'effectifs donne : valeur 2 → 3 fois, valeur 4 → 5 fois, valeur 6 → 2 fois. Quel est l'effectif total ?",
    options: ["8", "10", "12", "6"],
    answer: "10",
    fiche: {
      regle: "L'effectif total = somme de tous les effectifs. 3 + 5 + 2 = 10.",
      exemple:
        "✅ Effectif total = 3+5+2 = 10. On additionne tous les effectifs partiels.",
      piege:
        "Ne pas additionner les valeurs (2+4+6=12) mais les effectifs (3+5+2=10).",
      astuce:
        "Effectif total = somme des effectifs de chaque valeur. Ici : 3+5+2=10.",
    },
  },
  {
    question: "Quelle est la médiane de la série : 2, 4, 6, 8 (4 valeurs) ?",
    options: ["4", "5", "6", "3"],
    answer: "5",
    fiche: {
      regle:
        "Série de 4 valeurs (pair) : médiane = moyenne des 2 valeurs du milieu. Ici : 4 et 6. Médiane = (4+6)/2 = 5.",
      exemple:
        "✅ Série : 2, 4, 6, 8. Valeurs du milieu = 4 et 6. Médiane = (4+6)/2 = 5.",
      piege:
        "Avec un nombre PAIR de valeurs, la médiane n'est pas toujours une valeur de la série.",
      astuce:
        "Pair → moyenne des 2 valeurs centrales. Impair → valeur centrale. 2,4,[6,8] → (4+6)/2=5.",
    },
  },
  {
    question:
      "Dans une classe, les notes de maths sont : 8, 10, 12, 14, 16. Quelle est la moyenne pondérée si 8 a coeff. 2 et les autres coeff. 1 ?",
    options: ["12", "11,33", "11", "13"],
    answer: "11,33",
    fiche: {
      regle:
        "Moyenne pondérée = (somme des valeurs × coefficients) ÷ (somme des coefficients). (8×2+10×1+12×1+14×1+16×1)÷(2+1+1+1+1) = (16+10+12+14+16)÷6 = 68÷6 ≈ 11,33.",
      exemple:
        "✅ 8×2=16, 10×1=10, 12×1=12, 14×1=14, 16×1=16. Somme=68. Coefficients=6. 68÷6≈11,33.",
      piege:
        "Moyenne pondérée ≠ moyenne simple. Multiplier chaque valeur par son coefficient.",
      astuce:
        "Pondérée = (val×coeff) ÷ (somme coeff). La note 8 compte double (coeff 2).",
    },
  },
  {
    question: "Qu'est-ce que la fréquence d'une valeur dans une série ?",
    options: [
      "Le nombre de fois qu'elle apparaît",
      "La proportion (en %) qu'elle représente sur le total",
      "Sa position dans la série ordonnée",
      "La différence avec la moyenne",
    ],
    answer: "La proportion (en %) qu'elle représente sur le total",
    fiche: {
      regle:
        "Fréquence = (effectif de la valeur) ÷ (effectif total) × 100. C'est un pourcentage.",
      exemple:
        "✅ Série de 20 élèves, 5 ont eu 15. Fréquence de 15 = 5/20 × 100 = 25%.",
      piege:
        "Fréquence ≠ effectif. L'effectif = nombre de fois. La fréquence = proportion en %.",
      astuce:
        "Fréquence = effectif/total × 100. Effectif = nombre brut. Fréquence = pourcentage.",
    },
  },
];

export default function StatistiquesPage() {
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
          <div className="lecon-badge">📈 Maths — 5ème</div>
          <h1 className="lecon-titre">Les statistiques</h1>
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
            Les <strong>statistiques</strong> permettent d'analyser des données.
            Moyenne, médiane, mode, étendue... des outils indispensables pour
            comprendre le monde.
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
              <div className="lecon-point-titre">📊 Moyenne, médiane, mode</div>
              <div className="lecon-point-texte">
                Moyenne = somme ÷ effectif. Médiane = valeur du milieu (série
                ordonnée). Mode = valeur la plus fréquente.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 3,7,8,12,15 →
                Moy=(55/5)=11. Méd=8. Mode=aucun.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📏 Étendue et fréquence</div>
              <div className="lecon-point-texte">
                Étendue = max - min. Fréquence = effectif/total × 100 (en %).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 3,7,8,12,15 →
                Étendue = 15-3=12.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📉 Diagrammes</div>
              <div className="lecon-point-texte">
                Diagramme en bâtons (données discrètes), histogramme (données
                continues), diagramme circulaire (proportions).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Notes de classe
                → diagramme en bâtons.
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
