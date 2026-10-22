import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
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
import "./handmade-details.css";

const bodyFont = localFont({
  src: "./fonts/dm-sans-latin.woff2",
  variable: "--portfolio-sans",
  weight: "400 700",
  display: "swap",
  fallback: ["Arial"],
});
const editorialFont = localFont({
  src: [
    {
      path: "./fonts/fraunces-latin.woff2",
      style: "normal",
      weight: "400 700",
    },
    {
      path: "./fonts/fraunces-italic-latin.woff2",
      style: "italic",
      weight: "400 600",
    },
  ],
  variable: "--portfolio-serif",
  display: "swap",
  fallback: ["Georgia"],
});

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
    <html
      lang="en"
      className={`${bodyFont.variable} ${editorialFont.variable}`}
      suppressHydrationWarning
    >
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
