"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "francais";
const THEME = "les-connecteurs";

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
    question: "Qu'est-ce qu'un connecteur logique ?",
    options: [
      "Un mot de liaison qui indique une relation logique entre des idées",
      "Un verbe de déplacement",
      "Un adjectif qualificatif",
      "Un pronom personnel",
    ],
    answer:
      "Un mot de liaison qui indique une relation logique entre des idées",
    fiche: {
      regle:
        "Les connecteurs logiques (ou mots de liaison) relient des propositions ou des paragraphes en indiquant un rapport logique : cause, conséquence, opposition, concession, addition, etc.",
      exemple:
        "✅ 'Il pleut, donc je prends un parapluie.' (conséquence). 'Je suis fatigué mais je continue.' (opposition).",
      piege:
        "Les connecteurs ne sont pas que des conjonctions ! Ce peuvent être des adverbes (cependant, néanmoins), des locutions (en effet, par conséquent).",
      astuce:
        "Connecteur = mot ou groupe de mots qui indique un LIEN entre deux idées. Identifie toujours la relation qu'il exprime !",
    },
  },
  {
    question: "Quel connecteur exprime la cause ?",
    options: ["donc", "cependant", "car", "ainsi"],
    answer: "car",
    fiche: {
      regle:
        "Connecteurs de cause : car, parce que, puisque, en effet, en raison de, grâce à, à cause de, étant donné que...",
      exemple:
        "✅ 'Je suis absent car je suis malade.' 'Puisque tu insistes, j'accepte.' 'En effet, la situation est grave.'",
      piege:
        "Car ≠ donc. Car = CAUSE (pourquoi ?). Donc = CONSÉQUENCE (avec quel résultat ?). Sens inverse !",
      astuce:
        "Cause = POURQUOI ? → car, parce que, puisque, en effet. Conséquence = DONC ? → donc, ainsi, par conséquent.",
    },
  },
  {
    question: "Quel connecteur exprime la conséquence ?",
    options: ["car", "pourtant", "donc", "bien que"],
    answer: "donc",
    fiche: {
      regle:
        "Connecteurs de conséquence : donc, ainsi, par conséquent, c'est pourquoi, si bien que, de sorte que, aussi (en début de phrase)...",
      exemple:
        "✅ 'Il pleut, donc je reste.' 'Elle travaille beaucoup, par conséquent elle réussit.' 'C'est pourquoi je suis venu.'",
      piege:
        "Conséquence ≠ cause. La conséquence vient APRÈS la cause. Cause (car) → fait → conséquence (donc).",
      astuce:
        "Donc, par conséquent, c'est pourquoi = RÉSULTAT de quelque chose. Cause → DONC → conséquence.",
    },
  },
  {
    question: "Quel connecteur exprime l'opposition ?",
    options: ["car", "donc", "mais", "puisque"],
    answer: "mais",
    fiche: {
      regle:
        "Connecteurs d'opposition : mais, cependant, pourtant, en revanche, au contraire, par contre, or, néanmoins, toutefois...",
      exemple:
        "✅ 'Il est riche mais malheureux.' 'Je voulais venir, cependant je suis resté.' 'Il travaille beaucoup, pourtant il échoue.'",
      piege:
        "Opposition ≠ concession. Opposition = deux faits contraires. Concession = un fait ne suffit pas à empêcher l'autre.",
      astuce:
        "Opposition = MAIS / CEPENDANT / POURTANT / EN REVANCHE. Deux idées s'affrontent !",
    },
  },
  {
    question: "Quel connecteur exprime la concession ?",
    options: ["donc", "bien que", "car", "d'abord"],
    answer: "bien que",
    fiche: {
      regle:
        "Connecteurs de concession : bien que, quoique, même si, certes... mais, il est vrai que... cependant, malgré... Ils admettent un fait pour mieux le dépasser.",
      exemple:
        "✅ 'Bien qu'il soit fatigué, il continue.' 'Certes il a tort, mais il a agi de bonne foi.' 'Malgré la pluie, il sort.'",
      piege:
        "Bien que + SUBJONCTIF obligatoire. Ne jamais mettre l'indicatif après 'bien que'.",
      astuce:
        "Concession = admettre un fait pour le dépasser. BIEN QUE + subjonctif. CERTES... MAIS... MALGRÉ...",
    },
  },
  {
    question: "Quel est l'ordre logique : d'abord, ensuite, enfin ?",
    options: [
      "Opposition",
      "Cause-conséquence",
      "Énumération/progression",
      "Concession",
    ],
    answer: "Énumération/progression",
    fiche: {
      regle:
        "Connecteurs d'énumération et progression : d'abord, premièrement, ensuite, puis, deuxièmement, enfin, finalement, en premier lieu, en dernier lieu...",
      exemple:
        "✅ 'D'abord, je prépare les ingrédients. Ensuite, je les mélange. Enfin, je fais cuire.'",
      piege:
        "Ces connecteurs organisent l'argumentation ou la narration de façon chronologique ou logique.",
      astuce:
        "D'abord → ensuite → enfin = progression logique ou chronologique. Très utiles dans les dissertations et récits !",
    },
  },
  {
    question: "Quel connecteur introduit un exemple ?",
    options: ["cependant", "par exemple", "donc", "car"],
    answer: "par exemple",
    fiche: {
      regle:
        "Connecteurs d'illustration/exemple : par exemple, c'est-à-dire, notamment, ainsi, comme, tel que, en particulier...",
      exemple:
        "✅ 'Il aime les sports, par exemple le football et la natation.' 'Notamment les grandes villes, comme Paris ou Lyon.'",
      piege:
        "Par exemple illustre une affirmation, il ne l'explique pas. L'explication = c'est-à-dire. L'illustration = par exemple.",
      astuce:
        "Par exemple = illustre. C'est-à-dire = explique/reformule. En effet = prouve/justifie. Trois fonctions différentes !",
    },
  },
  {
    question: "Quel connecteur marque l'addition ?",
    options: ["mais", "cependant", "de plus", "donc"],
    answer: "de plus",
    fiche: {
      regle:
        "Connecteurs d'addition : et, de plus, en outre, également, aussi, par ailleurs, de surcroît, non seulement... mais aussi...",
      exemple:
        "✅ 'Il est gentil et généreux.' 'De plus, il est courageux.' 'Non seulement il travaille bien, mais il aide aussi les autres.'",
      piege:
        "De plus ≠ donc. De plus = j'ajoute une idée. Donc = je tire une conclusion.",
      astuce:
        "Addition = j'ajoute une idée : ET, DE PLUS, EN OUTRE, ÉGALEMENT. Accumule les arguments !",
    },
  },
  {
    question:
      "Identifie la relation : 'Je suis parti tôt afin d'arriver à l'heure.'",
    options: ["Cause", "Conséquence", "But", "Opposition"],
    answer: "But",
    fiche: {
      regle:
        "Connecteurs de but : pour, afin de, pour que, afin que, de façon à, de manière à... Ils expriment l'objectif visé.",
      exemple:
        "✅ 'Je travaille pour réussir.' 'Il parle fort afin d'être entendu.' 'Elle est venue pour que tu te sentes mieux.'",
      piege:
        "But ≠ cause. But = objectif (futur). Cause = raison (passé ou présent). 'Pour' peut exprimer les deux.",
      astuce:
        "But = DANS QUEL BUT ? → pour, afin de/que. Cause = POURQUOI ? → car, parce que, puisque.",
    },
  },
  {
    question: "Complète : 'Il a travaillé dur ; ___ il a réussi.'",
    options: ["cependant", "pourtant", "par conséquent", "bien que"],
    answer: "par conséquent",
    fiche: {
      regle:
        "La conséquence logique d'un effort = résultat positif. 'Par conséquent, c'est pourquoi, donc' = marqueurs de conséquence.",
      exemple:
        "✅ 'Il a travaillé dur ; par conséquent il a réussi.' Le travail est la CAUSE, la réussite est la CONSÉQUENCE.",
      piege:
        "'Cependant/pourtant' = opposition (il aurait échoué malgré les efforts). 'Par conséquent' = résultat logique.",
      astuce:
        "Travail dur → résultat logique = conséquence. PAR CONSÉQUENT, DONC, C'EST POURQUOI = résultat attendu.",
    },
  },
];

export default function LesConnecteursPage() {
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
          <div className="lecon-badge">➡️ Français — 4ème</div>
          <h1 className="lecon-titre">Les connecteurs logiques</h1>
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
            Les <strong>connecteurs logiques</strong> organisent les idées et
            indiquent les relations entre elles : cause, conséquence,
            opposition, concession...
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
                🔍 Relations logiques principales
              </div>
              <div className="lecon-point-texte">
                Cause (car, parce que, puisque). Conséquence (donc, par
                conséquent, c'est pourquoi). Opposition (mais, cependant,
                pourtant). Concession (bien que + subj.).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Il travaille
                car il veut réussir' (cause).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                📋 Organisation du discours
              </div>
              <div className="lecon-point-texte">
                Addition (de plus, en outre). Énumération (d'abord, ensuite,
                enfin). Illustration (par exemple, notamment). But (pour, afin
                de).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'D'abord...
                ensuite... enfin...' = progression.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">⚠️ Les pièges</div>
              <div className="lecon-point-texte">
                Car (cause) ≠ donc (conséquence). Mais (opposition) ≠ bien que
                (concession). Sens très différents !
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Il travaille
                DONC il réussit' ≠ 'Il travaille CAR il réussit'.
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
