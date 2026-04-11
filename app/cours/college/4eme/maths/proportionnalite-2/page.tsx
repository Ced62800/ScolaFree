"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "maths";
const THEME = "proportionnalite-2";

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
      "Un article coute 80€. Apres une hausse de 15%, quel est son nouveau prix ?",
    options: ["95€", "92€", "68€", "15€"],
    answer: "92€",
    fiche: {
      regle:
        "Hausse de 15% : nouveau prix = prix x (1 + 15/100) = prix x 1,15. 80 x 1,15 = 92€.",
      exemple: "80 x 1,15 = 92€. Ou : 15% de 80 = 12€. 80+12 = 92€.",
      piege: "Ne pas ajouter 15 directement ! 15% de 80 = 12€ (pas 15€).",
      astuce: "+p% : multiplier par (1+p/100). +15% : multiplier par 1,15.",
    },
  },
  {
    question:
      "Un article coute 120€. Apres une baisse de 25%, quel est son prix solde ?",
    options: ["95€", "90€", "30€", "145€"],
    answer: "90€",
    fiche: {
      regle: "Baisse de 25% : nouveau prix = 120 x 0,75 = 90€.",
      exemple: "120 x 0,75 = 90€. Ou : 25% de 120 = 30€. 120-30 = 90€.",
      piege: "Ne pas soustraire 25 directement ! 25% de 120 = 30€ (pas 25€).",
      astuce: "-p% : multiplier par (1-p/100). -25% : multiplier par 0,75.",
    },
  },
  {
    question:
      "Le prix d'un livre passe de 20€ a 25€. Quel est le pourcentage d'augmentation ?",
    options: ["5%", "20%", "25%", "125%"],
    answer: "25%",
    fiche: {
      regle:
        "Taux = (valeur finale - valeur initiale) / valeur initiale x 100. (25-20)/20 x 100 = 25%.",
      exemple: "(25-20)/20 x 100 = 5/20 x 100 = 25%.",
      piege:
        "L'augmentation est de 5€, mais le TAUX est de 25% (par rapport a 20€, pas 25€).",
      astuce:
        "Taux = (final - initial) / initial x 100. Toujours divise par la valeur INITIALE.",
    },
  },
  {
    question: "Quel est le coefficient multiplicateur d'une hausse de 30% ?",
    options: ["0,30", "1,30", "130", "0,70"],
    answer: "1,30",
    fiche: {
      regle:
        "Coefficient multiplicateur = 1 + taux/100. Hausse 30% : CM = 1 + 0,30 = 1,30.",
      exemple: "+30% : multiplier par 1,30. -30% : multiplier par 0,70.",
      piege: "CM de hausse superieur a 1. CM de baisse inferieur a 1.",
      astuce: "Hausse p% : CM = 1+p/100. Baisse p% : CM = 1-p/100.",
    },
  },
  {
    question: "Apres une hausse de 20% puis une baisse de 20%, le prix est :",
    options: [
      "Inchange",
      "Inferieur au prix initial",
      "Superieur au prix initial",
      "Ca depend du prix",
    ],
    answer: "Inferieur au prix initial",
    fiche: {
      regle:
        "+20% puis -20% : CM = 1,20 x 0,80 = 0,96. Le prix final est 96% du prix initial.",
      exemple:
        "100€ : +20% = 120€, -20% = 96€. Inferieur car CM = 1,2 x 0,8 = 0,96.",
      piege: "Hausse puis baisse du meme % ne revient pas au prix initial !",
      astuce:
        "Variations successives : multiplie les CM. 1,2 x 0,8 = 0,96 donc -4%.",
    },
  },
  {
    question:
      "Le salaire de Paul augmente de 10% chaque annee. Apres 2 ans, quel est le taux global ?",
    options: ["20%", "21%", "22%", "110%"],
    answer: "21%",
    fiche: {
      regle:
        "Deux hausses de 10% : CM = 1,10 x 1,10 = 1,21. Taux global = +21%.",
      exemple: "CM = 1,1^2 = 1,21. Si 1000€ : 1100€ puis 1210€. +210€ = +21%.",
      piege:
        "+10% deux fois n'est pas +20% car la 2eme hausse s'applique sur le nouveau salaire.",
      astuce:
        "Hausses successives : multiplie les CM. 1,10 x 1,10 = 1,21 donc +21%.",
    },
  },
  {
    question:
      "En 2020, une ville a 50 000 habitants. En 2023, elle en a 55 000. Taux d'evolution ?",
    options: ["+5%", "+10%", "+5000%", "+9%"],
    answer: "+10%",
    fiche: {
      regle: "Taux = (55000-50000)/50000 x 100 = 5000/50000 x 100 = 10%.",
      exemple:
        "(55000-50000)/50000 x 100 = 10%. La ville a gagne 10% d'habitants.",
      piege:
        "5000 habitants de plus n'est pas un taux. Le taux = rapport a la valeur initiale x 100.",
      astuce: "Taux = (ecart / valeur initiale) x 100. 5000/50000 = 0,1 = 10%.",
    },
  },
  {
    question: "Si CM = 0,85, quel est le taux d'evolution ?",
    options: ["+85%", "-85%", "-15%", "+15%"],
    answer: "-15%",
    fiche: {
      regle: "CM = 0,85 : taux = (0,85 - 1) x 100 = -15%. Diminution de 15%.",
      exemple: "CM 0,85 : on garde 85% du prix, donc baisse de 15%.",
      piege: "CM = 0,85 ne signifie pas -85%. Taux = (CM - 1) x 100 = -15%.",
      astuce: "CM vers taux : (CM-1) x 100. 0,85 donne -15%. 1,3 donne +30%.",
    },
  },
  {
    question:
      "Un commercant achete un article 60€ et le revend 78€. Quel est son taux de benefice ?",
    options: ["18%", "23%", "30%", "33%"],
    answer: "30%",
    fiche: {
      regle:
        "Taux = (prix vente - prix achat) / prix achat x 100. (78-60)/60 x 100 = 30%.",
      exemple: "(78-60)/60 x 100 = 18/60 x 100 = 0,3 x 100 = 30%.",
      piege:
        "Ne pas diviser par le prix de VENTE. Le benefice est par rapport au prix d'ACHAT.",
      astuce:
        "Benefice % = (vente-achat)/ACHAT x 100. Toujours par rapport au cout d'achat.",
    },
  },
  {
    question:
      "Apres une baisse de 40%, un article coute 48€. Quel etait son prix initial ?",
    options: ["28,80€", "67,20€", "80€", "88€"],
    answer: "80€",
    fiche: {
      regle:
        "Apres -40% : prix final = prix initial x 0,60. 48 = prix initial x 0,60. Prix initial = 48/0,60 = 80€.",
      exemple:
        "48 = x x 0,60. x = 48/0,60 = 80€. Verification : 80 x 0,60 = 48.",
      piege:
        "+40% sur 48 ne donne pas le prix initial. Il faut diviser par 0,60.",
      astuce: "Prix initial = prix final / CM. 48/0,60 = 80€.",
    },
  },
];

