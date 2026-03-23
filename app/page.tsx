"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CLASSES_CONFIG: Record<
  string,
  { label: string; matieres: { key: string; label: string; emoji: any }[] }
> = {
  cp: {
    label: "CP",
    matieres: [
      { key: "francais", label: "Français", emoji: "📖" },
      { key: "maths", label: "Maths", emoji: "🔢" },
    ],
  },
  ce1: {
    label: "CE1",
    matieres: [
      { key: "francais", label: "Français", emoji: "📖" },
      { key: "maths", label: "Maths", emoji: "🔢" },
      {
        key: "anglais",
        label: "Anglais",
        emoji: (
          <img
            src="https://flagcdn.com/w40/gb.png"
            alt="UK"
            style={{
              width: "20px",
              verticalAlign: "middle",
              borderRadius: "2px",
            }}
          />
        ),
      },
    ],
  },
  ce2: {
    label: "CE2",
    matieres: [
      { key: "francais", label: "Français", emoji: "📖" },
      { key: "maths", label: "Maths", emoji: "🔢" },
      {
        key: "anglais",
        label: "Anglais",
        emoji: (
          <img
            src="https://flagcdn.com/w40/gb.png"
            alt="UK"
            style={{
              width: "20px",
              verticalAlign: "middle",
              borderRadius: "2px",
            }}
          />
        ),
      },
    ],
  },
  cm1: {
    label: "CM1",
    matieres: [
      { key: "francais", label: "Français", emoji: "📖" },
      { key: "maths", label: "Maths", emoji: "🔢" },
      {
        key: "anglais",
        label: "Anglais",
        emoji: (
          <img
            src="https://flagcdn.com/w40/gb.png"
            alt="UK"
            style={{
              width: "20px",
              verticalAlign: "middle",
              borderRadius: "2px",
            }}
          />
        ),
      },
    ],
  },
  cm2: {
    label: "CM2",
    matieres: [
      { key: "francais", label: "Français", emoji: "📖" },
      { key: "maths", label: "Maths", emoji: "🔢" },
      {
        key: "anglais",
        label: "Anglais",
        emoji: (
          <img
            src="https://flagcdn.com/w40/gb.png"
            alt="UK"
            style={{
              width: "20px",
              verticalAlign: "middle",
              borderRadius: "2px",
            }}
          />
        ),
      },
    ],
  },
};

// Score moyen par matière (sur 20), calculé sur tous les bilans effectués
type MoyenneMatiere = { moyenne: number; nbBilans: number } | null;
type ClasseBilans = Record<string, MoyenneMatiere>;

