"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les préfixes et les suffixes",
  intro:
    "Un préfixe se place avant le radical d'un mot pour en modifier le sens. Un suffixe se place après le radical pour créer un nouveau mot. Les connaître aide à comprendre et enrichir son vocabulaire !",
  points: [
    {
      titre: "Les préfixes",
      texte:
        "Les préfixes changent le sens d'un mot sans changer sa nature. Exemples : in-/im- (contraire), re- (à nouveau), pré- (avant), dé-/dés- (contraire ou séparation).",
      exemple:
        "possible → impossible · lire → relire · voir → prévoir · faire → défaire",
    },
    {
      titre: "Les suffixes",
      texte:
        "Les suffixes créent souvent des mots d'une autre nature. Exemples : -eur/-euse (personne qui fait), -tion (action), -ment (adverbe), -ette (diminutif).",
      exemple:
        "chanter → chanteur · construire → construction · rapide → rapidement",
    },
    {
      titre: "Le radical",
      texte:
        "Le radical est la partie centrale du mot qui porte le sens principal. Préfixe + radical + suffixe = famille de mots.",
      exemple:
        "Radical 'port' : porteur, portable, transporter, reporter, importer",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel est le préfixe dans 'impossible' ?",
    options: ["im", "possible", "ible", "po"],
    reponse: "im",
    explication: "'im-' signifie 'pas' : impossible = pas possible.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Que signifie le préfixe 're-' dans 'relire' ?",
    options: ["avant", "à nouveau", "contraire", "après"],
    reponse: "à nouveau",
    explication: "'re-' signifie 'à nouveau' : relire = lire à nouveau.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quel suffixe indique une personne qui fait une action ?",
    options: ["-tion", "-ment", "-eur", "-ette"],
    reponse: "-eur",
    explication:
      "'-eur' indique la personne qui fait l'action : chanteur, joueur.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel est le suffixe dans 'construction' ?",
    options: ["con", "construct", "-tion", "ion"],
    reponse: "-tion",
    explication: "'-tion' transforme un verbe en nom d'action.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Que signifie 'défaire' ?",
    options: [
      "faire à nouveau",
      "faire avant",
      "faire le contraire",
      "bien faire",
    ],
    reponse: "faire le contraire",
    explication:
      "'dé-' indique le contraire : défaire = faire le contraire de faire.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quel mot contient le suffixe '-ment' ?",
    options: ["chanteur", "rapidement", "construction", "maisonnette"],
    reponse: "rapidement",
    explication: "'-ment' forme des adverbes : rapide → rapidement.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Que signifie 'maisonnette' ?",
    options: [
      "grande maison",
      "petite maison",
      "belle maison",
      "vieille maison",
    ],
    reponse: "petite maison",
    explication: "Le suffixe '-ette' indique quelque chose de petit.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel est le radical commun à : porteur, portable, transporter ?",
    options: ["port", "able", "eur", "trans"],
    reponse: "port",
    explication:
      "Le radical 'port' porte le sens principal dans tous ces mots.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Quel préfixe signifie 'avant' ?",
    options: ["re-", "im-", "pré-", "dé-"],
    reponse: "pré-",
    explication: "'pré-' signifie 'avant' : prévoir = voir avant.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quel mot est formé avec le préfixe 'in-' ?",
    options: ["inviter", "incroyable", "inonder", "insecte"],
    reponse: "incroyable",
    explication: "'incroyable' = in- (pas) + croyable : pas croyable.",
    niveau: "difficile",
  },
];

const CLASSE = "cm1";
const MATIERE = "francais";
const THEME = "orthographe-2";

