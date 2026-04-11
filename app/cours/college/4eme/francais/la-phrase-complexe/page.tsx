"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "francais";
const THEME = "la-phrase-complexe";

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
    question: "Qu'est-ce qu'une phrase complexe ?",
    options: [
      "Une phrase avec un seul verbe",
      "Une phrase avec plusieurs propositions",
      "Une phrase très longue",
      "Une phrase sans verbe",
    ],
    answer: "Une phrase avec plusieurs propositions",
    fiche: {
      regle:
        "Une phrase complexe contient plusieurs propositions (= plusieurs verbes conjugués). Elle s'oppose à la phrase simple qui n'a qu'une proposition.",
      exemple:
        "✅ 'Je mange' = simple (1 verbe). 'Je mange et il dort' = complexe (2 verbes = 2 propositions).",
      piege:
        "Une phrase longue n'est pas forcément complexe. C'est le nombre de verbes conjugués qui compte.",
      astuce:
        "Compte les verbes conjugués : 1 verbe = simple. 2+ verbes = complexe. Simple !",
    },
  },
  {
    question: "Qu'est-ce que la coordination ?",
    options: [
      "Relier des propositions avec une conjonction de coordination",
      "Relier des propositions avec une conjonction de subordination",
      "Juxtaposer des propositions sans mot de liaison",
      "Insérer une proposition dans une autre",
    ],
    answer: "Relier des propositions avec une conjonction de coordination",
    fiche: {
      regle:
        "La coordination relie deux propositions indépendantes avec une conjonction de coordination : mais, ou, et, donc, or, ni, car (MAIS OU ET DONC OR NI CAR).",
      exemple:
        "✅ 'Il pleut mais je sors.' 'Je travaille car j'aime apprendre.' 'Elle chante et il danse.'",
      piege:
        "Ne pas confondre coordination et subordination. Coordination = propositions de même niveau. Subordination = une dépend de l'autre.",
      astuce:
        "Moyen mnémotechnique : MAIS OU ET DONC OR NI CAR = les 7 conjonctions de coordination.",
    },
  },
  {
    question: "Qu'est-ce que la juxtaposition ?",
    options: [
      "Relier avec 'et'",
      "Relier avec 'mais'",
      "Mettre côte à côte sans mot de liaison, juste une virgule ou un point-virgule",
      "Insérer une proposition dans une autre",
    ],
    answer:
      "Mettre côte à côte sans mot de liaison, juste une virgule ou un point-virgule",
    fiche: {
      regle:
        "La juxtaposition place des propositions côte à côte sans conjonction, séparées par une virgule, un point-virgule ou deux-points.",
      exemple:
        "✅ 'Je suis venu, j'ai vu, j'ai vaincu.' (Jules César). Pas de 'et' ou 'mais', juste des virgules.",
      piege:
        "Juxtaposition ≠ coordination. Juxtaposition = pas de conjonction. Coordination = avec conjonction.",
      astuce:
        "Juxtaposé = posé côte à côte. Virgule ou point-virgule = juxtaposition. Conjonction = coordination.",
    },
  },
  {
    question: "Identifie le type de lien : 'Je pars parce qu'il fait beau.'",
    options: ["Coordination", "Juxtaposition", "Subordination", "Pas de lien"],
    answer: "Subordination",
    fiche: {
      regle:
        "La subordination relie une proposition principale et une proposition subordonnée. La subordonnée dépend de la principale. 'Parce que' est une conjonction de subordination.",
      exemple:
        "✅ 'Je pars parce qu'il fait beau.' Principale : 'je pars'. Subordonnée : 'parce qu'il fait beau' (dépend de la principale).",
      piege:
        "Parce que = subordination (cause). Mais = coordination. Virgule = juxtaposition. Bien distinguer les trois.",
      astuce:
        "Subordination = une proposition DÉPEND de l'autre. La subordonnée ne peut pas exister seule.",
    },
  },
  {
    question: "Qu'est-ce qu'une proposition subordonnée relative ?",
    options: [
      "Elle est introduite par 'que', 'si'...",
      "Elle est introduite par un pronom relatif (qui, que, dont, où...)",
      "Elle exprime la cause",
      "Elle est juxtaposée",
    ],
    answer: "Elle est introduite par un pronom relatif (qui, que, dont, où...)",
    fiche: {
      regle:
        "La proposition subordonnée relative est introduite par un pronom relatif (qui, que, dont, où, lequel...) et complète un nom (antécédent).",
      exemple:
        "✅ 'Le livre que je lis est passionnant.' Relative : 'que je lis' (complète 'le livre'). Pronom relatif : 'que'.",
      piege:
        "Relative introduite par 'qui/que/dont/où' ≠ conjonctive introduite par 'que'. Le 'que' seul = conjonctive. 'Que' après un nom = relative.",
      astuce:
        "Relative = qui/que/dont/où + complète un NOM. Conjonctive = que/si + complète un VERBE.",
    },
  },
  {
    question:
      "Dans 'Je crois que tu as raison', quelle est la nature de 'que tu as raison' ?",
    options: [
      "Proposition subordonnée relative",
      "Proposition subordonnée conjonctive COD",
      "Proposition indépendante coordonnée",
      "Proposition principale",
    ],
    answer: "Proposition subordonnée conjonctive COD",
    fiche: {
      regle:
        "La proposition subordonnée conjonctive est introduite par 'que' et fonctionne comme un COD, COI, ou sujet. Elle complète le verbe principal.",
      exemple:
        "✅ 'Je crois QUE tu as raison.' = conjonctive COD du verbe 'croire'. Elle répond à 'je crois quoi ?'",
      piege:
        "'Que' relatif = après un nom (antécédent). 'Que' conjonctif = après un verbe. Même mot, fonctions différentes !",
      astuce:
        "Conjonctive = 'que' après verbe = COD. Relative = 'que' après nom = complément du nom. Cherche ce que 'que' suit !",
    },
  },
  {
    question: "Qu'exprime une subordonnée de cause ?",
    options: [
      "Le but d'une action",
      "La raison, le motif d'une action",
      "La condition d'une action",
      "La conséquence d'une action",
    ],
    answer: "La raison, le motif d'une action",
    fiche: {
      regle:
        "Subordonnées de cause : parce que, puisque, comme, étant donné que, vu que... Elles répondent à la question 'pourquoi ?'",
      exemple:
        "✅ 'Je reste parce qu'il pleut.' Cause : 'parce qu'il pleut' = pourquoi je reste ?",
      piege:
        "Cause ≠ conséquence. Cause = raison (pourquoi). Conséquence = résultat (avec donc, si bien que...).",
      astuce:
        "Cause = POURQUOI ? → parce que, puisque. Conséquence = AVEC QUEL RÉSULTAT ? → si bien que, donc.",
    },
  },
  {
    question: "Qu'est-ce qu'une subordonnée de but ?",
    options: [
      "Elle exprime la raison",
      "Elle exprime l'objectif visé",
      "Elle exprime la condition",
      "Elle exprime la concession",
    ],
    answer: "Elle exprime l'objectif visé",
    fiche: {
      regle:
        "Subordonnées de but : pour que, afin que (+ subjonctif). Elles expriment l'objectif, le but recherché par l'action.",
      exemple:
        "✅ 'Je travaille pour que tu réussisses.' 'Elle parte tôt afin d'arriver à l'heure.'",
      piege:
        "But ≠ cause. But = pour quoi faire ? (objectif). Cause = pourquoi ? (raison passée ou présente).",
      astuce:
        "But = POUR QUOI FAIRE ? → pour que, afin que + SUBJONCTIF. Cause = POURQUOI ? → parce que + indicatif.",
    },
  },
  {
    question:
      "Identifie la subordonnée : 'Bien qu'il soit fatigué, il continue.'",
    options: ["Cause", "But", "Concession", "Condition"],
    answer: "Concession",
    fiche: {
      regle:
        "Subordonnées de concession : bien que, quoique, même si, encore que... (+ subjonctif). Elles expriment un obstacle qui ne suffit pas à empêcher l'action principale.",
      exemple:
        "✅ 'Bien qu'il soit fatigué, il continue.' = malgré la fatigue, il continue quand même.",
      piege:
        "Concession ≠ opposition. La concession admet le fait mais montre que ça n'empêche pas l'action.",
      astuce:
        "Concession = MALGRÉ... = bien que, quoique + SUBJONCTIF. 'Bien que' = toujours subjonctif !",
    },
  },
  {
    question: "Qu'est-ce qu'une subordonnée de condition ?",
    options: [
      "Elle est introduite par 'parce que'",
      "Elle est introduite par 'si' et exprime une hypothèse",
      "Elle est introduite par 'bien que'",
      "Elle est introduite par 'pour que'",
    ],
    answer: "Elle est introduite par 'si' et exprime une hypothèse",
    fiche: {
      regle:
        "Subordonnées de condition/hypothèse : si, à condition que, pourvu que... La plus courante : si + indicatif.",
      exemple:
        "✅ 'Si tu travailles, tu réussiras.' 'Si j'avais le temps, je viendrais.'",
      piege:
        "Jamais de conditionnel après 'si' ! Si + présent → futur. Si + imparfait → conditionnel présent.",
      astuce:
        "Condition = SI + indicatif (jamais conditionnel). À condition que, pourvu que + subjonctif.",
    },
  },
];

