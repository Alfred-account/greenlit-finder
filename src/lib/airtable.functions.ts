import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  SAMPLE_OPPORTUNITIES,
  agesFromGrades,
  normalizeSphere,
  parseAges,
  parseGrades,
  sortGrades,
  type LocalizedContent,
  type Opportunity,
} from "./opportunities";
import { normalizeCity, normalizeCountry } from "./locations";

function getConfig() {
  // Read env INSIDE the handler-call path: serverless runtimes inject env per request.
  const apiKey = process.env.AIRTABLE_API_KEY ?? process.env.VITE_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID ?? process.env.VITE_AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE_NAME ?? process.env.VITE_AIRTABLE_TABLE_NAME ?? "Opportunities";
  const missing: string[] = [];
  if (!apiKey) missing.push("AIRTABLE_API_KEY");
  if (!baseId) missing.push("AIRTABLE_BASE_ID");
  if (missing.length) {
    console.error(`[airtable] Missing environment variables: ${missing.join(", ")}`);
    return null;
  }
  return { apiKey: apiKey!, baseId: baseId!, table };
}

type Fields = Record<string, unknown>;

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function toSteps(raw: unknown): string[] {
  return Array.isArray(raw)
    ? raw.map((s) => String(s))
    : str(raw)
        .split("\n")
        .map((s) => s.replace(/^[-*\d.\s]+/, "").trim())
        .filter(Boolean);
}

/** Reads optional per-language columns: Title_EN, Snippet_KK, Description_EN, Steps_KK … */
function localized(f: Fields, suffix: "EN" | "KK"): LocalizedContent | undefined {
  const title = str(f[`Title_${suffix}`]);
  const snippet = str(f[`Snippet_${suffix}`]);
  const description = str(f[`Description_${suffix}`]);
  const steps = toSteps(f[`Steps_${suffix}`]);
  if (!title && !snippet && !description && steps.length === 0) return undefined;
  return {
    title: title || undefined,
    snippet: snippet || description.slice(0, 140) || undefined,
    description: description || undefined,
    steps: steps.length ? steps : undefined,
  };
}

function mapDelivery(v: unknown): Opportunity["delivery"] {
  const s = str(v).toLowerCase();
  if (/hybrid|гибрид|аралас|смеш/.test(s)) return "Hybrid";
  if (/offline|офлайн|оффлайн|очно|onsite|on-site|офлайн/.test(s)) return "Offline";
  return "Online";
}

function mapRecord(rec: { id: string; fields: Fields }): Opportunity {
  const f = rec.fields;
  const steps = toSteps(f.Steps);
  const en = localized(f, "EN");
  const kk = localized(f, "KK");
  const grades = parseGrades(f.Grade ?? f.Grades);
  const ages = parseAges(f.Age ?? f.Ages ?? f.Age_Range);

  return {
    id: rec.id,
    title: str(f.Title, "Без названия"),
    sphere: normalizeSphere(str(f.Sphere ?? f.Profession ?? f.Field)),
    grades,
    ages: ages.length ? ages : agesFromGrades(grades),
    promoted: Boolean(f.Promoted ?? f.Top ?? f.Featured ?? f.Pinned),
    cost: str(f.Cost) === "Paid" ? "Paid" : "Free",
    price: str(f.Price ?? f.Cost_Amount) || undefined,
    format: str(f.Format) === "Team-based" ? "Team-based" : "Individual",
    delivery: mapDelivery(f.Delivery ?? f.Mode),
    country: normalizeCountry(str(f.Country)) || undefined,
    city: normalizeCity(str(f.City ?? f.Location)) || undefined,
    deadline: str(f.Deadline),
    snippet: str(f.Snippet) || str(f.Description).slice(0, 140),
    description: str(f.Description),
    steps,
    url: str(f.URL ?? f.Website),
    instagram: str(f.Instagram ?? f.Instagram_URL) || undefined,
    registerUrl: str(f.Registration ?? f.Registration_URL ?? f.Register) || undefined,
    i18n: en || kk ? { en, kk } : undefined,
  };
}

function getApiUrl() {
  const base =
    (import.meta.env.VITE_API_URL as string | undefined) ||
    process.env.VITE_API_URL ||
    "https://airtable-sync-worker.nursauletmedeu.workers.dev";
  return `${base.replace(/\/+$/, "")}/api/opportunities`;
}

