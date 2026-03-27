"use client";

import { getAllScores } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BASE_URL =
  "https://akdvjkvdaggjpbfgscko.supabase.co/storage/v1/object/public/avatars/";

const AVATARS = [
  { id: "Alchimiste", nom: "Alchimiste", fichier: "Alchimiste%20.png" },
  {
    id: "Apprenti_Sorcier",
    nom: "Apprenti Sorcier",
    fichier: "Apprenti%20Sorcier%20.png",
  },
  { id: "Astronaute", nom: "Astronaute", fichier: "Astronaute.png" },
  {
    id: "Cavalier_du_Savoir",
    nom: "Cavalier du Savoir",
    fichier: "Cavalier%20du%20Savoir..jpg",
  },
  { id: "Chevalier", nom: "Chevalier", fichier: "Chevalier.png" },
  {
    id: "Clown_du_Savoir",
    nom: "Clown du Savoir",
    fichier: "Clown%20du%20Savoir.jpg",
  },
  { id: "Clown_Ssola", nom: "Clown Ssola", fichier: "Clown%20Ssola.jpg" },
  { id: "Detective", nom: "Détective", fichier: "Detective.png" },
  { id: "dragon", nom: "Dragon", fichier: "dragon.png" },
  { id: "Explorateur", nom: "Explorateur", fichier: "Explorateur.png" },
  { id: "Gardien", nom: "Gardien", fichier: "Gardien%20.png" },
  {
    id: "Golem_de_Pierre",
    nom: "Golem de Pierre",
    fichier: "Golem%20de%20Pierre.png",
  },
  {
    id: "Mage_des_etoiles",
    nom: "Mage des étoiles",
    fichier: "Mage%20des%20etoiles.png",
  },
  { id: "Ninja", nom: "Ninja", fichier: "Ninja.png" },
  {
    id: "Pirate_du_Savoir",
    nom: "Pirate du Savoir",
    fichier: "Pirate%20du%20Savoir.jpg",
  },
  {
    id: "Pompier_du_Savoir",
    nom: "Pompier du Savoir",
    fichier: "Pompier%20du%20Savoir.jpg",
  },
  {
    id: "Robot_futuriste",
    nom: "Robot futuriste",
    fichier: "Robot%20futuriste.png",
  },
  { id: "Samourai", nom: "Samouraï", fichier: "Samourai.png" },
];

const ORDRE_CLASSES = ["cp", "ce1", "ce2", "cm1", "cm2"];
const LABEL_CLASSES: Record<string, string> = {
  cp: "CP",
  ce1: "CE1",
  ce2: "CE2",
  cm1: "CM1",
  cm2: "CM2",
};

