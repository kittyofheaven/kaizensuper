import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RTB Connect Admin",
  description:
    "Admin dashboard for RTB Connect — manage users and facility bookings with the documented API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} antialiased text-foreground`}
      >
        <Providers>
          <div className="min-h-screen">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
