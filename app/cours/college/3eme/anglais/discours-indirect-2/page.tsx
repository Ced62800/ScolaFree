"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "anglais";
const THEME = "discours-indirect-2";

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
    question: "Report this sentence: He said: 'I am tired.'",
    options: [
      "He said that he is tired.",
      "He said that he was tired.",
      "He said that I was tired.",
      "He said that he has been tired.",
    ],
    answer: "He said that he was tired.",
    fiche: {
      regle:
        "In reported speech, tenses shift back: Present Simple → Past Simple. 'am/is/are' → 'was/were'. The pronoun 'I' changes to 'he/she' depending on the speaker.",
      exemple:
        "'I am happy.' → She said she was happy. 'We are ready.' → They said they were ready. 'It is cold.' → He said it was cold.",
      piege:
        "Don't keep the present tense in reported speech. 'He said that he IS tired' is wrong when the reporting verb (said) is in the past.",
      astuce:
        "Tense shift: Present Simple → Past Simple. Present Continuous → Past Continuous. Present Perfect → Past Perfect. Future (will) → would.",
    },
  },
  {
    question: "Report: She said: 'I will call you tomorrow.'",
    options: [
      "She said she will call me tomorrow.",
      "She said she would call me the next day.",
      "She said she called me the next day.",
      "She said she would call you tomorrow.",
    ],
    answer: "She said she would call me the next day.",
    fiche: {
      regle:
        "Tense shift: will → would. Time expressions also change: tomorrow → the next day / the following day. Pronouns change: 'you' → 'me' (if I'm the listener).",
      exemple:
        "'I will come.' → He said he would come. 'We will see you tomorrow.' → They said they would see us the next day.",
      piege:
        "Don't forget to change time expressions: tomorrow → the next day. Today → that day. Yesterday → the day before. Here → there.",
      astuce:
        "Time changes: tomorrow → the next day. Yesterday → the day before. Now → then. Here → there. This → that. These → those.",
    },
  },
  {
    question: "Report this question: She asked: 'Do you like coffee?'",
    options: [
      "She asked if I liked coffee.",
      "She asked if I like coffee.",
      "She asked did I like coffee.",
      "She asked that I liked coffee.",
    ],
    answer: "She asked if I liked coffee.",
    fiche: {
      regle:
        "Yes/No questions in reported speech use 'if' or 'whether' + subject + verb (no inversion). Tense shifts back. 'Do you like' → 'if I liked'.",
      exemple:
        "'Are you coming?' → He asked if I was coming. 'Have you eaten?' → She asked if I had eaten. 'Will you help?' → He asked if I would help.",
      piege:
        "No question mark in reported questions. No auxiliary inversion: NOT 'she asked if did I like'. Word order: subject + verb (not verb + subject).",
      astuce:
        "Reported Yes/No questions: asked + if/whether + subject + verb. No inversion, no question mark. Tenses shift back as usual.",
    },
  },
  {
    question: "Report: He asked: 'Where do you live?'",
    options: [
      "He asked where did I live.",
      "He asked where I lived.",
      "He asked where I live.",
      "He asked where do I live.",
    ],
    answer: "He asked where I lived.",
    fiche: {
      regle:
        "Wh- questions in reported speech: wh- word + subject + verb (no inversion). Tenses shift back. 'Where do you live?' → 'where I lived'.",
      exemple:
        "'What are you doing?' → She asked what I was doing. 'Why did he leave?' → She asked why he had left. 'How do you feel?' → He asked how I felt.",
      piege:
        "No inversion in reported Wh- questions: NOT 'he asked where did I live'. The verb comes AFTER the subject.",
      astuce:
        "Reported Wh- questions: wh- word + subject + verb. No auxiliary before the subject. No question mark. Tenses shift back.",
    },
  },
  {
    question: "Which reporting verb is used for commands?",
    options: ["said", "told", "asked", "told + to + infinitive"],
    answer: "told + to + infinitive",
    fiche: {
      regle:
        "Commands/orders in reported speech use 'told + object + to + infinitive'. Negative: 'told + object + not to + infinitive'. 'asked' can also be used for polite requests.",
      exemple:
        "'Sit down!' → He told me to sit down. 'Don't move!' → She told us not to move. 'Please help me.' → He asked me to help him.",
      piege:
        "Don't use 'said' for commands. 'He said me to sit' is wrong. Use 'told + object + to' or 'asked + object + to'.",
      astuce:
        "Command → told + object + to + inf. Negative → told + object + NOT to + inf. Request → asked + object + to + inf.",
    },
  },
  {
    question: "Report: 'I have finished my homework,' she said.",
    options: [
      "She said she has finished her homework.",
      "She said she had finished her homework.",
      "She said she finished her homework.",
      "She said she would finish her homework.",
    ],
    answer: "She said she had finished her homework.",
    fiche: {
      regle:
        "Tense shift: Present Perfect (have/has + p.p.) → Past Perfect (had + p.p.). 'I have finished' → 'she had finished'.",
      exemple:
        "'I have seen that film.' → He said he had seen that film. 'We have arrived.' → They said they had arrived. 'She has left.' → He said she had left.",
      piege:
        "Present Perfect shifts to Past Perfect in reported speech. Don't keep 'has/have': 'she said she HAS finished' is wrong.",
      astuce:
        "Present Perfect → Past Perfect in reported speech. have/has + p.p. → had + p.p. This is one step further back in time.",
    },
  },
  {
    question: "Which sentence correctly uses reported speech?",
    options: [
      "He told that he was hungry.",
      "He said me that he was hungry.",
      "He said that he was hungry.",
      "He told that he is hungry.",
    ],
    answer: "He said that he was hungry.",
    fiche: {
      regle:
        "SAY vs TELL: 'say' is NOT followed by an object. 'tell' MUST be followed by an object (me, him, her, us, them). Say (that)... Tell someone (that)...",
      exemple:
        "He said he was tired. (correct) He told me he was tired. (correct) He told that... (wrong - no object after told) He said me... (wrong - say + no object)",
      piege:
        "The most common mistake: 'He told that...' (missing object) or 'He said me...' (wrong — say takes no object). Memorise: tell + person, say + nothing.",
      astuce:
        "SAY + (that) + clause. TELL + person + (that) + clause. Never: say + person. Never: tell + that (without person first).",
    },
  },
  {
    question: "Report: 'Don't open the window,' the teacher said.",
    options: [
      "The teacher said not to open the window.",
      "The teacher told not to open the window.",
      "The teacher told us not to open the window.",
      "The teacher asked not to open the window.",
    ],
    answer: "The teacher told us not to open the window.",
    fiche: {
      regle:
        "Negative commands: told + object + not to + infinitive. The object (us, me, him, her, them) is essential after 'told'. 'Not' comes before 'to'.",
      exemple:
        "'Don't be late!' → She told them not to be late. 'Don't touch that!' → He told me not to touch it. 'Don't worry.' → She told him not to worry.",
      piege:
        "'The teacher told not to open' is wrong — 'told' needs an object (us, me, them). Always: told + SOMEONE + not to.",
      astuce:
        "Negative command → told + object + NOT to + inf. The object is mandatory. 'not to' stays together — don't separate them.",
    },
  },
  {
    question: "What happens to 'this' and 'these' in reported speech?",
    options: [
      "They stay the same.",
      "They change to 'that' and 'those'.",
      "They change to 'it' and 'they'.",
      "They disappear.",
    ],
    answer: "They change to 'that' and 'those'.",
    fiche: {
      regle:
        "Demonstratives change in reported speech: this → that. these → those. Also: here → there. now → then. today → that day. tonight → that night.",
      exemple:
        "'I like this book.' → She said she liked that book. 'These are my keys.' → He said those were his keys. 'I am here now.' → She said she was there then.",
      piege:
        "Students often forget to change demonstratives and time/place expressions. These changes are as important as tense shifts.",
      astuce:
        "Full list of changes: this/these → that/those. here → there. now → then. today → that day. tomorrow → the next day. yesterday → the day before.",
    },
  },
  {
    question: "Report: She asked: 'Can you help me?'",
    options: [
      "She asked if I can help her.",
      "She asked if I could help her.",
      "She asked could I help her.",
      "She asked that I could help her.",
    ],
    answer: "She asked if I could help her.",
    fiche: {
      regle:
        "Modal shift in reported speech: can → could. will → would. may → might. must → had to. 'Can you help me?' → 'if I could help her'.",
      exemple:
        "'Can you swim?' → He asked if I could swim. 'Will you come?' → She asked if I would come. 'May I leave?' → He asked if he might leave.",
      piege:
        "Can shifts to COULD in reported speech. Don't keep 'can': 'she asked if I CAN help' is wrong in reported speech with a past reporting verb.",
      astuce:
        "Modal shifts: can → could. will → would. may → might. must → had to. Should, could, would, might: no change (already past form).",
    },
  },
];

export default function DiscoursIndirect2Page() {
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
          <h1 className="lecon-titre">Reported Speech</h1>
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
            <strong>Reported speech</strong> (indirect speech) is used to report
            what someone said. Tenses, pronouns, time expressions and word order
            all change.
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
              <div className="lecon-point-titre">⏰ Tense shifts</div>
              <div className="lecon-point-texte">
                Present Simple → Past Simple. Present Continuous → Past
                Continuous. Present Perfect → Past Perfect. Will → Would. Can →
                Could. May → Might.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> "I am tired." →
                She said she WAS tired. "I will come." → He said he WOULD come.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🔄 Say vs Tell + Questions
              </div>
              <div className="lecon-point-texte">
                SAY + (that) + clause. TELL + person + (that) + clause. Yes/No
                questions: asked + if + subject + verb. Wh- questions: wh- word
                + subject + verb. No inversion!
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> "Do you like
                it?" → She asked if I LIKED it. "Where do you live?" → He asked
                where I LIVED.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📅 Time + place changes</div>
              <div className="lecon-point-texte">
                Tomorrow → the next day. Today → that day. Yesterday → the day
                before. Here → there. Now → then. This → that. These → those.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> "I'll call you
                tomorrow." → She said she would call me THE NEXT DAY.
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
