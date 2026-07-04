import type { ReactNode } from "react";
import { enrichContentBlocks, splitLabeledItem } from "@/lib/internship-description";
import { noWidow } from "@/lib/typography";

const bodyClass =
  "text-pretty text-sm font-normal leading-relaxed text-muted dark:text-white/82 sm:text-base [font-family:var(--font-inter),Arial,Helvetica,sans-serif]";

export { bodyClass as internshipBodyClass };

const subsectionTitleClass =
  "text-lg font-bold leading-snug text-foreground dark:text-white sm:text-xl [font-family:var(--font-inter),Arial,Helvetica,sans-serif]";

const itemTitleClass =
  "text-base font-semibold leading-snug text-foreground dark:text-white sm:text-[1.05rem] [font-family:var(--font-inter),Arial,Helvetica,sans-serif]";

type InternshipSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function InternshipSection({ title, children, className }: InternshipSectionProps) {
  return (
    <section className={`text-left ${className ?? ""}`}>
      <h2 className="text-xl font-bold text-foreground dark:text-white sm:text-2xl [font-family:var(--font-inter),Arial,Helvetica,sans-serif]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function InternshipContentBlocks({ items }: { items: string[] }) {
  const blocks = enrichContentBlocks(items);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.type === "subsection") {
          return (
            <h3 key={index} className={`${subsectionTitleClass} ${index > 0 ? "pt-2" : ""}`}>
              {block.text}
            </h3>
          );
        }

        if (block.type === "labeled") {
          return (
            <div key={index} className="space-y-2">
              <p className={itemTitleClass}>{block.title}</p>
              {block.body ? <p className={bodyClass}>{noWidow(block.body)}</p> : null}
            </div>
          );
        }

        return (
          <p key={index} className={bodyClass}>
            {noWidow(block.text)}
          </p>
        );
      })}
    </div>
  );
}

export function InternshipListItems({ items }: { items: string[] }) {
  return (
    <ul className={`list-inside list-disc space-y-3 ${bodyClass}`}>
      {items.map((item, index) => {
        const { title, body } = splitLabeledItem(item);

        if (title && body) {
          return (
            <li key={index}>
              <span className={itemTitleClass}>{title}</span> {noWidow(body)}
            </li>
          );
        }

        return <li key={index}>{noWidow(item)}</li>;
      })}
    </ul>
  );
}

/** @deprecated Use InternshipSection */
export const InternshipSectionCard = InternshipSection;
