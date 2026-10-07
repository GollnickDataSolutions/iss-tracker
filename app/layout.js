import './globals.css';

export const metadata = {
  title: 'ISS-Live-Tracker',
  description: 'Aktuelle Position der Internationalen Raumstation live auf einer Karte',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
