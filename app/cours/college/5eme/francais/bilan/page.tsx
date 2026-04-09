"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Le récit (5)
  {
    id: 1,
    theme: "le-recit",
    question: "Quelles sont les 5 étapes du schéma narratif dans l'ordre ?",
    options: [
      "SI → EP → Péripéties → ER → SF",
      "EP → SI → Péripéties → SF → ER",
      "SI → Péripéties → EP → ER → SF",
      "Péripéties → SI → EP → ER → SF",
    ],
    reponse: "SI → EP → Péripéties → ER → SF",
    explication:
      "Situation Initiale → Élément Perturbateur → Péripéties → Élément de Résolution → Situation Finale.",
  },
  {
    id: 2,
    theme: "le-recit",
    question: "Le narrateur omniscient est un narrateur qui...",
    options: [
      "Raconte à la 1ère personne",
      "Est un personnage de l'histoire",
      "Connaît les pensées de tous les personnages",
      "Ne sait rien sur les personnages",
    ],
    reponse: "Connaît les pensées de tous les personnages",
    explication:
      "Omniscient = qui sait tout. Il connaît les pensées de tous les personnages.",
  },
  {
    id: 3,
    theme: "le-recit",
    question:
      "Quel temps verbal est principalement utilisé pour les actions principales dans un récit au passé ?",
    options: ["L'imparfait", "Le présent", "Le passé simple", "Le futur"],
    reponse: "Le passé simple",
    explication:
      "Le passé simple exprime les actions principales qui font avancer le récit.",
  },
  {
    id: 4,
    theme: "le-recit",
    question: "Qu'est-ce qu'un récit enchâssé ?",
    options: [
      "Un récit très court",
      "Un récit dans un autre récit",
      "Un récit sans fin",
      "Un récit au présent",
    ],
    reponse: "Un récit dans un autre récit",
    explication:
      "Un récit enchâssé est une histoire racontée à l'intérieur d'une autre histoire.",
  },
  {
    id: 5,
    theme: "le-recit",
    question: "Le narrateur interne raconte à quelle personne ?",
    options: [
      "2ème personne",
      "3ème personne",
      "1ère personne",
      "Toutes les personnes",
    ],
    reponse: "1ère personne",
    explication:
      "Le narrateur interne est un personnage de l'histoire et raconte à la 1ère personne (je).",
  },
  // La poésie (5)
  {
    id: 6,
    theme: "la-poesie",
    question:
      "Quelle est la différence entre une métaphore et une comparaison ?",
    options: [
      "La métaphore utilise 'comme', pas la comparaison",
      "La comparaison utilise 'comme', pas la métaphore",
      "Elles sont identiques",
      "La métaphore est plus longue",
    ],
    reponse: "La comparaison utilise 'comme', pas la métaphore",
    explication:
      "Métaphore = sans 'comme'. Comparaison = avec 'comme'. 'La vie est un voyage' (métaphore) vs 'La vie est comme un voyage' (comparaison).",
  },
  {
    id: 7,
    theme: "la-poesie",
    question: "Combien de syllabes compte un alexandrin ?",
    options: ["8", "10", "12", "14"],
    reponse: "12",
    explication: "L'alexandrin est le vers classique français à 12 syllabes.",
  },
  {
    id: 8,
    theme: "la-poesie",
    question: "Qu'est-ce qu'une allitération ?",
    options: [
      "Répétition d'une voyelle",
      "Répétition d'une consonne",
      "Une rime embrassée",
      "Une métaphore filée",
    ],
    reponse: "Répétition d'une consonne",
    explication:
      "L'allitération est la répétition d'un même son consonantique dans des mots proches.",
  },
  {
    id: 9,
    theme: "la-poesie",
    question: "Quel est le schéma de la rime embrassée ?",
    options: ["ABAB", "ABBA", "AABB", "ABCD"],
    reponse: "ABBA",
    explication:
      "La rime embrassée suit le schéma ABBA : la rime extérieure embrasse la rime intérieure.",
  },
  {
    id: 10,
    theme: "la-poesie",
    question: "Qu'est-ce qu'une hyperbole ?",
    options: [
      "Une litote",
      "Une exagération volontaire",
      "Une comparaison avec la nature",
      "Une répétition de mots",
    ],
    reponse: "Une exagération volontaire",
    explication:
      "L'hyperbole est une exagération volontaire pour créer un effet. Ex: 'Je t'ai dit mille fois...'",
  },
  // Le groupe nominal (5)
  {
    id: 11,
    theme: "le-groupe-nominal",
    question: "Qu'est-ce qu'un adjectif épithète ?",
    options: [
      "Un adjectif séparé du nom par un verbe",
      "Un adjectif directement rattaché au nom",
      "Un adjectif employé seul",
      "Un pronom",
    ],
    reponse: "Un adjectif directement rattaché au nom",
    explication:
      "L'adjectif épithète est directement rattaché au nom, sans verbe entre eux.",
  },
  {
    id: 12,
    theme: "le-groupe-nominal",
    question: "Quel est le noyau du GN 'une belle maison rouge' ?",
    options: ["une", "belle", "maison", "rouge"],
    reponse: "maison",
    explication: "Le noyau du GN est toujours le nom principal. Ici : maison.",
  },
  {
    id: 13,
    theme: "le-groupe-nominal",
    question: "Qu'est-ce qu'une apposition ?",
    options: [
      "Un adjectif épithète",
      "Un nom placé à côté d'un autre nom pour le préciser",
      "Un pronom relatif",
      "Un complément d'objet",
    ],
    reponse: "Un nom placé à côté d'un autre nom pour le préciser",
    explication:
      "L'apposition est un nom ou GN placé à côté d'un autre nom pour apporter une précision, souvent entre virgules.",
  },
  {
    id: 14,
    theme: "le-groupe-nominal",
    question: "Comment s'accorde l'adjectif épithète ?",
    options: [
      "Il ne s'accorde pas",
      "Il s'accorde en genre et nombre avec le nom",
      "Il s'accorde seulement en nombre",
      "Il s'accorde avec le sujet",
    ],
    reponse: "Il s'accorde en genre et nombre avec le nom",
    explication:
      "L'adjectif épithète s'accorde en genre (masculin/féminin) et en nombre (singulier/pluriel) avec le nom.",
  },
  {
    id: 15,
    theme: "le-groupe-nominal",
    question: "La proposition relative est introduite par...",
    options: [
      "Une préposition",
      "Un pronom relatif (qui, que, dont, où...)",
      "Un adverbe",
      "Un article",
    ],
    reponse: "Un pronom relatif (qui, que, dont, où...)",
    explication:
      "La proposition relative est introduite par un pronom relatif et complète un nom antécédent.",
  },
  // Le verbe (5)
  {
    id: 16,
    theme: "le-verbe",
    question: "À quel groupe appartient le verbe 'grandir' ?",
    options: ["1er groupe", "2ème groupe", "3ème groupe", "Verbe irrégulier"],
    reponse: "2ème groupe",
    explication:
      "Grandir → grandissant. Les verbes en -ir dont le participe présent se termine en -issant = 2ème groupe.",
  },
  {
    id: 17,
    theme: "le-verbe",
    question: "Comment se forme la voix passive ?",
    options: [
      "Auxiliaire avoir + participe passé",
      "Auxiliaire être + participe passé",
      "Verbe modal + infinitif",
      "Verbe pronominal",
    ],
    reponse: "Auxiliaire être + participe passé",
    explication:
      "La voix passive = auxiliaire ÊTRE (conjugué) + participe passé accordé avec le sujet.",
  },
  {
    id: 18,
    theme: "le-verbe",
    question: "Quel mode exprime un ordre ou un conseil ?",
    options: ["Indicatif", "Subjonctif", "Impératif", "Conditionnel"],
    reponse: "Impératif",
    explication:
      "L'impératif exprime un ordre, un conseil ou une demande. Il n'a pas de pronom sujet exprimé.",
  },
  {
    id: 19,
    theme: "le-verbe",
    question: "Qu'est-ce qu'un verbe d'état ?",
    options: [
      "Un verbe d'action physique",
      "Un verbe qui relie le sujet à un attribut",
      "Un verbe au passé",
      "Un verbe pronominal",
    ],
    reponse: "Un verbe qui relie le sujet à un attribut",
    explication:
      "Les verbes d'état (être, paraître, sembler, devenir...) relient le sujet à son attribut.",
  },
  {
    id: 20,
    theme: "le-verbe",
    question: "Conjuguez 'aller' à la 1ère personne du singulier du présent.",
    options: ["j'alle", "je vais", "j'allais", "j'irai"],
    reponse: "je vais",
    explication:
      "Aller est très irrégulier au présent : je vais, tu vas, il va, nous allons, vous allez, ils vont.",
  },
];

