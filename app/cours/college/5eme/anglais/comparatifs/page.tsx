"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "anglais";
const THEME = "comparatifs";

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
      "How do you form the comparative of a short adjective like 'tall'?",
    options: ["more tall", "taller", "most tall", "tallest"],
    answer: "taller",
    fiche: {
      regle:
        "Comparatif des adjectifs courts (1 syllabe) : adjectif + -ER + than. Tall → taller. Short → shorter. Fast → faster.",
      exemple:
        "✅ He is taller than his brother. She is faster than me. This book is older than that one.",
      piege:
        "'More tall' → FAUX pour les adjectifs courts. 'Taller' → CORRECT. More = pour les longs adjectifs.",
      astuce:
        "Court (1 syllabe) = -ER + than. Long (3+ syllabes) = more + adj + than. Tall→taller, beautiful→more beautiful.",
    },
  },
  {
    question: "How do you form the superlative of 'tall'?",
    options: ["more tall", "taller", "the most tall", "the tallest"],
    answer: "the tallest",
    fiche: {
      regle:
        "Superlatif des adjectifs courts : THE + adjectif + -EST. Tall → the tallest. Short → the shortest. Fast → the fastest.",
      exemple:
        "✅ He is the tallest in his class. She is the fastest runner. Mount Everest is the highest mountain.",
      piege:
        "Superlatif = toujours avec THE. 'He is tallest' → FAUX. 'He is THE tallest' → CORRECT.",
      astuce:
        "Superlatif = THE + -EST. Comparatif = -ER + than. Tall→taller (comp.) / the tallest (sup.).",
    },
  },
  {
    question:
      "How do you form the comparative of 'beautiful' (long adjective)?",
    options: [
      "beautifuler",
      "more beautiful",
      "beautifuller",
      "the most beautiful",
    ],
    answer: "more beautiful",
    fiche: {
      regle:
        "Comparatif des adjectifs longs (3+ syllabes) : more + adjectif + than. Beautiful → more beautiful. Interesting → more interesting.",
      exemple:
        "✅ She is more beautiful than her sister. This film is more interesting than that one.",
      piege:
        "'Beautifuler' n'existe pas. Adjectifs longs → more. 'Expensiver' → FAUX. 'More expensive' → CORRECT.",
      astuce:
        "Long adjectif (3+ syllabes) → MORE + adj + than. 2 syllabes : parfois les deux sont possibles (more clever / cleverer).",
    },
  },
  {
    question: "What is the comparative of 'good'?",
    options: ["gooder", "more good", "better", "best"],
    answer: "better",
    fiche: {
      regle:
        "Good est irrégulier. Comparatif = better (pas gooder). Superlatif = the best. Bad → worse → the worst.",
      exemple:
        "✅ She is better at maths than me. This pizza is better than the other one. He is the best player.",
      piege:
        "'Gooder' n'existe pas. Good → better → best. Bad → worse → worst. Ces comparatifs sont irréguliers.",
      astuce:
        "Irréguliers à retenir : good→better→best. Bad→worse→worst. Far→farther/further→farthest/furthest.",
    },
  },
  {
    question: "How do you say 'aussi grand que' in English?",
    options: ["as tall than", "as tall as", "so tall as", "more tall as"],
    answer: "as tall as",
    fiche: {
      regle:
        "Égalité : as + adjectif + as = aussi...que. He is as tall as his father. She is as intelligent as her sister.",
      exemple:
        "✅ He is as tall as his father. (aussi grand que). She runs as fast as a cheetah.",
      piege:
        "as...AS (pas as...than ou as...that). Toujours AS...AS pour l'égalité.",
      astuce:
        "AS + adj + AS = aussi...que. AS tall AS = aussi grand que. Deux AS, comme une paire !",
    },
  },
  {
    question: "Complete: 'This film is ___ (boring) than the last one.'",
    options: ["more boring", "boringer", "most boring", "the most boring"],
    answer: "more boring",
    fiche: {
      regle:
        "Boring = 2 syllabes se terminant en -ing → more boring (pas boringer). En général, 2 syllabes → cas par cas.",
      exemple:
        "✅ This film is more boring than the last one. This lesson is more interesting than yesterday's.",
      piege:
        "'Boringer' → FAUX. Boring a 2 syllabes mais utilise 'more' (pas -er).",
      astuce:
        "2 syllabes = parfois -er (clever→cleverer), parfois more (boring→more boring). Les mots en -ing, -ous, -ful → more.",
    },
  },
  {
    question: "What is the superlative of 'bad'?",
    options: ["the baddest", "the most bad", "the worst", "the badder"],
    answer: "the worst",
    fiche: {
      regle:
        "Bad est irrégulier. Comparatif = worse. Superlatif = the worst. Comme good/better/best, bad a des formes irrégulières.",
      exemple:
        "✅ Today was the worst day of my life. She plays worse than him. This is the worst film I've seen.",
      piege:
        "'The baddest' n'existe pas. Bad → worse → the worst. Irrégulier comme good → better → best.",
      astuce:
        "Bad→worse→the worst. Retiens la paire good/bad : good→better→best / bad→worse→worst.",
    },
  },
  {
    question: "How do you say 'pas aussi rapide que' in English?",
    options: [
      "not so fast as",
      "not as fast as",
      "less fast than",
      "All are correct.",
    ],
    answer: "All are correct.",
    fiche: {
      regle:
        "Inégalité négative : not as...as OU not so...as OU less...than. Les trois expriment 'pas aussi...que'.",
      exemple:
        "✅ He is not as fast as her. He is not so fast as her. He is less fast than her. Les trois = correct.",
      piege:
        "Less...than est moins courant mais grammaticalement correct. Not as...as est le plus fréquent.",
      astuce:
        "NOT AS...AS = pas aussi... que. Less...than = moins...que. Not as fast as = less fast than = même sens.",
    },
  },
  {
    question: "Complete: 'The more you practise, ___ you become.'",
    options: ["better", "the better", "the more better", "more better"],
    answer: "the better",
    fiche: {
      regle:
        "Structure 'the more..., the more/better...' = plus...plus. The more you practise, the better you become.",
      exemple:
        "✅ The more you study, the smarter you become. The older I get, the wiser I am.",
      piege:
        "'More better' → FAUX. 'The better' → CORRECT. Pas de 'more' avec les comparatifs déjà en -er.",
      astuce:
        "THE more..., THE better = plus..., plus. Cette structure double utilise toujours THE devant le comparatif.",
    },
  },
  {
    question: "Which sentence is correct?",
    options: [
      "She is the most tall girl in the class.",
      "She is the tallest girl in the class.",
      "She is taller girl in the class.",
      "She is more tall than all girls.",
    ],
    answer: "She is the tallest girl in the class.",
    fiche: {
      regle:
        "Tall = adjectif court. Superlatif = the tallest. 'The most tall' → FAUX. 'The tallest' → CORRECT.",
      exemple:
        "✅ She is the tallest girl in the class. He is the strongest player. Paris is the most beautiful city.",
      piege:
        "Court adj → THE + -est. Long adj → THE most + adj. Ne pas utiliser 'the most' avec les courts.",
      astuce:
        "Short adj: THE + -EST. Long adj: THE MOST + adj. Tall→the tallest. Beautiful→the most beautiful.",
    },
  },
];

