"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Grammaire 2 — Le nom et l'article (5)
  {
    id: 1,
    theme: "grammaire",
    question: "Quel article va devant : ... chat ?",
    options: ["le", "la", "l'", "une"],
    reponse: "le",
    explication: "'Chat' est masculin : on dit 'le chat'.",
  },
  {
    id: 2,
    theme: "grammaire",
    question: "Choisis l'article pour : ... pomme.",
    options: ["un", "une", "le", "les"],
    reponse: "une",
    explication: "'Pomme' est féminin : on dit 'une pomme'.",
  },
  {
    id: 3,
    theme: "grammaire",
    question: "Si je dis 'LES chiens', combien y a-t-il de chiens ?",
    options: ["un seul", "plusieurs", "aucun", "on ne sait pas"],
    reponse: "plusieurs",
    explication: "'Les' est un article du pluriel.",
  },
  {
    id: 4,
    theme: "grammaire",
    question: "Trouve le bon article pour : ... école.",
    options: ["Le", "La", "L'", "Un"],
    reponse: "L'",
    explication: "Devant une voyelle comme 'e', on utilise 'l''.",
  },
  {
    id: 5,
    theme: "grammaire",
    question: "Dans 'La petite fille', quel mot est le NOM ?",
    options: ["La", "petite", "fille"],
    reponse: "fille",
    explication: "'fille' est le nom. 'La' est l'article.",
  },
  // Conjugaison 2 — Hier, Aujourd'hui, Demain (5)
  {
    id: 6,
    theme: "conjugaison",
    question: "Si je dis 'Hier', de quel temps s'agit-il ?",
    options: ["Le passé", "Le présent", "Le futur"],
    reponse: "Le passé",
    explication: "'Hier' désigne un moment déjà terminé.",
  },
  {
    id: 7,
    theme: "conjugaison",
    question: "Quel mot utilise-t-on pour parler du futur ?",
    options: ["Demain", "Hier", "Maintenant"],
    reponse: "Demain",
    explication: "Le futur, c'est ce qui n'est pas encore arrivé.",
  },
  {
    id: 8,
    theme: "conjugaison",
    question: "'J'ai fini mon dessin.' À quel temps est cette phrase ?",
    options: ["Le passé", "Le présent", "Le futur"],
    reponse: "Le passé",
    explication: "L'action est terminée, c'est le passé.",
  },
  {
    id: 9,
    theme: "conjugaison",
    question: "Lequel de ces mots annonce le futur ?",
    options: ["Plus tard", "Avant", "Déjà"],
    reponse: "Plus tard",
    explication: "'Plus tard' indique que l'action va se passer après.",
  },
  {
    id: 10,
    theme: "conjugaison",
    question: "Trouve l'intrus (le mot qui n'est PAS au présent) :",
    options: ["Aujourd'hui", "Maintenant", "Bientôt"],
    reponse: "Bientôt",
    explication: "'Bientôt' sert à parler du futur.",
  },
  // Orthographe 2 — Les sons complexes (5)
  {
    id: 11,
    theme: "orthographe",
    question: "Comment s'écrit le son 'OU' dans 'P...LE' ?",
    options: ["OU", "OI", "ON", "AU"],
    reponse: "OU",
    explication: "Pour faire le son 'ou', on utilise O+U : une poule.",
  },
  {
    id: 12,
    theme: "orthographe",
    question: "Quel son entends-tu dans le mot 'ROI' ?",
    options: ["oi", "ou", "on", "in"],
    reponse: "oi",
    explication: "Le mot 'roi' se termine par le son 'oi' qui s'écrit O+I.",
  },
  {
    id: 13,
    theme: "orthographe",
    question: "Complète le mot : 'un sav...'",
    options: ["on", "an", "in", "ou"],
    reponse: "on",
    explication: "On dit 'un savon', le son 'on' s'écrit O+N.",
  },
  {
    id: 14,
    theme: "orthographe",
    question: "Dans 'LAPIN', comment s'écrit le son [IN] ?",
    options: ["IN", "UN", "AN", "ON"],
    reponse: "IN",
    explication: "À la fin de lapin, on écrit I+N.",
  },
  {
    id: 15,
    theme: "orthographe",
    question: "Combien de sons complexes y a-t-il dans 'Mouton' ?",
    options: ["2 (ou et on)", "1 (ou)", "1 (on)", "0"],
    reponse: "2 (ou et on)",
    explication: "Il y a le 'ou' (mOU) et le 'on' (tON).",
  },
  // Vocabulaire 2 — Familles de mots (5)
  {
    id: 16,
    theme: "vocabulaire",
    question: "Quel est le mot 'étiquette' pour : Bleu, Rouge, Vert ?",
    options: ["Les couleurs", "Les jouets", "Les habits", "Les fruits"],
    reponse: "Les couleurs",
    explication: "Bleu, rouge et vert sont des noms de couleurs.",
  },
  {
    id: 17,
    theme: "vocabulaire",
    question: "Trouve l'intrus dans cette famille :",
    options: ["Carotte", "Salade", "Ballon", "Poireau"],
    reponse: "Ballon",
    explication:
      "La carotte, la salade et le poireau sont des légumes, pas le ballon.",
  },
  {
    id: 18,
    theme: "vocabulaire",
    question: "Quel mot fait partie de la famille du mot 'DENT' ?",
    options: ["Dentiste", "Doigt", "Danse", "Dormir"],
    reponse: "Dentiste",
    explication: "Le dentiste soigne les dents — même famille.",
  },
  {
    id: 19,
    theme: "vocabulaire",
    question: "Lequel n'appartient PAS à la famille du mot 'LAIT' ?",
    options: ["Laine", "Laitier", "Laitage", "Laiterie"],
    reponse: "Laine",
    explication: "La laine vient du mouton, pas du lait.",
  },
  {
    id: 20,
    theme: "vocabulaire",
    question: "L'étiquette est 'OISEAUX'. Quel mot va dedans ?",
    options: ["Un pigeon", "Un lapin", "Un poisson", "Un chat"],
    reponse: "Un pigeon",
    explication: "Le pigeon est le seul oiseau de la liste.",
  },
];

