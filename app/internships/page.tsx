import { HomeScene } from "@/components/home-scene";
import { InternshipCard } from "@/components/internship-card";
import { projectPanelShellClass } from "@/components/project-panel";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getAllInternships, type Internship } from "@/lib/strapi";

export const revalidate = 60;

const statusPriority: Record<string, number> = {
  Open: 0,
  "Closing Soon": 1,
  Pending: 2,
  Closed: 3,
  Filled: 3,
};

type SafeInternship = Internship & { title: string; slug: string };

function sortInternships(list: Internship[]): SafeInternship[] {
  return [...list]
    .filter((item): item is SafeInternship => Boolean(item.title?.trim() && item.slug?.trim()))
    .sort((a, b) => {
      const ap = statusPriority[a.status] ?? 99;
      const bp = statusPriority[b.status] ?? 99;
      if (ap !== bp) return ap - bp;
      return a.title.localeCompare(b.title);
    });
}

const emptyStateClass = `${projectPanelShellClass} w-full px-6 py-10 text-center sm:px-8 sm:py-12`;

export default async function InternshipsListPage() {
  const internships = sortInternships(await getAllInternships());
  const openCount = internships.filter((i) => i.status === "Open").length;

  return (
    <HomeScene
      id="internships"
      background="gradient"
      boldHeadline
      headline="Internship Positions"
      description={
        <>
          <p>
            Browse open roles from industry partners, compare what fits your skills, and apply to
            roles that accelerate your tech career.
          </p>
          {internships.length > 0 ? (
            <p className="text-sm sm:text-base">
              {openCount > 0 ? (
                <>
                  <span className="font-semibold text-foreground dark:text-white">{openCount}</span>
                  <span className="text-muted dark:text-white/75">
                    {openCount === 1 ? " role" : " roles"} open now
                    {openCount < internships.length ? (
                      <>
                        {" "}
                        · {internships.length} listing{internships.length === 1 ? "" : "s"} total
                      </>
                    ) : null}
                  </span>
                </>
              ) : (
                <span className="text-muted dark:text-white/75">
                  {internships.length} active listing{internships.length === 1 ? "" : "s"}
                </span>
              )}
            </p>
          ) : null}
        </>
      }
    >
      {internships.length === 0 ? (
        <section className={emptyStateClass} aria-live="polite">
          <p className="text-muted dark:text-white/75">No internships available at the moment.</p>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 md:gap-5" aria-label="Internship listings">
          {internships.map((item) => (
            <ScrollReveal
              key={String(item.id)}
              className="h-full"
              duration={300}
              translateY={6}
              threshold={0.01}
              rootMargin="0px 0px 10% 0px"
            >
              <InternshipCard internship={item} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </HomeScene>
  );
}
