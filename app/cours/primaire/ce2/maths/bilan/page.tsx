"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questionsMaths = [
  {
    id: 1,
    question: "Comment écrit-on en chiffres : 'Deux-mille-quatre-vingts' ?",
    options: ["2080", "2480", "2000480", "280"],
    reponse: "2080",
    explication: "2 mille et 80 unités = 2080.",
    theme: "calculs",
  },
  {
    id: 2,
    question: "Calcule mentalement : 150 + 150 + 150",
    options: ["300", "400", "450", "500"],
    reponse: "450",
    explication: "150 + 150 = 300, puis 300 + 150 = 450.",
    theme: "calculs",
  },
  {
    id: 3,
    question: "Quel est le résultat de : 25 x 4 ?",
    options: ["75", "100", "125", "150"],
    reponse: "100",
    explication: "4 fois 25 = 100.",
    theme: "calculs",
  },
  {
    id: 4,
    question: "Dans le nombre 5 432, quel est le chiffre des centaines ?",
    options: ["5", "4", "3", "2"],
    reponse: "4",
    explication: "5 milliers, 4 centaines, 3 dizaines, 2 unités.",
    theme: "calculs",
  },
  {
    id: 5,
    question: "Trouve le résultat : 1 000 - 1",
    options: ["900", "990", "999", "1001"],
    reponse: "999",
    explication: "Le nombre juste avant 1000 est 999.",
    theme: "calculs",
  },
  {
    id: 6,
    question: "Combien de côtés possède un hexagone ?",
    options: ["4", "5", "6", "8"],
    reponse: "6",
    explication: "Un hexagone possède 6 côtés.",
    theme: "geometrie",
  },
  {
    id: 7,
    question: "Comment appelle-t-on un angle plus petit que l'angle droit ?",
    options: ["Angle aigu", "Angle obtus", "Angle plat", "Angle carré"],
    reponse: "Angle aigu",
    explication: "Un angle aigu est plus petit qu’un angle droit.",
    theme: "geometrie",
  },
  {
    id: 8,
    question: "Quel solide possède 6 faces carrées identiques ?",
    options: ["Le pavé", "Le cube", "La pyramide", "Le cylindre"],
    reponse: "Le cube",
    explication: "Le cube possède 6 faces carrées.",
    theme: "geometrie",
  },
  {
    id: 9,
    question: "Combien de sommets possède un rectangle ?",
    options: ["2", "3", "4", "6"],
    reponse: "4",
    explication: "Un rectangle possède 4 sommets.",
    theme: "geometrie",
  },
  {
    id: 10,
    question: "Qu'utilise-t-on pour tracer un cercle ?",
    options: ["Une règle", "Une équerre", "Un compas", "Un rapporteur"],
    reponse: "Un compas",
    explication: "Le compas sert à tracer des cercles.",
    theme: "geometrie",
  },
  {
    id: 11,
    question: "Combien y a-t-il de minutes dans 2 heures ?",
    options: ["60 min", "100 min", "120 min", "200 min"],
    reponse: "120 min",
    explication: "1 heure = 60 minutes.",
    theme: "mesures",
  },
  {
    id: 12,
    question: "Quelle unité utilise-t-on pour mesurer la masse d'un éléphant ?",
    options: ["Grammes", "Kilogrammes", "Tonnes", "Litres"],
    reponse: "Tonnes",
    explication: "Un éléphant pèse plusieurs tonnes.",
    theme: "mesures",
  },
  {
    id: 13,
    question: "1 mètre = ___ centimètres.",
    options: ["10", "100", "1000", "1"],
    reponse: "100",
    explication: "1 mètre contient 100 centimètres.",
    theme: "mesures",
  },
  {
    id: 14,
    question: "S'il est 14h30, combien de minutes reste-t-il avant 15h00 ?",
    options: ["15 min", "30 min", "45 min", "60 min"],
    reponse: "30 min",
    explication: "14h30 + 30 minutes = 15h.",
    theme: "mesures",
  },
  {
    id: 15,
    question: "Quelle est la monnaie utilisée en France ?",
    options: ["Dollar", "Livre", "Euro", "Franc"],
    reponse: "Euro",
    explication: "La monnaie officielle est l’Euro (€).",
    theme: "mesures",
  },
  {
    id: 16,
    question: "Léa a 3 paquets de 6 gâteaux. Combien en a-t-elle ?",
    options: ["9", "12", "18", "24"],
    reponse: "18",
    explication: "3 x 6 = 18.",
    theme: "problemes",
  },
  {
    id: 17,
    question: "Un dictionnaire coûte 20€. Je paie avec 50€. Combien rend-on ?",
    options: ["20€", "30€", "40€", "70€"],
    reponse: "30€",
    explication: "50 - 20 = 30.",
    theme: "problemes",
  },
  {
    id: 18,
    question: "Le train part à 8h et arrive à 10h. Combien dure le trajet ?",
    options: ["1h", "2h", "3h", "18h"],
    reponse: "2h",
    explication: "De 8h à 10h = 2 heures.",
    theme: "problemes",
  },
  {
    id: 19,
    question: "20 bonbons partagés entre 4 enfants. Combien chacun ?",
    options: ["4", "5", "10", "16"],
    reponse: "5",
    explication: "20 ÷ 4 = 5.",
    theme: "problemes",
  },
  {
    id: 20,
    question: "Une équipe marque 42 points, l'autre 38. Quelle différence ?",
    options: ["2", "4", "6", "8"],
    reponse: "4",
    explication: "42 - 38 = 4.",
    theme: "problemes",
  },
];

