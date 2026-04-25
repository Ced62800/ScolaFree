"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // La phrase (5)
  {
    id: 1,
    theme: "la-phrase",
    question: "Laquelle de ces phrases est correctement écrite ?",
    options: [
      "le chien court vite.",
      "Le chien court vite.",
      "Le chien court vite",
      "le chien court vite",
    ],
    reponse: "Le chien court vite.",
    explication:
      "Une phrase commence par une majuscule et se termine par un point.",
  },
  {
    id: 2,
    theme: "la-phrase",
    question: "Quelle est la nature de cette phrase : « Ferme ta chambre ! »",
    options: ["Déclarative", "Interrogative", "Exclamative", "Impérative"],
    reponse: "Impérative",
    explication:
      "La phrase impérative exprime un ordre — elle n'a pas de sujet exprimé.",
  },
  {
    id: 3,
    theme: "la-phrase",
    question:
      "Quelle est la forme de cette phrase : « Je ne mange pas de sucre. »",
    options: ["Affirmative", "Négative", "Interrogative", "Exclamative"],
    reponse: "Négative",
    explication: "'ne...pas' indique la forme négative.",
  },
  {
    id: 4,
    theme: "la-phrase",
    question: "Quel est le sujet dans : « Chaque soir, ma mère lit un livre. »",
    options: ["Chaque soir", "ma mère", "lit", "un livre"],
    reponse: "ma mère",
    explication: "Qui est-ce qui lit ? → ma mère = sujet.",
  },
  {
    id: 5,
    theme: "la-phrase",
    question: "Quelle est la nature de cette phrase : « Comme il fait beau ! »",
    options: ["Déclarative", "Interrogative", "Exclamative", "Impérative"],
    reponse: "Exclamative",
    explication: "La phrase exclamative exprime un sentiment fort.",
  },
  // Les classes de mots (5)
  {
    id: 6,
    theme: "classes-de-mots",
    question: "Quelle est la classe grammaticale de « rapidement » ?",
    options: ["Nom", "Adjectif", "Adverbe", "Verbe"],
    reponse: "Adverbe",
    explication:
      "'rapidement' est un adverbe — il modifie le verbe et est invariable.",
  },
  {
    id: 7,
    theme: "classes-de-mots",
    question: "Quelle est la classe grammaticale de « Paris » ?",
    options: ["Nom commun", "Nom propre", "Adjectif", "Déterminant"],
    reponse: "Nom propre",
    explication:
      "'Paris' est un nom propre — il désigne un lieu unique et prend une majuscule.",
  },
  {
    id: 8,
    theme: "classes-de-mots",
    question: "Dans « Elle chante bien », quelle est la classe de « Elle » ?",
    options: ["Nom propre", "Déterminant", "Pronom personnel", "Adjectif"],
    reponse: "Pronom personnel",
    explication: "'Elle' est un pronom personnel — il remplace un nom.",
  },
  {
    id: 9,
    theme: "classes-de-mots",
    question:
      "Dans « Le chat dort sur le tapis », quelle est la classe de « sur » ?",
    options: ["Adverbe", "Préposition", "Conjonction", "Déterminant"],
    reponse: "Préposition",
    explication:
      "'sur' est une préposition — mot invariable qui relie deux éléments.",
  },
  {
    id: 10,
    theme: "classes-de-mots",
    question:
      "Quelle est la classe de « mais » dans « Je veux venir mais je suis fatigué » ?",
    options: [
      "Préposition",
      "Adverbe",
      "Conjonction de coordination",
      "Pronom",
    ],
    reponse: "Conjonction de coordination",
    explication:
      "'mais' est une conjonction de coordination — retiens : mais, ou, et, donc, or, ni, car.",
  },
  // Le groupe nominal (5)
  {
    id: 11,
    theme: "groupe-nominal",
    question: "Quel est le nom noyau dans « un beau jardin fleuri » ?",
    options: ["un", "beau", "jardin", "fleuri"],
    reponse: "jardin",
    explication:
      "'jardin' est le nom noyau — tous les autres mots le qualifient.",
  },
  {
    id: 12,
    theme: "groupe-nominal",
    question: "Lequel de ces GN est correctement accordé ?",
    options: [
      "des petit garçon sage",
      "des petits garçons sages",
      "des petit garçons sage",
      "des petits garçon sages",
    ],
    reponse: "des petits garçons sages",
    explication:
      "Dans un GN au pluriel, le déterminant, le nom et les adjectifs s'accordent tous.",
  },
  {
    id: 13,
    theme: "groupe-nominal",
    question: "Dans « le livre de ma sœur », quel est le complément du nom ?",
    options: ["le livre", "de ma sœur", "ma sœur", "livre"],
    reponse: "de ma sœur",
    explication:
      "'de ma sœur' est un complément du nom introduit par la préposition 'de'.",
  },
  {
    id: 14,
    theme: "groupe-nominal",
    question: "Lequel de ces groupes est un groupe nominal ?",
    options: [
      "court rapidement",
      "la petite fille blonde",
      "très doucement",
      "parce que",
    ],
    reponse: "la petite fille blonde",
    explication:
      "Un GN contient obligatoirement un déterminant et un nom noyau.",
  },
  {
    id: 15,
    theme: "groupe-nominal",
    question: "Comment s'accorde l'adjectif dans un GN ?",
    options: [
      "Il ne s'accorde pas",
      "Il s'accorde avec le verbe",
      "Il s'accorde en genre et en nombre avec le nom noyau",
      "Il s'accorde uniquement en nombre",
    ],
    reponse: "Il s'accorde en genre et en nombre avec le nom noyau",
    explication: "L'adjectif s'accorde toujours avec le nom noyau du GN.",
  },
  // Le présent de l'indicatif (5)
  {
    id: 16,
    theme: "present-indicatif",
    question: "Conjugue « chanter » à la 1ère personne du singulier.",
    options: ["je chantes", "je chante", "je chantons", "je chanti"],
    reponse: "je chante",
    explication: "Les verbes en -er : je -e (sans -s !)",
  },
  {
    id: 17,
    theme: "present-indicatif",
    question: "Conjugue « finir » à la 3ème personne du pluriel.",
    options: ["ils finient", "ils finent", "ils finissent", "ils finont"],
    reponse: "ils finissent",
    explication:
      "Les verbes en -ir du 2ème groupe intercalent -iss- au pluriel.",
  },
  {
    id: 18,
    theme: "present-indicatif",
    question:
      "Quelle est la bonne conjugaison de « être » à la 1ère personne du pluriel ?",
    options: ["nous sommes", "nous êtes", "nous sont", "nous soyons"],
    reponse: "nous sommes",
    explication: "Être : suis/es/est/sommes/êtes/sont.",
  },
  {
    id: 19,
    theme: "present-indicatif",
    question: "Conjugue « avoir » à la 3ème personne du singulier.",
    options: ["il as", "il ai", "il avons", "il a"],
    reponse: "il a",
    explication: "Avoir : ai/as/a/avons/avez/ont.",
  },
  {
    id: 20,
    theme: "present-indicatif",
    question:
      "Quelle terminaison prend « manger » à la 1ère personne du pluriel ?",
    options: ["nous mangons", "nous mangeons", "nous mangens", "nous mangez"],
    reponse: "nous mangeons",
    explication:
      "Les verbes en -ger gardent le -e- avant -ons : nous mangeons.",
  },
];

