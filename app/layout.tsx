import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { jaJP } from "@clerk/localizations";
import Header from "@/components/ui/Header";
import ScrollRestoration from "@/components/ui/ScrollRestoration";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ployee.net"),
  title: "AI面接練習プラットフォーム「プロイー」| 24時間対応で内定率UP",
  description:
    "AI面接官との実践練習で面接突破率を5倍向上。リアルタイム分析・個別フィードバック付き。就活生95%が「自信がついた」と評価。無料体験3回まで。",
  keywords: [
    "AI面接練習",
    "面接対策 AI",
    "オンライン面接練習",
    "面接シミュレーション",
    "就活 面接対策",
    "転職 面接練習",
    "面接 フィードバック",
    "面接スキル向上",
    "面接不安解消",
    "24時間面接練習",
    "リアルタイム面接分析",
    "個別面接指導",
  ],
  authors: [{ name: "プロイー開発チーム" }],
  creator: "プロイー",
  publisher: "プロイー",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://www.ployee.net",
    title: "AI面接練習プラットフォーム「プロイー」| 24時間対応",
    description:
      "AI面接官との実践練習で面接突破率を5倍向上。リアルタイム分析・個別フィードバック付き。",
    siteName: "プロイー",
    images: [
      {
        url: "https://www.ployee.net/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "プロイー - AI面接練習プラットフォーム",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI面接練習プラットフォーム「プロイー」| 24時間対応",
    description:
      "AI面接官との実践練習で面接突破率を5倍向上。リアルタイム分析・個別フィードバック付き。",
    images: ["https://www.ployee.net/og-image.jpg"],
    creator: "@ployee_jp",
  },
  alternates: {
    canonical: "https://www.ployee.net",
    languages: {
      "ja-JP": "https://www.ployee.net",
      "x-default": "https://www.ployee.net",
    },
  },
  verification: {
    google: "XJ-vAmABbw4EGfp06PisjYYfdO8v6yxpo-BAIZv-OjM",
  },
  other: {
    "google-site-verification": "XJ-vAmABbw4EGfp06PisjYYfdO8v6yxpo-BAIZv-OjM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={jaJP}
      appearance={{
        variables: {
          colorPrimary: "#004526",
        },
        elements: {
          modalContent: {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            margin: "0",
            animation: "none",
            transition: "none",
          },
          modalBackdrop: {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "9999",
            animation: "none",
            transition: "none",
          },
        },
        signIn: {
          variables: {
            colorPrimary: "#004526",
          },
          elements: {
            modalContent: {
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              margin: "0",
              animation: "none",
              transition: "none",
            },
            modalCloseButton: {
              display: "block", // Default behavior, will be overridden with CSS for non-closable modals
            },
          },
        },
        signUp: {
          variables: {
            colorPrimary: "#004526",
          },
          elements: {
            modalContent: {
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              margin: "0",
              animation: "none",
              transition: "none",
            },
          },
        },
      }}
    >
      <html lang="ja" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin=""
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="antialiased">
          <ScrollRestoration />
          <Header />
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
