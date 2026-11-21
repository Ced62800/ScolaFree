"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";

import { getSeriesPourNotion } from "@/lib/entrainement/series";
import { supabase } from "@/supabaseClient";
import Link from "next/link";

// Série d'Entraînement liée par l'identifiant de notion commun
const SERIE_ENTRAINEMENT = getSeriesPourNotion("accord-sujet-verbe")[0];
const STYLE_BOUTON_ENTRAINEMENT = {
  background: "rgba(244,162,97,0.12)",
  border: "1px solid rgba(244,162,97,0.5)",
  color: "#f4a261",
  padding: "12px 24px",
  borderRadius: "14px",
  fontSize: "0.95rem",
  fontWeight: 700,
  textDecoration: "none",
  display: "inline-block",
};
import { useEffect, useRef, useState } from "react";

const TOUTES_LES_QUESTIONS = [
  {
    id: 1,
    phrase: "Les poules ___ des graines.",
    choix: ["mange", "mangent"],
    reponse: "mangent",
    explication:
      "Qui mange des graines ? Les poules. Je remplace par « elles » : « elles mangent ». Elles sont plusieurs : le verbe se met au pluriel et finit par -ent.",
  },
  {
    id: 2,
    phrase: "Mon papa ___ le journal chaque matin.",
    choix: ["lit", "lisent"],
    reponse: "lit",
    explication:
      "Qui lit le journal ? Mon papa. Je remplace par « il » : « il lit ». Il est tout seul : le verbe reste au singulier.",
  },
  {
    id: 3,
    phrase: "Les élèves de la classe ___ leurs cahiers.",
    choix: ["ouvre", "ouvrent"],
    reponse: "ouvrent",
    explication:
      "Qui ouvre ? Les élèves de la classe. Attention : « classe » est au singulier, mais ce sont les élèves qui ouvrent. Je remplace par « ils » : « ils ouvrent ». Ils sont plusieurs : le verbe se met au pluriel et finit par -ent.",
  },
  {
    id: 4,
    phrase: "Le bébé de mes voisins ___ toute la nuit.",
    choix: ["pleure", "pleurent"],
    reponse: "pleure",
    explication:
      "Qui pleure ? Le bébé de mes voisins. Attention : « voisins » est au pluriel, mais c'est le bébé qui pleure. Je remplace par « il » : « il pleure ». Il est tout seul : le verbe reste au singulier.",
  },
  {
    id: 5,
    phrase: "Mes amis ___ à la piscine le dimanche.",
    choix: ["va", "vont"],
    reponse: "vont",
    explication:
      "Qui va à la piscine ? Mes amis. Je remplace par « ils » : « ils vont ». Ils sont plusieurs : le verbe se met au pluriel.",
  },
  {
    id: 6,
    phrase: "Ma tante ___ un chapeau rouge.",
    choix: ["porte", "portent"],
    reponse: "porte",
    explication:
      "Qui porte un chapeau ? Ma tante. Je remplace par « elle » : « elle porte ». Elle est toute seule : le verbe reste au singulier.",
  },
  {
    id: 7,
    phrase: "Tom et Emma ___ un gâteau.",
    choix: ["cuisine", "cuisinent"],
    reponse: "cuisinent",
    explication:
      "Qui cuisine un gâteau ? Tom et Emma. Avec « et », il y a deux personnes. Je remplace par « ils » : « ils cuisinent ». Ils sont plusieurs : le verbe se met au pluriel et finit par -ent.",
  },
  {
    id: 8,
    phrase: "Le train de Paris ___ en retard.",
    choix: ["arrive", "arrivent"],
    reponse: "arrive",
    explication:
      "Qui arrive en retard ? Le train de Paris. Je remplace par « il » : « il arrive ». Il est tout seul : le verbe reste au singulier.",
  },
  {
    id: 9,
    phrase: "Les arbres de la rue ___ très hauts.",
    choix: ["est", "sont"],
    reponse: "sont",
    explication:
      "Qui est très haut ? Les arbres de la rue. Attention : « rue » est au singulier, mais ce sont les arbres qui sont hauts. Je remplace par « ils » : « ils sont ». Ils sont plusieurs : le verbe se met au pluriel.",
  },
  {
    id: 10,
    phrase: "Mon grand frère ___ trois chats.",
    choix: ["a", "ont"],
    reponse: "a",
    explication:
      "Qui a trois chats ? Mon grand frère. Je remplace par « il » : « il a ». Il est tout seul : le verbe reste au singulier.",
  },
  {
    id: 11,
    phrase: "Les jouets de ma sœur ___ dans la caisse.",
    choix: ["est", "sont"],
    reponse: "sont",
    explication:
      "Qui est dans la caisse ? Les jouets de ma sœur. Attention : « sœur » est au singulier, mais ce sont les jouets qui sont dans la caisse. Je remplace par « ils » : « ils sont ». Ils sont plusieurs : le verbe se met au pluriel.",
  },
  {
    id: 12,
    phrase: "Dans le jardin ___ les enfants.",
    choix: ["joue", "jouent"],
    reponse: "jouent",
    explication:
      "Qui joue ? Les enfants. Cas bonus : le sujet est après le verbe. Je remplace par « ils » : « ils jouent ». Ils sont plusieurs : le verbe se met au pluriel et finit par -ent.",
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

const NB_QUESTIONS = 10;
type EtatQuestion = "attente" | "correct" | "incorrect";
type Question = (typeof TOUTES_LES_QUESTIONS)[number];

export default function FicheAccordSujetVerbe() {
  const [questions, setQuestions] = useState<Question[]>([]);
  // Mélange dans un useEffect (jamais dans l'initialiseur : ça casse l'hydratation)
  useEffect(() => {
    setQuestions(melangerTableau(TOUTES_LES_QUESTIONS).slice(0, NB_QUESTIONS));
  }, []);
  const [indexActuel, setIndexActuel] = useState(0);
  const [etat, setEtat] = useState<EtatQuestion>("attente");
  const [choixFait, setChoixFait] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [termine, setTermine] = useState(false);
  const [ancienScore, setAncienScore] = useState<number | null>(null);
  const scoreSaved = useRef(false);
  const { estConnecte, maxQuestions } = useDecouverte();
  const [showPopup, setShowPopup] = useState(false);
  const nbQuestions = Math.min(NB_QUESTIONS, maxQuestions);

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;
      const { data } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", user.id)
        .eq("classe", "fondamentaux")
        .eq("matiere", "francais")
        .eq("theme", "accord-sujet-verbe")
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
        .eq("theme", "accord-sujet-verbe")
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
          theme: "accord-sujet-verbe",
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
    if (indexActuel + 1 >= nbQuestions) {
      if (!estConnecte) {
        setShowPopup(true);
        return;
      }
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
    setShowPopup(false);
  };

  if (!question) return null;

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
              ? "Bravo ! Tu sais accorder le verbe avec son sujet !"
              : pourcentage >= 50
                ? "Pas mal ! Demande-toi « Qui fait l'action ? » puis remplace par il ou ils."
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
                background: "linear-gradient(135deg, #2ec4b6, #4f8ef7)",
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
            {SERIE_ENTRAINEMENT && (
              <Link
                href={`/entrainement/series/${SERIE_ENTRAINEMENT.id}`}
                style={STYLE_BOUTON_ENTRAINEMENT}
              >
                🏋️ S&apos;entraîner davantage
              </Link>
            )}
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
        {showPopup && <PopupInscription onRecommencer={recommencer} />}
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
              color: "#2ec4b6",
              fontSize: "1.4rem",
              fontWeight: 800,
              marginBottom: "4px",
            }}
          >
            🎯 L&apos;accord sujet-verbe
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Choisis la bonne forme du verbe
          </p>
        </div>

        <div
          style={{
            background: "rgba(46,196,182,0.1)",
            border: "1px solid rgba(46,196,182,0.3)",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              color: "#2ec4b6",
              fontWeight: 700,
              fontSize: "0.85rem",
              marginBottom: "6px",
            }}
          >
            💡 L&apos;astuce magique
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.82rem",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Pour trouver le sujet, pose la question{" "}
            <strong style={{ color: "#2ec4b6" }}>« Qui fait l&apos;action ? »</strong>{" "}
            Puis remplace-le par{" "}
            <strong style={{ color: "#4f8ef7" }}>il ou ils</strong> (elle ou
            elles).
            <br />
            Les chats dorment → <em>ils</em> dorment ✅
            <br />
            Le chat dort → <em>il</em> dort ✅
            <br />
            Attention : le mot juste avant le verbe n&apos;est pas toujours le
            sujet !
            <br />
            Les enfants de ma classe jouent → <em>ils</em> jouent ✅
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
              marginBottom: "6px",
            }}
          >
            🌟 Cas bonus : le sujet après le verbe
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.82rem",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Parfois, le sujet est placé après le verbe. La question « Qui ? »
            marche aussi !
            <br />
            Dans la cour jouent les enfants. Qui joue ? Les enfants →{" "}
            <em>ils</em> jouent ✅
          </p>
        </div>

        {SERIE_ENTRAINEMENT && (
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <Link
              href={`/entrainement/series/${SERIE_ENTRAINEMENT.id}`}
              style={{
                ...STYLE_BOUTON_ENTRAINEMENT,
                padding: "8px 18px",
                fontSize: "0.85rem",
              }}
            >
              🏋️ S&apos;entraîner davantage
            </Link>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Question {indexActuel + 1}/{nbQuestions}
          </span>
          <span
            style={{ color: "#2ec4b6", fontWeight: 700, fontSize: "0.85rem" }}
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
              background: "linear-gradient(90deg, #2ec4b6, #4f8ef7)",
              height: "100%",
              width: `${(indexActuel / nbQuestions) * 100}%`,
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
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          {question.choix.map((choix) => {
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
                  padding: "10px 24px",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: 800,
                  cursor: etat === "attente" ? "pointer" : "default",
                  transition: "all 0.2s",
                  minWidth: "110px",
                  textTransform: "lowercase",
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
                background: "linear-gradient(135deg, #2ec4b6, #4f8ef7)",
                border: "none",
                color: "#fff",
                padding: "12px 32px",
                borderRadius: "14px",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {indexActuel + 1 >= nbQuestions
                ? "Voir mon score"
                : "Question suivante →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
