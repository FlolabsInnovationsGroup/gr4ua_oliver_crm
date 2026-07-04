import Link from "next/link";
import {
  projectPanelBodyClass,
  projectPanelHeadingClass,
  projectPanelShellClass,
} from "@/components/project-panel";
import type { Internship } from "@/lib/strapi";
import { noWidow } from "@/lib/typography";

const cardShellGridClass = `group flex h-full flex-col ${projectPanelShellClass} px-4 py-4 transition-[border-color,background-color,box-shadow] duration-200 hover:border-primary/40 hover:bg-card/72 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50 dark:hover:border-white/40 dark:hover:bg-[#081e32]/96 dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:focus-visible:outline-white/50 sm:px-5 sm:py-5`;

const metaClass =
  "text-xs font-normal text-muted dark:text-white/70 [font-family:var(--font-inter),Arial,Helvetica,sans-serif]";

const statusOpenClass =
  "rounded-full border border-green-500/35 bg-green-500/10 px-2 py-1 text-[11px] font-medium text-green-700 dark:border-green-400/40 dark:bg-green-500/15 dark:text-green-300";

const statusClosedClass =
  "rounded-full border border-rose-500/35 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-300";

const statusPendingClass =
  "rounded-full border border-primary/35 bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary dark:border-[#4d8fd4]/50 dark:bg-[#00349b]/40 dark:text-[#c5daf5]";

const viewRoleCueClass =
  "inline-flex min-h-9 w-full items-center justify-center border border-[#00349b] bg-[#00349b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-200 group-hover:border-[#002a7a] group-hover:bg-[#002a7a]";

function statusBadgeClass(status: string) {
  if (status === "Open") return statusOpenClass;
  if (status === "Closed" || status === "Filled") return statusClosedClass;
  return statusPendingClass;
}

type InternshipCardProps = {
  internship: Internship & { title: string; slug: string };
};

export function InternshipCard({ internship }: InternshipCardProps) {
  const metaParts = [internship.location, internship.company].filter(Boolean);
  const href = `/internships/${internship.slug}`;

  return (
    <Link
      href={href}
      aria-label={`View ${internship.title}`}
      className={`${cardShellGridClass} w-full min-h-[11rem] sm:min-h-[12rem]`}
    >
      <h3 className={projectPanelHeadingClass}>
        <span className="line-clamp-3">{internship.title}</span>
      </h3>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className={statusBadgeClass(internship.status)}>{internship.status}</span>
        {metaParts.length > 0 ? (
          <span className={metaClass}>{metaParts.join(" · ")}</span>
        ) : null}
      </div>

      {internship.summary ? (
        <p className={`mt-2.5 min-w-0 ${projectPanelBodyClass}`}>
          <span className="line-clamp-2">{noWidow(internship.summary)}</span>
        </p>
      ) : null}

      <span className={`${viewRoleCueClass} mt-auto pt-4`}>
        <span>View role</span>
        <span
          aria-hidden
          className="ml-2 translate-y-px text-sm font-normal normal-case tracking-normal"
        >
          →
        </span>
      </span>
    </Link>
  );
}
