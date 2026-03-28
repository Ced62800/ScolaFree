"use client";

import { DecouverteContext } from "@/components/DecouverteContext";
import { supabase } from "@/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function CollegeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [estConnecte, setEstConnecte] = useState(true);
  const [pret, setPret] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEstConnecte(!!user);
      setPret(true);
    };
    check();
  }, []);

  if (!pret) return <>{children}</>;

  const estBilan = pathname?.includes("/bilan");
  if (!estConnecte && estBilan) {
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🔒</div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#fff",
              marginBottom: "12px",
            }}
          >
            Bilan réservé aux inscrits
          </h2>
          <p
            style={{
              color: "#aaa",
              fontSize: "1rem",
              marginBottom: "32px",
              maxWidth: "400px",
              margin: "0 auto 32px",
            }}
          >
            Les bilans permettent de sauvegarder ta progression. Inscris-toi
            gratuitement pour y accéder !
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxWidth: "320px",
              margin: "0 auto",
            }}
          >
            <button
              onClick={() => router.push("/inscription")}
              style={{
                background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                padding: "16px 32px",
                borderRadius: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              ✨ S'inscrire gratuitement →
            </button>
            <button
              onClick={() => router.push("/connexion")}
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.95rem",
                padding: "14px 32px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.15)",
                cursor: "pointer",
              }}
            >
              J'ai déjà un compte — Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DecouverteContext.Provider
      value={{ estConnecte, maxQuestions: estConnecte ? 10 : 5 }}
    >
      {children}
    </DecouverteContext.Provider>
  );
}
