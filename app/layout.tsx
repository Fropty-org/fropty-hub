import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const siteUrl = "https://fropty.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fropty — Seu app sob medida",
    template: "%s | Fropty",
  },
  description:
    "Transforme sua ideia em um app de verdade. Prévia gratuita, app completo a partir de R$499 e manutenção mensal com tokens de suporte.",
  keywords: [
    "desenvolvimento de app",
    "app sob medida",
    "app personalizado",
    "criação de aplicativo",
    "app mobile",
    "fropty",
  ],
  authors: [{ name: "Fropty", url: siteUrl }],
  creator: "Fropty",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Fropty",
    title: "Fropty — Seu app sob medida",
    description:
      "Transforme sua ideia em um app de verdade. Prévia gratuita, app completo a partir de R$499 e manutenção mensal com tokens de suporte.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Fropty" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fropty — Seu app sob medida",
    description:
      "Transforme sua ideia em um app de verdade. Prévia gratuita, app completo a partir de R$499.",
    creator: "@froptyapps",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: siteUrl },
};

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Fropty",
      url: siteUrl,
      description:
        "Serviço de desenvolvimento de apps sob medida. Prévia gratuita, app completo a partir de R$499 e manutenção mensal com tokens de suporte.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: "Portuguese",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Fropty",
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "pt-BR",
    },
    {
      "@type": "Product",
      name: "App sob medida — Fropty",
      description: "Desenvolvimento de aplicativo personalizado com prévia gratuita.",
      brand: { "@id": `${siteUrl}/#organization` },
      offers: {
        "@type": "Offer",
        priceCurrency: "BRL",
        price: "499",
        priceSpecification: { "@type": "UnitPriceSpecification", price: "499", priceCurrency: "BRL" },
        availability: "https://schema.org/InStock",
        url: siteUrl,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" type="image/png" href="/logo-icon.png" />
        <link rel="apple-touch-icon" href="/logo-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Fropty Hub" />
        <meta name="theme-color" content="#040316" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
        {/* Theme init — runs before paint to avoid flash (padrão ecossistema Fropty) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('fropty-theme')||localStorage.getItem('theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');})();`,
          }}
        />
      </head>
      <body className={`${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
