"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Inscription() {
  const router = useRouter();
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    niveau: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      !form.niveau
    ) {
      setError("Veuillez remplir tous les champs.");
      setLoading(false);
      return;
    }

    // 1. Créer le compte auth Supabase
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          prenom: form.prenom,
          nom: form.nom,
          niveau: form.niveau,
          role: "user",
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. Insérer le profil dans la table "profiles"
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        niveau: form.niveau,
        role: "user",
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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" onClick={() => router.push("/")}>
          🎓 Scola<span>Free</span>
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