export default function LaPhraseComplexePage() {
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
          <div className="lecon-badge">🔗 Français — 4ème</div>
          <h1 className="lecon-titre">La phrase complexe</h1>
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
            La <strong>phrase complexe</strong> contient plusieurs propositions.
            Apprends à identifier la coordination, la juxtaposition et la
            subordination.
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
              <div className="lecon-point-titre">🔗 3 types de liens</div>
              <div className="lecon-point-texte">
                Coordination (MAIS OU ET DONC OR NI CAR). Juxtaposition
                (virgule/point-virgule). Subordination (une proposition dépend
                de l'autre).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Et = coord.
                Virgule = juxtapo. Parce que = subord.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                📌 Subordonnées relatives et conjonctives
              </div>
              <div className="lecon-point-texte">
                Relative : qui/que/dont/où + complète un nom. Conjonctive :
                que/si + complète un verbe (COD, sujet...).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'le livre QUE
                je lis' (relative). 'je crois QUE tu as raison' (conjonctive).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ⚙️ Subordonnées circonstancielles
              </div>
              <div className="lecon-point-texte">
                Cause (parce que), but (pour que + subj.), concession (bien que
                + subj.), condition (si + indicatif).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Bien qu'il soit
                fatigué (concession). Si tu travailles (condition).
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
                  {estCorrecte ? "Bravo !" : "Pas tout à fait..."}
                </strong>
                <p>
                  {estCorrecte
                    ? "Excellente réponse !"
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
                      😅 6 erreurs !
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
                    📖 Voir la fiche pédagogique
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
        ? "Excellent travail !"
        : pourcentage >= 60
          ? "Bien joué !"
          : "Continue à t'entraîner !";
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
