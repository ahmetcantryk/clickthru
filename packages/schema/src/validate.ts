import { z } from 'zod';
import { demoSchema, type Demo } from './demo';

/**
 * Demo'yu doğrular; geçersizse açıklayıcı hata fırlatır (sınır validasyonu, fail-fast).
 * Güvenilmeyen girdi (API/dosya) için sınırda kullan.
 */
export function validateDemo(input: unknown): Demo {
  return demoSchema.parse(input);
}

export type DemoValidationResult =
  | { ok: true; demo: Demo }
  | { ok: false; errors: string[] };

/** Fırlatmayan sürüm — sonucu yapısal döner. */
export function safeValidateDemo(input: unknown): DemoValidationResult {
  const result = demoSchema.safeParse(input);
  if (result.success) {
    return { ok: true, demo: result.data };
  }
  return { ok: false, errors: result.error.issues.map(formatIssue) };
}

/** Hızlı boolean kontrol. */
export function isValidDemo(input: unknown): input is Demo {
  return demoSchema.safeParse(input).success;
}

function formatIssue(issue: z.ZodIssue): string {
  const path = issue.path.join('.') || '(root)';
  return `${path}: ${issue.message}`;
}
