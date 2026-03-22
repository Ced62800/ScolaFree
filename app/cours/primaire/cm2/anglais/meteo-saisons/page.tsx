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
  titre: "Weather & Seasons",
  intro:
    "Let's learn how to talk about the weather and seasons in English! Parler de la météo et des saisons est essentiel pour communiquer au quotidien.",
  points: [
    {
      titre: "Weather — La météo",
      texte: "To describe the weather, use 'It is...' or 'It's...'",
      exemple:
        "It's sunny. ☀️ | It's cloudy. ☁️ | It's raining. 🌧️ | It's snowing. ❄️ | It's windy. 💨 | It's hot. 🥵 | It's cold. 🥶 | It's foggy. 🌫️",
    },
    {
      titre: "Seasons — Les saisons",
      texte:
        "There are 4 seasons. Use 'In...' to say what happens each season.",
      exemple:
        "Spring 🌸 (le printemps) | Summer ☀️ (l'été) | Autumn 🍂 (l'automne) | Winter ❄️ (l'hiver)",
    },
    {
      titre: "Asking about the weather — Parler de la météo",
      texte:
        "'What's the weather like?' = Quel temps fait-il ? / 'What's your favourite season?' = Quelle est ta saison préférée ?",
      exemple:
        "What's the weather like? — It's sunny and hot! / In summer, it is hot. / In winter, it is cold and it snows.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "How do you say 'Il fait soleil' in English?",
    options: ["It's cloudy.", "It's raining.", "It's sunny.", "It's windy."],
    reponse: "It's sunny.",
    explication: "It's sunny. / Il fait soleil.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "What season comes after Summer? 🍂",
    options: ["Spring", "Winter", "Autumn", "Summer"],
    reponse: "Autumn",
    explication: "After summer comes autumn. / Après l'été vient l'automne.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "How do you say 'Il neige' in English?",
    options: ["It's raining.", "It's foggy.", "It's cold.", "It's snowing."],
    reponse: "It's snowing.",
    explication: "It's snowing. / Il neige.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "How do you ask 'Quel temps fait-il ?' in English?",
    options: [
      "What time is it?",
      "What's the weather like?",
      "What season is it?",
      "How are you?",
    ],
    reponse: "What's the weather like?",
    explication: "What's the weather like? / Quel temps fait-il ?",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Which season is hot and sunny? ☀️",
    options: ["Winter", "Autumn", "Spring", "Summer"],
    reponse: "Summer",
    explication: "Summer is hot and sunny. / L'été est chaud et ensoleillé.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "How do you say 'Il fait froid' in English?",
    options: ["It's hot.", "It's windy.", "It's cold.", "It's foggy."],
    reponse: "It's cold.",
    explication: "It's cold. / Il fait froid.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complete: '___ winter, it is cold and it snows.'",
    options: ["At", "On", "In", "During"],
    reponse: "In",
    explication: "In winter, it is cold. / En hiver, il fait froid.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "What season has flowers and rain? 🌸",
    options: ["Summer", "Autumn", "Winter", "Spring"],
    reponse: "Spring",
    explication:
      "Spring has flowers and rain. / Le printemps a des fleurs et de la pluie.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "How do you say 'Il y a du vent' in English?",
    options: ["It's raining.", "It's cloudy.", "It's windy.", "It's stormy."],
    reponse: "It's windy.",
    explication: "It's windy. / Il y a du vent.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Tom says: 'In autumn, the leaves fall.' What does this mean?",
    options: [
      "En été, les feuilles poussent.",
      "En automne, les feuilles tombent.",
      "En hiver, les feuilles tombent.",
      "Au printemps, les feuilles tombent.",
    ],
    reponse: "En automne, les feuilles tombent.",
    explication:
      "In autumn, the leaves fall. / En automne, les feuilles tombent.",
    niveau: "difficile",
  },
];

const CLASSE = "cm2";
const MATIERE = "anglais";
const THEME = "meteo-saisons";

export default function MeteoSaisonsCM2() {
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
          onClick={() => router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Anglais</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Weather & Seasons</span>
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
          <div className="lecon-badge">🌤️ Weather & Seasons · CM2</div>
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
                    ? "Well done! 🎉"
                    : "Not quite..."}
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
              ? "Excellent!"
              : score >= 7
                ? "Well done!"
                : score >= 5
                  ? "Good job!"
                  : "Keep trying!"}
          </h2>
          <div className="resultat-score">
            {score} / {questionsActives.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu maîtrises parfaitement la météo et les saisons en anglais ! 🚀"
              : score >= 7
                ? "Tu as bien compris l'essentiel !"
                : score >= 5
                  ? "Encore quelques efforts !"
                  : "Relis la leçon et réessaie !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() =>
                router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)
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
