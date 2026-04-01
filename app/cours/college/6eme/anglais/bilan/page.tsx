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
      "Emma is my name I.",
      "Name is Emma my.",
    ],
    reponse: "My name is Emma.",
    explication: "My name is + prénom. Ou I'm Emma.",
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
    explication: "I am + chiffre + years old. Jamais 'I have'.",
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

const THEMES = [
  { id: "se-presenter", label: "Se présenter", color: "#4f8ef7" },
  { id: "famille-animaux", label: "Famille & animaux", color: "#2ec4b6" },
  { id: "maison-ecole", label: "Maison & école", color: "#ffd166" },
  {
    id: "activites-quotidiennes",
    label: "Activités quotidiennes",
    color: "#ff6b6b",
  },
];

const CLASSE = "6eme";
const MATIERE = "anglais";
const THEME = "bilan";

export default function BilanAnglais6eme() {
  const router = useRouter();
  const [questionsActives, setQuestionsActives] = useState<typeof questions>(
    [],
  );
  const [etape, setEtape] = useState<"intro" | "qcm" | "resultat">("intro");
  const [index, setIndex] = useState(0);
  const [reponseChoisie, setReponseChoisie] = useState<string | null>(null);
  const [estConnecte, setEstConnecte] = useState(false);
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
  const scoresParTheme = useRef<Record<string, number>>({});
  const totauxParTheme = useRef<Record<string, number>>({});

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEstConnecte(!!user);
      if (user) {
        getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
        getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
      }
    };
    init();
  }, []);

  const demarrer = () => {
    const q = shuffleArray(questions);
    setQuestionsActives(q);
    scoreRef.current = 0;
    scoreSaved.current = false;
    scoresParTheme.current = {};
    totauxParTheme.current = {};
    THEMES.forEach((t) => {
      scoresParTheme.current[t.id] = 0;
      totauxParTheme.current[t.id] = 0;
    });
    setIndex(0);
    setReponseChoisie(null);
    setEtape("qcm");
  };

  const choisirReponse = (option: string) => {
    if (reponseChoisie) return;
    setReponseChoisie(option);
    const q = questionsActives[index];
    const correct = option === q.reponse;
    totauxParTheme.current[q.theme] =
      (totauxParTheme.current[q.theme] || 0) + 1;
    if (correct) {
      scoreRef.current += 1;
      scoresParTheme.current[q.theme] =
        (scoresParTheme.current[q.theme] || 0) + 1;
    }
  };

  const suivant = async () => {
    if (index + 1 >= questionsActives.length) {
      if (estConnecte && !scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score: scoreRef.current,
          total: questionsActives.length,
        });
        getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
        getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
      }
      setEtape("resultat");
    } else {
      setIndex(index + 1);
      setReponseChoisie(null);
    }
  };

  const q = questionsActives[index];
  const shuffledOptions = useMemo(
    () => (q ? shuffleArray(q.options) : []),
    [index, questionsActives],
  );
  const total = questionsActives.length;
  const pourcentage =
    total > 0 ? Math.round((scoreRef.current / total) * 100) : 0;

  if (etape === "intro")
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button
            className="cours-back"
            onClick={() => router.push("/cours/college/6eme/anglais")}
          >
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · Anglais 6ème</div>
          <h1 className="lecon-titre">Bilan Anglais 6ème</h1>
          <p className="lecon-intro">
            20 questions sur les 4 thèmes du programme : Se présenter, Famille &
            animaux, Maison & école, Activités quotidiennes.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            {THEMES.map((t) => (
              <div
                key={t.id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${t.color}44`,
                  borderRadius: "12px",
                  padding: "14px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: t.color,
                    fontWeight: 700,
                    fontSize: "0.9rem",
                  }}
                >
                  {t.label}
                </div>
                <div
                  style={{
                    color: "#aaa",
                    fontSize: "0.8rem",
                    marginTop: "4px",
                  }}
                >
                  5 questions
                </div>
              </div>
            ))}
          </div>

          {estConnecte && (bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
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
                    🏆 Meilleur
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
                    🕐 Dernier
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

          {!estConnecte && (
            <div
              style={{
                background: "rgba(255,107,107,0.1)",
                border: "1px solid rgba(255,107,107,0.3)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
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
                🔒 Connecte-toi pour sauvegarder ton score !
              </p>
              <button
                onClick={() => router.push("/connexion")}
                style={{
                  background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Se connecter →
              </button>
            </div>
          )}

          <button className="lecon-btn" onClick={demarrer}>
            🚀 Commencer le bilan →
          </button>
        </div>
      </div>
    );

  if (etape === "qcm" && q)
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button
            className="cours-back"
            onClick={() => router.push("/cours/college/6eme/anglais")}
          >
            ← Retour
          </button>
        </div>
        <div className="progression-wrapper">
          <div className="progression-info">
            <span>
              Question {index + 1} / {total}
            </span>
            <span>
              {scoreRef.current} bonne{scoreRef.current > 1 ? "s" : ""}
            </span>
          </div>
          <div className="progression-bar">
            <div
              className="progression-fill"
              style={{ width: `${(index / total) * 100}%` }}
            />
          </div>
        </div>
        <div className="qcm-wrapper">
          <div
            style={{
              fontSize: "0.8rem",
              color: THEMES.find((t) => t.id === q.theme)?.color || "#aaa",
              fontWeight: 700,
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            {THEMES.find((t) => t.id === q.theme)?.label}
          </div>
          <div className="qcm-question">{q.question}</div>
          <div className="qcm-options">
            {shuffledOptions.map((opt) => {
              let cn = "qcm-option";
              if (reponseChoisie) {
                if (opt === q.reponse) cn += " correct";
                else if (opt === reponseChoisie) cn += " incorrect";
                else cn += " disabled";
              }
              return (
                <button
                  key={opt}
                  className={cn}
                  onClick={() => choisirReponse(opt)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {reponseChoisie && (
            <div
              className={`qcm-feedback ${reponseChoisie === q.reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <span className="feedback-icon">
                {reponseChoisie === q.reponse ? "✅" : "❌"}
              </span>
              <div className="feedback-texte">
                <strong>
                  {reponseChoisie === q.reponse
                    ? "Well done! 🎉"
                    : "Not quite..."}
                </strong>
                <p>{q.explication}</p>
              </div>
            </div>
          )}
          {reponseChoisie && (
            <button className="lecon-btn" onClick={suivant}>
              {index + 1 >= total
                ? "Voir mon résultat →"
                : "Question suivante →"}
            </button>
          )}
        </div>
      </div>
    );

  if (etape === "resultat") {
    const note = Math.round((scoreRef.current / total) * 20);
    const emoji = note >= 16 ? "🏆" : note >= 12 ? "👍" : "💪";
    const message =
      note >= 16 ? "Excellent!" : note >= 12 ? "Well done!" : "Keep trying!";
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button
            className="cours-back"
            onClick={() => router.push("/cours/college/6eme/anglais")}
          >
            ← Retour
          </button>
        </div>
        <div className="resultat-wrapper">
          <div className="resultat-icon">{emoji}</div>
          <h2 className="resultat-titre">{message}</h2>
          <div className="resultat-score">
            {scoreRef.current} / {total}
          </div>
          <div
            style={{
              fontSize: "1.1rem",
              color:
                note >= 16 ? "#2ec4b6" : note >= 10 ? "#ffd166" : "#ff6b6b",
              fontWeight: 800,
              marginBottom: "24px",
            }}
          >
            {note} / 20
          </div>

          <div
            style={{ width: "100%", maxWidth: "400px", margin: "0 auto 24px" }}
          >
            {THEMES.map((t) => {
              const s = scoresParTheme.current[t.id] || 0;
              const tot = totauxParTheme.current[t.id] || 5;
              const pct = Math.round((s / tot) * 100);
              return (
                <div key={t.id} style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", color: "#ddd" }}>
                      {t.label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: t.color,
                        fontWeight: 700,
                      }}
                    >
                      {s}/{tot}
                    </span>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: "10px",
                      height: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: t.color,
                        borderRadius: "10px",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {estConnecte && (bestScore || lastScore) && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "24px",
                width: "100%",
                maxWidth: "400px",
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
                    🏆 Meilleur
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
                    🕐 Dernier
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
            <button
              className="lecon-btn-outline"
              onClick={() => router.push("/cours/college/6eme/anglais")}
            >
              ← Retour aux thèmes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
