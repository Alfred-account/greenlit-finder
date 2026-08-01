import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, Bookmark, Filter, Megaphone, RotateCcw, Search, Sparkles } from "lucide-react";

import { AccountMenu } from "@/components/account-menu";
import { CityField } from "@/components/city-field";
import { DateField } from "@/components/date-field";
import { FilterTourButton, TourOverlay, type TourPhase } from "@/components/filter-tour";
import { IvyBackdrop } from "@/components/ivy-backdrop";
import { LanguageSwitcher } from "@/components/language-switcher";

import { OpportunityCard, OpportunityCardSkeleton } from "@/components/opportunity-card";
import { OpportunityDialog } from "@/components/opportunity-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSavedOpportunities } from "@/hooks/use-saved";
import { fetchOpportunities } from "@/lib/airtable.functions";
import { useI18n } from "@/lib/i18n";
import { COUNTRIES } from "@/lib/locations";
import { COSTS, DELIVERIES, FORMATS, GRADES, SPHERES, type Opportunity } from "@/lib/opportunities";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Green Lit Space — каталог олимпиад и возможностей" },
      {
        name: "description",
        content:
          "Каталог олимпиад, конкурсов и программ по 14 направлениям: фильтры по классу, стоимости, формату, городу и дедлайну.",
      },
      { property: "og:title", content: "Green Lit Space — каталог олимпиад и возможностей" },
      {
        property: "og:description",
        content: "Олимпиады, конкурсы и программы для школьников и студентов — в одном месте.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const ALL = "__all__";

/**
 * Guided tour. Every filter runs the same two-phase flow: explanation →
 * "Понятно!" → the control opens by itself → the user makes a real choice →
 * a short confirmation → the spotlight glides to the next filter.
 */
const TOUR_STEPS = [
  { key: "sphere", selector: '[data-tour="sphere"]', title: "tour.s1.title", text: "tour.s1.text" },
  { key: "grade", selector: '[data-tour="grade"]', title: "tour.s2.title", text: "tour.s2.text" },
  { key: "cost", selector: '[data-tour="cost"]', title: "tour.s3.title", text: "tour.s3.text" },
  { key: "format", selector: '[data-tour="format"]', title: "tour.s4.title", text: "tour.s4.text" },
  { key: "delivery", selector: '[data-tour="delivery"]', title: "tour.s5.title", text: "tour.s5.text" },
  { key: "country", selector: '[data-tour="country"]', title: "tour.s6.title", text: "tour.s6.text" },
  { key: "city", selector: '[data-tour="city"]', title: "tour.s7.title", text: "tour.s7.text", optional: true },
  { key: "dates", selector: '[data-tour="dates"]', title: "tour.s8.title", text: "tour.s8.text", optional: true },
  { key: "done", selector: null, title: "tour.s9.title", text: "tour.s9.text", last: true },
] as const;


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

  const { t, tSphere, tGrade, tCost, tFormat, tDelivery, tPlace, lang } = useI18n();
  const { isSaved, toggle, saved: savedIds, signedIn } = useSavedOpportunities();

  const [query, setQuery] = useState("");
  const [sphere, setSphere] = useState<string>(ALL);
  const [grade, setGrade] = useState<string>(ALL);
  const [cost, setCost] = useState<string>(ALL);
  const [format, setFormat] = useState<string>(ALL);
  const [delivery, setDelivery] = useState<string>(ALL);
  const [country, setCountry] = useState<string>(ALL);
  const [city, setCity] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("deadlineAsc");
  const [onlySaved, setOnlySaved] = useState(false);
  const [active, setActive] = useState<Opportunity | null>(null);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [tourPhase, setTourPhase] = useState<TourPhase>("explain");


  const items = data?.items ?? [];

  // Deep link: /?opp=<id> opens that opportunity straight away.
  const [deepLinked, setDeepLinked] = useState(false);
  useEffect(() => {
    if (deepLinked || items.length === 0) return;
    const id = new URLSearchParams(window.location.search).get("opp");
    if (!id) return;
    const match = items.find((o) => o.id === id);
    if (match) setActive(match);
    setDeepLinked(true);
  }, [items, deepLinked]);

  const step = tourStep === null ? null : TOUR_STEPS[tourStep];
  /** The control of the current step only unfolds during the action phase. */
  const activeKey = step && tourPhase === "act" ? step.key : null;

  function startTour() {
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      setTourPhase("explain");
      setTourStep(0);
    }, 400);
  }

  function goToStep(next: number) {
    setTourPhase("explain");
    setTourStep(next);
  }

  /** A real user choice ends the action phase: confirm, pause, move on. */
  function advance(key: string) {
    if (!step || step.key !== key || tourPhase !== "act") return;
    setTourPhase("success");
    window.setTimeout(() => {
      setTourStep((s) => {
        if (s === null) return null;
        setTourPhase("explain");
        return s + 1;
      });
    }, 1500);
  }



  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((o) => {
      if (q && !`${o.title} ${o.snippet} ${o.description} ${o.sphere} ${tSphere(o.sphere)}`.toLowerCase().includes(q))
        return false;
      if (sphere !== ALL && o.sphere !== sphere) return false;
      if (grade !== ALL && !o.grades.includes(grade)) return false;
      if (cost !== ALL && o.cost !== cost) return false;
      if (format !== ALL && o.format !== format) return false;
      if (delivery !== ALL && o.delivery !== delivery) return false;
      if (country !== ALL && o.country !== country) return false;
      if (city && o.city !== city) return false;
      if (from && o.deadline && o.deadline < from) return false;
      if (to && o.deadline && o.deadline > to) return false;
      if (onlySaved && !savedIds.includes(o.id)) return false;
      return true;
    });

    const far = "9999-12-31";
    return [...list].sort((a, b) => {
      if (sort === "deadlineDesc") return (b.deadline || "").localeCompare(a.deadline || "");
      if (sort === "titleAsc") return a.title.localeCompare(b.title, lang);
      if (sort === "savedFirst") {
        const diff = Number(savedIds.includes(b.id)) - Number(savedIds.includes(a.id));
        if (diff !== 0) return diff;
      }
      return (a.deadline || far).localeCompare(b.deadline || far);
    });
  }, [items, query, sphere, grade, cost, format, delivery, country, city, from, to, onlySaved, savedIds, sort, lang, tSphere]);

  const hasFilters =
    query !== "" ||
    sphere !== ALL ||
    grade !== ALL ||
    cost !== ALL ||
    format !== ALL ||
    delivery !== ALL ||
    country !== ALL ||
    city !== "" ||
    onlySaved ||
    from !== "" ||
    to !== "";

  function reset() {
    setQuery("");
    setSphere(ALL);
    setGrade(ALL);
    setCost(ALL);
    setFormat(ALL);
    setDelivery(ALL);
    setCountry(ALL);
    setCity("");
    setOnlySaved(false);
    setFrom("");
    setTo("");
  }

  // Title/description follow the selected (or browser-detected) language.
  useEffect(() => {
    document.title = t("meta.title");
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.description"));
  }, [t, lang]);

  function scrollToCatalog() {
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen">
      <div className="absolute top-3 right-3 z-20 flex max-w-[calc(100vw-1.5rem)] items-center gap-2 sm:top-5 sm:right-5">
        <AccountMenu />
        <LanguageSwitcher />
      </div>

      <section className="hero-surface relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center sm:px-6 sm:py-24">
        <IvyBackdrop />
        <span className="rise-in relative inline-flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur sm:px-4 sm:text-sm">
          <Sparkles className="size-4 shrink-0" />
          <span className="text-balance">{t("hero.badge")}</span>
        </span>

        <h1
          className="rise-in relative mt-7 text-4xl font-bold tracking-tight text-balance sm:mt-8 sm:text-6xl md:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          Green Lit&nbsp;Space
        </h1>

        <p
          className="rise-in relative mt-4 max-w-xl text-sm text-balance text-muted-foreground sm:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          {t("hero.subtitle")}
        </p>

        <div className="rise-in relative mt-9 flex w-full flex-col items-center gap-3" style={{ animationDelay: "240ms" }}>
          <Button
            size="lg"
            onClick={scrollToCatalog}
            className="gradient-emerald shadow-lift cta-glow relative h-13 w-full max-w-xs overflow-hidden rounded-xl px-8 text-base font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98] sm:w-auto"
          >
            {t("hero.cta")}
            <ArrowDown className="size-4 animate-bounce" />
          </Button>

          <p className="text-xs font-medium tracking-wide text-balance text-muted-foreground sm:text-sm">
            {t("hero.stats")}
          </p>

          <Link
            to="/share"
            className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            {t("hero.secondary")}
          </Link>
        </div>
      </section>

      <section id="catalog" className="mx-auto w-full max-w-6xl scroll-mt-4 px-4 pb-20 sm:px-6 sm:pb-24">
        <Link
          to="/share"
          className="shadow-soft mb-8 flex flex-col items-start gap-4 rounded-2xl border border-primary/25 bg-accent/50 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 sm:mb-10 sm:flex-row sm:items-center sm:p-5"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Megaphone className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">{t("banner.title")}</span>
            <span className="block text-sm text-muted-foreground">{t("banner.subtitle")}</span>
          </span>
          <span className="w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground sm:w-auto">
            {t("banner.action")}
          </span>
        </Link>

        <div className="shadow-soft space-y-4 rounded-2xl border border-border/70 bg-card p-4 sm:space-y-5 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value.slice(0, 100))}
                placeholder={t("search.placeholder")}
                className="h-12 rounded-xl pl-11"
                aria-label={t("search.aria")}
              />
            </div>
            <FilterTourButton onStart={startTour} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div data-tour="sphere">
              <FilterSelect
                label={t("filter.sphere")}
                value={sphere}
                onChange={(v) => {
                  setSphere(v);
                  advance("sphere");
                }}
                options={[...SPHERES]}
                render={tSphere}
                autoOpen={activeKey === "sphere"}
              />
            </div>
            <div data-tour="grade">
              <FilterSelect
                label={t("filter.grade")}
                value={grade}
                onChange={(v) => {
                  setGrade(v);
                  advance("grade");
                }}
                options={[...GRADES]}
                render={tGrade}
                autoOpen={activeKey === "grade"}
              />
            </div>
            <div data-tour="cost">
              <FilterSelect
                label={t("filter.cost")}
                value={cost}
                onChange={(v) => {
                  setCost(v);
                  advance("cost");
                }}
                options={[...COSTS]}
                render={tCost}
                autoOpen={activeKey === "cost"}
              />
            </div>
            <div data-tour="format">
              <FilterSelect
                label={t("filter.format")}
                value={format}
                onChange={(v) => {
                  setFormat(v);
                  advance("format");
                }}
                options={[...FORMATS]}
                render={tFormat}
                autoOpen={activeKey === "format"}
              />
            </div>
            <div data-tour="delivery">
              <FilterSelect
                label={t("filter.delivery")}
                value={delivery}
                onChange={(v) => {
                  setDelivery(v);
                  advance("delivery");
                }}
                options={[...DELIVERIES]}
                render={tDelivery}
                autoOpen={activeKey === "delivery"}
              />
            </div>
            <div data-tour="country">
              <FilterSelect
                label={t("filter.country")}
                value={country}
                onChange={(v) => {
                  setCountry(v);
                  setCity("");
                  advance("country");
                }}
                options={[...COUNTRIES]}
                render={tPlace}
                autoOpen={activeKey === "country"}
              />
            </div>
            <div data-tour="city">
              <CityField
                key={country}
                label={t("filter.city")}
                country={country === ALL ? "" : country}
                value={city}
                onChange={setCity}
              />
            </div>
            <FilterSelect
              label={t("filter.sort")}
              value={sort}
              onChange={setSort}
              options={["deadlineAsc", "deadlineDesc", "titleAsc", "savedFirst"]}
              render={(v) => t(`sort.${v}`)}
              allowAll={false}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2" data-tour="dates">
              <DateField label={t("filter.from")} value={from} onChange={setFrom} />
              <DateField label={t("filter.to")} value={to} onChange={setTo} />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant={onlySaved ? "default" : "outline"}
                onClick={() => setOnlySaved((v) => !v)}
                disabled={!signedIn}
                className="h-11 w-full rounded-xl"
              >
                <Bookmark className={`size-4 ${onlySaved ? "fill-current" : ""}`} />
                <span className="truncate">{t("filter.onlySaved")}</span>
              </Button>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={reset} disabled={!hasFilters} className="h-11 w-full rounded-xl">
                <RotateCcw className="size-4" />
                <span className="truncate">{t("filter.reset")}</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="size-4" />
          {isPending ? t("list.loading") : `${t("list.found")}: ${filtered.length}`}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {isPending
            ? Array.from({ length: 6 }).map((_, i) => <OpportunityCardSkeleton key={i} />)
            : filtered.map((item, i) => (
                <OpportunityCard
                  key={item.id}
                  item={item}
                  index={i}
                  saved={isSaved(item.id)}
                  onToggleSave={() => void toggle(item.id)}
                  onOpen={() => setActive(item)}
                />
              ))}
        </div>

        {!isPending && filtered.length === 0 && (
          <div className="rise-in mt-8 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border p-10 text-center sm:p-14">
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

      {step && (
        <TourOverlay
          key={step.key}
          selector={step.selector}
          title={t(step.title)}
          text={t(step.text)}
          index={tourStep ?? 0}
          total={TOUR_STEPS.length}
          onClose={() => setTourStep(null)}
          onNext={() => {
            if ("last" in step && step.last) setTourStep(null);
            else setTourStep((s) => (s === null ? null : s + 1));
          }}
          showNext={"optional" in step || ("last" in step && step.last)}
          nextLabel={"last" in step && step.last ? t("tour.finish") : t("tour.skipStep")}
        />
      )}
    </main>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  render,
  allowAll = true,
  autoOpen = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  render?: (v: string) => string;
  allowAll?: boolean;
  autoOpen?: boolean;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  // During the guided tour the current filter opens by itself.
  useEffect(() => {
    if (!autoOpen) return;
    const id = window.setTimeout(() => setOpen(true), 500);
    return () => window.clearTimeout(id);
  }, [autoOpen]);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange} open={open} onOpenChange={setOpen}>
        <SelectTrigger className="h-11 w-full rounded-xl">
          <SelectValue placeholder={t("filter.all")} />
        </SelectTrigger>
        <SelectContent>
          {allowAll && <SelectItem value={ALL}>{t("filter.all")}</SelectItem>}
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