const themeLabels: Record<string, string> = {
  "le-recit": "📖 Le récit",
  "la-poesie": "🎭 La poésie",
  "le-groupe-nominal": "📝 Le groupe nominal",
  "le-verbe": "⏰ Le verbe",
};

const themeColors: Record<string, string> = {
  "le-recit": "#4f8ef7",
  "la-poesie": "#2ec4b6",
  "le-groupe-nominal": "#ffd166",
  "le-verbe": "#ff6b6b",
};

export default function BilanFrancais5eme() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "le-recit": 0,
    "la-poesie": 0,
    "le-groupe-nominal": 0,
    "le-verbe": 0,
  });
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      setEstConnecte(!!user);
      if (user) {
        const b = await getBestScore("5eme", "francais", "bilan");
        const l = await getLastScore("5eme", "francais", "bilan");
        setBestScore(b);
        setLastScore(l);
      }
      setChargement(false);
    };
    init();
  }, []);

  const shuffledQuestions = useMemo(() => shuffleArray(questions), []);
  const shuffledOptions = useMemo(() => {
    if (!shuffledQuestions[qIndex]) return [];
    return shuffleArray(shuffledQuestions[qIndex].options);
  }, [qIndex, shuffledQuestions]);

  const progression = ((qIndex + 1) / shuffledQuestions.length) * 100;
  const totalScore = scoreRef.current;

  const mention =
    totalScore >= 18
      ? { label: "Excellent !", icon: "🏆", color: "#2ec4b6" }
      : totalScore >= 14
        ? { label: "Très bien !", icon: "⭐", color: "#4f8ef7" }
        : totalScore >= 10
          ? { label: "Bien !", icon: "👍", color: "#ffd166" }
          : { label: "Continue !", icon: "💪", color: "#ff6b6b" };

  const handleReponse = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === shuffledQuestions[qIndex].reponse) {
      scoreRef.current += 1;
      setScores((prev) => ({
        ...prev,
        [shuffledQuestions[qIndex].theme]:
          (prev[shuffledQuestions[qIndex].theme] || 0) + 1,
      }));
    }
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= shuffledQuestions.length) {
      if (!isSaving.current && estConnecte) {
        isSaving.current = true;
        await saveScore({
          classe: "5eme",
          matiere: "francais",
          theme: "bilan",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("5eme", "francais", "bilan");
        const l = await getLastScore("5eme", "francais", "bilan");
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
    scoreRef.current = 0;
    isSaving.current = false;
    setScores({
      "le-recit": 0,
      "la-poesie": 0,
      "le-groupe-nominal": 0,
      "le-verbe": 0,
    });
    setQIndex(0);
    setSelected(null);
    setEtape("qcm");
  };

  if (chargement)
    return (
      <div style={{ textAlign: "center", padding: "80px", color: "#aaa" }}>
        Chargement...
      </div>
    );

  if (!estConnecte)
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div
          style={{
            maxWidth: "500px",
            margin: "80px auto",
            textAlign: "center",
            padding: "0 20px",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🔒</div>
          <h2
            style={{
              color: "#fff",
              fontSize: "1.5rem",
              fontWeight: 800,
              marginBottom: "12px",
            }}
          >
            Bilan réservé aux inscrits
          </h2>
          <p style={{ color: "#aaa", marginBottom: "24px", lineHeight: "1.6" }}>
            Inscris-toi gratuitement pour accéder au bilan et sauvegarder tes
            scores !
          </p>
          <button
            onClick={() => router.push("/inscription")}
            style={{
              background: "linear-gradient(135deg, #f7974f, #f74f4f)",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              padding: "16px 32px",
              fontWeight: 800,
              fontSize: "1rem",
              cursor: "pointer",
              width: "100%",
            }}
          >
            ✨ S'inscrire gratuitement →
          </button>
        </div>
      </div>
    );

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button className="cours-back" onClick={() => router.back()}>
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span
            onClick={() => router.push("/cours/college/5eme/francais")}
            style={{ cursor: "pointer" }}
          >
            Français 5ème
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan · Français 5ème</div>
          <h1 className="lecon-titre">Bilan — Français 5ème</h1>
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
            Ce bilan regroupe les 4 thèmes de Français 5ème — Partie 1.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>📖</span>
              <span>5 questions — Le récit</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>🎭</span>
              <span>5 questions — La poésie</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>📝</span>
              <span>5 questions — Le groupe nominal</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>⏰</span>
              <span>5 questions — Le verbe</span>
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
                      ? "Bravo ! 🎉"
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
              ? "Bravo, tu maîtrises le Français 5ème Partie 1 ! 🚀"
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
              onClick={() => router.push("/cours/college/5eme/francais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
