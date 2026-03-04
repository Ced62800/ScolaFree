import { supabase } from "../supabaseClient";

console.log("Le script fonctionne !");

async function test() {
  const { data, error } = await supabase.from("questions").select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);
}

test();