const labels: Record<string, string> = {
  calculs: "🔢 Numération",
  geometrie: "📐 Géométrie",
  mesures: "⚖️ Mesures",
  problemes: "🧩 Problèmes",
};
const colors: Record<string, string> = {
  calculs: "#4f8ef7",
  geometrie: "#2ec4b6",
  mesures: "#ffd166",
  problemes: "#ff6b6b",
};

export default function BilanMathsCE2() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [best, setBest] = useState<any>(null);
  const [last, setLast] = useState<any>(null);
  const isSaving = useRef(false);

  const shuffled = useMemo(() => shuffleArray(questionsMaths), []);
  const current = shuffled[qIndex];
  const options = useMemo(
    () => (current ? shuffleArray(current.options) : []),
    [qIndex, shuffled],
  );

  // Correction de l'erreur de dépendance pour les scores
  useEffect(() => {
    async function load() {
      const b = await getBestScore("ce2", "maths", "bilan");
      const l = await getLastScore("ce2", "maths", "bilan");
      setBest(b);
      setLast(l);
    }
    if (etape === "intro") load();
  }, [etape]);

  const handleReponse = (opt: string) => {
    if (selected || !current) return;
    setSelected(opt);
    if (opt === current.reponse) setTotal((t) => t + 1);
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= shuffled.length) {
      if (!isSaving.current) {
        isSaving.current = true;
        await saveScore({
          classe: "ce2",
          matiere: "maths",
          theme: "bilan",
          score: total,
          total: 20,
        });
      }
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  if (etape === "intro")
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button
            className="cours-back"
            onClick={() => router.push("/cours/primaire/ce2/maths")}
          >
            ← Retour
          </button>
          <div className="cours-breadcrumb">
            <span>CE2</span>
            <span className="breadcrumb-sep">›</span>
            <span>Maths</span>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-active">Bilan Final</span>
          </div>
        </div>

        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CE2 Maths</div>
          <h1 className="lecon-titre">Bilan Final — CE2 Mathématiques</h1>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "rgba(46, 196, 182, 0.1)",
                border: "1px solid #2ec4b6",
                borderRadius: "12px",
                padding: "15px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#2ec4b6",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                🏆 RECORD
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#fff",
                  marginTop: "5px",
                }}
              >
                {best ? `${best.score}/20` : "--/20"}
              </div>
            </div>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "15px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#888",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                🕒 DERNIER
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#fff",
                  marginTop: "5px",
                }}
              >
                {last ? `${last.score}/20` : "--/20"}
              </div>
            </div>
          </div>

          <div className="lecon-intro" style={{ marginBottom: "25px" }}>
            <p>
              Ce bilan regroupe des questions sur les 4 thèmes de Maths du CE2.
            </p>
          </div>

          <div className="bilan-info-grid">
            <div
              className="bilan-info-card"
              style={{ borderColor: colors.calculs }}
            >
              <span>🔢</span>
              <span>5 questions de Numération</span>
            </div>
            <div
              className="bilan-info-card"
              style={{ borderColor: colors.geometrie }}
            >
              <span>📐</span>
              <span>5 questions de Géométrie</span>
            </div>
            <div
              className="bilan-info-card"
              style={{ borderColor: colors.mesures }}
            >
              <span>⚖️</span>
              <span>5 questions de Mesures</span>
            </div>
            <div
              className="bilan-info-card"
              style={{ borderColor: colors.problemes }}
            >
              <span>🧩</span>
              <span>5 questions de Problèmes</span>
            </div>
          </div>

          <div className="bilan-score-info">
            Score final sur <strong>20</strong>
          </div>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Commencer le bilan →
          </button>
        </div>
      </div>
    );

  if (etape === "fini")
    return (
      <div className="cours-page">
        <div className="resultat-wrapper">
          <div className="resultat-icon">{total >= 15 ? "🏆" : "⭐"}</div>
          <h2 className="resultat-titre">
            {total >= 15 ? "Excellent !" : "Bien joué !"}
          </h2>
          <div className="resultat-score">{total} / 20</div>
          <div className="resultat-actions">
            <button
              className="lecon-btn-outline"
              onClick={() => window.location.reload()}
            >
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/ce2/maths")}
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );

  if (!current) return null;

  return (
    <div className="cours-page">
      <div className="progression-wrapper">
        <div className="progression-info">
          <span>Question {qIndex + 1} / 20</span>
          <span style={{ color: colors[current.theme] }}>
            {labels[current.theme]}
          </span>
        </div>
        <div className="progression-bar">
          <div
            className="progression-fill"
            style={{ width: `${((qIndex + 1) / 20) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="qcm-wrapper">
        <div className="qcm-question">{current.question}</div>
        <div className="qcm-options">
          {options.map((o) => (
            <button
              key={o}
              className={`qcm-option ${selected ? (o === current.reponse ? "correct" : o === selected ? "incorrect" : "disabled") : ""}`}
              onClick={() => handleReponse(o)}
            >
              {o}
            </button>
          ))}
        </div>

        {/* FEEDBACK ET BOUTON SUIVANT : STRUCTURE CORRIGÉE */}
        {selected && (
          <div style={{ marginTop: "20px" }}>
            <div
              className={`qcm-feedback ${selected === current.reponse ? "feedback-correct" : "feedback-incorrect"}`}
              style={{ marginBottom: "20px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    background:
                      selected === current.reponse ? "#2ec4b6" : "#ff6b6b",
                    padding: "4px",
                    borderRadius: "6px",
                    color: "#fff",
                    display: "flex",
                  }}
                >
                  {selected === current.reponse ? "✓" : "✕"}
                </div>
                <div className="feedback-texte">
                  <strong>
                    {selected === current.reponse ? "Bravo !" : "Oups..."}
                  </strong>
                  <p>{current.explication}</p>
                </div>
              </div>
            </div>

            <button className="lecon-btn" onClick={handleSuivant}>
              {qIndex + 1 >= 20 ? "Terminer le bilan →" : "Question suivante →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
