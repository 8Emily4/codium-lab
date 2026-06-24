import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { company } from "@/lib/brand";
import PWARegister from "@/components/PWARegister";
import { ThemeProvider, themeInitScript } from "@/components/theme/ThemeProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://codiumlab.ai.kr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${company.nameKo} | ${company.nameEn}`,
    template: `%s · ${company.nameKo}`,
  },
  description: company.tagline,
  applicationName: company.nameKo,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: company.nameKo,
    title: `${company.nameKo} | ${company.nameEn}`,
    description: company.tagline,
    url: SITE_URL,
    locale: "ko_KR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${company.nameKo} — ${company.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${company.nameKo} | ${company.nameEn}`,
    description: company.tagline,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    other: {
      "naver-site-verification": "52ef2ad74eaf24b5ff77ec661c83792746f39376",
    },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: company.nameKo,
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: company.nameKo,
  alternateName: company.nameEn,
  url: SITE_URL,
  logo: `${SITE_URL}/app-icon-512.png`,
  image: `${SITE_URL}/og-image.png`,
  description: company.description,
  email: company.contactEmail,
  foundingDate: String(company.foundedYear),
  founder: { "@type": "Person", name: company.ceo },
  address: {
    "@type": "PostalAddress",
    addressLocality: company.location,
    addressCountry: "KR",
  },
  knowsAbout: company.rdFields,
  sameAs: company.sns,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: company.nameKo,
  alternateName: company.nameEn,
  description: company.tagline,
  inLanguage: "ko-KR",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

const jsonLdHtml = JSON.stringify([organizationJsonLd, websiteJsonLd]).replace(
  /</g,
  "\\u003c",
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const lang = h.get("x-lang") ?? "ko";

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-white text-zinc-900 dark:bg-black dark:text-zinc-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml }}
        />
        <ThemeProvider>
          {children}
          <PWARegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
