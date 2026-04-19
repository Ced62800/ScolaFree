"use client";

import { supabase } from "@/supabaseClient";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TOUTES_LES_QUESTIONS = [
  {
    id: 1,
    phrase: "___ beau paysage !",
    reponse: "Quel",
    explication:
      "'Quel' s'accorde avec 'paysage' (masculin singulier) → Quel beau paysage !",
  },
  {
    id: 2,
    phrase: "Je sais ___ a raison.",
    reponse: "qu'elle",
    explication:
      "'Qu'elle' = 'que' + 'elle'. Je sais que elle a raison → qu'elle a raison ✅.",
  },
  {
    id: 3,
    phrase: "___ belle journée !",
    reponse: "Quelle",
    explication:
      "'Quelle' s'accorde avec 'journée' (féminin singulier) → Quelle belle journée !",
  },
  {
    id: 4,
    phrase: "Il pense ___ est intelligente.",
    reponse: "qu'elle",
    explication:
      "'Qu'elle' = 'que' + 'elle'. Il pense que elle est intelligente → qu'elle est intelligente ✅.",
  },
  {
    id: 5,
    phrase: "___ est ton film préféré ?",
    reponse: "Quel",
    explication:
      "'Quel' s'accorde avec 'film' (masculin singulier) → Quel est ton film préféré ?",
  },
  {
    id: 6,
    phrase: "___ est ta couleur préférée ?",
    reponse: "Quelle",
    explication:
      "'Quelle' s'accorde avec 'couleur' (féminin singulier) → Quelle est ta couleur préférée ?",
  },
  {
    id: 7,
    phrase: "Tu crois ___ viendra demain ?",
    reponse: "qu'elle",
    explication:
      "'Qu'elle' = 'que' + 'elle'. Tu crois que elle viendra → qu'elle viendra ✅.",
  },
  {
    id: 8,
    phrase: "___ surprise !",
    reponse: "Quelle",
    explication:
      "'Quelle' s'accorde avec 'surprise' (féminin singulier) → Quelle surprise !",
  },
  {
    id: 9,
    phrase: "___ temps fait-il aujourd'hui ?",
    reponse: "Quel",
    explication:
      "'Quel' s'accorde avec 'temps' (masculin singulier) → Quel temps fait-il ?",
  },
  {
    id: 10,
    phrase: "Il espère ___ réussira.",
    reponse: "qu'elle",
    explication:
      "'Qu'elle' = 'que' + 'elle'. Il espère que elle réussira → qu'elle réussira ✅.",
  },
  {
    id: 11,
    phrase: "___ chance tu as !",
    reponse: "Quelle",
    explication:
      "'Quelle' s'accorde avec 'chance' (féminin singulier) → Quelle chance tu as !",
  },
  {
    id: 12,
    phrase: "___ est le problème ?",
    reponse: "Quel",
    explication:
      "'Quel' s'accorde avec 'problème' (masculin singulier) → Quel est le problème ?",
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

const CHOIX = ["quel", "quelle", "qu'elle"];
const NB_QUESTIONS = 10;
type EtatQuestion = "attente" | "correct" | "incorrect";

export default function FicheQuelQuelle() {
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
        .eq("theme", "quel-quelle")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data) setAncienScore(data.score);
    };
    init();
  }, []);

  useEffect(() => {
    if (!termine || scoreSaved.current || !estConnecte) return;
    scoreSaved.current = true;
    const sauvegarder = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;
      const { data: existing } = await supabase
        .from("scores")
        .select("id")
        .eq("user_id", user.id)
        .eq("classe", "fondamentaux")
        .eq("matiere", "francais")
        .eq("theme", "quel-quelle")
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
        await supabase
          .from("scores")
          .insert({
            user_id: user.id,
            classe: "fondamentaux",
            matiere: "francais",
            theme: "quel-quelle",
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
            padding: "40px 28px",
            maxWidth: "480px",
            width: "100%",
            textAlign: "center",
            border: `2px solid ${couleur}40`,
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>{emoji}</div>
          <h2
            style={{
              color: "#fff",
              fontSize: "1.5rem",
              fontWeight: 800,
              marginBottom: "8px",
            }}
          >
            Exercice terminé !
          </h2>
          <div
            style={{
              fontSize: "2.8rem",
              fontWeight: 900,
              color: couleur,
              margin: "16px 0",
            }}
          >
            {score}/{NB_QUESTIONS}
          </div>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
            {pourcentage >= 80
              ? "Bravo ! Tu maîtrises Quel / Quelle / Qu'elle !"
              : pourcentage >= 50
                ? "Pas mal ! Rappelle-toi : qu'elle = que + elle."
                : "Continue à t'entraîner, ça va venir !"}
          </p>
          {ancienScore !== null && (
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.85rem",
                marginBottom: "20px",
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
                background: "linear-gradient(135deg, #4f8ef7, #a78bfa)",
                border: "none",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "14px",
                fontSize: "0.95rem",
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
                padding: "12px 24px",
                borderRadius: "14px",
                fontSize: "0.95rem",
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f23",
        padding: "80px 20px 16px 20px",
      }}
    >
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <Link
          href="/fondamentaux/francais"
          style={{
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
            fontSize: "0.9rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "16px",
          }}
        >
          ← Retour
        </Link>

        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <h1
            style={{
              color: "#4f8ef7",
              fontSize: "1.4rem",
              fontWeight: 800,
              marginBottom: "4px",
            }}
          >
            ❓ Quel / Quelle / Qu&apos;elle
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Choisis le bon mot pour compléter la phrase
          </p>
        </div>

        <div
          style={{
            background: "rgba(79,142,247,0.1)",
            border: "1px solid rgba(79,142,247,0.3)",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              color: "#4f8ef7",
              fontWeight: 700,
              fontSize: "0.85rem",
              marginBottom: "8px",
            }}
          >
            💡 L&apos;astuce magique
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.82rem",
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            <strong style={{ color: "#4f8ef7" }}>QUEL</strong> = devant un nom
            masculin. Exemple : <em>quel</em> beau film ! (film = masculin) ✅
            <br />
            <strong style={{ color: "#a78bfa" }}>QUELLE</strong> = devant un nom
            féminin. Exemple : <em>quelle</em> belle journée ! (journée =
            féminin) ✅<br />
            <strong style={{ color: "#2ec4b6" }}>QU&apos;ELLE</strong> =
            &quot;que&quot; + &quot;elle&quot;. Remplace par{" "}
            <strong style={{ color: "#2ec4b6" }}>&quot;qu&apos;il&quot;</strong>
            . Si ça marche → c&apos;est QU&apos;ELLE. Exemple : je sais{" "}
            <em>qu&apos;elle</em> a raison → je sais <em>qu&apos;il</em> a
            raison ✅
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Question {indexActuel + 1}/{NB_QUESTIONS}
          </span>
          <span
            style={{ color: "#4f8ef7", fontWeight: 700, fontSize: "0.85rem" }}
          >
            Score : {score}
          </span>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "6px",
            height: "6px",
            marginBottom: "16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg, #4f8ef7, #a78bfa)",
              height: "100%",
              width: `${(indexActuel / NB_QUESTIONS) * 100}%`,
              transition: "width 0.3s",
              borderRadius: "6px",
            }}
          />
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "2px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            padding: "20px 16px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: 600,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {question.phrase}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "16px",
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
                  padding: "10px 20px",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: 800,
                  cursor: etat === "attente" ? "pointer" : "default",
                  transition: "all 0.2s",
                  minWidth: "90px",
                }}
              >
                {choix}
              </button>
            );
          })}
        </div>

        {etat !== "attente" && (
          <div
            style={{
              background:
                etat === "correct"
                  ? "rgba(46,196,182,0.1)"
                  : "rgba(255,107,107,0.1)",
              border: `1px solid ${etat === "correct" ? "#2ec4b6" : "#ff6b6b"}40`,
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "14px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: etat === "correct" ? "#2ec4b6" : "#ff6b6b",
                fontWeight: 700,
                marginBottom: "4px",
                fontSize: "0.95rem",
              }}
            >
              {etat === "correct"
                ? "✅ Bonne réponse !"
                : "❌ Pas tout à fait..."}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.85rem",
                margin: 0,
              }}
            >
              {question.explication}
            </p>
          </div>
        )}

        {etat !== "attente" && (
          <div style={{ textAlign: "center" }}>
            <button
              onClick={suivant}
              style={{
                background: "linear-gradient(135deg, #4f8ef7, #a78bfa)",
                border: "none",
                color: "#fff",
                padding: "12px 32px",
                borderRadius: "14px",
                fontSize: "0.95rem",
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
