"use client";

import { useRouter } from "next/navigation";

const niveaux = [
  {
    id: "primaire",
    label: "École Primaire",
    emoji: "🏫",
    desc: "CP · CE1 · CE2 · CM1 · CM2",
    age: "6 à 11 ans",
    color: "#4f8ef7",
    dispo: true,
  },
  {
    id: "college",
    label: "Collège",
    emoji: "🎒",
    desc: "6ème · 5ème · 4ème · 3ème",
    age: "11 à 15 ans",
    color: "#2ec4b6",
    dispo: true,
  },
];

export default function CoursPage() {
  const router = useRouter();

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button className="cours-back" onClick={() => router.push("/")}>
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span
            onClick={() => router.push("/")}
            style={{ cursor: "pointer", color: "rgba(255,255,255,0.6)" }}
          >
            Accueil
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Choisir un établissement</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">📚</div>
        <h1 className="cours-hero-title">Choisir ton niveau</h1>
        <p className="cours-hero-desc">
          Sélectionne ton établissement pour accéder aux cours
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        {niveaux.map((n) => (
          <div
            key={n.id}
            onClick={() => n.dispo && router.push(`/cours/${n.id}`)}
            style={{
              background: n.dispo
                ? "rgba(255,255,255,0.05)"
                : "rgba(255,255,255,0.02)",
              border: `2px solid ${n.dispo ? n.color : "rgba(255,255,255,0.08)"}`,
              borderRadius: "20px",
              padding: "32px 24px",
              cursor: n.dispo ? "pointer" : "default",
              opacity: n.dispo ? 1 : 0.5,
              transition: "transform 0.15s, box-shadow 0.15s",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              if (n.dispo) {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-2px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  `0 8px 30px ${n.color}33`;
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            <div
              style={{ fontSize: "5rem", marginBottom: "10px", lineHeight: 1 }}
            >
              {n.emoji}
            </div>
            <div
              style={{
                fontWeight: 800,
                fontSize: "2.2rem",
                marginBottom: "6px",
              }}
            >
              {n.label}
            </div>
            <div
              style={{ color: "#aaa", fontSize: "1.2rem", marginBottom: "4px" }}
            >
              {n.desc}
            </div>
            <div
              style={{
                color: "#666",
                fontSize: "1.1rem",
                marginBottom: "16px",
              }}
            >
              {n.age}
            </div>
            <span
              style={{
                display: "inline-block",
                color: "#fff",
                background: n.color,
                fontWeight: 700,
                fontSize: "1.1rem",
                padding: "10px 32px",
                borderRadius: "14px",
              }}
            >
              Accéder →
            </span>
          </div>
        ))}

        {/* ===== ENCART FONDAMENTAUX DU FRANÇAIS ===== */}
        <div
          onClick={() => router.push("/fondamentaux/francais")}
          style={{
            background:
              "linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(139,92,246,0.06) 100%)",
            border: "2px solid rgba(167,139,250,0.5)",
            borderRadius: "20px",
            padding: "24px 28px",
            cursor: "pointer",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform =
              "translateY(-2px)";
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              "0 8px 30px rgba(167,139,250,0.25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform =
              "translateY(0)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                borderRadius: "14px",
                width: "52px",
                height: "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                flexShrink: 0,
              }}
            >
              ✍️
            </div>
            <div>
              <div
                style={{
                  color: "#a78bfa",
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  marginBottom: "4px",
                }}
              >
                Les Fondamentaux du Français
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                }}
              >
                Les règles qui piègent tout le monde — et/est, quand/quant,
                homophones. Des exercices courts pour ne plus jamais se tromper.
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "16px",
              flexWrap: "wrap",
            }}
          >
            {[
              "⏰ Quand / Quant / Qu'en",
              "🔗 Et / Est",
              "✔️ 30 fiches disponibles",
            ].map((tag) => (
              <span
                key={tag}
                style={{
                  background: "rgba(167,139,250,0.15)",
                  color: "#c4b5fd",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ===== ENCART FONDAMENTAUX DES MATHS ===== */}
        <div
          onClick={() => router.push("/fondamentaux/maths")}
          style={{
            background:
              "linear-gradient(135deg, rgba(46,196,182,0.12) 0%, rgba(16,185,129,0.06) 100%)",
            border: "2px solid rgba(46,196,182,0.5)",
            borderRadius: "20px",
            padding: "24px 28px",
            cursor: "pointer",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform =
              "translateY(-2px)";
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              "0 8px 30px rgba(46,196,182,0.25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform =
              "translateY(0)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #2ec4b6, #059669)",
                borderRadius: "14px",
                width: "52px",
                height: "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                flexShrink: 0,
              }}
            >
              🧮
            </div>
            <div>
              <div
                style={{
                  color: "#2ec4b6",
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  marginBottom: "4px",
                }}
              >
                Les Fondamentaux des Maths
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                }}
              >
                Calcul mental, pourcentages, fractions, géométrie. Des astuces
                pratiques pour calculer vite et bien au quotidien.
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "16px",
              flexWrap: "wrap",
            }}
          >
            {["✖️ ×10, ×100, ×1000", "💯 Pourcentages", "🍕 Fractions"].map(
              (tag) => (
                <span
                  key={tag}
                  style={{
                    background: "rgba(46,196,182,0.15)",
                    color: "#5eead4",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
