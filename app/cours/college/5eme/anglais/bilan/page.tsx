"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Past Simple (5)
  {
    id: 1,
    theme: "passe-compose",
    question: "What is the Past Simple of 'go'?",
    options: ["goed", "went", "gone", "going"],
    reponse: "went",
    explication:
      "Go is irregular. Past Simple = went. I went, she went, they went.",
  },
  {
    id: 2,
    theme: "passe-compose",
    question: "How do you make the Past Simple negative?",
    options: [
      "didn't + verb-ed",
      "didn't + verb (base)",
      "not + verb-ed",
      "wasn't + verb",
    ],
    reponse: "didn't + verb (base)",
    explication:
      "Negative: didn't + BASE. 'I didn't go' (not 'I didn't went').",
  },
  {
    id: 3,
    theme: "passe-compose",
    question: "Past Simple of 'study' (regular)?",
    options: ["studyed", "studied", "study", "studed"],
    reponse: "studied",
    explication:
      "Consonant + Y → -IED. Study → studied. Try → tried. Carry → carried.",
  },
  {
    id: 4,
    theme: "passe-compose",
    question: "Which time expression goes with Past Simple?",
    options: ["now", "yesterday", "since", "tomorrow"],
    reponse: "yesterday",
    explication:
      "Past Simple uses: yesterday, last week, ago, in 2020. Since → Present Perfect.",
  },
  {
    id: 5,
    theme: "passe-compose",
    question: "Past Simple of 'be' for 'I/he/she/it'?",
    options: ["were", "was", "been", "is"],
    reponse: "was",
    explication: "I/he/she/it → WAS. You/we/they → WERE. Two different forms!",
  },
  // Description physique (5)
  {
    id: 6,
    theme: "description-physique",
    question: "How do you say 'Elle a les cheveux bouclés'?",
    options: [
      "She is curly hair.",
      "She has curly hair.",
      "Her hairs are curly.",
      "She have curly hair.",
    ],
    reponse: "She has curly hair.",
    explication:
      "She HAS + adj + hair. Hair is singular (no 's'). She has curly hair.",
  },
  {
    id: 7,
    theme: "description-physique",
    question: "What does 'outgoing' mean?",
    options: ["timide", "méchant", "extraverti", "paresseux"],
    reponse: "extraverti",
    explication:
      "Outgoing = extraverti, sociable. Shy = timide. Opposite personalities!",
  },
  {
    id: 8,
    theme: "description-physique",
    question: "How do you say 'Il ressemble à son père'?",
    options: [
      "He sees like his father.",
      "He looks like his father.",
      "He resembles to his father.",
      "He is like his father.",
    ],
    reponse: "He looks like his father.",
    explication:
      "LOOK LIKE = ressembler à. No preposition 'to'. He looks like his dad.",
  },
  {
    id: 9,
    theme: "description-physique",
    question: "What does 'slim' mean?",
    options: ["grand", "gros", "mince", "fort"],
    reponse: "mince",
    explication:
      "Slim = mince. Tall = grand. Short = petit. Fat/overweight = gros.",
  },
  {
    id: 10,
    theme: "description-physique",
    question: "How do you say 'Il porte des lunettes'?",
    options: [
      "He carries glasses.",
      "He wears glasses.",
      "He has glasses.",
      "Both b and c.",
    ],
    reponse: "Both b and c.",
    explication:
      "WEAR glasses = porter des lunettes. He wears glasses OR he has glasses on. Both correct.",
  },
  // Environnement (5)
  {
    id: 11,
    theme: "environnement",
    question: "What does 'global warming' mean?",
    options: [
      "la pollution",
      "le réchauffement climatique",
      "la déforestation",
      "les inondations",
    ],
    reponse: "le réchauffement climatique",
    explication:
      "Global warming = réchauffement climatique. Warming = réchauffement. Global = mondial.",
  },
  {
    id: 12,
    theme: "environnement",
    question: "What are the 3Rs?",
    options: [
      "Read, Run, Rest",
      "Reduce, Reuse, Recycle",
      "Repair, Rebuild, Renew",
      "Rest, Relax, Recover",
    ],
    reponse: "Reduce, Reuse, Recycle",
    explication:
      "The 3Rs: Reduce (réduire), Reuse (réutiliser), Recycle (recycler). Priority order!",
  },
  {
    id: 13,
    theme: "environnement",
    question: "What does 'drought' mean?",
    options: ["inondation", "tempête", "sécheresse", "tremblement de terre"],
    reponse: "sécheresse",
    explication:
      "Drought = sécheresse (pas d'eau). Flood = inondation (trop d'eau). Opposites!",
  },
  {
    id: 14,
    theme: "environnement",
    question: "Complete: 'We ___ protect the environment.' (obligation)",
    options: ["can", "must", "might", "would"],
    reponse: "must",
    explication:
      "Must = strong obligation. Should = advice. We MUST protect = it's essential.",
  },
  {
    id: 15,
    theme: "environnement",
    question: "What is 'carbon footprint'?",
    options: [
      "l'empreinte carbone",
      "la pollution de l'air",
      "le trou dans la couche d'ozone",
      "les gaz à effet de serre",
    ],
    reponse: "l'empreinte carbone",
    explication:
      "Carbon footprint = empreinte carbone. The CO2 we produce with our activities.",
  },
  // Médias & technologie (5)
  {
    id: 16,
    theme: "medias-technologie",
    question: "What does 'to surf the web' mean?",
    options: [
      "faire du surf",
      "naviguer sur Internet",
      "télécharger des fichiers",
      "envoyer des emails",
    ],
    reponse: "naviguer sur Internet",
    explication:
      "Surf the web = naviguer sur Internet. Browse = parcourir. Download = télécharger.",
  },
  {
    id: 17,
    theme: "medias-technologie",
    question: "What is 'cyberbullying'?",
    options: [
      "la cybersécurité",
      "le cyberharcèlement",
      "la cyberaddiction",
      "le cybercrime",
    ],
    reponse: "le cyberharcèlement",
    explication:
      "Cyberbullying = cyberharcèlement. Bully = harceleur. Online harassment.",
  },
  {
    id: 18,
    theme: "medias-technologie",
    question: "How do you say 'Je poste des photos'?",
    options: [
      "I put photos.",
      "I post photos on Instagram.",
      "I send photos to Instagram.",
      "I share photos at Instagram.",
    ],
    reponse: "I post photos on Instagram.",
    explication:
      "POST on Instagram/social media. ON social media (not to or at).",
  },
  {
    id: 19,
    theme: "medias-technologie",
    question: "What does 'to go viral' mean?",
    options: [
      "avoir un virus",
      "se propager rapidement sur Internet",
      "supprimer un fichier",
      "pirater un compte",
    ],
    reponse: "se propager rapidement sur Internet",
    explication:
      "Go viral = devenir viral = spread very fast on social media. Like a virus!",
  },
  {
    id: 20,
    theme: "medias-technologie",
    question: "What is 'fake news'?",
    options: [
      "nouvelles récentes",
      "vraies nouvelles",
      "fausses informations",
      "nouvelles importantes",
    ],
    reponse: "fausses informations",
    explication:
      "Fake news = fausses informations. Fake = faux. Always check reliable sources!",
  },
];

