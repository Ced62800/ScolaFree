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
  titre: "Describing People",
  intro:
    "Let's learn how to describe people in English! Décrire quelqu'un en anglais, c'est parler de son physique, sa taille, ses cheveux et ses yeux.",
  points: [
    {
      titre: "Physical appearance — L'apparence physique",
      texte:
        "Use 'He/She has...' to describe physical features. Use 'He/She is...' for size or general appearance.",
      exemple:
        "He is tall. / She is short. / He is thin. / She is strong. / He is young. / She is old.",
    },
    {
      titre: "Hair and eyes — Les cheveux et les yeux",
      texte: "Use 'He/She has... hair' and 'He/She has... eyes'.",
      exemple:
        "She has long hair. | He has short hair. | She has curly hair. | He has straight hair. | She has blue eyes. | He has brown eyes. | She has green eyes.",
    },
    {
      titre: "Describing personality — La personnalité",
      texte: "You can also describe someone's personality. Use 'He/She is...'",
      exemple:
        "She is kind. (gentille) | He is funny. (drôle) | She is clever. (intelligente) | He is shy. (timide) | She is brave. (courageuse) | He is friendly. (sympathique)",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "How do you say 'Elle est grande' in English?",
    options: ["She is short.", "She is tall.", "She is thin.", "She is old."],
    reponse: "She is tall.",
    explication: "She is tall. / Elle est grande.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Complete: 'She ___ long hair.'",
    options: ["is", "have", "has", "are"],
    reponse: "has",
    explication: "She has long hair. / Elle a les cheveux longs.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "What does 'He is funny' mean?",
    options: [
      "Il est timide.",
      "Il est grand.",
      "Il est drôle.",
      "Il est gentil.",
    ],
    reponse: "Il est drôle.",
    explication: "Funny = drôle. / He is funny = Il est drôle.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "How do you say 'Il a les yeux bleus' in English?",
    options: [
      "He has brown eyes.",
      "He has blue eyes.",
      "He is blue.",
      "He has blue hair.",
    ],
    reponse: "He has blue eyes.",
    explication: "He has blue eyes. / Il a les yeux bleus.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "What does 'She has curly hair' mean?",
    options: [
      "Elle a les cheveux longs.",
      "Elle a les cheveux courts.",
      "Elle a les cheveux frisés.",
      "Elle a les cheveux raides.",
    ],
    reponse: "Elle a les cheveux frisés.",
    explication:
      "Curly hair = cheveux frisés. / She has curly hair = Elle a les cheveux frisés.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "What does 'She is kind' mean?",
    options: [
      "Elle est courageuse.",
      "Elle est timide.",
      "Elle est drôle.",
      "Elle est gentille.",
    ],
    reponse: "Elle est gentille.",
    explication: "Kind = gentil(le). / She is kind = Elle est gentille.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complete: 'He ___ short and thin.'",
    options: ["has", "have", "is", "are"],
    reponse: "is",
    explication: "He is short and thin. / Il est petit et mince.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "How do you say 'Il a les cheveux raides' in English?",
    options: [
      "He has curly hair.",
      "He has long hair.",
      "He has straight hair.",
      "He has short hair.",
    ],
    reponse: "He has straight hair.",
    explication:
      "Straight hair = cheveux raides. / He has straight hair = Il a les cheveux raides.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "What does 'He is shy' mean?",
    options: [
      "Il est courageux.",
      "Il est sympa.",
      "Il est timide.",
      "Il est intelligent.",
    ],
    reponse: "Il est timide.",
    explication: "Shy = timide. / He is shy = Il est timide.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Describe this person: tall, long brown hair, green eyes, kind. Choose the correct sentence.",
    options: [
      "She is short. She has blue eyes.",
      "She is tall. She has long brown hair and green eyes. She is kind.",
      "He has long hair. He is kind.",
      "She has short hair and brown eyes.",
    ],
    reponse:
      "She is tall. She has long brown hair and green eyes. She is kind.",
    explication:
      "She is tall. She has long brown hair and green eyes. She is kind. / Elle est grande, a les cheveux longs bruns, les yeux verts et est gentille.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function DecrireQuelquunCM1() {
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
    getBestScore("cm1", "anglais", "decrire-quelquun").then(setBestScore);
    getLastScore("cm1", "anglais", "decrire-quelquun").then(setLastScore);
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
        theme: "decrire-quelquun",
        score: currentScore,
        total: questionsActives.length,
      });
      const [best, last] = await Promise.all([
        getBestScore("cm1", "anglais", "decrire-quelquun"),
        getLastScore("cm1", "anglais", "decrire-quelquun"),
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
          <span className="breadcrumb-active">Describing People</span>
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
          <div className="lecon-badge">👤 Describing People · CM1</div>
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
              ? "Tu sais parfaitement décrire quelqu'un en anglais !"
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
