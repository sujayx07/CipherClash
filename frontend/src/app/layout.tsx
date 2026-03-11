import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CipherClash',
  description: 'Multiplayer code-breaking logic game.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.className} bg-slate-950 text-slate-100 min-h-screen text-shadow-sm`}>
        {children}
      </body>
    </html>
  );
}
