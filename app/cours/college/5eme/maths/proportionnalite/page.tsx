"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "maths";
const THEME = "proportionnalite";

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
    question: "Un tableau est-il proportionnel ? x : 2, 4, 6 | y : 6, 12, 18",
    options: [
      "Oui, car les rapports y/x sont égaux",
      "Non, les rapports sont différents",
      "Oui, car y = x + 4",
      "Non, car y > x",
    ],
    answer: "Oui, car les rapports y/x sont égaux",
    fiche: {
      regle:
        "Un tableau est proportionnel si tous les rapports y/x sont égaux (même coefficient de proportionnalité).",
      exemple:
        "✅ 6/2=3, 12/4=3, 18/6=3. Tous égaux à 3 → proportionnel. Coefficient k=3.",
      piege: "Il faut vérifier TOUS les rapports, pas seulement le premier.",
      astuce:
        "Vérifie que y/x = même valeur partout. Si oui → proportionnel. Ce nombre = coefficient k.",
    },
  },
  {
    question:
      "Dans un tableau proportionnel, x=5 donne y=15. Quel est le coefficient de proportionnalité ?",
    options: ["5", "3", "10", "75"],
    answer: "3",
    fiche: {
      regle:
        "Le coefficient de proportionnalité k = y/x. Ici k = 15/5 = 3. Donc y = 3x.",
      exemple:
        "✅ k = y/x = 15/5 = 3. Pour x=8 : y = 3×8 = 24. Pour x=2 : y = 3×2 = 6.",
      piege: "k = y÷x (pas x÷y). k = 15÷5 = 3, pas 5÷15 = 1/3.",
      astuce:
        "k = y ÷ x. Puis y = k × x pour trouver d'autres valeurs. Simple !",
    },
  },
  {
    question: "4 stylos coûtent 6 €. Combien coûtent 10 stylos ?",
    options: ["12 €", "15 €", "24 €", "60 €"],
    answer: "15 €",
    fiche: {
      regle:
        "Règle de trois : si 4 → 6, alors 10 → ? Coefficient k = 6/4 = 1,5. 10 × 1,5 = 15 €.",
      exemple:
        "✅ k = 6/4 = 1,5 €/stylo. 10 stylos × 1,5 = 15 €. Ou : 10 × 6 ÷ 4 = 60÷4 = 15 €.",
      piege:
        "Ne pas faire 4+6=10 puis 6+6=12. C'est une proportionnalité, pas une addition.",
      astuce:
        "Règle de 3 : (valeur cherchée × valeur connue Y) ÷ valeur connue X. 10×6÷4 = 15 €.",
    },
  },
  {
    question: "Calculez 15% de 200.",
    options: ["15", "20", "30", "300"],
    answer: "30",
    fiche: {
      regle:
        "Pourcentage : p% de N = (p × N) ÷ 100. Ou : convertir en décimal et multiplier. 15% = 0,15.",
      exemple:
        "✅ 15% de 200 = (15 × 200) ÷ 100 = 3000 ÷ 100 = 30. Ou : 0,15 × 200 = 30.",
      piege: "15% de 200 ≠ 15 (ce serait 15% de 100). Ni 200×15=3000.",
      astuce:
        "p% de N = p×N÷100. Ou p%→décimal : 15%=0,15, puis 0,15×200=30. Deux méthodes !",
    },
  },
  {
    question:
      "Un article coûte 80 €. Il est soldé à -25%. Quel est le nouveau prix ?",
    options: ["55 €", "60 €", "75 €", "20 €"],
    answer: "60 €",
    fiche: {
      regle:
        "Réduction de 25% : nouveau prix = ancien prix × (1 - 0,25) = ancien prix × 0,75.",
      exemple:
        "✅ 80 × 0,75 = 60 €. Ou : réduction = 25% de 80 = 20 €. Nouveau prix = 80 - 20 = 60 €.",
      piege:
        "Solde de 25% ≠ payer 25% du prix. On enlève 25%, il reste 75% du prix original.",
      astuce:
        "-25% → multiplier par 0,75 (=1-0,25). +10% → multiplier par 1,10. Simple avec les décimaux !",
    },
  },
  {
    question:
      "Sur une carte à l'échelle 1/50 000, une distance mesure 4 cm. Quelle est la distance réelle ?",
    options: ["4 km", "2 km", "200 m", "50 km"],
    answer: "2 km",
    fiche: {
      regle:
        "Échelle 1/50 000 : 1 cm sur la carte = 50 000 cm en réalité. Distance réelle = mesure × dénominateur de l'échelle.",
      exemple: "✅ 4 cm × 50 000 = 200 000 cm = 2 000 m = 2 km.",
      piege:
        "Ne pas oublier de convertir les unités : 200 000 cm = 2 000 m = 2 km.",
      astuce:
        "Échelle 1/n : carte × n = réalité. 4 cm × 50 000 = 200 000 cm. Convertis : ÷100 pour m, ÷1000 pour km.",
    },
  },
  {
    question:
      "Une voiture parcourt 300 km en 3h. Quelle est sa vitesse moyenne ?",
    options: ["900 km/h", "100 km/h", "303 km/h", "297 km/h"],
    answer: "100 km/h",
    fiche: {
      regle:
        "Vitesse = Distance ÷ Temps. V = D/T. C'est une relation de proportionnalité.",
      exemple:
        "✅ V = 300 km ÷ 3h = 100 km/h. En 1h, la voiture parcourt 100 km.",
      piege: "Vitesse = D÷T (pas T÷D ni D×T). Les unités : km÷h = km/h.",
      astuce:
        "V=D/T, D=V×T, T=D/V. Triangle des 3 : D en haut, V et T en bas. Couvre ce que tu cherches !",
    },
  },
  {
    question: "x et y sont proportionnels. x=3 → y=12. Que vaut y quand x=7 ?",
    options: ["21", "28", "16", "84"],
    answer: "28",
    fiche: {
      regle: "k = y/x = 12/3 = 4. Donc y = 4x. Pour x=7 : y = 4×7 = 28.",
      exemple: "✅ k=12/3=4. x=7 → y=4×7=28. Vérifie : 28/7=4 ✓.",
      piege:
        "Ne pas faire 12+3=15 puis 15+3=18... Ce n'est pas une addition mais une multiplication !",
      astuce: "Trouve k d'abord : k=y/x=12/3=4. Puis applique : y=k×x=4×7=28.",
    },
  },
  {
    question:
      "Un prix augmente de 20%. Il était à 50 €. Quel est le nouveau prix ?",
    options: ["70 €", "60 €", "40 €", "10 €"],
    answer: "60 €",
    fiche: {
      regle:
        "Augmentation de 20% : nouveau prix = ancien × (1 + 0,20) = ancien × 1,20.",
      exemple:
        "✅ 50 × 1,20 = 60 €. Ou : augmentation = 20% de 50 = 10 €. Nouveau prix = 50+10 = 60 €.",
      piege:
        "+20% ≠ ajouter 20. Il faut calculer 20% de 50 = 10, puis 50+10=60.",
      astuce:
        "+20% → ×1,20. -30% → ×0,70. Le coefficient multiplicateur = 1 ± (taux/100).",
    },
  },
  {
    question:
      "3 ouvriers font un travail en 12 jours. Combien de jours pour 4 ouvriers ?",
    options: ["16 jours", "9 jours", "48 jours", "4 jours"],
    answer: "9 jours",
    fiche: {
      regle:
        "C'est une proportionnalité INVERSE : plus d'ouvriers → moins de jours. 3×12 = 4×x → x = 36/4 = 9.",
      exemple:
        "✅ Travail total = 3×12=36 jours-ouvriers. 4 ouvriers : 36÷4=9 jours.",
      piege:
        "Ce n'est PAS une proportionnalité directe ! Plus d'ouvriers = MOINS de jours (inverse).",
      astuce:
        "Proportionnalité inverse : produit constant. 3×12=4×? → ?=36/4=9. Le produit reste égal à 36.",
    },
  },
];

