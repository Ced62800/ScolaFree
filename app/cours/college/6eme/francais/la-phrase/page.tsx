"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "francais";
const THEME = "la-phrase";

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
  };
};

const questionsBase: Question[] = [
  {
    question: "Laquelle de ces phrases est correctement écrite ?",
    options: [
      "le chat dort sur le canapé.",
      "Le chat dort sur le canapé.",
      "Le chat dort sur le canapé",
      "le chat dort sur le canapé",
    ],
    answer: "Le chat dort sur le canapé.",
    fiche: {
      regle:
        "Une phrase commence toujours par une majuscule et se termine par un signe de ponctuation (. ! ? …).",
      exemple: "✅ Le chat dort. ❌ le chat dort",
      piege:
        "Oublier la majuscule au début ou le point à la fin sont les erreurs les plus fréquentes.",
      astuce:
        "Retiens : Majuscule au début, point à la fin — comme une route qui a un départ et une arrivée !",
    },
  },
  {
    question: "Quelle est la nature de cette phrase : « Ferme la porte ! »",
    options: ["Déclarative", "Interrogative", "Exclamative", "Impérative"],
    answer: "Impérative",
    fiche: {
      regle:
        "La phrase impérative exprime un ordre, un conseil ou une demande. Elle se termine souvent par un point d'exclamation et n'a pas de sujet exprimé.",
      exemple: "✅ Ferme la porte ! ✅ Mangez vos légumes. ✅ Sois sage !",
      piege:
        "Ne pas confondre exclamative (exprime un sentiment) et impérative (exprime un ordre).",
      astuce:
        "Impérative = ordre ou conseil. Si tu peux remplacer par 'Tu dois...', c'est une phrase impérative !",
    },
  },
  {
    question:
      "Quelle est la nature de cette phrase : « Est-ce que tu aimes la lecture ? »",
    options: ["Déclarative", "Interrogative", "Exclamative", "Impérative"],
    answer: "Interrogative",
    fiche: {
      regle:
        "La phrase interrogative pose une question. Elle se termine par un point d'interrogation (?).",
      exemple:
        "✅ Aimes-tu la lecture ? ✅ Est-ce que tu viens ? ✅ Pourquoi ris-tu ?",
      piege:
        "Une phrase peut commencer par 'Est-ce que' ou avoir l'inversion sujet-verbe.",
      astuce:
        "Interrogative = question. Si tu cherches une réponse, c'est une phrase interrogative !",
    },
  },
  {
    question:
      "Transforme cette phrase à la forme négative : « Il mange une pomme. »",
    options: [
      "Il ne mange pas une pomme.",
      "Il ne mange pas de pomme.",
      "Il mange pas de pomme.",
      "Il ne pas mange une pomme.",
    ],
    answer: "Il ne mange pas de pomme.",
    fiche: {
      regle:
        "À la forme négative, on encadre le verbe avec 'ne...pas'. Après la négation, l'article indéfini (un, une, des) devient 'de'.",
      exemple:
        "✅ Il mange une pomme → Il ne mange pas de pomme. ✅ Elle a des amis → Elle n'a pas d'amis.",
      piege:
        "Beaucoup oublient de changer 'une/un/des' en 'de' après la négation !",
      astuce:
        "Négation = ne...pas autour du verbe + 'de' à la place de un/une/des.",
    },
  },
  {
    question:
      "Quel est le sujet dans cette phrase : « Chaque matin, les oiseaux chantent dans le jardin. »",
    options: ["Chaque matin", "les oiseaux", "chantent", "dans le jardin"],
    answer: "les oiseaux",
    fiche: {
      regle:
        "Le sujet est le mot ou groupe de mots qui fait l'action du verbe. On le trouve en posant la question 'Qui est-ce qui ?' ou 'Qu'est-ce qui ?' avant le verbe.",
      exemple:
        "✅ Les oiseaux chantent → Qui est-ce qui chante ? → les oiseaux = sujet.",
      piege:
        "Le sujet n'est pas toujours placé juste avant le verbe. Il peut y avoir des compléments avant lui !",
      astuce:
        "Pour trouver le sujet : pose 'Qui est-ce qui + verbe ?' La réponse est le sujet !",
    },
  },
  {
    question:
      "Quelle est la nature de cette phrase : « Quelle belle journée ! »",
    options: ["Déclarative", "Interrogative", "Exclamative", "Impérative"],
    answer: "Exclamative",
    fiche: {
      regle:
        "La phrase exclamative exprime un sentiment fort (joie, surprise, colère, admiration). Elle se termine par un point d'exclamation (!).",
      exemple:
        "✅ Quelle belle journée ! ✅ Comme c'est beau ! ✅ Quel dommage !",
      piege:
        "Ne pas confondre avec la phrase impérative qui donne un ordre. L'exclamative exprime un sentiment.",
      astuce:
        "Exclamative = émotion forte. Si tu ressens quelque chose en lisant, c'est une phrase exclamative !",
    },
  },
  {
    question:
      "Quelle est la forme de cette phrase : « Je n'aime pas les épinards. »",
    options: ["Affirmative", "Négative", "Interrogative", "Exclamative"],
    answer: "Négative",
    fiche: {
      regle:
        "La forme négative utilise les mots de négation : ne...pas, ne...plus, ne...jamais, ne...rien.",
      exemple:
        "✅ Je n'aime pas → forme négative. ✅ Je n'ai plus faim → forme négative.",
      piege:
        "Attention : une phrase peut être interrogative ET négative à la fois ! Ex : 'N'aimes-tu pas les épinards ?'",
      astuce:
        "Cherche 'ne...pas' ou 'ne...jamais' dans la phrase — si tu les trouves, c'est la forme négative !",
    },
  },
  {
    question:
      "Combien de phrases y a-t-il dans ce texte : « Le soleil brille. Les enfants jouent. Il fait chaud ! »",
    options: ["1 phrase", "2 phrases", "3 phrases", "4 phrases"],
    answer: "3 phrases",
    fiche: {
      regle:
        "On compte les phrases en comptant les signes de ponctuation finale : . ! ? … Chaque signe marque la fin d'une phrase.",
      exemple:
        "✅ 'Il fait beau. Je sors.' = 2 phrases. ✅ 'Viens ! Tu veux ? Je pars.' = 3 phrases.",
      piege:
        "Ne pas confondre la virgule (,) qui ne termine pas une phrase, et le point (.) qui la termine.",
      astuce:
        "Compte les points, points d'exclamation et d'interrogation = nombre de phrases !",
    },
  },
  {
    question: "Laquelle de ces phrases est une phrase déclarative ?",
    options: [
      "Viens ici !",
      "Est-ce qu'il pleut ?",
      "Le ciel est bleu aujourd'hui.",
      "Comme c'est beau !",
    ],
    answer: "Le ciel est bleu aujourd'hui.",
    fiche: {
      regle:
        "La phrase déclarative donne une information, raconte ou décrit. Elle se termine par un point (.).",
      exemple:
        "✅ Le ciel est bleu. ✅ Marie mange une pomme. ✅ Il fait froid en hiver.",
      piege:
        "C'est le type de phrase le plus courant. Si la phrase n'est pas une question, un ordre ou une exclamation, c'est une déclarative !",
      astuce:
        "Déclarative = donne une info. C'est le type de phrase que tu utilises le plus souvent !",
    },
  },
  {
    question: "Quelle phrase est à la forme affirmative ?",
    options: [
      "Elle ne mange pas de viande.",
      "Il n'a jamais menti.",
      "Nous partons en vacances demain.",
      "Je ne comprends rien.",
    ],
    answer: "Nous partons en vacances demain.",
    fiche: {
      regle:
        "La forme affirmative n'utilise pas de mots de négation. Elle affirme quelque chose de positif.",
      exemple:
        "✅ Nous partons → affirmative. ❌ Nous ne partons pas → négative.",
      piege:
        "Les mots 'ne...pas', 'ne...jamais', 'ne...rien', 'ne...plus' indiquent toujours la forme négative.",
      astuce:
        "Si tu ne vois pas de 'ne...pas' ou similaire dans la phrase, c'est la forme affirmative !",
    },
  },
];

