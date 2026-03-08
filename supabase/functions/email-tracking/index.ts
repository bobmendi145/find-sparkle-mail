import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 1x1 transparent GIF pixel
const TRACKING_PIXEL = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), c => c.charCodeAt(0));

serve(async (req) => {
  const url = new URL(req.url);
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const trackingId = url.searchParams.get("tid");
  const eventType = url.searchParams.get("t"); // "open" or "click"
  const redirectUrl = url.searchParams.get("url");
  const userAgent = req.headers.get("user-agent") || "";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!trackingId) {
    return new Response("Missing tracking ID", { status: 400 });
  }

  try {
    // Look up the tracking record
    const { data: tracking } = await supabase
      .from("email_tracking")
      .select("id")
      .eq("tracking_id", trackingId)
      .single();

    if (tracking) {
      // Log the event
      await supabase.from("email_tracking_events").insert({
        tracking_id: tracking.id,
        event_type: eventType === "click" ? "click" : "open",
        url: redirectUrl || null,
        user_agent: userAgent.slice(0, 500),
        ip_address: ip,
      });

      // Update aggregate counters
      const now = new Date().toISOString();
      if (eventType === "click") {
        const { data: current } = await supabase
          .from("email_tracking")
          .select("clicks, first_clicked_at")
          .eq("id", tracking.id)
          .single();
        await supabase.from("email_tracking").update({
          clicks: (current?.clicks || 0) + 1,
          first_clicked_at: current?.first_clicked_at || now,
          last_clicked_at: now,
        }).eq("id", tracking.id);
      } else {
        const { data: current } = await supabase
          .from("email_tracking")
          .select("opens, first_opened_at")
          .eq("id", tracking.id)
          .single();
        await supabase.from("email_tracking").update({
          opens: (current?.opens || 0) + 1,
          first_opened_at: current?.first_opened_at || now,
          last_opened_at: now,
        }).eq("id", tracking.id);
      }
    }
  } catch (e) {
    console.error("Tracking error:", e);
    // Don't fail the response - tracking should be invisible
  }

  // For clicks, redirect to the original URL
  if (eventType === "click" && redirectUrl) {
    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });
  }

  // For opens, return the tracking pixel
  return new Response(TRACKING_PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
});
