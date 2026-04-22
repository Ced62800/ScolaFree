import Link from "next/link";

const niveaux = [
  { slug: "cm2", label: "CM2", emoji: "🌱", color: "#22c55e", dispo: true },
  { slug: "6eme", label: "6ème", emoji: "🔍", color: "#4f8ef7", dispo: true },
  { slug: "5eme", label: "5ème", emoji: "🎨", color: "#a855f7", dispo: true },
  { slug: "4eme", label: "4ème", emoji: "🕵️", color: "#f59e0b", dispo: false },
  { slug: "3eme", label: "3ème", emoji: "🏆", color: "#ff6b6b", dispo: false },
];

export default function AtelierIAPage() {
  return (
    <div className="cours-page">
      <div className="cours-header">
        <Link
          href="/"
          className="cours-back"
          style={{ textDecoration: "none" }}
        >
          ← Retour
        </Link>
        <div className="cours-breadcrumb">
          <span className="breadcrumb-active">Atelier IA</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🤖</div>
        <h1 className="cours-hero-title">Atelier IA</h1>
        <p className="cours-hero-desc">
          Découvre l&apos;intelligence artificielle, level par level !
        </p>
      </div>

      <div className="themes-grid">
        {niveaux.map((n) =>
          n.dispo ? (
            <Link
              key={n.slug}
              href={`/atelier-ia/${n.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="theme-card"
                style={
                  {
                    "--card-color": n.color,
                    position: "relative",
                    cursor: "pointer",
                    border: "2px solid rgba(255,255,255,0.06)",
                  } as React.CSSProperties
                }
              >
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "rgba(168,85,247,0.2)",
                    border: "1px solid rgba(168,85,247,0.4)",
                    borderRadius: 20,
                    padding: "2px 8px",
                    fontSize: "0.65rem",
                    color: "#d8b4fe",
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}
                >
                  NOUVEAU
                </div>
                <div className="theme-emoji">{n.emoji}</div>
                <div className="theme-label">{n.label}</div>
                <div className="theme-desc">
                  3 modules pour découvrir l&apos;IA
                </div>
                <div className="theme-arrow" style={{ color: n.color }}>
                  Commencer →
                </div>
              </div>
            </Link>
          ) : (
            <div
              key={n.slug}
              className="theme-card"
              style={
                {
                  "--card-color": "#888",
                  position: "relative",
                  opacity: 0.5,
                  cursor: "not-allowed",
                  border: "2px solid rgba(255,255,255,0.06)",
                } as React.CSSProperties
              }
            >
              <div className="theme-emoji">{n.emoji}</div>
              <div className="theme-label">{n.label}</div>
              <div className="theme-desc">
                3 modules pour découvrir l&apos;IA
              </div>
              <div className="theme-arrow" style={{ color: "#888" }}>
                🔒 Bientôt
              </div>
            </div>
          ),
        )}
      </div>

      <p
        style={{
          textAlign: "center",
          color: "#aaa",
          marginTop: 32,
          fontSize: "0.85rem",
        }}
      >
        Accès libre · Pas de connexion requise
      </p>
    </div>
  );
}