const themeLabels: Record<string, string> = {
  "la-phrase": "✏️ La phrase",
  "classes-de-mots": "📝 Classes de mots",
  "groupe-nominal": "🔤 Groupe nominal",
  "present-indicatif": "⏱️ Présent indicatif",
};

const themeColors: Record<string, string> = {
  "la-phrase": "#4f8ef7",
  "classes-de-mots": "#2ec4b6",
  "groupe-nominal": "#ffd166",
  "present-indicatif": "#ff6b6b",
};

export default function Bilan1Francais6eme() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "la-phrase": 0,
    "classes-de-mots": 0,
    "groupe-nominal": 0,
    "present-indicatif": 0,
  });
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      const b = await getBestScore("6eme", "francais", "bilan");
      const l = await getLastScore("6eme", "francais", "bilan");
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
          theme: "bilan",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("6eme", "francais", "bilan");
        const l = await getLastScore("6eme", "francais", "bilan");
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
      "la-phrase": 0,
      "classes-de-mots": 0,
      "groupe-nominal": 0,
      "present-indicatif": 0,
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
          onClick={() => router.push("/cours/college/6eme/francais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>6ème</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan 1</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan 1 · Français 6ème</div>
          <h1 className="lecon-titre">Bilan 1 — Français 6ème</h1>
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
            Ce bilan regroupe les 4 thèmes de Français 6ème — Partie 1.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>✏️</span>
              <span>5 questions — La phrase</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>📝</span>
              <span>5 questions — Classes de mots</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>🔤</span>
              <span>5 questions — Groupe nominal</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>⏱️</span>
              <span>5 questions — Présent indicatif</span>
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
              ? "Bravo, tu maîtrises le Français 6ème Partie 1 ! 🚀"
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
              onClick={() => router.push("/cours/college/6eme/francais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
