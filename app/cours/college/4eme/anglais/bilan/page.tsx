"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Present Perfect (5)
  {
    id: 1,
    theme: "present-perfect",
    question: "How do you form the Present Perfect?",
    options: [
      "was/were + verb-ing",
      "have/has + past participle",
      "did + infinitive",
      "will + infinitive",
    ],
    reponse: "have/has + past participle",
    explication:
      "Present Perfect = have/has + past participle. I have eaten. She has gone.",
  },
  {
    id: 2,
    theme: "present-perfect",
    question: "Which sentence is correct?",
    options: [
      "I have seen him yesterday.",
      "I saw him yesterday.",
      "I have saw him yesterday.",
      "I did see him yesterday.",
    ],
    reponse: "I saw him yesterday.",
    explication:
      "Yesterday = Past Simple. Never use Present Perfect with yesterday!",
  },
  {
    id: 3,
    theme: "present-perfect",
    question: "Fill in: She _____ never _____ sushi. (eat)",
    options: ["has / eaten", "have / eaten", "has / ate", "did / eat"],
    reponse: "has / eaten",
    explication:
      "She = HAS. Never goes between have/has and PP. Eaten = past participle of eat.",
  },
  {
    id: 4,
    theme: "present-perfect",
    question: "Translate: 'Je viens juste d'arriver.'",
    options: [
      "I just arrived.",
      "I have just arrived.",
      "I am just arriving.",
      "I just have arrived.",
    ],
    reponse: "I have just arrived.",
    explication:
      "Just = very recent = Present Perfect. JUST goes between have/has and PP.",
  },
  {
    id: 5,
    theme: "present-perfect",
    question: "How long _____ you lived here? (for 5 years)",
    options: ["do", "did", "have", "are"],
    reponse: "have",
    explication:
      "FOR + duration = Present Perfect ongoing. How long HAVE you lived here? I have lived here for 5 years.",
  },
  // Voix passive (5)
  {
    id: 6,
    theme: "voix-passive",
    question: "How do you form the passive voice?",
    options: [
      "do/does + infinitive",
      "be + past participle",
      "have + past participle",
      "get + present participle",
    ],
    reponse: "be + past participle",
    explication:
      "Passive = be (conjugated) + past participle. The meal is cooked. Hamlet was written.",
  },
  {
    id: 7,
    theme: "voix-passive",
    question: "Transform: 'The chef cooks the meal.'",
    options: [
      "The meal is cooked by the chef.",
      "The meal cooked by the chef.",
      "The meal is cooking by the chef.",
      "The meal was cooked by the chef.",
    ],
    reponse: "The meal is cooked by the chef.",
    explication:
      "Present passive: is/are + PP. Object becomes subject. Subject becomes agent (by...).",
  },
  {
    id: 8,
    theme: "voix-passive",
    question: "Transform: 'Shakespeare wrote Hamlet.'",
    options: [
      "Hamlet was written by Shakespeare.",
      "Hamlet is written by Shakespeare.",
      "Hamlet written by Shakespeare.",
      "Hamlet was wrote by Shakespeare.",
    ],
    reponse: "Hamlet was written by Shakespeare.",
    explication:
      "Past passive: was/were + PP. Write is irregular: write/wrote/WRITTEN.",
  },
  {
    id: 9,
    theme: "voix-passive",
    question: "Transform: 'They will build a new school.'",
    options: [
      "A new school will built.",
      "A new school will be built.",
      "A new school was built.",
      "A new school is built.",
    ],
    reponse: "A new school will be built.",
    explication:
      "Future passive: will + be + past participle. Will NEVER changes. Then be + PP.",
  },
  {
    id: 10,
    theme: "voix-passive",
    question: "Which sentence is passive?",
    options: [
      "The dog bit the man.",
      "The man was bitten by the dog.",
      "The man bites the dog.",
      "The man will bite the dog.",
    ],
    reponse: "The man was bitten by the dog.",
    explication:
      "Passive: was/were + past participle. Was bitten = passive. The man received the action.",
  },
  // Voyages et culture (5)
  {
    id: 11,
    theme: "voyages-culture",
    question: "What is the currency used in the United Kingdom?",
    options: ["Euro", "Dollar", "Pound Sterling", "Franc"],
    reponse: "Pound Sterling",
    explication:
      "UK = Pound Sterling. USA = Dollar. Australia = AUS Dollar. UK is NOT in the Eurozone!",
  },
  {
    id: 12,
    theme: "voyages-culture",
    question: "What is a roundtrip ticket?",
    options: [
      "A ticket for one journey only",
      "A ticket that includes going and coming back",
      "A discounted ticket",
      "A business class ticket",
    ],
    reponse: "A ticket that includes going and coming back",
    explication:
      "Roundtrip (US) = Return ticket (UK). Includes going AND coming back. One-way = aller simple.",
  },
  {
    id: 13,
    theme: "voyages-culture",
    question: "Which of these is an English-speaking country?",
    options: ["Brazil", "New Zealand", "Egypt", "Japan"],
    reponse: "New Zealand",
    explication:
      "New Zealand is English-speaking. Brazil = Portuguese. Egypt = Arabic. Japan = Japanese.",
  },
  {
    id: 14,
    theme: "voyages-culture",
    question: "What does 'customs' mean at an airport?",
    options: [
      "Local traditions",
      "The place where bags are checked for illegal items",
      "Passport control",
      "The duty-free shop",
    ],
    reponse: "The place where bags are checked for illegal items",
    explication:
      "Customs = where officials check for illegal goods. Different from passport control!",
  },
  {
    id: 15,
    theme: "voyages-culture",
    question: "What does 'jet lag' mean?",
    options: [
      "Heavy luggage",
      "Tiredness after flying across time zones",
      "A delay at the airport",
      "Travel insurance",
    ],
    reponse: "Tiredness after flying across time zones",
    explication:
      "Jet lag = decalage horaire. Tiredness caused by crossing multiple time zones rapidly.",
  },
  // Sciences et technologie (5)
  {
    id: 16,
    theme: "sciences-technologie",
    question: "What does AI stand for?",
    options: [
      "Automatic Internet",
      "Artificial Intelligence",
      "Advanced Information",
      "Applied Innovation",
    ],
    reponse: "Artificial Intelligence",
    explication:
      "AI = Artificial Intelligence. Used in voice assistants, self-driving cars and medical diagnosis.",
  },
  {
    id: 17,
    theme: "sciences-technologie",
    question: "What does 'download' mean?",
    options: [
      "To send a file to someone",
      "To transfer data from the internet to your device",
      "To delete a file",
      "To print a document",
    ],
    reponse: "To transfer data from the internet to your device",
    explication:
      "Download = telecharger. Upload = mettre en ligne. Down = internet to you. Up = you to internet.",
  },
  {
    id: 18,
    theme: "sciences-technologie",
    question: "What is a renewable energy source?",
    options: ["Coal", "Oil", "Solar energy", "Natural gas"],
    reponse: "Solar energy",
    explication:
      "Solar energy = renewable (from the sun). Coal, oil, gas = fossil fuels = non-renewable.",
  },
  {
    id: 19,
    theme: "sciences-technologie",
    question: "What is a computer virus?",
    options: [
      "A biological disease",
      "A malicious program that damages computer systems",
      "A slow connection",
      "A software update",
    ],
    reponse: "A malicious program that damages computer systems",
    explication:
      "Computer virus = malware. Install antivirus software to protect your computer.",
  },
  {
    id: 20,
    theme: "sciences-technologie",
    question: "What is social media?",
    options: [
      "Traditional newspapers",
      "Online platforms for sharing content and connecting with others",
      "Television programmes",
      "Radio broadcasts",
    ],
    reponse: "Online platforms for sharing content and connecting with others",
    explication:
      "Social media = Instagram, TikTok, X etc. Platforms to share content and connect.",
  },
];

