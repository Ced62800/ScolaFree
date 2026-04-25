"use client";

import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "francais";
const THEME = "present-indicatif";

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
      "Quelle est la bonne conjugaison de « chanter » à la 1ère personne du singulier ?",
    options: ["je chantes", "je chante", "je chanti", "je chantons"],
    answer: "je chante",
    fiche: {
      regle:
        "Les verbes du 1er groupe (-er) au présent : je -e, tu -es, il/elle -e, nous -ons, vous -ez, ils/elles -ent.",
      exemple:
        "✅ je chante, tu chantes, il chante, nous chantons, vous chantez, ils chantent",
      piege:
        "Attention : 'je chante' sans -s ! Les verbes en -er prennent -e à la 1ère personne.",
      astuce:
        "Pour les verbes en -er : je -e, tu -es, il -e, nous -ons, vous -ez, ils -ent !",
    },
  },
  {
    question: "Conjugue « finir » à la 3ème personne du pluriel au présent.",
    options: ["ils finient", "ils finissent", "ils finent", "ils finont"],
    answer: "ils finissent",
    fiche: {
      regle:
        "Les verbes du 2ème groupe (-ir) intercalent -iss- aux 3 personnes du pluriel.",
      exemple:
        "✅ je finis, tu finis, il finit, nous finissons, vous finissez, ils finissent",
      piege: "Ne pas oublier le -iss- pour les verbes en -ir du 2ème groupe !",
      astuce:
        "Verbes en -ir : singulier = -is/-is/-it, pluriel = -issons/-issez/-issent.",
    },
  },
  {
    question:
      "Quelle est la bonne conjugaison de « être » à la 2ème personne du singulier ?",
    options: ["tu êtes", "tu es", "tu est", "tu ête"],
    answer: "tu es",
    fiche: {
      regle:
        "Le verbe 'être' est irrégulier : je suis, tu es, il est, nous sommes, vous êtes, ils sont.",
      exemple: "✅ je suis content / tu es gentil / il est grand",
      piege: "Ne pas confondre 'tu es' et 'tu êtes' qui n'existe pas !",
      astuce: "Apprends par cœur : suis/es/est/sommes/êtes/sont !",
    },
  },
  {
    question: "Conjugue « avoir » à la 1ère personne du pluriel au présent.",
    options: ["nous avons", "nous avez", "nous ont", "nous avions"],
    answer: "nous avons",
    fiche: {
      regle:
        "Le verbe 'avoir' est irrégulier : j'ai, tu as, il a, nous avons, vous avez, ils ont.",
      exemple: "✅ j'ai faim / tu as raison / nous avons cours",
      piege:
        "Ne pas confondre 'nous avons' (présent) et 'nous avions' (imparfait) !",
      astuce: "Apprends par cœur : ai/as/a/avons/avez/ont !",
    },
  },
  {
    question:
      "Quelle est la bonne conjugaison de « aller » à la 2ème personne du pluriel ?",
    options: ["vous allez", "vous allons", "vous vont", "vous alliez"],
    answer: "vous allez",
    fiche: {
      regle:
        "Le verbe 'aller' est irrégulier : je vais, tu vas, il va, nous allons, vous allez, ils vont.",
      exemple: "✅ je vais à l'école / vous allez où ?",
      piege:
        "Attention : 'je vais' (et non 'je alle') ! Le singulier est très irrégulier.",
      astuce:
        "Aller : vais/vas/va/allons/allez/vont. Retiens que le singulier est différent !",
    },
  },
  {
    question:
      "Conjugue « prendre » à la 3ème personne du singulier au présent.",
    options: ["il prends", "il prende", "il prend", "il prendt"],
    answer: "il prend",
    fiche: {
      regle:
        "Les verbes du 3ème groupe (-re) au singulier : je -ds, tu -ds, il/elle -d (sans -s !).",
      exemple: "✅ je prends, tu prends, il prend, nous prenons",
      piege:
        "À la 3ème personne du singulier, les verbes en -dre ne prennent pas de -s !",
      astuce: "Pour les verbes en -dre : je/tu → -ds, il → -d (sans s !) !",
    },
  },
  {
    question:
      "Quelle est la bonne conjugaison de « faire » à la 1ère personne du pluriel ?",
    options: ["nous faisons", "nous faisez", "nous font", "nous fasons"],
    answer: "nous faisons",
    fiche: {
      regle:
        "Le verbe 'faire' est irrégulier : je fais, tu fais, il fait, nous faisons, vous faites, ils font.",
      exemple: "✅ je fais mes devoirs / nous faisons la cuisine",
      piege: "Attention à 'vous faites' (et non 'vous faisez') !",
      astuce:
        "Faire : fais/fais/fait/faisons/faites/font. Mémorise 'vous faites' !",
    },
  },
  {
    question: "Conjugue « venir » à la 3ème personne du pluriel au présent.",
    options: ["ils venent", "ils vienent", "ils viennent", "ils venons"],
    answer: "ils viennent",
    fiche: {
      regle:
        "Le verbe 'venir' est irrégulier : je viens, tu viens, il vient, nous venons, vous venez, ils viennent.",
      exemple: "✅ je viens de Paris / ils viennent tous les jours",
      piege:
        "Attention au doublement du -n- : 'ils viennent' et non 'ils venent' !",
      astuce:
        "Venir : viens/viens/vient/venons/venez/viennent. Le -nn- de 'viennent' !",
    },
  },
  {
    question:
      "Quelle terminaison prend le verbe « manger » à la 1ère personne du pluriel ?",
    options: ["nous mangons", "nous mangeons", "nous mangens", "nous mangez"],
    answer: "nous mangeons",
    fiche: {
      regle:
        "Les verbes en -ger gardent le -e- avant -ons pour conserver le son [j] : nous mangeons.",
      exemple: "✅ nous mangeons, nous nageons, nous rangeons",
      piege:
        "Sans le -e-, le G deviendrait dur : 'mangons' se prononcerait mal !",
      astuce: "Verbes en -ger + nous = toujours -geons !",
    },
  },
  {
    question:
      "Conjugue « pouvoir » à la 2ème personne du singulier au présent.",
    options: ["tu pouvez", "tu peux", "tu peut", "tu pouves"],
    answer: "tu peux",
    fiche: {
      regle:
        "Le verbe 'pouvoir' est irrégulier : je peux, tu peux, il peut, nous pouvons, vous pouvez, ils peuvent.",
      exemple: "✅ je peux venir / tu peux m'aider ?",
      piege: "Attention : 'je peux' et 'tu peux' avec -x et non 'je peut' !",
      astuce:
        "Pouvoir : peux/peux/peut/pouvons/pouvez/peuvent. Le -x au singulier !",
    },
  },
];

