"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Figures de style (5)
  {
    id: 1,
    theme: "les-figures-de-style",
    question: "Identifie la figure : 'Ses yeux sont des étoiles.'",
    options: ["Comparaison", "Métaphore", "Personnification", "Hyperbole"],
    reponse: "Métaphore",
    explication:
      "Métaphore = identification directe sans outil comparatif. Pas de 'comme' → métaphore.",
  },
  {
    id: 2,
    theme: "les-figures-de-style",
    question: "Identifie la figure : 'Le vent gémissait dans les arbres.'",
    options: ["Métaphore", "Comparaison", "Personnification", "Allitération"],
    reponse: "Personnification",
    explication:
      "Personnification = traits humains (gémit) appliqués à un phénomène naturel (le vent).",
  },
  {
    id: 3,
    theme: "les-figures-de-style",
    question: "Qu'est-ce qu'une hyperbole ?",
    options: [
      "Une atténuation",
      "Une exagération volontaire",
      "Une répétition de sons",
      "Un rapprochement de contraires",
    ],
    reponse: "Une exagération volontaire",
    explication:
      "Hyperbole = exagération. 'Je meurs de faim', 'j'ai dit mille fois', 'une éternité'.",
  },
  {
    id: 4,
    theme: "les-figures-de-style",
    question: "Qu'est-ce qu'une litote ?",
    options: [
      "Une exagération",
      "Dire moins pour suggérer plus",
      "Une répétition",
      "Une comparaison",
    ],
    reponse: "Dire moins pour suggérer plus",
    explication:
      "Litote = atténuation ironique. 'Ce n'est pas mal' = c'est très bien. Contraire de l'hyperbole.",
  },
  {
    id: 5,
    theme: "les-figures-de-style",
    question: "Qu'est-ce qu'un oxymore ?",
    options: [
      "Une répétition",
      "Un rapprochement de deux termes contradictoires",
      "Une exagération",
      "Une personnification",
    ],
    reponse: "Un rapprochement de deux termes contradictoires",
    explication:
      "Oxymore = contraires collés. 'Cette obscure clarté', 'douce violence', 'silence éloquent'.",
  },
  // Phrase complexe (5)
  {
    id: 6,
    theme: "la-phrase-complexe",
    question: "Qu'est-ce que la juxtaposition ?",
    options: [
      "Relier avec 'et'",
      "Relier avec 'mais'",
      "Mettre côte à côte avec virgule ou point-virgule",
      "Insérer une proposition dans une autre",
    ],
    reponse: "Mettre côte à côte avec virgule ou point-virgule",
    explication:
      "Juxtaposition = pas de conjonction, juste virgule ou point-virgule. 'Je suis venu, j'ai vu, j'ai vaincu.'",
  },
  {
    id: 7,
    theme: "la-phrase-complexe",
    question: "Qu'est-ce qu'une subordonnée relative ?",
    options: [
      "Introduite par 'que' après un verbe",
      "Introduite par qui/que/dont/où après un nom",
      "Introduite par 'si'",
      "Introduite par 'parce que'",
    ],
    reponse: "Introduite par qui/que/dont/où après un nom",
    explication:
      "Relative = pronom relatif + complète un NOM (antécédent). 'Le livre QUE je lis' (complète 'livre').",
  },
  {
    id: 8,
    theme: "la-phrase-complexe",
    question: "Qu'exprime 'bien que' + subjonctif ?",
    options: ["La cause", "La conséquence", "La concession", "Le but"],
    reponse: "La concession",
    explication:
      "Bien que + subjonctif = concession. 'Bien qu'il soit fatigué, il continue.' Toujours subjonctif !",
  },
  {
    id: 9,
    theme: "la-phrase-complexe",
    question: "Quelles sont les conjonctions de coordination ?",
    options: [
      "car, parce que, puisque",
      "MAIS OU ET DONC OR NI CAR",
      "qui, que, dont, où",
      "bien que, quoique",
    ],
    reponse: "MAIS OU ET DONC OR NI CAR",
    explication:
      "Moyen mnémotechnique : MAIS OU ET DONC OR NI CAR = les 7 conjonctions de coordination.",
  },
  {
    id: 10,
    theme: "la-phrase-complexe",
    question: "Qu'est-ce qu'une subordonnée de but ?",
    options: [
      "Introduite par 'parce que'",
      "Introduite par 'pour que' + subjonctif",
      "Introduite par 'si'",
      "Introduite par 'bien que'",
    ],
    reponse: "Introduite par 'pour que' + subjonctif",
    explication:
      "But = pour que, afin que + SUBJONCTIF. 'Je travaille pour que tu réussisses.' But ≠ cause.",
  },
  // Connecteurs (5)
  {
    id: 11,
    theme: "les-connecteurs",
    question: "Quel connecteur exprime la cause ?",
    options: ["donc", "cependant", "car", "ainsi"],
    reponse: "car",
    explication:
      "Car = cause (pourquoi ?). Donc = conséquence. Cependant = opposition. Bien que = concession.",
  },
  {
    id: 12,
    theme: "les-connecteurs",
    question: "Quel connecteur exprime la conséquence ?",
    options: ["car", "pourtant", "par conséquent", "bien que"],
    reponse: "par conséquent",
    explication:
      "Par conséquent, donc, c'est pourquoi, ainsi = conséquence. Car = cause. Sens inverse !",
  },
  {
    id: 13,
    theme: "les-connecteurs",
    question: "Quel connecteur exprime l'opposition ?",
    options: ["car", "donc", "cependant", "puisque"],
    reponse: "cependant",
    explication:
      "Cependant, mais, pourtant, néanmoins, en revanche = opposition. Deux idées s'affrontent.",
  },
  {
    id: 14,
    theme: "les-connecteurs",
    question: "Quel est l'ordre logique : d'abord, ensuite, enfin ?",
    options: ["Opposition", "Cause", "Énumération/progression", "Concession"],
    reponse: "Énumération/progression",
    explication:
      "D'abord, ensuite, enfin = progression chronologique ou logique. Très utiles dans l'argumentation.",
  },
  {
    id: 15,
    theme: "les-connecteurs",
    question: "Quel connecteur introduit un exemple ?",
    options: ["cependant", "par exemple", "donc", "car"],
    reponse: "par exemple",
    explication:
      "Par exemple, notamment, ainsi, tel que = illustration. C'est-à-dire = explication. En effet = preuve.",
  },
  // Lexique (5)
  {
    id: 16,
    theme: "le-lexique",
    question: "Qu'est-ce qu'un synonyme ?",
    options: [
      "Un mot de sens contraire",
      "Un mot de sens proche",
      "Un mot de même son",
      "Un mot de même famille",
    ],
    reponse: "Un mot de sens proche",
    explication:
      "Synonyme = sens proche (pas identique). Beau/joli/magnifique. Évite les répétitions.",
  },
  {
    id: 17,
    theme: "le-lexique",
    question: "Qu'est-ce qu'un champ lexical ?",
    options: [
      "Synonymes d'un mot",
      "Ensemble des mots liés à un même thème",
      "Famille d'un mot",
      "Différents sens d'un mot",
    ],
    reponse: "Ensemble des mots liés à un même thème",
    explication:
      "Champ lexical = famille THÉMATIQUE. Mer : vagues, tempête, marin, horizon... Identifie le sujet !",
  },
  {
    id: 18,
    theme: "le-lexique",
    question: "Quelle est la différence entre sens propre et sens figuré ?",
    options: [
      "Propre = récent",
      "Propre = littéral, figuré = imagé",
      "Figuré = plus courant",
      "Pas de différence",
    ],
    reponse: "Propre = littéral, figuré = imagé",
    explication:
      "Propre = concret/réel. Figuré = imagé/métaphore. 'Cœur brisé' = figuré (triste, pas cassé).",
  },
  {
    id: 19,
    theme: "le-lexique",
    question: "Qu'est-ce qu'un néologisme ?",
    options: [
      "Un mot très ancien",
      "Un mot nouveau créé récemment",
      "Un mot d'origine latine",
      "Un antonyme",
    ],
    reponse: "Un mot nouveau créé récemment",
    explication:
      "Néologisme = mot nouveau. Selfie, hashtag, covoiturage = néologismes récents.",
  },
  {
    id: 20,
    theme: "le-lexique",
    question: "Qu'est-ce que l'étymologie ?",
    options: [
      "La définition",
      "L'étude de l'origine des mots",
      "La liste des synonymes",
      "La prononciation",
    ],
    reponse: "L'étude de l'origine des mots",
    explication:
      "Étymologie = origine des mots. Bio = vie, logos = étude. Biologie = étude du vivant. Racines utiles !",
  },
];

