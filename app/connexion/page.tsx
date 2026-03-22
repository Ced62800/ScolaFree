"use client";

import { supabase } from "@/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [modeReset, setModeReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    if (searchParams.get("inscrit") === "1") {
      setSuccess("Compte créé ! Vérifiez votre email puis connectez-vous.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email: form.email,
        password: form.password,
      },
    );

    if (signInError) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    setLoading(false);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    console.log("ROLE:", profile?.role);
    router.push("/");
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    });

    setResetLoading(false);

    if (error) {
      setResetError("Une erreur est survenue. Vérifie ton adresse email.");
      return;
    }

    setResetSuccess(
      "✅ Un email de réinitialisation a été envoyé ! Vérifie ta boîte mail.",
    );
  };

  if (modeReset) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo" onClick={() => router.push("/")}>
            🎓 Scola<span>Free</span>
          </div>
          <h2 className="auth-title">Mot de passe oublié</h2>
          <p className="auth-sub">
            Entre ton email pour recevoir un lien de réinitialisation.
          </p>

          {resetSuccess && <div className="auth-success">{resetSuccess}</div>}

          {!resetSuccess && (
            <form onSubmit={handleReset} className="auth-form">
              <div className="form-group">
                <label>Adresse email</label>
                <input
                  type="email"
                  placeholder="jean.dupont@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              {resetError && <div className="auth-error">⚠️ {resetError}</div>}
              <button
                type="submit"
                className="auth-btn"
                disabled={resetLoading}
              >
                {resetLoading ? "Envoi en cours..." : "Envoyer le lien →"}
              </button>
            </form>
          )}

          <p className="auth-switch">
            <span
              onClick={() => {
                setModeReset(false);
                setResetSuccess("");
                setResetError("");
              }}
            >
              ← Retour à la connexion
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" onClick={() => router.push("/")}>
          🎓 Scola<span>Free</span>
        </div>
        <h2 className="auth-title">Connexion</h2>
        <p className="auth-sub">Content de te revoir !</p>

        {success && <div className="auth-success">✅ {success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="Votre mot de passe"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {/* Lien mot de passe oublié */}
          <div
            style={{
              textAlign: "right",
              marginTop: "-8px",
              marginBottom: "12px",
            }}
          >
            <span
              onClick={() => setModeReset(true)}
              style={{
                fontSize: "0.85rem",
                color: "#4f8ef7",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Mot de passe oublié ?
            </span>
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter →"}
          </button>
        </form>

        <p className="auth-switch">
          Pas encore de compte ?{" "}
          <span onClick={() => router.push("/inscription")}>
            S&apos;inscrire gratuitement
          </span>
        </p>
      </div>
    </div>
  );
}

export default function Connexion() {
  return (
    <Suspense>
      <ConnexionForm />
    </Suspense>
  );
}
