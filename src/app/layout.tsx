import type { Metadata } from "next";
import { Inter, Outfit, Playfair_Display } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tinta y Café | Cafetería, Librería & Juegos en Durango",
  description: "Un refugio para la mente en Durango. Café de especialidad, librería curada y juegos de mesa.",
  manifest: "/manifest.json",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={`${inter.variable} ${outfit.variable} ${playfair.variable} antialiased font-sans bg-[#FFF8EF] text-[#3B1F0B]`}>
          {children}
          <Toaster position="bottom-right" theme="light" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
