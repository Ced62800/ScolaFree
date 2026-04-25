"use client";

import { useRouter } from "next/navigation";

export default function MentionsLegalesPage() {
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
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            marginBottom: "8px",
            color: "#fff",
          }}
        >
          Mentions légales
        </h1>
        <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "40px" }}>
          Dernière mise à jour : avril 2026
        </p>

        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#4f8ef7",
              marginBottom: "12px",
            }}
          >
            1. Éditeur du site
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            Le site ScolaFree (accessible à l'adresse{" "}
            <strong>scolafree.vercel.app</strong>) est édité par :<br />
            <br />
            <strong>Desgardin Cédric</strong>
            <br />
            Particulier — France
            <br />
            Email :{" "}
            <a href="mailto:scolafree@orange.fr" style={{ color: "#4f8ef7" }}>
              scolafree@orange.fr
            </a>
          </p>
        </section>

        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#4f8ef7",
              marginBottom: "12px",
            }}
          >
            2. Hébergement
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            Le site est hébergé par :<br />
            <br />
            <strong>Vercel Inc.</strong>
            <br />
            440 N Barranca Ave #4133
            <br />
            Covina, CA 91723 — États-Unis
            <br />
            Site web :{" "}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4f8ef7" }}
            >
              vercel.com
            </a>
          </p>
        </section>

        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#4f8ef7",
              marginBottom: "12px",
            }}
          >
            3. Propriété intellectuelle
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            L'ensemble du contenu du site ScolaFree (textes, exercices,
            questions, design, logo) est la propriété exclusive de Desgardin
            Cédric, sauf mention contraire. Toute reproduction, distribution ou
            utilisation sans autorisation préalable est strictement interdite.
          </p>
        </section>

        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#4f8ef7",
              marginBottom: "12px",
            }}
          >
            4. Données personnelles
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            Les données collectées lors de l'inscription (prénom, nom, adresse
            e-mail, classe) sont utilisées uniquement pour le fonctionnement de
            la plateforme. Elles ne sont pas cédées à des tiers. Pour en savoir
            plus, consultez notre{" "}
            <a href="/politique-confidentialite" style={{ color: "#4f8ef7" }}>
              Politique de confidentialité
            </a>
            .
          </p>
        </section>

        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#4f8ef7",
              marginBottom: "12px",
            }}
          >
            5. Responsabilité
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            ScolaFree est une plateforme éducative gratuite. L'éditeur s'efforce
            de fournir des contenus pédagogiques de qualité, alignés sur les
            programmes de l'Éducation nationale française. Cependant, aucune
            garantie de résultats scolaires n'est offerte. L'éditeur ne saurait
            être tenu responsable d'éventuelles erreurs dans les contenus.
          </p>
        </section>

        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#4f8ef7",
              marginBottom: "12px",
            }}
          >
            6. Contact
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            Pour toute question relative au site, vous pouvez contacter
            l'éditeur à l'adresse suivante :<br />
            <a href="mailto:scolafree@orange.fr" style={{ color: "#4f8ef7" }}>
              scolafree@orange.fr
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
