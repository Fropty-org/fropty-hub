import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const siteUrl = "https://hub.fropty.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fropty Hub — Portal do Cliente",
    template: "%s | Fropty Hub",
  },
  description:
    "Tudo conectado. Tudo para você. Acesse chamados, projetos, contratos, financeiro e muito mais no portal oficial da Fropty.",
  keywords: [
    "fropty hub",
    "portal do cliente",
    "suporte fropty",
    "chamados",
    "projetos",
    "fropty",
  ],
  authors: [{ name: "Fropty", url: siteUrl }],
  creator: "Fropty",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Fropty Hub",
    title: "Fropty Hub — Portal do Cliente",
    description:
      "Tudo conectado. Tudo para você. Gerencie chamados, projetos, contratos e financeiro em um só lugar.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Fropty Hub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fropty Hub — Portal do Cliente",
    description:
      "Tudo conectado. Tudo para você. O portal oficial da Fropty.",
    creator: "@froptyapps",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: siteUrl },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    other: [
      { rel: 'manifest', url: '/site.webmanifest' },
    ],
  },
};

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Fropty",
      url: "https://fropty.com",
      sameAs: [siteUrl],
      description:
        "Fropty é um ecossistema de software SaaS que oferece produtos e serviços digitais para empresas, incluindo CRM, financeiro, afiliados, segurança e portal do cliente.",
      contactPoint: {
        "@type": "ContactPoint",
        email: "suporte@fropty.com",
        contactType: "customer service",
        availableLanguage: "Portuguese",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Fropty Hub",
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "pt-BR",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#app`,
      name: "Fropty Hub",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Portal do cliente do ecossistema Fropty. Centralize chamados de suporte, projetos, contratos, financeiro, knowledge base, roadmap e customer success em um único lugar.",
      url: siteUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "BRL",
        description: "Incluído em todos os planos Fropty sem custo adicional.",
        availability: "https://schema.org/InStock",
      },
      featureList: [
        "Service Desk com SLA",
        "Acompanhamento de projetos",
        "Financeiro e contratos",
        "Knowledge Base",
        "Roadmap colaborativo",
        "Customer Success e Health Score",
        "Portal de cliente white-label",
      ],
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Fropty Hub" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
        {/* Theme init — executa antes do paint para evitar flash de cor errada */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var t = localStorage.getItem('fropty-theme') || localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (t === 'dark' || (!t && prefersDark)) {
      document.documentElement.classList.add('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#0d0d12');
    } else {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#F2F2F4');
    }
  } catch(e){}
})();`,
          }}
        />
        <meta name="theme-color" content="#0d0d12" />
      </head>
      <body className={`${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