export default function ProfilPage() {
  const router = useRouter();
  const [profil, setProfil] = useState<{
    prenom: string;
    nom: string;
    classe: string;
    niveau: string;
    email: string;
    avatar: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [modeReset, setModeReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");
  const [scores, setScores] = useState<any[]>([]);
  const [modeAvatar, setModeAvatar] = useState(false);
  const [avatarChoisi, setAvatarChoisi] = useState("");
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState("");

  useEffect(() => {
    const chargerProfil = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        router.push("/connexion");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("prenom, nom, classe, niveau, avatar")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfil({
          prenom: data.prenom,
          nom: data.nom,
          classe: data.classe,
          niveau: data.niveau,
          email: user.email ?? "",
          avatar: data.avatar ?? "",
        });
        setAvatarChoisi(data.avatar ?? "");
      }
      const tousLesScores = await getAllScores();
      setScores(tousLesScores);
      setLoading(false);
    };
    chargerProfil();
  }, [router]);

  const handleReset = async () => {
    if (!profil?.email) return;
    setResetError("");
    setResetSuccess("");
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(profil.email, {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    });
    setResetLoading(false);
    if (error) {
      setResetError("Une erreur est survenue. Réessaie.");
      return;
    }
    setResetSuccess("Un email de réinitialisation a été envoyé !");
    setModeReset(false);
  };

  const handleSauvegarderAvatar = async () => {
    if (!avatarChoisi) return;
    setAvatarSaving(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ avatar: avatarChoisi })
      .eq("id", user.id);
    setProfil((prev) => (prev ? { ...prev, avatar: avatarChoisi } : prev));
    setAvatarSaving(false);
    setModeAvatar(false);
    setAvatarSuccess("Avatar mis à jour !");
    setTimeout(() => setAvatarSuccess(""), 3000);
  };

  const bilansUniquement = scores.filter(
    (s) => s.theme === "bilan" || s.theme === "bilan-2",
  );
  const nbBilans = bilansUniquement.length;
  const a2020 = bilansUniquement.some((s) => s.score === s.total);
  const bilans1620 = bilansUniquement.filter(
    (s) => (s.score / s.total) * 20 >= 16,
  );
  const moyenneGenerale =
    bilansUniquement.length > 0
      ? bilansUniquement.reduce((acc, s) => acc + (s.score / s.total) * 20, 0) /
        bilansUniquement.length
      : 0;
  const cm2Complete =
    profil?.classe === "cm2" &&
    bilansUniquement.filter((s) => s.classe === "cm2").length >= 3;

  // Calcul classes validées
  const getClassesValidees = () => {
    if (!profil) return [];
    const indexActuel = ORDRE_CLASSES.indexOf(profil.classe);
    return ORDRE_CLASSES.map((classe, index) => {
      if (index < indexActuel) return { classe, statut: "validee" };
      if (index === indexActuel) return { classe, statut: "en_cours" };
      return { classe, statut: "bloquee" };
    });
  };

  const badges = [
    {
      emoji: "🌟",
      nom: "Premier pas",
      description: "Complète ton premier bilan",
      debloque: nbBilans >= 1,
      progression: Math.min(nbBilans, 1),
      total: 1,
      messageDebloque: "Bravo, tu as fait ton premier bilan !",
      messageEncouragement: "Fais ton premier bilan pour débloquer ce badge !",
    },
    {
      emoji: "📚",
      nom: "Studieux",
      description: "Complète 5 bilans",
      debloque: nbBilans >= 5,
      progression: Math.min(nbBilans, 5),
      total: 5,
      messageDebloque: "Incroyable, 5 bilans complétés !",
      messageEncouragement: `Plus que ${5 - Math.min(nbBilans, 5)} bilan(s) !`,
    },
    {
      emoji: "🎯",
      nom: "Précis",
      description: "Obtiens 20/20 à un bilan",
      debloque: a2020,
      progression: a2020 ? 1 : 0,
      total: 1,
      messageDebloque: "Parfait ! Tu as eu 20/20 !",
      messageEncouragement: "Vise la perfection : 20/20 à un bilan !",
    },
    {
      emoji: "🔥",
      nom: "En feu",
      description: "Obtiens 3 bilans ≥ 16/20",
      debloque: bilans1620.length >= 3,
      progression: Math.min(bilans1620.length, 3),
      total: 3,
      messageDebloque: "Tu es en feu ! 3 bilans ≥ 16/20 !",
      messageEncouragement: `Plus que ${3 - Math.min(bilans1620.length, 3)} bilan(s) ≥ 16/20 !`,
    },
    {
      emoji: "🏆",
      nom: "Champion",
      description: "Moyenne générale ≥ 18/20",
      debloque: moyenneGenerale >= 18,
      progression: Math.min(Math.round(moyenneGenerale * 10) / 10, 18),
      total: 18,
      messageDebloque: "Champion ! Moyenne ≥ 18/20 !",
      messageEncouragement: `Ta moyenne : ${Math.round(moyenneGenerale * 10) / 10}/20 — continue !`,
    },
    {
      emoji: "💎",
      nom: "Expert",
      description: "Complète tous les bilans CM2",
      debloque: cm2Complete,
      progression: cm2Complete ? 1 : 0,
      total: 1,
      messageDebloque: "Félicitations ! Tu as terminé le CM2 !",
      messageEncouragement:
        "Termine tous les bilans du CM2 pour débloquer ce badge !",
    },
  ];

  const nbBadgesDebloques = badges.filter((b) => b.debloque).length;
  const classesValidees = getClassesValidees();

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px",
          color: "#aaa",
          fontSize: "1.1rem",
        }}
      >
        Chargement...
      </div>
    );
  }

  if (!profil) return null;

  const avatarActuel = AVATARS.find((a) => a.id === profil.avatar);
  const avatarUrl = avatarActuel ? BASE_URL + avatarActuel.fichier : null;

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 20px" }}>
      {/* Titre */}
      <div style={{ marginBottom: "36px" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            marginBottom: "6px",
            background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          👤 Mon profil
        </h1>
        <p style={{ color: "#aaa", fontSize: "0.95rem" }}>
          Tes informations personnelles et paramètres de compte.
        </p>
      </div>

      {/* Message succès avatar */}
      {avatarSuccess && (
        <div
          style={{
            background: "rgba(46,196,182,0.1)",
            border: "1px solid rgba(46,196,182,0.3)",
            color: "#2ec4b6",
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "16px",
            fontSize: "0.9rem",
            textAlign: "center",
          }}
        >
          ✅ {avatarSuccess}
        </div>
      )}

      {/* Avatar + nom + classes validées */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(79,142,247,0.15), rgba(46,196,182,0.1))",
          border: "1px solid rgba(79,142,247,0.3)",
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Avatar cliquable */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              onClick={() => setModeAvatar(!modeAvatar)}
              style={{
                cursor: "pointer",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid rgba(79,142,247,0.5)",
                position: "relative",
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                  }}
                >
                  🎓
                </div>
              )}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  opacity: modeAvatar ? 1 : 0,
                  transition: "opacity 0.2s",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>✏️</span>
              </div>
            </div>
            <div
              onClick={() => setModeAvatar(!modeAvatar)}
              style={{
                position: "absolute",
                bottom: "-4px",
                right: "-4px",
                background: "#4f8ef7",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "0.75rem",
              }}
            >
              ✏️
            </div>
          </div>

          <div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff" }}>
              {profil.prenom} {profil.nom}
            </div>
            <div
              style={{ fontSize: "0.9rem", color: "#aaa", marginTop: "4px" }}
            >
              {profil.email}
            </div>
          </div>
        </div>

        {/* Classes validées */}
        <div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "#aaa",
              marginBottom: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Ma progression
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {classesValidees.map(({ classe, statut }) => (
              <div
                key={classe}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  background:
                    statut === "validee"
                      ? "rgba(46,196,182,0.2)"
                      : statut === "en_cours"
                        ? "rgba(79,142,247,0.2)"
                        : "rgba(255,255,255,0.05)",
                  border:
                    statut === "validee"
                      ? "1px solid rgba(46,196,182,0.5)"
                      : statut === "en_cours"
                        ? "1px solid rgba(79,142,247,0.5)"
                        : "1px solid rgba(255,255,255,0.1)",
                  color:
                    statut === "validee"
                      ? "#2ec4b6"
                      : statut === "en_cours"
                        ? "#4f8ef7"
                        : "#555",
                }}
              >
                {statut === "validee"
                  ? "✅"
                  : statut === "en_cours"
                    ? "🔄"
                    : "🔒"}{" "}
                {LABEL_CLASSES[classe]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grille choix avatar */}
      {modeAvatar && (
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(79,142,247,0.3)",
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#aaa",
              marginBottom: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Choisis ton avatar
          </h3>
          <p
            style={{ color: "#888", fontSize: "0.85rem", marginBottom: "16px" }}
          >
            Clique sur le personnage qui te ressemble !
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            {AVATARS.map((avatar) => {
              const url = BASE_URL + avatar.fichier;
              const estChoisi = avatarChoisi === avatar.id;
              return (
                <div key={avatar.id} style={{ textAlign: "center" }}>
                  <div
                    onClick={() => setAvatarChoisi(avatar.id)}
                    style={{
                      cursor: "pointer",
                      borderRadius: "50%",
                      border: estChoisi
                        ? "3px solid #4f8ef7"
                        : "3px solid rgba(255,255,255,0.1)",
                      boxShadow: estChoisi
                        ? "0 0 16px rgba(79,142,247,0.6)"
                        : "none",
                      transition: "all 0.2s",
                      overflow: "hidden",
                      width: "70px",
                      height: "70px",
                      margin: "0 auto",
                      transform: estChoisi ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    <img
                      src={url}
                      alt={avatar.nom}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                        opacity: estChoisi ? 1 : 0.75,
                      }}
                    />
                  </div>
                  <p
                    style={{
                      color: "#aaa",
                      fontSize: "0.65rem",
                      marginTop: "4px",
                    }}
                  >
                    {avatar.nom}
                  </p>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={handleSauvegarderAvatar}
              disabled={avatarSaving || !avatarChoisi}
              style={{
                background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 24px",
                fontSize: "0.95rem",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {avatarSaving ? "Sauvegarde..." : "✅ Valider mon avatar"}
            </button>
            <button
              onClick={() => setModeAvatar(false)}
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "#aaa",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "12px 24px",
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Infos détaillées */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#aaa",
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Mes informations
        </h2>
        <LigneInfo emoji="✏️" label="Prénom" valeur={profil.prenom} />
        <LigneInfo emoji="👤" label="Nom" valeur={profil.nom} />
        <LigneInfo emoji="📧" label="Email" valeur={profil.email} />
        <LigneInfo
          emoji="🎓"
          label="Classe"
          valeur={LABEL_CLASSES[profil.classe] ?? profil.classe}
        />
        <LigneInfo emoji="📚" label="Niveau" valeur={profil.niveau} dernier />
      </div>

      {/* Mot de passe */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#aaa",
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Sécurité
        </h2>
        {resetSuccess && (
          <div
            style={{
              background: "rgba(46,196,182,0.1)",
              border: "1px solid rgba(46,196,182,0.3)",
              color: "#2ec4b6",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "16px",
              fontSize: "0.9rem",
            }}
          >
            ✅ {resetSuccess}
          </div>
        )}
        {resetError && (
          <div
            style={{
              background: "rgba(255,107,107,0.1)",
              border: "1px solid rgba(255,107,107,0.3)",
              color: "#ff6b6b",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "16px",
              fontSize: "0.9rem",
            }}
          >
            ⚠️ {resetError}
          </div>
        )}
        {!modeReset ? (
          <button
            onClick={() => setModeReset(true)}
            style={{
              background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontSize: "0.95rem",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            🔒 Changer mon mot de passe
          </button>
        ) : (
          <div>
            <p
              style={{
                color: "#aaa",
                marginBottom: "16px",
                fontSize: "0.9rem",
              }}
            >
              Un email sera envoyé à{" "}
              <strong style={{ color: "#fff" }}>{profil.email}</strong>
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={handleReset}
                disabled={resetLoading}
                style={{
                  background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                {resetLoading ? "Envoi..." : "Envoyer le lien →"}
              </button>
              <button
                onClick={() => setModeReset(false)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "#aaa",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BADGES */}
      <div style={{ marginTop: "40px", marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            color: "#fff",
            marginBottom: "4px",
          }}
        >
          🏅 Mes badges
        </h2>
        <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
          {nbBadgesDebloques}/{badges.length} badges débloqués
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {badges.map((badge) => (
          <div
            key={badge.nom}
            style={{
              background: badge.debloque
                ? "linear-gradient(135deg, rgba(79,142,247,0.15), rgba(46,196,182,0.1))"
                : "rgba(255,255,255,0.03)",
              border: badge.debloque
                ? "1px solid rgba(79,142,247,0.4)"
                : "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              padding: "20px",
              textAlign: "center",
              opacity: badge.debloque ? 1 : 0.5,
            }}
          >
            <div
              style={{
                fontSize: "2.5rem",
                marginBottom: "8px",
                filter: badge.debloque ? "none" : "grayscale(100%)",
              }}
            >
              {badge.emoji}
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: badge.debloque ? "#fff" : "#666",
                marginBottom: "4px",
              }}
            >
              {badge.nom}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#888",
                marginBottom: "12px",
              }}
            >
              {badge.description}
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: "10px",
                height: "6px",
                marginBottom: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(badge.progression / badge.total) * 100}%`,
                  height: "100%",
                  background: badge.debloque
                    ? "linear-gradient(90deg, #4f8ef7, #2ec4b6)"
                    : "#555",
                  borderRadius: "10px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                color: badge.debloque ? "#2ec4b6" : "#666",
                fontStyle: badge.debloque ? "normal" : "italic",
              }}
            >
              {badge.debloque
                ? badge.messageDebloque
                : badge.messageEncouragement}
            </div>
          </div>
        ))}
      </div>

      {/* Lien vers page parents */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "32px",
          textAlign: "center",
        }}
      >
        <div
          style={{ fontSize: "0.9rem", color: "#aaa", marginBottom: "12px" }}
        >
          👨‍👩‍👧 Tu es un parent ? Consulte les progrès détaillés de ton enfant.
        </div>
        <button
          onClick={() => router.push("/parents")}
          style={{
            background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            fontSize: "0.95rem",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          📊 Voir les progrès détaillés →
        </button>
      </div>

      {/* Retour */}
      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <span
          onClick={() => router.push("/")}
          style={{ color: "#4f8ef7", cursor: "pointer", fontSize: "0.95rem" }}
        >
          ← Retour à l'accueil
        </span>
      </div>
    </div>
  );
}

function LigneInfo({
  emoji,
  label,
  valeur,
  dernier,
}: {
  emoji: string;
  label: string;
  valeur: string;
  dernier?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: dernier ? "none" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span style={{ color: "#888", fontSize: "0.9rem" }}>
        {emoji} {label}
      </span>
      <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "#fff" }}>
        {valeur}
      </span>
    </div>
  );
}
