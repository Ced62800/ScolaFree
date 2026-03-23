"use client";

import { getAllScores } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function ProfilPage() {
  const router = useRouter();
  const [profil, setProfil] = useState<{
    prenom: string;
    nom: string;
    classe: string;
    niveau: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [modeReset, setModeReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");
  const [scores, setScores] = useState<any[]>([]);

  useEffect(() => {
    const chargerProfil = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        router.push("/connexion");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("prenom, nom, classe, niveau")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfil({
          prenom: data.prenom,
          nom: data.nom,
          classe: data.classe,
          niveau: data.niveau,
          email: user.email ?? "",
        });
      }
      const tousLesScores = await getAllScores();
      setScores(tousLesScores);
      setLoading(false);
    };
    chargerProfil();
  }, [router]);

  const handleReset = async () => {
    if (!profil?.email) return;
    setResetError("");
    setResetSuccess("");
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(profil.email, {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    });
    setResetLoading(false);
    if (error) {
      setResetError("Une erreur est survenue. Réessaie.");
      return;
    }
    setResetSuccess("Un email de réinitialisation a été envoyé !");
    setModeReset(false);
  };

  const niveauLabel: Record<string, string> = {
    cp: "CP",
    ce1: "CE1",
    ce2: "CE2",
    cm1: "CM1",
    cm2: "CM2",
  };

  const bilansUniquement = scores.filter(
    (s) => s.theme === "bilan" || s.theme === "bilan-2",
  );

  const moyenneParMatiere = () => {
    const matieres = ["francais", "maths", "anglais"];
    return matieres
      .map((matiere) => {
        const bilansMatiere = bilansUniquement.filter(
          (s) => s.matiere === matiere,
        );
        if (bilansMatiere.length === 0) return null;
        const moyenne =
          bilansMatiere.reduce((acc, s) => acc + (s.score / s.total) * 20, 0) /
          bilansMatiere.length;
        return {
          matiere:
            matiere === "francais"
              ? "Français"
              : matiere === "maths"
                ? "Maths"
                : "Anglais",
          moyenne: Math.round(moyenne * 10) / 10,
        };
      })
      .filter(Boolean);
  };

  const evolutionDansLeTemps = bilansUniquement
    .slice()
    .reverse()
    .map((s) => ({
      date: new Date(s.created_at).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      }),
      score: Math.round((s.score / s.total) * 20 * 10) / 10,
    }));

  const comparaisonBilans = () => {
    const matieres = ["francais", "maths", "anglais"];
    return matieres
      .map((matiere) => {
        const bilan1 = scores.find(
          (s) => s.matiere === matiere && s.theme === "bilan",
        );
        const bilan2 = scores.find(
          (s) => s.matiere === matiere && s.theme === "bilan-2",
        );
        if (!bilan1 && !bilan2) return null;
        return {
          matiere:
            matiere === "francais"
              ? "Français"
              : matiere === "maths"
                ? "Maths"
                : "Anglais",
          "Bilan 1": bilan1
            ? Math.round((bilan1.score / bilan1.total) * 20 * 10) / 10
            : 0,
          "Bilan 2": bilan2
            ? Math.round((bilan2.score / bilan2.total) * 20 * 10) / 10
            : 0,
        };
      })
      .filter(Boolean);
  };

  // Calcul des badges
  const nbBilans = bilansUniquement.length;
  const a2020 = bilansUniquement.some((s) => s.score === s.total);
  const bilans1620 = bilansUniquement.filter(
    (s) => (s.score / s.total) * 20 >= 16,
  );
  const moyenneGenerale =
    bilansUniquement.length > 0
      ? bilansUniquement.reduce((acc, s) => acc + (s.score / s.total) * 20, 0) /
        bilansUniquement.length
      : 0;
  const classeDebloquee = profil
    ? ["cp", "ce1", "ce2", "cm1", "cm2"].indexOf(profil.classe) > 0
    : false;
  const cm2Complete =
    profil?.classe === "cm2" &&
    bilansUniquement.filter((s) => s.classe === "cm2").length >= 3;

  const badges = [
    {
      emoji: "🌟",
      nom: "Premier pas",
      description: "Complète ton premier bilan",
      debloque: nbBilans >= 1,
      progression: Math.min(nbBilans, 1),
      total: 1,
      messageDebloque: "Bravo, tu as fait ton premier bilan !",
      messageEncouragement: "Fais ton premier bilan pour débloquer ce badge !",
    },
    {
      emoji: "📚",
      nom: "Studieux",
      description: "Complète 5 bilans",
      debloque: nbBilans >= 5,
      progression: Math.min(nbBilans, 5),
      total: 5,
      messageDebloque: "Incroyable, 5 bilans complétés !",
      messageEncouragement: `Plus que ${5 - Math.min(nbBilans, 5)} bilan(s) !`,
    },
    {
      emoji: "🎯",
      nom: "Précis",
      description: "Obtiens 20/20 à un bilan",
      debloque: a2020,
      progression: a2020 ? 1 : 0,
      total: 1,
      messageDebloque: "Parfait ! Tu as eu 20/20 !",
      messageEncouragement: "Vise la perfection : 20/20 à un bilan !",
    },
    {
      emoji: "🔥",
      nom: "En feu",
      description: "Obtiens 3 bilans ≥ 16/20",
      debloque: bilans1620.length >= 3,
      progression: Math.min(bilans1620.length, 3),
      total: 3,
      messageDebloque: "Tu es en feu ! 3 bilans ≥ 16/20 !",
      messageEncouragement: `Plus que ${3 - Math.min(bilans1620.length, 3)} bilan(s) ≥ 16/20 !`,
    },
    {
      emoji: "🏆",
      nom: "Champion",
      description: "Moyenne générale ≥ 18/20",
      debloque: moyenneGenerale >= 18,
      progression: Math.min(Math.round(moyenneGenerale * 10) / 10, 18),
      total: 18,
      messageDebloque: "Champion ! Moyenne ≥ 18/20 !",
      messageEncouragement: `Ta moyenne : ${Math.round(moyenneGenerale * 10) / 10}/20 — continue !`,
    },
    {
      emoji: "🚀",
      nom: "Explorateur",
      description: "Débloque la classe suivante",
      debloque: classeDebloquee,
      progression: classeDebloquee ? 1 : 0,
      total: 1,
      messageDebloque: "Tu as débloqué une nouvelle classe !",
      messageEncouragement:
        "Obtiens 16/20 de moyenne pour débloquer la classe suivante !",
    },
    {
      emoji: "💎",
      nom: "Expert",
      description: "Complète tous les bilans CM2",
      debloque: cm2Complete,
      progression: cm2Complete ? 1 : 0,
      total: 1,
      messageDebloque: "Félicitations ! Tu as terminé le CM2 !",
      messageEncouragement:
        "Termine tous les bilans du CM2 pour débloquer ce badge !",
    },
  ];

  const nbBadgesDebloques = badges.filter((b) => b.debloque).length;

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px",
          color: "#aaa",
          fontSize: "1.1rem",
        }}
      >
        Chargement...
      </div>
    );
  }

  if (!profil) return null;

  const dataMoyennes = moyenneParMatiere();
  const dataComparaison = comparaisonBilans();
  const aBilans = bilansUniquement.length > 0;

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 20px" }}>
      {/* Titre */}
      <div style={{ marginBottom: "36px" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            marginBottom: "6px",
            background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          👤 Mon profil
        </h1>
        <p style={{ color: "#aaa", fontSize: "0.95rem" }}>
          Tes informations personnelles et paramètres de compte.
        </p>
      </div>

      {/* Avatar + nom */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(79,142,247,0.15), rgba(46,196,182,0.1))",
          border: "1px solid rgba(79,142,247,0.3)",
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            flexShrink: 0,
          }}
        >
          🎓
        </div>
        <div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff" }}>
            {profil.prenom} {profil.nom}
          </div>
          <div style={{ fontSize: "0.9rem", color: "#aaa", marginTop: "4px" }}>
            {profil.email}
          </div>
          <div
            style={{
              display: "inline-block",
              marginTop: "8px",
              background: "rgba(79,142,247,0.2)",
              border: "1px solid rgba(79,142,247,0.4)",
              borderRadius: "20px",
              padding: "3px 12px",
              fontSize: "0.8rem",
              color: "#4f8ef7",
              fontWeight: 600,
            }}
          >
            ⭐ {niveauLabel[profil.classe] ?? profil.classe}
          </div>
        </div>
      </div>

      {/* Infos détaillées */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#aaa",
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Mes informations
        </h2>
        <LigneInfo emoji="✏️" label="Prénom" valeur={profil.prenom} />
        <LigneInfo emoji="👤" label="Nom" valeur={profil.nom} />
        <LigneInfo emoji="📧" label="Email" valeur={profil.email} />
        <LigneInfo
          emoji="🎓"
          label="Classe"
          valeur={niveauLabel[profil.classe] ?? profil.classe}
        />
        <LigneInfo emoji="📚" label="Niveau" valeur={profil.niveau} dernier />
      </div>

      {/* Mot de passe */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#aaa",
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Sécurité
        </h2>
        {resetSuccess && (
          <div
            style={{
              background: "rgba(46,196,182,0.1)",
              border: "1px solid rgba(46,196,182,0.3)",
              color: "#2ec4b6",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "16px",
              fontSize: "0.9rem",
            }}
          >
            ✅ {resetSuccess}
          </div>
        )}
        {resetError && (
          <div
            style={{
              background: "rgba(255,107,107,0.1)",
              border: "1px solid rgba(255,107,107,0.3)",
              color: "#ff6b6b",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "16px",
              fontSize: "0.9rem",
            }}
          >
            ⚠️ {resetError}
          </div>
        )}
        {!modeReset ? (
          <button
            onClick={() => setModeReset(true)}
            style={{
              background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontSize: "0.95rem",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            🔒 Changer mon mot de passe
          </button>
        ) : (
          <div>
            <p
              style={{
                color: "#aaa",
                marginBottom: "16px",
                fontSize: "0.9rem",
              }}
            >
              Un email sera envoyé à{" "}
              <strong style={{ color: "#fff" }}>{profil.email}</strong>
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={handleReset}
                disabled={resetLoading}
                style={{
                  background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                {resetLoading ? "Envoi..." : "Envoyer le lien →"}
              </button>
              <button
                onClick={() => setModeReset(false)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "#aaa",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GRAPHIQUES */}
      {aBilans && (
        <>
          <div style={{ marginTop: "40px", marginBottom: "24px" }}>
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                color: "#fff",
                marginBottom: "6px",
              }}
            >
              📊 Mes progrès
            </h2>
            <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
              Tes résultats aux bilans
            </p>
          </div>

          {dataMoyennes.length > 0 && (
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "24px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#aaa",
                  marginBottom: "20px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Moyenne par matière /20
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={dataMoyennes}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <XAxis
                    dataKey="matiere"
                    tick={{ fill: "#aaa", fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 20]}
                    tick={{ fill: "#aaa", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a2e",
                      border: "1px solid rgba(79,142,247,0.3)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                    formatter={(value: any) => [`${value}/20`, "Moyenne"]}
                  />
                  <Bar
                    dataKey="moyenne"
                    fill="url(#gradBar)"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f8ef7" />
                      <stop offset="100%" stopColor="#2ec4b6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {evolutionDansLeTemps.length > 1 && (
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "24px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#aaa",
                  marginBottom: "20px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Évolution dans le temps
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={evolutionDansLeTemps}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#aaa", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 20]}
                    tick={{ fill: "#aaa", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a2e",
                      border: "1px solid rgba(79,142,247,0.3)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                    formatter={(value: any) => [`${value}/20`, "Score"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4f8ef7"
                    strokeWidth={3}
                    dot={{ fill: "#4f8ef7", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {dataComparaison.length > 0 && (
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "24px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#aaa",
                  marginBottom: "20px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Bilan 1 vs Bilan 2
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={dataComparaison}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <XAxis
                    dataKey="matiere"
                    tick={{ fill: "#aaa", fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 20]}
                    tick={{ fill: "#aaa", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a2e",
                      border: "1px solid rgba(79,142,247,0.3)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                    formatter={(value: any) => [`${value}/20`]}
                  />
                  <Legend
                    wrapperStyle={{ color: "#aaa", fontSize: "0.85rem" }}
                  />
                  <Bar dataKey="Bilan 1" fill="#4f8ef7" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Bilan 2" fill="#2ec4b6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* BADGES */}
      <div style={{ marginTop: "40px", marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            color: "#fff",
            marginBottom: "4px",
          }}
        >
          🏅 Mes badges
        </h2>
        <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
          {nbBadgesDebloques}/{badges.length} badges débloqués
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {badges.map((badge) => (
          <div
            key={badge.nom}
            style={{
              background: badge.debloque
                ? "linear-gradient(135deg, rgba(79,142,247,0.15), rgba(46,196,182,0.1))"
                : "rgba(255,255,255,0.03)",
              border: badge.debloque
                ? "1px solid rgba(79,142,247,0.4)"
                : "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              padding: "20px",
              textAlign: "center",
              opacity: badge.debloque ? 1 : 0.5,
            }}
          >
            {/* Emoji */}
            <div
              style={{
                fontSize: "2.5rem",
                marginBottom: "8px",
                filter: badge.debloque ? "none" : "grayscale(100%)",
              }}
            >
              {badge.emoji}
            </div>

            {/* Nom */}
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: badge.debloque ? "#fff" : "#666",
                marginBottom: "4px",
              }}
            >
              {badge.nom}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: "0.8rem",
                color: "#888",
                marginBottom: "12px",
              }}
            >
              {badge.description}
            </div>

            {/* Barre de progression */}
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: "10px",
                height: "6px",
                marginBottom: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(badge.progression / badge.total) * 100}%`,
                  height: "100%",
                  background: badge.debloque
                    ? "linear-gradient(90deg, #4f8ef7, #2ec4b6)"
                    : "#555",
                  borderRadius: "10px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>

            {/* Message */}
            <div
              style={{
                fontSize: "0.78rem",
                color: badge.debloque ? "#2ec4b6" : "#666",
                fontStyle: badge.debloque ? "normal" : "italic",
              }}
            >
              {badge.debloque
                ? badge.messageDebloque
                : badge.messageEncouragement}
            </div>
          </div>
        ))}
      </div>

      {/* Retour */}
      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <span
          onClick={() => router.push("/")}
          style={{ color: "#4f8ef7", cursor: "pointer", fontSize: "0.95rem" }}
        >
          ← Retour à l'accueil
        </span>
      </div>
    </div>
  );
}

function LigneInfo({
  emoji,
  label,
  valeur,
  dernier,
}: {
  emoji: string;
  label: string;
  valeur: string;
  dernier?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: dernier ? "none" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span style={{ color: "#888", fontSize: "0.9rem" }}>
        {emoji} {label}
      </span>
      <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "#fff" }}>
        {valeur}
      </span>
    </div>
  );
}
