"use client";
import { saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "maths";
const THEME = "bilan";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const questions = [
  // Theoreme de Pythagore (5 questions)
  {
    id: 1,
    theme: "theoreme-pythagore-2",
    question:
      "Dans un triangle rectangle, les cotes de l'angle droit mesurent 8 cm et 15 cm. Quelle est l'hypotenuse ?",
    options: ["17 cm", "16 cm", "23 cm", "19 cm"],
    reponse: "17 cm",
    explication:
      "h^2 = 8^2 + 15^2 = 64 + 225 = 289. h = racine(289) = 17 cm. Triplet (8, 15, 17).",
  },
  {
    id: 2,
    theme: "theoreme-pythagore-2",
    question:
      "Un triangle a des cotes 5 cm, 12 cm et 13 cm. Est-il rectangle ?",
    options: [
      "Non",
      "Oui, car 5^2 + 12^2 = 13^2",
      "On ne peut pas savoir",
      "Oui, car 13 est le plus grand",
    ],
    reponse: "Oui, car 5^2 + 12^2 = 13^2",
    explication:
      "5^2 + 12^2 = 25 + 144 = 169 = 13^2. Reciproque de Pythagore : triangle rectangle.",
  },
  {
    id: 3,
    theme: "theoreme-pythagore-2",
    question:
      "Dans un carre de cote 7 cm, quelle est la longueur de la diagonale (arrondie au dixieme) ?",
    options: ["7,0 cm", "9,9 cm", "8,5 cm", "14,0 cm"],
    reponse: "9,9 cm",
    explication:
      "d^2 = 7^2 + 7^2 = 98. d = racine(98) = 7 x racine(2) environ 9,9 cm.",
  },
  {
    id: 4,
    theme: "theoreme-pythagore-2",
    question:
      "Dans un losange de diagonales 10 cm et 24 cm, quelle est la longueur d'un cote ?",
    options: ["13 cm", "17 cm", "12 cm", "15 cm"],
    reponse: "13 cm",
    explication:
      "Demi-diagonales : 5 et 12. Cote^2 = 5^2 + 12^2 = 25 + 144 = 169. Cote = 13 cm. Triplet (5,12,13).",
  },
  {
    id: 5,
    theme: "theoreme-pythagore-2",
    question:
      "Une echelle de 10 m est appuyee contre un mur. Son pied est a 6 m du mur. A quelle hauteur touche-t-elle le mur ?",
    options: ["8 m", "7 m", "9 m", "4 m"],
    reponse: "8 m",
    explication: "h^2 = 10^2 - 6^2 = 100 - 36 = 64. h = 8 m.",
  },
  // Racines carrees (5 questions)
  {
    id: 6,
    theme: "racines-carrees",
    question: "Quelle est la valeur exacte de racine(196) ?",
    options: ["13", "14", "15", "16"],
    reponse: "14",
    explication: "14^2 = 196. Donc racine(196) = 14.",
  },
  {
    id: 7,
    theme: "racines-carrees",
    question: "Simplifie racine(72).",
    options: [
      "6 x racine(2)",
      "8 x racine(3)",
      "6 x racine(3)",
      "9 x racine(2)",
    ],
    reponse: "6 x racine(2)",
    explication:
      "72 = 36 x 2. racine(72) = racine(36) x racine(2) = 6 x racine(2).",
  },
  {
    id: 8,
    theme: "racines-carrees",
    question: "Entre quels entiers se trouve racine(80) ?",
    options: ["8 et 9", "7 et 8", "9 et 10", "6 et 7"],
    reponse: "8 et 9",
    explication: "8^2 = 64 < 80 < 81 = 9^2. Donc 8 < racine(80) < 9.",
  },
  {
    id: 9,
    theme: "racines-carrees",
    question: "Calcule racine(5) x racine(20).",
    options: ["racine(25)", "10", "racine(100)", "5"],
    reponse: "10",
    explication: "racine(5) x racine(20) = racine(5 x 20) = racine(100) = 10.",
  },
  {
    id: 10,
    theme: "racines-carrees",
    question: "Laquelle est correcte ?",
    options: [
      "racine(16+9) = racine(16) + racine(9)",
      "racine(16 x 9) = racine(16) x racine(9)",
      "racine(16-9) = racine(16) - racine(9)",
      "racine(16/9) = racine(16) - racine(9)",
    ],
    reponse: "racine(16 x 9) = racine(16) x racine(9)",
    explication:
      "Seule la multiplication se distribue : racine(a x b) = racine(a) x racine(b). racine(16 x 9) = 4 x 3 = 12 = racine(144).",
  },
  // Statistiques (5 questions)
  {
    id: 11,
    theme: "statistiques-3",
    question: "Dans la serie 2, 5, 8, 11, 14, quelle est la mediane ?",
    options: ["8", "7", "11", "5"],
    reponse: "8",
    explication: "5 valeurs (impair). Mediane = 3eme valeur = 8.",
  },
  {
    id: 12,
    theme: "statistiques-3",
    question: "Quelle est l'etendue de la serie : 3, 8, 12, 5, 19, 7 ?",
    options: ["16", "19", "12", "3"],
    reponse: "16",
    explication: "Etendue = max - min = 19 - 3 = 16.",
  },
  {
    id: 13,
    theme: "statistiques-3",
    question: "Qu'est-ce que Q1 ?",
    options: [
      "La valeur minimale",
      "La valeur en dessous de laquelle se trouvent 25% des donnees",
      "La mediane",
      "La valeur maximale",
    ],
    reponse: "La valeur en dessous de laquelle se trouvent 25% des donnees",
    explication:
      "Q1 = premier quartile : 25% des valeurs sont en dessous. Q2 = mediane (50%). Q3 = 75%.",
  },
  {
    id: 14,
    theme: "statistiques-3",
    question: "Qu'est-ce que l'ecart interquartile ?",
    options: ["Q1 + Q3", "Q3 - Q1", "Max - Min", "Q2 - Q1"],
    reponse: "Q3 - Q1",
    explication:
      "EIQ = Q3 - Q1. Mesure la dispersion des 50% centraux. Moins sensible aux extremes que l'etendue.",
  },
  {
    id: 15,
    theme: "statistiques-3",
    question: "Quand moyenne > mediane, la distribution est :",
    options: [
      "Symetrique",
      "Asymetrique positive (tiree vers les grandes valeurs)",
      "Asymetrique negative",
      "Impossible a determiner",
    ],
    reponse: "Asymetrique positive (tiree vers les grandes valeurs)",
    explication:
      "Moyenne > mediane = quelques grandes valeurs tirent la moyenne vers le haut. Distribution asymetrique positive.",
  },
  // Systemes d'equations (5 questions)
  {
    id: 16,
    theme: "systemes-equations",
    question: "Resous : x + y = 8 et x - y = 2. Quelle est la valeur de x ?",
    options: ["x = 3", "x = 4", "x = 5", "x = 6"],
    reponse: "x = 5",
    explication:
      "Addition : 2x = 10, x = 5. Puis y = 8 - 5 = 3. Verification : 5+3=8 et 5-3=2.",
  },
  {
    id: 17,
    theme: "systemes-equations",
    question:
      "Resous par substitution : y = 3x et x + y = 12. Quelle est la valeur de x ?",
    options: ["x = 2", "x = 3", "x = 4", "x = 6"],
    reponse: "x = 3",
    explication:
      "y = 3x dans x+y=12 : x+3x=12, 4x=12, x=3. Puis y=9. Verification : 3+9=12.",
  },
  {
    id: 18,
    theme: "systemes-equations",
    question:
      "Que signifie obtenir '0 = 0' lors de la resolution d'un systeme ?",
    options: [
      "Aucune solution",
      "Une solution unique x=0, y=0",
      "Une infinite de solutions",
      "Une erreur de calcul",
    ],
    reponse: "Une infinite de solutions",
    explication:
      "0=0 est une tautologie : les deux equations sont equivalentes (meme droite). Infinite de solutions.",
  },
  {
    id: 19,
    theme: "systemes-equations",
    question:
      "Deux nombres ont une somme de 30 et une difference de 6. Quel est le plus grand ?",
    options: ["15", "18", "20", "12"],
    reponse: "18",
    explication:
      "x+y=30 et x-y=6. Addition : 2x=36, x=18. Puis y=12. Verification : 18+12=30 et 18-12=6.",
  },
  {
    id: 20,
    theme: "systemes-equations",
    question: "Resous : 2x + y = 7 et x - y = 2. Quelle est la valeur de y ?",
    options: ["y = 1", "y = 2", "y = 3", "y = 4"],
    reponse: "y = 1",
    explication:
      "Addition : 3x = 9, x = 3. Puis y = 7 - 2x3 = 1. Verification : 2x3+1=7 et 3-1=2.",
  },
];

const themeLabels: Record<string, string> = {
  "theoreme-pythagore-2": "Theoreme de Pythagore",
  "racines-carrees": "Racines carrees",
  "statistiques-3": "Statistiques",
  "systemes-equations": "Systemes d'equations",
};

const themeColors: Record<string, string> = {
  "theoreme-pythagore-2": "#4f8ef7",
  "racines-carrees": "#2ec4b6",
  "statistiques-3": "#ffd166",
  "systemes-equations": "#ff6b6b",
};

export default function BilanMaths3emePage() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [questionsShuffled, setQuestionsShuffled] = useState(questions);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [resultats, setResultats] = useState<boolean[]>([]);
  const scoreRef = useRef(0);
  const scoreSaved = useRef(false);
  const [estConnecte, setEstConnecte] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (user) setEstConnecte(true);
      else router.push("/inscription");
    };
    init();
  }, []);

  const demarrer = () => {
    const shuffled = shuffleArray(questions);
    setQuestionsShuffled(shuffled);
    scoreRef.current = 0;
    scoreSaved.current = false;
    setIndex(0);
    setSelected(null);
    setResultats([]);
    setEtape("qcm");
  };

  const choisir = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const correct = opt === questionsShuffled[index].reponse;
    if (correct) scoreRef.current += 1;
    setResultats((r) => [...r, correct]);
  };

  const suivant = async () => {
    if (index + 1 >= questionsShuffled.length) {
      if (!scoreSaved.current && estConnecte) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score: scoreRef.current,
          total: questionsShuffled.length,
        });
      }
      setEtape("fini");
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const scoreParTheme = () => {
    return Object.keys(themeLabels).map((t) => {
      const qs = questionsShuffled.filter((q) => q.theme === t);
      const idxs = qs.map((q) => questionsShuffled.indexOf(q));
      const bonnes = idxs.filter((i) => resultats[i]).length;
      return { theme: t, bonnes, total: qs.length };
    });
  };

  const total = questionsShuffled.length;
  const q = questionsShuffled[index];

  if (etape === "intro")
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan — Maths 3ème</div>
          <h1 className="lecon-titre">Bilan Final Maths 3ème — Partie 1</h1>
          <div className="lecon-intro">
            Ce bilan couvre les 4 themes de la Partie 1 : Pythagore, racines
            carrees, statistiques et systemes d'equations. 20 questions, score
            sur 20.
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            {Object.entries(themeLabels).map(([id, label]) => (
              <div
                key={id}
                style={{
                  background: `${themeColors[id]}18`,
                  border: `1px solid ${themeColors[id]}44`,
                  borderRadius: "12px",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: themeColors[id],
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#aaa",
                    marginTop: "4px",
                  }}
                >
                  5 questions
                </div>
              </div>
            ))}
          </div>
          <button className="lecon-btn" onClick={demarrer}>
            🚀 Commencer le bilan →
          </button>
        </div>
      </div>
    );

  if (etape === "qcm")
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
              {scoreRef.current} / {total}
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
          <div
            style={{
              fontSize: "0.8rem",
              color: themeColors[q.theme],
              fontWeight: 700,
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            {themeLabels[q.theme]}
          </div>
          <div className="qcm-question">{q.question}</div>
          <div className="qcm-options">
            {q.options.map((opt) => {
              let cn = "qcm-option";
              if (selected) {
                if (opt === q.reponse) cn += " correct";
                else if (opt === selected) cn += " incorrect";
                else cn += " disabled";
              }
              return (
                <button key={opt} className={cn} onClick={() => choisir(opt)}>
                  {opt}
                </button>
              );
            })}
          </div>
          {selected && (
            <div
              className={`qcm-feedback ${selected === q.reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <span className="feedback-icon">
                {selected === q.reponse ? "✅" : "❌"}
              </span>
              <div className="feedback-texte">
                <strong>
                  {selected === q.reponse ? "Bravo !" : "Pas tout a fait..."}
                </strong>
                <p>{q.explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button
              className="lecon-btn"
              onClick={suivant}
              style={{ marginTop: "16px" }}
            >
              {index + 1 >= total
                ? "Voir mon resultat →"
                : "Question suivante →"}
            </button>
          )}
        </div>
      </div>
    );

  if (etape === "fini") {
    const pourcentage = Math.round((scoreRef.current / total) * 100);
    const emoji = pourcentage >= 80 ? "🏆" : pourcentage >= 60 ? "👍" : "💪";
    const stats = scoreParTheme();
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="resultat-wrapper">
          <div className="resultat-icon">{emoji}</div>
          <h2 className="resultat-titre">
            {pourcentage >= 80
              ? "Excellent !"
              : pourcentage >= 60
                ? "Bien joue !"
                : "Continue !"}
          </h2>
          <div className="resultat-score">
            {scoreRef.current} / {total}
          </div>
          <p className="resultat-desc">{pourcentage}% de bonnes reponses</p>
          <div style={{ width: "100%", marginBottom: "24px" }}>
            {stats.map((s) => (
              <div key={s.theme} style={{ marginBottom: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{ color: themeColors[s.theme], fontWeight: 700 }}
                  >
                    {themeLabels[s.theme]}
                  </span>
                  <span style={{ color: "#fff" }}>
                    {s.bonnes}/{s.total}
                  </span>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    height: "8px",
                  }}
                >
                  <div
                    style={{
                      background: themeColors[s.theme],
                      borderRadius: "8px",
                      height: "8px",
                      width: `${(s.bonnes / s.total) * 100}%`,
                      transition: "width 0.6s",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="resultat-actions">
            <button className="lecon-btn" onClick={demarrer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn-outline"
              onClick={() => router.push("/cours/college/3eme/maths")}
            >
              ← Retour aux cours
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
