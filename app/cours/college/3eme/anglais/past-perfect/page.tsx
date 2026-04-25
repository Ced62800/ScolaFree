"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "anglais";
const THEME = "past-perfect";

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
    question: "How is the Past Perfect formed?",
    options: [
      "had + base form",
      "had + past participle",
      "have + past participle",
      "was/were + past participle",
    ],
    answer: "had + past participle",
    fiche: {
      regle:
        "The Past Perfect is formed with: had + past participle (for all subjects). It expresses an action completed BEFORE another past action.",
      exemple:
        "She had left when I arrived. They had already eaten before we got there. I had never seen snow before that winter.",
      piege:
        "Don't confuse with Present Perfect (have/has + p.p.). Past Perfect uses HAD for all persons — not have or has.",
      astuce:
        "Past Perfect = HAD + p.p. It's the 'past of the past'. Use it when one past action happened BEFORE another past action.",
    },
  },
  {
    question: "Choose the correct sentence using Past Perfect:",
    options: [
      "When she arrived, the film started.",
      "When she arrived, the film had already started.",
      "When she arrived, the film has started.",
      "When she arrived, the film was starting.",
    ],
    answer: "When she arrived, the film had already started.",
    fiche: {
      regle:
        "Use Past Perfect for the action that happened FIRST in the past. Here: the film started first, THEN she arrived. Signal words: already, just, before, after, when.",
      exemple:
        "When I got home, my sister had cooked dinner. (First: cook dinner. Then: I got home.) By the time they arrived, we had finished.",
      piege:
        "When the two actions happen at the same time or in sequence without emphasis, use Simple Past for both. Past Perfect emphasises which happened FIRST.",
      astuce:
        "Ask: which action happened FIRST? → Past Perfect. Which happened SECOND? → Simple Past. Timeline: had done → did.",
    },
  },
  {
    question: "Complete: 'She was tired because she ___ all night.'",
    options: ["has worked", "worked", "had worked", "was working"],
    answer: "had worked",
    fiche: {
      regle:
        "When 'because' explains the reason for a past state, the cause (which happened before) takes Past Perfect. 'She was tired' (Simple Past) is explained by 'she had worked' (Past Perfect — happened before).",
      exemple:
        "He was hungry because he hadn't eaten. They were late because they had missed the bus. I was happy because I had passed my exam.",
      piege:
        "The cause happened BEFORE the effect. Effect = Simple Past. Cause = Past Perfect.",
      astuce:
        "Because + reason (Past Perfect) → result (Simple Past). Cause before effect in time = Past Perfect for the cause.",
    },
  },
  {
    question: "What is the Past Participle of 'go'?",
    options: ["goed", "went", "going", "gone"],
    answer: "gone",
    fiche: {
      regle:
        "Irregular verbs have irregular past participles. Essential list: go-went-gone, see-saw-seen, take-took-taken, write-wrote-written, speak-spoke-spoken, give-gave-given.",
      exemple:
        "She had gone to the shops before noon. He had never seen such a beautiful place. They had taken the wrong road.",
      piege:
        "'Went' is the Simple Past of 'go', NOT the past participle. The past participle is 'gone'. Common mistake!",
      astuce:
        "Past participle ≠ Simple Past for irregular verbs. go: went (past) / gone (p.p.). Come: came / come. Do: did / done.",
    },
  },
  {
    question: "Which sentence is in the Past Perfect negative?",
    options: [
      "He didn't finish his homework.",
      "He hadn't finished his homework.",
      "He hasn't finished his homework.",
      "He wasn't finishing his homework.",
    ],
    answer: "He hadn't finished his homework.",
    fiche: {
      regle:
        "Past Perfect negative: had + not + past participle → hadn't + past participle. Used to say something did NOT happen before a past moment.",
      exemple:
        "I hadn't slept well before the exam. She hadn't heard the news when I called. They hadn't met before the party.",
      piege:
        "hadn't = had not (contracted). Don't use 'didn't had' — this is wrong. Negative = hadn't + past participle.",
      astuce:
        "Past Perfect negative = hadn't + p.p. Questions: Had + subject + p.p.? Had you ever been there? No, I hadn't.",
    },
  },
  {
    question:
      "Choose the correct form: 'By the time the police arrived, the thief ___ escaped.'",
    options: ["has", "have", "had", "was"],
    answer: "had",
    fiche: {
      regle:
        "'By the time' introduces the later action (Simple Past). The action completed BEFORE that moment uses Past Perfect. By the time + Simple Past → Past Perfect.",
      exemple:
        "By the time I woke up, she had already left. By the time we arrived, the concert had finished. By the time he called, I had forgotten.",
      piege:
        "'By the time' is always followed by Simple Past. The other clause uses Past Perfect. Don't mix up the two clauses.",
      astuce:
        "'By the time + Simple Past' = signal to use Past Perfect in the other clause. By the time she came → I had already done it.",
    },
  },
  {
    question:
      "What does this sentence mean: 'I had never eaten sushi before that trip.'",
    options: [
      "I ate sushi during the trip.",
      "Before the trip, sushi was my first experience.",
      "I didn't eat sushi during the trip.",
      "I had eaten sushi many times before the trip.",
    ],
    answer: "Before the trip, sushi was my first experience.",
    fiche: {
      regle:
        "'Had never + past participle' expresses that something had NOT happened at any point before a specific past moment. It was a first experience.",
      exemple:
        "I had never seen snow before I moved to Canada. She had never spoken in public before that day. They had never visited Paris.",
      piege:
        "Had never = zero times before that past point. It doesn't tell us what happened DURING or AFTER the reference event.",
      astuce:
        "Had never = first time ever (up to that past point). Like 'Have you ever...?' but set in the past. Very common in storytelling.",
    },
  },
  {
    question: "Complete: 'After they ___ dinner, they went for a walk.'",
    options: ["eat", "had eaten", "ate", "have eaten"],
    answer: "had eaten",
    fiche: {
      regle:
        "After + Past Perfect, Simple Past. The Past Perfect action (eating) happened FIRST. 'After' makes the sequence clear but Past Perfect reinforces it.",
      exemple:
        "After she had finished her homework, she watched TV. After he had saved enough money, he bought a car. After we had visited the museum, we had coffee.",
      piege:
        "With 'after', the sequence is already clear, so Simple Past is also acceptable. But Past Perfect is more emphatic and correct for exams.",
      astuce:
        "After + had done (Past Perfect) → did (Simple Past). Or: Before + did (Simple Past) → had done (Past Perfect). Reverse the logic.",
    },
  },
  {
    question: "Which word is NOT commonly used with Past Perfect?",
    options: ["already", "just", "tomorrow", "before"],
    answer: "tomorrow",
    fiche: {
      regle:
        "Past Perfect signal words: already, just, never, ever, before, after, by the time, when, as soon as, once. 'Tomorrow' refers to the future and cannot be used with Past Perfect.",
      exemple:
        "I had already left. He had just arrived. She had never tried it. By the time + Past Perfect. Before he came → I had done it.",
      piege:
        "'Tomorrow' is a future marker. Past Perfect is strictly past. Other time markers like 'yesterday', 'last year' can coexist with Past Perfect.",
      astuce:
        "Past Perfect signal words: already, just, never, ever, before, after, by the time. These words help identify Past Perfect contexts.",
    },
  },
  {
    question: "Translate: 'Il avait deja fini quand elle est arrivee.'",
    options: [
      "He has already finished when she arrived.",
      "He already finished when she arrived.",
      "He had already finished when she arrived.",
      "He was already finishing when she arrived.",
    ],
    answer: "He had already finished when she arrived.",
    fiche: {
      regle:
        "French 'plus-que-parfait' (avait fini) = English Past Perfect (had finished). Both express an action completed before another past action.",
      exemple:
        "Il avait mange → He had eaten. Elle etait partie → She had left. Ils avaient vu → They had seen.",
      piege:
        "Don't translate 'avait' as 'has'. 'Avait' = had. French plus-que-parfait always translates to English Past Perfect.",
      astuce:
        "French avait/avaient + past participle → English had + past participle. One-to-one translation for this tense.",
    },
  },
];

