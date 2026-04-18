"use client";

import { supabase } from "@/supabaseClient";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TOUTES_LES_QUESTIONS = [
  {
    id: 1,
    phrase: "___ chaussures sont trop petites.",
    reponse: "Ces",
    explication:
      "'Ces' est un adjectif démonstratif pluriel. Remplace par 'les' → Ces chaussures = les chaussures.",
  },
  {
    id: 2,
    phrase: "Il range ___ affaires dans son sac.",
    reponse: "ses",
    explication:
      "'Ses' est un adjectif possessif pluriel. Remplace par 'mes' → ses affaires = mes affaires ✅.",
  },
  {
    id: 3,
    phrase: "___ vraiment une bonne idée !",
    reponse: "C'est",
    explication:
      "'C'est' = 'ce + est'. Remplace par 'cela est' → C'est une bonne idée = cela est une bonne idée ✅.",
  },
  {
    id: 4,
    phrase: "Il ___ blessé en tombant.",
    reponse: "s'est",
    explication:
      "'S'est' = 'se + est'. Remplace par 's'était' → il s'est blessé = il s'était blessé ✅.",
  },
  {
    id: 5,
    phrase: "___ fleurs sont magnifiques.",
    reponse: "Ces",
    explication:
      "'Ces' est un adjectif démonstratif pluriel. Remplace par 'les' → Ces fleurs = les fleurs ✅.",
  },
  {
    id: 6,
    phrase: "Elle a perdu ___ clés.",
    reponse: "ses",
    explication:
      "'Ses' est un adjectif possessif pluriel. Remplace par 'mes' → ses clés = mes clés ✅.",
  },
  {
    id: 7,
    phrase: "___ lui qui a gagné !",
    reponse: "C'est",
    explication:
      "'C'est' = 'ce + est'. Remplace par 'cela est' → C'est lui = cela est lui ✅.",
  },
  {
    id: 8,
    phrase: "Elle ___ levée très tôt ce matin.",
    reponse: "s'est",
    explication:
      "'S'est' = 'se + est'. Remplace par 's'était' → elle s'est levée = elle s'était levée ✅.",
  },
  {
    id: 9,
    phrase: "Regarde ___ nuages, il va pleuvoir.",
    reponse: "ces",
    explication:
      "'Ces' est un adjectif démonstratif pluriel. Remplace par 'les' → ces nuages = les nuages ✅.",
  },
  {
    id: 10,
    phrase: "Il promène ___ chiens tous les matins.",
    reponse: "ses",
    explication:
      "'Ses' est un adjectif possessif pluriel. Remplace par 'mes' → ses chiens = mes chiens ✅.",
  },
  {
    id: 11,
    phrase: "___ incroyable comme il a grandi !",
    reponse: "C'est",
    explication:
      "'C'est' = 'ce + est'. Remplace par 'cela est' → C'est incroyable = cela est incroyable ✅.",
  },
  {
    id: 12,
    phrase: "Le chat ___ caché sous le lit.",
    reponse: "s'est",
    explication:
      "'S'est' = 'se + est'. Remplace par 's'était' → s'est caché = s'était caché ✅.",
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

const CHOIX = ["ces", "ses", "c'est", "s'est"];
const NB_QUESTIONS = 10;
type EtatQuestion = "attente" | "correct" | "incorrect";

export default function FicheCesSes() {
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
        .eq("theme", "ces-ses")
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
        .eq("theme", "ces-ses")
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
            theme: "ces-ses",
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
              ? "Bravo ! Tu maîtrises Ces / Ses / C'est / S'est !"
              : pourcentage >= 50
                ? "Pas mal ! Rappelle-toi des astuces de remplacement."
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
                background: "linear-gradient(135deg, #ffd166, #ff6b6b)",
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
              color: "#ffd166",
              fontSize: "1.4rem",
              fontWeight: 800,
              marginBottom: "4px",
            }}
          >
            🔄 Ces / Ses / C&apos;est / S&apos;est
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Choisis le bon mot pour compléter la phrase
          </p>
        </div>

        <div
          style={{
            background: "rgba(255,209,102,0.1)",
            border: "1px solid rgba(255,209,102,0.3)",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              color: "#ffd166",
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
            <strong style={{ color: "#ffd166" }}>CES</strong> → remplace par{" "}
            <strong style={{ color: "#ffd166" }}>&quot;les&quot;</strong>. Si ça
            marche → CES. Exemple : <em>ces</em> chaussures → <em>les</em>{" "}
            chaussures ✅<br />
            <strong style={{ color: "#2ec4b6" }}>SES</strong> → remplace par{" "}
            <strong style={{ color: "#2ec4b6" }}>&quot;mes&quot;</strong>. Si ça
            marche → SES. Exemple : <em>ses</em> clés → <em>mes</em> clés ✅
            <br />
            <strong style={{ color: "#4f8ef7" }}>C&apos;EST</strong> → remplace
            par{" "}
            <strong style={{ color: "#4f8ef7" }}>&quot;cela est&quot;</strong>.
            Si ça marche → C&apos;EST. Exemple : <em>c&apos;est</em> beau →{" "}
            <em>cela est</em> beau ✅<br />
            <strong style={{ color: "#a78bfa" }}>S&apos;EST</strong> → remplace
            par{" "}
            <strong style={{ color: "#a78bfa" }}>
              &quot;s&apos;était&quot;
            </strong>
            . Si ça marche → S&apos;EST. Exemple : il <em>s&apos;est</em> blessé
            → il <em>s&apos;était</em> blessé ✅
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
            style={{ color: "#ffd166", fontWeight: 700, fontSize: "0.85rem" }}
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
              background: "linear-gradient(90deg, #ffd166, #ff6b6b)",
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
                background: "linear-gradient(135deg, #ffd166, #ff6b6b)",
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
