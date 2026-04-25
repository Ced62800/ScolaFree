"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReinitialiserMotDePasse() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError("Une erreur est survenue. Le lien est peut-être expiré.");
      return;
    }

    setSuccess("✅ Mot de passe modifié avec succès !");
    setTimeout(() => router.push("/connexion"), 2000);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" onClick={() => router.push("/")}>
          🎓 Scola<span>Free</span>
        </div>
        <h2 className="auth-title">Nouveau mot de passe</h2>
        <p className="auth-sub">
          Choisis un nouveau mot de passe pour ton compte.
        </p>

        {success && <div className="auth-success">{success}</div>}

        {!success && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                placeholder="Minimum 6 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                placeholder="Répète ton mot de passe"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            {error && <div className="auth-error">⚠️ {error}</div>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer le mot de passe →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
