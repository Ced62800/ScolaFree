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
  titre: "Les homophones et accords avancés",
  intro:
    "En CE2, on approfondit les homophones grammaticaux et on apprend de nouveaux accords. Il faut bien distinguer les mots qui se prononcent pareil mais s'écrivent différemment !",
  points: [
    {
      titre: "ces / ses / c'est / s'est",
      texte:
        "'ces' est un déterminant pluriel (ces enfants). 'ses' indique la possession (ses affaires). 'c'est' = cela est. 's'est' vient d'un verbe pronominal.",
      exemple:
        "Ces fleurs sont belles. · Il prend ses affaires. · C'est beau. · Il s'est levé.",
    },
    {
      titre: "leur / leurs",
      texte:
        "'leur' sans -s remplace 'à eux/elles' (je leur parle). 'leurs' avec -s est un déterminant pluriel (leurs affaires).",
      exemple: "Je leur parle. · Ils rangent leurs affaires.",
    },
    {
      titre: "tout / tous / toute / toutes",
      texte:
        "'tout' s'accorde avec le nom qu'il accompagne. Masculin singulier : tout, masculin pluriel : tous, féminin singulier : toute, féminin pluriel : toutes.",
      exemple:
        "Tout le monde. · Tous les élèves. · Toute la classe. · Toutes les filles.",
    },
    {
      titre: "ça / sa",
      texte:
        "'ça' est un pronom démonstratif qui signifie 'cela'. On peut le remplacer par 'cela'. 'sa' est un déterminant possessif (= la sienne). On peut le remplacer par 'ma' ou 'ta'.",
      exemple:
        "Ça m'énerve ! → Cela m'énerve ✅ · Il prend sa veste. → Il prend ma veste ✅",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Complète : '___ enfants jouent dans la cour.'",
    options: ["Ses", "Ces", "C'est", "S'est"],
    reponse: "Ces",
    explication: "'Ces' est un déterminant pluriel (= ces enfants-là).",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Complète : 'Il range ___ affaires.'",
    options: ["ces", "c'est", "ses", "s'est"],
    reponse: "ses",
    explication:
      "'ses' indique la possession (ses affaires = les affaires de lui).",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Complète : '___ une belle journée.'",
    options: ["Ces", "Ses", "S'est", "C'est"],
    reponse: "C'est",
    explication: "'C'est' = cela est.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Complète : 'Je ___ parle tous les jours.' (leur/leurs)",
    options: ["leurs", "leur"],
    reponse: "leur",
    explication: "'leur' sans -s remplace 'à eux' (je parle à eux).",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Complète : 'Ils rangent ___ affaires.' (leur/leurs)",
    options: ["leur", "leurs"],
    reponse: "leurs",
    explication: "'leurs' avec -s accompagne un nom pluriel (leurs affaires).",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Complète : '___ les élèves ont réussi.' (tout/tous)",
    options: ["Tout", "Toute", "Tous", "Toutes"],
    reponse: "Tous",
    explication: "'élèves' est masculin pluriel → 'tous'.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complète : '___ la classe a bien travaillé.' (tout/toute)",
    options: ["Tout", "Tous", "Toutes", "Toute"],
    reponse: "Toute",
    explication: "'classe' est féminin singulier → 'toute'.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Complète : 'Il ___ levé tôt ce matin.' (s'est/c'est)",
    options: ["c'est", "ces", "s'est", "ses"],
    reponse: "s'est",
    explication: "'s'est levé' vient du verbe pronominal 'se lever'.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Complète : '___ m'énerve quand tu fais ça !' (ça/sa)",
    options: ["Sa", "Ça"],
    reponse: "Ça",
    explication: "'Ça' = cela. On peut dire 'Cela m'énerve' → Ça ✅",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Complète : 'Il a oublié ___ veste à l'école.' (ça/sa)",
    options: ["ça", "sa"],
    reponse: "sa",
    explication: "'sa' = la sienne. On peut dire 'ma veste' → sa ✅",
    niveau: "difficile",
  },
];

const CLASSE = "ce2";
const MATIERE = "francais";
const THEME = "orthographe-2";

export default function OrthographeCE2Page2() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
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
    [qIndex],
  );
  const progression = Math.round((bonnes.length / questionsActives.length) * 100);

  useEffect(() => {
    getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
    getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
  }, []);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questionsActives[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= questionsActives.length) {
      if (!scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score,
          total: questionsActives.length,
        });
        const [best, last] = await Promise.all([
          getBestScore(CLASSE, MATIERE, THEME),
          getLastScore(CLASSE, MATIERE, THEME),
        ]);
        setBestScore(best);
        setLastScore(last);
      }
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    scoreSaved.current = false;
    setEtape("lecon");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setBonnes([]);
  };
  const niveauLabel = (n: string) =>
    n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() =>
            router.push(`/cours/primaire/${CLASSE}/${MATIERE}/page-2`)
          }
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Orthographe 2</span>
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
          <div className="lecon-badge">✏️ Orthographe 2 · CE2</div>
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
              let cn = "qcm-option";
              if (selected) {
                if (opt === questionsActives[qIndex].reponse) cn += " correct";
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
              className={`qcm-feedback ${selected === questionsActives[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <div className="feedback-icon">
                {selected === questionsActives[qIndex].reponse ? "✅" : "❌"}
              </div>
              <div className="feedback-texte">
                <strong>
                  {selected === questionsActives[qIndex].reponse
                    ? "Bravo !"
                    : "Pas tout à fait..."}
                </strong>
                <p>{questionsActives[qIndex].explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button className="lecon-btn" onClick={handleSuivant}>
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
              ? "Excellent !"
              : score >= 7
                ? "Bien joué !"
                : score >= 5
                  ? "Assez bien !"
                  : "À revoir !"}
          </h2>
          <div className="resultat-score">
            {score} / {questionsActives.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu maîtrises parfaitement les homophones ! 🚀"
              : score >= 7
                ? "Tu as bien compris l'essentiel, continue !"
                : score >= 5
                  ? "Encore quelques efforts et tu y seras !"
                  : "Relis la leçon et réessaie, tu vas y arriver !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() =>
                router.push(`/cours/primaire/${CLASSE}/${MATIERE}/page-2`)
              }
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
