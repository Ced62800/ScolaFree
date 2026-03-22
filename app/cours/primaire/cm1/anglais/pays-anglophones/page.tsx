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
  titre: "English-speaking Countries",
  intro:
    "English is spoken in many countries around the world! L'anglais est parlé dans de nombreux pays à travers le monde. Let's discover them!",
  points: [
    {
      titre:
        "Main English-speaking countries — Les principaux pays anglophones",
      texte: "These countries have English as their main or official language.",
      exemple:
        "The United Kingdom 🇬🇧 | The United States 🇺🇸 | Australia 🇦🇺 | Canada 🇨🇦 | Ireland 🇮🇪 | New Zealand 🇳🇿 | South Africa 🇿🇦",
    },
    {
      titre: "Capital cities — Les capitales",
      texte:
        "Each country has a capital city. 'The capital of... is...' = La capitale de... est...",
      exemple:
        "London 🇬🇧 | Washington D.C. 🇺🇸 | Canberra 🇦🇺 | Ottawa 🇨🇦 | Dublin 🇮🇪 | Wellington 🇳🇿",
    },
    {
      titre: "Fun facts — Le saviez-vous ?",
      texte:
        "English is spoken as a first or second language in over 50 countries! Some countries speak both English and other languages, like Canada (English and French).",
      exemple:
        "English is an international language. | Over 1.5 billion people speak English! | The UK is made of England, Scotland, Wales and Northern Ireland.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "What is the capital of the United Kingdom? 🇬🇧",
    options: ["Dublin", "Paris", "London", "Edinburgh"],
    reponse: "London",
    explication:
      "The capital of the UK is London. / La capitale du Royaume-Uni est Londres.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Which country speaks English and has a famous Opera House? 🇦🇺",
    options: ["New Zealand", "Canada", "South Africa", "Australia"],
    reponse: "Australia",
    explication:
      "Australia is famous for the Sydney Opera House. / L'Australie est célèbre pour l'Opéra de Sydney.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "What is the capital of the United States? 🇺🇸",
    options: ["New York", "Los Angeles", "Washington D.C.", "Chicago"],
    reponse: "Washington D.C.",
    explication:
      "The capital of the USA is Washington D.C. / La capitale des États-Unis est Washington D.C.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Which country speaks both English AND French? 🇨🇦",
    options: ["Australia", "Ireland", "Canada", "New Zealand"],
    reponse: "Canada",
    explication:
      "Canada speaks English and French. / Le Canada parle anglais et français.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "What is the capital of Australia? 🇦🇺",
    options: ["Sydney", "Melbourne", "Brisbane", "Canberra"],
    reponse: "Canberra",
    explication:
      "The capital of Australia is Canberra. / La capitale de l'Australie est Canberra.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Which country is Ireland's capital Dublin in? 🇮🇪",
    options: ["The UK", "Ireland", "New Zealand", "South Africa"],
    reponse: "Ireland",
    explication:
      "Dublin is the capital of Ireland. / Dublin est la capitale de l'Irlande.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "How do you say 'La capitale de... est...' in English?",
    options: [
      "The city of... is...",
      "The capital of... is...",
      "The country of... is...",
      "The flag of... is...",
    ],
    reponse: "The capital of... is...",
    explication: "The capital of... is... / La capitale de... est...",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "The UK is made of England, Scotland, Wales and... ?",
    options: ["Ireland", "Northern Ireland", "New Zealand", "Canada"],
    reponse: "Northern Ireland",
    explication: "The UK = England + Scotland + Wales + Northern Ireland.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "What is the capital of Canada? 🇨🇦",
    options: ["Toronto", "Montreal", "Vancouver", "Ottawa"],
    reponse: "Ottawa",
    explication:
      "The capital of Canada is Ottawa. / La capitale du Canada est Ottawa.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Approximately how many people speak English in the world?",
    options: ["500 million", "750 million", "1.5 billion", "3 billion"],
    reponse: "1.5 billion",
    explication:
      "Over 1.5 billion people speak English worldwide. / Plus d'1,5 milliard de personnes parlent anglais dans le monde.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function PaysAnglophonesCM1() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [session, setSession] = useState(0);
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
    [qIndex, session],
  );
  const progression = Math.round((bonnes.length / questionsActives.length) * 100);

  useEffect(() => {
    getBestScore("cm1", "anglais", "pays-anglophones").then(setBestScore);
    getLastScore("cm1", "anglais", "pays-anglophones").then(setLastScore);
  }, []);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questionsActives[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = async (currentScore: number) => {
    if (qIndex + 1 >= questionsActives.length) {
      if (!estConnecte) {
        setShowPopup(true);
        return;
      }
      if (scoreSaved.current) return;
      scoreSaved.current = true;
      await saveScore({
        classe: "cm1",
        matiere: "anglais",
        theme: "pays-anglophones",
        score: currentScore,
        total: questionsActives.length,
      });
      const [best, last] = await Promise.all([
        getBestScore("cm1", "anglais", "pays-anglophones"),
        getLastScore("cm1", "anglais", "pays-anglophones"),
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
    setShowPopup(false);
    setEtape("lecon");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setBonnes([]);
    setSession((s) => s + 1);
  };

  return (
    <div className="cours-page">
      {showPopup && <PopupInscription onRecommencer={handleRecommencer} />}
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cm1/anglais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Anglais</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">English-speaking Countries</span>
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
          <div className="lecon-badge">🌍 English-speaking Countries · CM1</div>
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
                    ? "Well done! 🎉"
                    : "Not quite..."}
                </strong>
                <p>{questionsActives[qIndex].explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button className="lecon-btn" onClick={() => handleSuivant(score)}>
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
          <p className="resultat-desc">
            {score >= 9
              ? "Tu connais parfaitement les pays anglophones !"
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
              onClick={() => router.push("/cours/primaire/cm1/anglais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
