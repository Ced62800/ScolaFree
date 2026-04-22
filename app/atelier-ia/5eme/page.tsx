import Link from "next/link";

const modules = [
  {
    num: 1,
    slug: "module-1",
    label: "L'IA peut créer des images ?",
    emoji: "🎨",
    color: "#a855f7",
    desc: "Découvre comment l'IA génère des images à partir de mots.",
  },
  {
    num: 2,
    slug: "module-2",
    label: "Des images impossibles",
    emoji: "🌀",
    color: "#ec4899",
    desc: "Des exemples d'images que seule l'IA peut créer.",
  },
  {
    num: 3,
    slug: "module-3",
    label: "Mission : Génère l'incroyable",
    emoji: "🚀",
    color: "#f59e0b",
    desc: "À toi de jouer ! Décris une image impossible à une vraie IA.",
  },
];

export default function AtelierIA5emePage() {
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
          <span className="breadcrumb-active">5ème</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🎨</div>
        <h1 className="cours-hero-title">Atelier IA — 5ème</h1>
        <p className="cours-hero-desc">
          3 modules pour créer l&apos;incroyable avec l&apos;IA !
        </p>
      </div>

      <div className="themes-grid">
        {modules.map((m) => (
          <Link
            key={m.slug}
            href={`/atelier-ia/5eme/${m.slug}`}
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