const themeLabels: Record<string, string> = {
  "present-perfect": "Present Perfect",
  "voix-passive": "Passive Voice",
  "voyages-culture": "Travel and Culture",
  "sciences-technologie": "Science and Tech",
};
const themeColors: Record<string, string> = {
  "present-perfect": "#4f8ef7",
  "voix-passive": "#2ec4b6",
  "voyages-culture": "#ffd166",
  "sciences-technologie": "#ff6b6b",
};

export default function BilanAnglais4eme() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "present-perfect": 0,
    "voix-passive": 0,
    "voyages-culture": 0,
    "sciences-technologie": 0,
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
        setBestScore(await getBestScore("4eme", "anglais", "bilan"));
        setLastScore(await getLastScore("4eme", "anglais", "bilan"));
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
          theme: "bilan",
          score: scoreRef.current,
          total: 20,
        });
        setBestScore(await getBestScore("4eme", "anglais", "bilan"));
        setLastScore(await getLastScore("4eme", "anglais", "bilan"));
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
      "present-perfect": 0,
      "voix-passive": 0,
      "voyages-culture": 0,
      "sciences-technologie": 0,
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
          <span className="breadcrumb-active">Bilan</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">Bilan Anglais 4eme</div>
          <h1 className="lecon-titre">English Test — 4eme Part 1</h1>
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
            This test covers the 4 topics of English 4eme — Part 1.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>⏰</span>
              <span>5 questions — Present Perfect</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>🔄</span>
              <span>5 questions — Passive Voice</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>✈️</span>
              <span>5 questions — Travel and Culture</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>🔬</span>
              <span>5 questions — Science and Tech</span>
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
              ? "Amazing! You've mastered English 4eme Part 1!"
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
              onClick={() => router.push("/cours/college/4eme/anglais")}
            >
              Back to topics
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
