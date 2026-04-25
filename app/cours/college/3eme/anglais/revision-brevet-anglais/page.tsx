"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "anglais";
const THEME = "revision-brevet-anglais";

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
      "Report this sentence for the Brevet: He said: 'I am going to the cinema.'",
    options: [
      "He said he is going to the cinema.",
      "He said he was going to the cinema.",
      "He said he will go to the cinema.",
      "He said he goes to the cinema.",
    ],
    answer: "He said he was going to the cinema.",
    fiche: {
      regle:
        "Reported speech tense shift: Present Continuous (am going) → Past Continuous (was going). Pronoun change: I → he. This is a classic Brevet question type.",
      exemple:
        "'I am eating.' → She said she was eating. 'We are leaving.' → They said they were leaving. Present Continuous → Past Continuous in reported speech.",
      piege:
        "Don't keep the present tense. 'He said he IS going' is wrong when 'said' is past. Tense must shift back.",
      astuce:
        "Key tense shifts: am/is/are + -ing → was/were + -ing. will → would. can → could. have/has → had. Present Simple → Past Simple.",
    },
  },
  {
    question:
      "Choose the correct relative pronoun for the Brevet: 'The film ___ we saw last night was brilliant.'",
    options: ["who", "whose", "which", "where"],
    answer: "which",
    fiche: {
      regle:
        "WHICH for things (films, books, cars...). WHO for people. WHOSE for possession. WHERE for places. Here 'film' = thing → which.",
      exemple:
        "The film which I saw. The actor who played Bond. The director whose films are famous. The cinema where we met.",
      piege:
        "Don't use WHO for things. 'The film who we saw' is wrong. Which OR that for things in defining clauses.",
      astuce:
        "Quick test: person → who. Thing → which (or that). Place → where. Possession → whose. Apply this at the Brevet for instant answers.",
    },
  },
  {
    question:
      "Complete with the correct modal: 'You ___ smoke in hospitals — it's strictly forbidden.'",
    options: ["don't have to", "shouldn't", "mustn't", "couldn't"],
    answer: "mustn't",
    fiche: {
      regle:
        "MUSTN'T = prohibition (it is forbidden). DON'T HAVE TO = no obligation (you can if you want). This distinction is CRITICAL at the Brevet.",
      exemple:
        "You mustn't smoke. (forbidden). You don't have to wear a tie. (not compulsory). You shouldn't eat so much sugar. (advice, not prohibition).",
      piege:
        "Mustn't ≠ don't have to. The most common modal error at the Brevet. Mustn't = forbidden. Don't have to = optional.",
      astuce:
        "Brevet trap: mustn't (forbidden) vs don't have to (not necessary). Must (obligation) vs should (advice). Learn these four distinctions.",
    },
  },
  {
    question: "Which sentence uses the Past Perfect correctly?",
    options: [
      "When I arrived, she left already.",
      "When I arrived, she had already left.",
      "When I arrived, she has already left.",
      "When I arrived, she already left.",
    ],
    answer: "When I arrived, she had already left.",
    fiche: {
      regle:
        "Past Perfect = had + past participle. Used for the action that happened FIRST in the past. 'Already' is a signal word. When I arrived (2nd action) → she had left (1st action).",
      exemple:
        "By the time he called, I had finished. After she had eaten, she went to bed. I was late because I had missed the bus.",
      piege:
        "Don't use Present Perfect (has left) in a past narrative. Don't forget 'had' — 'she already left' misses the auxiliary.",
      astuce:
        "Past Perfect = had + p.p. Signal: when, by the time, already, just, before, after. Which happened first? → Past Perfect.",
    },
  },
  {
    question:
      "What does this sentence mean: 'She must be exhausted — she worked all day.'",
    options: [
      "She has to be exhausted.",
      "I'm certain she is exhausted based on the evidence.",
      "She is probably not exhausted.",
      "She should feel exhausted.",
    ],
    answer: "I'm certain she is exhausted based on the evidence.",
    fiche: {
      regle:
        "Must (deduction) = I'm logically certain based on evidence. Not obligation here — context shows it's deduction. Evidence: 'she worked all day' → conclusion: 'must be exhausted'.",
      exemple:
        "He must be rich — look at his house. (deduction). She must be angry — she didn't reply. (deduction). They must have left — the lights are off. (past deduction).",
      piege:
        "Must has two uses: obligation ('you must go') and deduction ('he must be tired'). Context determines which. Evidence = deduction.",
      astuce:
        "Must (deduction) = certain based on evidence. Can't (negative deduction) = I'm certain it's NOT true. Might/could = possible but uncertain.",
    },
  },
  {
    question: "Choose the correct sentence for the Brevet writing task:",
    options: [
      "I have went to London last year.",
      "I went to London last year.",
      "I have gone to London last year.",
      "I was gone to London last year.",
    ],
    answer: "I went to London last year.",
    fiche: {
      regle:
        "Use Simple Past (went) with specific past time expressions: last year, yesterday, in 2020, two years ago. Present Perfect (have gone) is NOT used with specific past times.",
      exemple:
        "'Last year' → Simple Past: I went, she saw, they visited. 'I have gone last year' is wrong. Present Perfect = no specific time OR recent/relevant past.",
      piege:
        "Present Perfect + specific time (last year, yesterday) = WRONG. Simple Past + specific time = correct. Very common Brevet writing error.",
      astuce:
        "Specific time (yesterday, last year, in 2020) → Simple Past. No time or recent/relevant → Present Perfect. Key rule for Brevet writing!",
    },
  },
  {
    question: "What is the best way to structure a short Brevet English essay?",
    options: [
      "Write everything in one paragraph without structure",
      "Introduction + 2-3 developed paragraphs + conclusion",
      "Only write a conclusion",
      "Write bullet points without full sentences",
    ],
    answer: "Introduction + 2-3 developed paragraphs + conclusion",
    fiche: {
      regle:
        "Brevet English writing: Introduction (introduce the topic + your position), 2-3 body paragraphs (each with one main idea + example/explanation), Conclusion (summary + final thought). Use connectors.",
      exemple:
        "Connectors: First/Firstly, Moreover/Furthermore, However/On the other hand, In addition, Finally/To conclude. Topic sentence + example + explanation in each paragraph.",
      piege:
        "Don't just list ideas without developing them. Each paragraph needs: topic sentence + development + example. Write in full sentences, not bullet points.",
      astuce:
        "Essay structure: Intro (hook + position) + Body (3 paragraphs: point + example + explanation) + Conclusion (summary + opening). Use connectors throughout.",
    },
  },
  {
    question:
      "Complete with the correct form: 'If I ___ more time, I would travel more.'",
    options: ["have", "had", "would have", "will have"],
    answer: "had",
    fiche: {
      regle:
        "Second conditional: If + Past Simple, would + base form. Used for hypothetical or unlikely situations. 'If I had time' (I probably don't) → 'I would travel'.",
      exemple:
        "If she were taller, she would be a model. If we had more money, we would buy a house. If it rained, I would stay home.",
      piege:
        "Second conditional: If + PAST SIMPLE (not would). Don't say 'If I would have' — this is wrong. If + had (past simple of have).",
      astuce:
        "Conditionals: 1st (real): If + present → will. 2nd (hypothetical): If + past → would. 3rd (past regret): If + past perfect → would have.",
    },
  },
  {
    question: "Which sentence correctly uses a non-defining relative clause?",
    options: [
      "The man who lives next door is friendly.",
      "My father, who is a doctor, works long hours.",
      "The book that I read was interesting.",
      "I know a girl whose sister is famous.",
    ],
    answer: "My father, who is a doctor, works long hours.",
    fiche: {
      regle:
        "Non-defining relative clause: commas, extra information, cannot use 'that'. 'My father' is already identified → the clause adds extra info → non-defining → commas needed.",
      exemple:
        "London, which is the capital of England, has 9 million people. My teacher, who has taught here for 20 years, is retiring. Shakespeare, whose plays are famous worldwide, was born in 1564.",
      piege:
        "Non-defining = commas + no 'that'. Defining = no commas, can use 'that'. Remove the clause: if meaning is still clear = non-defining.",
      astuce:
        "Non-defining test: remove the clause. If sentence still makes sense AND we know which person/thing → non-defining → add commas.",
    },
  },
  {
    question: "Translate accurately: 'Il aurait dû partir plus tot.'",
    options: [
      "He should leave earlier.",
      "He had to leave earlier.",
      "He should have left earlier.",
      "He must leave earlier.",
    ],
    answer: "He should have left earlier.",
    fiche: {
      regle:
        "Should have + past participle = past regret or criticism. 'Il aurait dû' = he should have. 'Partir plus tot' = left earlier. This structure is common in Brevet translation exercises.",
      exemple:
        "Il aurait dû étudier. → He should have studied. Elle n'aurait pas dû mentir. → She shouldn't have lied. Nous aurions dû partir. → We should have left.",
      piege:
        "Should have + p.p. (not should + base form for past). 'He should leave' = present advice. 'He should have left' = past regret (too late now).",
      astuce:
        "French aurait dû + infinitif → English should have + past participle. N'aurait pas dû → shouldn't have. Essential for Brevet translation.",
    },
  },
];

