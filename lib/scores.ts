import { supabase } from "@/supabaseClient";

// Sauvegarder un score
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
  if (!user) return null; // Non connecté, on ne sauvegarde pas

  const { data, error } = await supabase.from("scores").insert({
    user_id: user.id,
    classe,
    matiere,
    theme,
    score,
    total,
  });

  if (error) console.error("Erreur sauvegarde score:", error);
  return data;
}

// Récupérer le meilleur score pour un thème
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

// Récupérer tous les scores d'une classe
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

// Récupérer l'historique complet
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

// Calculer la moyenne par matière pour une classe
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
// Récupérer le dernier score pour un thème
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
