"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Grammaire 2 (5)
  {
    id: 1,
    question:
      "Dans 'Le chat dort dans le jardin', quel est le complément de lieu ?",
    options: ["Le chat", "dort", "dans le jardin", "le"],
    reponse: "dans le jardin",
    explication: "'dans le jardin' répond à 'où ?' → complément de lieu.",
    theme: "grammaire-2",
  },
  {
    id: 2,
    question: "Dans 'Marie mange une pomme', quel est le COD ?",
    options: ["Marie", "mange", "une pomme", "une"],
    reponse: "une pomme",
    explication: "Mange quoi ? → une pomme. C'est le COD.",
    theme: "grammaire-2",
  },
  {
    id: 3,
    question: "Quel signe de ponctuation termine une phrase affirmative ?",
    options: ["?", "!", ",", "."],
    reponse: ".",
    explication: "Le point (.) termine une phrase affirmative.",
    theme: "grammaire-2",
  },
  {
    id: 4,
    question: "Dans 'Il joue le matin', quel est le complément de temps ?",
    options: ["Il", "joue", "le matin", "le"],
    reponse: "le matin",
    explication: "'le matin' répond à 'quand ?' → complément de temps.",
    theme: "grammaire-2",
  },
  {
    id: 5,
    question: "Quelle phrase contient un COD ?",
    options: [
      "Il court vite.",
      "Elle mange une orange.",
      "Nous partons demain.",
      "Tu dors bien.",
    ],
    reponse: "Elle mange une orange.",
    explication: "Mange quoi ? → une orange. C'est le COD.",
    theme: "grammaire-2",
  },
  // Conjugaison 2 (5)
  {
    id: 6,
    question: "Quel temps est utilisé : 'Hier, il a mangé une pizza' ?",
    options: ["présent", "imparfait", "passé composé", "futur"],
    reponse: "passé composé",
    explication:
      "'a mangé' = auxiliaire avoir + participe passé → passé composé.",
    theme: "conjugaison-2",
  },
  {
    id: 7,
    question: "Complète au passé composé : 'Elle ___ ses devoirs.' (finir)",
    options: ["finissait", "finira", "a fini", "finit"],
    reponse: "a fini",
    explication:
      "Passé composé : avoir au présent + participe passé → 'a fini'.",
    theme: "conjugaison-2",
  },
  {
    id: 8,
    question: "Complète au futur : 'Demain, nous ___ en vacances.' (partir)",
    options: ["partions", "partons", "partirons", "sommes partis"],
    reponse: "partirons",
    explication: "Au futur avec 'nous', on dit 'partirons'.",
    theme: "conjugaison-2",
  },
  {
    id: 9,
    question: "Complète au passé composé : 'Nous ___ au cinéma.' (aller)",
    options: ["allons", "allions", "irons", "sommes allés"],
    reponse: "sommes allés",
    explication: "'Aller' utilise 'être' → nous sommes allés.",
    theme: "conjugaison-2",
  },
  {
    id: 10,
    question: "Quelle phrase est au futur ?",
    options: ["J'ai couru.", "Je courais.", "Je cours.", "Je courrai."],
    reponse: "Je courrai.",
    explication: "'courrai' est au futur — terminaison -rai.",
    theme: "conjugaison-2",
  },
  // Orthographe 2 (5)
  {
    id: 11,
    question: "Complète : '___ enfants jouent dans la cour.'",
    options: ["Ses", "Ces", "C'est", "S'est"],
    reponse: "Ces",
    explication: "'Ces' est un déterminant pluriel.",
    theme: "orthographe-2",
  },
  {
    id: 12,
    question: "Complète : 'Il range ___ affaires.'",
    options: ["ces", "c'est", "ses", "s'est"],
    reponse: "ses",
    explication: "'ses' indique la possession.",
    theme: "orthographe-2",
  },
  {
    id: 13,
    question: "Complète : 'Je ___ parle tous les jours.' (leur/leurs)",
    options: ["leurs", "leur"],
    reponse: "leur",
    explication: "'leur' sans -s remplace 'à eux'.",
    theme: "orthographe-2",
  },
  {
    id: 14,
    question: "Complète : '___ les élèves ont réussi.' (tout/tous)",
    options: ["Tout", "Toute", "Tous", "Toutes"],
    reponse: "Tous",
    explication: "'élèves' est masculin pluriel → 'tous'.",
    theme: "orthographe-2",
  },
  {
    id: 15,
    question: "Complète : '___ m'énerve quand tu arrives en retard !' (ça/sa)",
    options: ["Sa", "Ça"],
    reponse: "Ça",
    explication: "'Ça' = cela. On peut dire 'Cela m'énerve' → Ça ✅",
    theme: "orthographe-2",
  },
  // Vocabulaire 2 (5)
  {
    id: 16,
    question: "Quel mot appartient au champ lexical de la mer ?",
    options: ["montagne", "vague", "forêt", "désert"],
    reponse: "vague",
    explication: "'vague' est lié à la mer.",
    theme: "vocabulaire-2",
  },
  {
    id: 17,
    question: "Dans 'Il a le cœur sur la main', quel est le sens ?",
    options: [
      "Il a mal au cœur.",
      "Il est généreux.",
      "Il a la main blessée.",
      "Il est malade.",
    ],
    reponse: "Il est généreux.",
    explication: "Sens figuré : 'avoir le cœur sur la main' = être généreux.",
    theme: "vocabulaire-2",
  },
  {
    id: 18,
    question: "Quel mot appartient au champ lexical de la musique ?",
    options: ["palette", "mélodie", "équation", "robinet"],
    reponse: "mélodie",
    explication: "'mélodie' est liée à la musique.",
    theme: "vocabulaire-2",
  },
  {
    id: 19,
    question: "Quel niveau de langue est : 'Ce truc est trop bien !' ?",
    options: ["Soutenu", "Courant", "Familier", "Scientifique"],
    reponse: "Familier",
    explication: "'truc' et 'trop bien' sont des expressions familières.",
    theme: "vocabulaire-2",
  },
  {
    id: 20,
    question: "Quel groupe de mots forme un champ lexical cohérent ?",
    options: [
      "chien, table, soleil, livre",
      "pluie, nuage, tonnerre, éclair",
      "maison, courir, bleu, hier",
      "chat, voiture, chanter, trois",
    ],
    reponse: "pluie, nuage, tonnerre, éclair",
    explication: "Tous ces mots sont liés à la météo → champ lexical cohérent.",
    theme: "vocabulaire-2",
  },
];

