import { useState } from "react";
import { Mail, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { sendSesEmail } from "@/lib/api/ses";

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: string[];
}

const SendEmailDialog = ({ open, onOpenChange, recipients }: SendEmailDialogProps) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const validEmails = recipients.filter((e) => e && e !== "—" && e.includes("@"));

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Please fill in subject and body");
      return;
    }
    if (validEmails.length === 0) {
      toast.error("No valid email addresses to send to");
      return;
    }

    setSending(true);
    try {
      const bodyHtml = body
        .split("\n")
        .map((line) => `<p>${line || "&nbsp;"}</p>`)
        .join("");

      const result = await sendSesEmail({
        to: validEmails,
        subject: subject.trim(),
        body_html: bodyHtml,
      });

      if (result.success) {
        toast.success(`Email sent to ${result.sent} recipients`);
        onOpenChange(false);
        setSubject("");
        setBody("");
      } else {
        toast.error(`Sent ${result.sent}, failed ${result.errors.length}`);
        if (result.errors.length > 0) {
          console.error("Email errors:", result.errors);
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
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
              className="mt-1 min-h-[160px] resize-none"
              maxLength={5000}
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">
              {body.length}/5000
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={sending || !subject.trim() || !body.trim() || validEmails.length === 0}
            onClick={handleSend}
          >
            <Send className="w-3.5 h-3.5" />
            {sending ? "Sending…" : `Send to ${validEmails.length}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendEmailDialog;
