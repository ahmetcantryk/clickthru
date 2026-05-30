import { redirect } from 'next/navigation';

// Landing page yok — kök doğrudan studio'ya gider (CLAUDE.md Faz 1 odak: studio).
export default function Home() {
  redirect('/studio');
}