const themeLabels: Record<string, string> = {
  "grammaire-2": "📝 Grammaire",
  "conjugaison-2": "⏰ Conjugaison",
  "orthographe-2": "✏️ Orthographe",
  "vocabulaire-2": "📚 Vocabulaire",
};

const themeColors: Record<string, string> = {
  "grammaire-2": "#4f8ef7",
  "conjugaison-2": "#2ec4b6",
  "orthographe-2": "#ffd166",
  "vocabulaire-2": "#ff6b6b",
};

export default function BilanCE2FrancaisPage2() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "grammaire-2": 0,
    "conjugaison-2": 0,
    "orthographe-2": 0,
    "vocabulaire-2": 0,
  });
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      const b = await getBestScore("ce2", "francais", "bilan-2");
      const l = await getLastScore("ce2", "francais", "bilan-2");
      setBestScore(b);
      setLastScore(l);
    };
    load();
  }, []);

  const shuffledQuestions = useMemo(() => shuffleArray(questions), []);
  const shuffledOptions = useMemo(() => {
    if (!shuffledQuestions[qIndex]) return [];
    return shuffleArray(shuffledQuestions[qIndex].options);
  }, [qIndex, shuffledQuestions]);
  const progression = Math.round((qIndex / questions.length) * 100);

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
      if (!isSaving.current) {
        isSaving.current = true;
        await saveScore({
          classe: "ce2",
          matiere: "francais",
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("ce2", "francais", "bilan-2");
        const l = await getLastScore("ce2", "francais", "bilan-2");
        setBestScore(b);
        setLastScore(l);
      }
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };
  const handleRecommencer = () => {
    isSaving.current = false;
    scoreRef.current = 0;
    setEtape("intro");
    setQIndex(0);
    setSelected(null);
    setScores({
      "grammaire-2": 0,
      "conjugaison-2": 0,
      "orthographe-2": 0,
      "vocabulaire-2": 0,
    });
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
          onClick={() => router.push("/cours/primaire/ce2/francais/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Partie 2</span>
        </div>
      </div>
      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Partie 2 · CE2</div>
          <h1 className="lecon-titre">Bilan Français CE2 — Partie 2</h1>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(46,196,182,0.1)",
                    borderRadius: "12px",
                    border: "1px solid #2ec4b6",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#2ec4b6",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🏆 Record
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {bestScore.score}/20
                  </div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#888",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🕒 Dernier
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="lecon-intro">
            Ce bilan regroupe les 4 thèmes de la partie 2 du CE2 Français.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>📝</span>
              <span>5 questions de Grammaire</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>⏰</span>
              <span>5 questions de Conjugaison</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>✏️</span>
              <span>5 questions d'Orthographe</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>📚</span>
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
                let cn = "qcm-option";
                if (selected) {
                  if (opt === shuffledQuestions[qIndex].reponse)
                    cn += " correct";
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
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(46,196,182,0.1)",
                    borderRadius: "12px",
                    border: "1px solid #2ec4b6",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#2ec4b6",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🏆 Meilleur
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {bestScore.score}/20
                  </div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#888",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🕒 Dernier
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
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
              ? "Bravo, tu maîtrises le français CE2 ! 🚀"
              : totalScore >= 14
                ? "Très bon niveau, continue !"
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
              onClick={() => router.push("/cours/primaire/ce2/francais/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
