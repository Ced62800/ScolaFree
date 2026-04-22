import Link from "next/link";

const modules = [
  {
    num: 1,
    slug: "module-1",
    label: "C'est quoi un biais ?",
    emoji: "🕵️",
    color: "#f59e0b",
    desc: "Découvre comment les préjugés humains se glissent dans l'IA.",
  },
  {
    num: 2,
    slug: "module-2",
    label: "Des biais dans la vraie vie",
    emoji: "🔎",
    color: "#ef4444",
    desc: "Des exemples concrets de biais que l'IA reproduit sans le savoir.",
  },
  {
    num: 3,
    slug: "module-3",
    label: "Mission : Détective de biais",
    emoji: "🎯",
    color: "#8b5cf6",
    desc: "Compare les réponses de l'IA sur médecin et infirmier.",
  },
];

export default function AtelierIA4emePage() {
  return (
    <div className="cours-page">
      <div className="cours-header">
        <Link
          href="/atelier-ia"
          className="cours-back"
          style={{ textDecoration: "none" }}
        >
          ← Retour
        </Link>
        <div className="cours-breadcrumb">
          <span>Atelier IA</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">4ème</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🕵️</div>
        <h1 className="cours-hero-title">Atelier IA — 4ème</h1>
        <p className="cours-hero-desc">
          3 modules pour détecter les biais de l&apos;IA !
        </p>
      </div>

      <div className="themes-grid">
        {modules.map((m) => (
          <Link
            key={m.slug}
            href={`/atelier-ia/4eme/${m.slug}`}
            style={{ textDecoration: "none" }}
          >
            <div
              className="theme-card"
              style={
                {
                  "--card-color": m.color,
                  position: "relative",
                  border: "2px solid rgba(255,255,255,0.06)",
                  cursor: "pointer",
                } as React.CSSProperties
              }
            >
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#aaa",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "3px 12px",
                  borderRadius: "20px",
                  whiteSpace: "nowrap",
                }}
              >
                MODULE {m.num}
              </div>
              <div className="theme-emoji">{m.emoji}</div>
              <div className="theme-label">{m.label}</div>
              <div className="theme-desc">{m.desc}</div>
              <div
                className="theme-arrow"
                style={{ color: m.color, marginTop: 8 }}
              >
                Commencer →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
