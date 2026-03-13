"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Ranger les mots par familles",
  intro:
    "Une famille de mots regroupe des mots qui parlent de la même chose ou qui se ressemblent.",
  points: [
    {
      titre: "C'est quoi une famille ?",
      texte: "C'est un ensemble de mots qui ont un lien de sens très fort.",
      exemple: "Chat, chaton et chatterie font partie de la même famille.",
    },
    {
      titre: "Le mot 'étiquette'",
      texte: "C'est le mot qui donne le nom à toute la famille (la catégorie).",
      exemple: "Pomme, Banane et Poire sont dans la famille des 'Fruits'.",
    },
    {
      titre: "Trouver l'intrus",
      texte:
        "L'intrus est le mot qui ne va pas avec les autres dans la famille.",
      exemple: "Dans [Chien, Chat, Voiture], l'intrus est 'Voiture'.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel est le mot 'étiquette' pour : Bleu, Rouge, Vert ?",
    options: ["Les couleurs", "Les jouets", "Les habits", "Les fruits"],
    reponse: "Les couleurs",
    explication: "Bleu, rouge et vert sont tous des noms de couleurs.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Trouve l'intrus dans cette famille :",
    options: ["Carotte", "Salade", "Ballon", "Poireau"],
    reponse: "Ballon",
    explication:
      "La carotte, la salade et le poireau sont des légumes, pas le ballon.",
    niveau: "facile",
  },
  {
    id: 3,
    question:
      "Dans quelle famille ranges-tu : Un doudou, une poupée, un cube ?",
    options: ["Les jouets", "Les animaux", "Les fruits", "Les outils"],
    reponse: "Les jouets",
    explication: "Ce sont tous des objets avec lesquels on peut jouer.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel mot fait partie de la famille du mot 'DENT' ?",
    options: ["Dentiste", "Doigt", "Danse", "Dormir"],
    reponse: "Dentiste",
    explication:
      "Le dentiste est celui qui soigne les dents. Ils partagent le même début.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Trouve l'étiquette pour : Un lion, un tigre, un singe.",
    options: ["Les animaux", "La forêt", "Les amis", "Les plantes"],
    reponse: "Les animaux",
    explication: "Ce sont tous des êtres vivants de la catégorie des animaux.",
    niveau: "moyen",
  },
  {
    id: 6,
    question:
      "Lequel de ces mots n'appartient PAS à la famille du mot 'LAIT' ?",
    options: ["Laine", "Laitier", "Laitage", "Laiterie"],
    reponse: "Laine",
    explication:
      "Le laitier, le laitage et la laiterie viennent du mot lait. La laine vient du mouton.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complète la famille : 'Un pantalon, un pull, ...'",
    options: ["une chemise", "une table", "un vélo", "un marteau"],
    reponse: "une chemise",
    explication: "On cherche un autre vêtement pour compléter la famille.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Trouve l'intrus dans la famille du jardin :",
    options: ["Cahier", "Fleur", "Arrosoir", "Pelle"],
    reponse: "Cahier",
    explication:
      "Le cahier sert à l'école, on ne le trouve pas normalement dans le jardin.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Comment appelle-t-on le petit du chat ?",
    options: ["Le chaton", "Le chiot", "Le poussin", "Le veau"],
    reponse: "Le chaton",
    explication: "Chat et chaton sont de la même famille.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "L'étiquette est 'OISEAUX'. Quel mot va dedans ?",
    options: ["Un pigeon", "Un lapin", "Un poisson", "Un chat"],
    reponse: "Un pigeon",
    explication: "Le pigeon est le seul oiseau de la liste.",
    niveau: "difficile",
  },
];

const CLASSE = "cp";
const MATIERE = "francais";
const THEME = "vocabulaire-2";

export default function Vocabulaire2CP() {
  const router = useRouter();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
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
    [qIndex, refreshKey],
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
      if (scoreSaved.current) return;
      scoreSaved.current = true;
      await saveScore({
        classe: CLASSE,
        matiere: MATIERE,
        theme: THEME,
        score: score,
        total: questions.length,
      });
      const [best, last] = await Promise.all([
        getBestScore(CLASSE, MATIERE, THEME),
        getLastScore(CLASSE, MATIERE, THEME),
      ]);
      setBestScore(best);
      setLastScore(last);
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
    setRefreshKey((prev) => prev + 1);
  };

  const niveauLabel = (niveau: string) => {
    if (niveau === "facile") return "🟢 Facile";
    if (niveau === "moyen") return "🟡 Moyen";
    return "🔴 Difficile";
  };

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cp/francais/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span> <span className="breadcrumb-sep">›</span>
          <span>CP</span> <span className="breadcrumb-sep">›</span>
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
          <div className="niveau-label">
            {niveauLabel(questions[qIndex].niveau)}
          </div>
        </div>
      )}

      {etape === "lecon" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🌳 Vocabulaire · CP</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>

          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,107,107,0.1)",
                    border: "1px solid rgba(255,107,107,0.3)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#ff6b6b",
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
                  <span className="exemple-label">Exemple :</span> {p.exemple}
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
              ? "Expert des mots !"
              : score >= 7
                ? "Bien joué !"
                : "Continue tes efforts !"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/cp/francais/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
