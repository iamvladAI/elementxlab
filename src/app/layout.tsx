import type { Metadata } from "next";
import { Golos_Text } from "next/font/google";
import "./globals.css";

const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Element X Lab",
  description: "Ваші ідеї стануть реальністю",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      className={`${golos.variable} h-full antialiased`}
    >
      <head>
        <link rel="preload" as="image" href="/0005.jpg" fetchPriority="high" />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
