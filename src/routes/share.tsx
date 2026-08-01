import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitOpportunity, type SubmissionInput } from "@/lib/airtable.functions";
import { useI18n } from "@/lib/i18n";
import { COSTS, DELIVERIES, FORMATS, GRADES, SPHERES, sortGrades } from "@/lib/opportunities";
import { COUNTRIES } from "@/lib/locations";
import { CityField } from "@/components/city-field";
import { DateField } from "@/components/date-field";

export const Route = createFileRoute("/share")({
  head: () => ({
    meta: [
      { title: "Поделиться возможностью — Green Lit Space" },
      {
        name: "description",
        content:
          "Разместите свою олимпиаду, конкурс или программу в каталоге Green Lit Space бесплатно. Заявка проходит быструю модерацию.",
      },
      { property: "og:title", content: "Поделиться возможностью — Green Lit Space" },
      {
        property: "og:description",
        content: "Бесплатное размещение олимпиад и конкурсов в каталоге Green Lit Space.",
      },
    ],
  }),
  component: SharePage,
});

const empty: SubmissionInput = {
  contactName: "",
  contactInfo: "",
  title: "",
  sphere: "",
  grades: [],
  cost: "Free",
  price: "",
  format: "Individual",
  delivery: "Online",
  country: "",
  city: "",
  deadline: "",
  url: "",
  instagram: "",
  registerUrl: "",
  description: "",
};

