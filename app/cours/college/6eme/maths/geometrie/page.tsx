"use client";

import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "maths";
const THEME = "geometrie";

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
      "Comment s'appellent deux droites qui se croisent en formant un angle droit ?",
    options: ["Parallèles", "Perpendiculaires", "Sécantes", "Obliques"],
    answer: "Perpendiculaires",
    fiche: {
      regle:
        "Deux droites sont perpendiculaires quand elles forment un angle droit (90°). On note ⊥. Deux droites sont parallèles quand elles ne se croisent jamais.",
      exemple:
        "✅ Les côtés d'un carré sont perpendiculaires entre eux. Les rails d'un chemin de fer sont parallèles.",
      piege:
        "Perpendiculaires = angle droit / Parallèles = ne se croisent jamais. Ne pas confondre !",
      astuce:
        "Per-pendiculaires = Per-pendiculaires à 90°. Les rails de train = parallèles !",
    },
  },
  {
    question: "Combien d'axes de symétrie a un carré ?",
    options: ["1", "2", "4", "8"],
    answer: "4",
    fiche: {
      regle:
        "Un carré a 4 axes de symétrie : 2 diagonales + 2 médianes (lignes passant par les milieux des côtés opposés).",
      exemple:
        "✅ Carré : 4 axes / Rectangle : 2 axes / Cercle : infiniment d'axes / Triangle équilatéral : 3 axes",
      piege:
        "Ne pas confondre avec le rectangle qui n'a que 2 axes de symétrie (pas les diagonales) !",
      astuce:
        "Carré = 4 axes (2 diagonales + 2 médianes). Pense à le plier en 4 façons différentes !",
    },
  },
  {
    question: "Quelle est la mesure d'un angle droit ?",
    options: ["45°", "90°", "180°", "360°"],
    answer: "90°",
    fiche: {
      regle:
        "Un angle droit mesure exactement 90°. Un angle plat = 180°. Un tour complet = 360°. Un angle aigu < 90°. Un angle obtus entre 90° et 180°.",
      exemple:
        "✅ Les coins d'une feuille de papier sont des angles droits (90°).",
      piege:
        "90° = angle droit / 180° = angle plat / 360° = tour complet. Ne pas confondre !",
      astuce:
        "Angle droit = 90° (comme le coin d'une feuille). On le repère avec le petit carré !",
    },
  },
  {
    question: "Quel quadrilatère a 4 côtés égaux et 4 angles droits ?",
    options: ["Rectangle", "Losange", "Carré", "Parallélogramme"],
    answer: "Carré",
    fiche: {
      regle:
        "Carré : 4 côtés égaux + 4 angles droits. Rectangle : 4 angles droits mais côtés pas tous égaux. Losange : 4 côtés égaux mais angles pas forcément droits.",
      exemple:
        "✅ Carré = 4 côtés égaux + 4 angles droits / Rectangle = angles droits seulement",
      piege:
        "Un losange a 4 côtés égaux MAIS ses angles ne sont pas forcément des angles droits !",
      astuce:
        "Carré = losange + angles droits = rectangle + côtés égaux. C'est le plus parfait !",
    },
  },
  {
    question:
      "Comment s'appelle le point équidistant de tous les points d'un cercle ?",
    options: ["Rayon", "Diamètre", "Centre", "Corde"],
    answer: "Centre",
    fiche: {
      regle:
        "Le centre d'un cercle est équidistant de tous les points du cercle. Le rayon = distance centre-cercle. Le diamètre = 2 × rayon.",
      exemple:
        "✅ Centre O / Rayon OA / Diamètre = AB (passe par O) / Diamètre = 2 × rayon",
      piege:
        "Le rayon est un segment, pas un point ! Le centre est le POINT equidistant.",
      astuce:
        "Centre = point milieu / Rayon = centre vers bord / Diamètre = 2 × rayon !",
    },
  },
  {
    question: "Un triangle dont tous les côtés sont égaux s'appelle :",
    options: [
      "Triangle rectangle",
      "Triangle isocèle",
      "Triangle équilatéral",
      "Triangle scalène",
    ],
    answer: "Triangle équilatéral",
    fiche: {
      regle:
        "Triangle équilatéral : 3 côtés égaux + 3 angles égaux (60° chacun). Isocèle : 2 côtés égaux. Rectangle : 1 angle droit. Scalène : aucun côté égal.",
      exemple:
        "✅ Équilatéral : 3 côtés = 3 angles / Isocèle : 2 côtés égaux / Scalène : tous différents",
      piege: "Isocèle ≠ équilatéral ! Isocèle = 2 côtés égaux seulement.",
      astuce:
        "Équi-latéral = côtés égaux (équ = égal, latéral = côté). 3 côtés égaux = 3 angles de 60° !",
    },
  },
  {
    question: "Quelle figure a exactement 5 côtés ?",
    options: ["Quadrilatère", "Hexagone", "Pentagone", "Octogone"],
    answer: "Pentagone",
    fiche: {
      regle:
        "Pentagone = 5 côtés / Hexagone = 6 côtés / Heptagone = 7 côtés / Octogone = 8 côtés / Quadrilatère = 4 côtés.",
      exemple:
        "✅ Pentagone : maison vue de face (5 côtés) / Hexagone : alvéole d'abeille (6 côtés)",
      piege: "Ne pas confondre les préfixes : penta=5 / hexa=6 / octo=8.",
      astuce:
        "Penta = 5 (comme une étoile à 5 branches) / Hexa = 6 (comme les alvéoles d'abeille) !",
    },
  },
  {
    question: "Deux droites sont parallèles si elles :",
    options: [
      "Se coupent en angle droit",
      "Ne se coupent jamais",
      "Se coupent en un point",
      "Forment un angle de 45°",
    ],
    answer: "Ne se coupent jamais",
    fiche: {
      regle:
        "Deux droites sont parallèles si elles sont dans le même plan et ne se croisent jamais, quelle que soit leur longueur.",
      exemple:
        "✅ Les rails de chemin de fer / Les lignes d'une feuille de papier / Les côtés opposés d'un rectangle",
      piege:
        "Des droites parallèles peuvent sembler se rejoindre à l'horizon, mais ce n'est qu'une illusion !",
      astuce:
        "Parallèles = jamais ensemble. Pense aux rails de train qui ne se touchent jamais !",
    },
  },
  {
    question: "Quelle est la somme des angles d'un triangle ?",
    options: ["90°", "180°", "270°", "360°"],
    answer: "180°",
    fiche: {
      regle:
        "La somme des angles d'un triangle est toujours égale à 180°, quel que soit le triangle.",
      exemple:
        "✅ Triangle équilatéral : 60° + 60° + 60° = 180° / Triangle rectangle : 90° + 45° + 45° = 180°",
      piege:
        "360° c'est la somme des angles d'un quadrilatère, pas d'un triangle !",
      astuce:
        "Triangle → 3 angles → 180°. Quadrilatère → 4 angles → 360°. Retiens les deux !",
    },
  },
  {
    question: "Quel instrument utilise-t-on pour tracer un angle droit ?",
    options: ["Le compas", "La règle", "Le rapporteur", "L'équerre"],
    answer: "L'équerre",
    fiche: {
      regle:
        "L'équerre sert à tracer et vérifier les angles droits. Le compas trace des cercles et des arcs. Le rapporteur mesure tous types d'angles.",
      exemple:
        "✅ Équerre → angles droits / Compas → cercles / Rapporteur → mesurer les angles",
      piege:
        "Le rapporteur MESURE les angles mais ne trace pas facilement un angle droit. L'équerre est plus précise !",
      astuce:
        "Équerre → angle droit (90°) / Compas → cercles / Rapporteur → tous les angles !",
    },
  },
];

