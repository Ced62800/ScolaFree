"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Se présenter (5)
  {
    id: 1,
    theme: "se-presenter",
    question: "How do you say 'Je m'appelle Emma' in English?",
    options: [
      "My name is Emma.",
      "I am Emma name.",
      "Emma is my name.",
      "Name is Emma my.",
    ],
    reponse: "My name is Emma.",
    explication: "My name is + prénom. On peut aussi dire I'm Emma.",
  },
  {
    id: 2,
    theme: "se-presenter",
    question: "How do you ask someone's age?",
    options: [
      "How old are you?",
      "What age you have?",
      "How many years?",
      "How years old?",
    ],
    reponse: "How old are you?",
    explication: "How old are you? = Quel âge as-tu ?",
  },
  {
    id: 3,
    theme: "se-presenter",
    question: "How do you say 'J'ai 12 ans' in English?",
    options: [
      "I have 12 years.",
      "I am 12 years old.",
      "I am 12 year.",
      "My age is 12 years.",
    ],
    reponse: "I am 12 years old.",
    explication: "I am + chiffre + years old. Jamais 'I have' pour l'âge.",
  },
  {
    id: 4,
    theme: "se-presenter",
    question: "How do you say 'J'habite à Bordeaux' in English?",
    options: [
      "I live in Bordeaux.",
      "I live at Bordeaux.",
      "I am in Bordeaux.",
      "I stay to Bordeaux.",
    ],
    reponse: "I live in Bordeaux.",
    explication: "I live in + ville. Toujours IN pour les villes.",
  },
  {
    id: 5,
    theme: "se-presenter",
    question: "What do you say when you meet someone for the first time?",
    options: [
      "How are you?",
      "Nice to meet you!",
      "See you later!",
      "Good morning!",
    ],
    reponse: "Nice to meet you!",
    explication: "Nice to meet you! = Enchanté de te rencontrer.",
  },
  // Famille et animaux (5)
  {
    id: 6,
    theme: "famille-animaux",
    question: "What is 'la sœur' in English?",
    options: ["brother", "mother", "sister", "daughter"],
    reponse: "sister",
    explication: "Sister = la sœur. Brother = le frère.",
  },
  {
    id: 7,
    theme: "famille-animaux",
    question: "How do you say 'un chien' in English?",
    options: ["cat", "dog", "bird", "fish"],
    reponse: "dog",
    explication: "Dog = un chien. Cat = un chat.",
  },
  {
    id: 8,
    theme: "famille-animaux",
    question: "What is 'les grands-parents' in English?",
    options: ["parents", "grandparents", "cousins", "uncles"],
    reponse: "grandparents",
    explication: "Grandparents = les grands-parents.",
  },
  {
    id: 9,
    theme: "famille-animaux",
    question: "How do you say 'J'ai un lapin' in English?",
    options: [
      "I have a rabbit.",
      "I have a hamster.",
      "I have a guinea pig.",
      "I have a parrot.",
    ],
    reponse: "I have a rabbit.",
    explication: "Rabbit = lapin. I have a rabbit.",
  },
  {
    id: 10,
    theme: "famille-animaux",
    question: "What is 'le fils' in English?",
    options: ["father", "son", "uncle", "nephew"],
    reponse: "son",
    explication: "Son = le fils. Daughter = la fille.",
  },
  // Maison et école (5)
  {
    id: 11,
    theme: "maison-ecole",
    question: "What is 'la cuisine' in English?",
    options: ["living room", "bedroom", "kitchen", "bathroom"],
    reponse: "kitchen",
    explication: "Kitchen = la cuisine.",
  },
  {
    id: 12,
    theme: "maison-ecole",
    question: "How do you say 'les mathématiques' in English?",
    options: ["Science", "History", "Maths", "Geography"],
    reponse: "Maths",
    explication: "Maths (UK) / Math (US) = les mathématiques.",
  },
  {
    id: 13,
    theme: "maison-ecole",
    question: "What is 'la salle de bain' in English?",
    options: ["kitchen", "bedroom", "bathroom", "living room"],
    reponse: "bathroom",
    explication: "Bathroom = la salle de bain.",
  },
  {
    id: 14,
    theme: "maison-ecole",
    question: "How do you say 'la bibliothèque' in English?",
    options: ["canteen", "gym", "library", "classroom"],
    reponse: "library",
    explication: "Library = la bibliothèque.",
  },
  {
    id: 15,
    theme: "maison-ecole",
    question: "What is 'la chambre' in English?",
    options: ["living room", "bedroom", "kitchen", "garden"],
    reponse: "bedroom",
    explication: "Bedroom = la chambre.",
  },
  // Activités quotidiennes (5)
  {
    id: 16,
    theme: "activites-quotidiennes",
    question: "How do you say 'Je me lève à 7h' in English?",
    options: [
      "I wake up at 7.",
      "I go to bed at 7.",
      "I eat at 7.",
      "I leave at 7.",
    ],
    reponse: "I wake up at 7.",
    explication: "Wake up = se lever/se réveiller.",
  },
  {
    id: 17,
    theme: "activites-quotidiennes",
    question: "How do you say 'J'aime jouer au foot' in English?",
    options: [
      "I like playing football.",
      "I like to play the football.",
      "I love the football play.",
      "I enjoy football play.",
    ],
    reponse: "I like playing football.",
    explication: "I like playing + sport. Pas d'article devant football.",
  },
  {
    id: 18,
    theme: "activites-quotidiennes",
    question: "What does 'I go to bed at 9pm' mean?",
    options: [
      "Je me lève à 21h.",
      "Je dîne à 21h.",
      "Je me couche à 21h.",
      "Je rentre à 21h.",
    ],
    reponse: "Je me couche à 21h.",
    explication: "Go to bed = se coucher. 9pm = 21h.",
  },
  {
    id: 19,
    theme: "activites-quotidiennes",
    question: "How do you say 'Je regarde la télévision' in English?",
    options: ["I listen to TV.", "I watch TV.", "I see TV.", "I look TV."],
    reponse: "I watch TV.",
    explication: "Watch TV = regarder la télévision.",
  },
  {
    id: 20,
    theme: "activites-quotidiennes",
    question: "What does 'I have breakfast at 7am' mean?",
    options: [
      "Je déjeune à 7h.",
      "Je dîne à 7h.",
      "Je prends mon petit-déjeuner à 7h.",
      "Je goûte à 7h.",
    ],
    reponse: "Je prends mon petit-déjeuner à 7h.",
    explication: "Breakfast = le petit-déjeuner.",
  },
];

