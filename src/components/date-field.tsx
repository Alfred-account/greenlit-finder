import { CalendarDays, X } from "lucide-react";
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

export function DateField({
  label,
  value,
  onChange,
  autoOpen = false,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  autoOpen?: boolean;
}) {
  const { lang, localeTag, t } = useI18n();
  const locale = lang === "ru" ? ru : lang === "kk" ? kk : enUS;
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;
  const [open, setOpen] = useState(false);

  // During the guided tour the calendar unfolds by itself.
  useEffect(() => {
    if (!autoOpen) return;
    const id = window.setTimeout(() => setOpen(true), 400);
    return () => window.clearTimeout(id);
  }, [autoOpen]);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button

            variant="outline"
            className={cn(
              "h-11 w-full justify-start rounded-xl font-normal",
              !selected && "text-muted-foreground",
            )}
          >
            <CalendarDays className="size-4 text-primary" />
            {selected
              ? selected.toLocaleDateString(localeTag, { day: "numeric", month: "long", year: "numeric" })
              : t("filter.pickDate")}
            {selected && (
              <span
                role="button"
                tabIndex={0}
                aria-label={t("filter.clearDate")}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange("");
                  }
                }}
                className="ml-auto grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto rounded-2xl p-0">
          <Calendar
            mode="single"
            showOutsideDays={false}
            locale={locale}
            selected={selected}
            defaultMonth={selected}
            captionLayout="dropdown"
            onSelect={(d) => onChange(d ? toISO(d) : "")}
            className="pointer-events-auto p-4 text-base [--cell-size:2.75rem]"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
