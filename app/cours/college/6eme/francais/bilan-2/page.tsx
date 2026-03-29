"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // L'imparfait (5)
  {
    id: 1,
    theme: "imparfait",
    question:
      "Conjugue « chanter » à la 1ère personne du singulier à l'imparfait.",
    options: ["je chantais", "je chantait", "je chante", "je chanterais"],
    reponse: "je chantais",
    explication:
      "L'imparfait : je -ais, tu -ais, il -ait, nous -ions, vous -iez, ils -aient.",
  },
  {
    id: 2,
    theme: "imparfait",
    question:
      "Conjugue « être » à la 3ème personne du singulier à l'imparfait.",
    options: ["il était", "il est", "il soit", "il serait"],
    reponse: "il était",
    explication:
      "Être à l'imparfait : j'étais, tu étais, il était, nous étions, vous étiez, ils étaient.",
  },
  {
    id: 3,
    theme: "imparfait",
    question: "Quelle phrase est à l'imparfait ?",
    options: [
      "Il a mangé une pomme.",
      "Il mangeait tous les soirs.",
      "Il mangera demain.",
      "Mange ta soupe !",
    ],
    reponse: "Il mangeait tous les soirs.",
    explication:
      "'mangeait' = imparfait. Terminaison -ait et habitude dans le passé.",
  },
  {
    id: 4,
    theme: "imparfait",
    question: "Conjugue « finir » à la 2ème personne du pluriel à l'imparfait.",
    options: [
      "vous finissiez",
      "vous finissez",
      "vous finiriez",
      "vous finissaient",
    ],
    reponse: "vous finissiez",
    explication:
      "Les verbes en -ir gardent -iss- à l'imparfait : vous finissiez.",
  },
  {
    id: 5,
    theme: "imparfait",
    question: "Quand utilise-t-on l'imparfait ?",
    options: [
      "Pour une action soudaine",
      "Pour une habitude ou une action qui dure dans le passé",
      "Pour une action future",
      "Pour donner un ordre",
    ],
    reponse: "Pour une habitude ou une action qui dure dans le passé",
    explication:
      "L'imparfait exprime une habitude, une action qui dure ou une description dans le passé.",
  },
  // Les accords (5)
  {
    id: 6,
    theme: "accords",
    question:
      "Quelle est la bonne forme dans : « Les enfants ___ dans la cour. »",
    options: ["joue", "jouent", "jouons", "jouez"],
    reponse: "jouent",
    explication:
      "Le verbe s'accorde avec son sujet 'les enfants' (3ème pers. plur.) → jouent.",
  },
  {
    id: 7,
    theme: "accords",
    question: "Quel adjectif convient dans : « Une robe ___ » (blanc) ?",
    options: ["blanc", "blanche", "blancs", "blanches"],
    reponse: "blanche",
    explication: "L'adjectif s'accorde avec 'robe' (fém. sing.) → blanche.",
  },
  {
    id: 8,
    theme: "accords",
    question:
      "Quel participe passé convient dans : « Elle est ___ au cinéma. » (aller)",
    options: ["allé", "allée", "allés", "allées"],
    reponse: "allée",
    explication:
      "Avec 'être', le participe s'accorde avec le sujet 'elle' (fém. sing.) → allée.",
  },
  {
    id: 9,
    theme: "accords",
    question: "Laquelle de ces phrases est correctement accordée ?",
    options: [
      "Les fleurs est belles.",
      "Les fleurs sont belle.",
      "Les fleurs sont belles.",
      "La fleur sont belle.",
    ],
    reponse: "Les fleurs sont belles.",
    explication:
      "Sujet plur. fém. → verbe plur. + adjectif attribut plur. fém.",
  },
  {
    id: 10,
    theme: "accords",
    question:
      "Comment accorde-t-on l'adjectif pour « Des garçons et des filles ___ » (content) ?",
    options: ["content", "contente", "contents", "contentes"],
    reponse: "contents",
    explication:
      "Noms de genres différents → adjectif au masculin pluriel : contents.",
  },
  // L'orthographe (5)
  {
    id: 11,
    theme: "orthographe",
    question: "Complète : « Il range ___ affaires. »",
    options: ["ces", "ses", "c'est", "s'est"],
    reponse: "ses",
    explication:
      "'ses' = les siennes. Pour vérifier : remplace par 'les siennes' → ses.",
  },
  {
    id: 12,
    theme: "orthographe",
    question: "Complète : « Les enfants ___ fatigués. »",
    options: ["son", "sont", "ses", "ces"],
    reponse: "sont",
    explication:
      "'sont' = verbe être. Pour vérifier : remplace par 'étaient' → sont.",
  },
  {
    id: 13,
    theme: "orthographe",
    question: "Complète : « La ville ___ je vis est belle. »",
    options: ["ou", "où", "ont", "on"],
    reponse: "où",
    explication:
      "'où' indique un lieu. 'ou' = ou bien (choix). Ici c'est un lieu → où.",
  },
  {
    id: 14,
    theme: "orthographe",
    question: "Complète : « Il ___ parti hier. »",
    options: ["est", "et", "ai", "es"],
    reponse: "est",
    explication:
      "'est' = verbe être. Pour vérifier : remplace par 'était' → est.",
  },
  {
    id: 15,
    theme: "orthographe",
    question: "Complète : « ___ mange une pomme. »",
    options: ["On", "Ont", "On't", "Ons"],
    reponse: "On",
    explication:
      "'On' = pronom (= il). 'Ont' = verbe avoir (remplace par avaient).",
  },
  // Le vocabulaire (5)
  {
    id: 16,
    theme: "vocabulaire",
    question: "Quel est le synonyme de « rapide » ?",
    options: ["lent", "prompt", "grand", "fort"],
    reponse: "prompt",
    explication:
      "'prompt' est un synonyme de 'rapide'. 'lent' en est l'antonyme.",
  },
  {
    id: 17,
    theme: "vocabulaire",
    question: "Quel est l'antonyme de « courageux » ?",
    options: ["brave", "vaillant", "lâche", "fort"],
    reponse: "lâche",
    explication:
      "'lâche' est l'antonyme de 'courageux' — ils ont des sens opposés.",
  },
  {
    id: 18,
    theme: "vocabulaire",
    question: "Que signifie le préfixe « in- » dans « invisible » ?",
    options: ["Beaucoup", "Pas du tout", "Très", "Encore"],
    reponse: "Pas du tout",
    explication: "in- = contraire/négation. Invisible = pas visible.",
  },
  {
    id: 19,
    theme: "vocabulaire",
    question: "Quel est le niveau de langue de « bouquin » ?",
    options: ["Soutenu", "Courant", "Familier", "Littéraire"],
    reponse: "Familier",
    explication: "Familier : bouquin / Courant : livre / Soutenu : ouvrage.",
  },
  {
    id: 20,
    theme: "vocabulaire",
    question: "Quel mot est de la même famille que « lumière » ?",
    options: ["lune", "lumineux", "lampe", "soleil"],
    reponse: "lumineux",
    explication: "Lumière → lumin- → lumineux. Même radical, même famille.",
  },
];

