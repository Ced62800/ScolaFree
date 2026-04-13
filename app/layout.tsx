import Navbar from "@/components/Navbar";
import RegisterSW from "@/components/RegisterSW";
import ScolouChat from "@/components/ScolouChat";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ScolaFree",
  description: "L'excellence scolaire, accessible à tous — du CP à la 3ème",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00b4c8" />
        <meta name="application-name" content="ScolaFree" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="ScolaFree" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <link rel="icon" href="/icons/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Navbar />
        {children}
        <ScolouChat />
        <RegisterSW />
      </body>
    </html>
  );
}
