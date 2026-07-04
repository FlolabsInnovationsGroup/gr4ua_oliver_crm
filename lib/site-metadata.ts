export const SITE_URL = "https://flolabs.international";

export const SITE_NAME = "FloLabs International";

export const SITE_TITLE = "FloLabs International | Innovation in AI & Robotics";

export const SITE_DESCRIPTION =
  "FloLabs Innovations Group is an incubator launching innovative AI and robotics projects with experiential learning programs.";

export const SITE_OG_IMAGE = "/og-image.png";

export const siteMetadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | FloLabs International",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website" as const,
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "FloLabs International — Innovation in AI & Robotics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
};
