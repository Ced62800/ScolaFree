"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Pas de throw ici : Vercel ne peut pas injecter les variables pendant le build
export const supabase = createClient(supabaseUrl ?? "", supabaseKey ?? "");
