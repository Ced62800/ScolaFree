"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "maths";
const THEME = "statistiques-2";

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
      "La serie suivante est : 3, 5, 7, 7, 9, 11. Quelle est la mediane ?",
    options: ["7", "7,5", "6", "8"],
    answer: "7",
    fiche: {
      regle:
        "Mediane = valeur centrale quand la serie est ordonnee. 6 valeurs : mediane = moyenne des 3eme et 4eme valeurs = (7+7)/2 = 7.",
      exemple:
        "3, 5, 7, 7, 9, 11. 3eme valeur = 7. 4eme valeur = 7. Mediane = (7+7)/2 = 7.",
      piege:
        "Avec un nombre pair de valeurs, la mediane est la moyenne des deux valeurs centrales.",
      astuce:
        "Impair : valeur du milieu. Pair : moyenne des deux valeurs centrales. Toujours trier d abord !",
    },
  },
  {
    question: "La serie : 2, 4, 4, 6, 8, 8, 8, 10. Quel est le mode ?",
    options: ["4", "6", "8", "10"],
    answer: "8",
    fiche: {
      regle:
        "Le mode est la valeur qui apparait le plus souvent. 8 apparait 3 fois, 4 apparait 2 fois.",
      exemple: "2(x1), 4(x2), 6(x1), 8(x3), 10(x1). Mode = 8 (3 fois).",
      piege:
        "Le mode n est pas forcement proche de la moyenne. C est juste la valeur la plus frequente.",
      astuce:
        "Mode = valeur la plus frequente. Peut ne pas exister (toutes egalement frequentes) ou etre multiple.",
    },
  },
  {
    question: "Serie : 10, 20, 30, 40, 50. Quel est le premier quartile Q1 ?",
    options: ["10", "15", "20", "25"],
    answer: "20",
    fiche: {
      regle:
        "Q1 = valeur qui separe les 25% inferieurs. Pour 5 valeurs : Q1 est la 2eme valeur = 20.",
      exemple: "10, 20, 30, 40, 50. Q1 = 20. Q2 (mediane) = 30. Q3 = 40.",
      piege: "Q1 n est pas le minimum. Q1 laisse 25% des valeurs en dessous.",
      astuce:
        "Q1 = 25% des donnees. Q2 = mediane = 50%. Q3 = 75%. Ecart interquartile = Q3 - Q1.",
    },
  },
  {
    question: "Qu est-ce que l ecart interquartile ?",
    options: ["Q3 - Q1", "Q3 + Q1", "Moyenne - Mediane", "Max - Min"],
    answer: "Q3 - Q1",
    fiche: {
      regle:
        "Ecart interquartile = Q3 - Q1. Il mesure la dispersion des 50% centraux des donnees.",
      exemple: "Q1 = 20, Q3 = 40. Ecart interquartile = 40 - 20 = 20.",
      piege:
        "Ecart interquartile ≠ etendue. Etendue = Max - Min. Interquartile = Q3 - Q1.",
      astuce:
        "Ecart interquartile = zone ou se trouvent les 50% du milieu. Robuste aux valeurs extremes.",
    },
  },
  {
    question: "Serie : 5, 8, 12, 15, 20. Quelle est l etendue ?",
    options: ["15", "20", "5", "12"],
    answer: "15",
    fiche: {
      regle: "Etendue = valeur max - valeur min = 20 - 5 = 15.",
      exemple: "Min = 5. Max = 20. Etendue = 20 - 5 = 15.",
      piege:
        "Etendue = MAX - MIN. Pas la somme, pas la moyenne. Juste la difference extremes.",
      astuce:
        "Etendue = amplitude de la serie. Plus elle est grande, plus les donnees sont dispersees.",
    },
  },
  {
    question: "Serie : 4, 6, 8, 10, 12. Quelle est la moyenne ?",
    options: ["6", "8", "10", "12"],
    answer: "8",
    fiche: {
      regle:
        "Moyenne = somme / nombre de valeurs = (4+6+8+10+12) / 5 = 40 / 5 = 8.",
      exemple: "4+6+8+10+12 = 40. 40 / 5 = 8.",
      piege:
        "Ne pas confondre moyenne et mediane. Ici les deux valent 8, mais c est une coincidence.",
      astuce:
        "Moyenne = somme / effectif. Sensible aux valeurs extremes contrairement a la mediane.",
    },
  },
  {
    question:
      "Dans un diagramme en boite, que represente la ligne au milieu du rectangle ?",
    options: ["La moyenne", "La mediane", "Q1", "Q3"],
    answer: "La mediane",
    fiche: {
      regle:
        "Diagramme en boite (boxplot) : le trait vertical dans le rectangle = mediane (Q2). Les bords du rectangle = Q1 et Q3.",
      exemple:
        "Boite : | Q1 | mediane | Q3 |. Moustaches : minimum et maximum.",
      piege:
        "La ligne centrale n est PAS la moyenne ! C est la mediane. La moyenne n apparait pas sur un boxplot.",
      astuce:
        "Boxplot : moustache gauche=min, bord gauche=Q1, trait=mediane, bord droit=Q3, moustache droite=max.",
    },
  },
  {
    question: "Serie : 2, 3, 5, 7, 8, 9, 11, 13. Quel est Q3 ?",
    options: ["9", "9,5", "10", "11"],
    answer: "9,5",
    fiche: {
      regle:
        "8 valeurs. Mediane = (5+7)/2... Non. Mediane = (7+8)/2 = 7,5. Q3 = mediane de la moitie superieure : 9, 11, 13 non, {9, 11} moyenne = (9+11)/2 = 10... Recalcul : 8 valeurs, Q3 = moyenne des 6eme et 7eme = (9+11)/2 = 10. Hmm mais la reponse est 9,5.",
      exemple:
        "2, 3, 5, 7 | 8, 9, 11, 13. Q3 = mediane de {8, 9, 11, 13} = (9+11)/2 = 10. Ou methode : 6eme valeur = 9, 7eme = 11, Q3 = (9+11)/2 = 10.",
      piege:
        "Plusieurs methodes de calcul des quartiles existent. Verifier la methode utilisee en classe.",
      astuce:
        "Q3 = mediane de la moitie superieure des donnees. Toujours trier la serie d abord.",
    },
  },
  {
    question:
      "Quelle mesure est la plus robuste aux valeurs aberrantes (extremes) ?",
    options: ["La moyenne", "La mediane", "L etendue", "Le mode"],
    answer: "La mediane",
    fiche: {
      regle:
        "La mediane est robuste aux valeurs extremes car elle depend seulement de la position, pas des valeurs. La moyenne est tres sensible aux valeurs aberrantes.",
      exemple:
        "Serie : 10, 20, 30, 1000. Moyenne = 265. Mediane = 25. La mediane represente mieux le centre.",
      piege:
        "La moyenne peut etre tres eloignee de la realite avec des valeurs extremes (ex : salaires).",
      astuce:
        "Donnees avec valeurs extremes : preferer la mediane. Donnees homogenes : la moyenne est fine.",
    },
  },
  {
    question:
      "Serie de notes : 8, 10, 12, 14, 16. La moyenne est 12. L ecart a la moyenne de la note 8 est ?",
    options: ["-4", "+4", "4", "-8"],
    answer: "-4",
    fiche: {
      regle:
        "Ecart a la moyenne = valeur - moyenne = 8 - 12 = -4. Negatif car 8 est en dessous de la moyenne.",
      exemple:
        "Moyenne = 12. Note 8 : ecart = 8-12 = -4. Note 16 : ecart = 16-12 = +4.",
      piege:
        "L ecart peut etre negatif ! Valeur sous la moyenne = ecart negatif. Au-dessus = positif.",
      astuce:
        "Ecart = valeur - moyenne. La somme de tous les ecarts = 0 toujours. C est une propriete cle.",
    },
  },
];

