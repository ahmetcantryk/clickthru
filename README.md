# clickthru

İnteraktif ürün demo platformu — kullanıcıların ürün görüntüsü/videosu üstüne
tooltip/zoom/sahne ekleyip **tıklanabilir interaktif demolar** ürettiği studio.

> Tek doğruluk kaynağı: [`CLAUDE.md`](./CLAUDE.md). Kabul testleri: [`ACCEPTANCE.md`](./ACCEPTANCE.md).

## Monorepo

```
apps/web              → studio (editör + player)   ← Faz 1 odak
apps/extension        → Chrome MV3 capture          (iskelet — kendi fazı)
services/api          → backend                     (iskelet — kendi fazı)
services/render-worker→ sunucu-taraflı export       (iskelet — Faz 2)
packages/schema       → Demo/Step tipleri (tek kaynak)
packages/ui           → paylaşılan tasarım sistemi + sahne primitifleri
```

## Geliştirme

```bash
pnpm install          # bağımlılıklar
pnpm dev              # studio (apps/web) — http://localhost:3000
pnpm typecheck        # tüm paketler
pnpm lint
pnpm test
pnpm build
```

Stack: pnpm workspaces · Next.js (App Router) · React + Zustand · Tailwind + Radix ·
Framer Motion · zod · TypeScript strict.
