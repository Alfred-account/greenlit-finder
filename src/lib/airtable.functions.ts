import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { SAMPLE_OPPORTUNITIES, type Opportunity } from "./opportunities";

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

function mapRecord(rec: { id: string; fields: Fields }): Opportunity {
  const f = rec.fields;
  const rawSteps = f.Steps;
  const steps = Array.isArray(rawSteps)
    ? rawSteps.map((s) => String(s))
    : str(rawSteps)
        .split("\n")
        .map((s) => s.replace(/^[-*\d.\s]+/, "").trim())
        .filter(Boolean);

  return {
    id: rec.id,
    title: str(f.Title, "Без названия"),
    sphere: str(f.Sphere ?? f.Profession, "Other"),
    grade: str(f.Grade, "Undergrad"),
    cost: str(f.Cost) === "Paid" ? "Paid" : "Free",
    price: str(f.Price ?? f.Cost_Amount) || undefined,
    format: str(f.Format) === "Team-based" ? "Team-based" : "Individual",
    deadline: str(f.Deadline),
    snippet: str(f.Snippet) || str(f.Description).slice(0, 140),
    description: str(f.Description),
    steps,
    url: str(f.URL ?? f.Website),
  };
}

export const fetchOpportunities = createServerFn({ method: "GET" }).handler(async (): Promise<{
  items: Opportunity[];
  source: "airtable" | "sample";
  error?: string;
}> => {
  const config = getConfig();
  if (!config) {
    return {
      items: SAMPLE_OPPORTUNITIES,
      source: "sample",
      error: "Airtable не настроен: отсутствуют переменные окружения AIRTABLE_API_KEY и/или AIRTABLE_BASE_ID.",
    };
  }

  const endpoint = `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.table)}`;

  async function request(withFilter: boolean) {
    const url = new URL(endpoint);
    if (withFilter) url.searchParams.set("filterByFormula", "{Published}");
    url.searchParams.set("pageSize", "100");
    const res = await fetch(url, { headers: { Authorization: `Bearer ${config!.apiKey}` } });
    return { res, url: url.toString() };
  }

  try {
    let { res, url } = await request(true);
    // 422 usually means the {Published} field does not exist in this table — retry unfiltered.
    if (res.status === 422) {
      const first = await res.text();
      console.error(`[airtable] Filtered request failed [422] ${url}: ${first} — retrying without filterByFormula`);
      ({ res, url } = await request(false));
    }

    if (!res.ok) {
      const body = await res.text();
      const message = `[airtable] Fetch failed [${res.status} ${res.statusText}] ${url} (table="${config.table}", base="${config.baseId}"): ${body}`;
      console.error(message);
      return { items: SAMPLE_OPPORTUNITIES, source: "sample", error: message };
    }

    const data = (await res.json()) as { records?: { id: string; fields: Fields }[] };
    const records = data.records ?? [];
    console.log(`[airtable] Loaded ${records.length} records from table "${config.table}"`);
    return { items: records.map(mapRecord), source: "airtable" };
  } catch (e) {
    const message = `[airtable] Network error: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`;
    console.error(message);
    return { items: SAMPLE_OPPORTUNITIES, source: "sample", error: message };
  }
});

const submissionSchema = z.object({
  contactName: z.string().trim().min(1).max(100),
  contactInfo: z.string().trim().min(3).max(200),
  title: z.string().trim().min(1).max(200),
  sphere: z.string().trim().min(1).max(100),
  grade: z.string().trim().min(1).max(50),
  cost: z.enum(["Free", "Paid"]),
  price: z.string().trim().max(100).optional(),
  format: z.enum(["Individual", "Team-based"]),
  url: z.string().trim().url().max(500),
  description: z.string().trim().min(10).max(4000),
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
              Grade: data.grade,
              Cost: data.cost,
              Price: data.cost === "Paid" ? (data.price ?? "") : "",
              Format: data.format,
              URL: data.url,
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
