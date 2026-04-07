"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "anglais";
const THEME = "maison-ecole";

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
    question: "What is a 'kitchen' in French?",
    options: ["une chambre", "une salle de bain", "une cuisine", "un salon"],
    answer: "une cuisine",
    fiche: {
      regle:
        "Les pièces de la maison : kitchen (cuisine), bedroom (chambre), bathroom (salle de bain), living room (salon).",
      exemple: "✅ I eat in the kitchen. / I sleep in my bedroom.",
      piege: "Ne pas confondre kitchen (cuisine) et bedroom (chambre).",
      astuce: "Kitchen = cuisine. Think of KITchen = cooking KIT !",
    },
  },
  {
    question: "How do you say 'une chambre' in English?",
    options: ["bathroom", "kitchen", "living room", "bedroom"],
    answer: "bedroom",
    fiche: {
      regle:
        "Bedroom = chambre. Bed = lit, Room = pièce. La pièce avec le lit !",
      exemple: "✅ My bedroom is upstairs. / I have my own bedroom.",
      piege: "Bedroom = chambre, pas bathroom (salle de bain).",
      astuce: "BEDroom = la pièce du BED (lit). Simple à retenir !",
    },
  },
  {
    question: "What subject is 'les mathématiques' in English?",
    options: ["History", "Maths", "Science", "Geography"],
    answer: "Maths",
    fiche: {
      regle:
        "Les matières scolaires : Maths, English, French, History, Geography, Science, PE (Physical Education).",
      exemple: "✅ I like Maths. / My favourite subject is English.",
      piege:
        "En anglais britannique on dit Maths (pas Math comme en américain).",
      astuce:
        "Maths = Maths ! Presque identique en français. Facile à retenir !",
    },
  },
  {
    question: "How do you say 'J'aime l'anglais' in English?",
    options: [
      "I like English.",
      "I like the English.",
      "English I like.",
      "I am liking English.",
    ],
    answer: "I like English.",
    fiche: {
      regle:
        "Pour les matières scolaires, pas d'article (pas de 'the'). I like English, pas 'I like the English'.",
      exemple: "✅ I like English. / She loves Maths. / He hates History.",
      piege: "Pas d'article 'the' devant les matières scolaires en général.",
      astuce: "I like + matière (sans 'the'). I like Maths. I love Science !",
    },
  },
  {
    question: "What is a 'pencil case' in French?",
    options: ["un cahier", "une trousse", "un cartable", "une règle"],
    answer: "une trousse",
    fiche: {
      regle:
        "Les fournitures scolaires : pencil case (trousse), notebook (cahier), schoolbag (cartable), ruler (règle).",
      exemple: "✅ My pencil case is blue. / I have a ruler in my pencil case.",
      piege: "Pencil case = trousse, pas cartable (schoolbag).",
      astuce:
        "Pencil = crayon, Case = étui. Pencil case = l'étui pour les crayons = trousse !",
    },
  },
  {
    question: "How do you say 'la salle de bain' in English?",
    options: ["bedroom", "living room", "kitchen", "bathroom"],
    answer: "bathroom",
    fiche: {
      regle: "Bathroom = salle de bain. Bath = bain, Room = pièce.",
      exemple:
        "✅ The bathroom is on the first floor. / I brush my teeth in the bathroom.",
      piege: "Bathroom = salle de bain, pas bedroom (chambre).",
      astuce:
        "BATHroom = la pièce du BATH (bain). Comme BEDroom = la pièce du BED !",
    },
  },
  {
    question: "What does 'upstairs' mean?",
    options: ["en bas", "à gauche", "en haut", "dehors"],
    answer: "en haut",
    fiche: {
      regle:
        "Upstairs = en haut (à l'étage). Downstairs = en bas (au rez-de-chaussée).",
      exemple: "✅ My bedroom is upstairs. / The kitchen is downstairs.",
      piege: "UP = vers le haut, DOWN = vers le bas. Stairs = escaliers.",
      astuce:
        "UPstairs = UP (haut) + stairs (escaliers). DOWNstairs = DOWN (bas) !",
    },
  },
  {
    question: "How do you say 'le salon' in English?",
    options: ["dining room", "bedroom", "living room", "bathroom"],
    answer: "living room",
    fiche: {
      regle:
        "Living room = salon (pièce de vie). Dining room = salle à manger.",
      exemple: "✅ We watch TV in the living room. / The living room is big.",
      piege: "Living room = salon, pas dining room (salle à manger).",
      astuce:
        "LIVING room = la pièce où on VIT (living = vivre). On y vit, on y regarde la TV !",
    },
  },
  {
    question: "What is 'PE' in French?",
    options: [
      "les arts plastiques",
      "l'éducation physique",
      "la physique",
      "l'anglais",
    ],
    answer: "l'éducation physique",
    fiche: {
      regle:
        "PE = Physical Education = EPS (Éducation Physique et Sportive). La gym à l'école !",
      exemple: "✅ I have PE on Monday. / I love PE because I like sport.",
      piege:
        "PE = Physical Education = EPS. Pas la physique-chimie (Physics) !",
      astuce: "PE = Physical Education = EPS. On fait du sport en PE !",
    },
  },
  {
    question: "How do you say 'Quelle est ta matière préférée ?' in English?",
    options: [
      "What is your favourite subject?",
      "What subject you like?",
      "Which is your favourite?",
      "What you study most?",
    ],
    answer: "What is your favourite subject?",
    fiche: {
      regle:
        "Pour demander la matière préférée : What is your favourite subject? (anglais britannique : favourite avec 'u').",
      exemple:
        "✅ What is your favourite subject? My favourite subject is English.",
      piege:
        "Favourite (britannique) vs Favorite (américain). À l'école française on utilise le britannique.",
      astuce:
        "Favourite subject = matière préférée. What is your favourite? = C'est quoi ta préférée ?",
    },
  },
];

export default function MaisonEcolePage() {
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
          <h1 className="lecon-titre">La maison et l'école</h1>
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
            Apprends le vocabulaire de la <strong>maison et de l'école</strong>{" "}
            en anglais. Les pièces, les matières scolaires et les fournitures !
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
              <div className="lecon-point-titre">
                🏠 Les pièces de la maison
              </div>
              <div className="lecon-point-texte">
                Kitchen (cuisine), bedroom (chambre), bathroom (salle de bain),
                living room (salon), dining room (salle à manger).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> My bedroom is
                upstairs. The kitchen is downstairs.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📚 Les matières scolaires</div>
              <div className="lecon-point-texte">
                Maths, English, French, History, Geography, Science, PE
                (Physical Education), Art.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> My favourite
                subject is Maths.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🎒 Les fournitures</div>
              <div className="lecon-point-texte">
                Pencil case (trousse), notebook (cahier), schoolbag (cartable),
                ruler (règle), pen (stylo).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> I have a pencil
                case in my schoolbag.
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
