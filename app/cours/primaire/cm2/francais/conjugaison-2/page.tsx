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
  titre: "Le conditionnel présent",
  intro:
    "Le conditionnel présent exprime une action possible, soumise à une condition, ou une demande polie. Il se forme avec l'infinitif + les terminaisons de l'imparfait.",
  points: [
    {
      titre: "Formation du conditionnel",
      texte:
        "On prend la base du futur simple et on ajoute les terminaisons de l'imparfait : -rais, -rais, -rait, -rions, -riez, -raient.",
      exemple:
        "manger → je mangerais · finir → il finirait · être → nous serions · avoir → vous auriez",
    },
    {
      titre: "Les emplois du conditionnel",
      texte:
        "Le conditionnel exprime : une condition (si + imparfait → conditionnel), une politesse, un souhait, ou une information non confirmée.",
      exemple:
        "Si j'avais le temps, je lirais. · Je voudrais un café, s'il vous plaît. · Il serait arrivé hier.",
    },
    {
      titre: "Les verbes irréguliers",
      texte:
        "Les verbes irréguliers au futur le sont aussi au conditionnel : être → ser-, avoir → aur-, aller → ir-, faire → fer-, venir → viendr-.",
      exemple:
        "Je serais. · Tu aurais. · Il irait. · Nous ferions. · Ils viendraient.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question:
      "Complète au conditionnel : 'Si j'avais le temps, je ___ ce livre.' (lire)",
    options: ["lis", "lirai", "lirais", "lisais"],
    reponse: "lirais",
    explication: "Conditionnel présent avec 'je' : lirais.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quelle terminaison correspond au conditionnel avec 'il' ?",
    options: ["-ra", "-rait", "-ait", "-rais"],
    reponse: "-rait",
    explication: "Au conditionnel, 'il' prend toujours -rait.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Complète au conditionnel : 'Nous ___ contents.' (être)",
    options: ["sommes", "serons", "serions", "étions"],
    reponse: "serions",
    explication: "Conditionnel de 'être' avec 'nous' : serions.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Dans quelle phrase le conditionnel exprime-t-il la POLITESSE ?",
    options: [
      "Si je pouvais, je viendrais.",
      "Je voudrais un café, s'il vous plaît.",
      "Il serait arrivé hier.",
      "Si elle travaillait, elle réussirait.",
    ],
    reponse: "Je voudrais un café, s'il vous plaît.",
    explication: "'voudrais' exprime une demande polie.",
    niveau: "moyen",
  },
  {
    id: 5,
    question:
      "Complète au conditionnel : 'Ils ___ ce problème ensemble.' (pouvoir)",
    options: ["peuvent", "pourront", "pourraient", "pouvaient"],
    reponse: "pourraient",
    explication: "Conditionnel de 'pouvoir' avec 'ils' : pourraient.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quelle phrase contient un conditionnel ?",
    options: [
      "Il mange sa soupe.",
      "Il mangera sa soupe.",
      "Il mangerait sa soupe.",
      "Il mangeait sa soupe.",
    ],
    reponse: "Il mangerait sa soupe.",
    explication: "'mangerait' est au conditionnel présent.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complète : 'Si tu venais, nous ___ ensemble.' (jouer)",
    options: ["jouons", "jouerons", "jouerions", "jouions"],
    reponse: "jouerions",
    explication: "Si + imparfait → conditionnel : 'jouerions'.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Complète au conditionnel : 'Tu ___ une bonne note si tu travaillais.' (avoir)",
    options: ["as", "auras", "aurais", "avais"],
    reponse: "aurais",
    explication: "Conditionnel de 'avoir' avec 'tu' : aurais.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Complète : 'Elle ___ nous aider si elle pouvait.' (vouloir)",
    options: ["veut", "voudra", "voudrait", "voulait"],
    reponse: "voudrait",
    explication: "Conditionnel de 'vouloir' avec 'elle' : voudrait.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quelle phrase utilise correctement le conditionnel ?",
    options: [
      "Si il viendrait, je serai content.",
      "Si il venait, je serais content.",
      "Si il vient, je serais content.",
      "Si il viendra, je suis content.",
    ],
    reponse: "Si il venait, je serais content.",
    explication: "Si + imparfait → conditionnel : 'venait' + 'serais'.",
    niveau: "difficile",
  },
];

const CLASSE = "cm2";
const MATIERE = "francais";
const THEME = "conjugaison-2";

export default function ConjugaisonCM2Page2() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [showPopup, setShowPopup] = useState(false);
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
      if (!estConnecte) {
        setShowPopup(true);
        return;
      }
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
    setShowPopup(false);
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
      {showPopup && <PopupInscription onRecommencer={handleRecommencer} />}
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
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Conjugaison 2</span>
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
          <div className="lecon-badge">⏰ Conjugaison 2 · CM2</div>
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
              let cn = "qcm-option";
              if (selected) {
                if (opt === questionsActives[qIndex].reponse) cn += " correct";
                else if (opt === selected) cn += " incorrect";
                else cn += " disabled";
              }
              return (
                <button
                  key={opt}
                  className={cn}
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
              ? "Tu maîtrises le conditionnel présent ! 🚀"
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
