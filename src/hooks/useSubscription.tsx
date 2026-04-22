import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useSubscription = () => {
  const { user } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHasActiveSubscription(null);
      setLoading(false);
      return;
    }

    const check = async () => {
      const { data: isAdmin } = await (supabase as any).rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (isAdmin) {
        setHasActiveSubscription(true);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      setHasActiveSubscription(!!data);
      setLoading(false);
    };

    check();
  }, [user]);

  return { hasActiveSubscription, loading };
};
