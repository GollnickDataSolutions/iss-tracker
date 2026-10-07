import './globals.css';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { themeInitScript } from './theme';

const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata = {
  title: 'ISS-Live-Tracker',
  description: 'Aktuelle Position der Internationalen Raumstation live auf einer Karte',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={`${mono.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