export default function Proportionnalite2Page() {
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
            Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">Maths 4eme</div>
          <h1 className="lecon-titre">La proportionnalite (2)</h1>
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
            Maitrise les <strong>pourcentages d evolution</strong> et le
            coefficient multiplicateur.
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
              <div className="lecon-point-titre">
                Coefficient multiplicateur
              </div>
              <div className="lecon-point-texte">
                {
                  "Hausse p% : CM = 1+p/100 (>1). Baisse p% : CM = 1-p/100 (<1). Prix final = prix initial x CM."
                }
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> +15% : x1,15.
                -25% : x0,75. 80x1,15=92€.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Taux d evolution</div>
              <div className="lecon-point-texte">
                Taux = (final - initial) / initial x 100. Toujours divise par la
                valeur INITIALE.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 20€ vers 25€ :
                (25-20)/20 x 100 = +25%.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Variations successives</div>
              <div className="lecon-point-texte">
                Plusieurs variations : multiplie les CM. +20% puis -20% = 1,2 x
                0,8 = 0,96 = -4% (pas 0% !).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> +10% puis +10%
                = 1,1^2 = 1,21 = +21%.
              </div>
            </div>
          </div>
          <button className="lecon-btn" onClick={demarrer}>
            Commencer les exercices
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
                Mode decouverte. Inscris-toi pour les 10 questions !
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
