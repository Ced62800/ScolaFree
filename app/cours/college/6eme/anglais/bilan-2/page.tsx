"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Loisirs et sports (5)
  {
    id: 1,
    theme: "loisirs-sports",
    question: "How do you say 'Je joue au tennis' in English?",
    options: [
      "I do tennis.",
      "I go tennis.",
      "I play tennis.",
      "I make tennis.",
    ],
    reponse: "I play tennis.",
    explication: "Play + sport avec ballon ou raquette. I play tennis.",
  },
  {
    id: 2,
    theme: "loisirs-sports",
    question: "How do you say 'Je fais de la natation' in English?",
    options: [
      "I play swimming.",
      "I do swimming.",
      "I go swimming.",
      "I make swimming.",
    ],
    reponse: "I go swimming.",
    explication: "Go + -ing pour les sports individuels. I go swimming.",
  },
  {
    id: 3,
    theme: "loisirs-sports",
    question: "Complete: 'She ___ gymnastics every week.'",
    options: ["plays", "goes", "does", "makes"],
    reponse: "does",
    explication: "Do + gymnastics/karate/yoga. She does gymnastics.",
  },
  {
    id: 4,
    theme: "loisirs-sports",
    question: "How do you say 'J'aime lire' in English?",
    options: [
      "I like read.",
      "I like reading.",
      "I like to reading.",
      "I love the reading.",
    ],
    reponse: "I like reading.",
    explication: "Like/love/enjoy + -ing. I like reading.",
  },
  {
    id: 5,
    theme: "loisirs-sports",
    question: "What does 'free time' mean?",
    options: [
      "le temps gratuit",
      "le temps libre",
      "les vacances",
      "le week-end",
    ],
    reponse: "le temps libre",
    explication:
      "Free time = le temps libre. In my free time = pendant mon temps libre.",
  },
  // Nourriture et shopping (5)
  {
    id: 6,
    theme: "nourriture-shopping",
    question: "How do you say 'du lait' in English?",
    options: ["a milk", "some milk", "the milk", "milks"],
    reponse: "some milk",
    explication:
      "Milk est indénombrable. On utilise 'some'. Some milk = du lait.",
  },
  {
    id: 7,
    theme: "nourriture-shopping",
    question: "How do you ask the price?",
    options: [
      "How many is it?",
      "What is the cost?",
      "How much is it?",
      "What price is it?",
    ],
    reponse: "How much is it?",
    explication: "How much is it? = Combien ça coûte ?",
  },
  {
    id: 8,
    theme: "nourriture-shopping",
    question: "How do you say 'Je voudrais une orange' in English?",
    options: [
      "I want a orange.",
      "I would like an orange.",
      "I like an orange.",
      "I want an orange please.",
    ],
    reponse: "I would like an orange.",
    explication:
      "Would like = vouloir (poli). AN devant voyelle. I would like an orange.",
  },
  {
    id: 9,
    theme: "nourriture-shopping",
    question: "What does 'I'm hungry' mean?",
    options: ["J'ai soif.", "J'ai faim.", "Je suis fatigué.", "J'ai froid."],
    reponse: "J'ai faim.",
    explication: "I'm hungry = J'ai faim. I'm thirsty = J'ai soif.",
  },
  {
    id: 10,
    theme: "nourriture-shopping",
    question: "How do you say 'C'est trop cher' in English?",
    options: [
      "It's very expensive.",
      "It's too cheap.",
      "It's too expensive.",
      "It costs a lot.",
    ],
    reponse: "It's too expensive.",
    explication: "Too expensive = trop cher. Cheap = bon marché.",
  },
  // Présent simple (5)
  {
    id: 11,
    theme: "present-simple",
    question: "Complete: 'He ___ to school by bus.' (go)",
    options: ["go", "goes", "going", "is go"],
    reponse: "goes",
    explication: "He/she/it + verbe + s. He goes to school.",
  },
  {
    id: 12,
    theme: "present-simple",
    question: "How do you make 'She likes chocolate' negative?",
    options: [
      "She not likes chocolate.",
      "She doesn't like chocolate.",
      "She don't like chocolate.",
      "She isn't like chocolate.",
    ],
    reponse: "She doesn't like chocolate.",
    explication:
      "She/he/it → doesn't + verbe BASE. She doesn't like chocolate.",
  },
  {
    id: 13,
    theme: "present-simple",
    question: "Complete: 'Do they ___ French?' (speak)",
    options: ["speaks", "speak", "speaking", "to speak"],
    reponse: "speak",
    explication: "Après do/does → verbe BASE. Do they speak French?",
  },
  {
    id: 14,
    theme: "present-simple",
    question: "How do you say 'Je ne mange jamais de viande' in English?",
    options: [
      "I don't never eat meat.",
      "I never eat meat.",
      "I eat never meat.",
      "Never I eat meat.",
    ],
    reponse: "I never eat meat.",
    explication: "Never + verbe BASE. Pas besoin de don't avec never.",
  },
  {
    id: 15,
    theme: "present-simple",
    question: "Complete: '___ she play tennis?' (question)",
    options: ["Do", "Does", "Is", "Are"],
    reponse: "Does",
    explication: "She → Does pour les questions. Does she play tennis?",
  },
  // Ville et transports (5)
  {
    id: 16,
    theme: "ville-transports",
    question: "How do you say 'à pied' in English?",
    options: ["by foot", "with foot", "on foot", "in foot"],
    reponse: "on foot",
    explication: "On foot = à pied. Exception au 'by + transport'.",
  },
  {
    id: 17,
    theme: "ville-transports",
    question: "How do you say 'Tournez à droite' in English?",
    options: ["Turn left.", "Go straight on.", "Turn right.", "Go back."],
    reponse: "Turn right.",
    explication: "Turn right = tournez à droite. Turn left = tournez à gauche.",
  },
  {
    id: 18,
    theme: "ville-transports",
    question: "What is 'une pharmacie' in English?",
    options: ["a library", "a bakery", "a chemist's", "a butcher's"],
    reponse: "a chemist's",
    explication: "Chemist's = pharmacie. Library = bibliothèque (faux ami !).",
  },
  {
    id: 19,
    theme: "ville-transports",
    question: "How do you say 'C'est en face de la poste' in English?",
    options: [
      "It's next to the post office.",
      "It's opposite the post office.",
      "It's behind the post office.",
      "It's near the post office.",
    ],
    reponse: "It's opposite the post office.",
    explication: "Opposite = en face de. Next to = à côté de.",
  },
  {
    id: 20,
    theme: "ville-transports",
    question: "How do you say 'Je vais à l'école en bus' in English?",
    options: [
      "I go to school with bus.",
      "I go to school by bus.",
      "I go to school on bus.",
      "I take bus to school.",
    ],
    reponse: "I go to school by bus.",
    explication: "By + transport (sans article). I go to school by bus.",
  },
];

