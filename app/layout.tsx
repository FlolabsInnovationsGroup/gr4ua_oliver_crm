import type { Metadata } from "next";
import { Barlow_Condensed, Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BrandProvider } from "@/components/brand-provider";
import { NavigationLoadingProvider } from "@/components/navigation-loading";
import { getServerBrand } from "@/lib/branding";
import { getSessionUser, markSessionUserVisited } from "@/lib/application-store";
import Script from "next/script";
import { siteMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  ...siteMetadata,
  verification: {
    google: "q7Iz4hswuM51RriyDBt8nxz3kLPZcUDl5vvsm-k6IYg",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await getServerBrand();
  const viewer = await getSessionUser();
  if (viewer) {
    await markSessionUserVisited(viewer).catch(() => {});
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <Script id="gtm" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KL5K4PTR');` }} />
        <Script id="heap" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `window.heapReadyCb=window.heapReadyCb||[],window.heap=window.heap||[],heap.load=function(e,t){window.heap.envId=e,window.heap.clientConfig=t=t||{};var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src="https://cdn.us.heap-api.com/config/"+e+"/heap_config.js";var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(a,r)};heap.load("1179613009");` }} />
        <Script id="mixpanel-lib" strategy="afterInteractive" src="https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js" />
        <Script id="mixpanel-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `window.mixpanel=window.mixpanel||[];mixpanel.init("0c148ce055d32e1a5780196cb8f3721a",{autocapture:true,record_sessions_percent:100});` }} />
        <Script id="ga-src" strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-N505KSHR9D" />
        <Script id="ga-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-N505KSHR9D');` }} />
      </head>
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${barlowCondensed.variable} font-sans antialiased`}>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KL5K4PTR" height="0" width="0" style={{ display: "none", visibility: "hidden" }} /></noscript>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <NavigationLoadingProvider>
            <BrandProvider initialBrand={brand}>
              <SiteHeader viewer={viewer ? { firstName: viewer.firstName, email: viewer.email, role: viewer.role, hrBinaryRole: viewer.hrBinaryRole, profilePictureUrl: viewer.profilePictureUrl } : null} />
              <main id="content" className="min-h-screen">
                {children}
              </main>
              <SiteFooter />
            </BrandProvider>
          </NavigationLoadingProvider>
        </ThemeProvider>
        <Script id="hubspot-forms" src="//js.hsforms.net/forms/embed/v2.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