const themeLabels: Record<string, string> = {
  "passe-compose": "⏮️ Past Simple",
  "description-physique": "👤 Description physique",
  environnement: "🌍 Environnement",
  "medias-technologie": "📱 Médias & techno",
};
const themeColors: Record<string, string> = {
  "passe-compose": "#4f8ef7",
  "description-physique": "#2ec4b6",
  environnement: "#ffd166",
  "medias-technologie": "#ff6b6b",
};

export default function BilanAnglais5eme() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "passe-compose": 0,
    "description-physique": 0,
    environnement: 0,
    "medias-technologie": 0,
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
        setBestScore(await getBestScore("5eme", "anglais", "bilan"));
        setLastScore(await getLastScore("5eme", "anglais", "bilan"));
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
          classe: "5eme",
          matiere: "anglais",
          theme: "bilan",
          score: scoreRef.current,
          total: 20,
        });
        setBestScore(await getBestScore("5eme", "anglais", "bilan"));
        setLastScore(await getLastScore("5eme", "anglais", "bilan"));
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
      "passe-compose": 0,
      "description-physique": 0,
      environnement: 0,
      "medias-technologie": 0,
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
            ← Retour
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
            Bilan réservé aux inscrits
          </h2>
          <p style={{ color: "#aaa", marginBottom: "24px" }}>
            Inscris-toi gratuitement pour accéder au bilan !
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
            ✨ S'inscrire gratuitement →
          </button>
        </div>
      </div>
    );

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button className="cours-back" onClick={() => router.back()}>
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span
            onClick={() => router.push("/cours/college/5eme/anglais")}
            style={{ cursor: "pointer" }}
          >
            Anglais 5ème
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan · Anglais 5ème</div>
          <h1 className="lecon-titre">Bilan — Anglais 5ème</h1>
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
                    🏆 Record
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
                    🕒 Dernier
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="lecon-intro">
            Ce bilan regroupe les 4 thèmes d'Anglais 5ème — Partie 1.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>⏮️</span>
              <span>5 questions — Past Simple</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>👤</span>
              <span>5 questions — Description physique</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>🌍</span>
              <span>5 questions — Environnement</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>📱</span>
              <span>5 questions — Médias & techno</span>
            </div>
          </div>
          <div className="bilan-score-info">
            Score final sur <strong>20</strong>
          </div>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Start the test →
          </button>
        </div>
      )}

      {etape === "qcm" && (
        <>
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
                      ? "Well done! 🎉"
                      : "Not quite..."}
                  </strong>
                  <p>{shuffledQuestions[qIndex].explication}</p>
                </div>
              </div>
            )}
            {selected && (
              <button className="lecon-btn" onClick={handleSuivant}>
                {qIndex + 1 >= shuffledQuestions.length
                  ? "See my results →"
                  : "Next question →"}
              </button>
            )}
          </div>
        </>
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
                    🏆 Best
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
                    🕒 Last
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
            {Object.entries(scores).map(([theme, score]) => (
              <div key={theme} className="bilan-detail-row">
                <span className="bilan-detail-label">{themeLabels[theme]}</span>
                <div className="bilan-detail-bar-wrapper">
                  <div
                    className="bilan-detail-bar"
                    style={{
                      width: `${(score / 5) * 100}%`,
                      backgroundColor: themeColors[theme],
                    }}
                  ></div>
                </div>
                <span className="bilan-detail-score">{score}/5</span>
              </div>
            ))}
          </div>
          <p className="resultat-desc">
            {totalScore >= 18
              ? "Amazing work! You've mastered English 5ème Part 1! 🚀"
              : totalScore >= 14
                ? "Great score, keep it up!"
                : totalScore >= 10
                  ? "Good progress!"
                  : "Keep practising, you'll get there!"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Try again
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/college/5eme/anglais")}
            >
              Back to topics →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
