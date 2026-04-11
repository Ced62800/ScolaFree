"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "maths";
const THEME = "geometrie-2";

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
    question: "Que dit le theoreme de Thales ?",
    options: [
      "Si deux droites sont paralleles, les triangles formes sont isoceles",
      "Si une droite coupe deux cotes d un triangle en etant parallele au troisieme, elle determine des rapports egaux",
      "La somme des angles d un triangle vaut 180 degres",
      "Le carre de l hypotenuse est egal a la somme des carres des deux autres cotes",
    ],
    answer:
      "Si une droite coupe deux cotes d un triangle en etant parallele au troisieme, elle determine des rapports egaux",
    fiche: {
      regle:
        "Thales : si (DE) est parallele a (BC), alors AD/AB = AE/AC = DE/BC. Les rapports des longueurs sont egaux.",
      exemple:
        "Si AD=3, AB=6, AE=4, alors AC=8 car AD/AB = AE/AC : 3/6 = 4/AC, AC = 8.",
      piege:
        "Thales s applique uniquement si les droites sont bien paralleles. Verifier toujours la condition.",
      astuce:
        "Thales : rapports egaux. AD/AB = AE/AC = DE/BC. Cross-multiplication pour trouver l inconnu.",
    },
  },
  {
    question:
      "Dans un triangle ABC, (DE) est parallele a (BC). AD = 4, AB = 10, AE = 3. Calcule AC.",
    options: ["6", "7", "7,5", "12"],
    answer: "7,5",
    fiche: {
      regle:
        "Thales : AD/AB = AE/AC. 4/10 = 3/AC. AC = 3 x 10 / 4 = 30/4 = 7,5.",
      exemple: "4/10 = 3/AC. Cross : 4 x AC = 3 x 10 = 30. AC = 30/4 = 7,5.",
      piege:
        "Ne pas calculer AC = AB - AD = 6. Il faut utiliser le rapport de Thales.",
      astuce: "AD/AB = AE/AC. Isole AC : AC = AE x AB / AD = 3 x 10 / 4 = 7,5.",
    },
  },
  {
    question:
      "Dans un triangle ABC, (DE) parallele a (BC). AD = 6, DB = 4, AE = 9. Calcule EC.",
    options: ["4", "6", "9", "15"],
    answer: "6",
    fiche: {
      regle:
        "AB = AD + DB = 6 + 4 = 10. Thales : AD/AB = AE/AC. 6/10 = 9/AC. AC = 15. EC = AC - AE = 15 - 9 = 6.",
      exemple:
        "AD/AB = 6/10 = 3/5. AE/AC = 9/AC = 3/5. AC = 15. EC = 15 - 9 = 6.",
      piege: "D abord calculer AB = AD + DB = 10, puis AC, puis EC = AC - AE.",
      astuce:
        "Si on donne DB, calculer AB = AD + DB d abord. Ensuite appliquer Thales normalement.",
    },
  },
  {
    question: "Qu est-ce qu un agrandissement de rapport k = 2 ?",
    options: [
      "Toutes les longueurs sont divisees par 2",
      "Toutes les longueurs sont multipliees par 2",
      "L aire est multipliee par 2",
      "Les angles sont multiplies par 2",
    ],
    answer: "Toutes les longueurs sont multipliees par 2",
    fiche: {
      regle:
        "Agrandissement de rapport k : toutes les longueurs sont multipliees par k. Les angles restent identiques.",
      exemple:
        "k=2 : un cote de 5 cm devient 10 cm. k=1/2 (reduction) : 5 cm devient 2,5 cm.",
      piege:
        "Les angles ne changent PAS dans un agrandissement. Seulement les longueurs sont multipliees.",
      astuce:
        "Longueurs multipliees par k. Aires multipliees par k^2. Volumes par k^3. Angles inchanges.",
    },
  },
  {
    question:
      "Un triangle a un cote de 8 cm. Son image par une reduction de rapport 3/4 a ce cote egal a ?",
    options: ["6 cm", "8 cm", "10 cm", "32/3 cm"],
    answer: "6 cm",
    fiche: {
      regle:
        "Reduction de rapport k = 3/4 : longueur image = longueur x k = 8 x 3/4 = 6 cm.",
      exemple:
        "8 x 3/4 = 24/4 = 6 cm. Verification : 6 < 8 car c est une reduction (k < 1).",
      piege:
        "k = 3/4 est une REDUCTION car k < 1. Le resultat doit etre plus petit que l original.",
      astuce:
        "Longueur image = longueur x k. k < 1 : reduction. k > 1 : agrandissement.",
    },
  },
  {
    question:
      "Deux triangles sont semblables. Le premier a des cotes 3, 4, 5. Le second a le petit cote = 6. Quel est le grand cote ?",
    options: ["8", "9", "10", "12"],
    answer: "10",
    fiche: {
      regle: "Rapport de similitude : k = 6/3 = 2. Grand cote = 5 x 2 = 10.",
      exemple:
        "k = 6/3 = 2. Cotes du second triangle : 6, 8, 10. Grand cote = 5 x 2 = 10.",
      piege:
        "Calculer d abord le rapport k = cote image / cote original = 6/3 = 2.",
      astuce:
        "Triangles semblables : memes angles, cotes proportionnels. k = rapport de similitude.",
    },
  },
  {
    question:
      "Si (DE) est parallele a (BC) dans un triangle ABC, que peut-on conclure ?",
    options: [
      "Le triangle ADE est rectangle",
      "Les triangles ADE et ABC sont semblables",
      "AD = DB",
      "DE = BC",
    ],
    answer: "Les triangles ADE et ABC sont semblables",
    fiche: {
      regle:
        "Si (DE) est parallele a (BC), alors les triangles ADE et ABC ont les memes angles donc ils sont semblables.",
      exemple:
        "Angle A commun. Angle ADE = Angle ABC (angles correspondants). Angle AED = Angle ACB. Triangles semblables.",
      piege:
        "Semblable ne signifie pas egal ! Les triangles ont les memes angles mais pas forcement les memes cotes.",
      astuce:
        "Parallele implique angles egaux implique triangles semblables. Thales en decoule.",
    },
  },
  {
    question:
      "Un rectangle de 6 cm x 4 cm est agrandi avec k = 1,5. Quelle est l aire du nouveau rectangle ?",
    options: ["36 cm2", "54 cm2", "24 cm2", "60 cm2"],
    answer: "54 cm2",
    fiche: {
      regle:
        "Nouvelles dimensions : 6 x 1,5 = 9 cm et 4 x 1,5 = 6 cm. Aire = 9 x 6 = 54 cm2.",
      exemple:
        "Ou : Aire initiale = 6 x 4 = 24 cm2. Aire agrandie = 24 x k^2 = 24 x 2,25 = 54 cm2.",
      piege: "L aire est multipliee par k^2 = 1,5^2 = 2,25, pas par k = 1,5.",
      astuce:
        "Longueurs x k. Aires x k^2. 6x1,5=9. 4x1,5=6. 9x6=54. Ou 24x2,25=54.",
    },
  },
  {
    question:
      "Dans un triangle ABC, (MN) parallele a (BC). AM = 5, MB = 3. Calcule AM/AB.",
    options: ["5/3", "5/8", "3/8", "3/5"],
    answer: "5/8",
    fiche: {
      regle: "AB = AM + MB = 5 + 3 = 8. AM/AB = 5/8.",
      exemple: "AM = 5, MB = 3. AB = 5 + 3 = 8. Rapport AM/AB = 5/8.",
      piege:
        "Ne pas confondre AM/MB = 5/3 et AM/AB = 5/8. On divise par AB = AM + MB.",
      astuce:
        "AB = AM + MB. Rapport de Thales = AM/AB = 5/8 (pas AM/MB = 5/3).",
    },
  },
  {
    question: "La reciproque du theoreme de Thales sert a :",
    options: [
      "Calculer des longueurs",
      "Prouver que deux droites sont paralleles",
      "Calculer des angles",
      "Prouver que des triangles sont isoceles",
    ],
    answer: "Prouver que deux droites sont paralleles",
    fiche: {
      regle:
        "Reciproque de Thales : si AD/AB = AE/AC, alors (DE) est parallele a (BC). On prouve le parallelisme.",
      exemple:
        "Si AD/AB = AE/AC = 2/5, alors on conclut que (DE) est parallele a (BC).",
      piege:
        "Thales direct : paralleles impliquent rapports egaux. Reciproque : rapports egaux impliquent paralleles.",
      astuce:
        "Thales direct : prouver des longueurs. Reciproque : prouver le parallelisme. Deux directions differentes.",
    },
  },
];

