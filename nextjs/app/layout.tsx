import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AKGEC Community',
  description: 'Private, PIN-protected campus community.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}