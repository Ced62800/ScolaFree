"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Imparfait & passé simple (5)
  {
    id: 1,
    theme: "imparfait-passe-simple",
    question: "Quel est le rôle de l'imparfait dans un récit au passé ?",
    options: [
      "Actions principales",
      "Décor et habitudes",
      "Actions futures",
      "Ordres",
    ],
    reponse: "Décor et habitudes",
    explication:
      "L'imparfait décrit le décor, les habitudes et les états. Le passé simple raconte les actions.",
  },
  {
    id: 2,
    theme: "imparfait-passe-simple",
    question:
      "Conjuguez 'être' à la 3ème personne du singulier du passé simple.",
    options: ["il était", "il est", "il fut", "il sera"],
    reponse: "il fut",
    explication:
      "Être au passé simple : je fus, tu fus, il fut, nous fûmes, vous fûtes, ils furent.",
  },
  {
    id: 3,
    theme: "imparfait-passe-simple",
    question:
      "Quelle est la terminaison de 'chanter' à la 1ère personne du singulier de l'imparfait ?",
    options: ["je chantai", "je chantais", "je chanterai", "je chante"],
    reponse: "je chantais",
    explication:
      "Terminaisons de l'imparfait : -ais, -ais, -ait, -ions, -iez, -aient.",
  },
  {
    id: 4,
    theme: "imparfait-passe-simple",
    question: "Comment forme-t-on l'imparfait ?",
    options: [
      "Radical de l'infinitif + terminaisons",
      "Radical du présent (nous) + terminaisons",
      "Auxiliaire + participe passé",
      "Même forme que le présent",
    ],
    reponse: "Radical du présent (nous) + terminaisons",
    explication:
      "Imparfait = radical de 'nous' au présent (sans -ons) + -ais, -ais, -ait, -ions, -iez, -aient.",
  },
  {
    id: 5,
    theme: "imparfait-passe-simple",
    question:
      "Quelle terminaison prend le verbe 'chanter' à la 3ème pers. du singulier du passé simple ?",
    options: ["-it", "-a", "-ut", "-ait"],
    reponse: "-a",
    explication:
      "1er groupe au passé simple : -ai, -as, -a, -âmes, -âtes, -èrent. Il chanta.",
  },
  // Les compléments (5)
  {
    id: 6,
    theme: "le-complement",
    question: "Qu'est-ce qu'un COD ?",
    options: [
      "Un complément introduit par une préposition",
      "Un complément directement relié au verbe sans préposition",
      "Un complément de lieu",
      "Un complément du nom",
    ],
    reponse: "Un complément directement relié au verbe sans préposition",
    explication:
      "COD = répond à 'quoi ?' ou 'qui ?' après le verbe, sans préposition.",
  },
  {
    id: 7,
    theme: "le-complement",
    question: "Quel est le COD dans 'Elle regarde un film' ?",
    options: ["Elle", "regarde", "un film", "Il n'y en a pas"],
    reponse: "un film",
    explication: "Elle regarde QUOI ? → un film = COD.",
  },
  {
    id: 8,
    theme: "le-complement",
    question: "Comment identifier un CC de lieu ?",
    options: [
      "Il répond à QUAND ?",
      "Il répond à OÙ ?",
      "Il répond à COMMENT ?",
      "Il répond à POURQUOI ?",
    ],
    reponse: "Il répond à OÙ ?",
    explication:
      "CC lieu = OÙ ? CC temps = QUAND ? CC manière = COMMENT ? CC cause = POURQUOI ?",
  },
  {
    id: 9,
    theme: "le-complement",
    question: "Quel est le COI dans 'Il parle à ses amis' ?",
    options: ["Il", "parle", "à ses amis", "ses amis"],
    reponse: "à ses amis",
    explication:
      "COI = introduit par une préposition. Parle À QUI ? → à ses amis (avec la préposition).",
  },
  {
    id: 10,
    theme: "le-complement",
    question: "Les CC sont-ils supprimables ?",
    options: [
      "Non, jamais",
      "Oui, ils sont accessoires",
      "Seulement le CC de lieu",
      "Cela dépend du verbe",
    ],
    reponse: "Oui, ils sont accessoires",
    explication:
      "Les CC sont des compléments accessoires : supprimables et déplaçables. COD/COI sont essentiels.",
  },
  // Les homophones (5)
  {
    id: 11,
    theme: "les-homophones",
    question: "Comment distinguer 'a' et 'à' ?",
    options: [
      "A = préposition, à = verbe avoir",
      "A = verbe avoir (remplaçable par 'avait'), à = préposition",
      "Ils sont identiques",
      "A s'utilise toujours devant un nom",
    ],
    reponse: "A = verbe avoir (remplaçable par 'avait'), à = préposition",
    explication:
      "Test : remplace par 'avait'. Si ça marche → 'a'. Sinon → 'à'.",
  },
  {
    id: 12,
    theme: "les-homophones",
    question: "Choisissez : 'Ils ___ faim.'",
    options: ["a", "à", "ont", "on"],
    reponse: "ont",
    explication:
      "Ils ONT faim. Ont = verbe avoir conjugué (ils ont). Test : ils avaient faim ✓.",
  },
  {
    id: 13,
    theme: "les-homophones",
    question: "Complétez : '___ va au cinéma.' (pronom sujet = il/elle)",
    options: ["On", "Ont", "Son", "Sont"],
    reponse: "On",
    explication:
      "ON = pronom sujet (= il/elle). ONT = ils ont. ON va = il va ✓.",
  },
  {
    id: 14,
    theme: "les-homophones",
    question: "Comment distinguer 'ou' et 'où' ?",
    options: [
      "Ou = lieu, où = choix",
      "Ou = choix (ou bien), où = lieu/temps (accent)",
      "Ils sont identiques",
      "Où s'utilise toujours en début de phrase",
    ],
    reponse: "Ou = choix (ou bien), où = lieu/temps (accent)",
    explication:
      "Test : remplace par 'ou bien'. Si ça marche → 'ou'. Sinon → 'où' (lieu/temps).",
  },
  {
    id: 15,
    theme: "les-homophones",
    question: "Choisissez : 'Elle ___ coiffe chaque matin.'",
    options: ["ce", "se", "s'est", "c'est"],
    reponse: "se",
    explication:
      "SE + verbe pronominal. Elle SE coiffe = action réfléchie (verbe se coiffer).",
  },
  // Le vocabulaire (5)
  {
    id: 16,
    theme: "le-vocabulaire",
    question: "Qu'est-ce qu'un préfixe ?",
    options: [
      "Un élément ajouté après la racine",
      "Un élément ajouté avant la racine pour modifier le sens",
      "La racine d'un mot",
      "Un suffixe",
    ],
    reponse: "Un élément ajouté avant la racine pour modifier le sens",
    explication: "Préfixe = AVANT la racine. Suffixe = APRÈS la racine.",
  },
  {
    id: 17,
    theme: "le-vocabulaire",
    question: "Qu'est-ce qu'un champ lexical ?",
    options: [
      "Les synonymes d'un mot",
      "Les mots de la même famille",
      "L'ensemble des mots qui se rapportent à un même thème",
      "Les mots ayant le même son",
    ],
    reponse: "L'ensemble des mots qui se rapportent à un même thème",
    explication:
      "Champ lexical = tous les mots liés à un même thème (ex: mer, vague, bateau, marin...).",
  },
  {
    id: 18,
    theme: "le-vocabulaire",
    question: "Qu'est-ce qu'un antonyme ?",
    options: [
      "Un mot de même sens",
      "Un mot de sens contraire",
      "Un mot de même famille",
      "Un préfixe négatif",
    ],
    reponse: "Un mot de sens contraire",
    explication: "Antonyme = sens contraire. Grand ↔ petit. Chaud ↔ froid.",
  },
  {
    id: 19,
    theme: "le-vocabulaire",
    question: "Quel suffixe transforme un verbe en nom d'action ?",
    options: ["-eur", "-tion", "-ment", "-able"],
    reponse: "-tion",
    explication:
      "-TION (ou -sion, -ation) forme des noms d'action. Construire → construction.",
  },
  {
    id: 20,
    theme: "le-vocabulaire",
    question: "Quels sont les 3 registres de langue ?",
    options: [
      "Formel, informel, neutre",
      "Familier, courant, soutenu",
      "Simple, complexe, technique",
      "Oral, écrit, mixte",
    ],
    reponse: "Familier, courant, soutenu",
    explication:
      "3 registres : familier (amis), courant (quotidien), soutenu (écrit formel).",
  },
];

