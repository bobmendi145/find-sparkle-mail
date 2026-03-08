import { useState, useEffect } from "react";
import { Mail, Send, X, Clock, CalendarIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { sendSesEmail } from "@/lib/api/ses";
import { createScheduledEmail } from "@/lib/api/scheduledEmails";
import { EmailTemplate, getEmailTemplates, createEmailTemplate } from "@/lib/api/emailTemplates";
import { cn } from "@/lib/utils";

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: string[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));

const SendEmailDialog = ({ open, onOpenChange, recipients }: SendEmailDialogProps) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [scheduleHour, setScheduleHour] = useState("09");
  const [scheduleMinute, setScheduleMinute] = useState("00");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  const validEmails = recipients.filter((e) => e && e !== "—" && e.includes("@"));

  useEffect(() => {
    if (open) {
      getEmailTemplates().then(setTemplates).catch(console.error);
    }
  }, [open]);

  const buildHtml = () =>
    body
      .split("\n")
      .map((line) => `<p>${line || "&nbsp;"}</p>`)
      .join("");

  const handleSendNow = async () => {
    setSending(true);
    try {
      const result = await sendSesEmail({
        to: validEmails,
        subject: subject.trim(),
        body_html: buildHtml(),
      });
      if (result.success) {
        toast.success(`Email sent to ${result.sent} recipients`);
        resetAndClose();
      } else {
        toast.error(`Sent ${result.sent}, failed ${result.errors.length}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDate) {
      toast.error("Please select a date");
      return;
    }
    const sendAt = new Date(scheduleDate);
    sendAt.setHours(parseInt(scheduleHour), parseInt(scheduleMinute), 0, 0);

    if (sendAt <= new Date()) {
      toast.error("Scheduled time must be in the future");
      return;
    }

    setSending(true);
    try {
      await createScheduledEmail(validEmails, subject.trim(), buildHtml(), sendAt.toISOString());
      toast.success(`Email scheduled for ${format(sendAt, "PPP 'at' HH:mm")}`);
      resetAndClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const resetAndClose = () => {
    onOpenChange(false);
    setSubject("");
    setBody("");
    setScheduleMode(false);
    setScheduleDate(undefined);
  };

  const handleSubmit = () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Please fill in subject and body");
      return;
    }
    if (validEmails.length === 0) {
      toast.error("No valid email addresses to send to");
      return;
    }
    if (scheduleMode) {
      handleSchedule();
    } else {
      handleSendNow();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            <Mail className="w-5 h-5 text-primary" /> Send Email
          </DialogTitle>
          <DialogDescription>
            Compose and send an email to {validEmails.length} recipient{validEmails.length !== 1 ? "s" : ""} via Amazon SES.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Recipients preview */}
          <div>
            <Label className="text-xs">Recipients</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-md border border-border bg-muted/30">
              {validEmails.slice(0, 20).map((email, i) => (
                <Badge key={i} variant="secondary" className="text-[10px]">
                  {email}
                </Badge>
              ))}
              {validEmails.length > 20 && (
                <Badge variant="outline" className="text-[10px]">
                  +{validEmails.length - 20} more
                </Badge>
              )}
            </div>
          </div>

          {/* Subject */}
          <div>
            <Label className="text-xs">Subject</Label>
            <Input
              placeholder="Email subject line..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1"
              maxLength={200}
            />
          </div>

          {/* Body */}
          <div>
            <Label className="text-xs">Message</Label>
            <Textarea
              placeholder="Write your email message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 min-h-[120px] resize-none"
              maxLength={5000}
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">
              {body.length}/5000
            </p>
          </div>

          {/* Schedule toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Schedule for later</p>
                <p className="text-[10px] text-muted-foreground">Choose a date and time to send</p>
              </div>
            </div>
            <Switch checked={scheduleMode} onCheckedChange={setScheduleMode} />
          </div>

          {/* Schedule date/time picker */}
          {scheduleMode && (
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !scheduleDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="w-3.5 h-3.5 mr-2" />
                    {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={setScheduleDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <Select value={scheduleHour} onValueChange={setScheduleHour}>
                <SelectTrigger className="w-[75px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">:</span>
              <Select value={scheduleMinute} onValueChange={setScheduleMinute}>
                <SelectTrigger className="w-[75px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MINUTES.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={sending || !subject.trim() || !body.trim() || validEmails.length === 0 || (scheduleMode && !scheduleDate)}
            onClick={handleSubmit}
          >
            {scheduleMode ? (
              <>
                <Clock className="w-3.5 h-3.5" />
                {sending ? "Scheduling…" : "Schedule"}
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                {sending ? "Sending…" : `Send to ${validEmails.length}`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendEmailDialog;
