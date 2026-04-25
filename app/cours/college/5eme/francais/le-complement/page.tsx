"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "francais";
const THEME = "le-complement";

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
    question: "Qu'est-ce qu'un COD (complément d'objet direct) ?",
    options: [
      "Un complément introduit par une préposition",
      "Un complément directement relié au verbe sans préposition",
      "Un complément qui indique le lieu",
      "Un complément du nom",
    ],
    answer: "Un complément directement relié au verbe sans préposition",
    fiche: {
      regle:
        "Le COD est un complément essentiel du verbe, directement relié sans préposition. Il répond à la question 'quoi ?' ou 'qui ?' après le verbe.",
      exemple:
        "✅ 'Je mange une pomme.' → mange QUOI ? une pomme = COD. 'Il aime Marie.' → aime QUI ? Marie = COD.",
      piege:
        "Le COD n'est pas introduit par une préposition. S'il y a 'à' ou 'de' entre le verbe et le complément → COI.",
      astuce:
        "COD = verbe + QUOI/QUI (sans préposition). Je mange QUOI ? Une pomme. COD trouvé !",
    },
  },
  {
    question: "Quel est le COD dans 'Lucas regarde un film' ?",
    options: ["Lucas", "regarde", "un film", "Il n'y a pas de COD"],
    answer: "un film",
    fiche: {
      regle:
        "Pour trouver le COD : pose la question 'verbe + qui/quoi ?' après avoir identifié le sujet et le verbe.",
      exemple:
        "✅ Lucas regarde QUOI ? → un film = COD. Lucas = sujet. regarde = verbe.",
      piege:
        "Le sujet (Lucas) n'est pas le COD. Le COD complète l'action du verbe, il ne fait pas l'action.",
      astuce:
        "Sujet FAIT l'action. COD REÇOIT l'action. Lucas (fait) regarde un film (reçoit). Un film = COD.",
    },
  },
  {
    question: "Qu'est-ce qu'un COI (complément d'objet indirect) ?",
    options: [
      "Un complément sans préposition",
      "Un complément relié au verbe par une préposition (à, de)",
      "Un complément de lieu",
      "Un complément du sujet",
    ],
    answer: "Un complément relié au verbe par une préposition (à, de)",
    fiche: {
      regle:
        "Le COI est un complément essentiel du verbe, relié par une préposition (à, de). Il répond à 'à qui ?', 'à quoi ?', 'de qui ?', 'de quoi ?' après le verbe.",
      exemple:
        "✅ 'Je parle à mon ami.' → parle À QUI ? à mon ami = COI. 'Il se souvient de son enfance.' → de quoi ? = COI.",
      piege:
        "COI ≠ COD. Le COI est TOUJOURS introduit par une préposition. COD = sans préposition.",
      astuce:
        "COI = verbe + préposition + complément. Je parle À mon ami. Je me souviens DE toi. COI !",
    },
  },
  {
    question: "Quel est le COI dans 'Elle téléphone à sa mère' ?",
    options: ["Elle", "téléphone", "à sa mère", "sa mère"],
    answer: "à sa mère",
    fiche: {
      regle:
        "Téléphoner est un verbe qui se construit avec À. 'Téléphone à qui ?' → à sa mère = COI (avec la préposition à).",
      exemple:
        "✅ Elle téléphone À QUI ? → à sa mère = COI. La préposition 'à' fait partie du COI.",
      piege:
        "Le COI inclut la préposition. On dit 'à sa mère' (pas seulement 'sa mère') car la préposition fait partie du COI.",
      astuce:
        "COI = préposition INCLUSE. À sa mère (entier) = COI. Pas juste 'sa mère'.",
    },
  },
  {
    question: "Qu'est-ce qu'un CC de lieu ?",
    options: [
      "Un complément qui indique quand",
      "Un complément qui indique où se passe l'action",
      "Un complément essentiel du verbe",
      "Un complément du nom",
    ],
    answer: "Un complément qui indique où se passe l'action",
    fiche: {
      regle:
        "Le CC de lieu indique l'endroit où se déroule l'action. Il répond à la question 'où ?' et peut généralement être supprimé ou déplacé.",
      exemple:
        "✅ 'Il joue dans le jardin.' → joue OÙ ? dans le jardin = CC de lieu. Supprimable : 'Il joue.' reste correct.",
      piege:
        "CC de lieu ≠ COI même si tous deux ont des prépositions. Le CC répond à 'où ?', le COI à 'à qui/quoi ?'.",
      astuce:
        "CC lieu = OÙ ? CC temps = QUAND ? CC manière = COMMENT ? Trois questions différentes !",
    },
  },
  {
    question:
      "Identifiez le complément circonstanciel dans 'Le soir, il lisait tranquillement dans sa chambre'.",
    options: [
      "Le soir = CC temps / tranquillement = CC manière / dans sa chambre = CC lieu",
      "Le soir = CC lieu / tranquillement = CC temps",
      "Pas de CC dans cette phrase",
      "Le soir = COD",
    ],
    answer:
      "Le soir = CC temps / tranquillement = CC manière / dans sa chambre = CC lieu",
    fiche: {
      regle:
        "Une phrase peut contenir plusieurs CC différents. CC temps (quand ?), CC manière (comment ?), CC lieu (où ?) peuvent coexister.",
      exemple:
        "✅ 'Le soir (CC temps), il lisait tranquillement (CC manière) dans sa chambre (CC lieu).'",
      piege:
        "Ne pas confondre les différents types de CC. Chacun répond à une question différente.",
      astuce:
        "Pose les questions : QUAND ? (temps), OÙ ? (lieu), COMMENT ? (manière), POURQUOI ? (cause). Chaque réponse = un CC.",
    },
  },
  {
    question: "Peut-on supprimer un COD de la phrase ?",
    options: [
      "Oui, toujours",
      "Non, il est essentiel au sens du verbe",
      "Oui, mais le sens change un peu",
      "Cela dépend du verbe",
    ],
    answer: "Non, il est essentiel au sens du verbe",
    fiche: {
      regle:
        "Le COD est un complément ESSENTIEL. Si on le supprime, la phrase perd son sens ou devient incorrecte grammaticalement.",
      exemple:
        "✅ 'Je mange une pomme.' → 'Je mange.' (acceptable mais sens incomplet). 'Je vois mon ami.' → 'Je vois.' (incomplet : vois QUOI ?).",
      piege:
        "COD et COI = compléments essentiels (difficiles à supprimer). CC = compléments accessoires (supprimables).",
      astuce:
        "COD/COI = essentiels (liés au verbe). CC = accessoires (ajoutent des infos). Essentiels = gardés, accessoires = supprimables.",
    },
  },
  {
    question:
      "Dans 'Il parle doucement à ses amis', quel est le CC de manière ?",
    options: ["Il", "doucement", "à ses amis", "parle"],
    answer: "doucement",
    fiche: {
      regle:
        "Le CC de manière indique COMMENT se déroule l'action. Il répond à la question 'comment ?' et est souvent un adverbe en -ment.",
      exemple:
        "✅ Il parle COMMENT ? → doucement = CC de manière. Les adverbes en -ment sont souvent des CC de manière.",
      piege:
        "'À ses amis' est le COI (parle à QUI ?), pas un CC. 'Doucement' = CC de manière.",
      astuce:
        "CC manière = COMMENT ? Souvent un adverbe en -MENT. Doucement, lentement, rapidement...",
    },
  },
  {
    question:
      "Comment appelle-t-on la fonction du groupe nominal qui reçoit l'action du verbe directement ?",
    options: ["Sujet", "COD", "Attribut du sujet", "CC de lieu"],
    answer: "COD",
    fiche: {
      regle:
        "Le COD (Complément d'Objet Direct) est le groupe nominal qui reçoit directement l'action du verbe, sans préposition.",
      exemple:
        "✅ 'Le chat attrape la souris.' → La souris REÇOIT l'action d'attraper = COD.",
      piege:
        "Le sujet FAIT l'action. Le COD REÇOIT l'action. Ne pas les confondre.",
      astuce:
        "Sujet → verbe → COD. Le chat (S) attrape (V) la souris (COD). L'action va du sujet vers le COD.",
    },
  },
  {
    question:
      "Quel est le CC de cause dans 'Il reste à la maison à cause de la pluie' ?",
    options: ["à la maison", "à cause de la pluie", "Il reste", "la pluie"],
    answer: "à cause de la pluie",
    fiche: {
      regle:
        "Le CC de cause indique la raison de l'action. Il répond à 'pourquoi ?' et est introduit par 'parce que', 'à cause de', 'grâce à', 'car'...",
      exemple:
        "✅ Il reste à la maison POURQUOI ? → à cause de la pluie = CC de cause.",
      piege:
        "'À la maison' = CC de lieu (OÙ ?). 'À cause de la pluie' = CC de cause (POURQUOI ?). Même préposition 'à' mais fonctions différentes.",
      astuce:
        "CC cause = POURQUOI ? Introduit par 'parce que', 'à cause de', 'grâce à', 'car', 'puisque'.",
    },
  },
];

