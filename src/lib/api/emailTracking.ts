import { supabase } from "@/integrations/supabase/client";

export interface EmailTrackingRecord {
  id: string;
  user_id: string;
  recipient: string;
  subject: string;
  tracking_id: string;
  sent_at: string;
  opens: number;
  first_opened_at: string | null;
  last_opened_at: string | null;
  clicks: number;
  first_clicked_at: string | null;
  last_clicked_at: string | null;
  created_at: string;
}

export interface TrackingStats {
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  uniqueOpened: number;
  uniqueClicked: number;
  openRate: number;
  clickRate: number;
}

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const TRACKING_BASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/email-tracking`;

export function getTrackingPixelUrl(trackingId: string): string {
  return `${TRACKING_BASE_URL}?tid=${trackingId}&t=open`;
}

export function getTrackingLinkUrl(trackingId: string, originalUrl: string): string {
  return `${TRACKING_BASE_URL}?tid=${trackingId}&t=click&url=${encodeURIComponent(originalUrl)}`;
}

/**
 * Inject tracking pixel and wrap links in HTML email body.
 * Returns { html, trackingId } where trackingId is the UUID used.
 */
export function injectTracking(bodyHtml: string, trackingId: string): string {
  // Wrap all <a href="..."> links
  const wrappedHtml = bodyHtml.replace(
    /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*)>/gi,
    (match, before, href, after) => {
      // Don't wrap mailto: or tel: links
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return match;
      const trackedHref = getTrackingLinkUrl(trackingId, href);
      return `<a ${before}href="${trackedHref}"${after}>`;
    }
  );

  // Append tracking pixel before </body> or at end
  const pixel = `<img src="${getTrackingPixelUrl(trackingId)}" width="1" height="1" style="display:none;" alt="" />`;
  if (wrappedHtml.includes("</body>")) {
    return wrappedHtml.replace("</body>", `${pixel}</body>`);
  }
  return wrappedHtml + pixel;
}

export async function createTrackingRecord(
  recipient: string,
  subject: string,
  trackingId: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase.from("email_tracking").insert({
    user_id: user.id,
    recipient,
    subject,
    tracking_id: trackingId,
  } as any);
}

export async function getTrackingRecords(): Promise<EmailTrackingRecord[]> {
  const { data, error } = await supabase
    .from("email_tracking")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as EmailTrackingRecord[];
}

export function computeStats(records: EmailTrackingRecord[]): TrackingStats {
  const totalSent = records.length;
  const totalOpens = records.reduce((sum, r) => sum + r.opens, 0);
  const totalClicks = records.reduce((sum, r) => sum + r.clicks, 0);
  const uniqueOpened = records.filter((r) => r.opens > 0).length;
  const uniqueClicked = records.filter((r) => r.clicks > 0).length;
  return {
    totalSent,
    totalOpens,
    totalClicks,
    uniqueOpened,
    uniqueClicked,
    openRate: totalSent > 0 ? (uniqueOpened / totalSent) * 100 : 0,
    clickRate: totalSent > 0 ? (uniqueClicked / totalSent) * 100 : 0,
  };
}
