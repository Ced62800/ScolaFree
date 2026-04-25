"use client";

import { useRouter } from "next/navigation";

export default function PolitiqueConfidentialitePage() {
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
          Politique de confidentialité
        </h1>
        <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "40px" }}>
          Dernière mise à jour : avril 2026
        </p>

        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#2ec4b6",
              marginBottom: "12px",
            }}
          >
            1. Responsable du traitement
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            Le responsable du traitement des données personnelles est :<br />
            <br />
            <strong>Desgardin Cédric</strong> — Particulier
            <br />
            Email :{" "}
            <a href="mailto:scolafree@orange.fr" style={{ color: "#2ec4b6" }}>
              scolafree@orange.fr
            </a>
          </p>
        </section>

        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#2ec4b6",
              marginBottom: "12px",
            }}
          >
            2. Données collectées
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            Lors de l'inscription sur ScolaFree, nous collectons les
            informations suivantes :
          </p>
          <ul
            style={{
              color: "#ccc",
              lineHeight: "2",
              paddingLeft: "24px",
              marginTop: "8px",
            }}
          >
            <li>
              <strong>Prénom et nom</strong> — pour personnaliser l'expérience
            </li>
            <li>
              <strong>Adresse e-mail</strong> — pour la connexion et la
              réinitialisation du mot de passe
            </li>
            <li>
              <strong>Niveau et classe</strong> — pour adapter les contenus
              pédagogiques
            </li>
            <li>
              <strong>Scores et résultats</strong> — pour le suivi des progrès
            </li>
          </ul>
          <p style={{ color: "#ccc", lineHeight: "1.8", marginTop: "12px" }}>
            Aucune donnée bancaire n'est collectée. ScolaFree est entièrement
            gratuit.
          </p>
        </section>

        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#2ec4b6",
              marginBottom: "12px",
            }}
          >
            3. Finalité du traitement
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            Les données collectées sont utilisées exclusivement pour :
          </p>
          <ul
            style={{
              color: "#ccc",
              lineHeight: "2",
              paddingLeft: "24px",
              marginTop: "8px",
            }}
          >
            <li>Créer et gérer votre compte utilisateur</li>
            <li>Personnaliser les cours selon votre classe</li>
            <li>Sauvegarder et afficher vos scores et progrès</li>
            <li>Permettre la réinitialisation du mot de passe</li>
          </ul>
        </section>

        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#2ec4b6",
              marginBottom: "12px",
            }}
          >
            4. Conservation des données
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            Vos données sont conservées tant que votre compte est actif. Vous
            pouvez demander la suppression de votre compte et de toutes vos
            données à tout moment en contactant :<br />
            <a href="mailto:scolafree@orange.fr" style={{ color: "#2ec4b6" }}>
              scolafree@orange.fr
            </a>
          </p>
        </section>

        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#2ec4b6",
              marginBottom: "12px",
            }}
          >
            5. Partage des données
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            Vos données personnelles ne sont jamais vendues, louées ou cédées à
            des tiers à des fins commerciales. Elles sont partagées uniquement
            avec nos prestataires techniques nécessaires au fonctionnement du
            service :
          </p>
          <ul
            style={{
              color: "#ccc",
              lineHeight: "2",
              paddingLeft: "24px",
              marginTop: "8px",
            }}
          >
            <li>
              <strong>Supabase</strong> — base de données et authentification
              (serveurs en Europe)
            </li>
            <li>
              <strong>Vercel</strong> — hébergement du site
            </li>
            <li>
              <strong>Google Gemini</strong> — assistant Scolou (questions
              envoyées sans données personnelles identifiables)
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#2ec4b6",
              marginBottom: "12px",
            }}
          >
            6. Protection des mineurs
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            ScolaFree est destiné aux élèves du primaire et du collège (6 à 15
            ans). L'inscription d'un mineur doit être effectuée avec l'accord
            d'un parent ou tuteur légal. Aucune donnée sensible concernant les
            mineurs n'est collectée au-delà des informations strictement
            nécessaires au fonctionnement pédagogique.
          </p>
        </section>

        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#2ec4b6",
              marginBottom: "12px",
            }}
          >
            7. Vos droits (RGPD)
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            Conformément au Règlement Général sur la Protection des Données
            (RGPD), vous disposez des droits suivants :
          </p>
          <ul
            style={{
              color: "#ccc",
              lineHeight: "2",
              paddingLeft: "24px",
              marginTop: "8px",
            }}
          >
            <li>
              <strong>Droit d'accès</strong> — consulter vos données
            </li>
            <li>
              <strong>Droit de rectification</strong> — corriger vos données
            </li>
            <li>
              <strong>Droit à l'effacement</strong> — supprimer votre compte
            </li>
            <li>
              <strong>Droit à la portabilité</strong> — récupérer vos données
            </li>
            <li>
              <strong>Droit d'opposition</strong> — vous opposer au traitement
            </li>
          </ul>
          <p style={{ color: "#ccc", lineHeight: "1.8", marginTop: "12px" }}>
            Pour exercer ces droits, contactez-nous à :<br />
            <a href="mailto:scolafree@orange.fr" style={{ color: "#2ec4b6" }}>
              scolafree@orange.fr
            </a>
          </p>
        </section>

        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#2ec4b6",
              marginBottom: "12px",
            }}
          >
            8. Cookies
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            ScolaFree utilise uniquement des cookies techniques essentiels au
            fonctionnement de l'application (session de connexion). Aucun cookie
            publicitaire ou de tracking n'est utilisé. ScolaFree ne contient
            aucune publicité.
          </p>
        </section>

        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#2ec4b6",
              marginBottom: "12px",
            }}
          >
            9. Contact
          </h2>
          <p style={{ color: "#ccc", lineHeight: "1.8" }}>
            Pour toute question relative à cette politique de confidentialité :
            <br />
            <a href="mailto:scolafree@orange.fr" style={{ color: "#2ec4b6" }}>
              scolafree@orange.fr
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
