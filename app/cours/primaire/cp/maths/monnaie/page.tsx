"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const coursData = {
  titre: "La Monnaie : L'Euro",
  emoji: "💶",
  couleur: "#4cc9f0",
  pointsCles: [
    "On utilise l'Euro (€) pour acheter des choses.",
    "Il existe des pièces : 1€ et 2€ (et aussi des centimes).",
    "Il existe des billets : 5€, 10€, 20€...",
    "On peut échanger deux pièces de 1€ contre une pièce de 2€.",
  ],
  exercices: [
    {
      id: 1,
      q: "Si j'ai deux pièces de 2€, combien ai-je ?",
      options: ["2€", "4€", "5€"],
      r: "4€",
      e: "2 + 2 = 4 euros.",
    },
    {
      id: 2,
      q: "Quel est le plus petit billet ?",
      options: ["5€", "10€", "20€"],
      r: "5€",
      e: "Le billet de 5€ est le plus petit.",
    },
    {
      id: 3,
      q: "Combien faut-il de pièces de 1€ pour faire 5€ ?",
      options: ["2", "5", "10"],
      r: "5",
      e: "Il faut 5 pièces de 1 euro.",
    },
    {
      id: 4,
      q: "Une sucette coûte 1€. Je donne 2€. Combien me rend-on ?",
      options: ["1€", "2€", "Rien"],
      r: "1€",
      e: "2 - 1 = 1 euro.",
    },
    {
      id: 5,
      q: "Lequel est une pièce ?",
      options: ["5€", "10€", "2€"],
      r: "2€",
      e: "Le 2€ est une pièce, le 5€ est un billet.",
    },
    {
      id: 6,
      q: "J'ai 10€. J'achète un livre à 7€. Il me reste :",
      options: ["2€", "3€", "4€"],
      r: "3€",
      e: "10 - 7 = 3.",
    },
    {
      id: 7,
      q: "Combien font 5€ + 5€ ?",
      options: ["10€", "15€", "20€"],
      r: "10€",
      e: "C'est un double : 5 + 5 = 10.",
    },
    {
      id: 8,
      q: "Quelle pièce n'existe pas ?",
      options: ["1€", "2€", "3€"],
      r: "3€",
      e: "Il n'y a pas de pièce de 3 euros.",
    },
    {
      id: 9,
      q: "Pour payer 6€, je peux donner :",
      options: ["5€ + 1€", "2€ + 2€", "10€"],
      r: "5€ + 1€",
      e: "5 + 1 = 6.",
    },
    {
      id: 10,
      q: "Le signe de l'Euro est :",
      options: ["$", "€", "£"],
      r: "€",
      e: "C'est le symbole de notre monnaie.",
    },
  ],
};

export default function LeconMonnaie() {
  const router = useRouter();
  const [etape, setEtape] = useState<"cours" | "exercice">("cours");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [repondu, setRepondu] = useState<string | null>(null);
  const [fini, setFini] = useState(false);

  const handleReponse = (opt: string) => {
    if (repondu) return;
    setRepondu(opt);
    if (opt === coursData.exercices[index].r) setScore(score + 1);
  };

  const suivant = () => {
    if (index + 1 < coursData.exercices.length) {
      setIndex(index + 1);
      setRepondu(null);
    } else {
      setFini(true);
    }
  };

  if (fini) {
    return (
      <div className="cours-page text-center">
        <h2 style={{ fontSize: "2.5rem" }}>Bravo Cédric ! 🌟</h2>
        <div style={{ fontSize: "4rem", margin: "20px 0" }}>{score} / 10</div>
        <button
          className="lecon-btn"
          onClick={() => router.push("/cours/primaire/cp/maths/page-2")}
        >
          Retour aux leçons
        </button>
      </div>
    );
  }

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cp/maths/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">Maths › CP › {coursData.titre}</div>
      </div>

      {etape === "cours" ? (
        <div className="cours-content-wrapper">
          <div
            className="cours-hero-mini"
            style={{ backgroundColor: coursData.couleur }}
          >
            <span style={{ fontSize: "3rem" }}>{coursData.emoji}</span>
            <h1>{coursData.titre}</h1>
          </div>
          <div className="cours-card-info">
            <h3>Ce qu'il faut retenir :</h3>
            <ul>
              {coursData.pointsCles.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
          <button className="lecon-btn" onClick={() => setEtape("exercice")}>
            Commencer les exercices →
          </button>
        </div>
      ) : (
        <div className="exercice-wrapper">
          <div className="exercice-progress">Question {index + 1} / 10</div>
          <div className="exercice-question">
            {coursData.exercices[index].q}
          </div>
          <div className="options-grid">
            {coursData.exercices[index].options.map((opt) => (
              <button
                key={opt}
                className={`option-btn ${repondu === opt ? (opt === coursData.exercices[index].r ? "correct" : "incorrect") : ""} ${repondu && opt === coursData.exercices[index].r ? "correct" : ""}`}
                onClick={() => handleReponse(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          {repondu && (
            <div className="feedback">
              <p>
                {repondu === coursData.exercices[index].r
                  ? "✅ Super !"
                  : "❌ Oh non..."}
              </p>
              <small>{coursData.exercices[index].e}</small>
              <button className="next-btn" onClick={suivant}>
                Suivant
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .cours-page {
          padding: 20px;
          color: white;
          min-height: 100vh;
          background: #0a0e14;
        }
        .cours-hero-mini {
          padding: 30px;
          border-radius: 20px;
          text-align: center;
          margin-bottom: 30px;
        }
        .cours-card-info {
          background: #151921;
          padding: 25px;
          border-radius: 20px;
          border-left: 5px solid ${coursData.couleur};
          margin-bottom: 30px;
        }
        .cours-card-info ul {
          list-style: none;
          padding: 0;
        }
        .cours-card-info li {
          margin: 15px 0;
          font-size: 1.1rem;
        }
        .lecon-btn {
          background: ${coursData.couleur};
          color: #000;
          border: none;
          padding: 15px 30px;
          border-radius: 12px;
          font-weight: bold;
          width: 100%;
          cursor: pointer;
        }
        .options-grid {
          display: grid;
          gap: 15px;
          margin-top: 20px;
        }
        .option-btn {
          background: #1a1d26;
          border: 2px solid #333;
          color: white;
          padding: 20px;
          border-radius: 15px;
          cursor: pointer;
          font-size: 1.1rem;
        }
        .option-btn.correct {
          background: #4ade80;
          color: #000;
          border-color: #4ade80;
        }
        .option-btn.incorrect {
          background: #ff6b6b;
          color: #fff;
          border-color: #ff6b6b;
        }
        .feedback {
          margin-top: 20px;
          padding: 20px;
          background: #1a1d26;
          border-radius: 15px;
          text-align: center;
        }
        .next-btn {
          margin-top: 15px;
          background: white;
          color: black;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
        }
        .exercice-question {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 20px 0;
        }
      `}</style>
    </div>
  );
}
