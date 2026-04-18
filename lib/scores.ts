import { supabase } from "@/supabaseClient";

export type ScoreRow = {
  id: string;
  created_at: string;
  user_id: string;
  classe: string;
  matiere: string;
  theme: string;
  score: number;
  total: number;
};

type ScoreParams = {
  classe: string;
  matiere: string;
  theme: string;
  score: number;
  total: number;
};

type LookupParams = {
  classe: string;
  matiere: string;
  theme: string;
};

// ============================================================
// HELPER INTERNE
// ============================================================

async function getCurrentUser() {
  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData?.session?.user ?? null;
}

// ============================================================
// saveScore
// Accepte : saveScore({ classe, matiere, theme, score, total })
//        OU saveScore(classe, matiere, theme, score, total)
// ============================================================

export async function saveScore(
  classeOrParams: string | ScoreParams,
  matiere?: string,
  theme?: string,
  score?: number,
  total?: number,
) {
  let c: string, m: string, t: string, s: number, tot: number;

  if (typeof classeOrParams === "object") {
    ({
      classe: c,
      matiere: m,
      theme: t,
      score: s,
      total: tot,
    } = classeOrParams);
  } else {
    c = classeOrParams;
    m = matiere!;
    t = theme!;
    s = score!;
    tot = total!;
  }

  const user = await getCurrentUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("scores")
    .select("id")
    .eq("user_id", user.id)
    .eq("classe", c)
    .eq("matiere", m)
    .eq("theme", t)
    .single();

  if (existing?.id) {
    const { data, error } = await supabase
      .from("scores")
      .update({ score: s, total: tot, created_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) console.error("Erreur update score:", error);
    return data;
  } else {
    const { data, error } = await supabase
      .from("scores")
      .insert({
        user_id: user.id,
        classe: c,
        matiere: m,
        theme: t,
        score: s,
        total: tot,
      })
      .select()
      .single();
    if (error) console.error("Erreur insert score:", error);
    return data;
  }
}

export const sauvegarderScore = saveScore;

// ============================================================
// getBestScore
// Accepte : getBestScore({ classe, matiere, theme })
//        OU getBestScore(classe, matiere, theme)
// ============================================================

export async function getBestScore(
  classeOrParams: string | LookupParams,
  matiere?: string,
  theme?: string,
): Promise<{ score: number; total: number } | null> {
  let c: string, m: string, t: string;

  if (typeof classeOrParams === "object") {
    ({ classe: c, matiere: m, theme: t } = classeOrParams);
  } else {
    c = classeOrParams;
    m = matiere!;
    t = theme!;
  }

  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("scores")
    .select("score, total")
    .eq("user_id", user.id)
    .eq("classe", c)
    .eq("matiere", m)
    .eq("theme", t)
    .order("score", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return { score: data.score, total: data.total };
}

export const getMeilleurScore = getBestScore;

// ============================================================
// getLastScore
// Accepte : getLastScore({ classe, matiere, theme })
//        OU getLastScore(classe, matiere, theme)
// ============================================================

export async function getLastScore(
  classeOrParams: string | LookupParams,
  matiere?: string,
  theme?: string,
): Promise<{ score: number; total: number } | null> {
  let c: string, m: string, t: string;

  if (typeof classeOrParams === "object") {
    ({ classe: c, matiere: m, theme: t } = classeOrParams);
  } else {
    c = classeOrParams;
    m = matiere!;
    t = theme!;
  }

  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("scores")
    .select("score, total")
    .eq("user_id", user.id)
    .eq("classe", c)
    .eq("matiere", m)
    .eq("theme", t)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return { score: data.score, total: data.total };
}

export const getDernierScore = getLastScore;

// ============================================================
// getAllScores
// ============================================================

export async function getAllScores(): Promise<ScoreRow[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

// ============================================================
// getScoresPourClasse
// ============================================================

export async function getScoresPourClasse(classe: string): Promise<ScoreRow[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .eq("classe", classe);

  if (error || !data) return [];
  return data;
}

// ============================================================
// getAllBilansForDeblocage
// ============================================================

export async function getAllBilansForDeblocage(
  classe: string,
): Promise<ScoreRow[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .eq("classe", classe)
    .in("theme", ["bilan", "bilan-2"]);

  if (error || !data) return [];
  return data;
}

// ============================================================
// getClassesDebloquees — retourne Set<string>
// ============================================================

export const ORDRE_CLASSES = ["cp", "ce1", "ce2", "cm1", "cm2"];

export async function getClassesDebloquees(): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user) return new Set(["cp"]);

  const debloquees = new Set<string>(["cp"]);

  for (let i = 0; i < ORDRE_CLASSES.length - 1; i++) {
    const classe = ORDRE_CLASSES[i];
    const bilans = await getAllBilansForDeblocage(classe);

    const francaisValide = bilans.some(
      (b) => b.matiere === "francais" && estBilanValide(b.score, b.total),
    );
    const mathsValide = bilans.some(
      (b) => b.matiere === "maths" && estBilanValide(b.score, b.total),
    );

    if (francaisValide && mathsValide) {
      debloquees.add(ORDRE_CLASSES[i + 1]);
    } else {
      break;
    }
  }

  return debloquees;
}

// ============================================================
// UTILITAIRES
// ============================================================

export function estBilanValide(score: number, total: number): boolean {
  return total > 0 && score / total >= 0.8;
}

export function calculerMoyennesParMatiere(
  scores: ScoreRow[],
): Record<string, number> {
  const groupes: Record<string, number[]> = {};
  for (const s of scores) {
    if (!groupes[s.matiere]) groupes[s.matiere] = [];
    groupes[s.matiere].push((s.score / s.total) * 20);
  }
  const moyennes: Record<string, number> = {};
  for (const [matiere, notes] of Object.entries(groupes)) {
    moyennes[matiere] = notes.reduce((a, b) => a + b, 0) / notes.length;
  }
  return moyennes;
}