export default function PresentIndicatifPage() {
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
          <h1 className="lecon-titre">Le présent de l'indicatif</h1>
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
            Le <strong>présent de l'indicatif</strong> exprime une action qui se
            passe maintenant, une vérité générale ou une habitude. C'est le
            temps le plus utilisé en français !
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
                1️⃣ Verbes du 1er groupe (-er)
              </div>
              <div className="lecon-point-texte">
                Terminaisons : <strong>-e, -es, -e, -ons, -ez, -ent</strong>
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Chanter :</span> je chante, tu
                chantes, il chante, nous chantons, vous chantez, ils chantent
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                2️⃣ Verbes du 2ème groupe (-ir)
              </div>
              <div className="lecon-point-texte">
                Terminaisons avec <strong>-iss-</strong> au pluriel
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Finir :</span> je finis, tu
                finis, il finit, nous finissons, vous finissez, ils finissent
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">3️⃣ Verbes irréguliers</div>
              <div className="lecon-point-texte">À apprendre par cœur !</div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Être :</span>{" "}
                suis/es/est/sommes/êtes/sont
                <br />
                <span className="exemple-label">Avoir :</span>{" "}
                ai/as/a/avons/avez/ont
                <br />
                <span className="exemple-label">Aller :</span>{" "}
                vais/vas/va/allons/allez/vont
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">⚠️ Cas particuliers</div>
              <div className="lecon-point-texte">
                Verbes en <strong>-ger</strong> → nous -geons / Verbes en{" "}
                <strong>-dre</strong> → il -d sans -s
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Manger :</span> nous mangeons
                <br />
                <span className="exemple-label">Prendre :</span> il prend
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
                📖 Mode découverte (5 questions). Inscris-toi pour accéder aux
                10 questions !
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
