"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "maths";
const THEME = "trigonometrie-2";

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
      "Dans un triangle rectangle en A, comment calcule-t-on le sinus de l'angle B ?",
    options: [
      "sin(B) = cote adjacent / hypotenuse",
      "sin(B) = cote oppose / hypotenuse",
      "sin(B) = cote oppose / cote adjacent",
      "sin(B) = hypotenuse / cote oppose",
    ],
    answer: "sin(B) = cote oppose / hypotenuse",
    fiche: {
      regle:
        "Dans un triangle rectangle, pour un angle aigu : sin = oppose/hypotenuse, cos = adjacent/hypotenuse, tan = oppose/adjacent. Moyen mnemo : SOH CAH TOA.",
      exemple:
        "Triangle rectangle en A, angle B. Le cote oppose a B est AC, l'hypotenuse est BC. sin(B) = AC/BC.",
      piege:
        "Le cote oppose et le cote adjacent dependent de l'angle considere. Pour l'angle B : oppose = cote en face de B. Adjacent = cote qui forme l'angle B avec l'hypotenuse.",
      astuce:
        "SOH CAH TOA : Sin = Oppose/Hypotenuse. Cos = Adjacent/Hypotenuse. Tan = Oppose/Adjacent. Apprendre cette formule par coeur.",
    },
  },
  {
    question:
      "Dans un triangle rectangle, l'angle A mesure 30 degres et l'hypotenuse vaut 10 cm. Quelle est la longueur du cote oppose a A ?",
    options: ["5 cm", "8,66 cm", "10 cm", "5,77 cm"],
    answer: "5 cm",
    fiche: {
      regle:
        "sin(30) = oppose/hypotenuse. Donc oppose = hypotenuse x sin(30) = 10 x 0,5 = 5 cm. Valeurs a connaitre : sin(30) = 0,5, sin(45) = racine(2)/2 environ 0,707, sin(60) = racine(3)/2 environ 0,866.",
      exemple:
        "sin(30) = 0,5. Oppose = 10 x 0,5 = 5 cm. Verification : cos(30) = adjacent/10, adjacent = 10 x cos(30) = 10 x 0,866 = 8,66 cm.",
      piege:
        "sin(30) = 0,5, pas 0,3 ni 0,577. Les valeurs remarquables (30, 45, 60) sont a connaitre par coeur pour le Brevet.",
      astuce:
        "Valeurs remarquables : sin(30)=0,5, cos(30)=0,866, tan(30)=0,577. sin(45)=cos(45)=0,707. sin(60)=0,866, cos(60)=0,5.",
    },
  },
  {
    question:
      "Dans un triangle rectangle, si tan(A) = 3/4, que vaut l'angle A (arrondi au degre) ?",
    options: ["37 degres", "41 degres", "53 degres", "45 degres"],
    answer: "37 degres",
    fiche: {
      regle:
        "Pour trouver un angle a partir d'un rapport trigonometrique, on utilise la fonction inverse : A = arctan(3/4). arctan(0,75) environ 36,87 degres, soit 37 degres.",
      exemple:
        "tan(A) = 3/4 = 0,75. A = arctan(0,75) environ 36,87 degres environ 37 degres. Sur la calculatrice : touche tan^-1 ou arctan.",
      piege:
        "Ne pas confondre tan(A) = 3/4 avec A = 3/4 degres. Il faut appliquer arctan pour trouver l'angle.",
      astuce:
        "Pour trouver l'angle : arcsin, arccos, arctan (fonctions inverses). Sur calculatrice : touche 2nd ou Shift + sin/cos/tan.",
    },
  },
  {
    question:
      "Dans un triangle rectangle en B, AB = 6 cm et BC = 8 cm. Quelle est la valeur de cos(C) ?",
    options: ["cos(C) = 6/10", "cos(C) = 8/10", "cos(C) = 6/8", "cos(C) = 8/6"],
    answer: "cos(C) = 8/10",
    fiche: {
      regle:
        "D'abord calculer AC (hypotenuse) : AC^2 = AB^2 + BC^2 = 36 + 64 = 100, AC = 10 cm. Pour l'angle C : cote adjacent = BC = 8 cm, hypotenuse = AC = 10 cm. cos(C) = 8/10.",
      exemple:
        "AC = 10 cm (hypotenuse). Pour angle C : adjacent = BC = 8, oppose = AB = 6. cos(C) = adjacent/hypotenuse = 8/10 = 0,8.",
      piege:
        "Rectangle en B = angle droit en B. L'hypotenuse est AC (en face de l'angle droit). Pour cos(C) : adjacent a C = BC (pas AB).",
      astuce:
        "Identifier d'abord l'hypotenuse (en face de l'angle droit). Puis pour chaque angle : adjacent = cote qui forme l'angle avec l'hypotenuse.",
    },
  },
  {
    question:
      "Un arbre projette une ombre de 12 m. L'angle entre le soleil et le sol est de 35 degres. Quelle est la hauteur de l'arbre (arrondie au metre) ?",
    options: ["7 m", "8 m", "9 m", "10 m"],
    answer: "8 m",
    fiche: {
      regle:
        "L'arbre, l'ombre et le rayon de soleil forment un triangle rectangle. tan(35) = hauteur/ombre. Hauteur = ombre x tan(35) = 12 x 0,700 = 8,4 m environ 8 m.",
      exemple:
        "tan(35) environ 0,700. Hauteur = 12 x 0,700 = 8,4 m, arrondi a 8 m. On utilise tan car on connait le cote adjacent (ombre) et on cherche l'oppose (hauteur).",
      piege:
        "Utiliser tan quand on connait adjacent et on cherche oppose (ou inversement). Ne pas utiliser sin ou cos qui necessiteraient l'hypotenuse.",
      astuce:
        "Choisir la bonne formule : sin si hypotenuse connue et oppose cherche. cos si hypotenuse connue et adjacent cherche. tan si oppose et adjacent.",
    },
  },
  {
    question: "Quelles sont les valeurs exactes de sin(45) et cos(45) ?",
    options: [
      "sin(45) = 1/2 et cos(45) = racine(3)/2",
      "sin(45) = racine(2)/2 et cos(45) = racine(2)/2",
      "sin(45) = racine(3)/2 et cos(45) = 1/2",
      "sin(45) = 1 et cos(45) = 0",
    ],
    answer: "sin(45) = racine(2)/2 et cos(45) = racine(2)/2",
    fiche: {
      regle:
        "Valeurs exactes : sin(30)=1/2, cos(30)=racine(3)/2, tan(30)=1/racine(3). sin(45)=cos(45)=racine(2)/2. sin(60)=racine(3)/2, cos(60)=1/2, tan(60)=racine(3).",
      exemple:
        "Pour 45 degres : triangle isocele rectangle de cotes 1, 1, racine(2). sin(45) = 1/racine(2) = racine(2)/2 environ 0,707.",
      piege:
        "sin(45) = cos(45) car le triangle isocele rectangle est symetrique. Ce n'est pas le cas pour 30 et 60 ou sin et cos s'echangent.",
      astuce:
        "Tableau a memoriser : 30/60/45. sin(30)=cos(60)=1/2. sin(60)=cos(30)=racine(3)/2. sin(45)=cos(45)=racine(2)/2.",
    },
  },
  {
    question:
      "Dans un triangle rectangle, si sin(A) = 0,6 et l'hypotenuse = 15 cm, quelle est la longueur du cote oppose a A ?",
    options: ["7 cm", "9 cm", "10 cm", "12 cm"],
    answer: "9 cm",
    fiche: {
      regle:
        "sin(A) = oppose/hypotenuse. Donc oppose = hypotenuse x sin(A) = 15 x 0,6 = 9 cm.",
      exemple:
        "oppose = 15 x 0,6 = 9 cm. Verification : sin(A) = 9/15 = 0,6. Correct.",
      piege:
        "Ne pas diviser : oppose n'est pas hypotenuse/sin(A). La formule est sin(A) = oppose/hypotenuse, donc oppose = hypotenuse x sin(A).",
      astuce:
        "Isole la quantite cherchee : sin(A) = opp/hyp. Si on cherche opp : opp = hyp x sin(A). Si on cherche hyp : hyp = opp/sin(A).",
    },
  },
  {
    question: "Qu'est-ce que tan(A) dans un triangle rectangle ?",
    options: [
      "tan(A) = hypotenuse / cote oppose",
      "tan(A) = cote adjacent / cote oppose",
      "tan(A) = cote oppose / cote adjacent",
      "tan(A) = cote oppose / hypotenuse",
    ],
    answer: "tan(A) = cote oppose / cote adjacent",
    fiche: {
      regle:
        "SOH CAH TOA : Sin = Oppose/Hypotenuse. Cos = Adjacent/Hypotenuse. Tan = Oppose/Adjacent. La tangente est le rapport de l'oppose sur l'adjacent.",
      exemple:
        "Triangle rectangle : angle A, oppose = 3, adjacent = 4, hypotenuse = 5. tan(A) = 3/4 = 0,75. A = arctan(0,75) environ 37 degres.",
      piege:
        "tan(A) = oppose/adjacent, pas adjacent/oppose (ce serait tan(90-A)). L'ordre dans la fraction compte !",
      astuce:
        "TOA = Tangente Oppose Adjacent. tan = O/A. Facile a memoriser avec SOH CAH TOA.",
    },
  },
  {
    question:
      "Dans un triangle rectangle, cos(A) = 5/13 et l'hypotenuse = 13 cm. Quelle est la longueur du cote adjacent a A ?",
    options: ["5 cm", "12 cm", "10 cm", "8 cm"],
    answer: "5 cm",
    fiche: {
      regle:
        "cos(A) = adjacent/hypotenuse. Donc adjacent = hypotenuse x cos(A) = 13 x (5/13) = 5 cm.",
      exemple:
        "adjacent = 13 x 5/13 = 5 cm. Le cote oppose : sin(A) = oppose/13, et par Pythagore, oppose = racine(13^2 - 5^2) = racine(144) = 12 cm.",
      piege:
        "Bien identifier le cote adjacent a A (celui qui forme l'angle A avec l'hypotenuse, pas le cote oppose).",
      astuce:
        "CAH = Cosinus Adjacent Hypotenuse. adjacent = hypotenuse x cos(A). Triplet (5, 12, 13) : reconnaitre pour eviter les calculs.",
    },
  },
  {
    question:
      "Un avion monte avec un angle de 20 degres par rapport au sol. Apres avoir parcouru 1000 m (distance au sol), a quelle altitude est-il (arrondie au metre) ?",
    options: ["342 m", "364 m", "940 m", "200 m"],
    answer: "364 m",
    fiche: {
      regle:
        "tan(20) = altitude/distance au sol. Altitude = 1000 x tan(20) = 1000 x 0,364 = 364 m.",
      exemple:
        "tan(20) environ 0,364. Altitude = 1000 x 0,364 = 364 m. On utilise tan car on connait l'adjacent (distance au sol) et on cherche l'oppose (altitude).",
      piege:
        "Distance au sol = cote adjacent. Altitude = cote oppose. On utilise tan = oppose/adjacent. Ne pas utiliser sin qui necessiterait la distance parcourue en ligne droite.",
      astuce:
        "Probleme d'angle d'elevation : tan(angle) = hauteur/distance horizontale. Hauteur = distance x tan(angle).",
    },
  },
];

