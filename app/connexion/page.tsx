"use client";

import { supabase } from "@/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Connexion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