const themeLabels: Record<string, string> = {
  "loisirs-sports": "⚽ Loisirs & sports",
  "nourriture-shopping": "🛒 Nourriture & shopping",
  "present-simple": "📝 Présent simple",
  "ville-transports": "🏙️ Ville & transports",
};

const themeColors: Record<string, string> = {
  "loisirs-sports": "#4f8ef7",
  "nourriture-shopping": "#2ec4b6",
  "present-simple": "#ffd166",
  "ville-transports": "#ff6b6b",
};

export default function BilanAnglais6eme2() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "loisirs-sports": 0,
    "nourriture-shopping": 0,
    "present-simple": 0,
    "ville-transports": 0,
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
        const b = await getBestScore("6eme", "anglais", "bilan-2");
        const l = await getLastScore("6eme", "anglais", "bilan-2");
        setBestScore(b);
        setLastScore(l);
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
          classe: "6eme",
          matiere: "anglais",
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("6eme", "anglais", "bilan-2");
        const l = await getLastScore("6eme", "anglais", "bilan-2");
        setBestScore(b);
        setLastScore(l);
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
      "loisirs-sports": 0,
      "nourriture-shopping": 0,
      "present-simple": 0,
      "ville-transports": 0,
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

  if (!estConnecte) {
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
          <p style={{ color: "#aaa", marginBottom: "24px", lineHeight: "1.6" }}>
            Inscris-toi gratuitement pour accéder au bilan et sauvegarder tes
            scores !
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
  }

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button className="cours-back" onClick={() => router.back()}>
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span
            onClick={() => router.push("/cours/college/6eme/anglais")}
            style={{ cursor: "pointer" }}
          >
            Anglais 6ème
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Partie 2</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan · Anglais 6ème — Partie 2</div>
          <h1 className="lecon-titre">Bilan — Anglais 6ème Partie 2</h1>
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
            Ce bilan regroupe les 4 thèmes de la Partie 2 d'Anglais 6ème.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>⚽</span>
              <span>5 questions — Loisirs & sports</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>🛒</span>
              <span>5 questions — Nourriture & shopping</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>📝</span>
              <span>5 questions — Présent simple</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>🏙️</span>
              <span>5 questions — Ville & transports</span>
            </div>
          </div>
          <div className="bilan-score-info">
            Score final sur <strong>20</strong>
          </div>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Commencer le bilan →
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
                let className = "qcm-option";
                if (selected) {
                  if (opt === shuffledQuestions[qIndex].reponse)
                    className += " correct";
                  else if (opt === selected) className += " incorrect";
                  else className += " disabled";
                }
                return (
                  <button
                    key={opt}
                    className={className}
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
                  ? "Voir mon bilan →"
                  : "Question suivante →"}
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
                    🏆 Meilleur
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
          <div className="bilan-detail">
            <h3 className="bilan-detail-titre">Détail par thème</h3>
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
              ? "Bravo, tu maîtrises la Partie 2 d'Anglais 6ème ! 🚀"
              : totalScore >= 14
                ? "Très bon niveau, continue !"
                : totalScore >= 10
                  ? "Tu progresses bien !"
                  : "Courage ! Reprends les leçons et réessaie."}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/college/6eme/anglais/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
