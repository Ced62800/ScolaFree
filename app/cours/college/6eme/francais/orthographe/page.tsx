"use client";

import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "francais";
const THEME = "orthographe";

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
    question: "Complète : « Il range ___ affaires. »",
    options: ["ces", "ses", "c'est", "s'est"],
    answer: "ses",
    fiche: {
      regle:
        "'ses' est un déterminant possessif (= les siennes). 'ces' est un déterminant démonstratif (= ceux-là).",
      exemple:
        "✅ Il range ses affaires (les siennes) / Ces affaires sont rangées (celles-là)",
      piege:
        "Pour distinguer 'ses' et 'ces', remplace par 'les siennes' → ses / par 'ceux-là' → ces !",
      astuce: "Ses = les siens/siennes. Ces = ceux-là/celles-là.",
    },
  },
  {
    question: "Complète : « Les enfants ___ fatigués. »",
    options: ["son", "sont", "ses", "ces"],
    answer: "sont",
    fiche: {
      regle:
        "'sont' est le verbe être (3ème pers. pluriel). 'son' est un déterminant possessif (= le sien).",
      exemple:
        "✅ Les enfants sont fatigués (verbe être) / Son cartable est là (le sien)",
      piege:
        "Pour distinguer 'sont' et 'son', remplace par 'étaient' → sont / par 'le sien' → son !",
      astuce: "Si tu peux remplacer par 'étaient' → sont. Sinon → son.",
    },
  },
  {
    question: "Complète : « Il ___ à l'école demain. » (aller)",
    options: ["va", "a", "à", "ah"],
    answer: "va",
    fiche: {
      regle:
        "'va' est le verbe aller (3ème pers. sing.). 'a' est le verbe avoir. 'à' est une préposition.",
      exemple:
        "✅ Il va à l'école (aller) / Il a un livre (avoir) / Il parle à Paul (préposition)",
      piege:
        "Ne pas confondre 'va' (aller), 'a' (avoir) et 'à' (préposition) !",
      astuce:
        "Va → remplace par 'allait'. A → remplace par 'avait'. À → préposition invariable.",
    },
  },
  {
    question: "Complète : « ___ un beau château ! »",
    options: ["C'est", "Sait", "S'est", "Ces"],
    answer: "C'est",
    fiche: {
      regle:
        "'C'est' = ce + est (verbe être). On peut le remplacer par 'cela est'.",
      exemple:
        "✅ C'est beau ! = Cela est beau ! / Ce sont de beaux châteaux !",
      piege: "Ne pas confondre 'c'est' (cela est) et 'sait' (verbe savoir) !",
      astuce: "Si tu peux dire 'cela est' → c'est. Sinon cherche autre chose.",
    },
  },
  {
    question: "Complète : « La ville ___ je vis est belle. »",
    options: ["ou", "où", "ont", "on"],
    answer: "où",
    fiche: {
      regle:
        "'où' indique un lieu ou un temps. 'ou' exprime un choix (= ou bien).",
      exemple:
        "✅ La ville où je vis (lieu) / Tu viens ou tu restes ? (choix = ou bien)",
      piege:
        "Pour distinguer 'où' et 'ou', remplace 'ou' par 'ou bien'. Si ça marche → ou. Sinon → où !",
      astuce: "Remplace par 'ou bien' : si ça marche → ou. Sinon → où.",
    },
  },
  {
    question: "Complète : « ___ mange une pomme. »",
    options: ["On", "Ont", "On't", "Ons"],
    answer: "On",
    fiche: {
      regle:
        "'On' est un pronom indéfini (= quelqu'un). 'Ont' est le verbe avoir (3ème pers. plur.).",
      exemple:
        "✅ On mange une pomme (quelqu'un) / Ils ont mangé (verbe avoir)",
      piege:
        "Pour distinguer 'on' et 'ont', remplace par 'il' → on / par 'avaient' → ont !",
      astuce:
        "Si tu peux remplacer par 'il' → on. Si tu peux remplacer par 'avaient' → ont.",
    },
  },
  {
    question: "Quel est le bon homophone dans : « Je ___ lever tôt demain. » ?",
    options: ["doit", "doigt", "dois", "d'oit"],
    answer: "dois",
    fiche: {
      regle:
        "'dois' = verbe devoir (1ère pers. sing.). 'doit' = verbe devoir (3ème pers. sing.). 'doigt' = partie de la main.",
      exemple:
        "✅ Je dois (1ère pers.) / Il doit (3ème pers.) / le doigt (partie du corps)",
      piege: "Attention au contexte : 'je' → dois / 'il, elle' → doit !",
      astuce:
        "Regarde le sujet : je/tu → dois. Il/elle → doit. Jamais 'doigt' qui est un nom !",
    },
  },
  {
    question: "Complète : « Il ___ parti hier. »",
    options: ["est", "et", "ai", "es"],
    answer: "est",
    fiche: {
      regle:
        "'est' = verbe être (3ème pers. sing.). 'et' est une conjonction de coordination (= ainsi que).",
      exemple:
        "✅ Il est parti (verbe être) / Paul et Marie (conjonction = ainsi que)",
      piege:
        "Pour distinguer 'est' et 'et', remplace par 'était' → est / par 'ainsi que' → et !",
      astuce:
        "Si tu peux remplacer par 'était' → est. Si tu peux remplacer par 'ainsi que' → et.",
    },
  },
  {
    question: "Complète : « Prends ___ manteau, il fait froid. »",
    options: ["ton", "ton", "tond", "t'on"],
    answer: "ton",
    fiche: {
      regle:
        "'ton' est un déterminant possessif (= le tien). Il s'utilise devant un nom masculin singulier.",
      exemple:
        "✅ ton manteau (le tien) / ta veste (fém.) / tes chaussures (plur.)",
      piege:
        "Devant un nom féminin commençant par une voyelle, on utilise aussi 'ton' : ton amie !",
      astuce:
        "Ton = le tien (masc. sing. ou fém. sing. commençant par voyelle). Ta = fém. sing.",
    },
  },
  {
    question: "Complète : « ___ belles fleurs dans le jardin ! »",
    options: ["Quelles", "Qu'elle", "Quel", "Quelle"],
    answer: "Quelles",
    fiche: {
      regle:
        "'Quelles' est un déterminant exclamatif ou interrogatif féminin pluriel. Il s'accorde avec le nom.",
      exemple:
        "✅ Quelles belles fleurs ! (fém. plur.) / Quel beau jardin ! (masc. sing.)",
      piege: "Accorde 'quel/quelle/quels/quelles' avec le nom qui suit !",
      astuce:
        "Quel → masc. sing. / Quelle → fém. sing. / Quels → masc. plur. / Quelles → fém. plur.",
    },
  },
];

