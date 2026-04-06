"use client";

import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "francais";
const THEME = "accords";

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
      "Quelle est la bonne forme du verbe dans : « Les enfants ___ dans la cour. »",
    options: ["joue", "jouent", "jouons", "jouez"],
    answer: "jouent",
    fiche: {
      regle:
        "Le verbe s'accorde toujours avec son sujet en personne et en nombre.",
      exemple:
        "✅ Les enfants jouent (3ème pers. pluriel) / L'enfant joue (3ème pers. singulier)",
      piege:
        "Ne pas accorder le verbe avec le mot le plus proche s'il n'est pas le sujet !",
      astuce:
        "Trouve le sujet en posant 'Qui est-ce qui + verbe ?' puis accorde le verbe.",
    },
  },
  {
    question: "Quel adjectif convient dans : « Une robe ___ »",
    options: ["blanc", "blanche", "blancs", "blanches"],
    answer: "blanche",
    fiche: {
      regle:
        "L'adjectif qualificatif s'accorde en genre et en nombre avec le nom qu'il qualifie.",
      exemple: "✅ un chat blanc (masc. sing.) / une robe blanche (fém. sing.)",
      piege:
        "Attention aux adjectifs qui changent de forme au féminin : blanc → blanche, beau → belle.",
      astuce:
        "Trouve le nom → regarde son genre et son nombre → accorde l'adjectif !",
    },
  },
  {
    question: "Laquelle de ces phrases est correctement accordée ?",
    options: [
      "Les fleurs est belles.",
      "Les fleurs sont belle.",
      "Les fleurs sont belles.",
      "La fleur sont belle.",
    ],
    answer: "Les fleurs sont belles.",
    fiche: {
      regle:
        "Dans une phrase, le verbe s'accorde avec son sujet ET l'adjectif attribut s'accorde avec le sujet.",
      exemple:
        "✅ Les fleurs sont belles. (sujet plur. fém. → verbe plur. + adj. plur. fém.)",
      piege: "Deux accords à faire : sujet-verbe ET sujet-adjectif attribut !",
      astuce: "Vérifie toujours les deux accords : verbe et adjectif attribut.",
    },
  },
  {
    question:
      "Comment accorde-t-on l'adjectif dans : « Des garçons et des filles ___ » (content) ?",
    options: ["content", "contente", "contents", "contentes"],
    answer: "contents",
    fiche: {
      regle:
        "Quand un adjectif qualifie plusieurs noms de genres différents, il se met au masculin pluriel.",
      exemple:
        "✅ Des garçons et des filles contents (masc. + fém. → masc. plur.)",
      piege:
        "La règle du masculin l'emporte : même si les filles sont plus nombreuses, l'adjectif reste au masculin !",
      astuce: "Noms mixtes (masc. + fém.) → adjectif au masculin pluriel !",
    },
  },
  {
    question:
      "Quelle est la bonne forme dans : « La maîtresse ___ les élèves. » (encourager)",
    options: ["encouragent", "encourageons", "encourage", "encourages"],
    answer: "encourage",
    fiche: {
      regle:
        "Le verbe s'accorde avec son sujet. 'La maîtresse' est un sujet singulier → verbe au singulier.",
      exemple:
        "✅ La maîtresse encourage (3ème pers. sing.) / Les maîtresses encouragent (3ème pers. plur.)",
      piege:
        "Ne pas se laisser tromper par les mots entre le sujet et le verbe !",
      astuce:
        "Identifie le sujet, ignore les mots entre le sujet et le verbe, puis accorde !",
    },
  },
  {
    question:
      "Quel participe passé convient dans : « Elle est ___ au cinéma. » (aller)",
    options: ["allé", "allée", "allés", "allées"],
    answer: "allée",
    fiche: {
      regle:
        "Avec l'auxiliaire 'être', le participe passé s'accorde en genre et en nombre avec le sujet.",
      exemple:
        "✅ Elle est allée (fém. sing.) / Il est allé (masc. sing.) / Elles sont allées (fém. plur.)",
      piege:
        "Avec 'avoir', le participe passé ne s'accorde pas avec le sujet !",
      astuce:
        "Être → participe s'accorde avec le sujet. Avoir → pas d'accord avec le sujet !",
    },
  },
  {
    question: "Laquelle de ces phrases est correctement accordée ?",
    options: [
      "Mon frère et moi sommes fatigués.",
      "Mon frère et moi est fatigué.",
      "Mon frère et moi sommes fatigué.",
      "Mon frère et moi êtes fatigués.",
    ],
    answer: "Mon frère et moi sommes fatigués.",
    fiche: {
      regle:
        "Quand le sujet contient 'moi', le verbe se met à la 1ère personne du pluriel (nous).",
      exemple: "✅ Mon frère et moi sommes = nous sommes (1ère pers. plur.)",
      piege: "Ne pas utiliser 'êtes' qui correspond à 'vous' !",
      astuce:
        "X et moi → verbe à la 1ère personne du pluriel (sommes, allons, faisons...)",
    },
  },
  {
    question:
      "Comment accorde-t-on l'adjectif dans : « une solution ___ » (simple) ?",
    options: ["simple", "simples", "simplet", "simplette"],
    answer: "simple",
    fiche: {
      regle:
        "Certains adjectifs ont la même forme au masculin et au féminin singulier : simple, facile, rouge, triste...",
      exemple: "✅ un problème simple / une solution simple (même forme !)",
      piege:
        "Ne pas ajouter un -e inutile aux adjectifs qui sont déjà terminés par un -e !",
      astuce:
        "Si l'adjectif finit déjà par -e au masculin, il ne change pas au féminin !",
    },
  },
  {
    question:
      "Quelle est la bonne forme dans : « Les chats ___ dormi. » (avoir)",
    options: ["a", "ont", "avons", "ont dormi"],
    answer: "ont dormi",
    fiche: {
      regle:
        "Au passé composé avec 'avoir', le verbe avoir s'accorde avec le sujet et le participe passé reste invariable.",
      exemple:
        "✅ Les chats ont dormi (avoir + participe invariable avec avoir)",
      piege:
        "Le participe passé 'dormi' ne s'accorde pas car il est avec 'avoir' !",
      astuce:
        "Avoir + participe passé → le participe ne s'accorde pas avec le sujet !",
    },
  },
  {
    question: "Laquelle de ces phrases est correctement accordée ?",
    options: [
      "Les élèves travaille bien.",
      "Les élèves travaillent bien.",
      "Les élèves travailles bien.",
      "Les élèves travaillons bien.",
    ],
    answer: "Les élèves travaillent bien.",
    fiche: {
      regle:
        "À la 3ème personne du pluriel, les verbes du 1er groupe prennent -ent.",
      exemple: "✅ Les élèves travaillent (3ème pers. plur. → -ent)",
      piege: "Ne pas mettre -es ou -s à la 3ème personne du pluriel !",
      astuce: "3ème personne du pluriel des verbes en -er = toujours -ent !",
    },
  },
];

