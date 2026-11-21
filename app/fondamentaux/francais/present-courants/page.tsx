"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";
import TableauConjugaison from "@/components/entrainement/TableauConjugaison";
import {
  ALLER,
  DIRE,
  FAIRE,
  POUVOIR,
  PRENDRE,
  VENIR,
} from "@/lib/entrainement/tableaux-conjugaison";

import { getSeriesPourNotion } from "@/lib/entrainement/series";
import { supabase } from "@/supabaseClient";
import Link from "next/link";

// Série d'Entraînement liée par l'identifiant de notion commun
const SERIE_ENTRAINEMENT = getSeriesPourNotion("present-courants")[0];
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
    phrase: "Nous ___ (aller) au cinéma.",
    choix: ["allons", "allez", "vont"],
    reponse: "allons",
    explication:
      "Avec « nous », aller fait « allons » : nous allons.",
  },
  {
    id: 2,
    phrase: "Mon frère ___ (faire) du vélo.",
    choix: ["fait", "fais", "font"],
    reponse: "fait",
    explication:
      "Avec « il », faire fait « fait » : il fait, avec un t.",
  },
  {
    id: 3,
    phrase: "Vous ___ (dire) bonjour.",
    choix: ["disez", "dites", "disent"],
    reponse: "dites",
    explication:
      "Avec « vous », dire fait « dites ». Attention, trois verbes ne finissent pas par -ez avec « vous » : vous êtes, vous faites, vous dites.",
  },
  {
    id: 4,
    phrase: "Elles ___ (venir) à la fête.",
    choix: ["vient", "viennent", "venons"],
    reponse: "viennent",
    explication:
      "Avec « elles », venir fait « viennent » : deux n, et -ent à la fin.",
  },
  {
    id: 5,
    phrase: "Je ___ (prendre) mon manteau.",
    choix: ["prends", "prend", "prennent"],
    reponse: "prends",
    explication:
      "Avec « je », prendre fait « prends », avec un s : je prends.",
  },
  {
    id: 6,
    phrase: "Tu ___ (pouvoir) jouer avec nous ?",
    choix: ["peux", "peut", "peuvent"],
    reponse: "peux",
    explication:
      "Avec « tu », pouvoir fait « peux », avec un x : tu peux.",
  },
  {
    id: 7,
    phrase: "Mes voisins ___ (aller) au marché.",
    choix: ["va", "vas", "vont"],
    reponse: "vont",
    explication:
      "Qui va au marché ? Mes voisins : « ils vont ».",
  },
  {
    id: 8,
    phrase: "Vous ___ (faire) un beau dessin.",
    choix: ["faisez", "faites", "font"],
    reponse: "faites",
    explication:
      "Avec « vous », faire fait « faites ». C'est un des trois verbes qui ne finissent pas par -ez : vous êtes, vous faites, vous dites.",
  },
  {
    id: 9,
    phrase: "Léa ___ (dire) merci.",
    choix: ["dit", "dis", "disent"],
    reponse: "dit",
    explication:
      "Qui dit merci ? Léa : « elle dit », avec un t.",
  },
  {
    id: 10,
    phrase: "Nous ___ (prendre) le train.",
    choix: ["prenons", "prennent", "prenez"],
    reponse: "prenons",
    explication:
      "Avec « nous », prendre fait « prenons » : un seul n.",
  },
  {
    id: 11,
    phrase: "Il ___ (venir) avec nous.",
    choix: ["viens", "vient", "viennent"],
    reponse: "vient",
    explication:
      "Avec « il », venir fait « vient », avec un t.",
  },
  {
    id: 12,
    phrase: "Les chats ___ (pouvoir) sauter très haut.",
    choix: ["peut", "peux", "peuvent"],
    reponse: "peuvent",
    explication:
      "Avec « ils », pouvoir fait « peuvent » : ils peuvent.",
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

export default function FichePresentCourants() {
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
        .eq("theme", "present-courants")
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
        .eq("theme", "present-courants")
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
          theme: "present-courants",
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
              ? "Bravo ! Tu connais bien ces verbes !"
              : pourcentage >= 50
                ? "Pas mal ! Apprends les tableaux par cœur, et attention au « vous »."
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
            🚶 Le présent des verbes courants
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
            Ces verbes changent beaucoup : apprends-les par cœur. Pour trouver la
            bonne forme, cherche d&apos;abord{" "}
            <strong style={{ color: "#2ec4b6" }}>qui fait l&apos;action</strong>.
            <br />
            <strong style={{ color: "#4f8ef7" }}>
              Attention, trois verbes ne finissent pas par -ez avec « vous » :
            </strong>{" "}
            vous êtes, vous faites, vous dites ✅
          </p>
        </div>

        <p
          style={{
            color: "#2ec4b6",
            fontWeight: 700,
            fontSize: "0.85rem",
            marginBottom: "8px",
          }}
        >
          📋 Les tableaux à connaître
        </p>
        <TableauConjugaison
          verbes={[ALLER, FAIRE, DIRE, VENIR, PRENDRE, POUVOIR]}
        />

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