function SharePage() {
  const router = useRouter();
  const submit = useServerFn(submitOpportunity);
  const [form, setForm] = useState<SubmissionInput>(empty);
  const { t, tSphere, tGrade, tGrades, tCost, tFormat, tDelivery, tPlace } = useI18n();

  const mutation = useMutation({
    mutationFn: (data: SubmissionInput) => submit({ data }),
    onSuccess: () => {
      toast.success(t("toast.success"));
      setForm(empty);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("toast.error"));
    },
  });

  const wordCount = form.description.trim().split(/\s+/).filter(Boolean).length;

  function set<K extends keyof SubmissionInput>(key: K, value: SubmissionInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sphere || form.grades.length === 0) {
      toast.error(t("toast.needSphere"));
      return;
    }
    if (form.cost === "Paid" && !form.price?.trim()) {
      toast.error(t("toast.needPrice"));
      return;
    }
    if (!form.instagram?.trim()) {
      toast.error(t("toast.needInstagram"));
      return;
    }
    if (wordCount < 50) {
      toast.error(t("toast.needDescription"));
      return;
    }
    mutation.mutate({ ...form, price: form.cost === "Paid" ? form.price : "" });
  }

  return (
    <main className="hero-surface min-h-screen px-6 py-14">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.history.back()} className="-ml-2 rounded-xl">
            <ArrowLeft className="size-4" /> {t("share.back")}
          </Button>
          <LanguageSwitcher />
        </div>

        <h1 className="text-4xl font-bold">{t("share.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("share.subtitle")}</p>

        <form
          onSubmit={onSubmit}
          className="shadow-soft mt-8 space-y-6 rounded-2xl border border-border/70 bg-card p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("share.name")} required>
              <Input
                required
                maxLength={100}
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
                placeholder={namePlaceholder}
                className="h-11 rounded-xl"
              />
            </Field>
            <Field label={t("share.contact")} required>
              <Input
                required
                maxLength={200}
                value={form.contactInfo}
                onChange={(e) => set("contactInfo", e.target.value)}
                placeholder={t("share.contactPlaceholder")}
                className="h-11 rounded-xl"
              />
            </Field>
          </div>

          <Field label={t("share.eventTitle")} required>
            <Input
              required
              maxLength={200}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Global Informatics Challenge"
              className="h-11 rounded-xl"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("filter.sphere")} required>
              <Selector
                value={form.sphere}
                onChange={(v) => set("sphere", v)}
                options={[...SPHERES]}
                render={tSphere}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t("share.gradesLabel")} required>
                <div className="flex flex-wrap gap-2">
                  {GRADES.map((g) => {
                    const on = form.grades.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          set(
                            "grades",
                            sortGrades(on ? form.grades.filter((x) => x !== g) : [...form.grades, g]),
                          )
                        }
                        className={`rounded-full border px-4 py-2 text-sm transition-all ${
                          on
                            ? "border-primary bg-primary text-primary-foreground shadow-soft"
                            : "border-border/70 bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {tGrade(g)}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {form.grades.length > 0 ? `${t("share.gradesSelected")}: ${tGrades(form.grades)}` : t("share.gradesHint")}
                </p>
              </Field>
            </div>
            <Field label={t("filter.cost")} required>
              <Selector
                value={form.cost}
                onChange={(v) => set("cost", v as SubmissionInput["cost"])}
                options={[...COSTS]}
                render={tCost}
              />
            </Field>
            {form.cost === "Paid" && (
              <Field label={t("share.price")} required>
                <Input
                  required
                  maxLength={100}
                  value={form.price ?? ""}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder={t("share.pricePlaceholder")}
                  className="h-11 rounded-xl"
                />
              </Field>
            )}
            <Field label={t("share.formatLabel")} required>
              <Selector
                value={form.format}
                onChange={(v) => set("format", v as SubmissionInput["format"])}
                options={[...FORMATS]}
                render={tFormat}
              />
            </Field>
            <Field label={t("share.deliveryLabel")} required>
              <Selector
                value={form.delivery}
                onChange={(v) => set("delivery", v as SubmissionInput["delivery"])}
                options={[...DELIVERIES]}
                render={tDelivery}
              />
            </Field>
            <Field label={t("share.country")}>
              <Selector
                value={form.country ?? ""}
                onChange={(v) => setForm((prev) => ({ ...prev, country: v, city: "" }))}
                options={[...COUNTRIES]}
                render={tPlace}
              />
            </Field>
            <CityField
              key={form.country}
              label={t("share.city")}
              country={form.country ?? ""}
              value={form.city ?? ""}
              onChange={(v) => set("city", v)}
              hint={t("share.cityHint")}
            />
            <DateField label={t("share.deadline")} value={form.deadline ?? ""} onChange={(v) => set("deadline", v)} />
          </div>

          <Field label={t("share.url")}>
            <Input
              type="url"
              maxLength={500}
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://…"
              className="h-11 rounded-xl"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("share.register")}>
              <Input
                type="url"
                maxLength={500}
                value={form.registerUrl ?? ""}
                onChange={(e) => set("registerUrl", e.target.value)}
                placeholder="https://…"
                className="h-11 rounded-xl"
              />
            </Field>
            <Field label={t("share.instagram")} required>
              <Input
                required
                type="url"
                maxLength={500}
                value={form.instagram ?? ""}
                onChange={(e) => set("instagram", e.target.value)}
                placeholder="https://instagram.com/…"
                className="h-11 rounded-xl"
              />
            </Field>
          </div>

          <Field label={t("share.description")} required>
            <Textarea
              required
              maxLength={4000}
              rows={7}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={t("share.descriptionPlaceholder")}
              className="rounded-xl"
            />
            <p className={`text-xs ${wordCount >= 50 ? "text-muted-foreground" : "text-primary"}`}>
              {wordCount} {t("share.words")} · {t("share.descriptionHint")}
            </p>
          </Field>

          <Button
            type="submit"
            size="lg"
            disabled={mutation.isPending}
            className="gradient-emerald h-12 w-full rounded-xl text-primary-foreground"
          >
            {mutation.isPending ? t("share.submitting") : t("share.submit")}
            <Send className="size-4" />
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t("share.already")}{" "}
            <Link to="/" className="font-medium text-primary hover:underline">
              {t("share.backToCatalog")}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Selector({
  value,
  onChange,
  options,
  render,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  render?: (v: string) => string;
}) {
  const { t } = useI18n();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11 w-full rounded-xl">
        <SelectValue placeholder={t("share.selectPlaceholder")} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {render?.(o) ?? o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
