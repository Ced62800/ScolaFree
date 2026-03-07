"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("prenom, role")
          .eq("id", user.id)
          .single();
        if (profile) {
          setPrenom(profile.prenom);
          setRole(profile.role);
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
    router.refresh();
  };

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
        <a href="/cours/francais/primaire" onClick={() => setMenuOpen(false)}>
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
            <a href="/cours/francais/primaire" className="btn-secondary">
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
          © 2025 ScolaFree — Tous droits réservés
        </div>
      </footer>
    </>
  );
}
