import type { Metadata } from 'next';
import './globals.css';
import GHLChat from '@/components/GHLChat';
import FloatingActions from '@/components/FloatingActions';

export const metadata: Metadata = {
  /* absolute base for OG/twitter images; override via SITE_URL at deploy */
  metadataBase: new URL(process.env.SITE_URL || 'https://www.orkaytiles.com'),
  title: 'ORKAY Tiles International — Crafted in Morbi. Designed for the World.',
  description:
    'ORKAY Tiles International — vitrified and porcelain tile manufacturer in Morbi, India since 1996. Seven units, 16,000 sq.m a day, exported to 40+ countries. CE certified, ISO 9001:2015. OEM and private label welcome.',
  keywords: [
    'porcelain tile manufacturer India',
    'vitrified tiles exporter',
    'Morbi tile manufacturer',
    'private label tiles',
    'OEM porcelain slabs',
    'tile importer supplier',
  ],
  openGraph: {
    title: 'ORKAY Tiles International',
    description:
      'Crafted in Morbi. Designed for the World. Vitrified and porcelain tiles from one of India’s leading manufacturers — 16,000 sq.m a day, 40+ export countries.',
    type: 'website',
    images: ['/img/hero_dusk.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <FloatingActions />
        <GHLChat />
      </body>
    </html>
  );
}
