"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Conditionnel (5)
  {
    id: 1,
    theme: "conditionnel",
    question: "Complete Type 1: 'If it rains, I _____ my umbrella.'",
    options: ["would take", "will take", "took", "take"],
    reponse: "will take",
    explication:
      "Type 1 (real/possible): If + present simple, WILL + infinitive.",
  },
  {
    id: 2,
    theme: "conditionnel",
    question: "Complete Type 2: 'If I _____ a million euros, I would travel.'",
    options: ["have", "had", "will have", "would have"],
    reponse: "had",
    explication:
      "Type 2 (hypothetical): If + PAST SIMPLE, would + infinitive. Imaginary situation.",
  },
  {
    id: 3,
    theme: "conditionnel",
    question: "Complete Type 3: 'If she _____ harder, she would have passed.'",
    options: ["studied", "had studied", "studies", "would study"],
    reponse: "had studied",
    explication:
      "Type 3 (past regret): If + past perfect (HAD + PP), would have + PP.",
  },
  {
    id: 4,
    theme: "conditionnel",
    question: "Which is correct?",
    options: [
      "If I would have money, I would buy.",
      "If I have money, I would buy.",
      "If I had money, I would buy.",
      "If I had money, I will buy.",
    ],
    reponse: "If I had money, I would buy.",
    explication:
      "NEVER would after IF. Type 2: If + past simple, would + infinitive. Golden rule!",
  },
  {
    id: 5,
    theme: "conditionnel",
    question: "What does 'unless' mean?",
    options: ["if", "if not / except if", "because", "although"],
    reponse: "if not / except if",
    explication:
      "Unless = if not. Unless you hurry = if you don't hurry. Positive verb after unless!",
  },
  // Discours indirect (5)
  {
    id: 6,
    theme: "discours-indirect",
    question: "Transform: He said: 'I am tired.'",
    options: [
      "He said that he is tired.",
      "He said that he was tired.",
      "He said that I was tired.",
      "He told that he was tired.",
    ],
    reponse: "He said that he was tired.",
    explication:
      "Reported speech: said that + past. Am becomes was (tense backshift). Said (not told).",
  },
  {
    id: 7,
    theme: "discours-indirect",
    question: "Transform: She said: 'I will come tomorrow.'",
    options: [
      "She said she will come tomorrow.",
      "She said she would come the next day.",
      "She said she comes the next day.",
      "She told she would come.",
    ],
    reponse: "She said she would come the next day.",
    explication:
      "Will becomes would. Tomorrow becomes the next day. Time expressions change!",
  },
  {
    id: 8,
    theme: "discours-indirect",
    question: "Transform: He asked: 'Are you happy?'",
    options: [
      "He asked if I was happy.",
      "He asked that I was happy.",
      "He asked was I happy.",
      "He asked me if you were happy.",
    ],
    reponse: "He asked if I was happy.",
    explication:
      "Yes/No question: asked IF + statement order. No inversion. Are = was.",
  },
  {
    id: 9,
    theme: "discours-indirect",
    question: "Transform: 'Open the window!' he told me.",
    options: [
      "He told me to open the window.",
      "He said me to open the window.",
      "He told me open the window.",
      "He told me that I open the window.",
    ],
    reponse: "He told me to open the window.",
    explication:
      "Command: TOLD + person + TO + infinitive. Said me is wrong (need told + person).",
  },
  {
    id: 10,
    theme: "discours-indirect",
    question: "What does 'can' become in reported speech?",
    options: ["can", "could", "may", "would"],
    reponse: "could",
    explication:
      "Modal backshift: CAN = could. MAY = might. MUST = had to. WILL = would.",
  },
  // Droits et citoyennete (5)
  {
    id: 11,
    theme: "droits-citoyennete",
    question: "What is freedom of speech?",
    options: [
      "The right to speak any language",
      "The right to express your opinions freely",
      "The right to study for free",
      "The right to travel freely",
    ],
    reponse: "The right to express your opinions freely",
    explication:
      "Freedom of speech = liberte d expression. A fundamental human right in democracies.",
  },
  {
    id: 12,
    theme: "droits-citoyennete",
    question: "What is discrimination?",
    options: [
      "A school subject",
      "Treating someone unfairly because of who they are",
      "A government law",
      "A form of protest",
    ],
    reponse: "Treating someone unfairly because of who they are",
    explication:
      "Discrimination = treating someone unfairly based on race, gender, religion, age etc.",
  },
  {
    id: 13,
    theme: "droits-citoyennete",
    question: "What is a refugee?",
    options: [
      "A person on holiday",
      "A person who fled their country due to persecution or war",
      "A foreign student",
      "A person working abroad",
    ],
    reponse: "A person who fled their country due to persecution or war",
    explication:
      "Refugee = refugie. Forced to leave their country. Asylum = asile. Flee = fuir.",
  },
  {
    id: 14,
    theme: "droits-citoyennete",
    question: "What does democracy mean?",
    options: [
      "Rule by one person",
      "Government by the people or their elected representatives",
      "Rule by the military",
      "Government by the richest",
    ],
    reponse: "Government by the people or their elected representatives",
    explication:
      "Democracy = democratie. Greek: demos (people) + kratos (power). Citizens vote!",
  },
  {
    id: 15,
    theme: "droits-citoyennete",
    question: "What is a citizen's duty?",
    options: [
      "To travel abroad",
      "To fulfil responsibilities such as paying taxes and obeying laws",
      "To learn a foreign language",
      "To have a job",
    ],
    reponse: "To fulfil responsibilities such as paying taxes and obeying laws",
    explication:
      "Rights = what you CAN do. Duties = what you MUST do. Rights AND responsibilities!",
  },
  // Monde anglophone (5)
  {
    id: 16,
    theme: "monde-anglophone",
    question: "What is the capital of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    reponse: "Canberra",
    explication:
      "CANBERRA = capital of Australia. Sydney is the largest city, but not the capital!",
  },
  {
    id: 17,
    theme: "monde-anglophone",
    question: "Which country is NOT part of the United Kingdom?",
    options: ["Scotland", "Wales", "Republic of Ireland", "England"],
    reponse: "Republic of Ireland",
    explication:
      "UK = England + Scotland + Wales + Northern Ireland. Republic of Ireland is separate!",
  },
  {
    id: 18,
    theme: "monde-anglophone",
    question: "What is the Commonwealth?",
    options: [
      "A British political party",
      "An association of countries formerly in the British Empire",
      "A type of American government",
      "A European organisation",
    ],
    reponse: "An association of countries formerly in the British Empire",
    explication:
      "Commonwealth = 56 former British colony countries, voluntary association. King Charles III is head.",
  },
  {
    id: 19,
    theme: "monde-anglophone",
    question: "Lift (UK) = _____ (US)",
    options: ["stairs", "escalator", "elevator", "ladder"],
    reponse: "elevator",
    explication:
      "Lift (UK) = Elevator (US). Chips (UK) = Fries (US). Flat (UK) = Apartment (US).",
  },
  {
    id: 20,
    theme: "monde-anglophone",
    question: "Where is English NOT an official language?",
    options: ["Canada", "South Africa", "Brazil", "India"],
    reponse: "Brazil",
    explication:
      "Brazil = Portuguese (former Portuguese colony). Canada, South Africa, India = English official.",
  },
];

