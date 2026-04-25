"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "maths";
const THEME = "probabilites-2";

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
      "On lance un de a 6 faces. Quelle est la probabilite d obtenir un nombre pair ?",
    options: ["1/6", "1/3", "1/2", "2/3"],
    answer: "1/2",
    fiche: {
      regle:
        "Nombres pairs : 2, 4, 6 soit 3 cas favorables sur 6 cas possibles. P = 3/6 = 1/2.",
      exemple:
        "P(pair) = 3/6 = 1/2. P(impair) = 3/6 = 1/2. P(multiple de 3) = 2/6 = 1/3.",
      piege:
        "Ne pas oublier que 0 n est pas sur un de classique. Les faces sont 1, 2, 3, 4, 5, 6.",
      astuce:
        "P = nombre de cas favorables / nombre de cas possibles. Toujours entre 0 et 1.",
    },
  },
  {
    question:
      "Une urne contient 3 boules rouges et 7 boules bleues. On tire une boule au hasard. P(rouge) = ?",
    options: ["3/7", "7/10", "3/10", "1/3"],
    answer: "3/10",
    fiche: {
      regle:
        "Total = 3 + 7 = 10 boules. Cas favorables (rouge) = 3. P(rouge) = 3/10.",
      exemple:
        "P(rouge) = 3/10 = 0,3. P(bleue) = 7/10 = 0,7. P(rouge) + P(bleue) = 1.",
      piege:
        "Ne pas diviser par 7 (boules bleues) mais par 10 (total). 3/7 est faux.",
      astuce: "Total = somme de toutes les boules. P = boules voulues / total.",
    },
  },
  {
    question:
      "Si P(A) = 0,3, quelle est la probabilite de l evenement contraire ?",
    options: ["0,3", "0,7", "0,6", "1,3"],
    answer: "0,7",
    fiche: {
      regle: "P(contraire de A) = 1 - P(A). P(A complement) = 1 - 0,3 = 0,7.",
      exemple:
        "P(A) = 0,3. P(non A) = 1 - 0,3 = 0,7. P(A) + P(non A) = 1 toujours.",
      piege: "P(contraire) = 1 - P(A), pas 1 + P(A) ni P(A) lui-meme.",
      astuce:
        "Complementaire : P(non A) = 1 - P(A). La somme des probabilites = 1.",
    },
  },
  {
    question: "On tire une carte dans un jeu de 52 cartes. P(as) = ?",
    options: [
      "1/52",
      "4/52",
      "1/13",
      "Les deux reponses b et c sont correctes",
    ],
    answer: "Les deux reponses b et c sont correctes",
    fiche: {
      regle:
        "Il y a 4 as dans 52 cartes. P(as) = 4/52 = 1/13. Les deux fractions sont equivalentes.",
      exemple:
        "P(as) = 4/52 = 1/13. P(coeur) = 13/52 = 1/4. P(figure) = 12/52 = 3/13.",
      piege:
        "4/52 et 1/13 sont la meme probabilite ! Toujours simplifier les fractions.",
      astuce: "Simplifie toujours la fraction. 4/52 : divise par 4 donne 1/13.",
    },
  },
  {
    question: "On lance deux pieces. P(deux faces) = ?",
    options: ["1/2", "1/4", "1/3", "2/4"],
    answer: "1/4",
    fiche: {
      regle:
        "Espace : FF, FP, PF, PP soit 4 issues. Un seul cas favorable (FF). P = 1/4.",
      exemple:
        "Issues : FF, FP, PF, PP. P(deux faces) = 1/4. P(une face) = 2/4 = 1/2.",
      piege:
        "Ne pas dire P = 1/2 x 1/2 sans construire l espace. Les 4 issues sont equiprobables.",
      astuce:
        "Deux experiences : n1 x n2 issues totales. 2 x 2 = 4 issues. Cas favorables = 1.",
    },
  },
  {
    question:
      "Dans une classe de 30 eleves, 18 font du sport. On choisit un eleve au hasard. P(sport) = ?",
    options: ["18%", "3/5", "2/3", "18/100"],
    answer: "3/5",
    fiche: {
      regle:
        "P(sport) = 18/30 = 3/5. Simplification : 18/30, divise par 6 donne 3/5.",
      exemple:
        "P(sport) = 18/30 = 3/5 = 0,6 = 60%. P(pas sport) = 12/30 = 2/5 = 40%.",
      piege: "18% est faux ! 18% signifierait 18/100, pas 18/30.",
      astuce:
        "P = 18/30 = 3/5. Toujours diviser par le total de la classe, pas par 100.",
    },
  },
  {
    question:
      "On tire au hasard un nombre entier entre 1 et 20. P(multiple de 4) = ?",
    options: ["1/4", "1/5", "4/20", "Les reponses a et c sont correctes"],
    answer: "Les reponses a et c sont correctes",
    fiche: {
      regle:
        "Multiples de 4 entre 1 et 20 : 4, 8, 12, 16, 20 soit 5 nombres. P = 5/20 = 1/4.",
      exemple:
        "P(multiple de 4) = 5/20 = 1/4. Verification : 4, 8, 12, 16, 20 = 5 valeurs.",
      piege:
        "Bien compter tous les multiples : 4x1=4, 4x2=8, 4x3=12, 4x4=16, 4x5=20. 5 valeurs.",
      astuce:
        "Liste les multiples systematiquement. 5/20 = 1/4 apres simplification par 5.",
    },
  },
  {
    question:
      "P(A) = 0,4 et P(B) = 0,5 avec A et B incompatibles. P(A ou B) = ?",
    options: ["0,2", "0,9", "0,1", "0,45"],
    answer: "0,9",
    fiche: {
      regle:
        "Evenements incompatibles : P(A ou B) = P(A) + P(B) = 0,4 + 0,5 = 0,9.",
      exemple:
        "P(A ou B) = 0,4 + 0,5 = 0,9. Incompatibles = ne peuvent pas se produire ensemble.",
      piege:
        "P(A et B) = 0 car incompatibles. Donc P(A ou B) = P(A) + P(B) sans rien soustraire.",
      astuce:
        "Incompatibles : P(A ou B) = P(A) + P(B). Compatibles : il faut soustraire P(A et B).",
    },
  },
  {
    question:
      "Une experience a 5 issues equiprobables. Quelle est la probabilite de chaque issue ?",
    options: ["5", "1/5", "0,5", "1"],
    answer: "1/5",
    fiche: {
      regle:
        "Issues equiprobables : chaque issue a la meme probabilite = 1/nombre d issues = 1/5.",
      exemple:
        "5 issues equiprobables : P(chacune) = 1/5 = 0,2. Somme = 5 x 1/5 = 1.",
      piege:
        "La probabilite est 1/5, pas 5. La somme de toutes les probabilites doit etre 1.",
      astuce:
        "Equiprobable : P(issue) = 1/n. Somme de toutes les probabilites = 1 toujours.",
    },
  },
  {
    question:
      "On tire une boule dans un sac : 2 rouges, 3 vertes, 5 bleues. P(pas bleue) = ?",
    options: ["5/10", "1/2", "1/5", "Les reponses a et b sont correctes"],
    answer: "Les reponses a et b sont correctes",
    fiche: {
      regle:
        "P(bleue) = 5/10 = 1/2. P(pas bleue) = 1 - 1/2 = 1/2. Ou directement : (2+3)/10 = 5/10 = 1/2.",
      exemple:
        "Total = 10. Pas bleue = 2+3 = 5. P(pas bleue) = 5/10 = 1/2 = 0,5.",
      piege: "Ne pas oublier que pas bleue = rouge + verte = 2 + 3 = 5 boules.",
      astuce:
        "P(contraire) = 1 - P(evenement). Ou compter directement les cas non bleus.",
    },
  },
];

export default function Probabilites2Page() {
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
          <h1 className="lecon-titre">Probabilites avancees</h1>
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
            Maitrise les <strong>probabilites</strong> : calcul, evenements
            complementaires, incompatibles et equiprobables.
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
              <div className="lecon-point-titre">Calcul de probabilite</div>
              <div className="lecon-point-texte">
                {
                  "P = cas favorables / cas possibles. Toujours entre 0 et 1. P(impossible) = 0. P(certain) = 1."
                }
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> De : P(pair) =
                3/6 = 1/2.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Evenement complementaire</div>
              <div className="lecon-point-texte">
                {"P(non A) = 1 - P(A). La somme P(A) + P(non A) = 1 toujours."}
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> P(A) = 0,3.
                P(non A) = 1 - 0,3 = 0,7.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Evenements incompatibles</div>
              <div className="lecon-point-texte">
                {
                  "Si A et B incompatibles : P(A ou B) = P(A) + P(B). Ils ne peuvent pas se produire ensemble."
                }
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> P(A)=0,4 et
                P(B)=0,5 incompatibles : P(A ou B)=0,9.
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
