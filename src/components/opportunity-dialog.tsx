import { CalendarDays, ExternalLink, ListChecks, Users, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDeadline } from "@/components/opportunity-card";
import type { Opportunity } from "@/lib/opportunities";

export function OpportunityDialog({
  item,
  onOpenChange,
}: {
  item: Opportunity | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
        {item && (
          <>
            <DialogHeader className="space-y-3 text-left">
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-full bg-accent px-3 py-1 text-accent-foreground">{item.sphere}</Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1">
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
              <DialogTitle className="text-2xl leading-tight">{item.title}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap gap-4 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4" /> Дедлайн: {formatDeadline(item.deadline)}
              </span>
              <span className="inline-flex items-center gap-2">
                {item.format === "Team-based" ? <Users className="size-4" /> : <User className="size-4" />}
                {item.format === "Team-based" ? "Командное участие" : "Индивидуальное участие"}
              </span>
            </div>

            <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
              {item.description || item.snippet}
            </p>

            {item.steps.length > 0 && (
              <div className="space-y-3">
                <h4 className="inline-flex items-center gap-2 text-sm font-semibold">
                  <ListChecks className="size-4 text-primary" /> Как участвовать
                </h4>
                <ol className="space-y-2">
                  {item.steps.map((step, i) => (
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

            {item.url && (
              <Button asChild size="lg" className="gradient-emerald w-full rounded-xl text-primary-foreground">
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  Перейти на официальный сайт <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
