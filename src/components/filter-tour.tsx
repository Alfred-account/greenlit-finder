import { HelpCircle } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";

/** Guided walkthrough of the filter panel (spotlight + step popovers). */
export function FilterTourButton({ onFinish }: { onFinish?: () => void }) {
  const { t } = useI18n();

  function start() {
    const step = (selector: string, title: string, text: string) => ({
      element: selector,
      popover: { title, description: text, side: "bottom" as const, align: "start" as const },
    });

    const tour = driver({
      showProgress: true,
      overlayColor: "#04150f",
      overlayOpacity: 0.65,
      stagePadding: 8,
      stageRadius: 14,
      popoverClass: "gls-tour",
      nextBtnText: t("tour.next"),
      prevBtnText: "←",
      doneBtnText: t("tour.done"),
      progressText: "{{current}} / {{total}}",
      steps: [
        step('[data-tour="sphere"]', t("tour.s1.title"), t("tour.s1.text")),
        step('[data-tour="grade"]', t("tour.s2.title"), t("tour.s2.text")),
        step('[data-tour="cost"]', t("tour.s3.title"), t("tour.s3.text")),
        step('[data-tour="format"]', t("tour.s4.title"), t("tour.s4.text")),
        step('[data-tour="dates"]', t("tour.s5.title"), t("tour.s5.text")),
        {
          popover: {
            title: t("tour.s6.title"),
            description: t("tour.s6.text"),
          },
        },
      ],
      onDestroyed: () => onFinish?.(),
    });

    tour.drive();
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={start}
            aria-label={t("help.tooltip")}
            className="size-9 shrink-0 rounded-full border-primary/40 text-primary transition-transform hover:scale-105"
          >
            <HelpCircle className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("help.tooltip")}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
