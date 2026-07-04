import { Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const footerLinkClass =
  "text-[15px] text-foreground transition-colors hover:text-primary";

const columnHeadingClass =
  "text-[13px] font-bold uppercase tracking-[0.2em] text-foreground";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

function FooterAnchor({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  if (external) {
    return (
      <a
        href={href}
        className={footerLinkClass}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </a>
    );
  }

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={footerLinkClass}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} className={footerLinkClass}>
      {label}
    </a>
  );
}

function FooterLinkList({ links }: { links: FooterLink[] }) {
  return (
    <ul className="flex flex-col gap-3.5">
      {links.map((link) => (
        <li key={link.label}>
          <FooterAnchor {...link} />
        </li>
      ))}
    </ul>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <p className={columnHeadingClass}>{title}</p>
      <div className="mt-4">
        <FooterLinkList links={links} />
      </div>
    </div>
  );
}

function FooterAccordion({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <details className="group border-b border-border pb-5 dark:border-white/10">
      <summary
        className={`${columnHeadingClass} flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden`}
      >
        {title}
        <span
          className="text-[11px] transition-transform duration-200 group-open:rotate-90"
          aria-hidden
        >
          ▸
        </span>
      </summary>
      <div className="mt-4">
        <FooterLinkList links={links} />
      </div>
    </details>
  );
}

function NewsletterSection() {
  const inputId = "footer-newsletter-email";

  return (
    <div>
      <p className={columnHeadingClass}>Newsletter</p>
      <p className="mt-3 text-[13px] text-muted">
        Receive the newest FloLabs updates at:
      </p>
      <form
        className="mt-4 flex w-full max-w-[340px] items-center bg-[#D1D1D1] p-1"
        action="#"
      >
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email..."
          className="min-h-10 flex-1 bg-transparent px-4 text-[15px] text-gray-800 outline-none placeholder:text-gray-600"
        />
        <button
          type="submit"
          className="flex h-10 w-10 shrink-0 items-center justify-center bg-black text-white transition-colors hover:bg-primary"
          aria-label="Subscribe to newsletter"
        >
          <Send className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </form>
    </div>
  );
}

function SocialMediaSection() {
  return (
    <div>
      <p className={columnHeadingClass}>Social media</p>
      <div className="mt-4 flex items-center gap-4">
        <a
          href="https://www.youtube.com/@FloLabsInnovation"
          className="inline-flex text-foreground transition-colors hover:text-primary"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="FloLabs on YouTube"
        >
          <YouTubeIcon />
        </a>
        <a
          href="https://www.linkedin.com/company/flolabs-innovation/"
          className="inline-flex text-foreground transition-colors hover:text-primary"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="FloLabs on LinkedIn"
        >
          <LinkedInIcon />
        </a>
        <a
          href="https://www.instagram.com/flolabsinnovations/"
          className="inline-flex text-foreground transition-colors hover:text-primary"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="FloLabs on Instagram"
        >
          <InstagramIcon />
        </a>
        <a
          href="https://www.tiktok.com/@flomadlabs"
          className="inline-flex text-foreground transition-colors hover:text-primary"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="FloLabs on TikTok"
        >
          <TikTokIcon />
        </a>
        <a
          href="https://www.reddit.com/user/FloLabs_Innovations/"
          className="inline-flex text-foreground transition-colors hover:text-primary"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="FloLabs on Reddit"
        >
          <RedditIcon />
        </a>
      </div>
    </div>
  );
}

const navigationLinks: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Blogs", href: "/blogs" },
  { label: "Internships", href: "/internships" },
];

