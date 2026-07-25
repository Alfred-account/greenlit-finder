import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitOpportunity, type SubmissionInput } from "@/lib/airtable.functions";
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
  format: "Individual",
  url: "",
  description: "",
};

function SharePage() {
  const router = useRouter();
  const submit = useServerFn(submitOpportunity);
  const [form, setForm] = useState<SubmissionInput>(empty);

  const mutation = useMutation({
    mutationFn: (data: SubmissionInput) => submit({ data }),
    onSuccess: () => {
      toast.success("Заявка отправлена на модерацию!");
      setForm(empty);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Не удалось отправить заявку");
    },
  });

  function set<K extends keyof SubmissionInput>(key: K, value: SubmissionInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sphere || !form.grade) {
      toast.error("Выберите направление и класс");
      return;
    }
    mutation.mutate(form);
  }

  return (
    <main className="hero-surface min-h-screen px-6 py-14">
      <div className="mx-auto w-full max-w-2xl">
        <Button variant="ghost" onClick={() => router.history.back()} className="mb-6 -ml-2 rounded-xl">
          <ArrowLeft className="size-4" /> Назад
        </Button>

        <h1 className="text-4xl font-bold">Поделись своей возможностью бесплатно!</h1>
        <p className="mt-3 text-muted-foreground">
          Заполните короткую форму — мы проверим заявку и опубликуем её в каталоге. Это бесплатно.
        </p>

        <form
          onSubmit={onSubmit}
          className="shadow-soft mt-8 space-y-6 rounded-2xl border border-border/70 bg-card p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Ваше имя" required>
              <Input
                required
                maxLength={100}
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
                placeholder="Айгерим"
                className="h-11 rounded-xl"
              />
            </Field>
            <Field label="Контакт (Email / Telegram)" required>
              <Input
                required
                maxLength={200}
                value={form.contactInfo}
                onChange={(e) => set("contactInfo", e.target.value)}
                placeholder="you@mail.com или @username"
                className="h-11 rounded-xl"
              />
            </Field>
          </div>

          <Field label="Название события" required>
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
            <Field label="Направление" required>
              <Selector value={form.sphere} onChange={(v) => set("sphere", v)} options={[...SPHERES]} />
            </Field>
            <Field label="Класс / уровень" required>
              <Selector value={form.grade} onChange={(v) => set("grade", v)} options={[...GRADES]} />
            </Field>
            <Field label="Стоимость" required>
              <Selector
                value={form.cost}
                onChange={(v) => set("cost", v as SubmissionInput["cost"])}
                options={[...COSTS]}
                labels={{ Free: "Бесплатно", Paid: "Платно" }}
              />
            </Field>
            <Field label="Формат участия" required>
              <Selector
                value={form.format}
                onChange={(v) => set("format", v as SubmissionInput["format"])}
                options={[...FORMATS]}
                labels={{ Individual: "Индивидуально", "Team-based": "Командно" }}
              />
            </Field>
          </div>

          <Field label="Ссылка на сайт" required>
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

          <Field label="Описание" required>
            <Textarea
              required
              maxLength={4000}
              rows={7}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={"Кратко о событии, этапах и призах.\nКаждый шаг участия — с новой строки."}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              {form.description.length}/4000 — переносы строк сохраняются в описании.
            </p>
          </Field>

          <Button
            type="submit"
            size="lg"
            disabled={mutation.isPending}
            className="gradient-emerald h-12 w-full rounded-xl text-primary-foreground"
          >
            {mutation.isPending ? "Отправляем…" : "Отправить на модерацию"}
            <Send className="size-4" />
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Уже отправили?{" "}
            <Link to="/" className="font-medium text-primary hover:underline">
              Вернуться в каталог
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
  labels,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11 w-full rounded-xl">
        <SelectValue placeholder="Выберите…" />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {labels?.[o] ?? o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
