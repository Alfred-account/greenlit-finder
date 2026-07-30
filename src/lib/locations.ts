export const COUNTRIES = ["Kazakhstan", "Kyrgyzstan", "Uzbekistan", "International"] as const;

export type Country = (typeof COUNTRIES)[number];

/** Cities offered as typeahead suggestions. "International" intentionally has none. */
export const CITIES: Record<string, string[]> = {
  Kazakhstan: [
    "Almaty",
    "Astana",
    "Shymkent",
    "Karaganda",
    "Aktobe",
    "Atyrau",
    "Taraz",
    "Pavlodar",
    "Oskemen",
    "Semey",
    "Kostanay",
    "Kyzylorda",
    "Aktau",
    "Turkistan",
    "Oral",
    "Petropavl",
    "Kokshetau",
    "Taldykorgan",
  ],
  Kyrgyzstan: ["Bishkek", "Osh", "Jalal-Abad", "Karakol", "Naryn", "Talas", "Batken"],
  Uzbekistan: ["Tashkent", "Samarkand", "Bukhara", "Namangan", "Andijan", "Fergana", "Nukus", "Urgench"],
  International: [],
};

type Labels = Record<string, string>;

const RU: Labels = {
  Kazakhstan: "Казахстан",
  Kyrgyzstan: "Кыргызстан",
  Uzbekistan: "Узбекистан",
  International: "Международно",
  Almaty: "Алматы",
  Astana: "Астана",
  Shymkent: "Шымкент",
  Karaganda: "Караганда",
  Aktobe: "Актобе",
  Atyrau: "Атырау",
  Taraz: "Тараз",
  Pavlodar: "Павлодар",
  Oskemen: "Усть-Каменогорск",
  Semey: "Семей",
  Kostanay: "Костанай",
  Kyzylorda: "Кызылорда",
  Aktau: "Актау",
  Turkistan: "Туркестан",
  Oral: "Уральск",
  Petropavl: "Петропавловск",
  Kokshetau: "Кокшетау",
  Taldykorgan: "Талдыкорган",
  Bishkek: "Бишкек",
  Osh: "Ош",
  "Jalal-Abad": "Джалал-Абад",
  Karakol: "Каракол",
  Naryn: "Нарын",
  Talas: "Талас",
  Batken: "Баткен",
  Tashkent: "Ташкент",
  Samarkand: "Самарканд",
  Bukhara: "Бухара",
  Namangan: "Наманган",
  Andijan: "Андижан",
  Fergana: "Фергана",
  Nukus: "Нукус",
  Urgench: "Ургенч",
};

const KK: Labels = {
  Kazakhstan: "Қазақстан",
  Kyrgyzstan: "Қырғызстан",
  Uzbekistan: "Өзбекстан",
  International: "Халықаралық",
  Almaty: "Алматы",
  Astana: "Астана",
  Shymkent: "Шымкент",
  Karaganda: "Қарағанды",
  Aktobe: "Ақтөбе",
  Atyrau: "Атырау",
  Taraz: "Тараз",
  Pavlodar: "Павлодар",
  Oskemen: "Өскемен",
  Semey: "Семей",
  Kostanay: "Қостанай",
  Kyzylorda: "Қызылорда",
  Aktau: "Ақтау",
  Turkistan: "Түркістан",
  Oral: "Орал",
  Petropavl: "Петропавл",
  Kokshetau: "Көкшетау",
  Taldykorgan: "Талдықорған",
  Bishkek: "Бішкек",
  Osh: "Ош",
  "Jalal-Abad": "Жалал-Абад",
  Karakol: "Қаракөл",
  Naryn: "Нарын",
  Talas: "Талас",
  Batken: "Баткен",
  Tashkent: "Ташкент",
  Samarkand: "Самарқанд",
  Bukhara: "Бұхара",
  Namangan: "Наманган",
  Andijan: "Әндіжан",
  Fergana: "Ферғана",
  Nukus: "Нөкіс",
  Urgench: "Үргеніш",
};

export const LOCATION_LABELS: Record<string, Labels> = { ru: RU, kk: KK, en: {} };

export function localizePlace(value: string | undefined, lang: string): string {
  if (!value) return "";
  return LOCATION_LABELS[lang]?.[value] ?? value;
}

/** Normalizes a free-form Airtable country value onto the supported list. */
export function normalizeCountry(raw: string): string {
  const v = raw.trim().toLowerCase();
  if (!v) return "";
  if (/казах|qazaq|kazakh/.test(v)) return "Kazakhstan";
  if (/кыргыз|қырғыз|kyrgyz/.test(v)) return "Kyrgyzstan";
  if (/узбек|өзбек|uzbek/.test(v)) return "Uzbekistan";
  if (/international|халықаралық|международ/.test(v)) return "International";
  return raw.trim();
}

/** Maps a free-form city (any language) back to the canonical English key. */
export function normalizeCity(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  for (const labels of [RU, KK]) {
    const hit = Object.entries(labels).find(([, label]) => label.toLowerCase() === v.toLowerCase());
    if (hit) return hit[0];
  }
  const known = Object.values(CITIES)
    .flat()
    .find((c) => c.toLowerCase() === v.toLowerCase());
  return known ?? v;
}
