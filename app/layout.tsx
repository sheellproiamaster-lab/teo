import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Teo – IA para Famílias com Filhos Especiais",
  description:
    "Teo é a inteligência artificial criada para acolher, orientar, apoiar e dar soluções para famílias com filhos especiais.",
  keywords: ["autismo", "TEA", "inteligência artificial", "famílias especiais", "inclusão"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
