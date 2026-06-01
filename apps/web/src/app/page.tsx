import './landing.css';
import { LandingApp } from '@/components/landing/landing-app';

// Kök = pazarlama landing sayfası (dark/light + TR/EN, kendi-içinde; studio'dan bağımsız).
export default function Home() {
  return <LandingApp />;
}