export default function OrthographePage() {
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
          <div className="lecon-badge">📖 Français — 6ème</div>
          <h1 className="lecon-titre">L'orthographe</h1>
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
            L'orthographe en 6ème, c'est maîtriser les{" "}
            <strong>homophones</strong> — des mots qui se prononcent pareil mais
            s'écrivent différemment et ont des sens différents !
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
              <div className="lecon-point-titre">🔤 ses / ces</div>
              <div className="lecon-point-texte">
                <strong>ses</strong> = les siens/siennes · <strong>ces</strong>{" "}
                = ceux-là/celles-là
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">ses :</span> Il range ses
                affaires (les siennes)
                <br />
                <span className="exemple-label">ces :</span> Ces livres sont
                beaux (ceux-là)
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔤 son / sont</div>
              <div className="lecon-point-texte">
                <strong>son</strong> = le sien · <strong>sont</strong> = verbe
                être (remplace par étaient)
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">son :</span> son livre (le sien)
                <br />
                <span className="exemple-label">sont :</span> Ils sont partis
                (étaient)
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🔤 ou / où · est / et · on / ont
              </div>
              <div className="lecon-point-texte">
                Des astuces pour ne plus les confondre !
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">ou/où :</span> ou = ou bien / où
                = lieu
                <br />
                <span className="exemple-label">est/et :</span> est = était / et
                = ainsi que
                <br />
                <span className="exemple-label">on/ont :</span> on = il / ont =
                avaient
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
