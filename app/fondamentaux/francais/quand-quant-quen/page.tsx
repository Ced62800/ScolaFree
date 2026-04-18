"use client";

import { supabase } from "@/supabaseClient";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ============ QUESTIONS ============
const TOUTES_LES_QUESTIONS = [
  {
    id: 1,
    phrase: "___ est-ce que tu arrives ?",
    reponse: "Quand",
    explication: "On peut remplacer par 'à quel moment' → Quand.",
  },
  {
    id: 2,
    phrase: "___ à lui, il préfère le football.",
    reponse: "Quant",
    explication: "On peut remplacer par 'en ce qui concerne' → Quant.",
  },
  {
    id: 3,
    phrase: "Je ne sais pas ___ il reviendra.",
    reponse: "Quand",
    explication: "On peut remplacer par 'au moment où' → Quand.",
  },
  {
    id: 4,
    phrase: "___ à moi, je reste ici.",
    reponse: "Quant",
    explication: "'Quant à moi' = 'en ce qui me concerne' → Quant.",
  },
  {
    id: 5,
    phrase: "Il parle ___ il veut.",
    reponse: "Quand",
    explication: "On peut remplacer par 'lorsque' → Quand.",
  },
  {
    id: 6,
    phrase: "Je me demande ___ il pense à ses vacances.",
    reponse: "Qu'en",
    explication: "'Qu'en' = 'que' + 'en' : qu'est-ce qu'il en pense → Qu'en.",
  },
  {
    id: 7,
    phrase: "___ aux résultats, ils sont excellents.",
    reponse: "Quant",
    explication: "'Quant aux' = 'en ce qui concerne les' → Quant.",
  },
  {
    id: 8,
    phrase: "___ tu seras grand, tu comprendras.",
    reponse: "Quand",
    explication: "On peut remplacer par 'lorsque' → Quand.",
  },
  {
    id: 9,
    phrase: "___ penses-tu de ce film ?",
    reponse: "Qu'en",
    explication: "'Qu'en penses-tu ?' = 'que penses-tu de cela ?' → Qu'en.",
  },
  {
    id: 10,
    phrase: "___ il pleut, je reste chez moi.",
    reponse: "Quand",
    explication: "On peut remplacer par 'lorsque' → Quand.",
  },
  {
    id: 11,
    phrase: "___ est-il de son projet ?",
    reponse: "Qu'en",
    explication: "'Qu'en est-il ?' = 'qu'est-ce qu'il en est ?' → Qu'en.",
  },
  {
    id: 12,
    phrase: "___ à elle, elle préfère la lecture.",
    reponse: "Quant",
    explication: "'Quant à elle' = 'en ce qui la concerne' → Quant.",
  },
];

