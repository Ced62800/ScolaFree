"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "maths";
const THEME = "trigonometrie";

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
      "Dans un triangle rectangle, comment s appelle le cote oppose a l angle droit ?",
    options: ["Le cote adjacent", "L hypotenuse", "Le cote oppose", "La base"],
    answer: "L hypotenuse",
    fiche: {
      regle:
        "L hypotenuse est le cote oppose a l angle droit. C est le plus grand cote du triangle rectangle.",
      exemple:
        "Dans un triangle rectangle en C : AB est l hypotenuse. AC et BC sont les cotes de l angle droit.",
      piege:
        "L hypotenuse est TOUJOURS en face de l angle droit. Ce n est pas un cote quelconque.",
      astuce:
        "Angle droit = 90 degres. Hypotenuse = cote en face. Toujours le plus grand des trois cotes.",
    },
  },
  {
    question:
      "Comment se calcule le sinus d un angle dans un triangle rectangle ?",
    options: [
      "cote adjacent / hypotenuse",
      "cote oppose / hypotenuse",
      "cote oppose / cote adjacent",
      "hypotenuse / cote oppose",
    ],
    answer: "cote oppose / hypotenuse",
    fiche: {
      regle:
        "sin(angle) = cote oppose / hypotenuse. Moyen mnemo : SOH (Sinus = Oppose / Hypotenuse).",
      exemple:
        "Angle A, cote oppose = 3, hypotenuse = 5. sin(A) = 3/5 = 0,6. Angle A = arcsin(0,6) = 36,87 deg.",
      piege:
        "Oppose et adjacent dependent de l angle considere ! Identifier d abord l angle puis ses cotes.",
      astuce:
        "SOH CAH TOA : Sin=Opp/Hyp. Cos=Adj/Hyp. Tan=Opp/Adj. A memoriser !",
    },
  },
  {
    question:
      "Comment se calcule le cosinus d un angle dans un triangle rectangle ?",
    options: [
      "cote oppose / hypotenuse",
      "cote adjacent / hypotenuse",
      "cote oppose / cote adjacent",
      "hypotenuse / cote adjacent",
    ],
    answer: "cote adjacent / hypotenuse",
    fiche: {
      regle:
        "cos(angle) = cote adjacent / hypotenuse. Moyen mnemo : CAH (Cosinus = Adjacent / Hypotenuse).",
      exemple:
        "Angle A, cote adjacent = 4, hypotenuse = 5. cos(A) = 4/5 = 0,8. Angle A = arccos(0,8) = 36,87 deg.",
      piege:
        "Adjacent = cote qui touche l angle (mais pas l hypotenuse). Ne pas confondre avec l oppose.",
      astuce:
        "SOH CAH TOA. Cos = CAH = Cote Adjacent / Hypotenuse. Le cote qui touche l angle.",
    },
  },
  {
    question:
      "Comment se calcule la tangente d un angle dans un triangle rectangle ?",
    options: [
      "cote adjacent / hypotenuse",
      "cote oppose / hypotenuse",
      "cote oppose / cote adjacent",
      "hypotenuse / cote oppose",
    ],
    answer: "cote oppose / cote adjacent",
    fiche: {
      regle:
        "tan(angle) = cote oppose / cote adjacent. Moyen mnemo : TOA (Tangente = Oppose / Adjacent).",
      exemple:
        "Angle A, oppose = 3, adjacent = 4. tan(A) = 3/4 = 0,75. Angle A = arctan(0,75) = 36,87 deg.",
      piege:
        "La tangente n utilise pas l hypotenuse ! Seulement oppose et adjacent.",
      astuce:
        "SOH CAH TOA. Tan = TOA = cote Oppose / cote Adjacent. Pas d hypotenuse !",
    },
  },
  {
    question:
      "Dans un triangle rectangle en C, AB = 10 cm et angle A = 30 deg. Calcule BC (cote oppose a A).",
    options: ["5 cm", "8,66 cm", "11,55 cm", "17,32 cm"],
    answer: "5 cm",
    fiche: {
      regle:
        "sin(A) = BC/AB. BC = AB x sin(A) = 10 x sin(30) = 10 x 0,5 = 5 cm.",
      exemple:
        "sin(30 deg) = 0,5. BC = 10 x 0,5 = 5 cm. Verification : cos(30 deg) = AC/10. AC = 8,66 cm.",
      piege:
        "sin(30 deg) = 0,5 (valeur exacte a connaitre). Ne pas confondre avec cos(30 deg) = 0,866.",
      astuce:
        "Valeurs cles : sin(30)=0,5. cos(30)=0,866. sin(45)=cos(45)=0,707. sin(60)=0,866.",
    },
  },
  {
    question:
      "Dans un triangle rectangle en C, AC = 6 cm et BC = 8 cm. Calcule sin(A).",
    options: ["6/10", "8/10", "6/8", "8/6"],
    answer: "8/10",
    fiche: {
      regle:
        "D abord : AB = hypotenuse. Pythagore : AB^2 = AC^2 + BC^2 = 36 + 64 = 100. AB = 10. sin(A) = BC/AB = 8/10.",
      exemple:
        "AB = sqrt(6^2 + 8^2) = sqrt(100) = 10. sin(A) = oppose/hyp = BC/AB = 8/10 = 0,8.",
      piege:
        "Il faut d abord calculer l hypotenuse avec Pythagore avant de calculer le sinus !",
      astuce:
        "Pythagore pour l hypotenuse, puis SOH CAH TOA. BC est oppose a A car C est l angle droit.",
    },
  },
  {
    question: "tan(45 deg) est egal a ?",
    options: ["0", "0,5", "1", "racine de 2"],
    answer: "1",
    fiche: {
      regle:
        "tan(45 deg) = 1. Dans un triangle rectangle isocele (45-45-90), les deux cotes sont egaux donc tan = 1.",
      exemple: "Triangle 45-45-90 avec cotes 1, 1, sqrt(2). tan(45) = 1/1 = 1.",
      piege:
        "Ne pas confondre sin(45) = 0,707 et tan(45) = 1. Valeurs differentes !",
      astuce:
        "Valeurs cles de tan : tan(0)=0. tan(30)=0,577. tan(45)=1. tan(60)=1,732. tan(90)=infini.",
    },
  },
  {
    question: "Pour trouver un angle dont on connait le sinus, on utilise :",
    options: ["sin", "cos", "arcsin", "tan"],
    answer: "arcsin",
    fiche: {
      regle:
        "arcsin (ou sin inverse) donne l angle a partir du sinus. Si sin(A) = 0,5 alors A = arcsin(0,5) = 30 deg.",
      exemple:
        "sin(A) = 0,8. A = arcsin(0,8) = 53,13 deg. Sur calculatrice : touche sin^(-1) ou ASIN.",
      piege:
        "arcsin et sin sont des fonctions inverses. arcsin(sin(x)) = x pour x entre 0 et 90 deg.",
      astuce:
        "Pour trouver l angle : arcsin, arccos, arctan. Sur calculatrice : sin^-1, cos^-1, tan^-1.",
    },
  },
  {
    question:
      "Dans un triangle rectangle en B, on connait AB = 5 et l angle A = 40 deg. Quelle formule utiliser pour calculer BC ?",
    options: [
      "BC = AB x cos(A)",
      "BC = AB x sin(A)",
      "BC = AB x tan(A)",
      "BC = AB / sin(A)",
    ],
    answer: "BC = AB x tan(A)",
    fiche: {
      regle:
        "BC est oppose a A. AB est adjacent a A (pas l hypotenuse car B est l angle droit). tan(A) = BC/AB. BC = AB x tan(A).",
      exemple: "tan(40 deg) = 0,839. BC = 5 x 0,839 = 4,19 cm.",
      piege:
        "Le triangle est rectangle en B, donc l hypotenuse est AC. AB est adjacent a A, BC est oppose.",
      astuce:
        "Identifier : angle droit, hypotenuse, cote oppose, cote adjacent PAR RAPPORT a l angle cherche.",
    },
  },
  {
    question: "La relation de Pythagore dit que :",
    options: [
      "a + b = c dans tout triangle",
      "a^2 + b^2 = c^2 dans un triangle rectangle (c = hypotenuse)",
      "sin^2 + cos^2 = 1 uniquement pour 45 deg",
      "tan = sin + cos",
    ],
    answer: "a^2 + b^2 = c^2 dans un triangle rectangle (c = hypotenuse)",
    fiche: {
      regle:
        "Pythagore : dans un triangle rectangle, hyp^2 = cote1^2 + cote2^2. Complementaire de la trigonometrie.",
      exemple:
        "Triangle 3-4-5 : 3^2 + 4^2 = 9 + 16 = 25 = 5^2. Triangle rectangle verifie.",
      piege:
        "Pythagore s applique SEULEMENT dans un triangle rectangle. Pas dans tout triangle.",
      astuce:
        "Pythagore + trigo = les deux outils cles du triangle rectangle. Trigo pour les angles, Pythagore pour les cotes.",
    },
  },
];

