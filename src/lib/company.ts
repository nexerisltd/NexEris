import { Globe, Smartphone, Monitor, ShieldCheck, Bot, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Edit this file to change company-page content. No component changes needed.

export const company = {
  name: 'NexEris LTD',
  tagline: 'We build software people actually use.',
  intro:
    'NexEris LTD is a software company building web platforms, desktop apps, browser tools and bots — designed, shipped and maintained by one tight team.',
  github: 'https://github.com/nexerisltd',
  // TODO: add your real company email. Leave empty to hide the email button.
  email: '',
}

export interface Service {
  title: string
  description: string
  icon: LucideIcon
}

export const services: Service[] = [
  {
    title: 'Web Platforms',
    description: 'Fast, secure full-stack web apps built with Next.js, Supabase and modern cloud hosting.',
    icon: Globe,
  },
  {
    title: 'Desktop Apps',
    description: 'Native-feeling Windows desktop software using Flutter and Tauri.',
    icon: Monitor,
  },
  {
    title: 'Browser Extensions',
    description: 'Chrome extensions with a connected backend, built for real daily use.',
    icon: Layers,
  },
  {
    title: 'Bots & Automation',
    description: 'Telegram bots and automation workflows that remove repetitive work.',
    icon: Bot,
  },
  {
    title: 'Mobile-ready Experiences',
    description: 'Responsive interfaces that work well on every screen size.',
    icon: Smartphone,
  },
  {
    title: 'Security-minded Engineering',
    description: 'Auth, access control and admin tooling designed in from day one.',
    icon: ShieldCheck,
  },
]

export interface Product {
  name: string
  kind: string
  description: string
  href?: string
}

export const products: Product[] = [
  { name: 'NexApp', kind: 'Web platform', description: 'An app-sharing platform for discovering and publishing apps.' },
  { name: 'NexFetch', kind: 'Chrome extension + web', description: 'A video-downloader extension backed by its own web platform.' },
  { name: 'NexFlow', kind: 'Windows desktop app', description: 'A Flutter desktop app with a clean Fluent UI.' },
  { name: 'NexPass', kind: 'Desktop app', description: 'A lightweight Tauri (Rust) desktop app.' },
  { name: 'NexSecurity', kind: 'Learning platform', description: 'A private learning platform with boards, classes and video lessons.', href: 'https://nexsecurity.vercel.app' },
  { name: 'NexSync', kind: 'Web app', description: 'Synced audio rooms to listen together in real time.', href: 'https://nexsyncx.vercel.app' },
  { name: 'NexBots', kind: 'Telegram bots', description: 'Telegram bots with a unified download flow and companion site.' },
]

export const values = [
  { title: 'Ship', description: 'We prefer working software over long plans.' },
  { title: 'Own', description: 'Every product has a person who owns it end to end.' },
  { title: 'Care', description: 'Speed, security and details are part of the product.' },
]

// The people who built NexEris together. `username` links to their team profile,
// which also supplies their profile picture.
export const founders = [
  { name: 'Arabi Islam', username: 'arabiislam46ar', role: 'Co-creator' },
  { name: 'MR. ARX', username: 'mrarxme', role: 'Co-creator' },
]

// Shown as "Built with" chips on the homepage.
export const stack = ['Next.js', 'Supabase', 'Flutter', 'Tauri', 'Firebase']

// Public address of the deployed site. Override with NEXT_PUBLIC_SITE_URL (e.g. a custom domain).
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nexeris.vercel.app').replace(/\/$/, '')
