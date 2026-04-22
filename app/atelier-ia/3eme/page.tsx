import Link from "next/link";

const modules = [
  {
    num: 1,
    slug: "module-1",
    label: "L'art du prompt",
    emoji: "✍️",
    color: "#ff6b6b",
    desc: "Découvre pourquoi la façon dont tu parles à l'IA change tout.",
  },
  {
    num: 2,
    slug: "module-2",
    label: "Roméo et Juliette vu par l'IA",
    emoji: "🎭",
    color: "#f59e0b",
    desc: "Des exemples de résumés très différents selon le prompt.",
  },
  {
    num: 3,
    slug: "module-3",
    label: "Mission : Le défi du prompt parfait",
    emoji: "🏆",
    color: "#22c55e",
    desc: "À toi de trouver le meilleur prompt pour résumer Roméo et Juliette !",
  },
];

export default function AtelierIA3emePage() {
  return (
    <div className="cours-page">
      <div className="cours-header">
        <Link
          href="/atelier-ia/3eme"
          className="cours-back"
          style={{ textDecoration: "none" }}
        >
          ← Retour
        </Link>
        <div className="cours-breadcrumb">
          <span>Atelier IA</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">3ème</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🏆</div>
        <h1 className="cours-hero-title">Atelier IA — 3ème</h1>
        <p className="cours-hero-desc">
          3 modules pour maîtriser l&apos;art du prompt !
        </p>
      </div>

      <div className="themes-grid">
        {modules.map((m) => (
          <Link
            key={m.slug}
            href={`/atelier-ia/3eme/${m.slug}`}
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
