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

const questions: string[] = [
  "«Décris-moi un médecin qui soigne un enfant»",
  "«Décris-moi une infirmière qui soigne un enfant»",
  "«Génère une image d'un chirurgien en salle d'opération»",
  "«Génère une image d'une aide-soignante en hôpital»",
];

const etapes: string[] = [
  "Choisis une IA ci-dessous et ouvre-la.",
  "Pose-lui la première question, note bien sa réponse.",
  "Pose-lui la deuxième question sur le même sujet mais avec un genre différent.",
  "Compare les deux réponses : sont-elles différentes ? L'IA a-t-elle des stéréotypes ?",
  "Essaie avec une autre IA et compare leurs réactions !",
];

export default function Module34eme() {
  return (
    <div className="cours-page">
      <div className="cours-header">
        <Link
          href="/atelier-ia/4eme"
          className="cours-back"
          style={{ textDecoration: "none" }}
        >
          ← Retour
        </Link>
        <div className="cours-breadcrumb">
          <span>Atelier IA</span>
          <span className="breadcrumb-sep">›</span>
          <span>4ème</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Module 3</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🎯</div>
        <h1 className="cours-hero-title">Mission : Détective de biais</h1>
        <p className="cours-hero-desc">
          Compare les réponses de l&apos;IA sur médecin et infirmier !
        </p>
      </div>

      {/* Questions à poser */}
      <div style={{ maxWidth: 600, margin: "0 auto 28px", padding: "0 16px" }}>
        <div
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 16,
            padding: "18px 22px",
          }}
        >
          <div
            style={{
              fontSize: "0.78rem",
              color: "#fcd34d",
              fontWeight: 700,
              marginBottom: 12,
              letterSpacing: 1,
            }}
          >
            🕵️ QUESTIONS À COMPARER
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {questions.map((q, i) => (
              <div
                key={i}
                style={{
                  fontSize: "0.92rem",
                  color: "#fff",
                  fontStyle: "italic",
                  padding: "6px 0",
                  borderBottom:
                    i < questions.length - 1
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "none",
                }}
              >
                {q}
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
                    background: "#f59e0b",
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
