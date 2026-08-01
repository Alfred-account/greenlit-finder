import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CITIES, localizePlace } from "@/lib/locations";
import { useI18n } from "@/lib/i18n";

/**
 * Typeahead city input: the user types "Алм…" and picks "Алматы".
 * The stored value is always the canonical English city key.
 */
export function CityField({
  label,
  country,
  value,
  onChange,
  hint,
  autoOpen = false,
}: {
  label: string;
  country: string;
  value: string;
  onChange: (city: string) => void;
  hint?: string;
  autoOpen?: boolean;
}) {
  const { lang, t } = useI18n();
  const [text, setText] = useState(() => localizePlace(value, lang));
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const options = useMemo(() => CITIES[country] ?? [], [country]);
  const matches = useMemo(() => {
    const q = text.trim().toLowerCase();
    const list = options.filter((c) => !q || localizePlace(c, lang).toLowerCase().startsWith(q) || c.toLowerCase().startsWith(q));
    return list.slice(0, 8);
  }, [options, text, lang]);

  const disabled = options.length === 0;

  // During the guided tour the suggestion list unfolds by itself.
  useEffect(() => {
    if (!autoOpen || disabled) return;
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
      setOpen(true);
    }, 350);
    return () => window.clearTimeout(id);
  }, [autoOpen, disabled]);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative">
        <MapPin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={text}
          disabled={disabled}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            if (!e.target.value.trim()) onChange("");
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          placeholder={t("filter.cityPlaceholder")}
          className="h-11 rounded-xl pl-9"
        />

        {open && !disabled && matches.length > 0 && (
          <ul className="shadow-lift absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-border/70 bg-popover py-1">
            {matches.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(c);
                    setText(localizePlace(c, lang));
                    setOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  {localizePlace(c, lang)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