export default function LaPhrasePage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [etape, setEtape] = useState<"intro" | "quiz" | "resultat">("intro");
  const [index, setIndex] = useState(0);
  const [reponseChoisie, setReponseChoisie] = useState<string | null>(null);
  const [estCorrecte, setEstCorrecte] = useState<boolean | null>(null);
  const [ficheouverte, setFicheOuverte] = useState(false);
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

  useEffect(() => {
    const charger = async () => {
      const best = await getBestScore(CLASSE, MATIERE, THEME);
      const last = await getLastScore(CLASSE, MATIERE, THEME);
      setBestScore(best);
      setLastScore(last);
    };
    charger();
  }, []);

  const demarrer = () => {
    const q = shuffleArray(questionsBase).map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
    setQuestions(q);
    scoreRef.current = 0;
    scoreSaved.current = false;
    setIndex(0);
    setReponseChoisie(null);
    setEstCorrecte(null);
    setFicheOuverte(false);
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
      setFicheOuverte(true);
    }
  };

  const question_suivante = async () => {
    setFicheOuverte(false);
    if (index + 1 >= questions.length) {
      if (!scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score: scoreRef.current,
          total: questions.length,
        });
        const best = await getBestScore(CLASSE, MATIERE, THEME);
        const last = await getLastScore(CLASSE, MATIERE, THEME);
        setBestScore(best);
        setLastScore(last);
      }
      setEtape("resultat");
    } else {
      setIndex(index + 1);
      setReponseChoisie(null);
      setEstCorrecte(null);
    }
  };

  const score = scoreRef.current;
  const total = questions.length;

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
          <h1 className="lecon-titre">La phrase</h1>
          <div className="lecon-intro">
            Une phrase est un ensemble de mots qui a un sens complet. Elle
            commence par une <strong>majuscule</strong> et se termine par un{" "}
            <strong>signe de ponctuation</strong> (. ! ? …).
          </div>

          {/* Encarts meilleur/dernier score */}
          {(bestScore || lastScore) && (
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

          {/* Résumé de la leçon */}
          <div className="lecon-points">
            <div className="lecon-point">
              <div className="lecon-point-titre">🔤 Les types de phrases</div>
              <div className="lecon-point-texte">
                Il existe 4 types de phrases : <strong>déclarative</strong>{" "}
                (donne une info), <strong>interrogative</strong> (pose une
                question), <strong>exclamative</strong> (exprime un sentiment),{" "}
                <strong>impérative</strong> (donne un ordre).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemples :</span> Le chat dort.
                / Dors-tu ? / Quel beau chat ! / Dors !
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">✅ Les formes de phrases</div>
              <div className="lecon-point-texte">
                Une phrase peut être à la forme <strong>affirmative</strong>{" "}
                (sans négation) ou <strong>négative</strong> (avec ne...pas,
                ne...jamais, ne...plus...).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemples :</span> Je mange.
                (affirmative) / Je ne mange pas. (négative)
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">👤 Le sujet</div>
              <div className="lecon-point-texte">
                Le sujet est celui qui fait l'action. Pour le trouver, pose la
                question <strong>"Qui est-ce qui + verbe ?"</strong>
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Les enfants
                jouent. → Qui est-ce qui joue ? → les enfants = sujet.
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

        {/* Progression */}
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

        {/* Question */}
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

          {/* Feedback */}
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
                {!estCorrecte && (
                  <button
                    onClick={() => setFicheOuverte(true)}
                    style={{
                      marginTop: "8px",
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
            <button
              className="lecon-btn"
              onClick={question_suivante}
              style={{ marginTop: "16px" }}
            >
              {index + 1 >= total
                ? "Voir mon résultat →"
                : "Question suivante →"}
            </button>
          )}
        </div>

        {/* Pop-up fiche pédagogique */}
        {ficheouverte && (
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
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
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
                onClick={() => setFicheOuverte(false)}
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

          {(bestScore || lastScore) && (
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
