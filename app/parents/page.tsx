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

const LABEL_CLASSES: Record<string, string> = {
  cp: "CP",
  ce1: "CE1",
  ce2: "CE2",
  cm1: "CM1",
  cm2: "CM2",
};

export default function ParentsPage() {
  const router = useRouter();
  const [profil, setProfil] = useState<{
    prenom: string;
    nom: string;
    classe: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<any[]>([]);

  useEffect(() => {
    const chargerDonnees = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        router.push("/connexion");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("prenom, nom, classe")
        .eq("id", user.id)
        .single();

      if (data)
        setProfil({ prenom: data.prenom, nom: data.nom, classe: data.classe });

      const tousLesScores = await getAllScores();
      setScores(tousLesScores);
      setLoading(false);
    };
    chargerDonnees();
  }, [router]);

  const bilansUniquement = scores.filter(
    (s) => s.theme === "bilan" || s.theme === "bilan-2",
  );

  // Filtre uniquement la classe actuelle
  const bilansClasseActuelle = bilansUniquement.filter(
    (s) => s.classe === profil?.classe,
  );

  const moyenneParMatiere = () => {
    const matieres = ["francais", "maths", "anglais"];
    return matieres
      .map((matiere) => {
        const bilansMatiere = bilansClasseActuelle.filter(
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

  const evolutionDansLeTemps = bilansClasseActuelle
    .slice()
    .reverse()
    .map((s) => ({
      date: new Date(s.created_at).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      }),
      score: Math.round((s.score / s.total) * 20 * 10) / 10,
      matiere:
        s.matiere === "francais"
          ? "Français"
          : s.matiere === "maths"
            ? "Maths"
            : "Anglais",
    }));

  const comparaisonBilans = () => {
    const matieres = ["francais", "maths", "anglais"];
    return matieres
      .map((matiere) => {
        const bilan1 = bilansClasseActuelle.find(
          (s) => s.matiere === matiere && s.theme === "bilan",
        );
        const bilan2 = bilansClasseActuelle.find(
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

  const moyenneGenerale =
    bilansClasseActuelle.length > 0
      ? bilansClasseActuelle.reduce(
          (acc, s) => acc + (s.score / s.total) * 20,
          0,
        ) / bilansClasseActuelle.length
      : 0;

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
  const aBilans = bilansClasseActuelle.length > 0;

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
          👨‍👩‍👧 Espace parents
        </h1>
        <p style={{ color: "#aaa", fontSize: "0.95rem" }}>
          Suivez la progression de{" "}
          <strong style={{ color: "#fff" }}>
            {profil.prenom} {profil.nom}
          </strong>{" "}
          en {LABEL_CLASSES[profil.classe] ?? profil.classe}
        </p>
      </div>

      {!aBilans ? (
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📊</div>
          <div
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.1rem",
              marginBottom: "8px",
            }}
          >
            Pas encore de bilans en {LABEL_CLASSES[profil.classe]}
          </div>
          <div style={{ color: "#aaa", fontSize: "0.9rem" }}>
            Les graphiques apparaîtront dès que {profil.prenom} aura complété un
            bilan.
          </div>
        </div>
      ) : (
        <>
          {/* Moyenne générale */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(79,142,247,0.15), rgba(46,196,182,0.1))",
              border: "1px solid rgba(79,142,247,0.3)",
              borderRadius: "20px",
              padding: "24px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#aaa",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Moyenne générale
              </div>
              <div style={{ fontSize: "0.9rem", color: "#fff" }}>
                Classe : {LABEL_CLASSES[profil.classe]}
              </div>
            </div>
            <div
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                color:
                  moyenneGenerale >= 16
                    ? "#2ec4b6"
                    : moyenneGenerale >= 10
                      ? "#ffd166"
                      : "#ff6b6b",
              }}
            >
              {moyenneGenerale.toFixed(1).replace(".", ",")} / 20
            </div>
          </div>

          {/* Graphique 1 — Moyenne par matière */}
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

          {/* Graphique 2 — Évolution dans le temps */}
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

          {/* Graphique 3 — Bilan 1 vs Bilan 2 */}
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

      {/* Retour */}
      <div style={{ textAlign: "center", marginTop: "32px" }}>
        <span
          onClick={() => router.push("/profil")}
          style={{ color: "#4f8ef7", cursor: "pointer", fontSize: "0.95rem" }}
        >
          ← Retour au profil
        </span>
      </div>
    </div>
  );
}