const themeLabels: Record<string, string> = {
  grammaire: "📝 Grammaire",
  conjugaison: "⏳ Conjugaison",
  orthographe: "👂 Orthographe",
  vocabulaire: "🌳 Vocabulaire",
};

const themeColors: Record<string, string> = {
  grammaire: "#4f8ef7",
  conjugaison: "#2ec4b6",
  orthographe: "#ffd166",
  vocabulaire: "#ff6b6b",
};

export default function BilanCP2Francais() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    grammaire: 0,
    conjugaison: 0,
    orthographe: 0,
    vocabulaire: 0,
  });
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [lastScore, setLastScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const scoreSaved = useRef(false);
  const scoreRef = useRef(0);

  const shuffledQuestions = useMemo(() => shuffleArray(questions), []);
  const shuffledOptions = useMemo(
    () => shuffleArray(shuffledQuestions[qIndex].options),
    [qIndex, shuffledQuestions],
  );
  const progression = Math.round((qIndex / questions.length) * 100);

  useEffect(() => {
    getBestScore("cp", "francais", "bilan-2").then(setBestScore);
    getLastScore("cp", "francais", "bilan-2").then(setLastScore);
  }, []);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === shuffledQuestions[qIndex].reponse;
    if (correct) {
      const theme = shuffledQuestions[qIndex].theme;
      setScores((s) => ({ ...s, [theme]: s[theme] + 1 }));
      setTotalScore((s) => s + 1);
      scoreRef.current += 1;
    }
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= shuffledQuestions.length) {
      if (scoreSaved.current) return;
      scoreSaved.current = true;
      await saveScore({
        classe: "cp",
        matiere: "francais",
        theme: "bilan-2",
        score: scoreRef.current,
        total: 20,
      });
      const [best, last] = await Promise.all([
        getBestScore("cp", "francais", "bilan-2"),
        getLastScore("cp", "francais", "bilan-2"),
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
    scoreRef.current = 0;
    setEtape("intro");
    setQIndex(0);
    setSelected(null);
    setScores({ grammaire: 0, conjugaison: 0, orthographe: 0, vocabulaire: 0 });
    setTotalScore(0);
  };

  const getMention = (score: number) => {
    if (score >= 18)
      return { label: "Excellent !", icon: "🏆", color: "#2ec4b6" };
    if (score >= 14) return { label: "Bien !", icon: "⭐", color: "#4f8ef7" };
    if (score >= 10)
      return { label: "Assez bien !", icon: "👍", color: "#ffd166" };
    return { label: "À revoir !", icon: "💪", color: "#ff6b6b" };
  };

  const mention = getMention(totalScore);

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
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final 2</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final 2 · CP Français</div>
          <h1 className="lecon-titre">Bilan Final 2 — CP Français</h1>
          <p className="lecon-intro">
            Ce bilan regroupe des questions sur les 4 thèmes de la page 2 :
            Grammaire, Conjugaison, Orthographe et Vocabulaire.
          </p>
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
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>📝</span>
              <span>5 questions de Grammaire</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>⏳</span>
              <span>5 questions de Conjugaison</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>👂</span>
              <span>5 questions d'Orthographe</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>🌳</span>
              <span>5 questions de Vocabulaire</span>
            </div>
          </div>
          <div className="bilan-score-info">
            Score final sur <strong>20</strong>
          </div>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Commencer le bilan →
          </button>
        </div>
      )}

      {etape === "qcm" && (
        <>
          <div className="progression-wrapper">
            <div className="progression-info">
              <span>
                Question {qIndex + 1} / {shuffledQuestions.length}
              </span>
              <span
                style={{ color: themeColors[shuffledQuestions[qIndex].theme] }}
              >
                {themeLabels[shuffledQuestions[qIndex].theme]}
              </span>
            </div>
            <div className="progression-bar">
              <div
                className="progression-fill"
                style={{ width: `${progression}%` }}
              ></div>
            </div>
          </div>
          <div className="qcm-wrapper">
            <div className="qcm-question">
              {shuffledQuestions[qIndex].question}
            </div>
            <div className="qcm-options">
              {shuffledOptions.map((opt) => {
                let className = "qcm-option";
                if (selected) {
                  if (opt === shuffledQuestions[qIndex].reponse)
                    className += " correct";
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
                className={`qcm-feedback ${selected === shuffledQuestions[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
              >
                <div className="feedback-icon">
                  {selected === shuffledQuestions[qIndex].reponse ? "✅" : "❌"}
                </div>
                <div className="feedback-texte">
                  <strong>
                    {selected === shuffledQuestions[qIndex].reponse
                      ? "Bravo !"
                      : "Pas tout à fait..."}
                  </strong>
                  <p>{shuffledQuestions[qIndex].explication}</p>
                </div>
              </div>
            )}
            {selected && (
              <button className="lecon-btn" onClick={handleSuivant}>
                {qIndex + 1 >= shuffledQuestions.length
                  ? "Voir mon bilan →"
                  : "Question suivante →"}
              </button>
            )}
          </div>
        </>
      )}

      {etape === "fini" && (
        <div className="resultat-wrapper">
          <div className="resultat-icon">{mention.icon}</div>
          <h2 className="resultat-titre" style={{ color: mention.color }}>
            {mention.label}
          </h2>
          <div className="resultat-score" style={{ color: mention.color }}>
            {totalScore} / 20
          </div>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", margin: "12px 0" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "10px",
                    fontSize: "0.85rem",
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
                    padding: "10px",
                    fontSize: "0.85rem",
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
          <div className="bilan-detail">
            <h3 className="bilan-detail-titre">Détail par thème</h3>
            {Object.entries(scores).map(([theme, score]) => (
              <div key={theme} className="bilan-detail-row">
                <span className="bilan-detail-label">{themeLabels[theme]}</span>
                <div className="bilan-detail-bar-wrapper">
                  <div
                    className="bilan-detail-bar"
                    style={{
                      width: `${(score / 5) * 100}%`,
                      backgroundColor: themeColors[theme],
                    }}
                  ></div>
                </div>
                <span className="bilan-detail-score">{score}/5</span>
              </div>
            ))}
          </div>
          <p className="resultat-desc">
            {totalScore >= 18
              ? "Bravo ! Tu maîtrises parfaitement le CP Français ! 🚀"
              : totalScore >= 14
                ? "Très bon niveau !"
                : totalScore >= 10
                  ? "Tu progresses bien !"
                  : "Courage ! Reprends les leçons et réessaie."}
          </p>
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