function SVGTrigo() {
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
        points="50,160 50,40 250,160"
        fill="rgba(79,142,247,0.1)"
        stroke="#4f8ef7"
        strokeWidth="2"
      />
      <rect
        x="50"
        y="140"
        width="20"
        height="20"
        fill="none"
        stroke="#2ec4b6"
        strokeWidth="2"
      />
      <circle cx="50" cy="40" r="3" fill="#ffd166" />
      <circle cx="50" cy="160" r="3" fill="#2ec4b6" />
      <circle cx="250" cy="160" r="3" fill="#4f8ef7" />
      <text x="35" y="35" fill="#ffd166" fontSize="12" fontWeight="bold">
        A
      </text>
      <text x="30" y="175" fill="#2ec4b6" fontSize="12" fontWeight="bold">
        C
      </text>
      <text x="255" y="175" fill="#4f8ef7" fontSize="12" fontWeight="bold">
        B
      </text>
      <text x="255" y="105" fill="#ff6b6b" fontSize="11">
        hyp
      </text>
      <line
        x1="250"
        y1="160"
        x2="150"
        y2="100"
        stroke="#ff6b6b"
        strokeWidth="1"
        strokeDasharray="3,2"
      />
      <text x="10" y="105" fill="#2ec4b6" fontSize="10">
        oppose
      </text>
      <text x="120" y="178" fill="#ffd166" fontSize="10">
        adjacent
      </text>
      <text x="60" y="80" fill="#fff" fontSize="9">
        sin(A) = opp/hyp
      </text>
      <text x="60" y="95" fill="#fff" fontSize="9">
        cos(A) = adj/hyp
      </text>
      <text x="60" y="110" fill="#fff" fontSize="9">
        tan(A) = opp/adj
      </text>
    </svg>
  );
}

export default function TrigonometriePage() {
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
          <h1 className="lecon-titre">La trigonometrie</h1>
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
          <SVGTrigo />
          <div className="lecon-intro">
            Maitrise <strong>sinus, cosinus et tangente</strong> dans le
            triangle rectangle.
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
              <div className="lecon-point-titre">SOH CAH TOA</div>
              <div className="lecon-point-texte">
                {
                  "sin = Oppose/Hypotenuse. cos = Adjacent/Hypotenuse. tan = Oppose/Adjacent."
                }
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> sin(30)=0,5.
                cos(60)=0,5. tan(45)=1.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Calculer un cote</div>
              <div className="lecon-point-texte">
                {
                  "Identifier l angle, l hypotenuse, l oppose et l adjacent. Choisir sin, cos ou tan. Isoler le cote inconnu."
                }
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> BC = AB x
                sin(A). AC = AB x cos(A).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Calculer un angle</div>
              <div className="lecon-point-texte">
                {
                  "Calculer le rapport sin, cos ou tan. Utiliser arcsin, arccos ou arctan sur la calculatrice."
                }
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> sin(A) = 0,6. A
                = arcsin(0,6) = 36,87 deg.
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
