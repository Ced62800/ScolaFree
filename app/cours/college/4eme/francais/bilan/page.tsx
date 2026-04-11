"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Le roman (5)
  {
    id: 1,
    theme: "le-roman",
    question: "Qu'est-ce qu'un roman ?",
    options: [
      "Un texte en vers",
      "Une œuvre narrative longue en prose avec des personnages fictifs",
      "Un texte de théâtre",
      "Un texte argumentatif",
    ],
    reponse: "Une œuvre narrative longue en prose avec des personnages fictifs",
    explication:
      "Le roman = prose + fiction + long. Distingue : roman (prose) / poème (vers) / pièce (théâtre).",
  },
  {
    id: 2,
    theme: "le-roman",
    question: "Qu'est-ce que la focalisation zéro ?",
    options: [
      "Le narrateur ne sait rien",
      "Le narrateur sait tout (omniscient)",
      "Le narrateur voit par les yeux d'un personnage",
      "Le narrateur observe de l'extérieur",
    ],
    reponse: "Le narrateur sait tout (omniscient)",
    explication:
      "Focalisation zéro = narrateur omniscient = sait tout sur tous les personnages.",
  },
  {
    id: 3,
    theme: "le-roman",
    question: "Qu'est-ce qu'une analepse ?",
    options: [
      "Un saut vers le futur",
      "Un retour en arrière dans le récit",
      "Une description",
      "Un dialogue",
    ],
    reponse: "Un retour en arrière dans le récit",
    explication:
      "Analepse = retour en arrière (flashback). Prolepse = saut vers le futur (flash-forward).",
  },
  {
    id: 4,
    theme: "le-roman",
    question: "Qu'est-ce que le schéma narratif ?",
    options: [
      "La liste des personnages",
      "La structure en 5 étapes du récit",
      "Le résumé",
      "La biographie de l'auteur",
    ],
    reponse: "La structure en 5 étapes du récit",
    explication:
      "5 étapes : situation initiale → perturbateur → péripéties → résolution → situation finale.",
  },
  {
    id: 5,
    theme: "le-roman",
    question: "Qu'est-ce qu'un roman d'apprentissage ?",
    options: [
      "Un roman historique",
      "Un roman qui retrace l'évolution d'un jeune héros vers l'âge adulte",
      "Un roman policier",
      "Un roman épistolaire",
    ],
    reponse:
      "Un roman qui retrace l'évolution d'un jeune héros vers l'âge adulte",
    explication:
      "Bildungsroman = parcours initiatique d'un jeune personnage vers la maturité. Ex : David Copperfield.",
  },
  // La BD et le manga (5)
  {
    id: 6,
    theme: "la-bd-manga",
    question:
      "Comment s'appelle l'espace délimité contenant une image dans une BD ?",
    options: ["Une bulle", "Une case/vignette", "Un cartouche", "Une planche"],
    reponse: "Une case/vignette",
    explication:
      "Case/vignette = image dessinée. Bulle = paroles. Cartouche = narration. Planche = page entière.",
  },
  {
    id: 7,
    theme: "la-bd-manga",
    question: "Qu'est-ce qu'un cartouche dans une BD ?",
    options: [
      "Une bulle de pensée",
      "Un encadré narratif (lieu, temps)",
      "Une onomatopée",
      "La couverture",
    ],
    reponse: "Un encadré narratif (lieu, temps)",
    explication:
      "Le cartouche = voix du narrateur. La bulle = voix des personnages. Deux éléments distincts.",
  },
  {
    id: 8,
    theme: "la-bd-manga",
    question: "Dans quel sens se lit un manga japonais ?",
    options: [
      "Gauche à droite",
      "Droite à gauche",
      "De bas en haut",
      "En spirale",
    ],
    reponse: "Droite à gauche",
    explication:
      "Manga japonais → droite vers gauche. BD franco-belge → gauche vers droite. Sens inverse !",
  },
  {
    id: 9,
    theme: "la-bd-manga",
    question: "Qu'est-ce qu'une onomatopée ?",
    options: [
      "Une bulle de pensée",
      "Un mot qui imite un son",
      "Un plan d'ensemble",
      "Le titre de l'album",
    ],
    reponse: "Un mot qui imite un son",
    explication:
      "BOUM, SPLASH, POW, VROOM = onomatopées. Le mot sonne comme ce qu'il décrit.",
  },
  {
    id: 10,
    theme: "la-bd-manga",
    question: "Qu'est-ce que la 'gouttière' en BD ?",
    options: [
      "Le titre",
      "L'espace blanc entre les cases",
      "La couverture",
      "La dernière page",
    ],
    reponse: "L'espace blanc entre les cases",
    explication:
      "La gouttière = espace entre cases = espace de l'imagination du lecteur. La BD ne montre pas tout !",
  },
  // Discours indirect (5)
  {
    id: 11,
    theme: "discours-indirect",
    question: "Transforme : Il dit : 'Je suis fatigué.'",
    options: [
      "Il dit qu'il était fatigué.",
      "Il dit qu'il est fatigué.",
      "Il dit qu'il sera fatigué.",
      "Il dit être fatigué.",
    ],
    reponse: "Il dit qu'il est fatigué.",
    explication:
      "Verbe introducteur au présent → les temps ne changent pas. 'Dit' (présent) → 'est' reste au présent.",
  },
  {
    id: 12,
    theme: "discours-indirect",
    question: "Quel mot introduit une question oui/non au discours indirect ?",
    options: ["que", "si", "quand", "comment"],
    reponse: "si",
    explication:
      "Question oui/non → SI. Question ouverte → garde le mot interrogatif. 'Est-ce que' disparaît.",
  },
  {
    id: 13,
    theme: "discours-indirect",
    question: "'Demain' devient quoi au discours indirect au passé ?",
    options: ["hier", "aujourd'hui", "le lendemain", "maintenant"],
    reponse: "le lendemain",
    explication:
      "Demain → le lendemain. Hier → la veille. Aujourd'hui → ce jour-là. Maintenant → alors.",
  },
  {
    id: 14,
    theme: "discours-indirect",
    question: "Pour un ordre au discours indirect, on utilise :",
    options: [
      "que + subjonctif",
      "de + infinitif",
      "si + indicatif",
      "que + indicatif",
    ],
    reponse: "de + infinitif",
    explication:
      "Ordre → DE + infinitif. 'Partez !' → Il ordonne de partir. Affirmation → QUE. Question → SI.",
  },
  {
    id: 15,
    theme: "discours-indirect",
    question: "Que devient le présent au discours indirect au passé ?",
    options: [
      "Il reste au présent",
      "Il devient imparfait",
      "Il devient passé composé",
      "Il devient conditionnel",
    ],
    reponse: "Il devient imparfait",
    explication:
      "Concordance des temps : présent → imparfait, futur → conditionnel, passé composé → plus-que-parfait.",
  },
  // Le conditionnel (5)
  {
    id: 16,
    theme: "le-conditionnel",
    question: "Comment se forme le conditionnel présent ?",
    options: [
      "Radical imparfait + terminaisons futur",
      "Radical futur + terminaisons imparfait",
      "Infinitif + terminaisons présent",
      "Radical présent + terminaisons imparfait",
    ],
    reponse: "Radical futur + terminaisons imparfait",
    explication:
      "Conditionnel = radical du futur + terminaisons de l'imparfait (-ais, -ais, -ait, -ions, -iez, -aient).",
  },
  {
    id: 17,
    theme: "le-conditionnel",
    question: "Quelle est la règle d'or du conditionnel avec 'si' ?",
    options: [
      "Si + conditionnel → futur",
      "Jamais de conditionnel après 'si'",
      "Si + conditionnel → imparfait",
      "Si + conditionnel toujours",
    ],
    reponse: "Jamais de conditionnel après 'si'",
    explication:
      "JAMAIS de conditionnel après 'si'. Si + présent → futur. Si + imparfait → conditionnel. Règle absolue !",
  },
  {
    id: 18,
    theme: "le-conditionnel",
    question: "Identifie l'emploi : 'Selon les médias, il serait arrêté.'",
    options: ["Hypothèse", "Politesse", "Souhait", "Fait non vérifié"],
    reponse: "Fait non vérifié",
    explication:
      "Conditionnel journalistique = information non confirmée. 'Il serait arrêté' = on n'est pas sûr.",
  },
  {
    id: 19,
    theme: "le-conditionnel",
    question: "Conjugue 'être' au conditionnel présent, 1ère personne.",
    options: ["J'étais", "Je serai", "Je serais", "Je sois"],
    reponse: "Je serais",
    explication:
      "Être : radical 'ser-' + terminaison '-ais' = je serais. Futur = je serai. Imparfait = j'étais.",
  },
  {
    id: 20,
    theme: "le-conditionnel",
    question: "Comment se forme le conditionnel passé ?",
    options: [
      "Conditionnel de 'avoir/être' + participe passé",
      "Imparfait de 'avoir/être' + participe passé",
      "Futur de 'avoir/être' + participe passé",
      "Présent + participe passé",
    ],
    reponse: "Conditionnel de 'avoir/être' + participe passé",
    explication:
      "Conditionnel passé = auxiliaire au conditionnel présent + PP. J'aurais mangé. Elle serait partie.",
  },
];

