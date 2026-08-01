import { CalendarDays, ExternalLink, Instagram, ListChecks, MapPin, Globe, Blend, Users, User, Wallet, Ticket } from "lucide-react";


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDeadline } from "@/components/opportunity-card";
import { useI18n } from "@/lib/i18n";
import type { Opportunity } from "@/lib/opportunities";


export function OpportunityDialog({
  item,
  onOpenChange,
}: {
  item: Opportunity | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, tSphere, tGrades, tDelivery, tItem, tPlace, localeTag } = useI18n();
  const local = item ? tItem(item) : null;
  const place = item ? [tPlace(item.city), tPlace(item.country)].filter(Boolean).join(", ") : "";






  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
        {item && (
          <>
            <DialogHeader className="space-y-3 text-left">
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-full bg-accent px-3 py-1 text-accent-foreground">
                  {tSphere(item.sphere)}
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {tGrades(item.grades)}
                </Badge>
                <Badge
                  className={
                    item.cost === "Free"
                      ? "rounded-full bg-primary px-3 py-1 text-primary-foreground"
                      : "rounded-full bg-muted px-3 py-1 text-muted-foreground"
                  }
                >
                  {item.cost === "Free"
                    ? t("cost.free")
                    : item.price
                      ? `${t("cost.paid")} · ${item.price}`
                      : t("cost.paid")}
                </Badge>
              </div>
              <DialogTitle className="text-2xl leading-tight">{local?.title}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap gap-4 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4" /> {t("dialog.deadline")}:{" "}
                {formatDeadline(item.deadline, localeTag, t("card.noDeadline"))}
              </span>
              <span className="inline-flex items-center gap-2">
                <Wallet className="size-4" /> {t("dialog.cost")}:{" "}
                {item.cost === "Free" ? t("cost.free") : item.price ? item.price : t("dialog.paidTbd")}
              </span>
              <span className="inline-flex items-center gap-2">
                {item.format === "Team-based" ? <Users className="size-4" /> : <User className="size-4" />}
                {item.format === "Team-based" ? t("dialog.formatTeam") : t("dialog.formatIndividual")}
              </span>
              <span className="inline-flex items-center gap-2">
                {item.delivery === "Offline" ? (
                  <MapPin className="size-4" />
                ) : item.delivery === "Hybrid" ? (
                  <Blend className="size-4" />
                ) : (
                  <Globe className="size-4" />
                )}
                {t("dialog.delivery")}: {tDelivery(item.delivery)}
              </span>
              {place && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4 text-primary" /> {place}
                </span>
              )}
            </div>


            <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
              {local?.description || local?.snippet}
            </p>

            {(local?.steps.length ?? 0) > 0 && (
              <div className="space-y-3">
                <h4 className="inline-flex items-center gap-2 text-sm font-semibold">
                  <ListChecks className="size-4 text-primary" /> {t("dialog.steps")}
                </h4>
                <ol className="space-y-2">
                  {local!.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="space-y-2">
              {item.url && (
                <Button asChild size="lg" className="gradient-emerald w-full rounded-xl text-primary-foreground">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {t("dialog.official")} <ExternalLink className="size-4" />
                  </a>
                </Button>
              )}
              {(item.registerUrl || item.instagram) && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {item.registerUrl && (
                    <Button asChild variant="outline" size="lg" className="w-full rounded-xl border-primary/40 text-primary">
                      <a href={item.registerUrl} target="_blank" rel="noopener noreferrer">
                        <Ticket className="size-4" /> {t("dialog.register")}
                      </a>
                    </Button>
                  )}
                  {item.instagram && (
                    <Button asChild variant="outline" size="lg" className="w-full rounded-xl border-primary/40 text-primary">
                      <a href={item.instagram} target="_blank" rel="noopener noreferrer">
                        <Instagram className="size-4" /> {t("dialog.instagram")}
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>



          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
