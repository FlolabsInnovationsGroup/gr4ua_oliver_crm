// @ts-check

/** @param {{ protocol: "https" | "http"; hostname: string; port?: string }[]} patterns
 *  @param {string | undefined} urlString */
function pushUniqueHostname(patterns, urlString) {
  if (!urlString) return;
  try {
    const u = new URL(urlString);
    const protocol = u.protocol === "http:" ? "http" : "https";
    const entry = { protocol, hostname: u.hostname, ...(u.port ? { port: u.port } : {}) };
    if (!patterns.some((p) => p.hostname === entry.hostname && p.protocol === entry.protocol)) {
      patterns.push(entry);
    }
  } catch {
    /* ignore invalid URL */
  }
}

const remotePatterns = [
  { protocol: "https", hostname: "strapi-production-7ecb.up.railway.app" },
  { protocol: "https", hostname: "res.cloudinary.com" },
  { protocol: "http", hostname: "localhost", port: "1337" },
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "flolabs-chronos-backups.s3.amazonaws.com" },
  { protocol: "https", hostname: "*.s3.amazonaws.com" },
];

pushUniqueHostname(remotePatterns, process.env.NEXT_PUBLIC_STRAPI_URL);
pushUniqueHostname(remotePatterns, process.env.CONTENT_STRAPI_URL);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns },
};

export default nextConfig;