const themeLabels: Record<string, string> = {
  "se-presenter": "👤 Se présenter",
  "famille-animaux": "👨‍👩‍👧 Famille & animaux",
  "maison-ecole": "🏠 Maison & école",
  "activites-quotidiennes": "📅 Activités quotidiennes",
};

const themeColors: Record<string, string> = {
  "se-presenter": "#4f8ef7",
  "famille-animaux": "#2ec4b6",
  "maison-ecole": "#ffd166",
  "activites-quotidiennes": "#ff6b6b",
};

export default function BilanAnglais6eme() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "se-presenter": 0,
    "famille-animaux": 0,
    "maison-ecole": 0,
    "activites-quotidiennes": 0,
  });
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEstConnecte(!!user);
      if (user) {
        const b = await getBestScore("6eme", "anglais", "bilan");
        const l = await getLastScore("6eme", "anglais", "bilan");
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
          theme: "bilan",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("6eme", "anglais", "bilan");
        const l = await getLastScore("6eme", "anglais", "bilan");
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
      "se-presenter": 0,
      "famille-animaux": 0,
      "maison-ecole": 0,
      "activites-quotidiennes": 0,
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
          <span className="breadcrumb-active">Bilan</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan · Anglais 6ème</div>
          <h1 className="lecon-titre">Bilan — Anglais 6ème</h1>
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
            Ce bilan regroupe les 4 thèmes d'Anglais 6ème.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>👤</span>
              <span>5 questions — Se présenter</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>👨‍👩‍👧</span>
              <span>5 questions — Famille & animaux</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>🏠</span>
              <span>5 questions — Maison & école</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>📅</span>
              <span>5 questions — Activités quotidiennes</span>
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
              ? "Bravo, tu maîtrises l'Anglais 6ème ! 🚀"
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
              onClick={() => router.push("/cours/college/6eme/anglais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
