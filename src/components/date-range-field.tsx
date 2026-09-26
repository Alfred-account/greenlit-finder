import { useEffect, useState } from "react";
import { CalendarDays, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { enUS, kk, ru } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

function toISO(date: Date) {
  const tzFixed = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return tzFixed.toISOString().slice(0, 10);
}

/**
 * One field that picks a whole period at once: the calendar stays open while
 * the user clicks the start date and then the end date.
 */
export function DateRangeField({
  label,
  from,
  to,
  onChange,
  autoOpen = false,
}: {
  label: string;
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  autoOpen?: boolean;
}) {
  const { lang, localeTag, t } = useI18n();
  const locale = lang === "ru" ? ru : lang === "kk" ? kk : enUS;
  const selected: DateRange | undefined =
    from || to
      ? { from: from ? new Date(`${from}T00:00:00`) : undefined, to: to ? new Date(`${to}T00:00:00`) : undefined }
      : undefined;
  const [open, setOpen] = useState(false);

  // During the guided tour the calendar unfolds by itself.
  useEffect(() => {
    if (!autoOpen) return;
    const id = window.setTimeout(() => setOpen(true), 400);
    return () => window.clearTimeout(id);
  }, [autoOpen]);

  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(localeTag, { day: "numeric", month: "short" });

  const text =
    from && to
      ? `${fmt(from)} — ${fmt(to)}`
      : from
        ? `${t("filter.fromShort")} ${fmt(from)}`
        : to
          ? `${t("filter.toShort")} ${fmt(to)}`
          : t("filter.pickRange");

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("h-11 w-full justify-start rounded-xl font-normal", !selected && "text-muted-foreground")}
          >
            <CalendarDays className="size-4 shrink-0 text-primary" />
            <span className="truncate">{text}</span>
            {selected && (
              <span
                role="button"
                tabIndex={0}
                aria-label={t("filter.clearDate")}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange("", "");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange("", "");
                  }
                }}
                className="ml-auto grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto rounded-2xl p-0">
          <Calendar
            mode="range"
            showOutsideDays={false}
            locale={locale}
            selected={selected}
            defaultMonth={selected?.from}
            captionLayout="dropdown"
            numberOfMonths={1}
            onSelect={(range) => {
              onChange(range?.from ? toISO(range.from) : "", range?.to ? toISO(range.to) : "");
              if (range?.from && range?.to) setOpen(false);
            }}
            className="pointer-events-auto p-4 text-base [--cell-size:2.75rem]"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
