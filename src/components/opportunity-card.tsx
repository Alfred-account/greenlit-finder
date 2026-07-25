import { CalendarDays, Users, User, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Opportunity } from "@/lib/opportunities";

export function formatDeadline(iso: string) {
  if (!iso) return "Без дедлайна";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export function OpportunityCard({
  item,
  onOpen,
  index = 0,
}: {
  item: Opportunity;
  onOpen: () => void;
  index?: number;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      className="rise-in shadow-soft hover:shadow-lift group flex cursor-pointer flex-col gap-4 rounded-2xl border-border/70 p-5 transition-all duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="rounded-full bg-accent px-3 py-1 text-accent-foreground">
          {item.sphere}
        </Badge>
        <Badge variant="outline" className="rounded-full px-3 py-1 text-muted-foreground">
          {item.grade}
        </Badge>
        <Badge
          className={
            item.cost === "Free"
              ? "rounded-full bg-primary px-3 py-1 text-primary-foreground"
              : "rounded-full bg-muted px-3 py-1 text-muted-foreground"
          }
        >
          {item.cost === "Free" ? "Бесплатно" : "Платно"}
        </Badge>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg leading-snug font-semibold transition-colors group-hover:text-primary">
          {item.title}
        </h3>
        <p className="line-clamp-3 text-sm text-muted-foreground">{item.snippet}</p>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-border/70 pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" />
          {formatDeadline(item.deadline)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          {item.format === "Team-based" ? <Users className="size-3.5" /> : <User className="size-3.5" />}
          {item.format === "Team-based" ? "Командно" : "Индивидуально"}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          <Sparkles className="size-3.5" />
          Подробнее
        </span>
      </div>
    </Card>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="shimmer shadow-soft flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex gap-2">
        <div className="h-6 w-28 rounded-full bg-muted" />
        <div className="h-6 w-20 rounded-full bg-muted" />
      </div>
      <div className="h-5 w-3/4 rounded-md bg-muted" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
      <div className="mt-2 flex gap-4 border-t border-border/70 pt-4">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-3 w-20 rounded bg-muted" />
      </div>
    </div>
  );
}
