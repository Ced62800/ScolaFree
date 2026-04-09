"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "maths";
const THEME = "triangles-pythagore";

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
  fiche: {
    regle: string;
    exemple: string;
    piege: string;
    astuce: string;
    svg?: string;
  };
};

const SVG_TRIANGLE_RECT = `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><polygon points="20,120 20,30 160,120" fill="rgba(79,142,247,0.1)" stroke="#4f8ef7" stroke-width="2"/><rect x="20" y="108" width="14" height="14" fill="none" stroke="#ffd166" stroke-width="2"/><text x="10" y="25" fill="#2ec4b6" font-size="12">A</text><text x="165" y="128" fill="#2ec4b6" font-size="12">B</text><text x="5" y="132" fill="#2ec4b6" font-size="12">C</text><text x="75" y="85" fill="#ff6b6b" font-size="11" font-weight="bold">AB (hypoténuse)</text><text x="3" y="82" fill="#aaa" font-size="10" transform="rotate(-90,3,82)">AC (cathète)</text><text x="75" y="138" fill="#aaa" font-size="10">BC (cathète)</text></svg>`;

const SVG_345 = `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg"><polygon points="20,130 20,40 130,130" fill="rgba(255,209,102,0.1)" stroke="#ffd166" stroke-width="2"/><rect x="20" y="116" width="16" height="16" fill="none" stroke="#ffd166" stroke-width="2"/><text x="10" y="35" fill="#fff" font-size="12">A</text><text x="135" y="138" fill="#fff" font-size="12">B</text><text x="5" y="143" fill="#fff" font-size="12">C</text><text x="58" y="98" fill="#ff6b6b" font-size="14" font-weight="bold">5</text><text x="3" y="92" fill="#4f8ef7" font-size="13" transform="rotate(-90,3,92)">3</text><text x="65" y="148" fill="#4f8ef7" font-size="13">4</text><text x="100" y="15" text-anchor="middle" fill="#ffd166" font-size="12">3² + 4² = 5²</text></svg>`;

const SVG_HAUTEUR = `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><polygon points="130,20 20,130 180,130" fill="rgba(79,142,247,0.1)" stroke="#4f8ef7" stroke-width="2"/><line x1="130" y1="20" x2="130" y2="130" stroke="#ff6b6b" stroke-width="1.5" stroke-dasharray="5"/><rect x="122" y="120" width="10" height="10" fill="none" stroke="#ff6b6b" stroke-width="1.5"/><text x="140" y="78" fill="#ff6b6b" font-size="12">h</text><text x="125" y="15" fill="#fff" font-size="12">A</text><text x="5" y="140" fill="#fff" font-size="12">B</text><text x="183" y="140" fill="#fff" font-size="12">C</text></svg>`;