const themeLabels: Record<string, string> = {
  "le-roman": "📚 Le roman",
  "la-bd-manga": "🎨 La BD et le manga",
  "discours-indirect": "💬 Discours indirect",
  "le-conditionnel": "⚡ Le conditionnel",
};
const themeColors: Record<string, string> = {
  "le-roman": "#4f8ef7",
  "la-bd-manga": "#2ec4b6",
  "discours-indirect": "#ffd166",
  "le-conditionnel": "#ff6b6b",
};

export default function BilanFrancais4eme() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "le-roman": 0,
    "la-bd-manga": 0,
    "discours-indirect": 0,
    "le-conditionnel": 0,
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
        setBestScore(await getBestScore("4eme", "francais", "bilan"));
        setLastScore(await getLastScore("4eme", "francais", "bilan"));
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
          theme: "bilan",
          score: scoreRef.current,
          total: 20,
        });
        setBestScore(await getBestScore("4eme", "francais", "bilan"));
        setLastScore(await getLastScore("4eme", "francais", "bilan"));
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
      "le-roman": 0,
      "la-bd-manga": 0,
      "discours-indirect": 0,
      "le-conditionnel": 0,
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
          <span className="breadcrumb-active">Bilan</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan · Français 4ème</div>
          <h1 className="lecon-titre">Bilan — Français 4ème</h1>
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
            Ce bilan regroupe les 4 thèmes de Français 4ème — Partie 1.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>📚</span>
              <span>5 questions — Le roman</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>🎨</span>
              <span>5 questions — La BD et le manga</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>💬</span>
              <span>5 questions — Discours indirect</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>⚡</span>
              <span>5 questions — Le conditionnel</span>
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
              ? "Bravo, tu maîtrises le Français 4ème Partie 1 ! 🚀"
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
              onClick={() => router.push("/cours/college/4eme/francais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
