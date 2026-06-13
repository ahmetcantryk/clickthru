'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { LeadForm } from '@clickthru/schema';
import { submitLead } from '@/lib/leads';
import { useT } from '@/lib/i18n';

/**
 * Lead yakalama kapısı — turdan önce/sonra görüntüleyenden e-posta toplar.
 * Tiyatro (koyu) üstünde merkezde cam kart. Gönderince veya "şimdilik geç" ile `onContinue`.
 */
export function LeadGate({
  demoId,
  form,
  onContinue,
}: {
  demoId: string;
  form: LeadForm;
  onContinue: () => void;
}) {
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [err, setErr] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState('submitting');
    setErr('');
    try {
      await submitLead(demoId, {
        email,
        name: form.collectName ? name : undefined,
        company: form.collectCompany ? company : undefined,
      });
      onContinue();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : t.lead.error);
      setState('error');
    }
  }

  const inputCls =
    'h-11 w-full rounded-xl border border-white/15 bg-white/10 px-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/40 focus:bg-white/15';

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl"
      >
        <h2 className="text-lg font-bold text-white">{form.headline || t.lead.defaultHeadline}</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/65">
          {form.description || t.lead.defaultDescription}
        </p>

        <div className="mt-5 space-y-2.5">
          {form.collectName && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.lead.name}
              autoComplete="name"
              className={inputCls}
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.lead.email}
            autoComplete="email"
            required
            className={inputCls}
          />
          {form.collectCompany && (
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={t.lead.company}
              autoComplete="organization"
              className={inputCls}
            />
          )}
        </div>

        {state === 'error' && <p className="mt-3 text-xs text-red-300">{err}</p>}

        <button
          type="submit"
          disabled={state === 'submitting'}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground transition-all hover:brightness-110 disabled:opacity-50"
        >
          {state === 'submitting' ? <span className="spinner" /> : t.lead.submit}
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="mt-2.5 block w-full text-center text-xs font-medium text-white/50 transition-colors hover:text-white/80"
        >
          {t.lead.skip}
        </button>
      </form>
    </div>
  );
}