const questionsBase: Question[] = [
  {
    question:
      "Dans un triangle rectangle, comment s'appelle le côté opposé à l'angle droit ?",
    options: ["Un cathète", "L'hypoténuse", "La médiane", "La hauteur"],
    answer: "L'hypoténuse",
    fiche: {
      regle:
        "Dans un triangle rectangle : l'hypoténuse est le côté le plus long, opposé à l'angle droit. Les deux autres côtés s'appellent les cathètes.",
      exemple:
        "✅ Triangle rectangle en C : l'hypoténuse est AB (en face de l'angle droit C).",
      piege:
        "L'hypoténuse est TOUJOURS le côté le plus long, opposé à l'angle droit.",
      astuce: "Hypoténuse = côté face à l'angle droit = côté le plus long.",
      svg: SVG_TRIANGLE_RECT,
    },
  },
  {
    question: "Quel est l'énoncé du théorème de Pythagore ?",
    options: [
      "AB² = AC² - BC²",
      "Dans un triangle rectangle, le carré de l'hypoténuse = somme des carrés des cathètes",
      "La somme des angles = 180°",
      "AB = AC + BC",
    ],
    answer:
      "Dans un triangle rectangle, le carré de l'hypoténuse = somme des carrés des cathètes",
    fiche: {
      regle:
        "Théorème de Pythagore : dans un triangle rectangle en C, AB² = AC² + BC².",
      exemple:
        "✅ Triangle rectangle en C, AC=3, BC=4 : AB² = 9+16 = 25 → AB = 5.",
      piege: "Pythagore s'applique UNIQUEMENT aux triangles RECTANGLES.",
      astuce: "AB² = AC² + BC². Le triplet classique : 3-4-5 (9+16=25).",
      svg: SVG_345,
    },
  },
  {
    question:
      "Dans un triangle rectangle en C, AC = 3 cm et BC = 4 cm. Quelle est la longueur AB ?",
    options: ["5 cm", "7 cm", "12 cm", "25 cm"],
    answer: "5 cm",
    fiche: {
      regle: "AB² = AC² + BC² = 3² + 4² = 9+16 = 25. AB = √25 = 5 cm.",
      exemple:
        "✅ 3²+4²=9+16=25. √25=5. AB=5 cm. Triplet pythagoricien 3-4-5 !",
      piege: "AB = √(AC²+BC²). Ne pas faire AB = AC+BC = 7 (faux).",
      astuce:
        "3-4-5 : le triplet le plus célèbre. 9+16=25 → √25=5. À retenir !",
      svg: SVG_345,
    },
  },
  {
    question: "Comment utilise-t-on la réciproque du théorème de Pythagore ?",
    options: [
      "Pour calculer l'hypoténuse",
      "Pour vérifier si un triangle est rectangle",
      "Pour calculer les angles",
      "Pour trouver l'aire",
    ],
    answer: "Pour vérifier si un triangle est rectangle",
    fiche: {
      regle:
        "Réciproque : si AB² = AC² + BC², alors le triangle ABC est rectangle en C.",
      exemple:
        "✅ Côtés 5, 12, 13 : 5²+12²=25+144=169=13². Triangle rectangle !",
      piege:
        "Il faut que ce soit le PLUS GRAND côté au carré = somme des carrés des deux autres.",
      astuce: "Grand côté² = petit²+moyen² → triangle rectangle. 5²+12²=13² ✓",
    },
  },
  {
    question:
      "Dans un triangle rectangle en A, BC = 10 et AB = 6. Quelle est la longueur AC ?",
    options: ["4 cm", "8 cm", "16 cm", "√136 cm"],
    answer: "8 cm",
    fiche: {
      regle:
        "BC est l'hypoténuse. BC² = AB² + AC². 100 = 36 + AC². AC² = 64. AC = 8.",
      exemple: "✅ 10²=6²+AC² → 100-36=64 → AC=√64=8 cm.",
      piege: "Triangle rectangle en A → BC est l'hypoténuse. BC²=AB²+AC².",
      astuce: "100-36=64. √64=8. Vérifie : 6²+8²=36+64=100=10² ✓",
    },
  },
  {
    question: "La somme des angles d'un triangle est toujours égale à :",
    options: ["90°", "180°", "270°", "360°"],
    answer: "180°",
    fiche: {
      regle:
        "La somme des angles d'un triangle = 180°. Propriété fondamentale.",
      exemple: "✅ Angles 60°, 70° et x° : 60+70+x=180 → x=50°.",
      piege: "360° = quadrilatère. 180° = triangle.",
      astuce:
        "Triangle → 180°. Dans un triangle rectangle : 90°+angle1+angle2=180°.",
    },
  },
  {
    question: "Un triangle avec les côtés 6, 8 et 10 est-il rectangle ?",
    options: [
      "Non",
      "Oui, car 6+8=14>10",
      "Oui, car 6²+8²=10²",
      "Impossible à dire",
    ],
    answer: "Oui, car 6²+8²=10²",
    fiche: {
      regle: "Réciproque : 6²+8²=36+64=100=10². Donc triangle rectangle.",
      exemple: "✅ 36+64=100=10² ✓ → triangle rectangle.",
      piege:
        "Vérifier les CARRÉS (pas l'addition). 6²+8²=10² (juste), pas 6+8=10.",
      astuce: "6-8-10 = 2×(3-4-5). Triplets pythagoriciens classiques !",
    },
  },
  {
    question: "Qu'est-ce que la hauteur d'un triangle ?",
    options: [
      "La médiane",
      "Un côté du triangle",
      "La perpendiculaire d'un sommet au côté opposé",
      "La bissectrice",
    ],
    answer: "La perpendiculaire d'un sommet au côté opposé",
    fiche: {
      regle:
        "La hauteur est perpendiculaire à la base, issue d'un sommet. Elle sert à calculer l'aire : A = base × hauteur / 2.",
      exemple:
        "✅ Hauteur issue de A = perpendiculaire de A à BC. Aire = BC × h / 2.",
      piege:
        "Hauteur ≠ médiane. Hauteur = perpendiculaire. Médiane = rejoint le milieu.",
      astuce:
        "Hauteur = perpendiculaire (angle droit). Médiane = milieu. Bissectrice = angle.",
      svg: SVG_HAUTEUR,
    },
  },
  {
    question: "Dans un triangle équilatéral, les 3 angles sont égaux à :",
    options: ["45°", "60°", "90°", "120°"],
    answer: "60°",
    fiche: {
      regle:
        "Triangle équilatéral = 3 côtés égaux = 3 angles égaux. 180°÷3 = 60°.",
      exemple: "✅ 60°+60°+60°=180° ✓",
      piege:
        "Équilatéral ≠ rectangle. Rectangle = un angle de 90°. Équilatéral = trois angles de 60°.",
      astuce: "Équilatéral → 3 angles égaux → 180÷3=60°.",
    },
  },
  {
    question: "Qu'est-ce que la médiane d'un triangle ?",
    options: [
      "La hauteur",
      "Un segment du sommet au milieu du côté opposé",
      "L'axe de symétrie",
      "La bissectrice",
    ],
    answer: "Un segment du sommet au milieu du côté opposé",
    fiche: {
      regle:
        "La médiane relie un sommet au milieu du côté opposé. Un triangle a 3 médianes qui se croisent au centre de gravité.",
      exemple: "✅ Médiane issue de A : rejoint le milieu M de BC.",
      piege:
        "Médiane ≠ hauteur. Médiane → milieu d'un côté. Hauteur → perpendiculaire à un côté.",
      astuce:
        "Médiane = milieu. Hauteur = perpendiculaire. Bissectrice = angle. Médiatrice = milieu + perpendiculaire.",
    },
  },
];

