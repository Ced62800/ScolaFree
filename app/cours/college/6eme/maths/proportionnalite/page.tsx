"use client";

import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
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
    question: "Si 3 stylos coûtent 6 euros, combien coûtent 9 stylos ?",
    options: ["12 euros", "15 euros", "18 euros", "21 euros"],
    answer: "18 euros",
    fiche: {
      regle:
        "Dans un tableau de proportionnalité, on multiplie ou divise par le même nombre. Ici on multiplie par 3 : 3 stylos x3 = 9 stylos, donc 6 euros x3 = 18 euros.",
      exemple: "✅ 3 stylos → 6 euros. 9 stylos = 3 x 3 donc 6 x 3 = 18 euros.",
      piege:
        "Ne pas additionner ! Ce n'est pas 6 + 6 + 6. On cherche le coefficient multiplicateur.",
      astuce:
        "Trouve combien de fois tu multiplies la quantité, puis multiplie le prix par le meme nombre !",
    },
  },
  {
    question:
      "Un robinet remplit 4 litres en 2 minutes. Combien de litres en 10 minutes ?",
    options: ["16 litres", "20 litres", "24 litres", "12 litres"],
    answer: "20 litres",
    fiche: {
      regle:
        "La quantite d'eau est proportionnelle au temps. On trouve le débit : 4 litres en 2 min = 2 litres par minute. En 10 minutes : 2 x 10 = 20 litres.",
      exemple:
        "✅ 4 litres en 2 min → 2 litres/min. En 10 min : 2 x 10 = 20 litres.",
      piege:
        "Attention : 10 minutes n'est pas 5 fois 2 minutes ! 10 divise par 2 = 5, donc 4 x 5 = 20.",
      astuce:
        "Trouve la valeur unitaire (par 1) puis multiplie. 4/2 = 2 litres/min, puis 2 x 10 = 20.",
    },
  },
  {
    question:
      "Dans un tableau de proportionnalité, si x = 5 correspond à y = 15, quelle est la valeur de y quand x = 8 ?",
    options: ["20", "24", "18", "40"],
    answer: "24",
    fiche: {
      regle:
        "Le coefficient de proportionnalité k = y divise par x = 15 divise par 5 = 3. Pour x = 8 : y = 8 x 3 = 24.",
      exemple: "✅ k = 15/5 = 3. Pour x = 8 : y = 8 x 3 = 24.",
      piege:
        "Ne pas additionner les différences ! La relation est y = k x x, pas y = x + quelque chose.",
      astuce:
        "Trouve k = y/x = 15/5 = 3. Ensuite pour tout x, y = k x x. Ici 8 x 3 = 24.",
    },
  },
  {
    question:
      "Une voiture parcourt 120 km en 2 heures. Quelle distance en 5 heures ?",
    options: ["240 km", "300 km", "360 km", "180 km"],
    answer: "300 km",
    fiche: {
      regle:
        "Distance et temps sont proportionnels. Vitesse = 120 divise par 2 = 60 km/h. En 5 heures : 60 x 5 = 300 km.",
      exemple: "✅ 120 km en 2h → 60 km/h. En 5h : 60 x 5 = 300 km.",
      piege:
        "5 heures n'est pas 2,5 fois 2 heures, c'est bien 5/2 = 2,5. Donc 120 x 2,5 = 300.",
      astuce:
        "Vitesse = distance/temps = 120/2 = 60 km/h. Puis distance = vitesse x temps = 60 x 5 = 300 km.",
    },
  },
  {
    question:
      "Ce tableau est-il un tableau de proportionnalité ? x : 2, 4, 6 / y : 6, 12, 18",
    options: ["Oui, k = 3", "Oui, k = 2", "Non", "Impossible à dire"],
    answer: "Oui, k = 3",
    fiche: {
      regle:
        "Un tableau est proportionnel si le rapport y/x est constant pour toutes les colonnes.",
      exemple:
        "✅ 6/2 = 3 et 12/4 = 3 et 18/6 = 3. Le rapport est toujours 3 donc c'est bien proportionnel avec k = 3.",
      piege: "Vérifier TOUTES les colonnes, pas seulement la première !",
      astuce:
        "Calcule y/x pour chaque colonne. Si c'est toujours le meme nombre, c'est proportionnel !",
    },
  },
  {
    question: "Si 5 kg de pommes coûtent 8 euros, combien coûtent 15 kg ?",
    options: ["20 euros", "24 euros", "16 euros", "30 euros"],
    answer: "24 euros",
    fiche: {
      regle:
        "15 kg = 3 x 5 kg, donc le prix = 3 x 8 = 24 euros. Ou : prix au kg = 8/5 = 1,6 euro/kg. 15 x 1,6 = 24 euros.",
      exemple: "✅ 5 kg → 8 euros. 15 kg = 3 x 5 donc 8 x 3 = 24 euros.",
      piege:
        "Ne pas faire 8 + 15 ou 8 x 15. On multiplie le prix par le coefficient (3 ici).",
      astuce:
        "15 = 3 x 5 donc multiplie le prix par 3 : 8 x 3 = 24 euros. Simple !",
    },
  },
  {
    question:
      "Un élève lit 20 pages en 30 minutes. Combien de pages en 1 heure et demie ?",
    options: ["40 pages", "50 pages", "60 pages", "45 pages"],
    answer: "60 pages",
    fiche: {
      regle:
        "1h30 = 90 minutes. 90/30 = 3. Donc il lit 3 fois plus : 20 x 3 = 60 pages.",
      exemple:
        "✅ 20 pages en 30 min. 90 min = 3 x 30 min donc 20 x 3 = 60 pages.",
      piege:
        "1h30 = 90 minutes et non 130 minutes. Convertis bien les heures en minutes !",
      astuce:
        "Convertis tout en minutes. 1h30 = 90 min. 90/30 = 3 fois plus. 20 x 3 = 60 pages.",
    },
  },
  {
    question:
      "Le prix de 6 places de cinéma est 54 euros. Quel est le prix de 4 places ?",
    options: ["32 euros", "36 euros", "40 euros", "42 euros"],
    answer: "36 euros",
    fiche: {
      regle:
        "Prix d'une place = 54 divise par 6 = 9 euros. Prix de 4 places = 4 x 9 = 36 euros.",
      exemple:
        "✅ 6 places → 54 euros. 1 place = 54/6 = 9 euros. 4 places = 4 x 9 = 36 euros.",
      piege:
        "Ne pas faire 54 divise par 6 x 4 sans ordre ! Calcule d'abord le prix unitaire.",
      astuce:
        "Toujours trouver la valeur pour 1 d'abord : 54/6 = 9 euros/place. Puis 4 x 9 = 36 euros.",
    },
  },
  {
    question:
      "Dans une recette pour 4 personnes, on utilise 300g de farine. Combien pour 10 personnes ?",
    options: ["600g", "700g", "750g", "800g"],
    answer: "750g",
    fiche: {
      regle:
        "Pour 1 personne : 300 divise par 4 = 75g. Pour 10 personnes : 75 x 10 = 750g.",
      exemple:
        "✅ 4 personnes → 300g. 1 personne = 300/4 = 75g. 10 personnes = 75 x 10 = 750g.",
      piege:
        "Ne pas faire 300 x 10 ! Il faut d'abord diviser par 4 (pour 1 personne) puis multiplier par 10.",
      astuce:
        "Valeur unitaire = 300/4 = 75g par personne. Puis 75 x 10 = 750g. Divise puis multiplie !",
    },
  },
  {
    question:
      "Si y est proportionnel à x avec k = 4, quelle est la valeur de x quand y = 28 ?",
    options: ["6", "7", "8", "112"],
    answer: "7",
    fiche: {
      regle: "y = k x x donc x = y divise par k. Ici x = 28 divise par 4 = 7.",
      exemple:
        "✅ y = 4 x x. Si y = 28 : x = 28/4 = 7. Vérification : 4 x 7 = 28.",
      piege:
        "Ne pas multiplier ! x = y/k et non x = y x k. Ici 28 x 4 = 112 est FAUX.",
      astuce:
        "y = k x x donc x = y/k. Divise y par k pour trouver x. 28/4 = 7.",
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
  const boutonBloque = !estCorrecte && est6emeFaute && !ficheObligatoireLue;

  if (etape === "intro") {
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">🔢 Maths — 6ème</div>
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
            Deux grandeurs sont <strong>proportionnelles</strong> quand leur
            rapport est constant. On utilise un tableau ou la règle de trois
            pour résoudre les problèmes.
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
                📊 Le coefficient de proportionnalité
              </div>
              <div className="lecon-point-texte">
                k = y divise par x. Pour trouver y : y = k x x. Pour trouver x :
                x = y divise par k.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 3 stylos = 6
                euros → k = 6/3 = 2. Pour 9 stylos : 9 x 2 = 18 euros.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔢 La valeur unitaire</div>
              <div className="lecon-point-texte">
                Pour résoudre : trouve d'abord la valeur pour 1, puis multiplie
                par la quantité voulue.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 6 places = 54
                euros → 1 place = 54/6 = 9 euros → 4 places = 4 x 9 = 36 euros.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ✅ Vérifier la proportionnalité
              </div>
              <div className="lecon-point-texte">
                Un tableau est proportionnel si le rapport y/x est identique
                pour toutes les colonnes.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> x: 2, 4, 6 et
                y: 6, 12, 18 → 6/2 = 12/4 = 18/6 = 3, c'est proportionnel !
              </div>
            </div>
          </div>
          <button className="lecon-btn" onClick={demarrer}>
            🚀 Commencer les exercices →
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
              let className = "qcm-option";
              if (reponseChoisie) {
                if (option === q.answer) className += " correct";
                else if (option === reponseChoisie) className += " incorrect";
                else className += " disabled";
              }
              return (
                <button
                  key={option}
                  className={className}
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
                      Tu dois relire la fiche avant de continuer. Elle est là
                      pour t'aider ! 💪
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
