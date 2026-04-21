import Link from "next/link";

const modules = [
  {
    num: 1,
    slug: "module-1",
    label: "C'est quoi l'IA ?",
    emoji: "🧠",
    color: "#6366f1",
    desc: "Comprends en 4 étapes ce qu'est une intelligence artificielle.",
  },
  {
    num: 2,
    slug: "module-2",
    label: "L'IA dans ta vie",
    emoji: "👀",
    color: "#22c55e",
    desc: "Tu utilises déjà l'IA sans le savoir ! Découvre comment.",
  },
  {
    num: 3,
    slug: "module-3",
    label: "Mission : Ma première conversation",
    emoji: "🚀",
    color: "#f59e0b",
    desc: "À toi de jouer ! Parle à une vraie IA et demande-lui une blague.",
  },
];

export default function AtelierIACM2Page() {
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
          <span className="breadcrumb-active">CM2</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🌱</div>
        <h1 className="cours-hero-title">Atelier IA — CM2</h1>
        <p className="cours-hero-desc">
          3 modules pour devenir un expert de l&apos;IA !
        </p>
      </div>

      <div className="themes-grid">
        {modules.map((m) => (
          <Link
            key={m.slug}
            href={`/atelier-ia/cm2/${m.slug}`}
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
