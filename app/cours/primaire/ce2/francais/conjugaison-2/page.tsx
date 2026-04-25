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
  titre: "Le passé composé et le futur",
  intro:
    "En CE2, on apprend deux nouveaux temps : le passé composé (une action terminée dans le passé) et le futur simple (une action qui aura lieu).",
  points: [
    {
      titre: "Le passé composé",
      texte:
        "Le passé composé se forme avec l'auxiliaire avoir ou être au présent + le participe passé. Il exprime une action terminée.",
      exemple:
        "J'ai mangé. · Tu as joué. · Elle est partie. · Nous avons chanté.",
    },
    {
      titre: "Le futur simple",
      texte:
        "Le futur simple exprime une action qui se passera. Terminaisons : -rai, -ras, -ra, -rons, -rez, -ront.",
      exemple: "Je mangerai. · Tu joueras. · Il viendra. · Nous partirons.",
    },
    {
      titre: "Comment les distinguer ?",
      texte:
        "Le passé composé parle d'une action déjà terminée (hier, la semaine dernière). Le futur parle d'une action à venir (demain, bientôt).",
      exemple:
        "Hier, j'ai mangé une pomme. (PC) · Demain, je mangerai une orange. (futur)",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel temps est utilisé : 'Hier, il a mangé une pizza' ?",
    options: ["présent", "imparfait", "passé composé", "futur"],
    reponse: "passé composé",
    explication:
      "'a mangé' = auxiliaire avoir + participe passé → passé composé.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Complète au passé composé : 'Elle ___ ses devoirs.' (finir)",
    options: ["finissait", "finira", "a fini", "finit"],
    reponse: "a fini",
    explication:
      "Passé composé : avoir au présent + participe passé → 'a fini'.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Complète au futur : 'Demain, nous ___ en vacances.' (partir)",
    options: ["partions", "partons", "partirons", "sommes partis"],
    reponse: "partirons",
    explication: "Au futur avec 'nous', on dit 'partirons'.",
    niveau: "facile",
  },
  {
    id: 4,
    question:
      "Quel auxiliaire utilise-t-on avec les verbes de mouvement au passé composé ?",
    options: ["avoir", "être", "aller", "faire"],
    reponse: "être",
    explication:
      "Les verbes de mouvement (aller, partir, arriver...) utilisent 'être'.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Quelle phrase est au passé composé ?",
    options: ["Il mange.", "Il mangera.", "Il mangeait.", "Il a mangé."],
    reponse: "Il a mangé.",
    explication: "'a mangé' = auxiliaire avoir + participe passé.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Complète au passé composé : 'Nous ___ au cinéma.' (aller)",
    options: ["allons", "allions", "irons", "sommes allés"],
    reponse: "sommes allés",
    explication: "'Aller' utilise 'être' → nous sommes allés.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complète au futur : 'Ils ___ le match.' (gagner)",
    options: ["gagnaient", "gagnent", "gagneront", "ont gagné"],
    reponse: "gagneront",
    explication: "Au futur avec 'ils', on ajoute -ront : 'gagneront'.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Complète au passé composé : 'Tu ___ la vérité.' (dire)",
    options: ["disais", "diras", "as dit", "dis"],
    reponse: "as dit",
    explication:
      "Passé composé : avoir au présent + participe passé de dire → 'as dit'.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Quelle phrase est au futur ?",
    options: ["J'ai couru.", "Je courais.", "Je cours.", "Je courrai."],
    reponse: "Je courrai.",
    explication: "'courrai' est au futur — terminaison -rai.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Complète au passé composé : 'Les élèves ___ leurs exercices.' (rendre)",
    options: ["rendent", "rendaient", "ont rendu", "rendront"],
    reponse: "ont rendu",
    explication:
      "Passé composé : avoir au présent + participe passé de rendre → 'ont rendu'.",
    niveau: "difficile",
  },
];

const CLASSE = "ce2";
const MATIERE = "francais";
const THEME = "conjugaison-2";

export default function ConjugaisonCE2Page2() {
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
          <span>CE2</span>
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
          <div className="lecon-badge">⏰ Conjugaison 2 · CE2</div>
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
              ? "Tu maîtrises parfaitement le passé composé et le futur ! 🚀"
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
