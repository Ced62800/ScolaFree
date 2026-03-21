"use client";

import { DecouverteContext } from "@/components/DecouverteContext";
import { supabase } from "@/supabaseClient";
import { useEffect, useState } from "react";

export default function ThemeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [estConnecte, setEstConnecte] = useState(true); // optimiste par défaut
  const [pret, setPret] = useState(false);

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

  return (
    <DecouverteContext.Provider
      value={{
        estConnecte,
        maxQuestions: estConnecte ? 10 : 5,
      }}
    >
      {children}
    </DecouverteContext.Provider>
  );
}
