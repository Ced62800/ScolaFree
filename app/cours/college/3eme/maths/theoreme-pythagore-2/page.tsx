"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "maths";
const THEME = "theoreme-pythagore-2";

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
      "Dans un triangle rectangle, l'hypotenuse mesure 13 cm et un cote mesure 5 cm. Quelle est la longueur du troisieme cote ?",
    options: ["8 cm", "10 cm", "12 cm", "11 cm"],
    answer: "12 cm",
    fiche: {
      regle:
        "Theoreme de Pythagore : dans un triangle rectangle, le carre de l'hypotenuse est egal a la somme des carres des deux autres cotes. c^2 = a^2 + b^2, donc b^2 = c^2 - a^2.",
      exemple: "b^2 = 13^2 - 5^2 = 169 - 25 = 144, donc b = 12 cm.",
      piege:
        "L'hypotenuse est toujours le cote le plus long, en face de l'angle droit. Ne pas confondre avec les cotes de l'angle droit.",
      astuce:
        "Triplets de Pythagore celebres : (3,4,5), (5,12,13), (8,15,17). Les connaitre fait gagner du temps !",
    },
  },
  {
    question:
      "Un triangle a des cotes de 6 cm, 8 cm et 10 cm. Est-il rectangle ?",
    options: [
      "Non, car 6^2 + 8^2 est different de 10^2",
      "Oui, car 6^2 + 8^2 = 10^2",
      "On ne peut pas savoir",
      "Non, car 10 est pair",
    ],
    answer: "Oui, car 6^2 + 8^2 = 10^2",
    fiche: {
      regle:
        "La reciproque du theoreme de Pythagore : si le carre du plus grand cote est egal a la somme des carres des deux autres, alors le triangle est rectangle.",
      exemple:
        "6^2 + 8^2 = 36 + 64 = 100 = 10^2. Donc le triangle est rectangle en face du cote 10 cm.",
      piege:
        "Toujours verifier avec le PLUS GRAND cote comme hypotenuse. Si c'est le plus grand qui verifie c^2 = a^2 + b^2, c'est un triangle rectangle.",
      astuce:
        "Reciproque = verification. Calcule le carre du plus grand cote, puis la somme des carres des deux autres. Si egal = rectangle.",
    },
  },
  {
    question:
      "Dans un carre de cote 5 cm, quelle est la longueur de la diagonale (arrondie au dixieme) ?",
    options: ["6,7 cm", "7,1 cm", "5,5 cm", "7,5 cm"],
    answer: "7,1 cm",
    fiche: {
      regle:
        "La diagonale d'un carre de cote a forme un triangle rectangle avec deux cotes du carre. d^2 = a^2 + a^2 = 2 x a^2, donc d = a x racine(2).",
      exemple:
        "d^2 = 5^2 + 5^2 = 25 + 25 = 50. d = racine(50) = 5 x racine(2) environ 7,07 cm, soit 7,1 cm.",
      piege:
        "La diagonale du carre n'est pas egale au double du cote ! d = cote x racine(2), pas 2 x cote.",
      astuce:
        "Carre de cote a : diagonale = a x racine(2). Rectangle de cotes a et b : diagonale = racine(a^2 + b^2).",
    },
  },
  {
    question:
      "Dans un triangle ABC rectangle en B, AB = 9 cm et BC = 12 cm. Quelle est la longueur AC ?",
    options: ["15 cm", "13 cm", "21 cm", "17 cm"],
    answer: "15 cm",
    fiche: {
      regle:
        "Rectangle en B signifie que l'angle droit est en B. Donc AC est l'hypotenuse. AC^2 = AB^2 + BC^2.",
      exemple:
        "AC^2 = 9^2 + 12^2 = 81 + 144 = 225. AC = racine(225) = 15 cm. Triplet (9, 12, 15) = multiple de (3, 4, 5).",
      piege:
        "'Rectangle en B' signifie angle droit en B, pas en A ni en C. AC (en face de B) est donc l'hypotenuse.",
      astuce:
        "Rectangle en [lettre] = angle droit en cette lettre. Le cote en face de cet angle = hypotenuse. Ici, angle droit en B, hypotenuse = AC.",
    },
  },
  {
    question:
      "Un echelle de 5 m est appuyee contre un mur. Le pied de l'echelle est a 2 m du mur. A quelle hauteur l'echelle touche-t-elle le mur (arrondie au centimetre) ?",
    options: ["3,00 m", "4,58 m", "4,00 m", "3,46 m"],
    answer: "4,58 m",
    fiche: {
      regle:
        "L'echelle, le mur et le sol forment un triangle rectangle. L'echelle est l'hypotenuse. h^2 = 5^2 - 2^2 = 25 - 4 = 21. h = racine(21).",
      exemple:
        "h = racine(21) environ 4,583 m, soit 4,58 m arrondi au centimetre.",
      piege:
        "L'echelle est l'hypotenuse (le cote le plus long). Ne pas calculer h^2 = 5^2 + 2^2, ce serait faux !",
      astuce:
        "Probleme concret = identifier le triangle rectangle et l'hypotenuse. Echelle = hypotenuse. Sol + mur = cotes de l'angle droit.",
    },
  },
  {
    question:
      "Dans un triangle rectangle, si les deux cotes de l'angle droit mesurent 7 cm et 24 cm, quelle est l'hypotenuse ?",
    options: ["25 cm", "26 cm", "31 cm", "23 cm"],
    answer: "25 cm",
    fiche: {
      regle:
        "h^2 = 7^2 + 24^2 = 49 + 576 = 625. h = racine(625) = 25 cm. Le triplet (7, 24, 25) est un triplet pythagoricien.",
      exemple:
        "7^2 = 49. 24^2 = 576. 49 + 576 = 625. racine(625) = 25. Donc l'hypotenuse mesure 25 cm.",
      piege:
        "Bien calculer les carres : 24^2 = 576 (pas 48 ni 144). Prendre le temps de calculer chaque carre separement.",
      astuce:
        "Triplets a connaitre : (3,4,5), (5,12,13), (7,24,25), (8,15,17), (9,40,41). Reconnaitre un triplet evite le calcul de racine carree.",
    },
  },
  {
    question:
      "Un triangle a des cotes de 4 cm, 5 cm et 7 cm. Est-il rectangle ?",
    options: [
      "Oui, car 4^2 + 5^2 = 7^2",
      "Non, car 4^2 + 5^2 est different de 7^2",
      "Oui, car 7 est le plus grand",
      "On ne peut pas determiner",
    ],
    answer: "Non, car 4^2 + 5^2 est different de 7^2",
    fiche: {
      regle:
        "Verification : 4^2 + 5^2 = 16 + 25 = 41. 7^2 = 49. 41 est different de 49, donc le triangle n'est PAS rectangle.",
      exemple:
        "Si 4^2 + 5^2 avait ete egal a 7^2, le triangle aurait ete rectangle. Ici 41 est different de 49 : pas rectangle.",
      piege:
        "Ne pas confondre 'presque egal' et 'egal'. En maths, si les deux membres ne sont pas strictement egaux, le triangle n'est pas rectangle.",
      astuce:
        "Reciproque : calcule les carres, compare. Si egal = rectangle. Si different = non rectangle. Simple et rapide.",
    },
  },
  {
    question:
      "Dans un losange de diagonales 6 cm et 8 cm, quelle est la longueur d'un cote ?",
    options: ["5 cm", "7 cm", "10 cm", "4 cm"],
    answer: "5 cm",
    fiche: {
      regle:
        "Les diagonales d'un losange se coupent perpendiculairement en leur milieu. Elles forment 4 triangles rectangles. Les demi-diagonales sont 3 cm et 4 cm. Cote^2 = 3^2 + 4^2 = 9 + 16 = 25.",
      exemple:
        "Demi-diagonales : 6/2 = 3 cm et 8/2 = 4 cm. cote^2 = 3^2 + 4^2 = 25. cote = 5 cm. Triplet (3,4,5) !",
      piege:
        "Utiliser les DEMI-diagonales, pas les diagonales entieres. Les diagonales se coupent en leur milieu.",
      astuce:
        "Losange : diagonales perpendiculaires en leur milieu. Cote = racine((d1/2)^2 + (d2/2)^2). Connaitre (3,4,5) aide beaucoup ici.",
    },
  },
  {
    question:
      "La hauteur d'un triangle equilateral de cote 10 cm vaut (arrondie au dixieme) :",
    options: ["8,7 cm", "5,0 cm", "7,5 cm", "9,0 cm"],
    answer: "8,7 cm",
    fiche: {
      regle:
        "La hauteur d'un triangle equilateral de cote a coupe la base en deux. Elle forme un triangle rectangle de cotes h, a/2 et a. h^2 = a^2 - (a/2)^2.",
      exemple:
        "h^2 = 10^2 - 5^2 = 100 - 25 = 75. h = racine(75) = 5 x racine(3) environ 8,66 cm, soit 8,7 cm.",
      piege:
        "La hauteur divise la base en deux parties egales (a/2). Ne pas utiliser la base entiere dans le calcul.",
      astuce:
        "Triangle equilateral de cote a : hauteur = (a x racine(3)) / 2. Pour a = 10 : h = 5 x racine(3) environ 8,66 cm.",
    },
  },
  {
    question:
      "Dans un rectangle de longueur 12 cm et largeur 5 cm, quelle est la longueur de la diagonale ?",
    options: ["13 cm", "17 cm", "11 cm", "14 cm"],
    answer: "13 cm",
    fiche: {
      regle:
        "La diagonale d'un rectangle forme un triangle rectangle avec la longueur et la largeur. d^2 = l^2 + L^2.",
      exemple:
        "d^2 = 12^2 + 5^2 = 144 + 25 = 169. d = racine(169) = 13 cm. Triplet (5, 12, 13) !",
      piege:
        "Les deux diagonales d'un rectangle ont la meme longueur. Il suffit d'en calculer une.",
      astuce:
        "Rectangle : diagonale = racine(longueur^2 + largeur^2). Reconnaitre le triplet (5,12,13) evite le calcul de racine.",
    },
  },
];

