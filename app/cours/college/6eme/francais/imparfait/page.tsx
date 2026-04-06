"use client";

import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "francais";
const THEME = "imparfait";

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
      "Quelle est la terminaison de l'imparfait à la 1ère personne du singulier ?",
    options: ["-ais", "-ait", "-ions", "-ez"],
    answer: "-ais",
    fiche: {
      regle:
        "Les terminaisons de l'imparfait sont : -ais, -ais, -ait, -ions, -iez, -aient. Elles sont les mêmes pour tous les groupes !",
      exemple:
        "✅ je chantais, tu chantais, il chantait, nous chantions, vous chantiez, ils chantaient",
      piege:
        "L'imparfait a les mêmes terminaisons pour tous les verbes — même être et avoir !",
      astuce:
        "Retiens : -ais/-ais/-ait/-ions/-iez/-aient. Le 'i' est toujours présent !",
    },
  },
  {
    question:
      "Conjugue « chanter » à la 3ème personne du pluriel à l'imparfait.",
    options: [
      "ils chantaient",
      "ils chantait",
      "ils chantions",
      "ils chanteraient",
    ],
    answer: "ils chantaient",
    fiche: {
      regle:
        "À la 3ème personne du pluriel, l'imparfait se termine toujours par -aient.",
      exemple: "✅ ils chantaient, ils finissaient, ils prenaient",
      piege:
        "Ne pas confondre 'ils chantaient' (imparfait) et 'ils chanteraient' (conditionnel) !",
      astuce: "3ème personne du pluriel à l'imparfait = toujours -aient !",
    },
  },
  {
    question:
      "Conjugue « être » à la 2ème personne du singulier à l'imparfait.",
    options: ["tu étais", "tu était", "tu es", "tu seras"],
    answer: "tu étais",
    fiche: {
      regle:
        "Le verbe 'être' à l'imparfait : j'étais, tu étais, il était, nous étions, vous étiez, ils étaient.",
      exemple: "✅ tu étais fatigué / il était grand / nous étions amis",
      piege: "Ne pas confondre 'tu étais' (imparfait) et 'tu es' (présent) !",
      astuce:
        "Être à l'imparfait : ét- + terminaisons -ais/-ais/-ait/-ions/-iez/-aient !",
    },
  },
  {
    question: "Conjugue « avoir » à la 1ère personne du pluriel à l'imparfait.",
    options: ["nous avions", "nous avais", "nous avons", "nous aurions"],
    answer: "nous avions",
    fiche: {
      regle:
        "Le verbe 'avoir' à l'imparfait : j'avais, tu avais, il avait, nous avions, vous aviez, ils avaient.",
      exemple: "✅ nous avions faim / vous aviez tort / ils avaient peur",
      piege:
        "Ne pas confondre 'nous avions' (imparfait) et 'nous avons' (présent) !",
      astuce:
        "Avoir à l'imparfait : av- + terminaisons -ais/-ais/-ait/-ions/-iez/-aient !",
    },
  },
  {
    question: "Quand utilise-t-on l'imparfait ?",
    options: [
      "Pour une action soudaine dans le passé",
      "Pour une habitude ou une action qui dure dans le passé",
      "Pour une action future",
      "Pour donner un ordre",
    ],
    answer: "Pour une habitude ou une action qui dure dans le passé",
    fiche: {
      regle:
        "L'imparfait exprime : 1) une habitude dans le passé, 2) une action qui dure dans le passé, 3) une description dans le passé.",
      exemple:
        "✅ Quand j'étais petit, je jouais au foot. (habitude) / Il pleuvait dehors. (description)",
      piege:
        "Ne pas confondre avec le passé composé qui exprime une action soudaine et terminée !",
      astuce:
        "Imparfait = durée, habitude, description. Passé composé = action ponctuelle !",
    },
  },
  {
    question: "Conjugue « finir » à la 2ème personne du pluriel à l'imparfait.",
    options: [
      "vous finissiez",
      "vous finissez",
      "vous finiriez",
      "vous finissaient",
    ],
    answer: "vous finissiez",
    fiche: {
      regle:
        "Les verbes en -ir du 2ème groupe gardent le -iss- à l'imparfait : je finissais, tu finissais, il finissait, nous finissions, vous finissiez, ils finissaient.",
      exemple: "✅ vous finissiez vos devoirs / ils finissaient tard",
      piege:
        "Ne pas oublier le -iss- pour les verbes du 2ème groupe à l'imparfait !",
      astuce:
        "Finir à l'imparfait : finiss- + terminaisons. Le -iss- reste toujours !",
    },
  },
  {
    question:
      "Conjugue « aller » à la 3ème personne du singulier à l'imparfait.",
    options: ["il allait", "il allez", "il va", "il irait"],
    answer: "il allait",
    fiche: {
      regle:
        "Le verbe 'aller' à l'imparfait : j'allais, tu allais, il allait, nous allions, vous alliez, ils allaient.",
      exemple:
        "✅ il allait à l'école chaque matin / nous allions souvent au parc",
      piege: "Le radical de 'aller' à l'imparfait est 'all-' et non 'vais-' !",
      astuce:
        "Aller à l'imparfait : all- + terminaisons. Ne pas utiliser 'vais' !",
    },
  },
  {
    question: "Quelle phrase est à l'imparfait ?",
    options: [
      "Il a mangé une pomme.",
      "Il mangera demain.",
      "Il mangeait tous les soirs.",
      "Mange ta soupe !",
    ],
    answer: "Il mangeait tous les soirs.",
    fiche: {
      regle:
        "L'imparfait se reconnaît aux terminaisons -ais/-ais/-ait/-ions/-iez/-aient et souvent aux expressions comme 'tous les jours', 'autrefois', 'chaque matin'.",
      exemple: "✅ Il mangeait tous les soirs → imparfait (habitude)",
      piege:
        "'Il a mangé' = passé composé / 'Il mangera' = futur / 'Mange !' = impératif",
      astuce:
        "Les mots 'tous les jours', 'souvent', 'autrefois' = souvent l'imparfait !",
    },
  },
  {
    question:
      "Conjugue « faire » à la 1ère personne du singulier à l'imparfait.",
    options: ["je faisais", "je faisait", "je fais", "je ferais"],
    answer: "je faisais",
    fiche: {
      regle:
        "Le verbe 'faire' à l'imparfait : je faisais, tu faisais, il faisait, nous faisions, vous faisiez, ils faisaient.",
      exemple: "✅ je faisais mes devoirs / nous faisions du sport",
      piege: "Le radical de 'faire' à l'imparfait est 'fais-' et non 'fait-' !",
      astuce:
        "Faire à l'imparfait : fais- + terminaisons. Attention au radical !",
    },
  },
  {
    question:
      "Conjugue « prendre » à la 1ère personne du pluriel à l'imparfait.",
    options: [
      "nous prenions",
      "nous prenais",
      "nous prenons",
      "nous prendions",
    ],
    answer: "nous prenions",
    fiche: {
      regle:
        "Le verbe 'prendre' à l'imparfait : je prenais, tu prenais, il prenait, nous prenions, vous preniez, ils prenaient.",
      exemple: "✅ nous prenions le bus / ils prenaient leur temps",
      piege:
        "Attention : 'nous prenions' (imparfait) et non 'nous prendions' qui n'existe pas !",
      astuce:
        "Prendre à l'imparfait : pren- + terminaisons. Le 'd' disparaît !",
    },
  },
];

