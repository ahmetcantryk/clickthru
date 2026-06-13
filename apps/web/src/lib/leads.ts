import { createSupabaseClient } from './supabase/client';

/**
 * Lead yakalama (Faz 3 satış/CRM). Görüntüleyen, paylaşılan demoda formu doldurur →
 * `demo_leads`'e yazılır (RLS: yalnız public demo). Leadleri yalnız demonun sahibi okur (RLS: owner).
 */

/** Basit ama sağlam e-posta doğrulaması (saf — test edilebilir). */
export function isValidEmail(s: string | undefined): boolean {
  if (!s) return false;
  const v = s.trim();
  // tek @, her iki tarafta karakter, alan adında nokta, boşluk yok.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
}

export interface LeadInput {
  email: string;
  name?: string;
  company?: string;
}

/** Lead gönder (anon insert). Geçersiz e-posta → fail-fast (UI mesaj gösterir). */
export async function submitLead(demoId: string, input: LeadInput): Promise<void> {
  if (!demoId) throw new Error('demoId gerekli');
  if (!isValidEmail(input.email)) throw new Error('Geçerli bir e-posta adresi gir.');
  const supabase = createSupabaseClient();
  const { error } = await supabase.from('demo_leads').insert({
    demo_id: demoId,
    email: input.email.trim(),
    name: input.name?.trim() || null,
    company: input.company?.trim() || null,
  });
  if (error) throw new Error(error.message);
}

export interface Lead {
  demoId: string;
  email: string;
  name: string | null;
  company: string | null;
  createdAt: string;
}

interface LeadRow {
  demo_id: string;
  email: string;
  name: string | null;
  company: string | null;
  created_at: string;
}

/** Sahibin demolarına gelen son leadler (RLS owner-scoped). Oturum yoksa null. */
export async function getLeads(limit = 100): Promise<Lead[] | null> {
  const supabase = createSupabaseClient();
  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) return null;

  const { data, error } = await supabase
    .from('demo_leads')
    .select('demo_id, email, name, company, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as LeadRow[]).map((r) => ({
    demoId: r.demo_id,
    email: r.email,
    name: r.name,
    company: r.company,
    createdAt: r.created_at,
  }));
}
