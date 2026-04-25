import Link from "next/link";

interface IATool {
  nom: string;
  par: string;
  couleur: string;
  emoji: string;
  url: string;
}

const iaOutils: IATool[] = [
  {
    nom: "Le Chat",
    par: "Mistral · Français",
    couleur: "#ea580c",
    emoji: "💬",
    url: "https://chat.mistral.ai",
  },
  {
    nom: "Claude",
    par: "Anthropic",
    couleur: "#7c3aed",
    emoji: "🤖",
    url: "https://claude.ai",
  },
  {
    nom: "ChatGPT",
    par: "OpenAI",
    couleur: "#16a34a",
    emoji: "💡",
    url: "https://chatgpt.com",
  },
  {
    nom: "Gemini",
    par: "Google",
    couleur: "#2563eb",
    emoji: "✦",
    url: "https://gemini.google.com",
  },
];

const exemples: string[] = [
  "«Un éléphant en tutu rose qui fait du ski sur un volcan»",
  "«Une bibliothèque sous-marine avec des pieuvres qui lisent»",
  "«Un dragon qui mange une pizza dans le métro parisien»",
  "«Un astronaute qui jardine sur Saturne avec un arrosoir»",
  "«Un château médiéval fait entièrement de fromage»",
];

const etapes: string[] = [
  "Choisis une IA ci-dessous et ouvre-la.",
  "Décris-lui une image impossible en détail — sois précis sur le style, les couleurs, l'ambiance !",
  "Lis ou regarde ce qu'elle génère (texte ou image selon l'IA).",
  "Essaie avec une description encore plus folle et compare les résultats !",
];

export default function Module35eme() {
  return (
    <div className="cours-page">
      <div className="cours-header">
        <Link
          href="/atelier-ia/5eme"
          className="cours-back"
          style={{ textDecoration: "none" }}
        >
          ← Retour
        </Link>
        <div className="cours-breadcrumb">
          <span>Atelier IA</span>
          <span className="breadcrumb-sep">›</span>
          <span>5ème</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Module 3</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🚀</div>
        <h1 className="cours-hero-title">Mission : Génère l&apos;incroyable</h1>
        <p className="cours-hero-desc">
          Décris une image impossible à une vraie IA !
        </p>
      </div>

      {/* Exemples de descriptions */}
      <div style={{ maxWidth: 600, margin: "0 auto 28px", padding: "0 16px" }}>
        <div
          style={{
            background: "rgba(168,85,247,0.08)",
            border: "1px solid rgba(168,85,247,0.3)",
            borderRadius: 16,
            padding: "18px 22px",
          }}
        >
          <div
            style={{
              fontSize: "0.78rem",
              color: "#d8b4fe",
              fontWeight: 700,
              marginBottom: 12,
              letterSpacing: 1,
            }}
          >
            🎨 DESCRIPTIONS IMPOSSIBLES À ESSAYER
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {exemples.map((ex, i) => (
              <div
                key={i}
                style={{
                  fontSize: "0.92rem",
                  color: "#fff",
                  fontStyle: "italic",
                  padding: "6px 0",
                  borderBottom:
                    i < exemples.length - 1
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "none",
                }}
              >
                {ex}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Les 4 IA */}
      <div style={{ maxWidth: 600, margin: "0 auto 28px", padding: "0 16px" }}>
        <div className="themes-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {iaOutils.map((ia) => (
            <a
              key={ia.nom}
              href={ia.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <div
                className="theme-card"
                style={
                  {
                    "--card-color": ia.couleur,
                    textAlign: "center",
                    padding: "20px 12px",
                  } as React.CSSProperties
                }
              >
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>
                  {ia.emoji}
                </div>
                <div className="theme-label" style={{ fontSize: "1rem" }}>
                  {ia.nom}
                </div>
                <div className="theme-desc" style={{ fontSize: "0.78rem" }}>
                  {ia.par}
                </div>
                <div className="theme-arrow" style={{ color: ia.couleur }}>
                  Ouvrir →
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Étapes */}
      <div style={{ maxWidth: 600, margin: "0 auto 40px", padding: "0 16px" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              fontSize: "0.78rem",
              color: "#aaa",
              fontWeight: 700,
              letterSpacing: 1,
              marginBottom: 16,
            }}
          >
            COMMENT FAIRE ?
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {etapes.map((etape, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "#a855f7",
                    color: "#fff",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {i + 1}
                </div>
                <div
                  style={{
                    fontSize: "0.92rem",
                    color: "#aaa",
                    lineHeight: 1.55,
                  }}
                >
                  {etape}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
