import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "THE BENGAL MEDICAL CODING TRAINING ACADEMY | Best Medical Coding Training in Kolkata",
  description:
    "The Bengal Medical Coding Training Academy offers professional medical coding training with ICD-10-CM, CPT, HCPCS coding, placement assistance, and certification support. Join 500+ successful students.",
  keywords: [
    "Medical Coding Training",
    "ICD-10-CM Training",
    "CPT Coding",
    "HCPCS Coding",
    "Medical Coding Academy",
    "Medical Coding Course Kolkata",
    "Placement Assistance",
    "Medical Coding Certification",
    "Healthcare Career",
    "Bengal Medical Coding",
    "CPC Certification",
    "Medical Coder Training",
    "Healthcare IT Training",
    "RCM Training",
  ],
  authors: [{ name: "The Bengal Medical Coding Training Academy" }],
  creator: "The Bengal Medical Coding Training Academy",
  publisher: "The Bengal Medical Coding Training Academy",
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
    title: "The Bengal Medical Coding Training Academy",
    description:
      "Professional medical coding training with expert faculty, placement assistance, and certification support. 500+ students trained, 100+ placements.",
    type: "website",
    locale: "en_IN",
    siteName: "The Bengal Medical Coding Training Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Bengal Medical Coding Training Academy",
    description:
      "Professional medical coding training with expert faculty, placement assistance, and certification support.",
  },
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "The Bengal Medical Coding Training Academy",
  description:
    "Eastern India's premier medical coding training academy offering ICD-10-CM, CPT, HCPCS coding courses with placement assistance and certification support.",
  url: "https://bengalmedicalcoding.com",
  telephone: "+919831239669",
  email: "tbmedicalcodingacademy@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Baguihati, Near 44 Bus Stand, Kolkata",
    addressLocality: "Kolkata",
    addressRegion: "West Bengal",
    postalCode: "700091",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 22.58,
    longitude: 88.4318,
  },
  foundingDate: "2015",
  sameAs: [
    "https://www.facebook.com/tbmediacalcoding",
    "https://www.instagram.com/tbmedicalcodingacademy",
    "https://www.linkedin.com/in/the-bengal-medical-coding-training-academy-582246412/",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Medical Coding Courses",
    itemListElement: [
      {
        "@type": "Course",
        name: "Medical Coding Professional Course",
        description:
          "Comprehensive medical coding training covering ICD-10-CM, CPT, HCPCS coding with certification support and placement assistance.",
        provider: {
          "@type": "Organization",
          name: "The Bengal Medical Coding Training Academy",
        },
        coursePrerequisites: "Graduation in Life Sciences, Nursing, Pharmacy, or related fields",
        educationalLevel: "Professional Certification",
        offers: {
          "@type": "Offer",
          category: "Paid",
          availability: "https://schema.org/InStock",
        },
      },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "150",
    bestRating: "5",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="w-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${geistMono.variable} ${cormorant.variable} antialiased bg-background text-foreground overflow-x-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
