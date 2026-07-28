import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, Filter, Megaphone, RotateCcw, Search, Sparkles } from "lucide-react";

import { DateField } from "@/components/date-field";
import { IvyBackdrop } from "@/components/ivy-backdrop";
import { LanguageSwitcher } from "@/components/language-switcher";

import { OpportunityCard, OpportunityCardSkeleton } from "@/components/opportunity-card";
import { OpportunityDialog } from "@/components/opportunity-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchOpportunities } from "@/lib/airtable.functions";
import { useI18n } from "@/lib/i18n";
import { COSTS, FORMATS, GRADES, SPHERES, type Opportunity } from "@/lib/opportunities";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Green Lit Space — каталог олимпиад и возможностей" },
      {
        name: "description",
        content:
          "Каталог олимпиад, конкурсов и программ по 9 направлениям: от Computer Science до Art & Design. Фильтры по классу, стоимости и формату участия.",
      },
      { property: "og:title", content: "Green Lit Space — каталог олимпиад и возможностей" },
      {
        property: "og:description",
        content: "Новые возможности каждый день: олимпиады, конкурсы и программы для школьников и студентов.",
      },
    ],
  }),
  component: Home,
});

const ALL = "__all__";

function Home() {
  const getOpportunities = useServerFn(fetchOpportunities);
  const { data, isPending } = useQuery({
    queryKey: ["opportunities"],
    queryFn: () => getOpportunities(),
  });

  useEffect(() => {
    if (data?.error) console.error(data.error);
    else if (data?.source === "sample") console.warn("[airtable] Показаны демо-данные вместо записей Airtable.");
  }, [data]);

  const { t, tSphere, tGrade, tCost, tFormat } = useI18n();

  const [query, setQuery] = useState("");
  const [sphere, setSphere] = useState<string>(ALL);
  const [grade, setGrade] = useState<string>(ALL);
  const [cost, setCost] = useState<string>(ALL);
  const [format, setFormat] = useState<string>(ALL);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [active, setActive] = useState<Opportunity | null>(null);

  const items = data?.items ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((o) => {
      if (q && !`${o.title} ${o.snippet} ${o.description} ${o.sphere} ${tSphere(o.sphere)}`.toLowerCase().includes(q))
        return false;
      if (sphere !== ALL && o.sphere !== sphere) return false;
      if (grade !== ALL && o.grade !== grade) return false;
      if (cost !== ALL && o.cost !== cost) return false;
      if (format !== ALL && o.format !== format) return false;
      if (from && o.deadline && o.deadline < from) return false;
      if (to && o.deadline && o.deadline > to) return false;
      return true;
    });
  }, [items, query, sphere, grade, cost, format, from, to, tSphere]);

  const hasFilters =
    query !== "" || sphere !== ALL || grade !== ALL || cost !== ALL || format !== ALL || from !== "" || to !== "";

  function reset() {
    setQuery("");
    setSphere(ALL);
    setGrade(ALL);
    setCost(ALL);
    setFormat(ALL);
    setFrom("");
    setTo("");
  }

  function scrollToCatalog() {
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen">
      <div className="absolute top-5 right-5 z-20">
        <LanguageSwitcher />
      </div>

      <section className="hero-surface relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <IvyBackdrop />
        <span className="rise-in relative inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur">
          <Sparkles className="size-4" />
          {t("hero.badge")}
        </span>

        <h1
          className="rise-in relative mt-8 text-5xl font-bold sm:text-6xl md:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          Green Lit&nbsp;Space
        </h1>

        <p
          className="rise-in relative mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          {t("hero.subtitle")}
        </p>

        <div
          className="rise-in relative mt-10 flex flex-col items-center gap-4 sm:flex-row"
          style={{ animationDelay: "240ms" }}
        >
          <Button
            size="lg"
            onClick={scrollToCatalog}
            className="gradient-emerald shadow-lift cta-glow h-13 relative overflow-hidden rounded-xl px-8 text-base font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98]"
          >
            {t("hero.cta")}
            <ArrowDown className="size-4 animate-bounce" />
          </Button>
        </div>
      </section>

      <section id="catalog" className="mx-auto w-full max-w-6xl scroll-mt-6 px-6 pb-24">
        <Link
          to="/share"
          className="shadow-soft mb-10 flex flex-col items-start gap-4 rounded-2xl border border-primary/25 bg-accent/50 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 sm:flex-row sm:items-center"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Megaphone className="size-5" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold">{t("banner.title")}</span>
            <span className="block text-sm text-muted-foreground">{t("banner.subtitle")}</span>
          </span>
          <span className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            {t("banner.action")}
          </span>
        </Link>

        <div className="shadow-soft space-y-5 rounded-2xl border border-border/70 bg-card p-5">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, 100))}
              placeholder={t("search.placeholder")}
              className="h-12 rounded-xl pl-11"
              aria-label={t("search.aria")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label={t("filter.sphere")}
              value={sphere}
              onChange={setSphere}
              options={[...SPHERES]}
              render={tSphere}
            />
            <FilterSelect
              label={t("filter.grade")}
              value={grade}
              onChange={setGrade}
              options={[...GRADES]}
              render={tGrade}
            />
            <FilterSelect
              label={t("filter.cost")}
              value={cost}
              onChange={setCost}
              options={[...COSTS]}
              render={tCost}
            />
            <FilterSelect
              label={t("filter.format")}
              value={format}
              onChange={setFormat}
              options={[...FORMATS]}
              render={tFormat}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DateField label={t("filter.from")} value={from} onChange={setFrom} />
            <DateField label={t("filter.to")} value={to} onChange={setTo} />
            <div className="flex items-end lg:col-span-2">
              <Button
                variant="outline"
                onClick={reset}
                disabled={!hasFilters}
                className="h-11 w-full rounded-xl sm:w-auto"
              >
                <RotateCcw className="size-4" /> {t("filter.reset")}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="size-4" />
          {isPending ? t("list.loading") : `${t("list.found")}: ${filtered.length}`}
        </div>

        <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {isPending
            ? Array.from({ length: 6 }).map((_, i) => <OpportunityCardSkeleton key={i} />)
            : filtered.map((item, i) => (
                <OpportunityCard key={item.id} item={item} index={i} onOpen={() => setActive(item)} />
              ))}
        </div>

        {!isPending && filtered.length === 0 && (
          <div className="rise-in mt-8 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border p-14 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <Search className="size-5" />
            </span>
            <p className="max-w-sm text-muted-foreground">{t("empty.text")}</p>
            <Button onClick={reset} variant="outline" className="rounded-xl">
              <RotateCcw className="size-4" /> {t("filter.reset")}
            </Button>
          </div>
        )}
      </section>

      <OpportunityDialog item={active} onOpenChange={(open) => !open && setActive(null)} />
    </main>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  render,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  render?: (v: string) => string;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-11 w-full rounded-xl">
          <SelectValue placeholder={t("filter.all")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("filter.all")}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {render?.(o) ?? o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
