"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les familles de mots",
  intro:
    "Une famille de mots regroupe des mots qui partagent la même racine et qui ont un sens proche. Reconnaître les familles de mots aide à comprendre et retenir le vocabulaire !",
  points: [
    {
      titre: "Qu'est-ce qu'une famille de mots ?",
      texte:
        "Des mots de la même famille ont la même racine. Ils parlent tous du même sujet mais de façon différente.",
      exemple:
        "jardin → jardinier, jardinage, jardiner · mer → marin, marine, maritime",
    },
    {
      titre: "Comment trouver la racine ?",
      texte:
        "La racine est la partie commune à tous les mots de la famille. On enlève les préfixes et suffixes pour trouver la racine.",
      exemple:
        "chanter → chanteur, chanson, chant · pain → boulanger, boulangerie, boulange",
    },
    {
      titre: "À quoi ça sert ?",
      texte:
        "Connaître les familles de mots aide à deviner le sens d'un mot inconnu et à enrichir son vocabulaire.",
      exemple:
        "Si je connais 'mer', je peux deviner que 'marin' est lié à la mer.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel mot appartient à la famille de 'jardin' ?",
    options: ["jardinier", "journal", "jambe", "jaune"],
    reponse: "jardinier",
    explication: "'jardinier' vient de 'jardin' — même racine.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel mot appartient à la famille de 'chanter' ?",
    options: ["chapeau", "chanteur", "chariot", "chandail"],
    reponse: "chanteur",
    explication: "'chanteur' vient de 'chanter' — même racine 'chant'.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quel mot N'appartient PAS à la famille de 'mer' ?",
    options: ["marin", "marine", "merci", "maritime"],
    reponse: "merci",
    explication: "'merci' n'a pas de lien avec la mer.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel mot appartient à la famille de 'livre' ?",
    options: ["librairie", "liberté", "ligne", "liste"],
    reponse: "librairie",
    explication:
      "'librairie' vient de 'livre' — c'est là où on vend des livres.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Quel mot appartient à la famille de 'pain' ?",
    options: ["peinture", "boulangerie", "panier", "palette"],
    reponse: "boulangerie",
    explication:
      "'boulangerie' est liée au pain — on y fabrique et vend du pain.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Trouve l'intrus : famille de 'soleil'",
    options: ["ensoleillé", "solaire", "solitaire", "parasol"],
    reponse: "solitaire",
    explication: "'solitaire' vient de 'seul', pas de 'soleil'.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quel mot appartient à la famille de 'école' ?",
    options: ["écolier", "éclair", "écharpe", "écran"],
    reponse: "écolier",
    explication: "'écolier' vient de 'école' — c'est celui qui va à l'école.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel mot appartient à la famille de 'fleur' ?",
    options: ["fleuve", "fleuriste", "flèche", "flamme"],
    reponse: "fleuriste",
    explication:
      "'fleuriste' vient de 'fleur' — c'est celui qui vend des fleurs.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Quelle est la racine commune de : nageur, nager, natation ?",
    options: ["nat", "nag", "nage", "na"],
    reponse: "nage",
    explication: "'nage' est la racine commune à ces trois mots.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Trouve l'intrus : famille de 'terre'",
    options: ["terrasse", "territoire", "terrible", "enterrer"],
    reponse: "terrible",
    explication: "'terrible' vient de 'terreur', pas de 'terre'.",
    niveau: "difficile",
  },
];

const CLASSE = "ce1";
const MATIERE = "francais";
const THEME = "vocabulaire-2";

export default function VocabulaireCE1Page2() {
  const router = useRouter();
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

  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex],
  );
  const progression = Math.round((bonnes.length / questions.length) * 100);

  useEffect(() => {
    getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
    getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
  }, []);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questions[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= questions.length) {
      if (!scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score,
          total: questions.length,
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
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Vocabulaire 2</span>
        </div>
      </div>

      {etape === "qcm" && (
        <div className="progression-wrapper">
          <div className="progression-info">
            <span>
              Question {qIndex + 1} / {questions.length}
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
          <div className="lecon-badge">📚 Vocabulaire 2 · CE1</div>
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
            {niveauLabel(questions[qIndex].niveau)}
          </div>
          <div className="qcm-question">{questions[qIndex].question}</div>
          <div className="qcm-options">
            {shuffledOptions.map((opt) => {
              let className = "qcm-option";
              if (selected) {
                if (opt === questions[qIndex].reponse) className += " correct";
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
              className={`qcm-feedback ${selected === questions[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <div className="feedback-icon">
                {selected === questions[qIndex].reponse ? "✅" : "❌"}
              </div>
              <div className="feedback-texte">
                <strong>
                  {selected === questions[qIndex].reponse
                    ? "Bravo !"
                    : "Pas tout à fait..."}
                </strong>
                <p>{questions[qIndex].explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button className="lecon-btn" onClick={handleSuivant}>
              {qIndex + 1 >= questions.length
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
            {score} / {questions.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu maîtrises parfaitement les familles de mots ! 🚀"
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