export default function TrianglesPythagorePage() {
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
          <div className="lecon-badge">📏 Maths — 5ème</div>
          <h1 className="lecon-titre">Triangles & Pythagore</h1>
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
            Le <strong>théorème de Pythagore</strong> : le plus célèbre en maths
            ! Il s'applique aux triangles rectangles et permet de calculer un
            côté manquant.
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
              <div className="lecon-point-titre">📐 Théorème de Pythagore</div>
              <div className="lecon-point-texte">
                Triangle rectangle en C : AB² = AC² + BC². L'hypoténuse AB est
                en face de l'angle droit.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> AC=3, BC=4 →
                AB²=9+16=25 → AB=5 cm.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔄 Réciproque</div>
              <div className="lecon-point-texte">
                Si AB² = AC² + BC², le triangle est rectangle. Sert à vérifier
                si un triangle est rectangle.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Côtés 6-8-10 :
                36+64=100=10² → rectangle !
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📏 Vocabulaire</div>
              <div className="lecon-point-texte">
                Hypoténuse = côté le plus long (face à l'angle droit). Cathète =
                les 2 autres côtés. Hauteur = perpendiculaire.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Triplets :</span> 3-4-5, 6-8-10,
                5-12-13. À retenir !
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
                  marginBottom: "16px",
                }}
              >
                📖 Fiche pédagogique
              </div>
              {q.fiche.svg && (
                <div
                  style={{
                    marginBottom: "16px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "8px",
                  }}
                  dangerouslySetInnerHTML={{ __html: q.fiche.svg }}
                />
              )}
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
