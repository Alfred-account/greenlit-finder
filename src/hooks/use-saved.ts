import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { useI18n } from "@/lib/i18n";

const STORAGE_KEY = "greenlit_saved_opportunities";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.map((v) => String(v)) : [];
  } catch {
    return [];
  }
}

/** Bookmarks kept on the current device — no account required. */
export function useSavedOpportunities() {
  const { t } = useI18n();
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    setSaved(read());
  }, []);

  const toggle = useCallback(
    (opportunityId: string) => {
      setSaved((prev) => {
        const isSaved = prev.includes(opportunityId);
        const next = isSaved ? prev.filter((id) => id !== opportunityId) : [...prev, opportunityId];
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* storage may be unavailable in private mode */
        }
        toast.success(t(isSaved ? "toast.unsaved" : "toast.saved"));
        return next;
      });
    },
    [t],
  );

  return { saved, toggle, isSaved: (id: string) => saved.includes(id), signedIn: true };
}