export default function PastPerfectPage() {
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
          <div className="lecon-badge">
            <img
              src="https://flagcdn.com/w40/gb.png"
              alt="UK"
              style={{
                width: "24px",
                verticalAlign: "middle",
                borderRadius: "3px",
                marginRight: "8px",
              }}
            />
            Anglais — 3ème
          </div>
          <h1 className="lecon-titre">The Past Perfect</h1>
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
              Discovery mode — 5 questions ·{" "}
              <span
                onClick={() => router.push("/inscription")}
                style={{ color: "#4f8ef7", cursor: "pointer", fontWeight: 700 }}
              >
                Sign up
              </span>{" "}
              for all 10 questions!
            </div>
          )}
          <div className="lecon-intro">
            The <strong>Past Perfect</strong> expresses an action that happened{" "}
            <em>before</em> another action in the past. Formation:{" "}
            <strong>had + past participle</strong>.
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
                    🏆 Best score
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
                    🕐 Last score
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
              <div className="lecon-point-titre">📐 Formation</div>
              <div className="lecon-point-texte">
                Subject + had + past participle (all persons). Negative: hadn't
                + past participle. Question: Had + subject + past participle?
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Examples:</span> She had left.
                They hadn't arrived. Had he seen it?
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">⏰ When to use it</div>
              <div className="lecon-point-texte">
                Use Past Perfect for the action that happened FIRST in the past.
                Signal words: already, just, never, ever, before, after, by the
                time, when.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> When I arrived,
                she had already left. (First: she left. Second: I arrived.)
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🔑 Irregular past participles
              </div>
              <div className="lecon-point-texte">
                go → gone. see → seen. take → taken. write → written. give →
                given. come → come. do → done. eat → eaten. speak → spoken.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> He had gone. She
                had seen. They had taken the train.
              </div>
            </div>
          </div>
          <button className="lecon-btn" onClick={demarrer}>
            🚀 Start exercises →
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
              {scoreRef.current} correct answer{scoreRef.current > 1 ? "s" : ""}
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
                    : `The correct answer is: "${q.answer}"`}
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
                      😅 6 mistakes!
                    </p>
                    <p style={{ color: "#ddd", fontSize: "0.85rem" }}>
                      Read the study card before continuing! 💪
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
                    📖 View study card
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
                  📖 Read the card to unlock!
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
                {index + 1 >= total ? "See my result →" : "Next question →"}
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
                📖 Study card
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
                  📚 The rule
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
                  ✏️ Example
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
                  ⚠️ Watch out
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
                  💡 Tip
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
                Got it! Continue →
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
        ? "Excellent work!"
        : pourcentage >= 60
          ? "Well done!"
          : "Keep practising!";
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
            You answered {scoreRef.current} question
            {scoreRef.current > 1 ? "s" : ""} correctly out of {total} (
            {pourcentage}%).
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
                Discovery mode. Sign up for all 10 questions!
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
                Sign up for free →
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
                    🏆 Best score
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
                    🕐 Last score
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
              🔄 Try again
            </button>
            <button className="lecon-btn-outline" onClick={() => router.back()}>
              ← Back to topics
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