const themeLabels: Record<string, string> = {
  conditionnel: "Conditionals",
  "discours-indirect": "Reported Speech",
  "droits-citoyennete": "Rights and Citizenship",
  "monde-anglophone": "English-Speaking World",
};
const themeColors: Record<string, string> = {
  conditionnel: "#4f8ef7",
  "discours-indirect": "#2ec4b6",
  "droits-citoyennete": "#ffd166",
  "monde-anglophone": "#ff6b6b",
};

export default function BilanAnglais4eme2() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    conditionnel: 0,
    "discours-indirect": 0,
    "droits-citoyennete": 0,
    "monde-anglophone": 0,
  });
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      setEstConnecte(!!user);
      if (user) {
        setBestScore(await getBestScore("4eme", "anglais", "bilan-2"));
        setLastScore(await getLastScore("4eme", "anglais", "bilan-2"));
      }
      setChargement(false);
    };
    init();
  }, []);

  const shuffledQuestions = useMemo(() => shuffleArray(questions), []);
  const shuffledOptions = useMemo(() => {
    if (!shuffledQuestions[qIndex]) return [];
    return shuffleArray(shuffledQuestions[qIndex].options);
  }, [qIndex, shuffledQuestions]);
  const progression = ((qIndex + 1) / shuffledQuestions.length) * 100;
  const totalScore = scoreRef.current;
  const mention =
    totalScore >= 18
      ? { label: "Excellent!", icon: "🏆", color: "#2ec4b6" }
      : totalScore >= 14
        ? { label: "Well done!", icon: "⭐", color: "#4f8ef7" }
        : totalScore >= 10
          ? { label: "Good job!", icon: "👍", color: "#ffd166" }
          : { label: "Keep trying!", icon: "💪", color: "#ff6b6b" };

  const handleReponse = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === shuffledQuestions[qIndex].reponse) {
      scoreRef.current += 1;
      setScores((prev) => ({
        ...prev,
        [shuffledQuestions[qIndex].theme]:
          (prev[shuffledQuestions[qIndex].theme] || 0) + 1,
      }));
    }
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= shuffledQuestions.length) {
      if (!isSaving.current && estConnecte) {
        isSaving.current = true;
        await saveScore({
          classe: "4eme",
          matiere: "anglais",
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        setBestScore(await getBestScore("4eme", "anglais", "bilan-2"));
        setLastScore(await getLastScore("4eme", "anglais", "bilan-2"));
      }
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    scoreRef.current = 0;
    isSaving.current = false;
    setScores({
      conditionnel: 0,
      "discours-indirect": 0,
      "droits-citoyennete": 0,
      "monde-anglophone": 0,
    });
    setQIndex(0);
    setSelected(null);
    setEtape("qcm");
  };

  if (chargement)
    return (
      <div style={{ textAlign: "center", padding: "80px", color: "#aaa" }}>
        Chargement...
      </div>
    );
  if (!estConnecte)
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            Retour
          </button>
        </div>
        <div
          style={{
            maxWidth: "500px",
            margin: "80px auto",
            textAlign: "center",
            padding: "0 20px",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🔒</div>
          <h2
            style={{
              color: "#fff",
              fontSize: "1.5rem",
              fontWeight: 800,
              marginBottom: "12px",
            }}
          >
            Test reserved for registered users
          </h2>
          <p style={{ color: "#aaa", marginBottom: "24px" }}>
            Sign up for free to access the test!
          </p>
          <button
            onClick={() => router.push("/inscription")}
            style={{
              background: "linear-gradient(135deg, #f7974f, #f74f4f)",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              padding: "16px 32px",
              fontWeight: 800,
              fontSize: "1rem",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Sign up for free
          </button>
        </div>
      </div>
    );

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button className="cours-back" onClick={() => router.back()}>
          Retour
        </button>
        <div className="cours-breadcrumb">
          <span
            onClick={() => router.push("/cours/college/4eme/anglais")}
            style={{ cursor: "pointer" }}
          >
            Anglais 4eme
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Partie 2</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">Bilan Anglais 4eme — Partie 2</div>
          <h1 className="lecon-titre">English Test — 4eme Part 2</h1>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(46,196,182,0.1)",
                    borderRadius: "12px",
                    border: "1px solid #2ec4b6",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#2ec4b6",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    Record
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {bestScore.score}/20
                  </div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#888",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    Last
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="lecon-intro">
            This test covers the 4 topics of English 4eme — Part 2.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>🔮</span>
              <span>5 questions — Conditionals</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>💬</span>
              <span>5 questions — Reported Speech</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>⚖️</span>
              <span>5 questions — Rights and Citizenship</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>🌍</span>
              <span>5 questions — English-Speaking World</span>
            </div>
          </div>
          <div className="bilan-score-info">
            Final score out of <strong>20</strong>
          </div>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Start the test
          </button>
        </div>
      )}

      {etape === "qcm" && (
        <div>
          <div className="progression-wrapper">
            <div className="progression-info">
              <span>
                Question {qIndex + 1} / {shuffledQuestions.length}
              </span>
              <span
                style={{ color: themeColors[shuffledQuestions[qIndex].theme] }}
              >
                {themeLabels[shuffledQuestions[qIndex].theme]}
              </span>
            </div>
            <div className="progression-bar">
              <div
                className="progression-fill"
                style={{ width: `${progression}%` }}
              ></div>
            </div>
          </div>
          <div className="qcm-wrapper">
            <div className="qcm-question">
              {shuffledQuestions[qIndex].question}
            </div>
            <div className="qcm-options">
              {shuffledOptions.map((opt) => {
                let cn = "qcm-option";
                if (selected) {
                  if (opt === shuffledQuestions[qIndex].reponse)
                    cn += " correct";
                  else if (opt === selected) cn += " incorrect";
                  else cn += " disabled";
                }
                return (
                  <button
                    key={opt}
                    className={cn}
                    onClick={() => handleReponse(opt)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {selected && (
              <div
                className={`qcm-feedback ${selected === shuffledQuestions[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
              >
                <div className="feedback-icon">
                  {selected === shuffledQuestions[qIndex].reponse ? "✅" : "❌"}
                </div>
                <div className="feedback-texte">
                  <strong>
                    {selected === shuffledQuestions[qIndex].reponse
                      ? "Well done!"
                      : "Not quite..."}
                  </strong>
                  <p>{shuffledQuestions[qIndex].explication}</p>
                </div>
              </div>
            )}
            {selected && (
              <button className="lecon-btn" onClick={handleSuivant}>
                {qIndex + 1 >= shuffledQuestions.length
                  ? "See my results"
                  : "Next question"}
              </button>
            )}
          </div>
        </div>
      )}

      {etape === "fini" && (
        <div className="resultat-wrapper">
          <div className="resultat-icon">{mention.icon}</div>
          <h2 className="resultat-titre" style={{ color: mention.color }}>
            {mention.label}
          </h2>
          <div className="resultat-score" style={{ color: mention.color }}>
            {totalScore} / 20
          </div>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(46,196,182,0.1)",
                    borderRadius: "12px",
                    border: "1px solid #2ec4b6",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#2ec4b6",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    Best
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {bestScore.score}/20
                  </div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#888",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    Last
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="bilan-detail">
            <h3 className="bilan-detail-titre">Results by topic</h3>
            {Object.entries(scores as Record<string, number>).map(
              ([theme, scoreVal]) => (
                <div key={theme} className="bilan-detail-row">
                  <span className="bilan-detail-label">
                    {themeLabels[theme]}
                  </span>
                  <div className="bilan-detail-bar-wrapper">
                    <div
                      className="bilan-detail-bar"
                      style={{
                        width: `${(scoreVal / 5) * 100}%`,
                        backgroundColor: themeColors[theme],
                      }}
                    ></div>
                  </div>
                  <span className="bilan-detail-score">{scoreVal}/5</span>
                </div>
              ),
            )}
          </div>
          <p className="resultat-desc">
            {totalScore >= 18
              ? "Amazing! You've mastered English 4eme Part 2!"
              : totalScore >= 14
                ? "Great score, keep it up!"
                : totalScore >= 10
                  ? "Good progress!"
                  : "Keep practising, you'll get there!"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              Try again
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/college/4eme/anglais/page-2")}
            >
              Back to topics
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
