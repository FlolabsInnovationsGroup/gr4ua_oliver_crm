import { notFound, redirect } from "next/navigation";
import { HomeScene } from "@/components/home-scene";
import { HubSpotForm } from "@/components/hubspot-form";
import {
  InternshipContentBlocks,
  InternshipListItems,
  InternshipSection,
} from "@/components/internship-section-card";
import { ProjectDetailExitLink } from "@/components/project-panel";
import {
  isParsedInternshipDescriptionEmpty,
  parseInternshipContent,
} from "@/lib/internship-description";
import { getInternship } from "@/lib/strapi";
import { noWidow } from "@/lib/typography";

export const revalidate = 60;

const statusOpenClass =
  "rounded-full border border-green-500/35 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700 dark:border-green-400/40 dark:bg-green-500/15 dark:text-green-300";

const statusClosedClass =
  "rounded-full border border-rose-500/35 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-300";

const statusPendingClass =
  "rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary dark:border-[#4d8fd4]/50 dark:bg-[#00349b]/40 dark:text-[#c5daf5]";

const bodyClass =
  "text-pretty text-sm font-normal leading-relaxed text-muted dark:text-white/82 sm:text-base [font-family:var(--font-inter),Arial,Helvetica,sans-serif]";

function statusBadgeClass(status: string) {
  if (status === "Open") return statusOpenClass;
  if (status === "Closed" || status === "Filled") return statusClosedClass;
  return statusPendingClass;
}

export default async function InternshipDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "internships") {
    redirect("/internships");
  }

  const internship = await getInternship(slug);
  if (!internship) {
    notFound();
  }

  const parsed = parseInternshipContent(internship.description);
  const useStructuredBody =
    internship.description && !isParsedInternshipDescriptionEmpty(parsed);

  const metaParts = [internship.company, internship.schedule].filter(Boolean);

  return (
    <HomeScene
      id={`internship-${internship.slug}`}
      background="gradient"
      boldHeadline
      headline={internship.title}
      description={
        <>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className={statusBadgeClass(internship.status)}>{internship.status}</span>
            {internship.location ? (
              <>
                <span
                  className="size-1 shrink-0 rounded-full bg-primary/35 ring-1 ring-muted/25"
                  aria-hidden
                />
                <span className="min-w-0 truncate text-sm text-muted dark:text-white/75">
                  {internship.location}
                </span>
              </>
            ) : null}
          </div>
          {metaParts.length > 0 ? (
            <p className="text-pretty text-sm text-muted dark:text-white/75">
              {noWidow(metaParts.join(" · "))}
            </p>
          ) : null}
          {internship.summary ? <p className="text-pretty">{noWidow(internship.summary)}</p> : null}
        </>
      }
      headerAside={<ProjectDetailExitLink href="/internships" label="Back to internships" />}
      stackedHeaderAside
    >
      <div className="flex w-full flex-col gap-10 text-left md:gap-12">
        {useStructuredBody ? (
          <>
            {parsed.overview.length > 0 ? (
              <InternshipSection title="Overview">
                <InternshipContentBlocks items={parsed.overview} />
              </InternshipSection>
            ) : null}

            {parsed.responsibilities.length > 0 ? (
              <InternshipSection title="Key responsibilities">
                <InternshipListItems items={parsed.responsibilities} />
              </InternshipSection>
            ) : null}

            {parsed.qualifications.length > 0 ? (
              <InternshipSection title="Qualifications and skills">
                <InternshipListItems items={parsed.qualifications} />
              </InternshipSection>
            ) : null}

            {parsed.whyJoinUs.length > 0 ? (
              <InternshipSection title="Why join us?">
                <InternshipContentBlocks items={parsed.whyJoinUs} />
              </InternshipSection>
            ) : null}
          </>
        ) : internship.description ? (
          <section aria-label="Role description">
            <div className={`space-y-4 ${bodyClass}`}>
              {internship.description
                .split(/\n\s*\n+/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>{noWidow(paragraph)}</p>
                ))}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="internship-apply-title">
          <h2
            id="internship-apply-title"
            className="text-xl font-bold text-foreground dark:text-white sm:text-2xl [font-family:var(--font-inter),Arial,Helvetica,sans-serif]"
          >
            Apply for this position
          </h2>
          <p className={`mt-3 ${bodyClass}`}>
            {noWidow("Ready to join the team? Complete the application form below.")}
          </p>

          <div className="mt-6">
            {internship.hubspotFormId ? (
              <HubSpotForm key={internship.slug} formId={internship.hubspotFormId} />
            ) : (
              <p className={bodyClass}>No application form is linked to this role yet.</p>
            )}
          </div>
        </section>
      </div>
    </HomeScene>
  );
}
