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

const etapes: string[] = [
  "Clique sur l'IA de ton choix ci-dessous.",
  "Tape dans la zone de texte : « Raconte-moi une blague sur les animaux »",
  "Appuie sur Entrée et lis la réponse !",
  "Essaie une deuxième IA et compare les blagues 😄",
];

export default function Module3CM2() {
  return (
    <div className="cours-page">
      <div className="cours-header">
        <Link
          href="/atelier-ia/cm2"
          className="cours-back"
          style={{ textDecoration: "none" }}
        >
          ← Retour
        </Link>
        <div className="cours-breadcrumb">
          <span>Atelier IA</span>
          <span className="breadcrumb-sep">›</span>
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Module 3</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🚀</div>
        <h1 className="cours-hero-title">Ma première conversation</h1>
        <p className="cours-hero-desc">
          Demande à une vraie IA de te raconter une blague sur les animaux !
        </p>
      </div>

      {/* Phrase à envoyer */}
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto 28px",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.35)",
            borderRadius: 16,
            padding: "18px 22px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.78rem",
              color: "#fcd34d",
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: 1,
            }}
          >
            TA PHRASE À ENVOYER
          </div>
          <div
            style={{ fontSize: "1.05rem", color: "#fff", fontStyle: "italic" }}
          >
            « Raconte-moi une blague sur les animaux »
          </div>
        </div>
      </div>

      {/* Les 4 IA */}
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto 28px",
          padding: "0 16px",
        }}
      >
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
                    background: "#6366f1",
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
