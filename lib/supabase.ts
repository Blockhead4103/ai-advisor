import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AdvisorAnswers, Scorecard } from "./types";

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function persistLead(
  answers: AdvisorAnswers,
  scorecard: Scorecard,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return false;
  }

  const { error } = await supabase.from("leads").insert({
    company: answers.company || null,
    email: answers.email || null,
    landscape: answers.landscape,
    data_maturity: answers.dataMaturity,
    ai_ambition: answers.aiAmbition,
    answers,
    scorecard,
    readiness_score: scorecard.readinessScore,
  });

  if (error) {
    throw new Error(`Supabase-Insert fehlgeschlagen: ${error.message}`);
  }

  return true;
}
