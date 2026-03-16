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
    theme: "grammaire-2",
    question:
      "Quel pronom relatif introduit la subordonnée dans : 'Le livre que je lis est bon' ?",
    options: ["le", "livre", "que", "lis"],
    reponse: "que",
    explication: "'que' est un pronom relatif → subordonnée relative.",
  },
  {
    id: 2,
    theme: "grammaire-2",
    question: "Quelle subordonnée exprime une CAUSE ?",
    options: [
      "Quand il arrive, je pars.",
      "Je pars parce qu'il arrive.",
      "Je pars si il arrive.",
      "Je pars pour qu'il arrive.",
    ],
    reponse: "Je pars parce qu'il arrive.",
    explication: "'parce que' introduit une subordonnée de cause.",
  },
  {
    id: 3,
    theme: "grammaire-2",
    question: "Quelle subordonnée exprime une CONDITION ?",
    options: [
      "Puisqu'il fait beau, sortons.",
      "Quand il fait beau, je sors.",
      "Si il fait beau, je sortirai.",
      "Bien qu'il fasse beau, je reste.",
    ],
    reponse: "Si il fait beau, je sortirai.",
    explication: "'si' introduit une subordonnée conditionnelle.",
  },
  {
    id: 4,
    theme: "grammaire-2",
    question: "Dans 'La ville où je vis est belle', quel est l'antécédent ?",
    options: ["où", "je", "La ville", "belle"],
    reponse: "La ville",
    explication: "'où' remplace 'La ville' → antécédent.",
  },
  {
    id: 5,
    theme: "grammaire-2",
    question: "Quel pronom relatif signifie 'de qui / duquel' ?",
    options: ["qui", "que", "dont", "où"],
    reponse: "dont",
    explication: "'dont' remplace un complément introduit par 'de'.",
  },
  // Conjugaison 2 (5)
  {
    id: 6,
    theme: "conjugaison-2",
    question:
      "Complète au conditionnel : 'Si j'avais le temps, je ___ ce livre.' (lire)",
    options: ["lis", "lirai", "lirais", "lisais"],
    reponse: "lirais",
    explication: "Conditionnel présent avec 'je' : lirais.",
  },
  {
    id: 7,
    theme: "conjugaison-2",
    question: "Complète au conditionnel : 'Nous ___ contents.' (être)",
    options: ["sommes", "serons", "serions", "étions"],
    reponse: "serions",
    explication: "Conditionnel de 'être' avec 'nous' : serions.",
  },
  {
    id: 8,
    theme: "conjugaison-2",
    question: "Quelle phrase contient un conditionnel ?",
    options: [
      "Il mange sa soupe.",
      "Il mangera sa soupe.",
      "Il mangerait sa soupe.",
      "Il mangeait sa soupe.",
    ],
    reponse: "Il mangerait sa soupe.",
    explication: "'mangerait' est au conditionnel présent.",
  },
  {
    id: 9,
    theme: "conjugaison-2",
    question: "Complète : 'Si tu venais, nous ___ ensemble.' (jouer)",
    options: ["jouons", "jouerons", "jouerions", "jouions"],
    reponse: "jouerions",
    explication: "Si + imparfait → conditionnel : 'jouerions'.",
  },
  {
    id: 10,
    theme: "conjugaison-2",
    question: "Dans quelle phrase le conditionnel exprime-t-il la POLITESSE ?",
    options: [
      "Si je pouvais, je viendrais.",
      "Je voudrais un café, s'il vous plaît.",
      "Il serait arrivé hier.",
      "Si elle travaillait, elle réussirait.",
    ],
    reponse: "Je voudrais un café, s'il vous plaît.",
    explication: "'voudrais' exprime une demande polie.",
  },
  // Orthographe 2 (5)
  {
    id: 11,
    theme: "orthographe-2",
    question: "Complète : '___ il arrive, je partirai.'",
    options: ["Quant", "Quand", "Qu'en", "Cant"],
    reponse: "Quand",
    explication: "'Quand' = lorsque (conjonction de temps).",
  },
  {
    id: 12,
    theme: "orthographe-2",
    question: "Complète : 'Il part ___ son manteau.'",
    options: ["s'en", "c'en", "sans", "sens"],
    reponse: "sans",
    explication: "'sans' = préposition (contraire de avec).",
  },
  {
    id: 13,
    theme: "orthographe-2",
    question: "Complète : '___ à moi, je préfère rester.'",
    options: ["Quand", "Quant", "Qu'en", "Kant"],
    reponse: "Quant",
    explication: "'Quant à' = en ce qui concerne.",
  },
  {
    id: 14,
    theme: "orthographe-2",
    question: "Complète : 'Il ___ va pas souvent.' (ne + y)",
    options: ["ni", "n'y", "si", "s'y"],
    reponse: "n'y",
    explication: "'n'y' = ne + y.",
  },
  {
    id: 15,
    theme: "orthographe-2",
    question: "Complète : 'Je ne veux ___ pain ___ beurre.'",
    options: ["si / si", "ni / ni", "n'y / n'y", "si / ni"],
    reponse: "ni / ni",
    explication: "'ni... ni...' = conjonction de coordination négative.",
  },
  // Vocabulaire 2 (5)
  {
    id: 16,
    theme: "vocabulaire-2",
    question: "Quelle est la racine grecque signifiant 'vie' ?",
    options: ["terra", "aqua", "bio", "sol"],
    reponse: "bio",
    explication: "'bio' vient du grec et signifie 'vie'.",
  },
  {
    id: 17,
    theme: "vocabulaire-2",
    question: "Quel mot vient de la racine latine 'aqua' (eau) ?",
    options: ["solaire", "terrasse", "aquarium", "photographie"],
    reponse: "aquarium",
    explication: "'aquarium' vient de 'aqua' (eau).",
  },
  {
    id: 18,
    theme: "vocabulaire-2",
    question: "Que signifie la racine 'graphe' (grec) ?",
    options: ["lumière", "vie", "eau", "écrire"],
    reponse: "écrire",
    explication: "'graphe' signifie écrire : orthographe, calligraphie.",
  },
  {
    id: 19,
    theme: "vocabulaire-2",
    question: "Dans 'photographie', quelle racine signifie 'lumière' ?",
    options: ["graphe", "photo", "phie", "tographie"],
    reponse: "photo",
    explication: "'photo' vient du grec et signifie lumière.",
  },
  {
    id: 20,
    theme: "vocabulaire-2",
    question: "Quel mot appartient à la même famille que 'biologie' ?",
    options: ["géologie", "biographie", "photographie", "calligraphie"],
    reponse: "biographie",
    explication: "'biographie' contient aussi la racine 'bio' (vie).",
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

export default function BilanCM2FrancaisPage2() {
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
      const b = await getBestScore("cm2", "francais", "bilan-2");
      const l = await getLastScore("cm2", "francais", "bilan-2");
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
          classe: "cm2",
          matiere: "francais",
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("cm2", "francais", "bilan-2");
        const l = await getLastScore("cm2", "francais", "bilan-2");
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
          onClick={() => router.push("/cours/primaire/cm2/francais/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Partie 2</span>
        </div>
      </div>
      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Partie 2 · CM2</div>
          <h1 className="lecon-titre">Bilan Français CM2 — Partie 2</h1>
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
                      fontSize: "0.75rem",
                      color: "#2ec4b6",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🏆 Record
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
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
                      fontSize: "0.75rem",
                      color: "#888",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🕒 Dernier
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="lecon-intro">
            Ce bilan regroupe les 4 thèmes de la partie 2 du CM2 Français.
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
      {etape === "qcm" && shuffledQuestions[qIndex] && (
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
                      fontSize: "0.75rem",
                      color: "#2ec4b6",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🏆 Meilleur
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
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
                      fontSize: "0.75rem",
                      color: "#888",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🕒 Dernier
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
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
              ? "Bravo, tu maîtrises le français CM2 partie 2 ! 🚀"
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
              onClick={() => router.push("/cours/primaire/cm2/francais/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
