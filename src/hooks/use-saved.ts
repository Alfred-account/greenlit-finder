import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";

/** Per-user bookmarks, persisted in Lovable Cloud (row-level secured). */
export function useSavedOpportunities() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setSaved([]);
      return;
    }
    supabase
      .from("saved_opportunities")
      .select("opportunity_id")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("[saved] load failed:", error.message);
          return;
        }
        setSaved((data ?? []).map((r) => r.opportunity_id));
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggle = useCallback(
    async (opportunityId: string) => {
      if (!user) {
        toast.error(t("toast.saveNeedsAuth"));
        return;
      }
      const isSaved = saved.includes(opportunityId);
      setSaved((prev) => (isSaved ? prev.filter((id) => id !== opportunityId) : [...prev, opportunityId]));

      const { error } = isSaved
        ? await supabase
            .from("saved_opportunities")
            .delete()
            .eq("user_id", user.id)
            .eq("opportunity_id", opportunityId)
        : await supabase
            .from("saved_opportunities")
            .insert({ user_id: user.id, opportunity_id: opportunityId });

      if (error) {
        console.error("[saved] toggle failed:", error.message);
        setSaved((prev) => (isSaved ? [...prev, opportunityId] : prev.filter((id) => id !== opportunityId)));
        toast.error(error.message);
        return;
      }
      toast.success(t(isSaved ? "toast.unsaved" : "toast.saved"));
    },
    [saved, t, user],
  );

  return { saved, toggle, isSaved: (id: string) => saved.includes(id), signedIn: !!user };
}