const themeLabels: Record<string, string> = {
  "les-figures-de-style": "✨ Figures de style",
  "la-phrase-complexe": "🔗 Phrase complexe",
  "les-connecteurs": "➡️ Connecteurs logiques",
  "le-lexique": "📝 Le lexique",
};
const themeColors: Record<string, string> = {
  "les-figures-de-style": "#4f8ef7",
  "la-phrase-complexe": "#2ec4b6",
  "les-connecteurs": "#ffd166",
  "le-lexique": "#ff6b6b",
};

export default function BilanFrancais4eme2() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "les-figures-de-style": 0,
    "la-phrase-complexe": 0,
    "les-connecteurs": 0,
    "le-lexique": 0,
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
        setBestScore(await getBestScore("4eme", "francais", "bilan-2"));
        setLastScore(await getLastScore("4eme", "francais", "bilan-2"));
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
          classe: "4eme",
          matiere: "francais",
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        setBestScore(await getBestScore("4eme", "francais", "bilan-2"));
        setLastScore(await getLastScore("4eme", "francais", "bilan-2"));
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
      "les-figures-de-style": 0,
      "la-phrase-complexe": 0,
      "les-connecteurs": 0,
      "le-lexique": 0,
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
          <p style={{ color: "#aaa", marginBottom: "24px" }}>
            Inscris-toi gratuitement pour accéder au bilan !
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
            onClick={() => router.push("/cours/college/4eme/francais")}
            style={{ cursor: "pointer" }}
          >
            Français 4ème
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Partie 2</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan · Français 4ème — Partie 2</div>
          <h1 className="lecon-titre">Bilan — Français 4ème Partie 2</h1>
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
            Ce bilan regroupe les 4 thèmes de Français 4ème — Partie 2.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>✨</span>
              <span>5 questions — Figures de style</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>🔗</span>
              <span>5 questions — Phrase complexe</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>➡️</span>
              <span>5 questions — Connecteurs logiques</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>📝</span>
              <span>5 questions — Le lexique</span>
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
              ? "Bravo, tu maîtrises le Français 4ème Partie 2 ! 🚀"
              : totalScore >= 14
                ? "Très bon niveau !"
                : totalScore >= 10
                  ? "Tu progresses bien !"
                  : "Reprends les leçons et réessaie !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/college/4eme/francais/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