export default function TheorePythagore2Page() {
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
          <div className="lecon-badge">📐 Maths — 3ème</div>
          <h1 className="lecon-titre">Theoreme de Pythagore</h1>
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
              Mode decouverte — 5 questions ·{" "}
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
            En 3eme, tu maitrisess le <strong>theoreme de Pythagore</strong> et
            sa reciproque : calculer des longueurs, verifier si un triangle est
            rectangle, et resoudre des problemes concrets.
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
              <div className="lecon-point-titre">📐 Le theoreme</div>
              <div className="lecon-point-texte">
                Dans un triangle rectangle, c^2 = a^2 + b^2 (c = hypotenuse).
                L'hypotenuse est le cote en face de l'angle droit, toujours le
                plus long.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Cotes 3 et 4 :
                hypotenuse = racine(9+16) = racine(25) = 5. Triplet (3,4,5).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔄 La reciproque</div>
              <div className="lecon-point-texte">
                Si c^2 = a^2 + b^2 (c = plus grand cote), alors le triangle EST
                rectangle. Permet de verifier si un triangle est rectangle sans
                mesurer les angles.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Cotes 5, 12, 13
                : 5^2 + 12^2 = 25 + 144 = 169 = 13^2. Triangle rectangle !
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🏗️ Applications</div>
              <div className="lecon-point-texte">
                Diagonale d'un rectangle ou carre, hauteur d'un triangle
                equilateral, problemes concrets (echelle, distance...). Triplets
                : (3,4,5), (5,12,13), (7,24,25), (8,15,17).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Diagonale d'un
                rectangle 5x12 = racine(25+144) = racine(169) = 13 cm.
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
                    📖 Voir la fiche pedagogique
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
                  📖 Lis la fiche pour debloquer !
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
                  ? "Voir mon resultat →"
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
                📖 Fiche pedagogique
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
                  📚 La regle
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
                  ⚠️ Le piege
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
          ? "Bien joue !"
          : "Continue a t'entrainer !";
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
                S'inscrire gratuitement →
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
              🔄 Reessayer
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
