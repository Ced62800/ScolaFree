"use client";

import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "maths";
const THEME = "statistiques";

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
    question: "Quelle est la moyenne de ces notes : 12, 15, 8, 14, 11 ?",
    options: ["11", "12", "13", "10"],
    answer: "12",
    fiche: {
      regle:
        "Moyenne = somme de toutes les valeurs divisée par le nombre de valeurs.",
      exemple: "✅ (12+15+8+14+11) / 5 = 60 / 5 = 12",
      piege:
        "Ne pas oublier de diviser par le nombre de valeurs ! Ici on divise par 5 et non par autre chose.",
      astuce:
        "Moyenne = total / nombre. Additionne tout puis divise par combien il y a de valeurs. 60/5 = 12 !",
    },
  },
  {
    question:
      "Dans une classe, les températures relevées sont : 18, 20, 17, 22, 18 degrés. Quelle est l'étendue ?",
    options: ["3", "4", "5", "22"],
    answer: "5",
    fiche: {
      regle:
        "Etendue = valeur maximale - valeur minimale. L'étendue mesure l'ecart entre la plus grande et la plus petite valeur.",
      exemple: "✅ max = 22, min = 17. Etendue = 22 - 17 = 5",
      piege:
        "L'étendue n'est pas la moyenne ! C'est juste max - min. Ici 22 - 17 = 5.",
      astuce:
        "Etendue = max - min. Trouve le plus grand et le plus petit, puis soustrait. 22 - 17 = 5 !",
    },
  },
  {
    question:
      "Voici des notes : 10, 12, 15, 12, 8, 15, 12. Quel est le mode (valeur la plus fréquente) ?",
    options: ["10", "12", "15", "8"],
    answer: "12",
    fiche: {
      regle:
        "Le mode est la valeur qui apparait le plus souvent dans une série de données.",
      exemple:
        "✅ 10 apparait 1 fois, 12 apparait 3 fois, 15 apparait 2 fois, 8 apparait 1 fois. Mode = 12.",
      piege:
        "Le mode n'est pas la valeur du milieu (médiane) ni la moyenne. C'est la valeur la PLUS fréquente.",
      astuce:
        "Compte combien de fois chaque valeur apparait. La plus fréquente = le mode. Ici 12 apparait 3 fois !",
    },
  },
  {
    question:
      "5 élèves ont ces tailles en cm : 155, 160, 162, 158, 165. Quelle est leur taille moyenne ?",
    options: ["158 cm", "160 cm", "162 cm", "165 cm"],
    answer: "160 cm",
    fiche: {
      regle: "Moyenne = somme / nombre de valeurs = (155+160+162+158+165) / 5.",
      exemple: "✅ 155+160+162+158+165 = 800. Moyenne = 800 / 5 = 160 cm.",
      piege:
        "Bien additionner TOUTES les valeurs avant de diviser. 155+160+162+158+165 = 800.",
      astuce:
        "Additionne : 155+165=320, 160+160=320, +162 = 802... Attends, calcule methodiquement : 800/5 = 160 cm !",
    },
  },
  {
    question:
      "Un diagramme en barres montre les sports préférés de 30 élèves : foot 12, basket 8, natation 10. Combien d'élèves préfèrent le foot ou la natation ?",
    options: ["18", "20", "22", "30"],
    answer: "22",
    fiche: {
      regle:
        "Pour compter les élèves preferant l'un ou l'autre sport, on additionne les deux fréquences : 12 + 10 = 22.",
      exemple:
        "✅ Foot : 12 élèves. Natation : 10 élèves. Total = 12 + 10 = 22 élèves.",
      piege:
        "Ne pas inclure le basket ! La question dit foot OU natation, pas les trois sports.",
      astuce:
        "Lis bien la question. Foot OU natation = 12 + 10 = 22. Pas besoin d'inclure le basket !",
    },
  },
  {
    question:
      "La moyenne de 4 nombres est 15. Si on ajoute un 5ème nombre qui vaut 20, quelle est la nouvelle moyenne ?",
    options: ["15", "16", "17", "18"],
    answer: "16",
    fiche: {
      regle:
        "Somme des 4 premiers = 4 x 15 = 60. Avec le 5ème : 60 + 20 = 80. Nouvelle moyenne = 80 / 5 = 16.",
      exemple: "✅ 4 x 15 = 60. 60 + 20 = 80. 80 / 5 = 16.",
      piege:
        "Ne pas faire (15+20)/2 = 17,5 ! Il faut retrouver la somme initiale puis recalculer la moyenne.",
      astuce:
        "Somme = moyenne x nombre. 4 x 15 = 60. Puis ajoute le nouveau : 60+20=80. Divise : 80/5 = 16 !",
    },
  },
  {
    question:
      "Dans une série ordonnée : 8, 10, 12, 15, 20. Quelle est la médiane ?",
    options: ["10", "12", "13", "15"],
    answer: "12",
    fiche: {
      regle:
        "La médiane est la valeur du milieu d'une série ordonnée. Avec 5 valeurs, la médiane est la 3ème valeur.",
      exemple:
        "✅ 8, 10, 12, 15, 20 → la valeur du milieu (3ème sur 5) est 12.",
      piege:
        "La médiane n'est pas la moyenne ! C'est la valeur centrale quand les données sont classées dans l'ordre.",
      astuce:
        "Pour trouver la médiane : range dans l'ordre et prends la valeur du milieu. 5 valeurs → 3ème valeur = 12 !",
    },
  },
  {
    question:
      "Un sac contient 3 billes rouges et 7 billes bleues. On tire une bille au hasard. Quelle est la probabilité d'obtenir une bille rouge ?",
    options: ["3/7", "7/10", "3/10", "1/3"],
    answer: "3/10",
    fiche: {
      regle:
        "Probabilité = nombre de cas favorables / nombre de cas possibles. Total = 3+7 = 10 billes.",
      exemple:
        "✅ Cas favorables (rouge) = 3. Cas possibles (total) = 10. P(rouge) = 3/10.",
      piege:
        "Ne pas mettre 3/7 ! Le dénominateur est le nombre TOTAL de billes = 10, pas uniquement les bleues.",
      astuce:
        "Probabilité = ce qu'on veut / total. Rouge = 3, total = 10 billes. P = 3/10 !",
    },
  },
  {
    question:
      "Notes d'un élève : 14, 18, 10, 16, 12. Quelle note manque-t-il pour avoir une moyenne de 14 ?",
    options: ["14", "15", "16", "12"],
    answer: "14",
    fiche: {
      regle:
        "Pour avoir une moyenne de 14 avec 6 notes : somme totale = 14 x 6 = 84. Somme actuelle = 14+18+10+16+12 = 70. Note manquante = 84 - 70 = 14.",
      exemple: "✅ 14 x 6 = 84. 14+18+10+16+12 = 70. Note = 84 - 70 = 14.",
      piege:
        "Ne pas faire 14 - moyenne actuelle. Il faut calculer la somme visée puis soustraire la somme actuelle.",
      astuce:
        "Somme visee = moyenne x nombre de notes = 14 x 6 = 84. Somme actuelle = 70. Note = 84 - 70 = 14 !",
    },
  },
  {
    question:
      "Une série de données a pour étendue 12 et valeur minimale 5. Quelle est la valeur maximale ?",
    options: ["7", "12", "17", "60"],
    answer: "17",
    fiche: {
      regle: "Etendue = max - min donc max = etendue + min = 12 + 5 = 17.",
      exemple:
        "✅ max = etendue + min = 12 + 5 = 17. Vérification : 17 - 5 = 12.",
      piege:
        "Ne pas faire etendue x min ou etendue - min ! max = etendue + min.",
      astuce:
        "Etendue = max - min donc max = min + etendue = 5 + 12 = 17. Toujours vérifier : 17 - 5 = 12 !",
    },
  },
];

export default function StatistiquesPage() {
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
          <h1 className="lecon-titre">Les statistiques</h1>
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
            Les <strong>statistiques</strong> permettent d'analyser des données
            : calculer une moyenne, trouver la valeur la plus fréquente,
            représenter des informations sur un graphique.
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
              <div className="lecon-point-titre">📊 La moyenne</div>
              <div className="lecon-point-texte">
                Moyenne = somme de toutes les valeurs divise par le nombre de
                valeurs.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Notes 12, 15,
                8, 14, 11 → (12+15+8+14+11)/5 = 60/5 = 12
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📈 Mode et médiane</div>
              <div className="lecon-point-texte">
                Mode = valeur la plus fréquente. Médiane = valeur du milieu
                d'une série ordonnée.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 8, 10, 12, 15,
                20 → médiane = 12 (valeur centrale)
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📉 L'étendue</div>
              <div className="lecon-point-texte">
                Etendue = valeur maximale - valeur minimale. Mesure la
                dispersion des données.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Températures
                17, 18, 20, 22 → étendue = 22 - 17 = 5
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
