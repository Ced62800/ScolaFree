"use client";

import { useRouter } from "next/navigation";

const LOGO_URL =
  "https://akdvjkvdaggjpbfgscko.supabase.co/storage/v1/object/public/assets/Logo%20ScolaFree.png";
const SCOLOU_URL =
  "https://akdvjkvdaggjpbfgscko.supabase.co/storage/v1/object/public/assets/Logo-Robot-sans_fond.png";

export default function AProposPage() {
  const router = useRouter();

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button className="cours-back" onClick={() => router.push("/")}>
          ← Retour
        </button>
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "24px 16px 60px",
        }}
      >
        {/* Logo + titre */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <img
            src={LOGO_URL}
            alt="ScolaFree"
            style={{ width: "200px", marginBottom: "16px" }}
          />
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              color: "#fff",
              marginBottom: "8px",
            }}
          >
            À propos de ScolaFree
          </h1>
          <p style={{ color: "#888", fontSize: "1rem" }}>
            La plateforme éducative gratuite du CP à la 3ème
          </p>
        </div>

        {/* Présentation */}
        <section
          style={{
            marginBottom: "36px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#ffd166",
              marginBottom: "12px",
            }}
          >
            🎯 Notre mission
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            ScolaFree est une plateforme éducative{" "}
            <strong>100% gratuite</strong>, conçue pour aider les élèves du CP à
            la 3ème à apprendre, réviser et progresser dans les matières
            fondamentales : <strong>Français, Mathématiques et Anglais</strong>.
          </p>
          <p style={{ color: "#ccc", lineHeight: "1.8", marginTop: "12px" }}>
            Notre conviction : l'excellence scolaire doit être accessible à
            tous, sans abonnement, sans publicité, sans barrière financière.
          </p>
        </section>

        {/* Fonctionnement */}
        <section
          style={{
            marginBottom: "36px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#4f8ef7",
              marginBottom: "16px",
            }}
          >
            ⚙️ Comment ça fonctionne ?
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {[
              {
                emoji: "1️⃣",
                titre: "Inscription gratuite",
                desc: "Crée ton compte en 30 secondes avec ton prénom, nom, email et ta classe. Aucune carte bancaire requise.",
              },
              {
                emoji: "2️⃣",
                titre: "Choisis ta matière",
                desc: "Accède aux cours de Français, Maths et Anglais adaptés à ton niveau scolaire, du CP à la 3ème.",
              },
              {
                emoji: "3️⃣",
                titre: "Apprends avec les fiches",
                desc: "Chaque exercice est accompagné d'une fiche pédagogique avec la règle, un exemple, le piège à éviter et une astuce.",
              },
              {
                emoji: "4️⃣",
                titre: "Valide avec les bilans",
                desc: "Des bilans de 20 questions couvrent tous les thèmes de chaque matière. Obtiens 16/20 pour valider ta classe !",
              },
              {
                emoji: "5️⃣",
                titre: "Suis tes progrès",
                desc: "Consulte tes scores, ta moyenne générale et tes badges de progression depuis ton profil personnel.",
              },
            ].map((step) => (
              <div
                key={step.titre}
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ fontSize: "1.5rem", minWidth: "36px" }}>
                  {step.emoji}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: "4px",
                    }}
                  >
                    {step.titre}
                  </div>
                  <div
                    style={{
                      color: "#aaa",
                      fontSize: "0.9rem",
                      lineHeight: "1.6",
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Niveaux */}
        <section
          style={{
            marginBottom: "36px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#2ec4b6",
              marginBottom: "16px",
            }}
          >
            📚 Niveaux disponibles
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {[
              {
                label: "École Primaire",
                classes: "CP · CE1 · CE2 · CM1 · CM2",
                emoji: "🏫",
                color: "#4f8ef7",
              },
              {
                label: "Collège",
                classes: "6ème · 5ème · 4ème · 3ème",
                emoji: "🎒",
                color: "#2ec4b6",
              },
            ].map((n) => (
              <div
                key={n.label}
                style={{
                  background: `${n.color}15`,
                  border: `1px solid ${n.color}44`,
                  borderRadius: "12px",
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                  {n.emoji}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: n.color,
                    marginBottom: "4px",
                  }}
                >
                  {n.label}
                </div>
                <div style={{ color: "#aaa", fontSize: "0.85rem" }}>
                  {n.classes}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fondamentaux */}
        <section
          style={{
            marginBottom: "36px",
            background: "rgba(79,142,247,0.06)",
            border: "1px solid rgba(79,142,247,0.2)",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#4f8ef7",
              marginBottom: "12px",
            }}
          >
            📝 Les Fondamentaux
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            Les Fondamentaux sont des exercices ciblés sur les règles
            essentielles de <strong>Français</strong> et de{" "}
            <strong>Mathématiques</strong> : homophones, conjugaison, calcul
            mental, géométrie...
          </p>
          <p style={{ color: "#ccc", lineHeight: "1.8", marginTop: "12px" }}>
            En <strong>mode découverte</strong> (sans inscription) : 3 questions
            gratuites par exercice.
            <br />
            Avec un <strong>compte gratuit</strong> : accès à 10 questions par
            exercice et sauvegarde de tes scores.
          </p>
        </section>

        {/* Atelier IA */}
        <section
          style={{
            marginBottom: "36px",
            background: "rgba(168,85,247,0.06)",
            border: "1px solid rgba(168,85,247,0.2)",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#a855f7",
              marginBottom: "12px",
            }}
          >
            🤖 Atelier IA
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            L'Atelier IA est une section ludique et éducative pour découvrir
            l'intelligence artificielle, disponible du{" "}
            <strong>CM2 à la 3ème</strong>. Chaque niveau propose 3 modules
            adaptés à l'âge : explications, exemples concrets et une mission
            pratique avec de vraies IA.
          </p>
          <p style={{ color: "#ccc", lineHeight: "1.8", marginTop: "12px" }}>
            <strong>Accès entièrement libre</strong> — aucune inscription
            requise.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "16px",
            }}
          >
            {[
              { label: "CM2 — Ma première conversation", color: "#22c55e" },
              { label: "6ème — Piège l'IA", color: "#4f8ef7" },
              { label: "5ème — Génère l'incroyable", color: "#a855f7" },
              { label: "4ème — Détective de biais", color: "#f59e0b" },
              { label: "3ème — Le défi du prompt parfait", color: "#ff6b6b" },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  background: `${m.color}18`,
                  border: `1px solid ${m.color}44`,
                  borderRadius: "20px",
                  padding: "4px 14px",
                  fontSize: "0.8rem",
                  color: m.color,
                  fontWeight: 600,
                }}
              >
                {m.label}
              </div>
            ))}
          </div>
        </section>

        {/* Scolou */}
        <section
          style={{
            marginBottom: "36px",
            background: "rgba(255,209,102,0.06)",
            border: "1px solid rgba(255,209,102,0.2)",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            <img
              src={SCOLOU_URL}
              alt="Scolou"
              style={{
                width: "90px",
                height: "90px",
                objectFit: "contain",
                filter: "drop-shadow(0 0 12px rgba(255,209,102,0.4))",
              }}
            />
            <h2
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "#ffd166",
                margin: 0,
              }}
            >
              Scolou, ton assistant IA
            </h2>
          </div>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            Scolou est l'assistant pédagogique intégré à ScolaFree. Disponible
            sur chaque page de cours via le bouton{" "}
            <img
              src={SCOLOU_URL}
              alt="Scolou"
              style={{
                width: "24px",
                verticalAlign: "middle",
                marginLeft: "4px",
                marginRight: "4px",
              }}
            />
            , il répond à tes questions sur les leçons en cours, t'explique les
            règles et t'aide à comprendre les exercices. Il s'adapte
            automatiquement à ton niveau de classe.
          </p>
        </section>

        {/* Créateur */}
        <section
          style={{
            marginBottom: "36px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#ff6b6b",
              marginBottom: "12px",
            }}
          >
            👨‍💻 Créé par
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            ScolaFree est un projet indépendant créé et développé par{" "}
            <strong>Cédric Desgardin</strong>, développeur amateur passionné par
            l'éducation et l'accessibilité numérique.
            <br />
            <br />
            Pour toute question ou suggestion :<br />
            <a href="mailto:scolafree@orange.fr" style={{ color: "#ff6b6b" }}>
              scolafree@orange.fr
            </a>
          </p>
        </section>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button
            onClick={() => router.push("/inscription")}
            style={{
              background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              padding: "14px 32px",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Commencer gratuitement →
          </button>
        </div>
      </div>
    </div>
  );
}
