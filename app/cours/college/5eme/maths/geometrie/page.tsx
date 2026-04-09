"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
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
  fiche: {
    regle: string;
    exemple: string;
    piege: string;
    astuce: string;
    svg?: string;
  };
};

const questionsBase: Question[] = [
  {
    question:
      "Quelle est la formule de l'aire d'un rectangle de longueur L et largeur l ?",
    options: ["A = L + l", "A = 2(L + l)", "A = L × l", "A = L² + l²"],
    answer: "A = L × l",
    fiche: {
      regle:
        "L'aire d'un rectangle = longueur × largeur. Le périmètre = 2 × (longueur + largeur).",
      exemple:
        "✅ Rectangle 6 cm × 4 cm : Aire = 6 × 4 = 24 cm². Périmètre = 2×(6+4) = 20 cm.",
      piege:
        "Ne pas confondre aire (surface = L×l) et périmètre (contour = 2(L+l)).",
      astuce:
        "Aire = L × l (multiplication). Périmètre = 2×(L+l) (addition des côtés).",
      svg: `<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="160" height="90" fill="rgba(79,142,247,0.15)" stroke="#4f8ef7" stroke-width="2"/><text x="100" y="70" text-anchor="middle" fill="#4f8ef7" font-size="14" font-weight="bold">A = L × l</text><text x="100" y="125" text-anchor="middle" fill="#aaa" font-size="11">L (longueur)</text><text x="8" y="68" text-anchor="middle" fill="#aaa" font-size="11" transform="rotate(-90,8,68)">l</text></svg>`,
    },
  },
  {
    question:
      "Quelle est la formule de l'aire d'un triangle de base b et hauteur h ?",
    options: ["A = b × h", "A = (b × h) / 2", "A = b + h", "A = b² + h²"],
    answer: "A = (b × h) / 2",
    fiche: {
      regle:
        "L'aire d'un triangle = (base × hauteur) / 2. La hauteur est perpendiculaire à la base.",
      exemple:
        "✅ Triangle base 8 cm, hauteur 5 cm : A = (8 × 5) / 2 = 20 cm².",
      piege:
        "Ne pas oublier de diviser par 2 ! Un triangle = moitié d'un rectangle.",
      astuce:
        "Triangle = moitié du rectangle de même base et hauteur. A = b×h÷2.",
      svg: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><polygon points="100,15 20,115 180,115" fill="rgba(46,196,182,0.15)" stroke="#2ec4b6" stroke-width="2"/><line x1="100" y1="15" x2="100" y2="115" stroke="#ffd166" stroke-width="1.5" stroke-dasharray="4"/><rect x="96" y="107" width="8" height="8" fill="none" stroke="#ffd166" stroke-width="1.5"/><text x="112" y="68" fill="#ffd166" font-size="12">h</text><text x="100" y="132" text-anchor="middle" fill="#aaa" font-size="11">base (b)</text><text x="100" y="80" text-anchor="middle" fill="#2ec4b6" font-size="12" font-weight="bold">A = b×h/2</text></svg>`,
    },
  },
  {
    question: "Quelle est la formule de l'aire d'un disque de rayon r ?",
    options: ["A = π × r", "A = 2 × π × r", "A = π × r²", "A = π × d"],
    answer: "A = π × r²",
    fiche: {
      regle:
        "Aire du disque = π × r². Périmètre du cercle (circonférence) = 2 × π × r. π ≈ 3,14.",
      exemple: "✅ Disque de rayon 3 cm : A = π × 3² = 9π ≈ 28,3 cm².",
      piege:
        "Aire = π × r² (rayon au carré). Périmètre = 2πr (rayon simple). Ne pas confondre !",
      astuce:
        "Aire disque = πr². Périmètre cercle = 2πr = πd. r = rayon, d = diamètre = 2r.",
      svg: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="70" r="55" fill="rgba(255,209,102,0.15)" stroke="#ffd166" stroke-width="2"/><line x1="100" y1="70" x2="155" y2="70" stroke="#ff6b6b" stroke-width="2"/><circle cx="100" cy="70" r="3" fill="#ffd166"/><text x="128" y="63" fill="#ff6b6b" font-size="13" font-weight="bold">r</text><text x="100" y="75" text-anchor="middle" fill="#ffd166" font-size="13" font-weight="bold">A = π r²</text><text x="100" y="130" text-anchor="middle" fill="#aaa" font-size="10">Périmètre = 2πr ≈ 6,28r</text></svg>`,
    },
  },
  {
    question: "Qu'est-ce qu'un axe de symétrie ?",
    options: [
      "Une droite qui coupe une figure en deux",
      "Une droite qui coupe une figure en deux parties superposables",
      "Le centre d'une figure",
      "Une diagonale",
    ],
    answer: "Une droite qui coupe une figure en deux parties superposables",
    fiche: {
      regle:
        "Un axe de symétrie partage une figure en deux parties qui se superposent exactement quand on plie le long de cet axe.",
      exemple:
        "✅ Un carré a 4 axes de symétrie. Un rectangle a 2 axes. Un cercle en a une infinité.",
      piege:
        "La diagonale d'un rectangle n'est PAS un axe de symétrie (les deux parties ne se superposent pas).",
      astuce:
        "Plie le long de la droite. Si les deux parties se superposent → axe de symétrie.",
      svg: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="25" width="120" height="80" fill="rgba(79,142,247,0.1)" stroke="#4f8ef7" stroke-width="2"/><line x1="100" y1="10" x2="100" y2="130" stroke="#ff6b6b" stroke-width="2" stroke-dasharray="6,3"/><line x1="20" y1="65" x2="180" y2="65" stroke="#2ec4b6" stroke-width="2" stroke-dasharray="6,3"/><text x="100" y="136" text-anchor="middle" fill="#aaa" font-size="10">Rectangle : 2 axes de symétrie</text><text x="106" y="18" fill="#ff6b6b" font-size="10">axe 1</text><text x="152" y="62" fill="#2ec4b6" font-size="10">axe 2</text></svg>`,
    },
  },
  {
    question: "Comment calcule-t-on le périmètre d'un cercle de diamètre d ?",
    options: ["P = π × d²", "P = π × d", "P = 2 × d", "P = d / π"],
    answer: "P = π × d",
    fiche: {
      regle:
        "Périmètre (circonférence) d'un cercle = π × d = 2 × π × r. Avec d = diamètre et r = rayon = d/2.",
      exemple: "✅ Cercle de diamètre 10 cm : P = π × 10 ≈ 31,4 cm.",
      piege:
        "P = π × d (diamètre). P = 2π × r (rayon). Les deux sont équivalents car d = 2r.",
      astuce:
        "Périmètre = πd. Aire = πr². Périmètre → d (diamètre). Aire → r² (rayon au carré).",
      svg: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="68" r="50" fill="none" stroke="#ff6b6b" stroke-width="2.5"/><line x1="50" y1="68" x2="150" y2="68" stroke="#4f8ef7" stroke-width="2"/><circle cx="100" cy="68" r="3" fill="#4f8ef7"/><text x="100" y="63" text-anchor="middle" fill="#4f8ef7" font-size="13" font-weight="bold">d</text><text x="100" y="128" text-anchor="middle" fill="#ff6b6b" font-size="13" font-weight="bold">P = π × d</text></svg>`,
    },
  },
  {
    question: "Quelle est l'aire d'un parallélogramme de base b et hauteur h ?",
    options: ["A = b + h", "A = (b × h) / 2", "A = b × h", "A = 2 × (b + h)"],
    answer: "A = b × h",
    fiche: {
      regle:
        "L'aire d'un parallélogramme = base × hauteur. La hauteur est perpendiculaire à la base (pas le côté oblique).",
      exemple:
        "✅ Parallélogramme base 8 cm, hauteur 5 cm : A = 8 × 5 = 40 cm².",
      piege: "Utiliser la hauteur (perpendiculaire) et non le côté oblique !",
      astuce: "Parallélogramme = rectangle 'penché'. Même formule A = b × h.",
      svg: `<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg"><polygon points="40,100 160,100 180,30 60,30" fill="rgba(255,107,107,0.15)" stroke="#ff6b6b" stroke-width="2"/><line x1="160" y1="30" x2="160" y2="100" stroke="#ffd166" stroke-width="1.5" stroke-dasharray="4"/><rect x="152" y="92" width="8" height="8" fill="none" stroke="#ffd166" stroke-width="1.5"/><text x="170" y="68" fill="#ffd166" font-size="12">h</text><text x="100" y="118" text-anchor="middle" fill="#aaa" font-size="11">base (b)</text><text x="100" y="72" text-anchor="middle" fill="#ff6b6b" font-size="13" font-weight="bold">A = b × h</text></svg>`,
    },
  },
  {
    question: "L'aire d'un trapèze de bases B et b, et de hauteur h est :",
    options: [
      "A = (B + b) × h",
      "A = (B + b) × h / 2",
      "A = B × h",
      "A = (B - b) × h / 2",
    ],
    answer: "A = (B + b) × h / 2",
    fiche: {
      regle: "Aire d'un trapèze = (grande base + petite base) × hauteur / 2.",
      exemple: "✅ Trapèze B=10, b=6, h=4 : A = (10+6)×4/2 = 32 cm².",
      piege: "Ne pas oublier de diviser par 2 ! Et utiliser les DEUX bases.",
      astuce: "Trapèze = moyenne des bases × hauteur. A = (B+b)/2 × h.",
      svg: `<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg"><polygon points="30,100 170,100 140,30 60,30" fill="rgba(255,209,102,0.15)" stroke="#ffd166" stroke-width="2"/><line x1="100" y1="30" x2="100" y2="100" stroke="#ff6b6b" stroke-width="1.5" stroke-dasharray="4"/><rect x="92" y="92" width="8" height="8" fill="none" stroke="#ff6b6b" stroke-width="1.5"/><text x="110" y="68" fill="#ff6b6b" font-size="12">h</text><text x="100" y="118" text-anchor="middle" fill="#aaa" font-size="10">Grande base B</text><text x="100" y="25" text-anchor="middle" fill="#aaa" font-size="10">Petite base b</text><text x="100" y="74" text-anchor="middle" fill="#ffd166" font-size="11" font-weight="bold">A=(B+b)×h/2</text></svg>`,
    },
  },
  {
    question: "Un losange est un quadrilatère...",
    options: [
      "avec 4 angles droits",
      "avec 4 côtés égaux",
      "avec 2 paires de côtés parallèles égaux",
      "avec 3 côtés égaux",
    ],
    answer: "avec 4 côtés égaux",
    fiche: {
      regle:
        "Un losange a 4 côtés égaux. Ses diagonales sont perpendiculaires et se coupent en leur milieu.",
      exemple: "✅ Losange : 4 côtés égaux. Carré = losange + angles droits.",
      piege: "Losange ≠ carré. Le carré a 4 côtés égaux ET 4 angles droits.",
      astuce:
        "Losange = 4 côtés égaux. Carré = losange + angles droits. Rectangle = angles droits + côtés opposés égaux.",
      svg: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><polygon points="100,15 175,70 100,125 25,70" fill="rgba(46,196,182,0.15)" stroke="#2ec4b6" stroke-width="2"/><line x1="100" y1="15" x2="100" y2="125" stroke="#aaa" stroke-width="1" stroke-dasharray="4"/><line x1="25" y1="70" x2="175" y2="70" stroke="#aaa" stroke-width="1" stroke-dasharray="4"/><text x="102" y="68" fill="#ffd166" font-size="12">⊥</text><text x="100" y="137" text-anchor="middle" fill="#aaa" font-size="10">Diagonales perpendiculaires</text></svg>`,
    },
  },
  {
    question: "Combien d'axes de symétrie possède un cercle ?",
    options: ["1", "4", "8", "Une infinité"],
    answer: "Une infinité",
    fiche: {
      regle:
        "Un cercle possède une infinité d'axes de symétrie. Chaque diamètre est un axe de symétrie.",
      exemple:
        "✅ Tout diamètre du cercle est un axe de symétrie. Il y en a une infinité.",
      piege: "Carré = 4 axes. Rectangle = 2 axes. Cercle = infinité d'axes.",
      astuce:
        "Cercle → ∞ axes. Carré → 4 axes. Rectangle → 2 axes. Triangle équilatéral → 3 axes.",
      svg: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="70" r="50" fill="rgba(79,142,247,0.1)" stroke="#4f8ef7" stroke-width="2"/><line x1="100" y1="20" x2="100" y2="120" stroke="#ff6b6b" stroke-width="1.5" stroke-dasharray="5,3"/><line x1="50" y1="70" x2="150" y2="70" stroke="#2ec4b6" stroke-width="1.5" stroke-dasharray="5,3"/><line x1="65" y1="35" x2="135" y2="105" stroke="#ffd166" stroke-width="1.5" stroke-dasharray="5,3"/><line x1="135" y1="35" x2="65" y2="105" stroke="#ff6b6b" stroke-width="1" stroke-dasharray="5,3" opacity="0.5"/><circle cx="100" cy="70" r="3" fill="#4f8ef7"/><text x="100" y="135" text-anchor="middle" fill="#aaa" font-size="10">∞ axes de symétrie (tout diamètre)</text></svg>`,
    },
  },
  {
    question: "Quelle est l'aire d'un carré de côté 7 cm ?",
    options: ["28 cm²", "14 cm²", "49 cm²", "56 cm²"],
    answer: "49 cm²",
    fiche: {
      regle: "Aire d'un carré = côté × côté = côté². Périmètre = 4 × côté.",
      exemple: "✅ Carré côté 7 cm : A = 7² = 49 cm². Périmètre = 4×7 = 28 cm.",
      piege:
        "Aire = côté² = 49. Périmètre = 4×côté = 28. Ne pas les confondre !",
      astuce: "Carré : A = c². P = 4c. 7²=49 (aire). 4×7=28 (périmètre).",
      svg: `<svg viewBox="0 0 160 140" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="100" height="100" fill="rgba(46,196,182,0.15)" stroke="#2ec4b6" stroke-width="2"/><text x="80" y="74" text-anchor="middle" fill="#2ec4b6" font-size="14" font-weight="bold">A = c²</text><text x="80" y="94" text-anchor="middle" fill="#2ec4b6" font-size="12">7² = 49 cm²</text><text x="80" y="135" text-anchor="middle" fill="#aaa" font-size="11">c = 7 cm</text><text x="14" y="72" text-anchor="middle" fill="#aaa" font-size="11" transform="rotate(-90,14,72)">c = 7 cm</text></svg>`,
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
          <div className="lecon-badge">📐 Maths — 5ème</div>
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
            En 5ème, tu maîtrises les <strong>aires et périmètres</strong> des
            figures et les <strong>symétries</strong>. Les fiches incluent des
            illustrations pour mieux comprendre !
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
              <div className="lecon-point-titre">📐 Aires des figures</div>
              <div className="lecon-point-texte">
                Rectangle : L×l. Triangle : b×h/2. Disque : π×r².
                Parallélogramme : b×h. Trapèze : (B+b)×h/2.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Triangle b=8,
                h=5 → A = 8×5/2 = 20 cm².
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📏 Périmètres</div>
              <div className="lecon-point-texte">
                Rectangle : 2(L+l). Carré : 4c. Cercle : 2πr = πd.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Cercle d=10 → P
                = π×10 ≈ 31,4 cm.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔁 Symétries</div>
              <div className="lecon-point-texte">
                Axe de symétrie = droite qui partage en 2 parties superposables.
                Carré : 4 axes. Cercle : ∞ axes.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Rectangle → 2
                axes de symétrie.
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
                    textAlign: "center",
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
