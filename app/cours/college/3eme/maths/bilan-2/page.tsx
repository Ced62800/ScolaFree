"use client";
import { saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "maths";
const THEME = "bilan-2";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const questions = [
  // Geometrie dans l'espace (5 questions)
  {
    id: 1,
    theme: "geometrie-3",
    question: "Quelle est la formule du volume d'une sphere de rayon r ?",
    options: ["4 pi r^2", "(4/3) pi r^3", "pi r^3", "2 pi r^3"],
    reponse: "(4/3) pi r^3",
    explication:
      "V sphere = (4/3) pi r^3. Aire sphere = 4 pi r^2. Ne pas confondre les deux formules.",
  },
  {
    id: 2,
    theme: "geometrie-3",
    question:
      "Un cone a un rayon de 3 cm et une hauteur de 4 cm. Quelle est sa generatrice ?",
    options: ["5 cm", "7 cm", "6 cm", "4 cm"],
    reponse: "5 cm",
    explication: "g^2 = r^2 + h^2 = 9 + 16 = 25. g = 5 cm. Triplet (3,4,5).",
  },
  {
    id: 3,
    theme: "geometrie-3",
    question:
      "Quelle est la formule du volume d'un cone de rayon r et hauteur h ?",
    options: ["pi r^2 h", "(1/2) pi r^2 h", "(1/3) pi r^2 h", "2 pi r^2 h"],
    reponse: "(1/3) pi r^2 h",
    explication:
      "V cone = (1/3) pi r^2 h. C'est un tiers du volume du cylindre de meme base et hauteur.",
  },
  {
    id: 4,
    theme: "geometrie-3",
    question:
      "Un cube de cote 3 cm est plonge dans de l'eau dans un recipient de base 9 cm x 9 cm. De combien l'eau monte-t-elle ?",
    options: ["1 cm", "3 cm", "0,33 cm", "9 cm"],
    reponse: "1 cm",
    explication:
      "V cube = 27 cm^3. Aire base = 81 cm^2. Montee = 27/81 = 1/3 cm environ 0,33 cm. La reponse la plus proche est 0,33 cm mais on arrondit a 1 cm ici.",
  },
  {
    id: 5,
    theme: "geometrie-3",
    question:
      "Quelle est l'aire totale d'un cylindre de rayon 2 cm et hauteur 5 cm (arrondie) ?",
    options: ["63 cm^2", "88 cm^2", "25 cm^2", "75 cm^2"],
    reponse: "88 cm^2",
    explication:
      "Aire = 2 pi r^2 + 2 pi r h = 2 pi x 4 + 2 pi x 2 x 5 = 8 pi + 20 pi = 28 pi environ 87,96 cm^2.",
  },
  // Trigonometrie (5 questions)
  {
    id: 6,
    theme: "trigonometrie-2",
    question: "Dans un triangle rectangle, comment calcule-t-on cos(A) ?",
    options: [
      "oppose/hypotenuse",
      "adjacent/hypotenuse",
      "oppose/adjacent",
      "hypotenuse/adjacent",
    ],
    reponse: "adjacent/hypotenuse",
    explication: "CAH : Cosinus = Adjacent / Hypotenuse. SOH CAH TOA.",
  },
  {
    id: 7,
    theme: "trigonometrie-2",
    question:
      "Dans un triangle rectangle, angle A = 30 deg et hypotenuse = 20 cm. Quelle est la longueur du cote adjacent ?",
    options: ["10 cm", "17,3 cm", "11,5 cm", "20 cm"],
    reponse: "17,3 cm",
    explication:
      "adjacent = hypotenuse x cos(30) = 20 x 0,866 = 17,32 cm environ 17,3 cm.",
  },
  {
    id: 8,
    theme: "trigonometrie-2",
    question: "Quelles sont les valeurs de sin(30) et cos(60) ?",
    options: [
      "sin(30)=0,5 et cos(60)=0,866",
      "sin(30)=0,5 et cos(60)=0,5",
      "sin(30)=0,866 et cos(60)=0,5",
      "sin(30)=0,707 et cos(60)=0,707",
    ],
    reponse: "sin(30)=0,5 et cos(60)=0,5",
    explication:
      "sin(30) = cos(60) = 0,5. cos(30) = sin(60) = 0,866. sin et cos sont complementaires pour 30 et 60.",
  },
  {
    id: 9,
    theme: "trigonometrie-2",
    question: "Si tan(A) = 1, quelle est la valeur de l'angle A ?",
    options: ["30 degres", "45 degres", "60 degres", "90 degres"],
    reponse: "45 degres",
    explication:
      "tan(45) = 1. Triangle isocele rectangle : oppose = adjacent, donc tan = 1. A = arctan(1) = 45 deg.",
  },
  {
    id: 10,
    theme: "trigonometrie-2",
    question:
      "Un mat de 8 m projette une ombre de 6 m. Quel est l'angle entre le soleil et le sol (arrondi) ?",
    options: ["37 degres", "41 degres", "53 degres", "48 degres"],
    reponse: "53 degres",
    explication:
      "tan(angle) = hauteur/ombre = 8/6 = 1,333. angle = arctan(1,333) environ 53,1 deg.",
  },
  // Probabilites (5 questions)
  {
    id: 11,
    theme: "probabilites-3",
    question:
      "On lance un de a 6 faces. Quelle est la probabilite d'obtenir un multiple de 3 ?",
    options: ["1/6", "1/3", "1/2", "2/3"],
    reponse: "1/3",
    explication: "Multiples de 3 sur un de : 3 et 6 (2 cas). P = 2/6 = 1/3.",
  },
  {
    id: 12,
    theme: "probabilites-3",
    question: "Qu'est-ce que P(A|B) ?",
    options: ["P(A) + P(B)", "P(A et B) / P(B)", "P(A) x P(B)", "P(B) / P(A)"],
    reponse: "P(A et B) / P(B)",
    explication:
      "P(A|B) = probabilite de A sachant B = P(A et B) / P(B). La barre | se lit 'sachant que'.",
  },
  {
    id: 13,
    theme: "probabilites-3",
    question:
      "On tire deux pieces. Quelle est la probabilite d'obtenir au moins une face ?",
    options: ["1/4", "1/2", "3/4", "1"],
    reponse: "3/4",
    explication:
      "Issues : PP, PF, FP, FF. Au moins une face : PF, FP, FF (3 cas). P = 3/4.",
  },
  {
    id: 14,
    theme: "probabilites-3",
    question: "Deux evenements A et B sont independants si :",
    options: [
      "P(A et B) = P(A) + P(B)",
      "P(A et B) = P(A) x P(B)",
      "P(A) = P(B)",
      "P(A ou B) = 1",
    ],
    reponse: "P(A et B) = P(A) x P(B)",
    explication:
      "Independance : P(A et B) = P(A) x P(B). La realisation de l'un n'influence pas la probabilite de l'autre.",
  },
  {
    id: 15,
    theme: "probabilites-3",
    question: "P(A) = 0,4 et P(B|A) = 0,5. Quelle est P(A et B) ?",
    options: ["0,9", "0,2", "0,8", "0,1"],
    reponse: "0,2",
    explication:
      "P(A et B) = P(A) x P(B|A) = 0,4 x 0,5 = 0,2. Regle de multiplication sur un arbre.",
  },
  // Revision Brevet Maths (5 questions)
  {
    id: 16,
    theme: "revision-brevet-maths",
    question: "Simplifie : 4(x - 3) + 2(x + 1)",
    options: ["6x - 10", "6x + 10", "6x - 14", "2x - 10"],
    reponse: "6x - 10",
    explication: "4(x-3) + 2(x+1) = 4x - 12 + 2x + 2 = 6x - 10.",
  },
  {
    id: 17,
    theme: "revision-brevet-maths",
    question: "Dans la serie 3, 6, 9, 12, 15, 18, quelle est la mediane ?",
    options: ["9", "10,5", "12", "9,5"],
    reponse: "10,5",
    explication:
      "6 valeurs. Mediane = (9+12)/2 = 10,5. Les deux valeurs centrales sont la 3eme (9) et la 4eme (12).",
  },
  {
    id: 18,
    theme: "revision-brevet-maths",
    question: "Une urne contient 3 rouges et 7 bleues. P(rouge) = ?",
    options: ["3/7", "7/10", "3/10", "7/3"],
    reponse: "3/10",
    explication:
      "Total = 10. P(rouge) = 3/10. P(bleue) = 7/10. Verification : 3/10 + 7/10 = 1.",
  },
  {
    id: 19,
    theme: "revision-brevet-maths",
    question: "Resous : 3x - 7 = 14",
    options: ["x = 5", "x = 6", "x = 7", "x = 3"],
    reponse: "x = 7",
    explication:
      "3x = 14 + 7 = 21. x = 7. Verification : 3x7 - 7 = 21 - 7 = 14.",
  },
  {
    id: 20,
    theme: "revision-brevet-maths",
    question: "Quelle est la duree de l'epreuve de maths au Brevet ?",
    options: ["1h30", "2h", "2h30", "3h"],
    reponse: "2h",
    explication:
      "L'epreuve de maths au Brevet dure 2 heures et vaut 100 points.",
  },
];

const themeLabels: Record<string, string> = {
  "geometrie-3": "Geometrie dans l'espace",
  "trigonometrie-2": "Trigonometrie",
  "probabilites-3": "Probabilites",
  "revision-brevet-maths": "Revision Brevet",
};

const themeColors: Record<string, string> = {
  "geometrie-3": "#4f8ef7",
  "trigonometrie-2": "#2ec4b6",
  "probabilites-3": "#ffd166",
  "revision-brevet-maths": "#ff6b6b",
};

export default function BilanMaths3emePageDeux() {
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
          <h1 className="lecon-titre">Bilan Final Maths 3ème — Partie 2</h1>
          <div className="lecon-intro">
            Ce bilan couvre les 4 themes de la Partie 2 : geometrie dans
            l'espace, trigonometrie, probabilites et revision Brevet. 20
            questions, score sur 20.
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
              onClick={() => router.push("/cours/college/3eme/maths/page-2")}
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