/** Worker returns flat lowercase keys (title, description_ru, cost…). Map them to the Airtable-style field names mapRecord understands. */
function flatToFields(item: Record<string, unknown>): Fields {
  const f: Fields = {};
  const alias: Record<string, string> = {
    description_ru: "Description",
    snippet_ru: "Snippet",
    steps_ru: "Steps",
    title_ru: "Title",
    url: "URL",
    age_range: "Age_Range",
    instagram_url: "Instagram_URL",
    registration_url: "Registration_URL",
    cost_amount: "Cost_Amount",
  };
  for (const [k, v] of Object.entries(item)) {
    const lk = k.toLowerCase();
    const name =
      alias[lk] ??
      lk
        .split("_")
        .map((p, i) => (i > 0 && (p === "en" || p === "kk") ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1)))
        .join("_");
    if (f[name] === undefined || f[name] === "") f[name] = v;
  }
  return f;
}

export const fetchOpportunities = createServerFn({ method: "GET" }).handler(async (): Promise<{
  items: Opportunity[];
  source: "airtable" | "sample";
  error?: string;
}> => {
  const url = getApiUrl();
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const message = `[worker] Fetch failed [${res.status} ${res.statusText}] ${url}: ${await res.text()}`;
      console.error(message);
      return { items: SAMPLE_OPPORTUNITIES, source: "sample", error: message };
    }
    const data = (await res.json()) as unknown;
    const list = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
    const items = list
      .filter((it) => it && typeof it === "object")
      .filter((it) => it.published === undefined || Boolean(it.published))
      .map((it, i) => mapRecord({ id: String(it.id ?? it.record_id ?? `w${i}`), fields: flatToFields(it) }));
    console.log(`[worker] Loaded ${items.length} records from ${url}`);
    return { items, source: "airtable" };
  } catch (e) {
    const message = `[worker] Network error: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`;
    console.error(message);
    return { items: SAMPLE_OPPORTUNITIES, source: "sample", error: message };
  }
});

const submissionSchema = z.object({
  contactName: z.string().trim().min(1).max(100),
  contactInfo: z.string().trim().min(3).max(200),
  title: z.string().trim().min(1).max(200),
  sphere: z.string().trim().min(1).max(100),
  grades: z.array(z.string().trim().min(1).max(50)).max(12),
  ages: z.array(z.enum(["11-13", "14-15", "16-17", "18+"])).max(4).optional(),
  cost: z.enum(["Free", "Paid"]),
  price: z.string().trim().max(100).optional(),
  format: z.enum(["Individual", "Team-based"]),
  delivery: z.enum(["Online", "Offline", "Hybrid"]),
  country: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  deadline: z.string().trim().max(20).optional(),
  url: z.string().trim().max(500).optional(),
  instagram: z.string().trim().url().max(500),
  registerUrl: z.string().trim().max(500).optional(),
  description: z
    .string()
    .trim()
    .max(4000)
    .refine((v) => v.split(/\s+/).filter(Boolean).length >= 50, {
      message: "Описание должно содержать минимум 50 слов",
    }),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export const submitOpportunity = createServerFn({ method: "POST" })
  .inputValidator((data: SubmissionInput) => submissionSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; stored: boolean }> => {
    const config = getConfig();
    if (!config) {
      console.warn("Airtable is not configured; submission was not persisted.");
      return { ok: true, stored: false };
    }

    const res = await fetch(`https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.table)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              Title: data.title,
              Sphere: data.sphere,
              Grade: sortGrades(data.grades).join(", "),
              Age: (data.ages?.length ? data.ages : agesFromGrades(data.grades)).join(", "),
              Cost: data.cost,
              Price: data.cost === "Paid" ? (data.price ?? "") : "",
              Format: data.format,
              Delivery: data.delivery,
              Country: data.country ?? "",
              City: data.city ?? "",
              Deadline: data.deadline ?? "",
              URL: data.url ?? "",
              Instagram: data.instagram ?? "",
              Registration: data.registerUrl ?? "",
              Description: data.description,
              ContactName: data.contactName,
              ContactInfo: data.contactInfo,
              Published: false,
            },
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(
        `[airtable] Submit failed [${res.status} ${res.statusText}] table="${config.table}" base="${config.baseId}": ${body}`,
      );
      throw new Error(`Не удалось отправить заявку [${res.status}]: ${body}`);
    }

    return { ok: true, stored: true };
  });
