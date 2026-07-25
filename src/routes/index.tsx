import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, Filter, Megaphone, RotateCcw, Search, Sparkles } from "lucide-react";

import { OpportunityCard, OpportunityCardSkeleton } from "@/components/opportunity-card";
import { OpportunityDialog } from "@/components/opportunity-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchOpportunities } from "@/lib/airtable.functions";
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
      if (q && !`${o.title} ${o.snippet} ${o.description} ${o.sphere}`.toLowerCase().includes(q)) return false;
      if (sphere !== ALL && o.sphere !== sphere) return false;
      if (grade !== ALL && o.grade !== grade) return false;
      if (cost !== ALL && o.cost !== cost) return false;
      if (format !== ALL && o.format !== format) return false;
      if (from && o.deadline && o.deadline < from) return false;
      if (to && o.deadline && o.deadline > to) return false;
      return true;
    });
  }, [items, query, sphere, grade, cost, format, from, to]);

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
      <section className="hero-surface relative flex min-h-[88vh] flex-col items-center justify-center px-6 py-24 text-center">
        <span className="rise-in inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur">
          <Sparkles className="size-4" />
          Новые возможности каждый день
        </span>

        <h1 className="rise-in mt-8 text-5xl font-bold sm:text-6xl md:text-7xl" style={{ animationDelay: "80ms" }}>
          Green Lit&nbsp;Space
        </h1>

        <p
          className="rise-in mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          Олимпиады, конкурсы и программы, которые открывают двери. Найди то, что подходит именно тебе — по
          направлению, классу, формату и дедлайну.
        </p>

        <div
          className="rise-in mt-10 flex flex-col items-center gap-4 sm:flex-row"
          style={{ animationDelay: "240ms" }}
        >
          <Button
            size="lg"
            onClick={scrollToCatalog}
            className="gradient-emerald shadow-lift cta-glow h-13 rounded-xl px-8 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.04]"
          >
            Начать поиск
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
            <span className="block font-semibold">Поделись своей возможностью бесплатно!</span>
            <span className="block text-sm text-muted-foreground">
              Организуешь олимпиаду или конкурс? Разместим после быстрой модерации.
            </span>
          </span>
          <span className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Заполнить форму
          </span>
        </Link>

        <div className="shadow-soft space-y-5 rounded-2xl border border-border/70 bg-card p-5">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, 100))}
              placeholder="Поиск по названию, направлению или описанию…"
              className="h-12 rounded-xl pl-11"
              aria-label="Поиск возможностей"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect label="Направление" value={sphere} onChange={setSphere} options={[...SPHERES]} />
            <FilterSelect label="Класс / уровень" value={grade} onChange={setGrade} options={[...GRADES]} />
            <FilterSelect
              label="Стоимость"
              value={cost}
              onChange={setCost}
              options={[...COSTS]}
              labels={{ Free: "Бесплатно", Paid: "Платно" }}
            />
            <FilterSelect
              label="Формат"
              value={format}
              onChange={setFormat}
              options={[...FORMATS]}
              labels={{ Individual: "Индивидуально", "Team-based": "Командно" }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Дедлайн с</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Дедлайн по</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="flex items-end lg:col-span-2">
              <Button
                variant="outline"
                onClick={reset}
                disabled={!hasFilters}
                className="h-11 w-full rounded-xl sm:w-auto"
              >
                <RotateCcw className="size-4" /> Сбросить фильтры
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="size-4" />
          {isPending ? "Загружаем возможности…" : `Найдено: ${filtered.length}`}
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
            <p className="max-w-sm text-muted-foreground">
              Увы, пока нет подходящих олимпиад. Попробуйте сбросить фильтры
            </p>
            <Button onClick={reset} variant="outline" className="rounded-xl">
              <RotateCcw className="size-4" /> Сбросить фильтры
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
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-11 w-full rounded-xl">
          <SelectValue placeholder="Все" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Все</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {labels?.[o] ?? o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
