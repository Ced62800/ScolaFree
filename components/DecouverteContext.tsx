"use client";

import { supabase } from "@/supabaseClient";
import { createContext, useContext, useEffect, useState } from "react";

export type ModeDecouverte = {
  estConnecte: boolean;
  maxQuestions: number;
};

export const DecouverteContext = createContext<ModeDecouverte>({
  estConnecte: false,
  maxQuestions: 3,
});

export const useDecouverte = () => useContext(DecouverteContext);

export function DecouverteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [estConnecte, setEstConnecte] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setEstConnecte(!!data.session?.user);
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setEstConnecte(!!session?.user);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const maxQuestions = estConnecte ? 10 : 3;

  return (
    <DecouverteContext.Provider value={{ estConnecte, maxQuestions }}>
      {children}
    </DecouverteContext.Provider>
  );
}