export default function ComparatifPage() {
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
          <div className="lecon-badge">📊 Anglais — 5ème</div>
          <h1 className="lecon-titre">Comparatifs & superlatifs</h1>
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
            Apprends à <strong>comparer</strong> en anglais : comparatifs
            (-er/more), superlatifs (-est/most) et formes irrégulières.
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
              <div className="lecon-point-titre">📏 Comparatif</div>
              <div className="lecon-point-texte">
                Court → -ER + than (taller than). Long → more + adj + than (more
                beautiful than). Égalité : as...as.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> He is taller
                than me. She is more beautiful. As tall as.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🏆 Superlatif</div>
              <div className="lecon-point-texte">
                Court → THE + -EST (the tallest). Long → THE most + adj (the
                most beautiful). Toujours avec THE.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> He is the
                tallest. She is the most beautiful.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">⚠️ Irréguliers</div>
              <div className="lecon-point-texte">
                Good → better → the best. Bad → worse → the worst. Far → farther
                → the farthest.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> She is better
                than him. This is the worst film!
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
                  {estCorrecte ? "Well done! 🎉" : "Not quite..."}
                </strong>
                <p>
                  {estCorrecte
                    ? "Excellent answer!"
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
                    📖 Voir la fiche
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
        ? "Excellent!"
        : pourcentage >= 60
          ? "Well done!"
          : "Keep trying!";
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
