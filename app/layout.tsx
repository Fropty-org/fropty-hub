import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://fropty.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fropty Apps — Seu app sob medida",
    template: "%s | Fropty Apps",
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
  authors: [{ name: "Fropty Apps", url: siteUrl }],
  creator: "Fropty Apps",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Fropty Apps",
    title: "Fropty Apps — Seu app sob medida",
    description:
      "Transforme sua ideia em um app de verdade. Prévia gratuita, app completo a partir de R$499 e manutenção mensal com tokens de suporte.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fropty Apps — Seu app sob medida",
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
      name: "Fropty Apps",
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
      name: "Fropty Apps",
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "pt-BR",
    },
    {
      "@type": "Product",
      name: "App sob medida — Fropty Apps",
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
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className={`${inter.variable} ${plusJakarta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
