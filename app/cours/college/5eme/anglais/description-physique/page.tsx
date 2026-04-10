"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "anglais";
const THEME = "description-physique";

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
    question:
      "How do you describe someone's hair in English? 'Elle a les cheveux longs et bouclés.'",
    options: [
      "She has long curly hair.",
      "She is long curly hair.",
      "Her hair are long and curly.",
      "She have long curly hair.",
    ],
    answer: "She has long curly hair.",
    fiche: {
      regle:
        "Pour décrire les cheveux : She/He has + adjectif(s) + hair. Hair est singulier en anglais (pas de 's').",
      exemple:
        "✅ She has long curly hair. He has short straight hair. I have dark wavy hair.",
      piege:
        "'Her hair are' → FAUX. Hair est singulier : 'her hair is' ou 'she has... hair'.",
      astuce:
        "HAIR = singulier. She HAS long hair (pas have). Her hair IS long (pas are).",
    },
  },
  {
    question: "What does 'slim' mean in French?",
    options: ["gros", "grand", "mince", "fort"],
    answer: "mince",
    fiche: {
      regle:
        "Vocabulaire physique : slim (mince), tall (grand), short (petit), fat/overweight (gros), muscular (musclé), thin (maigre).",
      exemple:
        "✅ She is slim and tall. He is short and muscular. They are quite thin.",
      piege:
        "Short = petit (taille) ≠ short = court (longueur). Contexte important !",
      astuce:
        "Taille : tall/short. Poids : slim/fat/muscular. Cheveux : long/short/curly/straight/dark/blonde.",
    },
  },
  {
    question: "How do you say 'Il a les yeux bleus' in English?",
    options: [
      "He is blue eyes.",
      "He has blue eyes.",
      "His eyes are blue.",
      "Both b and c are correct.",
    ],
    answer: "Both b and c are correct.",
    fiche: {
      regle:
        "Pour les yeux : He has blue eyes. (have + couleur + eyes) OU His eyes are blue. (être + couleur). Les deux sont corrects.",
      exemple:
        "✅ She has green eyes. = Her eyes are green. He has brown eyes. = His eyes are brown.",
      piege:
        "'He is blue eyes' → FAUX. On dit 'he HAS blue eyes' ou 'his eyes ARE blue'.",
      astuce:
        "HAS + couleur + eyes. ARE + couleur (avec possessif). Deux structures correctes !",
    },
  },
  {
    question: "What is the meaning of 'outgoing'?",
    options: ["timide", "méchant", "extraverti/sociable", "paresseux"],
    answer: "extraverti/sociable",
    fiche: {
      regle:
        "Personnalité : outgoing (extraverti), shy (timide), kind (gentil), mean (méchant), lazy (paresseux), hardworking (travailleur), funny (drôle).",
      exemple:
        "✅ She is very outgoing, she loves meeting new people. He is shy but kind.",
      piege:
        "Outgoing ≠ going out. C'est un adjectif de personnalité = extraverti, sociable.",
      astuce:
        "Outgoing = qui va vers les autres = extraverti. Shy = qui évite les autres = timide. Opposés !",
    },
  },
  {
    question: "How do you say 'Elle ressemble à sa mère' in English?",
    options: [
      "She looks like her mother.",
      "She sees like her mother.",
      "She is like her mother.",
      "She resembles to her mother.",
    ],
    answer: "She looks like her mother.",
    fiche: {
      regle:
        "Look like = ressembler à. Toujours 'look like' + nom. Pas de préposition 'to' après look like.",
      exemple:
        "✅ She looks like her mother. He looks like a footballer. You look like you're tired.",
      piege:
        "'Resembles to' → FAUX en anglais. On dit LOOK LIKE (pas resemble to).",
      astuce:
        "Look like = ressembler à. Look like + nom. She looks like her mum. Simple !",
    },
  },
  {
    question: "Complete: 'He is ___ than his brother.' (tall)",
    options: ["more tall", "taller", "tallest", "most tall"],
    answer: "taller",
    fiche: {
      regle:
        "Comparatif des adjectifs courts (1 syllabe) : adjectif + -er + than. Tall → taller. Short → shorter. Old → older.",
      exemple:
        "✅ He is taller than his brother. She is shorter than me. This book is older than that one.",
      piege:
        "Pour adjectifs courts : -er (pas more). 'More tall' → FAUX. 'Taller' → CORRECT.",
      astuce:
        "Court (1-2 syllabes) = -ER + than. Long (3+ syllabes) = more + adj + than. Tall→taller, beautiful→more beautiful.",
    },
  },
  {
    question: "What does 'freckles' mean?",
    options: [
      "des rides",
      "des taches de rousseur",
      "des fossettes",
      "des cernes",
    ],
    answer: "des taches de rousseur",
    fiche: {
      regle:
        "Vocabulaire du visage : freckles (taches de rousseur), dimples (fossettes), wrinkles (rides), spots/pimples (boutons), beard (barbe), moustache.",
      exemple:
        "✅ She has freckles on her nose. He has dimples when he smiles. My grandfather has wrinkles.",
      piege: "Freckles = taches de rousseur (pas des rides). Wrinkles = rides.",
      astuce:
        "Freckles = petites taches brunes. Dimples = petits creux dans les joues. Wrinkles = plis de vieillesse.",
    },
  },
  {
    question: "How do you say 'Il porte des lunettes' in English?",
    options: [
      "He carries glasses.",
      "He wears glasses.",
      "He has glasses on.",
      "Both b and c are correct.",
    ],
    answer: "Both b and c are correct.",
    fiche: {
      regle:
        "Porter (vêtements/accessoires) = wear. He wears glasses. He has glasses on. Les deux sont corrects.",
      exemple:
        "✅ She wears glasses. = She has glasses on. He wears a hat. = He has a hat on.",
      piege:
        "'He carries glasses' → FAUX pour porter sur soi. Carry = transporter (un sac). Wear = porter (sur soi).",
      astuce:
        "WEAR = porter sur soi (vêtements, lunettes, bijoux). CARRY = transporter (un sac, une valise).",
    },
  },
  {
    question: "What is the opposite of 'generous'?",
    options: ["kind", "mean", "selfish", "Both b and c are correct."],
    answer: "Both b and c are correct.",
    fiche: {
      regle:
        "Contraires de generous (généreux) : selfish (égoïste) ou mean (avare/radin). Les deux s'opposent à généreux.",
      exemple:
        "✅ She is generous, she always helps. He is selfish/mean, he never shares.",
      piege:
        "Mean peut vouloir dire 'méchant' OU 'radin'. Contexte important !",
      astuce:
        "Generous ↔ selfish/mean. Kind ↔ mean/unkind. Brave ↔ cowardly. Hardworking ↔ lazy.",
    },
  },
  {
    question: "How do you describe someone who always tells the truth?",
    options: ["honest", "reliable", "trustworthy", "All answers are correct."],
    answer: "All answers are correct.",
    fiche: {
      regle:
        "Honnêteté : honest (honnête), reliable (fiable), trustworthy (digne de confiance). Ces trois adjectifs décrivent quelqu'un de confiance.",
      exemple:
        "✅ She is honest, she never lies. He is reliable, you can always count on him. She is trustworthy.",
      piege:
        "Ces trois mots sont proches mais nuancés. Honest = ne ment pas. Reliable = fait ce qu'il dit. Trustworthy = global.",
      astuce:
        "Honest, reliable, trustworthy = trois façons de dire qu'on peut faire confiance à quelqu'un.",
    },
  },
];

export default function DescriptionPhysiquePage() {
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
          <div className="lecon-badge">🇬🇧 Anglais — 5ème</div>
          <h1 className="lecon-titre">Description physique & personnalité</h1>
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
            Apprends à <strong>décrire quelqu'un</strong> en anglais : apparence
            physique, personnalité, caractère. Un vocabulaire essentiel !
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
              <div className="lecon-point-titre">👤 Apparence physique</div>
              <div className="lecon-point-texte">
                She has + adj + hair. He has blue eyes.
                Tall/short/slim/fat/muscular.
                Long/short/curly/straight/dark/blonde hair.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> She has long
                dark curly hair and green eyes. He is tall and slim.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                😊 Personnalité & caractère
              </div>
              <div className="lecon-point-texte">
                Kind (gentil), mean (méchant), shy (timide), outgoing
                (extraverti), lazy (paresseux), hardworking (travailleur), funny
                (drôle).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> She is outgoing
                and kind. He is shy but very funny.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔍 Structures utiles</div>
              <div className="lecon-point-texte">
                She looks like (ressemble à). He wears glasses (porte des
                lunettes). She seems (a l'air). He appears to be (semble être).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> She looks like
                her mum. He wears a hat. She seems happy.
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
