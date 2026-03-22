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
  titre: "L'accord nom/adjectif",
  intro:
    "Un adjectif s'accorde toujours avec le nom qu'il accompagne. Il prend le même genre (masculin ou féminin) et le même nombre (singulier ou pluriel).",
  points: [
    {
      titre: "Le genre : masculin et féminin",
      texte:
        "Au féminin, on ajoute généralement un -e à l'adjectif. Certains adjectifs changent complètement au féminin.",
      exemple:
        "un chat noir → une chatte noire · un beau garçon → une belle fille",
    },
    {
      titre: "Le nombre : singulier et pluriel",
      texte:
        "Au pluriel, on ajoute généralement un -s à l'adjectif. Si l'adjectif se termine déjà par -s ou -x, il ne change pas.",
      exemple:
        "un chien gentil → des chiens gentils · une fleur rouge → des fleurs rouges",
    },
    {
      titre: "Masculin et féminin pluriel",
      texte:
        "Quand on combine genre et nombre, on applique les deux règles à la fois.",
      exemple:
        "un petit chat → de petits chats · une petite fleur → de petites fleurs",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Complète : 'Une fleur ___.' (rouge)",
    options: ["rouge", "rouges", "rougis", "rougée"],
    reponse: "rouge",
    explication:
      "'fleur' est féminin singulier. 'rouge' ne change pas au féminin.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Complète : 'Un chat ___.' (noir)",
    options: ["noire", "noirs", "noir", "noires"],
    reponse: "noir",
    explication: "'chat' est masculin singulier → 'noir'.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Complète : 'Une fille ___.' (grand)",
    options: ["grand", "grands", "grandes", "grande"],
    reponse: "grande",
    explication: "'fille' est féminin singulier → on ajoute -e : 'grande'.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Complète : 'Des chiens ___.' (gentil)",
    options: ["gentil", "gentille", "gentils", "gentilles"],
    reponse: "gentils",
    explication: "'chiens' est masculin pluriel → on ajoute -s : 'gentils'.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Complète : 'Des robes ___.' (beau)",
    options: ["beau", "beaux", "belle", "belles"],
    reponse: "belles",
    explication: "'robes' est féminin pluriel → 'belles'.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quelle phrase est correcte ?",
    options: [
      "Un grand arbre.",
      "Une grand arbre.",
      "Un grandes arbre.",
      "Des grand arbres.",
    ],
    reponse: "Un grand arbre.",
    explication: "'arbre' est masculin singulier → 'grand' sans accord.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complète : 'Une petite ___.' (maison)",
    options: [
      "petit maison",
      "petite maison",
      "petits maison",
      "petites maisons",
    ],
    reponse: "petite maison",
    explication: "'maison' est féminin singulier → 'petite'.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Complète : 'Des garçons ___.' (courageux)",
    options: ["courageux", "courageuse", "courageuses", "courageuxs"],
    reponse: "courageux",
    explication:
      "'courageux' se termine par -x, il ne change pas au pluriel masculin.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Complète : 'De ___ fleurs.' (beau)",
    options: ["beau", "beaux", "belle", "belles"],
    reponse: "belles",
    explication: "'fleurs' est féminin pluriel → 'belles'.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quelle phrase est correcte ?",
    options: [
      "Des enfants joyeux.",
      "Des enfants joyeuxs.",
      "Des enfants joyeuse.",
      "Des enfant joyeux.",
    ],
    reponse: "Des enfants joyeux.",
    explication:
      "'enfants' est masculin pluriel. 'joyeux' se termine par -x, il ne change pas.",
    niveau: "difficile",
  },
];

const CLASSE = "ce1";
const MATIERE = "francais";
const THEME = "grammaire-2";

export default function GrammaireCE1Page2() {
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
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Grammaire 2</span>
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
          <div className="lecon-badge">📝 Grammaire 2 · CE1</div>
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
              let className = "qcm-option";
              if (selected) {
                if (opt === questionsActives[qIndex].reponse) className += " correct";
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
              ? "Tu maîtrises parfaitement l'accord nom/adjectif ! 🚀"
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
