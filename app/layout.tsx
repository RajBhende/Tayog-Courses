import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tayog Courses",
  description: "Educational platform for teachers and students",
  icons: {
    icon: [
      { url: "/logo/tayog.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logo/tayog.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo/tayog.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
