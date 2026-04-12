"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LOGO_URL =
  "https://akdvjkvdaggjpbfgscko.supabase.co/storage/v1/object/public/assets/Logo%20ScolaFree.png";

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

type MoyenneMatiere = { moyenne: number; nbBilans: number } | null;
type ClasseBilans = Record<string, MoyenneMatiere>;

export default function Home() {
  const [prenom, setPrenom] = useState("");
  const [estConnecte, setEstConnecte] = useState(false);
  const [classeEleve, setClasseEleve] = useState<string | null>(null);
  const [bilans, setBilans] = useState<ClasseBilans>({});
  const [chargement, setChargement] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEstConnecte(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("prenom, classe")
          .eq("id", user.id)
          .single();

        if (profile) {
          setPrenom(profile.prenom);
          setClasseEleve(profile.classe);

          if (profile.classe) {
            const { data: bilanData } = await supabase
              .from("scores")
              .select("matiere, theme, score, total")
              .eq("user_id", user.id)
              .eq("classe", profile.classe)
              .or("theme.eq.bilan,theme.eq.bilan-2")
              .order("score", { ascending: false });

            if (bilanData && bilanData.length > 0) {
              const parMatiere: Record<string, Record<string, number>> = {};
              for (const b of bilanData) {
                if (!parMatiere[b.matiere]) parMatiere[b.matiere] = {};
                if (!(b.theme in parMatiere[b.matiere])) {
                  parMatiere[b.matiere][b.theme] = (b.score / b.total) * 20;
                }
              }
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
            }
          }
        }
      }
      setChargement(false);
    };
    getUser();
  }, []);

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
            <img
              src={LOGO_URL}
              alt="ScolaFree"
              style={{
                width: "80%",
                maxWidth: "400px",
                height: "auto",
                marginTop: "15px",
                marginBottom: "20px",
              }}
            />
          </div>
          <h1>
            L&apos;excellence scolaire,
            <br />
            <em style={{ color: "#00b4c8" }}>accessible à tous</em>
          </h1>
          <p className="desc">
            Une plateforme éducative complète pour{" "}
            <strong>apprendre, réviser et progresser</strong> en Français,
            Mathématiques et Anglais — du Primaire au Collège.
          </p>
          <div className="tags">
            <span className="tag tag-blue">📖 Français</span>
            <span className="tag tag-coral">➕ Mathématiques</span>
            <span className="tag tag-yellow">
              <img
                src="https://flagcdn.com/w40/gb.png"
                alt="UK"
                style={{
                  width: "16px",
                  verticalAlign: "middle",
                  borderRadius: "2px",
                  marginRight: "4px",
                }}
              />
              Anglais
            </span>
          </div>

          {/* CTA selon l'état de connexion */}
          {!chargement && (
            <div className="cta-row">
              {estConnecte ? (
                <a
                  href="/cours"
                  className="btn-primary"
                  style={{ background: "#00b4c8" }}
                >
                  Commencer →
                </a>
              ) : (
                <>
                  <a
                    href="/inscription"
                    className="btn-primary"
                    style={{ background: "#00b4c8" }}
                  >
                    Inscription →
                  </a>
                  <a href="/cours" className="btn-secondary">
                    Découvrir les cours
                  </a>
                </>
              )}
            </div>
          )}
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
                  <div style={{ fontSize: "0.75rem", color: "#2ec4b6" }}>
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
                    ? "#00b4c8"
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
                        ? "rgba(0,180,200,0.08)"
                        : "rgba(255,255,255,0.03)",
                      border: bilan
                        ? "1px solid rgba(0,180,200,0.25)"
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
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <a
              href="/profil"
              style={{
                color: "#00b4c8",
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              📊 Voir mes graphiques et badges détaillés →
            </a>
          </div>
        </section>
      )}

      <footer>
        <div className="footer-logo">
          <img
            src={LOGO_URL}
            alt="ScolaFree"
            style={{
              width: "100px",
              height: "20px",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
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
