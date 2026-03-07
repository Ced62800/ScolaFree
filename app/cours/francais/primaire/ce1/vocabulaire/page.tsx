"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les préfixes et les suffixes",
  intro:
    "Les préfixes et les suffixes sont des petits morceaux de mots qu'on ajoute pour créer de nouveaux mots. C'est très utile pour comprendre et mémoriser le vocabulaire !",
  points: [
    {
      titre: "Le préfixe",
      texte:
        "Un préfixe s'ajoute au début d'un mot pour changer son sens. Par exemple 'in-' ou 'im-' veut dire 'pas'.",
      exemple: "possible → impossible · connu → inconnu · utile → inutile",
    },
    {
      titre: "Le suffixe",
      texte:
        "Un suffixe s'ajoute à la fin d'un mot pour créer un nouveau mot. Par exemple '-eur' désigne souvent une personne qui fait quelque chose.",
      exemple: "chanter → chanteur · danser → danseur · lire → lecteur",
    },
    {
      titre: "Les familles de mots",
      texte:
        "Des mots qui partagent la même racine forment une famille. Reconnaître la racine aide à comprendre le sens.",
      exemple: "terre → enterrer · territoire · terrestre",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Que veut dire le préfixe 'in-' dans 'inconnu' ?",
    options: ["très", "pas", "encore", "avec"],
    reponse: "pas",
    explication: "Le préfixe 'in-' signifie 'pas' : inconnu = pas connu.",
  },
  {
    id: 2,
    question: "Quel mot est formé avec le suffixe '-eur' ?",
    options: ["maison", "chanteur", "petit", "arbre"],
    reponse: "chanteur",
    explication:
      "'chanteur' est formé de 'chanter' + '-eur', qui désigne la personne qui chante.",
  },
  {
    id: 3,
    question: "Quel mot appartient à la famille de 'terre' ?",
    options: ["mer", "ciel", "terrestre", "montagne"],
    reponse: "terrestre",
    explication:
      "'terrestre' appartient à la famille de 'terre' car il contient la racine 'terr-'.",
  },
  {
    id: 4,
    question: "Quel est le contraire de 'utile' avec un préfixe ?",
    options: ["très utile", "inutile", "utiles", "utiliser"],
    reponse: "inutile",
    explication:
      "On ajoute le préfixe 'in-' devant 'utile' pour former 'inutile' qui veut dire 'pas utile'.",
  },
  {
    id: 5,
    question: "Quel suffixe permet de former le mot 'danseur' ?",
    options: ["-age", "-eur", "-ment", "-tion"],
    reponse: "-eur",
    explication:
      "'danseur' = 'danser' + '-eur'. Le suffixe '-eur' désigne la personne qui danse.",
  },
];

export default function VocabulaireCE1Prefixes() {
  const router = useRouter();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);

  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex],
  );

  const progression = Math.round((bonnes.length / questions.length) * 100);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questions[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = () => {
    if (qIndex + 1 >= questions.length) {
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    setEtape("lecon");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setBonnes([]);
  };

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/francais/primaire/ce1")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Vocabulaire</span>
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
          <div className="lecon-badge">📚 Vocabulaire · CE1</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
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
            Je suis prêt(e) — Passer aux exercices →
          </button>
        </div>
      )}

      {etape === "qcm" && (
        <div className="qcm-wrapper">
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
                ? "Voir mon résultat →"
                : "Question suivante →"}
            </button>
          )}
        </div>
      )}

      {etape === "fini" && (
        <div className="resultat-wrapper">
          <div className="resultat-icon">
            {score === questions.length ? "🏆" : score >= 3 ? "⭐" : "💪"}
          </div>
          <h2 className="resultat-titre">
            {score === questions.length
              ? "Parfait !"
              : score >= 3
                ? "Bien joué !"
                : "Continue comme ça !"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          <p className="resultat-desc">
            {score === questions.length
              ? "Tu as tout bon ! Tu maîtrises les préfixes et les suffixes."
              : score >= 3
                ? "Tu as bien compris l'essentiel."
                : "Relis la leçon et réessaie !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/francais/primaire/ce1")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
