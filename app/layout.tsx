import './globals.css';
import type { Metadata } from 'next';
import { Quicksand, Fredoka } from 'next/font/google';

const quicksand = Quicksand({ 
  subsets: ['latin'],
  variable: '--font-quicksand',
  display: 'swap',
});

const fredoka = Fredoka({ 
  subsets: ['latin'],
  variable: '--font-fredoka',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '🐱 Purrfect Cat Breeds Gallery - Discover Adorable Felines',
  description: '🐾 Explore the most adorable cat breeds from around the world! Discover their unique personalities, origins, and fall in love with beautiful feline friends.',
  keywords: 'cats, cat breeds, adorable cats, feline gallery, pet photos, cute cats, cat lovers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${quicksand.variable} ${fredoka.variable} font-sans`}>{children}</body>
    </html>
  );
}