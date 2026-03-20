"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les homophones : ces/ses, son/sont, ou/où, ça/sa",
  intro:
    "Ces mots se prononcent pareil mais s'écrivent différemment selon leur rôle dans la phrase. Une astuce : essaie de les remplacer par un autre mot pour trouver lequel utiliser !",
  points: [
    {
      titre: "ces / ses",
      texte:
        "'ses' est un déterminant possessif (= les siens). On peut le remplacer par 'mes' ou 'tes'. 'ces' est un déterminant démonstratif (= ceux-là). On peut le remplacer par 'ce' + nom.",
      exemple:
        "Il range ses affaires. → ses = les siennes ✅ · Ces fleurs sont belles. → ces fleurs-là ✅",
    },
    {
      titre: "son / sont",
      texte:
        "'son' est un déterminant possessif (= le sien). On peut le remplacer par 'mon' ou 'ton'. 'sont' est le verbe être au pluriel (ils sont). On peut le remplacer par 'étaient'.",
      exemple:
        "Il prend son vélo. → son = le sien ✅ · Ils sont fatigués. → ils étaient fatigués ✅",
    },
    {
      titre: "ou / où",
      texte:
        "'ou' est une conjonction qui exprime un choix (= ou bien). 'où' est un adverbe qui indique le lieu ou le temps. On peut remplacer 'ou' par 'ou bien'.",
      exemple:
        "Tu veux du thé ou du café ? → ou bien ✅ · La ville où j'habite est belle.",
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
    question: "Complète : 'Il range ___ affaires.'",
    options: ["ces", "ses", "son", "sont"],
    reponse: "ses",
    explication: "'ses' = les siennes. On peut dire 'mes affaires' → ses ✅",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Complète : 'Les enfants ___ fatigués après la récréation.'",
    options: ["son", "sont", "ses", "ces"],
    reponse: "sont",
    explication:
      "'sont' = verbe être. On peut dire 'étaient fatigués' → sont ✅",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Complète : 'Tu veux du pain ___ des gâteaux ?'",
    options: ["où", "ou", "son", "sont"],
    reponse: "ou",
    explication: "'ou' exprime un choix. On peut dire 'ou bien des gâteaux' ✅",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Complète : '___ livres sont très intéressants.'",
    options: ["Ses", "Son", "Ces", "Sont"],
    reponse: "Ces",
    explication: "'Ces' = ces livres-là. C'est un déterminant démonstratif ✅",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Complète : 'La ville ___ je vis est magnifique.'",
    options: ["ou", "où", "son", "sont"],
    reponse: "où",
    explication:
      "'où' indique le lieu. On ne peut pas dire 'ou bien je vis' ✅",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Complète : 'Il a perdu ___ cahier.'",
    options: ["ses", "ces", "son", "sont"],
    reponse: "son",
    explication: "'son' = le sien. On peut dire 'mon cahier' → son ✅",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quelle phrase est correcte ?",
    options: [
      "Ces chaussures sont à moi.",
      "Ses chaussures sont à moi.",
      "Ces chaussures son à moi.",
      "Ses chaussures son à moi.",
    ],
    reponse: "Ces chaussures sont à moi.",
    explication: "'Ces' = celles-là + 'sont' = verbe être (étaient) ✅",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Complète : 'Je ne sais pas ___ il est parti.'",
    options: ["ou", "où", "son", "sont"],
    reponse: "où",
    explication:
      "'où' indique le lieu — on ne peut pas dire 'ou bien il est parti'.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Complète : '___ m'énerve quand tu arrives en retard !'",
    options: ["Sa", "Ça"],
    reponse: "Ça",
    explication: "'Ça' = cela. On peut dire 'Cela m'énerve' → Ça ✅",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Complète : '___ parents ___ très fiers de lui.'",
    options: ["Ses / sont", "Ces / son", "Son / sont", "Ses / son"],
    reponse: "Ses / sont",
    explication: "'Ses' = les siens + 'sont' = verbe être ✅",
    niveau: "difficile",
  },
];

const CLASSE = "cm1";
const MATIERE = "francais";
const THEME = "orthographe";

export default function OrthographeCM1() {
  const router = useRouter();
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

  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex],
  );
  const progression = Math.round((bonnes.length / questions.length) * 100);

  useEffect(() => {
    getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
    getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
  }, []);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questions[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= questions.length) {
      if (!scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score,
          total: questions.length,
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
          onClick={() => router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Orthographe</span>
        </div>
      </div>
      {etape === "qcm" && (
        <div className="progression-wrapper">
          <div className="progression-info">
            <span>
              Question {qIndex + 1} / {questions.length}
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
          <div className="lecon-badge">✏️ Orthographe · CM1</div>
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
            {niveauLabel(questions[qIndex].niveau)}
          </div>
          <div className="qcm-question">{questions[qIndex].question}</div>
          <div className="qcm-options">
            {shuffledOptions.map((opt) => {
              let cn = "qcm-option";
              if (selected) {
                if (opt === questions[qIndex].reponse) cn += " correct";
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
              className={`qcm-feedback ${selected === questions[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <div className="feedback-icon">
                {selected === questions[qIndex].reponse ? "✅" : "❌"}
              </div>
              <div className="feedback-texte">
                <strong>
                  {selected === questions[qIndex].reponse
                    ? "Bravo !"
                    : "Pas tout à fait..."}
                </strong>
                <p>{questions[qIndex].explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button className="lecon-btn" onClick={handleSuivant}>
              {qIndex + 1 >= questions.length
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
            {score} / {questions.length}
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
                router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)
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