const themeLabels: Record<string, string> = {
  "imparfait-passe-simple": "⏳ Imparfait & passé simple",
  "le-complement": "🔗 Les compléments",
  "les-homophones": "✏️ Les homophones",
  "le-vocabulaire": "📚 Le vocabulaire",
};

const themeColors: Record<string, string> = {
  "imparfait-passe-simple": "#4f8ef7",
  "le-complement": "#2ec4b6",
  "les-homophones": "#ffd166",
  "le-vocabulaire": "#ff6b6b",
};

export default function BilanFrancais5eme2() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "imparfait-passe-simple": 0,
    "le-complement": 0,
    "les-homophones": 0,
    "le-vocabulaire": 0,
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
        const b = await getBestScore("5eme", "francais", "bilan-2");
        const l = await getLastScore("5eme", "francais", "bilan-2");
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
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("5eme", "francais", "bilan-2");
        const l = await getLastScore("5eme", "francais", "bilan-2");
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
      "imparfait-passe-simple": 0,
      "le-complement": 0,
      "les-homophones": 0,
      "le-vocabulaire": 0,
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
            onClick={() => router.push("/cours/college/5eme/francais")}
            style={{ cursor: "pointer" }}
          >
            Français 5ème
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Partie 2</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan · Français 5ème — Partie 2</div>
          <h1 className="lecon-titre">Bilan — Français 5ème Partie 2</h1>
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
            Ce bilan regroupe les 4 thèmes de Français 5ème — Partie 2.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>⏳</span>
              <span>5 questions — Imparfait & passé simple</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>🔗</span>
              <span>5 questions — Les compléments</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>✏️</span>
              <span>5 questions — Les homophones</span>
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
              ? "Bravo, tu maîtrises le Français 5ème Partie 2 ! 🚀"
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
              onClick={() => router.push("/cours/college/5eme/francais/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
