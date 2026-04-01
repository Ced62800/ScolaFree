import { supabase } from "@/supabaseClient";

// Ordre des classes
export const ORDRE_CLASSES = ["cp", "ce1", "ce2", "cm1", "cm2"];

// Bilans requis par classe
const BILANS_PAR_CLASSE: Record<string, { matiere: string; theme: string }[]> =
  {
    cp: [
      { matiere: "francais", theme: "bilan" },
      { matiere: "maths", theme: "bilan" },
    ],
    ce1: [
      { matiere: "francais", theme: "bilan" },
      { matiere: "maths", theme: "bilan" },
      { matiere: "anglais", theme: "bilan" },
    ],
    ce2: [
      { matiere: "francais", theme: "bilan" },
      { matiere: "maths", theme: "bilan" },
      { matiere: "anglais", theme: "bilan" },
    ],
    cm1: [
      { matiere: "francais", theme: "bilan" },
      { matiere: "maths", theme: "bilan" },
      { matiere: "anglais", theme: "bilan" },
    ],
    cm2: [
      { matiere: "francais", theme: "bilan" },
      { matiere: "maths", theme: "bilan" },
      { matiere: "anglais", theme: "bilan" },
    ],
  };

export async function verifierEtPasserClasse(
  userId: string,
  classeActuelle: string,
): Promise<boolean> {
  const indexActuel = ORDRE_CLASSES.indexOf(classeActuelle);

  if (indexActuel === -1 || indexActuel === ORDRE_CLASSES.length - 1)
    return false;

  const { data, error } = await supabase
    .from("scores")
    .select("matiere, theme, score, total")
    .eq("user_id", userId)
    .eq("classe", classeActuelle)
    .eq("theme", "bilan")
    .order("score", { ascending: false });

  if (error || !data) return false;

  const bilansRequis = BILANS_PAR_CLASSE[classeActuelle];
  const scores: number[] = [];

  for (const bilan of bilansRequis) {
    const meilleur = data.find((d) => d.matiere === bilan.matiere);
    if (meilleur) {
      scores.push((meilleur.score / meilleur.total) * 20);
    }
  }

  if (scores.length < bilansRequis.length) return false;

  const moyenne = scores.reduce((acc, s) => acc + s, 0) / scores.length;
  if (moyenne < 16) return false;

  const classesSuivante = ORDRE_CLASSES[indexActuel + 1];

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ classe: classesSuivante })
    .eq("id", userId);

  if (updateError) {
    console.error("Erreur passage de classe:", updateError);
    return false;
  }

  console.log(`Passage de classe : ${classeActuelle} -> ${classesSuivante}`);
  return true;
}

export async function saveScore({
  classe,
  matiere,
  theme,
  score,
  total,
}: {
  classe: string;
  matiere: string;
  theme: string;
  score: number;
  total: number;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from("scores").insert({
    user_id: user.id,
    classe,
    matiere,
    theme,
    score,
    total,
  });

  if (error) {
    console.error("Erreur sauvegarde score:", error);
    return null;
  }

  if (theme === "bilan") {
    await verifierEtPasserClasse(user.id, classe);
  }

  return data;
}

export async function getBestScore(
  classe: string,
  matiere: string,
  theme: string,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("scores")
    .select("score, total")
    .eq("user_id", user.id)
    .eq("classe", classe)
    .eq("matiere", matiere)
    .eq("theme", theme)
    .order("score", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function getScoresByClasse(classe: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .eq("classe", classe)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function getAllScores() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function getMoyenneByMatiere(classe: string, matiere: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("scores")
    .select("score, total")
    .eq("user_id", user.id)
    .eq("classe", classe)
    .eq("matiere", matiere);

  if (error || !data || data.length === 0) return null;

  const moyenne =
    data.reduce((acc, s) => acc + (s.score / s.total) * 100, 0) / data.length;
  return Math.round(moyenne);
}

export async function getLastScore(
  classe: string,
  matiere: string,
  theme: string,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("scores")
    .select("score, total")
    .eq("user_id", user.id)
    .eq("classe", classe)
    .eq("matiere", matiere)
    .eq("theme", theme)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function getAllBilansForDeblocage(): Promise<
  Record<string, number | null>
> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("scores")
    .select("classe, matiere, theme, score, total")
    .eq("user_id", user.id)
    .eq("theme", "bilan")
    .order("score", { ascending: false });

  if (error || !data) return {};

  const resultat: Record<string, number | null> = {};

  for (const classe of ORDRE_CLASSES) {
    const bilansRequis = BILANS_PAR_CLASSE[classe];
    const scores: number[] = [];

    for (const bilan of bilansRequis) {
      const meilleur = data.find(
        (d) => d.classe === classe && d.matiere === bilan.matiere,
      );
      if (meilleur) {
        scores.push((meilleur.score / meilleur.total) * 20);
      }
    }

    if (scores.length === 0 || scores.length < bilansRequis.length) {
      resultat[classe] = null;
    } else {
      const moyenne = scores.reduce((acc, s) => acc + s, 0) / scores.length;
      resultat[classe] = Math.round(moyenne * 10) / 10;
    }
  }

  return resultat;
}

export async function getClassesDebloquees(): Promise<Set<string>> {
  const moyennes = await getAllBilansForDeblocage();
  const debloquees = new Set<string>();
  for (const [classe, moyenne] of Object.entries(moyennes)) {
    if (moyenne !== null && moyenne >= 16) {
      debloquees.add(classe);
    }
  }
  return debloquees;
}