export default function ImparfaitPage() {
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
          <div className="lecon-badge">📖 Français — 6ème</div>
          <h1 className="lecon-titre">L'imparfait</h1>
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
            L'<strong>imparfait</strong> est un temps du passé qui exprime une
            habitude, une action qui dure ou une description. Ses terminaisons
            sont les mêmes pour tous les verbes !
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
                📌 Les terminaisons de l'imparfait
              </div>
              <div className="lecon-point-texte">
                Elles sont <strong>identiques pour tous les verbes</strong> :
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">je</span> -ais ·{" "}
                <span className="exemple-label">tu</span> -ais ·{" "}
                <span className="exemple-label">il/elle</span> -ait
                <br />
                <span className="exemple-label">nous</span> -ions ·{" "}
                <span className="exemple-label">vous</span> -iez ·{" "}
                <span className="exemple-label">ils/elles</span> -aient
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                📌 Quand utiliser l'imparfait ?
              </div>
              <div className="lecon-point-texte">L'imparfait exprime :</div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Habitude :</span> Je jouais au
                foot chaque soir.
                <br />
                <span className="exemple-label">Durée :</span> Il pleuvait
                depuis des heures.
                <br />
                <span className="exemple-label">Description :</span> La maison
                était grande et belle.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">⚠️ Verbes irréguliers</div>
              <div className="lecon-point-texte">
                Le radical change mais les terminaisons restent !
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Être :</span> j'étais, tu étais,
                il était...
                <br />
                <span className="exemple-label">Avoir :</span> j'avais, tu
                avais, il avait...
                <br />
                <span className="exemple-label">Faire :</span> je faisais, tu
                faisais, il faisait...
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