const themeLabels: Record<string, string> = {
  imparfait: "⏳ L'imparfait",
  accords: "✅ Les accords",
  orthographe: "🔡 L'orthographe",
  vocabulaire: "📚 Le vocabulaire",
};

const themeColors: Record<string, string> = {
  imparfait: "#4f8ef7",
  accords: "#2ec4b6",
  orthographe: "#ffd166",
  vocabulaire: "#ff6b6b",
};

export default function Bilan2Francais6eme() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    imparfait: 0,
    accords: 0,
    orthographe: 0,
    vocabulaire: 0,
  });
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      const b = await getBestScore("6eme", "francais", "bilan-2");
      const l = await getLastScore("6eme", "francais", "bilan-2");
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
          classe: "6eme",
          matiere: "francais",
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("6eme", "francais", "bilan-2");
        const l = await getLastScore("6eme", "francais", "bilan-2");
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
    setScores({ imparfait: 0, accords: 0, orthographe: 0, vocabulaire: 0 });
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
          onClick={() => router.push("/cours/college/6eme/francais/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>6ème</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan 2</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan 2 · Français 6ème</div>
          <h1 className="lecon-titre">Bilan 2 — Français 6ème</h1>
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
            Ce bilan regroupe les 4 thèmes de Français 6ème — Partie 2.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>⏳</span>
              <span>5 questions — L'imparfait</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>✅</span>
              <span>5 questions — Les accords</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>🔡</span>
              <span>5 questions — L'orthographe</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>📚</span>
              <span>5 questions — Le vocabulaire</span>
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
              ? "Bravo, tu maîtrises le Français 6ème Partie 2 ! 🚀"
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
              onClick={() => router.push("/cours/college/6eme/francais/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
