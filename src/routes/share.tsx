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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitOpportunity, type SubmissionInput } from "@/lib/airtable.functions";
import { useI18n } from "@/lib/i18n";
import { COSTS, FORMATS, GRADES, SPHERES } from "@/lib/opportunities";

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
  grade: "",
  cost: "Free",
  price: "",
  format: "Individual",
  url: "",
  description: "",
};

function SharePage() {
  const router = useRouter();
  const submit = useServerFn(submitOpportunity);
  const [form, setForm] = useState<SubmissionInput>(empty);
  const { t, tSphere, tGrade, tCost, tFormat } = useI18n();

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

  function set<K extends keyof SubmissionInput>(key: K, value: SubmissionInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sphere || !form.grade) {
      toast.error(t("toast.needSphere"));
      return;
    }
    if (form.cost === "Paid" && !form.price?.trim()) {
      toast.error(t("toast.needPrice"));
      return;
    }
    mutation.mutate({ ...form, price: form.cost === "Paid" ? form.price : "" });
  }

  return (
    <main className="hero-surface min-h-screen px-6 py-14">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.history.back()}
            className="-ml-2 rounded-xl"
          >
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
                placeholder={t("share.namePlaceholder")}
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
            <Field label={t("filter.grade")} required>
              <Selector
                value={form.grade}
                onChange={(v) => set("grade", v)}
                options={[...GRADES]}
                render={tGrade}
              />
            </Field>
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
          </div>

          <Field label={t("share.url")} required>
            <Input
              required
              type="url"
              maxLength={500}
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://…"
              className="h-11 rounded-xl"
            />
          </Field>

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
            <p className="text-xs text-muted-foreground">
              {form.description.length}/4000 — {t("share.counterHint")}
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