export default function Trigonometrie2Page() {
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
          <div className="lecon-badge">📏 Maths — 3ème</div>
          <h1 className="lecon-titre">Trigonometrie</h1>
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
            En 3eme, tu maitrises la <strong>trigonometrie</strong> dans le
            triangle rectangle : sinus, cosinus, tangente, valeurs remarquables
            et resolution de problemes.
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
              <div className="lecon-point-titre">📐 SOH CAH TOA</div>
              <div className="lecon-point-texte">
                Sin = Oppose/Hypotenuse. Cos = Adjacent/Hypotenuse. Tan =
                Oppose/Adjacent. Pour trouver un angle : arcsin, arccos, arctan
                (fonctions inverses).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Angle A,
                oppose=3, adjacent=4, hypotenuse=5. sin(A)=3/5, cos(A)=4/5,
                tan(A)=3/4.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔢 Valeurs remarquables</div>
              <div className="lecon-point-texte">
                sin(30)=0,5, cos(30)=0,866, tan(30)=0,577.
                sin(45)=cos(45)=0,707. sin(60)=0,866, cos(60)=0,5,
                tan(60)=1,732. sin(60)=cos(30).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Angle 30 et
                hypotenuse 10 : oppose = 10 x sin(30) = 10 x 0,5 = 5 cm.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🏗️ Applications</div>
              <div className="lecon-point-texte">
                Angle d'elevation : tan(angle) = hauteur/distance. Longueur
                cherchee = longueur connue x ratio trig. Angle cherche =
                arctan/arcsin/arccos du ratio.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Ombre = 12 m,
                angle soleil = 35 degres. Hauteur arbre = 12 x tan(35) = 12 x
                0,7 = 8,4 m.
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