export default function Home() {
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [classeEleve, setClasseEleve] = useState<string | null>(null);
  const [bilans, setBilans] = useState<ClasseBilans>({});
  const [nbBadges, setNbBadges] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("prenom, role, classe")
          .eq("id", user.id)
          .single();

        if (profile) {
          setPrenom(profile.prenom);
          setRole(profile.role);
          setClasseEleve(profile.classe);

          if (profile.classe) {
            // Récupère TOUS les bilans (bilan + bilan-2) de la classe
            const { data: bilanData } = await supabase
              .from("scores")
              .select("matiere, theme, score, total")
              .eq("user_id", user.id)
              .eq("classe", profile.classe)
              .or("theme.eq.bilan,theme.eq.bilan-2")
              .order("score", { ascending: false }); // meilleur score en premier

            if (bilanData && bilanData.length > 0) {
              // Pour chaque matière, on prend le meilleur score de chaque bilan
              // puis on fait la moyenne
              const parMatiere: Record<string, Record<string, number>> = {};

              for (const b of bilanData) {
                if (!parMatiere[b.matiere]) parMatiere[b.matiere] = {};
                // On garde uniquement le meilleur score par theme (bilan ou bilan-2)
                if (!(b.theme in parMatiere[b.matiere])) {
                  parMatiere[b.matiere][b.theme] = (b.score / b.total) * 20;
                }
              }

              // Calcule la moyenne par matière
              const result: ClasseBilans = {};
              for (const [matiere, themes] of Object.entries(parMatiere)) {
                const scores = Object.values(themes);
                const moyenne =
                  scores.reduce((acc, s) => acc + s, 0) / scores.length;
                result[matiere] = {
                  moyenne: Math.round(moyenne * 10) / 10,
                  nbBilans: scores.length,
                };
              }
              setBilans(result);
              setNbBadges(bilanData.length >= 1 ? 1 : 0);
            }
          }
        }
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPrenom("");
    setRole("");
    setMenuOpen(false);
    setClasseEleve(null);
    setBilans({});
    router.refresh();
  };

  const getMoyenneGenerale = (): number | null => {
    if (!classeEleve) return null;
    const config = CLASSES_CONFIG[classeEleve];
    if (!config) return null;
    const scores = config.matieres
      .map((m) => bilans[m.key]?.moyenne)
      .filter((s): s is number => s !== undefined && s !== null);
    if (scores.length === 0) return null;
    return scores.reduce((acc, s) => acc + s, 0) / scores.length;
  };

  const moyenneGenerale = getMoyenneGenerale();
  const config = classeEleve ? CLASSES_CONFIG[classeEleve] : null;
  const aBilans = config && Object.keys(bilans).length > 0;

  return (
    <>
      <nav>
        <div className="nav-logo">
          🎓 Scola<span>Free</span>
        </div>
        <div className="nav-links">
          <a href="#">Matières</a>
          <a href="#">Niveaux</a>
          <a href="#">À propos</a>
          {!prenom && (
            <a href="/connexion" className="nav-connexion">
              Connexion
            </a>
          )}
          {prenom && (
            <>
              <span
                style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}
              >
                👋 {prenom}
              </span>
              {role === "admin" && (
                <a href="/admin" className="admin-btn-link">
                  ⚙️ Admin
                </a>
              )}
              <a
                href="/profil"
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                👤 Mon profil{" "}
                {nbBadges > 0 &&
                  `🏅 ${nbBadges} badge${nbBadges > 1 ? "s" : ""} gagné${nbBadges > 1 ? "s" : ""} !`}
              </a>
              <button className="logout-btn-link" onClick={handleLogout}>
                🚪 Déconnexion
              </button>
            </>
          )}
        </div>
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      <div className={`mobile-menu${menuOpen ? " mobile-menu-open" : ""}`}>
        <a href="#" onClick={() => setMenuOpen(false)}>
          Matières
        </a>
        <a href="#" onClick={() => setMenuOpen(false)}>
          Niveaux
        </a>
        <a href="#" onClick={() => setMenuOpen(false)}>
          À propos
        </a>
        <a href="/cours/primaire" onClick={() => setMenuOpen(false)}>
          Découvrir les cours
        </a>
        {!prenom && (
          <a href="/connexion" className="mobile-menu-connexion">
            Connexion
          </a>
        )}
        {prenom && (
          <>
            <span className="mobile-menu-user">👋 Bonjour {prenom} !</span>
            {role === "admin" && (
              <a
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="mobile-menu-admin"
              >
                ⚙️ Admin
              </a>
            )}
            <button onClick={handleLogout} className="mobile-menu-logout">
              🚪 Déconnexion
              <a href="/profil">👤 Mon profil</a>
            </button>
          </>
        )}
      </div>

      <section className="hero">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="badge-dot"></span> 100% gratuit · Aucune carte
            requise
          </div>
          <div className="logo-row">
            <span className="cap-emoji">🎓</span>
            <div className="logo-text">
              <span className="scola">Scola</span>
              <span className="free">Free</span>
            </div>
          </div>
          <h1>
            L&apos;excellence scolaire,
            <br />
            <em>accessible à tous</em>
          </h1>
          <p className="desc">
            Une plateforme éducative complète pour{" "}
            <strong>apprendre, réviser et progresser</strong> en Français,
            Mathématiques et Anglais — du Primaire au Lycée.
          </p>
          <div className="tags">
            <span className="tag tag-blue">📖 Français</span>
            <span className="tag tag-coral">➕ Mathématiques</span>
            <span className="tag tag-yellow">🌍 Anglais</span>
          </div>
          <div className="cta-row">
            <a href="/inscription" className="btn-primary">
              Inscription →
            </a>
            <a href="/cours" className="btn-secondary">
              Découvrir les cours
            </a>
          </div>
        </div>
        <div className="stats">
          <div className="stat-item">
            <div className="stat-num">
              3<span>+</span>
            </div>
            <div className="stat-label">Matières enseignées</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">
              3<span>+</span>
            </div>
            <div className="stat-label">Niveaux disponibles</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">
              100<span>%</span>
            </div>
            <div className="stat-label">Gratuit, pour toujours</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">
              0<span>€</span>
            </div>
            <div className="stat-label">Aucun abonnement</div>
          </div>
        </div>
      </section>

      {prenom && config && aBilans && (
        <section
          style={{
            maxWidth: "800px",
            margin: "0 auto 60px",
            padding: "0 16px",
          }}
        >
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              marginBottom: "20px",
              color: "#fff",
            }}
          >
            📊 Mes progrès
          </h2>
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{ fontWeight: 700, fontSize: "1.1rem", color: "#fff" }}
              >
                🎓 {config.label}
              </div>
              {moyenneGenerale !== null && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.75rem", color: "#aaa" }}>
                    Moyenne générale
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#ffd166",
                    }}
                  >
                    {moyenneGenerale.toFixed(1).replace(".", ",")} / 20
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {config.matieres.map((matiere) => {
                const bilan = bilans[matiere.key];
                const scoreColor = bilan
                  ? bilan.moyenne >= 14
                    ? "#2ec4b6"
                    : bilan.moyenne >= 10
                      ? "#ffd166"
                      : "#ff6b6b"
                  : "#555";
                return (
                  <div
                    key={matiere.key}
                    style={{
                      flex: "1 1 120px",
                      background: bilan
                        ? "rgba(79,142,247,0.08)"
                        : "rgba(255,255,255,0.03)",
                      border: bilan
                        ? "1px solid rgba(79,142,247,0.25)"
                        : "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "12px",
                      padding: "12px 14px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#aaa",
                        marginBottom: "6px",
                      }}
                    >
                      {matiere.emoji} {matiere.label}
                    </div>
                    {bilan ? (
                      <>
                        <div
                          style={{
                            fontSize: "1.4rem",
                            fontWeight: 800,
                            color: scoreColor,
                          }}
                        >
                          {bilan.moyenne.toFixed(1).replace(".", ",")} / 20
                        </div>
                        {bilan.nbBilans > 1 && (
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "#888",
                              marginTop: "4px",
                            }}
                          >
                            moy. de {bilan.nbBilans} bilans
                          </div>
                        )}
                      </>
                    ) : (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#555",
                          fontStyle: "italic",
                        }}
                      >
                        — / 20
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
      <footer>
        <div className="footer-logo">
          🎓 Scola<span>Free</span>
        </div>
        <div className="footer-links">
          <a href="#">Mentions légales</a>
          <a href="#">Politique de confidentialité</a>
          <a href="#">Contact</a>
        </div>
        <div className="footer-copy">
          © 2026 ScolaFree — Tous droits réservés
        </div>
      </footer>
    </>
  );
}
