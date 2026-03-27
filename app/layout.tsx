import Navbar from "@/components/Navbar";
import ScolouChat from "@/components/ScolouChat";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ScolaFree",
  description: "L'excellence accessible à tous",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Navbar />
        {children}
        <ScolouChat />
      </body>
    </html>
  );
}