const projectLinks: FooterLink[] = [
  {
    label: "Athletic Performance Intelligence",
    href: "https://www.athleticperformanceintelligence.com/",
    external: true,
  },
  {
    label: "CAIPO",
    href: "https://www.caipo.ai/",
    external: true,
  },
  {
    label: "Connecting the Dots",
    href: "https://www.youtube.com/@flolabsinnovation",
    external: true,
  },
  {
    label: "Cosmos Intelligence",
    href: "http://cosmosintelligence.org/",
    external: true,
  },
  {
    label: "Flo Travel",
    href: "https://www.flomadtravel.com/",
    external: true,
  },
  {
    label: "FloBrain",
    href: "https://www.flobrain.ai/",
    external: true,
  },
  {
    label: "FloLabs Innovations Group",
    href: "https://www.flolabsinnovations.com/",
    external: true,
  },
  {
    label: "FloLabs International",
    href: "https://www.flolabs.international/",
    external: true,
  },
  {
    label: "FloStudios",
    href: "https://www.flostudios.ai/",
    external: true,
  },
  {
    label: "Hephaestus International",
    href: "https://hephaestus.international/",
    external: true,
  },
  {
    label: "Innovation Bootcamp University",
    href: "https://www.bootcampuniversity.org/",
    external: true,
  },
  {
    label: "MoodChanger",
    href: "https://www.moodchanger.ai/",
    external: true,
  },
  {
    label: "Legal & Ethics Ventures Institute",
    href: "https://www.legalethicsventuresinstitute.com/",
    external: true,
  },
  {
    label: "RoboCollective",
    href: "https://www.robocollective.ai/",
    external: true,
  },
  {
    label: "Space Ventures Institute",
    href: "https://www.spaceventuresinstitute.com/",
    external: true,
  },
  {
    label: "TARRL",
    href: "https://tarrl.org/",
    external: true,
  },
];

const companyLinks: FooterLink[] = [
  { label: "Careers", href: "/internships" },
  { label: "Contact Us", href: "/internships" },
  {
    label: "Merch",
    href: "https://flolabsrd.notion.site/merch-background",
    external: true,
  },
];

function YouTubeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="currentColor"
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.5V8.5l6.3 3.5-6.3 3.5Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="currentColor"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="currentColor"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.055 1.805.249 2.227.415.56.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 0 1-.896 1.382 3.744 3.744 0 0 1-1.382.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 0 1-1.379-.899 3.644 3.644 0 0 1-.9-1.381c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.359-.94.945-1.4.9-1.379a3.706 3.706 0 0 1 1.379-.9c.42-.165 1.051-.36 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.905A5.932 5.932 0 0 0 6.063 12 5.932 5.932 0 0 0 12 17.938 5.932 5.932 0 0 0 17.938 12 5.932 5.932 0 0 0 12 6.068zm0 9.79A3.858 3.858 0 0 1 8.142 12 3.858 3.858 0 0 1 12 8.142 3.858 3.858 0 0 1 15.858 12 3.858 3.858 0 0 1 12 15.858zm7.564-10.049a1.386 1.386 0 1 1-2.771 0 1.386 1.386 0 0 1 2.771 0z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="currentColor"
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="currentColor"
    >
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full border-t border-border bg-background py-16 text-foreground sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.7fr)_minmax(0,0.95fr)_minmax(0,0.7fr)] lg:gap-10 xl:gap-14">
          {/* Column 1: brand, description, newsletter, social */}
          <div className="flex flex-col gap-8 lg:col-span-1">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-3 transition-opacity hover:opacity-90"
              >
                <Image
                  src="/flolabs-logo.svg"
                  alt="FloLabs International logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0"
                />
                <span className="text-base font-bold text-foreground sm:text-lg">
                  FloLabs International
                </span>
              </Link>
              <p className="mt-2 text-[13px] text-muted">
                | a FloLabs Innovations Group project
              </p>
              <p className="mt-4 max-w-md text-pretty text-[15px] leading-relaxed text-foreground">
                FloLabs International is the global platform showcasing our
                mission, active projects, and collaboration opportunities across
                AI and robotics. We connect curious builders to experiential
                learning and real venture execution through the FloLabs
                portfolio.
              </p>
            </div>

            <NewsletterSection />
            <SocialMediaSection />
          </div>

          {/* Desktop columns 2–4 */}
          <div className="hidden lg:block">
            <FooterColumn title="Navigation" links={navigationLinks} />
          </div>
          <div className="hidden lg:block">
            <FooterColumn title="Projects" links={projectLinks} />
          </div>
          <div className="hidden lg:block">
            <FooterColumn title="Company" links={companyLinks} />
          </div>
        </div>

        {/* Mobile: navigation, projects, company accordions */}
        <div className="mt-10 flex flex-col gap-1 lg:hidden">
          <FooterAccordion title="Navigation" links={navigationLinks} />
          <FooterAccordion title="Projects" links={projectLinks} />
          <FooterAccordion title="Company" links={companyLinks} />
        </div>

        <div className="mt-14 border-t border-border pt-8 sm:mt-16 dark:border-white/10">
          <p className="text-center text-[13px] font-light tracking-[0.25em] text-muted dark:text-foreground">
            Live Long and Prosper
          </p>
        </div>
      </div>
    </footer>
  );
}