export default function OrthographeCM1Page2() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [bestScore, setBestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [lastScore, setLastScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const scoreSaved = useRef(false);

  const questionsActives = questions.slice(0, maxQuestions);

  const shuffledOptions = useMemo(
    () => shuffleArray(questionsActives[qIndex]?.options ?? []),
    [qIndex],
  );
  const progression = Math.round((bonnes.length / questionsActives.length) * 100);

  useEffect(() => {
    getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
    getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
  }, []);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questionsActives[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= questionsActives.length) {
      if (!scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score,
          total: questionsActives.length,
        });
        const [best, last] = await Promise.all([
          getBestScore(CLASSE, MATIERE, THEME),
          getLastScore(CLASSE, MATIERE, THEME),
        ]);
        setBestScore(best);
        setLastScore(last);
      }
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    scoreSaved.current = false;
    setEtape("lecon");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setBonnes([]);
  };

  const niveauLabel = (n: string) =>
    n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() =>
            router.push(`/cours/primaire/${CLASSE}/${MATIERE}/page-2`)
          }
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Orthographe 2</span>
        </div>
      </div>
      {etape === "qcm" && (
        <div className="progression-wrapper">
          <div className="progression-info">
            <span>
              Question {qIndex + 1} / {questionsActives.length}
            </span>
            <span>
              {score} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}
            </span>
          </div>
          <div className="progression-bar">
            <div
              className="progression-fill"
              style={{ width: `${progression}%` }}
            ></div>
          </div>
        </div>
      )}
      {etape === "lecon" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">✏️ Orthographe 2 · CM1</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#4f8ef7",
                    textAlign: "center",
                  }}
                >
                  🏆 Meilleur
                  <br />
                  <strong>
                    {bestScore.score} / {bestScore.total}
                  </strong>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#aaa",
                    textAlign: "center",
                  }}
                >
                  🕐 Dernier
                  <br />
                  <strong style={{ color: "#fff" }}>
                    {lastScore.score} / {lastScore.total}
                  </strong>
                </div>
              )}
            </div>
          )}
          <div className="lecon-points">
            {lecon.points.map((p, i) => (
              <div key={i} className="lecon-point">
                <div className="lecon-point-titre">{p.titre}</div>
                <div className="lecon-point-texte">{p.texte}</div>
                <div className="lecon-point-exemple">
                  <span className="exemple-label">Exemples :</span> {p.exemple}
                </div>
              </div>
            ))}
          </div>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Je suis prêt(e) — Passer aux exercices →
          </button>
        </div>
      )}
      {etape === "qcm" && (
        <div className="qcm-wrapper">
          <div className="niveau-label">
            {niveauLabel(questionsActives[qIndex].niveau)}
          </div>
          <div className="qcm-question">{questionsActives[qIndex].question}</div>
          <div className="qcm-options">
            {shuffledOptions.map((opt) => {
              let className = "qcm-option";
              if (selected) {
                if (opt === questionsActives[qIndex].reponse) className += " correct";
                else if (opt === selected) className += " incorrect";
                else className += " disabled";
              }
              return (
                <button
                  key={opt}
                  className={className}
                  onClick={() => handleReponse(opt)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {selected && (
            <div
              className={`qcm-feedback ${selected === questionsActives[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <div className="feedback-icon">
                {selected === questionsActives[qIndex].reponse ? "✅" : "❌"}
              </div>
              <div className="feedback-texte">
                <strong>
                  {selected === questionsActives[qIndex].reponse
                    ? "Bravo !"
                    : "Pas tout à fait..."}
                </strong>
                <p>{questionsActives[qIndex].explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button className="lecon-btn" onClick={handleSuivant}>
              {qIndex + 1 >= questionsActives.length
                ? "Voir mon résultat →"
                : "Question suivante →"}
            </button>
          )}
        </div>
      )}
      {etape === "fini" && (
        <div className="resultat-wrapper">
          <div className="resultat-icon">
            {score >= 9 ? "🏆" : score >= 7 ? "⭐" : score >= 5 ? "👍" : "💪"}
          </div>
          <h2 className="resultat-titre">
            {score >= 9
              ? "Excellent !"
              : score >= 7
                ? "Bien joué !"
                : score >= 5
                  ? "Assez bien !"
                  : "À revoir !"}
          </h2>
          <div className="resultat-score">
            {score} / {questionsActives.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu maîtrises parfaitement les préfixes et suffixes ! 🚀"
              : score >= 7
                ? "Tu as bien compris l'essentiel, continue !"
                : score >= 5
                  ? "Encore quelques efforts et tu y seras !"
                  : "Relis la leçon et réessaie, tu vas y arriver !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() =>
                router.push(`/cours/primaire/${CLASSE}/${MATIERE}/page-2`)
              }
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
