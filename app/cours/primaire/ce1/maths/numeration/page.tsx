"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les nombres jusqu'à 1000",
  intro:
    "En CE1, on apprend à lire, écrire et comprendre les nombres jusqu'à 1000. Un nombre est composé de centaines, de dizaines et d'unités.",
  points: [
    {
      titre: "Unités, dizaines et centaines",
      texte:
        "Un nombre à trois chiffres se lit de gauche à droite. Le chiffre tout à gauche représente les centaines, celui du milieu les dizaines, et celui de droite les unités.",
      exemple: "243 = 2 centaines + 4 dizaines + 3 unités. 100 = 1 centaine.",
    },
    {
      titre: "Lire et écrire en lettres",
      texte:
        "On lit les centaines d'abord. 100 se dit « cent », 200 se dit « deux cents ». Attention aux tirets entre chaque mot !",
      exemple: "537 → « cinq cent trente-sept ». 804 → « huit cent quatre ».",
    },
    {
      titre: "Comparer les nombres",
      texte:
        "Pour comparer, on regarde d'abord les centaines. Si elles sont égales, on regarde les dizaines, puis les unités.",
      exemple: "482 > 389 (4c > 3c). 215 < 251 (1d < 5d).",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Combien y a-t-il de centaines dans le nombre 352 ?",
    options: ["2", "3", "5", "35"],
    reponse: "3",
    explication: "352, c'est 3 centaines, 5 dizaines et 2 unités.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Comment s'écrit « quatre cent vingt-six » en chiffres ?",
    options: ["462", "426", "406", "624"],
    reponse: "426",
    explication: "4 centaines (400) + 2 dizaines (20) + 6 unités (6) = 426.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quel nombre vient juste après 199 ?",
    options: ["200", "198", "210", "190"],
    reponse: "200",
    explication: "Après 199, on ajoute 1 unité et on change de centaine : 200.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel est le chiffre des dizaines dans 748 ?",
    options: ["7", "8", "4", "74"],
    reponse: "4",
    explication: "Le chiffre du milieu (4) représente les dizaines.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Lequel de ces nombres est le plus grand ?",
    options: ["389", "401", "399", "398"],
    reponse: "401",
    explication: "401 a 4 centaines, alors que les autres n'en ont que 3.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Comment décompose-t-on correctement 605 ?",
    options: [
      "6 centaines + 5 unités",
      "6 centaines + 0 dizaines + 5 unités",
      "60 dizaines + 5 unités",
      "6 dizaines + 5 unités",
    ],
    reponse: "6 centaines + 0 dizaines + 5 unités",
    explication:
      "Il ne faut pas oublier le 0 qui indique qu'il n'y a pas de dizaine.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Ordre croissant : 512, 215, 521, 251",
    options: [
      "215 – 251 – 512 – 521",
      "521 – 512 – 251 – 215",
      "215 – 512 – 251 – 521",
      "251 – 215 – 521 – 512",
    ],
    reponse: "215 – 251 – 512 – 521",
    explication: "On commence par les plus petits (ceux avec 2 centaines).",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel nombre = 7 centaines + 3 dizaines + 9 unités ?",
    options: ["739", "793", "937", "379"],
    reponse: "739",
    explication: "700 + 30 + 9 = 739.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Entre 870 et 890, combien y a-t-il de nombres entiers ?",
    options: ["18", "19", "20", "21"],
    reponse: "19",
    explication: "Il y a les nombres de 871 à 889, soit 19 nombres.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Le nombre 1000 correspond à...",
    options: [
      "10 centaines",
      "100 dizaines",
      "1000 unités",
      "Toutes ces réponses",
    ],
    reponse: "Toutes ces réponses",
    explication:
      "1000 est un nombre magique qui regroupe tout cela à la fois !",
    niveau: "difficile",
  },
];

const CLASSE = "ce1";
const MATIERE = "maths";
const THEME = "numeration-1000";

export default function NumerationCE1() {
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
          score: score,
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
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Numération</span>
        </div>
      </div>

      {etape === "qcm" && (
        <div className="progression-wrapper">
          <div className="progression-info">
            <span>
              Question {qIndex + 1} / {questions.length}
            </span>
            <span>
              {score} point{score > 1 ? "s" : ""}
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
          <div className="lecon-badge">🔢 Numération · CE1</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>

          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "10px",
                    fontSize: "0.85rem",
                    color: "#4f8ef7",
                    textAlign: "center",
                  }}
                >
                  🏆 Record :{" "}
                  <strong>
                    {bestScore.score}/{bestScore.total}
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
                    padding: "10px",
                    fontSize: "0.85rem",
                    color: "#aaa",
                    textAlign: "center",
                  }}
                >
                  🕒 Dernier :{" "}
                  <strong>
                    {lastScore.score}/{lastScore.total}
                  </strong>
                </div>
              )}
            </div>
          )}

          <p className="lecon-intro">{lecon.intro}</p>
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
            Commencer les exercices →
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
              let className = "qcm-option";
              if (selected) {
                if (opt === questions[qIndex].reponse) className += " correct";
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
                ? "Résultat final →"
                : "Question suivante →"}
            </button>
          )}
        </div>
      )}

      {etape === "fini" && (
        <div className="resultat-wrapper">
          <div className="resultat-icon">
            {score >= 9 ? "🏆" : score >= 7 ? "⭐" : "👍"}
          </div>
          <h2 className="resultat-titre">
            {score >= 9
              ? "Incroyable !"
              : score >= 7
                ? "Beau travail !"
                : "Bien essayé !"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu maîtrises les centaines comme un chef !"
              : "Tu es sur la bonne voie, continue !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Refaire le quiz
            </button>
            <button
              className="lecon-btn"
              onClick={() =>
                router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)
              }
            >
              Autres thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