export default function RevisionBrevetAnglaisPage() {
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
          <h1 className="lecon-titre">Brevet English Revision</h1>
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
            Prepare for the <strong>Brevet English exam</strong>: reported
            speech, relative clauses, modals, Past Perfect, conditionals,
            writing skills and translation.
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
              <div className="lecon-point-titre">🎯 Key grammar points</div>
              <div className="lecon-point-texte">
                Reported speech (tense shifts). Relative clauses
                (who/which/whose/where). Modals (must/should/can/might —
                especially mustn't vs don't have to). Past Perfect (had + p.p.).
                Conditionals (2nd: if + past → would).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Brevet traps:</span> Mustn't
                (forbidden) vs don't have to (optional). Which (things) vs who
                (people). Had left (first action) vs left (second action).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">✍️ Writing skills</div>
              <div className="lecon-point-texte">
                Use specific past time (last year) → Simple Past (NOT Present
                Perfect). Essay structure: intro + 2-3 paragraphs + conclusion.
                Connectors: firstly, moreover, however, finally. Full sentences,
                not bullet points.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Key rule:</span> 'I went to
                London last year' (correct). 'I have gone to London last year'
                (WRONG — specific time).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔄 Translation tips</div>
              <div className="lecon-point-texte">
                Aurait dû → should have + p.p. Avait fait → had done (Past
                Perfect). Pourrait → could. Doit → must (obligation) OR must be
                (deduction). Il faut → must/have to.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> Il aurait dû
                partir → He should have left. Elle avait fini → She had
                finished. On doit → We must/have to.
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
        ? "You're ready for the Brevet!"
        : pourcentage >= 60
          ? "Well done, keep going!"
          : "A bit more revision needed!";
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