export default function LeComplementPage() {
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
          <div className="lecon-badge">🔗 Français — 5ème</div>
          <h1 className="lecon-titre">Les compléments</h1>
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
            Maîtrise les <strong>fonctions des compléments</strong> dans la
            phrase : COD, COI et compléments circonstanciels (lieu, temps,
            manière, cause).
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
              <div className="lecon-point-titre">🎯 COD et COI</div>
              <div className="lecon-point-texte">
                COD = sans préposition (mange QUOI ?). COI = avec préposition
                à/de (parle À QUI ?). Tous deux sont essentiels au verbe.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Je mange une
                pomme (COD). Je parle à mon ami (COI).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🗺️ Les CC (compléments circonstanciels)
              </div>
              <div className="lecon-point-texte">
                CC lieu (OÙ ?), CC temps (QUAND ?), CC manière (COMMENT ?), CC
                cause (POURQUOI ?). Supprimables et déplaçables.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Le soir
                (temps), il lisait doucement (manière) dans sa chambre (lieu).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔑 Astuce pour identifier</div>
              <div className="lecon-point-texte">
                Pose les questions après le verbe : QUOI/QUI (COD), À QUI/DE
                QUOI (COI), OÙ/QUAND/COMMENT/POURQUOI (CC).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Elle offre un
                cadeau à sa mère.' → QUOI ? un cadeau (COD). À QUI ? à sa mère
                (COI).
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
                  📖 Lis la fiche pour débloquer la question suivante !
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
                📖 Mode découverte (5 questions). Inscris-toi pour les 10
                questions !
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
