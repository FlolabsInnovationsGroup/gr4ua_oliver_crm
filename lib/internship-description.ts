export type ParsedInternshipContent = {
  overview: string[];
  responsibilities: string[];
  qualifications: string[];
  whyJoinUs: string[];
};

export type ContentBlock =
  | { type: "subsection"; text: string }
  | { type: "labeled"; title: string; body: string }
  | { type: "paragraph"; text: string };

const normalizeText = (value: string) => value.replace(/\r/g, "").replace(/\u00A0/g, " ").trim();

const cleanItem = (value: string) =>
  normalizeText(value)
    .replace(/^[-\u2022\u25CF\u25A0\u25AA\u25E6]+\s*/, "")
    .trim();

const isOverviewHeading = (value: string) => /^overview$/i.test(value);
const isResponsibilitiesHeading = (value: string) => /^key responsibilities$/i.test(value);
const isQualificationsHeading = (value: string) =>
  /^qualifications and skills$/i.test(value) || /^qualifications\s*&\s*skills$/i.test(value);
const isWhyJoinUsHeading = (value: string) => /^why join us\??$/i.test(value);

/**
 * Parses a single Strapi long-text field into sections, using blank-line blocks
 * and known section headings (same convention as Bootcamp University internships).
 */
export function parseInternshipContent(raw?: string): ParsedInternshipContent {
  const result: ParsedInternshipContent = {
    overview: [],
    responsibilities: [],
    qualifications: [],
    whyJoinUs: [],
  };

  if (!raw) return result;

  const blocks = raw
    .split(/\n\s*\n+/)
    .map(normalizeText)
    .filter(Boolean);

  let currentSection: keyof ParsedInternshipContent = "overview";

  for (const block of blocks) {
    if (isOverviewHeading(block)) {
      currentSection = "overview";
      continue;
    }

    if (isResponsibilitiesHeading(block)) {
      currentSection = "responsibilities";
      continue;
    }

    if (isQualificationsHeading(block)) {
      currentSection = "qualifications";
      continue;
    }

    if (isWhyJoinUsHeading(block)) {
      currentSection = "whyJoinUs";
      continue;
    }

    result[currentSection].push(cleanItem(block));
  }

  return result;
}

export function splitLabeledItem(item: string) {
  const cleaned = cleanItem(item);
  const match = cleaned.match(/^([^:]+):\s*(.+)$/);

  if (!match) {
    return {
      title: "",
      body: cleaned,
    };
  }

  return {
    title: `${match[1].trim()}:`,
    body: match[2].trim(),
  };
}

/** @deprecated Use splitLabeledItem */
export function splitWhyJoinItem(item: string) {
  const entry = splitLabeledItem(item);
  return {
    title: entry.title,
    description: entry.body,
  };
}

function isStandaloneTitle(text: string): boolean {
  const cleaned = cleanItem(text);
  if (!cleaned.endsWith(":")) return false;
  return !/^[^:]+:\s+\S/.test(cleaned);
}

function isMajorSubsectionTitle(text: string): boolean {
  const withoutColon = cleanItem(text).replace(/:$/, "");
  return /^(what|why|how|who|where|when)\b/i.test(withoutColon) || /\?$/.test(withoutColon);
}

/** Turns blank-line blocks into subsection headings, labeled items, and body paragraphs. */
export function enrichContentBlocks(items: string[]): ContentBlock[] {
  const result: ContentBlock[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const labeled = splitLabeledItem(item);

    if (labeled.title && labeled.body) {
      result.push({ type: "labeled", title: labeled.title, body: labeled.body });
      continue;
    }

    if (isStandaloneTitle(item)) {
      const title = cleanItem(item);
      const next = items[i + 1];

      if (next) {
        const nextLabeled = splitLabeledItem(next);
        if (!isStandaloneTitle(next) && !nextLabeled.title && nextLabeled.body) {
          result.push({ type: "labeled", title, body: nextLabeled.body });
          i += 1;
          continue;
        }
      }

      if (isMajorSubsectionTitle(title)) {
        result.push({ type: "subsection", text: title });
      } else {
        result.push({ type: "labeled", title, body: "" });
      }
      continue;
    }

    result.push({ type: "paragraph", text: cleanItem(item) });
  }

  return result;
}

export function isParsedInternshipDescriptionEmpty(parsed: ParsedInternshipContent): boolean {
  return (
    parsed.overview.length === 0 &&
    parsed.responsibilities.length === 0 &&
    parsed.qualifications.length === 0 &&
    parsed.whyJoinUs.length === 0
  );
}
