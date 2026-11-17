"use client";

import { supabase } from "@/supabaseClient";
import { useEffect, useState } from "react";

// Renvoie la classe de l'élève connecté (ex. "ce2"), ou null s'il n'est pas connecté.
export function useClasseEleve(): { classe: string | null; chargement: boolean } {
  const [classe, setClasse] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let actif = true;
    const charger = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        if (actif) setChargement(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("classe")
        .eq("id", user.id)
        .single();
      if (actif) {
        setClasse(profile?.classe ?? null);
        setChargement(false);
      }
    };
    charger();
    return () => {
      actif = false;
    };
  }, []);

  return { classe, chargement };
}