export default function AccordsPage() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useContext(DecouverteContext);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [etape, setEtape] = useState<"intro" | "quiz" | "resultat">("intro");
  const [index, setIndex] = useState(0);
  const [reponseChoisie, setReponseChoisie] = useState<string | null>(null);
  const [estCorrecte, setEstCorrecte] = useState<boolean | null>(null);
  const [ficheOuverte, setFicheOuverte] = useState(false);
  const [ficheObligatoireLue, setFicheObligatoireLue] = useState(false);
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
    setFicheObligatoireLue(false);
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
      if (fautesRef.current === 1) {
        setFicheOuverte(true);
        setFicheObligatoireLue(false);
      } else if (fautesRef.current === 6) {
        setFicheObligatoireLue(false);
      }
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
      setFicheObligatoireLue(false);
    }
  };

  const total = questions.length;
  const est6emeFaute = fautesRef.current === 6;
  const boutonBloque = !estCorrecte && est6emeFaute && !ficheObligatoireLue;

  if (etape === "intro") {
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">📖 Français — 6ème</div>
          <h1 className="lecon-titre">Les accords</h1>
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
            En français, les mots s'accordent entre eux. Il faut maîtriser
            l'accord <strong>sujet-verbe</strong> et l'accord{" "}
            <strong>nom-adjectif</strong> pour écrire correctement !
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
              <div className="lecon-point-titre">👤 L'accord sujet-verbe</div>
              <div className="lecon-point-texte">
                Le verbe s'accorde toujours avec son sujet en{" "}
                <strong>personne</strong> et en <strong>nombre</strong>.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Singulier :</span> Le chat
                court.
                <br />
                <span className="exemple-label">Pluriel :</span> Les chats
                courent.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🎨 L'accord nom-adjectif</div>
              <div className="lecon-point-texte">
                L'adjectif s'accorde en <strong>genre</strong> et en{" "}
                <strong>nombre</strong> avec le nom qu'il qualifie.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Masc. sing. :</span> un chat
                blanc
                <br />
                <span className="exemple-label">Fém. sing. :</span> une robe
                blanche
                <br />
                <span className="exemple-label">Masc. plur. :</span> des chats
                blancs
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">⚠️ Cas particuliers</div>
              <div className="lecon-point-texte">
                Avec <strong>être</strong>, le participe passé s'accorde avec le
                sujet. Avec <strong>avoir</strong>, il ne s'accorde pas avec le
                sujet.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Être :</span> Elle est partie.
                (accord)
                <br />
                <span className="exemple-label">Avoir :</span> Elle a mangé.
                (pas d'accord)
              </div>
            </div>
          </div>
          <button className="lecon-btn" onClick={demarrer}>
            🚀 Commencer les exercices →
          </button>
        </div>
      </div>
    );
  }

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
              let className = "qcm-option";
              if (reponseChoisie) {
                if (option === q.answer) className += " correct";
                else if (option === reponseChoisie) className += " incorrect";
                else className += " disabled";
              }
              return (
                <button
                  key={option}
                  className={className}
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
                      Tu dois relire la fiche avant de continuer. Elle est là
                      pour t'aider ! 💪
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
