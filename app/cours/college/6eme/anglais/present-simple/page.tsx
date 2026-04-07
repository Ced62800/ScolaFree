"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "anglais";
const THEME = "present-simple";

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
    question: "Complete: 'He ___ to school every day.' (go)",
    options: ["go", "goes", "is going", "gone"],
    answer: "goes",
    fiche: {
      regle:
        "Présent simple he/she/it : verbe + s. Go → goes (irrégulier : go + es).",
      exemple: "✅ He goes to school. / She watches TV. / It rains a lot.",
      piege:
        "Go → goes (pas gos). Watch → watches. Miss → misses. -s/-es selon le verbe.",
      astuce:
        "He/She/It + verbe + S. Go→goes, Watch→watches, Have→has, Do→does !",
    },
  },
  {
    question: "How do you make this negative: 'She likes chocolate.'",
    options: [
      "She not likes chocolate.",
      "She doesn't like chocolate.",
      "She don't like chocolate.",
      "She isn't like chocolate.",
    ],
    answer: "She doesn't like chocolate.",
    fiche: {
      regle:
        "Négation présent simple : he/she/it → doesn't + verbe (base). Le -s disparaît !",
      exemple: "✅ She doesn't like chocolate. / He doesn't play football.",
      piege:
        "She doesn't likE (pas likes). Après doesn't → verbe à la BASE (sans -s).",
      astuce:
        "DOESN'T + verbe BASE. She doesn't LIKE (pas likes). Le -s passe sur doesn't !",
    },
  },
  {
    question: "How do you make this a question: 'They play tennis.'",
    options: [
      "They do play tennis?",
      "Do they play tennis?",
      "Does they play tennis?",
      "Play they tennis?",
    ],
    answer: "Do they play tennis?",
    fiche: {
      regle:
        "Question présent simple : Do/Does + sujet + verbe BASE ? I/you/we/they → Do. He/she/it → Does.",
      exemple: "✅ Do they play tennis? / Does she like music?",
      piege: "They → DO (pas Does). Does = seulement pour he/she/it.",
      astuce:
        "I/You/We/They → DO. He/She/It → DOES. Pour les questions ET négations !",
    },
  },
  {
    question: "Complete: 'Does she ___ English?' (speak)",
    options: ["speaks", "speak", "speaking", "to speak"],
    answer: "speak",
    fiche: {
      regle: "Après does/doesn't → verbe BASE (sans -s, sans -ing, sans 'to').",
      exemple: "✅ Does she speak English? / Does he play football?",
      piege:
        "Does she SPEAKS → FAUX. Does she SPEAK → CORRECT. Base après does !",
      astuce:
        "DOES + BASE. Does she SPEAK (pas speaks). Le -s est déjà dans DOES !",
    },
  },
  {
    question: "Which sentence is correct?",
    options: [
      "I works every day.",
      "She don't like cats.",
      "Do you speak French?",
      "He play football on Sundays.",
    ],
    answer: "Do you speak French?",
    fiche: {
      regle:
        "Révision : I work (pas works), She doesn't like, Do you speak?, He plays.",
      exemple: "✅ Do you speak French? ❌ I works / She don't / He play.",
      piege:
        "Vérifier chaque phrase : I/you/we/they → base. He/she/it → base+s ou does/doesn't.",
      astuce:
        "I work, you work, he workS. I don't, he doesn't. Do I? Does he? La logique !",
    },
  },
  {
    question: "How do you say 'Est-ce qu'il parle anglais ?' in English?",
    options: [
      "Is he speak English?",
      "Does he speak English?",
      "Do he speaks English?",
      "He does speak English?",
    ],
    answer: "Does he speak English?",
    fiche: {
      regle: "Question avec he/she/it : Does + sujet + verbe BASE ?",
      exemple: "✅ Does he speak English? / Does she play tennis?",
      piege: "Does he SPEAK (pas speaks). Base après Does !",
      astuce:
        "He → DOES pour les questions. Does he SPEAK? Simple et logique !",
    },
  },
  {
    question: "Complete: 'My sister ___ not ___ basketball.' (play)",
    options: ["do / play", "does / play", "is / playing", "does / plays"],
    answer: "does / play",
    fiche: {
      regle: "My sister = she → does not (doesn't). Verbe base après doesn't.",
      exemple:
        "✅ My sister does not play basketball. / She doesn't play basketball.",
      piege:
        "Sister = she → DOES not play. Pas DO not. Et verbe BASE (play, pas plays).",
      astuce:
        "Does not = doesn't. My sister (=she) DOES NOT PLAY. Base après does not !",
    },
  },
  {
    question: "What does 'She usually gets up early' mean?",
    options: [
      "Elle se lève tôt en ce moment.",
      "Elle se lève tôt d'habitude.",
      "Elle s'est levée tôt hier.",
      "Elle devrait se lever tôt.",
    ],
    answer: "Elle se lève tôt d'habitude.",
    fiche: {
      regle:
        "Usually = d'habitude. Avec le présent simple pour les habitudes et routines.",
      exemple:
        "✅ She usually gets up at 7. / I always have breakfast. / He never watches TV.",
      piege:
        "Usually indique une habitude au présent simple (pas une action en cours).",
      astuce:
        "Always / usually / often / sometimes / never = adverbes de fréquence + présent simple !",
    },
  },
  {
    question: "How do you say 'Je ne mange jamais de viande' in English?",
    options: [
      "I don't never eat meat.",
      "I never eat meat.",
      "I eat never meat.",
      "Never I eat meat.",
    ],
    answer: "I never eat meat.",
    fiche: {
      regle: "Never + verbe BASE = ne jamais. Pas besoin de don't avec never.",
      exemple:
        "✅ I never eat meat. / She never watches TV. / He never plays sport.",
      piege:
        "Ne pas doubler la négation : I don't never → FAUX. I never → CORRECT.",
      astuce:
        "NEVER + verbe = jamais. Pas de don't avec never. I NEVER eat meat !",
    },
  },
  {
    question: "Complete: '___ your parents ___ French?' (speak)",
    options: ["Does / speaks", "Do / speak", "Are / speak", "Do / speaks"],
    answer: "Do / speak",
    fiche: {
      regle: "Your parents = they → Do. Verbe BASE après Do.",
      exemple: "✅ Do your parents speak French? / Do they live in Paris?",
      piege:
        "Parents = ils/elles → DO (pas Does). Et verbe BASE (speak, pas speaks).",
      astuce:
        "They/You/We/I → DO. He/She/It → DOES. Parents = ils → DO speak !",
    },
  },
];

export default function PresentSimplePage() {
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
  const boutonBloque =
    fautesRef.current >= 6 && !ficheObligatoireLue && estCorrecte === false;

  if (etape === "intro")
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">🇬🇧 Anglais — 6ème</div>
          <h1 className="lecon-titre">Le présent simple</h1>
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
            Maîtrise le <strong>présent simple</strong> en anglais : affirmatif,
            négatif, questions. La base de toute communication !
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
              <div className="lecon-point-titre">✅ Affirmatif</div>
              <div className="lecon-point-texte">
                I/you/we/they + verbe BASE. He/she/it + verbe + S.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> I play. She
                plays. They go. He goes.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">❌ Négatif</div>
              <div className="lecon-point-texte">
                I/you/we/they → don't + BASE. He/she/it → doesn't + BASE.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> I don't play.
                She doesn't play.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">❓ Questions</div>
              <div className="lecon-point-texte">
                Do + I/you/we/they + BASE ? Does + he/she/it + BASE ?
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Do you play?
                Does she play?
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
                {!estCorrecte &&
                  fautesRef.current >= 6 &&
                  !ficheObligatoireLue && (
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