export default function ProportionnalitePage() {
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
          <div className="lecon-badge">🔢 Maths — 5ème</div>
          <h1 className="lecon-titre">La proportionnalité</h1>
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
            La <strong>proportionnalité</strong> est partout : prix, vitesse,
            échelles, pourcentages. Maîtrise ces outils essentiels du quotidien
            !
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
              <div className="lecon-point-titre">
                📊 Tableaux de proportionnalité
              </div>
              <div className="lecon-point-texte">
                y/x = k (coefficient de proportionnalité). y = k × x. Tous les
                rapports y/x sont égaux.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> x:2,4,6 |
                y:6,12,18 → k=3 (y=3x)
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">% Les pourcentages</div>
              <div className="lecon-point-texte">
                p% de N = p×N÷100. Augmentation : ×(1+p/100). Réduction :
                ×(1-p/100).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 15% de 200 = 30
                | -25% de 80 = 80×0,75 = 60 €
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🗺️ Échelles et vitesses</div>
              <div className="lecon-point-texte">
                Échelle 1/n : réalité = carte × n. Vitesse = Distance ÷ Temps.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 4 cm à 1/50000
                = 2 km. V = 300 km ÷ 3h = 100 km/h.
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
                📖 Mode découverte. Inscris-toi pour les 10 questions !
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
