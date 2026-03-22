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
  titre: "Étymologie et sens des mots",
  intro:
    "L'étymologie est l'étude de l'origine des mots. Comprendre les racines latines et grecques aide à deviner le sens de mots inconnus et à enrichir son vocabulaire.",
  points: [
    {
      titre: "Les racines latines",
      texte:
        "De nombreux mots français viennent du latin. Connaître les racines aide à comprendre les familles de mots.",
      exemple:
        "aqua (eau) → aquarium, aquatique · sol (soleil) → solaire, parasol · terra (terre) → territoire, terrasse",
    },
    {
      titre: "Les racines grecques",
      texte:
        "Le grec ancien a aussi enrichi le français, surtout dans les domaines scientifiques et médicaux.",
      exemple:
        "bio (vie) → biologie, biographie · graphe (écrire) → orthographe, calligraphie · photo (lumière) → photographie",
    },
    {
      titre: "Les mots polysémiques",
      texte:
        "Un mot polysémique a plusieurs sens selon le contexte. Il faut s'appuyer sur le contexte pour trouver le bon sens.",
      exemple:
        "Verre : boire dans un verre (récipient) / verre de fenêtre (matière) · Vol : vol d'oiseau / vol de bijoux",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quelle est la racine grecque signifiant 'vie' ?",
    options: ["terra", "aqua", "bio", "sol"],
    reponse: "bio",
    explication:
      "'bio' vient du grec et signifie 'vie' : biologie, biographie.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel mot vient de la racine latine 'aqua' (eau) ?",
    options: ["solaire", "terrasse", "aquarium", "photographie"],
    reponse: "aquarium",
    explication: "'aquarium' vient de 'aqua' (eau).",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Que signifie la racine 'graphe' (grec) ?",
    options: ["lumière", "vie", "eau", "écrire"],
    reponse: "écrire",
    explication: "'graphe' signifie écrire : orthographe, calligraphie.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel mot vient de la racine latine 'sol' (soleil) ?",
    options: ["solaire", "aquatique", "territoire", "biologie"],
    reponse: "solaire",
    explication: "'solaire' vient de 'sol' (soleil).",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Dans 'photographie', quelle racine signifie 'lumière' ?",
    options: ["graphe", "photo", "phie", "tographie"],
    reponse: "photo",
    explication: "'photo' vient du grec et signifie lumière.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quel mot est polysémique (plusieurs sens) ?",
    options: ["chien", "verre", "stylo", "cahier"],
    reponse: "verre",
    explication:
      "'verre' peut être un récipient ou une matière selon le contexte.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "La racine 'terra' vient du latin et signifie :",
    options: ["eau", "lumière", "terre", "vie"],
    reponse: "terre",
    explication: "'terra' = terre → territoire, terrasse, terrain.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel mot appartient à la même famille que 'biologie' ?",
    options: ["géologie", "biographie", "photographie", "calligraphie"],
    reponse: "biographie",
    explication: "'biographie' contient aussi la racine 'bio' (vie).",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Dans 'Il a pris son vol', quel sens a le mot 'vol' ?",
    options: [
      "vol d'oiseau",
      "vol de bijoux",
      "vol en avion",
      "On ne sait pas sans contexte",
    ],
    reponse: "On ne sait pas sans contexte",
    explication: "Un mot polysémique change de sens selon le contexte.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Quelle racine grecque retrouve-t-on dans 'orthographe' et 'géographie' ?",
    options: ["ortho", "géo", "graphe", "phie"],
    reponse: "graphe",
    explication: "'graphe' (écrire) est présent dans les deux mots.",
    niveau: "difficile",
  },
];

const CLASSE = "cm2";
const MATIERE = "francais";
const THEME = "vocabulaire-2";

export default function VocabulaireCM2Page2() {
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
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Vocabulaire 2</span>
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
          <div className="lecon-badge">📚 Vocabulaire 2 · CM2</div>
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
              ? "Tu maîtrises l'étymologie et le sens des mots ! 🚀"
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
