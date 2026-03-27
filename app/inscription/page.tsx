"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CLASSES_PAR_NIVEAU: Record<string, { value: string; label: string }[]> = {
  primaire: [
    { value: "cp", label: "CP" },
    { value: "ce1", label: "CE1" },
    { value: "ce2", label: "CE2" },
    { value: "cm1", label: "CM1" },
    { value: "cm2", label: "CM2" },
  ],
  college: [
    { value: "6eme", label: "6ème" },
    { value: "5eme", label: "5ème" },
    { value: "4eme", label: "4ème" },
    { value: "3eme", label: "3ème" },
  ],
  lycee: [
    { value: "seconde", label: "Seconde" },
    { value: "premiere", label: "Première" },
    { value: "terminale", label: "Terminale" },
  ],
};

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

export default function Inscription() {
  const router = useRouter();
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    niveau: "",
    classe: "",
  });
  const [avatarChoisi, setAvatarChoisi] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "niveau") {
      setForm({ ...form, niveau: value, classe: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (
      !form.prenom ||
      !form.nom ||
      !form.email ||
      !form.password ||
      !form.niveau ||
      !form.classe
    ) {
      setError("Veuillez remplir tous les champs.");
      setLoading(false);
      return;
    }

    if (!avatarChoisi) {
      setError("Veuillez choisir un avatar !");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          prenom: form.prenom,
          nom: form.nom,
          niveau: form.niveau,
          classe: form.classe,
          role: "user",
          avatar: avatarChoisi,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        niveau: form.niveau,
        classe: form.classe,
        role: "user",
        avatar: avatarChoisi,
      });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.push("/connexion?inscrit=1");
  };

  const classesDisponibles = form.niveau ? CLASSES_PAR_NIVEAU[form.niveau] : [];

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: "640px" }}>
        <div className="auth-logo" onClick={() => router.push("/")}>
          <img
            src="https://akdvjkvdaggjpbfgscko.supabase.co/storage/v1/object/public/assets/Logo%20ScolaFree.png"
            alt="ScolaFree"
            style={{
              width: "200px",
              height: "40px",
              objectFit: "cover",
              objectPosition: "left center",
              marginTop: "10px",
            }}
          />
        </div>
        <h2 className="auth-title">Créer un compte</h2>
        <p className="auth-sub">C&apos;est gratuit, pour toujours.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="prenom"
                placeholder="Jean"
                value={form.prenom}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="nom"
                placeholder="Dupont"
                value={form.nom}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Adresse email</label>
            <input
              type="email"
              name="email"
              placeholder="jean.dupont@email.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              placeholder="Minimum 8 caractères"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Niveau scolaire</label>
            <select name="niveau" value={form.niveau} onChange={handleChange}>
              <option value="">-- Choisir un niveau --</option>
              <option value="primaire">Primaire</option>
              <option value="college">Collège</option>
              <option value="lycee">Lycée</option>
            </select>
          </div>

          {form.niveau && (
            <div className="form-group">
              <label>Classe</label>
              <select name="classe" value={form.classe} onChange={handleChange}>
                <option value="">-- Choisir une classe --</option>
                {classesDisponibles.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Choix de l'avatar */}
          <div className="form-group">
            <label>
              Choisis ton avatar{" "}
              {avatarChoisi ? (
                "✅"
              ) : (
                <span style={{ color: "#ff6b6b" }}>*</span>
              )}
            </label>
            <p
              style={{
                color: "#aaa",
                fontSize: "0.85rem",
                marginBottom: "12px",
              }}
            >
              Clique sur le personnage qui te ressemble !
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                marginTop: "8px",
              }}
            >
              {AVATARS.map((avatar) => {
                const url = BASE_URL + avatar.fichier;
                const estChoisi = avatarChoisi === avatar.id;
                return (
                  <div key={avatar.id} style={{ textAlign: "center" }}>
                    <div
                      onClick={() => setAvatarChoisi(avatar.id)}
                      title={avatar.nom}
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
                        width: "80px",
                        height: "80px",
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
                          transition: "opacity 0.2s",
                        }}
                      />
                    </div>
                    <p
                      style={{
                        color: "#aaa",
                        fontSize: "0.7rem",
                        marginTop: "6px",
                      }}
                    >
                      {avatar.nom}
                    </p>
                  </div>
                );
              })}
            </div>
            {avatarChoisi && (
              <p
                style={{
                  textAlign: "center",
                  marginTop: "12px",
                  color: "#2ec4b6",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                ✅ Tu as choisi :{" "}
                {AVATARS.find((a) => a.id === avatarChoisi)?.nom} !
              </p>
            )}
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Création du compte..." : "S'inscrire gratuitement →"}
          </button>
        </form>

        <p className="auth-switch">
          Déjà un compte ?{" "}
          <span onClick={() => router.push("/connexion")}>Se connecter</span>
        </p>
      </div>
    </div>
  );
}
