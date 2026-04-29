import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UsageQuota {
  daily_used: number;
  daily_limit: number;
  monthly_used: number;
  monthly_limit: number;
  is_admin: boolean;
}

export const useUsageQuota = () => {
  const { user } = useAuth();
  const [quota, setQuota] = useState<UsageQuota | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setQuota(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await (supabase as any).rpc("get_usage_quota", { _user_id: user.id });
    if (!error && data?.[0]) setQuota(data[0] as UsageQuota);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const remainingDaily = quota
    ? quota.is_admin ? Infinity : Math.max(0, quota.daily_limit - quota.daily_used)
    : 0;
  const remainingMonthly = quota
    ? quota.is_admin ? Infinity : Math.max(0, quota.monthly_limit - quota.monthly_used)
    : 0;
  const canSearch = quota?.is_admin || (remainingDaily > 0 && remainingMonthly > 0);

  return { quota, loading, refresh, remainingDaily, remainingMonthly, canSearch };
};