function melangerTableau<T>(arr: T[]): T[] {
  const copie = [...arr];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

const CHOIX = ["Quand", "Quant", "Qu'en"];
const NB_QUESTIONS = 10;

type EtatQuestion = "attente" | "correct" | "incorrect";

export default function FicheQuandQuantQuen() {
  const [questions, setQuestions] = useState(() =>
    melangerTableau(TOUTES_LES_QUESTIONS).slice(0, NB_QUESTIONS),
  );
  const [indexActuel, setIndexActuel] = useState(0);
  const [etat, setEtat] = useState<EtatQuestion>("attente");
  const [choixFait, setChoixFait] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [termine, setTermine] = useState(false);
  const [ancienScore, setAncienScore] = useState<number | null>(null);
  const [estConnecte, setEstConnecte] = useState(false);
  const scoreSaved = useRef(false);

  // Récupère l'ancien score au chargement
  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;
      setEstConnecte(true);
      const { data } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", user.id)
        .eq("classe", "fondamentaux")
        .eq("matiere", "francais")
        .eq("theme", "quand-quant-quen")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data) setAncienScore(data.score);
    };
    init();
  }, []);

  // Sauvegarde le score quand terminé
  useEffect(() => {
    if (!termine || scoreSaved.current || !estConnecte) return;
    scoreSaved.current = true;
    const sauvegarder = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;
      // Cherche si un score existe déjà
      const { data: existing } = await supabase
        .from("scores")
        .select("id")
        .eq("user_id", user.id)
        .eq("classe", "fondamentaux")
        .eq("matiere", "francais")
        .eq("theme", "quand-quant-quen")
        .single();
      if (existing?.id) {
        await supabase
          .from("scores")
          .update({
            score,
            total: NB_QUESTIONS,
            created_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("scores").insert({
          user_id: user.id,
          classe: "fondamentaux",
          matiere: "francais",
          theme: "quand-quant-quen",
          score,
          total: NB_QUESTIONS,
        });
      }
    };
    sauvegarder();
  }, [termine, score, estConnecte]);

  const question = questions[indexActuel];

  const repondre = (choix: string) => {
    if (etat !== "attente") return;
    setChoixFait(choix);
    if (choix === question.reponse) {
      setEtat("correct");
      setScore((s) => s + 1);
    } else {
      setEtat("incorrect");
    }
  };

  const suivant = () => {
    if (indexActuel + 1 >= NB_QUESTIONS) {
      setTermine(true);
    } else {
      setIndexActuel((i) => i + 1);
      setEtat("attente");
      setChoixFait(null);
    }
  };

  const recommencer = () => {
    setQuestions(melangerTableau(TOUTES_LES_QUESTIONS).slice(0, NB_QUESTIONS));
    setIndexActuel(0);
    setEtat("attente");
    setChoixFait(null);
    setScore(0);
    setTermine(false);
    scoreSaved.current = false;
  };

  // ===== ÉCRAN RÉSULTAT =====
  if (termine) {
    const pourcentage = Math.round((score / NB_QUESTIONS) * 100);
    const couleur =
      pourcentage >= 80 ? "#2ec4b6" : pourcentage >= 50 ? "#ffd166" : "#ff6b6b";
    const emoji = pourcentage >= 80 ? "🎉" : pourcentage >= 50 ? "💪" : "📖";

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f0f23",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "24px",
            padding: "48px 36px",
            maxWidth: "480px",
            width: "100%",
            textAlign: "center",
            border: `2px solid ${couleur}40`,
          }}
        >
          <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>
            {emoji}
          </div>
          <h2
            style={{
              color: "#fff",
              fontSize: "1.6rem",
              fontWeight: 800,
              marginBottom: "8px",
            }}
          >
            Exercice terminé !
          </h2>
          <div
            style={{
              fontSize: "3rem",
              fontWeight: 900,
              color: couleur,
              margin: "20px 0",
            }}
          >
            {score}/{NB_QUESTIONS}
          </div>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
            {pourcentage >= 80
              ? "Excellent ! Tu maîtrises Quand/Quant/Qu'en !"
              : pourcentage >= 50
                ? "Pas mal ! Encore un peu d'entraînement."
                : "Continue à t'entraîner, tu vas y arriver !"}
          </p>
          {ancienScore !== null && (
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.85rem",
                marginBottom: "24px",
              }}
            >
              Score précédent : {ancienScore}/{NB_QUESTIONS}
            </p>
          )}
          {!estConnecte && (
            <p
              style={{
                color: "#ffd166",
                fontSize: "0.8rem",
                marginBottom: "16px",
              }}
            >
              💡{" "}
              <Link href="/connexion" style={{ color: "#ffd166" }}>
                Connecte-toi
              </Link>{" "}
              pour sauvegarder ton score
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={recommencer}
              style={{
                background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                border: "none",
                color: "#fff",
                padding: "14px 28px",
                borderRadius: "16px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🔄 Recommencer
            </button>
            <Link
              href="/fondamentaux/francais"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                padding: "14px 28px",
                borderRadius: "16px",
                fontSize: "1rem",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              ← Retour
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===== ÉCRAN QUESTION =====
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f23",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        {/* Retour */}
        <Link
          href="/fondamentaux/francais"
          style={{
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
            fontSize: "0.9rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "32px",
          }}
        >
          ← Retour
        </Link>

        {/* En-tête */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              color: "#4f8ef7",
              fontSize: "1.6rem",
              fontWeight: 800,
              marginBottom: "6px",
            }}
          >
            ⏰ Quand / Quant / Qu&apos;en
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
            Choisis le bon mot pour compléter la phrase
          </p>
        </div>

        {/* Astuce magique */}
        <div
          style={{
            background: "rgba(79,142,247,0.1)",
            border: "1px solid rgba(79,142,247,0.3)",
            borderRadius: "14px",
            padding: "16px 20px",
            marginBottom: "28px",
          }}
        >
          <p
            style={{
              color: "#4f8ef7",
              fontWeight: 700,
              fontSize: "0.9rem",
              marginBottom: "8px",
            }}
          >
            💡 L&apos;astuce magique
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.85rem",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            <strong style={{ color: "#4f8ef7" }}>QUAND</strong> → remplace par
            &quot;lorsque&quot; ou &quot;à quel moment&quot; ✦{" "}
            <strong style={{ color: "#2ec4b6" }}>QUANT</strong> → remplace par
            &quot;en ce qui concerne&quot; ✦{" "}
            <strong style={{ color: "#a78bfa" }}>QU&apos;EN</strong> → = que +
            en (qu&apos;en penses-tu ?)
          </p>
        </div>

        {/* Progression */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Question {indexActuel + 1}/{NB_QUESTIONS}
          </span>
          <span style={{ color: "#2ec4b6", fontWeight: 700 }}>
            Score : {score}
          </span>
        </div>

        {/* Barre de progression */}
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "6px",
            height: "6px",
            marginBottom: "28px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg, #4f8ef7, #2ec4b6)",
              height: "100%",
              width: `${(indexActuel / NB_QUESTIONS) * 100}%`,
              transition: "width 0.3s",
              borderRadius: "6px",
            }}
          />
        </div>

        {/* Carte question */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "2px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "36px 28px",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              color: "#fff",
              fontSize: "1.3rem",
              fontWeight: 600,
              lineHeight: 1.7,
            }}
          >
            {question.phrase}
          </p>
        </div>

        {/* Boutons choix */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          {CHOIX.map((choix) => {
            let bg = "rgba(255,255,255,0.07)";
            let border = "rgba(255,255,255,0.15)";
            let couleurTexte = "#fff";

            if (etat !== "attente" && choix === question.reponse) {
              bg = "rgba(46,196,182,0.2)";
              border = "#2ec4b6";
              couleurTexte = "#2ec4b6";
            } else if (
              etat !== "attente" &&
              choix === choixFait &&
              choix !== question.reponse
            ) {
              bg = "rgba(255,107,107,0.2)";
              border = "#ff6b6b";
              couleurTexte = "#ff6b6b";
            }

            return (
              <button
                key={choix}
                onClick={() => repondre(choix)}
                disabled={etat !== "attente"}
                style={{
                  background: bg,
                  border: `2px solid ${border}`,
                  color: couleurTexte,
                  padding: "14px 32px",
                  borderRadius: "14px",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  cursor: etat === "attente" ? "pointer" : "default",
                  transition: "all 0.2s",
                  minWidth: "120px",
                }}
              >
                {choix}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {etat !== "attente" && (
          <div
            style={{
              background:
                etat === "correct"
                  ? "rgba(46,196,182,0.1)"
                  : "rgba(255,107,107,0.1)",
              border: `1px solid ${etat === "correct" ? "#2ec4b6" : "#ff6b6b"}40`,
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: etat === "correct" ? "#2ec4b6" : "#ff6b6b",
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              {etat === "correct"
                ? "✅ Bonne réponse !"
                : "❌ Pas tout à fait..."}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.88rem",
                margin: 0,
              }}
            >
              {question.explication}
            </p>
          </div>
        )}

        {/* Bouton suivant */}
        {etat !== "attente" && (
          <div style={{ textAlign: "center" }}>
            <button
              onClick={suivant}
              style={{
                background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                border: "none",
                color: "#fff",
                padding: "14px 36px",
                borderRadius: "16px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {indexActuel + 1 >= NB_QUESTIONS
                ? "Voir mon score"
                : "Question suivante →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