export default function GeometriePage() {
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

  if (etape === "intro")
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">🔢 Maths — 6ème</div>
          <h1 className="lecon-titre">La géométrie</h1>
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
            La <strong>géométrie</strong> étudie les figures, les droites et les
            angles. En 6ème on travaille sur les droites, les polygones, le
            cercle et la symétrie.
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
              <div className="lecon-point-titre">📐 Droites et angles</div>
              <div className="lecon-point-texte">
                <strong>Perpendiculaires</strong> = angle droit (90°) ·{" "}
                <strong>Parallèles</strong> = ne se croisent jamais
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Angles :</span> aigu &lt; 90° /
                droit = 90° / obtus entre 90° et 180°
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔷 Les polygones</div>
              <div className="lecon-point-texte">
                Triangle (3) · Quadrilatère (4) · Pentagone (5) · Hexagone (6) ·
                Octogone (8)
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Triangles :</span> équilatéral
                (3 côtés égaux) / isocèle (2 côtés) / scalène (aucun)
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">⭕ Le cercle</div>
              <div className="lecon-point-texte">
                <strong>Centre</strong> = point équidistant ·{" "}
                <strong>Rayon</strong> = centre → bord ·{" "}
                <strong>Diamètre</strong> = 2 × rayon
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Somme des angles :</span>{" "}
                triangle = 180° / quadrilatère = 360°
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
                      Tu dois relire la fiche avant de continuer ! 💪
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