function SVGThales() {
  return (
    <svg
      viewBox="0 0 300 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: "100%",
        maxWidth: "300px",
        margin: "16px auto",
        display: "block",
      }}
    >
      <polygon
        points="150,20 50,170 250,170"
        fill="none"
        stroke="#4f8ef7"
        strokeWidth="2"
      />
      <line
        x1="90"
        y1="103"
        x2="210"
        y2="103"
        stroke="#2ec4b6"
        strokeWidth="2"
        strokeDasharray="5,3"
      />
      <circle cx="150" cy="20" r="3" fill="#ffd166" />
      <circle cx="50" cy="170" r="3" fill="#4f8ef7" />
      <circle cx="250" cy="170" r="3" fill="#4f8ef7" />
      <circle cx="90" cy="103" r="3" fill="#2ec4b6" />
      <circle cx="210" cy="103" r="3" fill="#2ec4b6" />
      <text x="155" y="18" fill="#ffd166" fontSize="12" fontWeight="bold">
        A
      </text>
      <text x="35" y="185" fill="#4f8ef7" fontSize="12" fontWeight="bold">
        B
      </text>
      <text x="253" y="185" fill="#4f8ef7" fontSize="12" fontWeight="bold">
        C
      </text>
      <text x="72" y="100" fill="#2ec4b6" fontSize="12" fontWeight="bold">
        D
      </text>
      <text x="213" y="100" fill="#2ec4b6" fontSize="12" fontWeight="bold">
        E
      </text>
      <text x="125" y="95" fill="#2ec4b6" fontSize="10">
        (DE) // (BC)
      </text>
      <text x="60" y="140" fill="#fff" fontSize="9">
        AD/AB = AE/AC = DE/BC
      </text>
    </svg>
  );
}

export default function Geometrie2Page() {
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
          <h1 className="lecon-titre">Geometrie et theoreme de Thales</h1>
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
          <SVGThales />
          <div className="lecon-intro">
            Maitrise le <strong>theoreme de Thales</strong>, les
            agrandissements, reductions et triangles semblables.
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
              <div className="lecon-point-titre">Theoreme de Thales</div>
              <div className="lecon-point-texte">
                {
                  "Si (DE) // (BC), alors AD/AB = AE/AC = DE/BC. Les rapports sont egaux."
                }
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> AD=4, AB=10,
                AE=3. AC = 3x10/4 = 7,5.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                Agrandissements et reductions
              </div>
              <div className="lecon-point-texte">
                {
                  "Rapport k : longueurs x k. Aires x k^2. k > 1 = agrandissement. k < 1 = reduction. Angles inchanges."
                }
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> k=2 : cote 5 cm
                devient 10 cm. Aire x 4.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Reciproque de Thales</div>
              <div className="lecon-point-texte">
                {
                  "Si AD/AB = AE/AC, alors (DE) est parallele a (BC). Sert a prouver le parallelisme."
                }
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Rapports egaux
                impliquent droites paralleles.
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
