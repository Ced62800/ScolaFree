"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "anglais";
const THEME = "nourriture-shopping";

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
    question: "How do you say 'du pain' in English?",
    options: ["a bread", "some bread", "the bread", "breads"],
    answer: "some bread",
    fiche: {
      regle:
        "Bread est indénombrable (uncountable). On utilise 'some' pour une quantité indéfinie.",
      exemple: "✅ some bread / some milk / some water / some rice",
      piege:
        "Pas d'article 'a' devant les noms indénombrables : pas 'a bread' !",
      astuce:
        "Indénombrable = on ne peut pas compter. Some bread, some milk, some water !",
    },
  },
  {
    question: "How do you say 'Je voudrais une pomme' in English?",
    options: [
      "I want apple.",
      "I would like an apple.",
      "I like an apple.",
      "I want a apple.",
    ],
    answer: "I would like an apple.",
    fiche: {
      regle:
        "Would like = vouloir (poli). I would like = Je voudrais. AN devant voyelle (a, e, i, o, u).",
      exemple: "✅ I would like an apple. / I'd like a sandwich please.",
      piege: "An (pas a) devant une voyelle : an apple, an orange, an egg.",
      astuce:
        "Would like = vouloir (poli). AN + voyelle. A + consonne. An apple, a banana !",
    },
  },
  {
    question: "How much does it cost? '£5.50' — How do you say this?",
    options: [
      "Five pounds fifty.",
      "Five and fifty pence.",
      "Five dot fifty pounds.",
      "Fifty five pounds.",
    ],
    answer: "Five pounds fifty.",
    fiche: {
      regle:
        "Les prix en anglais : pounds (livres sterling £) et pence (p). £5.50 = five pounds fifty.",
      exemple:
        "✅ £5.50 = five pounds fifty. / £3.99 = three pounds ninety-nine.",
      piege: "On dit five pounds fifty (pas 'five point fifty pounds').",
      astuce: "£ = pounds. p = pence. £5.50 = five pounds fifty. Simple !",
    },
  },
  {
    question: "How do you ask the price of something?",
    options: [
      "What is the cost?",
      "How much is it?",
      "What price?",
      "How many does it cost?",
    ],
    answer: "How much is it?",
    fiche: {
      regle:
        "How much is it? = Combien ça coûte ? How much does it cost? aussi correct.",
      exemple: "✅ How much is it? It's £3.50. / How much does this cost?",
      piege:
        "How much (pas how many) pour un prix. How many = pour des objets qu'on compte.",
      astuce:
        "How MUCH = pour l'argent et les indénombrables. How MANY = pour ce qu'on compte !",
    },
  },
  {
    question: "What does 'I'm hungry' mean?",
    options: ["J'ai soif.", "J'ai faim.", "Je suis fatigué.", "J'ai froid."],
    answer: "J'ai faim.",
    fiche: {
      regle:
        "I'm hungry = J'ai faim. I'm thirsty = J'ai soif. En anglais I AM (pas I have).",
      exemple:
        "✅ I'm hungry. Can I have a sandwich? / I'm thirsty. I'd like some water.",
      piege:
        "En français 'j'ai faim' (avoir), en anglais 'I AM hungry' (être). Différent !",
      astuce:
        "Hungry = faim. Thirsty = soif. I AM hungry/thirsty. Pas I HAVE !",
    },
  },
  {
    question: "How do you say 'des légumes' in English?",
    options: ["some vegetables", "some vegs", "some vegetable", "a vegetable"],
    answer: "some vegetables",
    fiche: {
      regle: "Vegetables = légumes (pluriel). Some vegetables = des légumes.",
      exemple: "✅ I eat some vegetables every day. / I like vegetables.",
      piege:
        "Vegetables (pluriel avec -s). Pas 'vegetable' seul pour dire 'des légumes'.",
      astuce:
        "Vegetable → Vegetables. Fruit → Fruits. Toujours pluriel pour 'des' !",
    },
  },
  {
    question: "In a shop: 'Can I help you?' — What is the correct reply?",
    options: [
      "Yes, I am looking for a blue shirt.",
      "Yes, I look for blue shirt.",
      "Yes, I search a blue shirt.",
      "Yes, I find a blue shirt.",
    ],
    answer: "Yes, I am looking for a blue shirt.",
    fiche: {
      regle:
        "Look for = chercher. I am looking for = je cherche (présent continu).",
      exemple:
        "✅ I am looking for a blue shirt. / I'm looking for the changing rooms.",
      piege:
        "Look for = chercher (pas 'search' seul, ni 'find'). Look for = phrasal verb.",
      astuce:
        "Look FOR = chercher. I'm looking for... = Je cherche... Dans un magasin !",
    },
  },
  {
    question: "How do you say 'C'est trop cher' in English?",
    options: [
      "It's too expensive.",
      "It's very expensive.",
      "It's too cheap.",
      "It costs too.",
    ],
    answer: "It's too expensive.",
    fiche: {
      regle:
        "Expensive = cher. Cheap = bon marché. Too = trop. It's too expensive = C'est trop cher.",
      exemple: "✅ It's too expensive. / This is cheap. / That's good value!",
      piege: "Too ≠ very. Too = excessif (trop). Very = très (pas excessif).",
      astuce:
        "Expensive = cher. Cheap = bon marché. Too expensive = trop cher !",
    },
  },
  {
    question: "How do you say 'Je prends le bus' in English?",
    options: [
      "I take the bus.",
      "I catch the bus.",
      "I go by bus.",
      "All answers are correct.",
    ],
    answer: "All answers are correct.",
    fiche: {
      regle:
        "Take the bus, catch the bus, go by bus sont tous corrects pour prendre le bus.",
      exemple:
        "✅ I take the bus to school. / I go to school by bus. / I catch the bus at 8.",
      piege:
        "Trois façons de dire la même chose. Go by bus (sans article), take/catch THE bus (avec article).",
      astuce:
        "Go BY bus/car/train (sans article). Take/catch THE bus (avec article) !",
    },
  },
  {
    question: "How do you say 'Avez-vous des pommes ?' in English?",
    options: [
      "Do you have any apples?",
      "Have you some apples?",
      "Do you have some apple?",
      "You have apples?",
    ],
    answer: "Do you have any apples?",
    fiche: {
      regle:
        "Dans les questions et négations, on utilise ANY (pas some). Do you have any + nom ?",
      exemple: "✅ Do you have any apples? / I don't have any money.",
      piege: "SOME = phrases affirmatives. ANY = questions et négations.",
      astuce:
        "SOME = oui/affirmatif. ANY = ? questions et ❌ négations. Do you have ANY apples?",
    },
  },
];

export default function NourritureShoppingPage() {
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
          <h1 className="lecon-titre">Nourriture et shopping</h1>
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
            Apprends le vocabulaire de la{" "}
            <strong>nourriture et du shopping</strong> en anglais. Some/any,
            prix, expressions utiles !
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
              <div className="lecon-point-titre">🍞 Some / Any</div>
              <div className="lecon-point-texte">
                Some = des/du (affirmatif). Any = des/du (questions et
                négations).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> I have some
                bread. Do you have any milk?
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">💷 Les prix</div>
              <div className="lecon-point-texte">
                How much is it? = Combien ça coûte ? It's £5.50 = five pounds
                fifty.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> How much is it?
                It's three pounds fifty.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🛒 Au magasin</div>
              <div className="lecon-point-texte">
                I'd like... / I'm looking for... / It's too expensive. / It's
                cheap.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> I'd like an
                apple please. I'm looking for a shirt.
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
