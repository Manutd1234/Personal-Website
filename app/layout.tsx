import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./classic-layout.css";
import "./book-carousel.css";
import "./projects-library.css";
import "./profile-builder.css";
import "./life-gallery.css";
import "./skills-classic.css";
import "./career-classic.css";
import "./card-showcase.css";
import "./role-intro.css";
import "./tab-polish.css";
import "./contact-panel.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const metadata: Metadata = {
  metadataBase: new URL("https://manutd1234.github.io"),
  title: "Ian Abiel Wangsa — Systems, AI & things in between",
  description:
    "Computer Science at NUS. Selected projects, engineering experience, quantitative research, and a little life outside the code.",
  alternates: { canonical: `${basePath}/` },
  icons: { icon: `${basePath}/favicon.svg` },
  openGraph: {
    title: "Ian Abiel Wangsa",
    description: "Systems, AI & things in between.",
    type: "website",
    images: [
      {
        url: `${basePath}/images/portfolio/ian-profile-square.webp`,
        width: 960,
        height: 960,
        alt: "Ian Abiel Wangsa",
      },
    ],
  },
};
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#101311" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{const t=localStorage.getItem('ian-theme');document.documentElement.classList.toggle('dark',t?t==='dark':matchMedia('(prefers-color-scheme:dark)').matches)}catch(e){}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
