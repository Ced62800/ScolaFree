"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LOGO_URL =
  "https://akdvjkvdaggjpbfgscko.supabase.co/storage/v1/object/public/assets/Logo%20ScolaFree.png";

const BASE_AVATAR_URL =
  "https://akdvjkvdaggjpbfgscko.supabase.co/storage/v1/object/public/avatars/";

const AVATARS: Record<string, string> = {
  Alchimiste: "Alchimiste%20.png",
  Apprenti_Sorcier: "Apprenti%20Sorcier%20.png",
  Astronaute: "Astronaute.png",
  Cavalier_du_Savoir: "Cavalier%20du%20Savoir..jpg",
  Chevalier: "Chevalier.png",
  Clown_du_Savoir: "Clown%20du%20Savoir.jpg",
  Clown_Ssola: "Clown%20Ssola.jpg",
  Detective: "Detective.png",
  dragon: "dragon.png",
  Explorateur: "Explorateur.png",
  Gardien: "Gardien%20.png",
  Golem_de_Pierre: "Golem%20de%20Pierre.png",
  Mage_des_etoiles: "Mage%20des%20etoiles.png",
  Ninja: "Ninja.png",
  Pirate_du_Savoir: "Pirate%20du%20Savoir.jpg",
  Pompier_du_Savoir: "Pompier%20du%20Savoir.jpg",
  Robot_futuriste: "Robot%20futuriste.png",
  Samourai: "Samourai.png",
};

export default function Navbar() {
  const router = useRouter();
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [nbBadges, setNbBadges] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("prenom, role, classe, avatar")
          .eq("id", user.id)
          .single();

        if (profile) {
          setPrenom(profile.prenom);
          setRole(profile.role);
          setAvatar(profile.avatar ?? "");

          if (profile.classe) {
            const { data: bilanData } = await supabase
              .from("scores")
              .select("score, total")
              .eq("user_id", user.id)
              .eq("classe", profile.classe)
              .or("theme.eq.bilan,theme.eq.bilan-2");

            if (bilanData && bilanData.length > 0) {
              const moyenne =
                bilanData.reduce(
                  (acc, s) => acc + (s.score / s.total) * 20,
                  0,
                ) / bilanData.length;
              const nb = [
                bilanData.length >= 1,
                bilanData.length >= 5,
                bilanData.some((s) => s.score === s.total),
                bilanData.filter((s) => (s.score / s.total) * 20 >= 16)
                  .length >= 3,
                moyenne >= 18,
                false,
                false,
              ].filter(Boolean).length;
              setNbBadges(nb);
            }
          }
        }
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPrenom("");
    setRole("");
    setAvatar("");
    setMenuOpen(false);
    setNbBadges(0);
    router.push("/");
    router.refresh();
  };

  const avatarUrl =
    avatar && AVATARS[avatar] ? BASE_AVATAR_URL + AVATARS[avatar] : null;

  return (
    <>
      <nav>
        <div
          className="nav-logo"
          onClick={() => router.push("/")}
          style={{ cursor: "pointer" }}
        >
          <img
            src={LOGO_URL}
            alt="ScolaFree"
            style={{
              width: "200px",
              height: "40px",
              objectFit: "cover",
              objectPosition: "left center",
            }}
          />
        </div>
        <div className="nav-links">
          <a href="#">Matières</a>
          <a href="#">Niveaux</a>
          <a href="#">À propos</a>
          {!loading && !prenom && (
            <a href="/connexion" className="nav-connexion">
              Connexion
            </a>
          )}
          {!loading && prenom && (
            <>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid rgba(79,142,247,0.5)",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "1.2rem" }}>🎓</span>
                )}
                <span
                  style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}
                >
                  👋 {prenom}
                </span>
              </div>
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
                  `🏅 ${nbBadges} badge${nbBadges > 1 ? "s" : ""} !`}
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
        {!loading && !prenom && (
          <a href="/connexion" className="mobile-menu-connexion">
            Connexion
          </a>
        )}
        {!loading && prenom && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid rgba(79,142,247,0.5)",
                  }}
                />
              ) : (
                <span style={{ fontSize: "1.4rem" }}>🎓</span>
              )}
              <span className="mobile-menu-user">👋 Bonjour {prenom} !</span>
            </div>
            {role === "admin" && (
              <a
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="mobile-menu-admin"
              >
                ⚙️ Admin
              </a>
            )}
            <a
              href="/profil"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "14px 20px",
                color: "#fff",
                fontSize: "1rem",
                textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              👤 Mon profil{" "}
              {nbBadges > 0 &&
                `🏅 ${nbBadges} badge${nbBadges > 1 ? "s" : ""} !`}
            </a>
            <button onClick={handleLogout} className="mobile-menu-logout">
              🚪 Déconnexion
            </button>
          </>
        )}
      </div>
    </>
  );
}