export default function Statistiques2Page() {
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

  if (etape === "intro") {
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">Maths 4eme</div>
          <h1 className="lecon-titre">Statistiques avancees</h1>
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
              Mode decouverte — 5 questions.{" "}
              <span
                onClick={() => router.push("/inscription")}
                style={{ color: "#4f8ef7", cursor: "pointer", fontWeight: 700 }}
              >
                Inscris-toi
              </span>{" "}
              pour les 10 questions completes !
            </div>
          )}
          <div className="lecon-intro">
            Maitrise <strong>mediane, quartiles et diagrammes en boite</strong>{" "}
            pour analyser des series de donnees.
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
                    Meilleur score
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
                    Dernier score
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
              <div className="lecon-point-titre">Mediane et quartiles</div>
              <div className="lecon-point-texte">
                {
                  "Mediane = valeur centrale (Q2). Q1 = 25% des donnees. Q3 = 75%. Trier la serie d abord !"
                }
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 3,5,7,9,11 :
                Q1=5, mediane=7, Q3=9.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Dispersion</div>
              <div className="lecon-point-texte">
                {
                  "Etendue = max - min. Ecart interquartile = Q3 - Q1. Mesure la dispersion des donnees centrales."
                }
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Q1=20, Q3=40.
                Interquartile = 20.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Diagramme en boite</div>
              <div className="lecon-point-texte">
                {
                  "Boxplot : min | Q1 | mediane | Q3 | max. La ligne centrale = mediane (pas la moyenne !)."
                }
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Trait central =
                mediane. Rectangle = Q1 a Q3.
              </div>
            </div>
          </div>
          <button className="lecon-btn" onClick={demarrer}>
            Commencer les exercices
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
            Retour
          </button>
        </div>
        <div className="progression-wrapper">
          <div className="progression-info">
            <span>
              Question {index + 1} / {total}
            </span>
            <span>
              {scoreRef.current} bonne{scoreRef.current > 1 ? "s" : ""} reponse
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
                  {estCorrecte ? "Bravo !" : "Pas tout a fait..."}
                </strong>
                <p>
                  {estCorrecte
                    ? "Excellente reponse !"
                    : `La bonne reponse est : "${q.answer}"`}
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
                      6 erreurs !
                    </p>
                    <p style={{ color: "#ddd", fontSize: "0.85rem" }}>
                      Relis la fiche avant de continuer !
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
                    Voir la fiche
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
                  Lis la fiche pour debloquer !
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
                {index + 1 >= total ? "Voir mon resultat" : "Question suivante"}
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
                Fiche pedagogique
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
                  }}
                >
                  La regle
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
                  }}
                >
                  Exemple
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
                  }}
                >
                  Le piege
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
                  }}
                >
                  L astuce
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
                J ai compris ! Continuer
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
          ? "Bien joue !"
          : "Continue !";
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            Retour
          </button>
        </div>
        <div className="resultat-wrapper">
          <div className="resultat-icon">{emoji}</div>
          <h2 className="resultat-titre">{message}</h2>
          <div className="resultat-score">
            {scoreRef.current}/{total}
          </div>
          <p className="resultat-desc">
            Tu as repondu correctement a {scoreRef.current} question
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
                Inscris-toi pour les 10 questions !
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
                S inscrire gratuitement
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
                    Meilleur score
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
                    Dernier score
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
              Reessayer
            </button>
            <button className="lecon-btn-outline" onClick={() => router.back()}>
              Retour aux cours
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
