import { useState, useEffect } from "react";
import { FileText, Plus, Trash2, Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  EmailTemplate,
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "@/lib/api/emailTemplates";

const EmailTemplateManager = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTemplates = async () => {
    try {
      const data = await getEmailTemplates();
      setTemplates(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const resetForm = () => {
    setName("");
    setSubject("");
    setBodyText("");
    setEditing(null);
    setCreating(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateEmailTemplate(editing, name.trim(), subject.trim(), bodyText);
        setTemplates((prev) => prev.map((t) => (t.id === editing ? updated : t)));
        toast.success("Template updated");
      } else {
        const created = await createEmailTemplate(name.trim(), subject.trim(), bodyText);
        setTemplates((prev) => [created, ...prev]);
        toast.success("Template saved");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t: EmailTemplate) => {
    setEditing(t.id);
    setCreating(true);
    setName(t.name);
    setSubject(t.subject);
    setBodyText(t.body_text);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmailTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (editing === id) resetForm();
      toast.success("Template deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="frappe-card p-8 text-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create / Edit form */}
      {creating ? (
        <div className="frappe-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">
              {editing ? "Edit Template" : "New Template"}
            </h4>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div>
            <Label className="text-xs">Template Name</Label>
            <Input
              placeholder="e.g. Cold Outreach v1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              maxLength={100}
            />
          </div>
          <div>
            <Label className="text-xs">Subject Line</Label>
            <Input
              placeholder="Email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1"
              maxLength={200}
            />
          </div>
          <div>
            <Label className="text-xs">Body</Label>
            <Textarea
              placeholder="Write your email template body..."
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="mt-1 min-h-[100px] resize-none"
              maxLength={5000}
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">
              {bodyText.length}/5000
            </p>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()}>
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving…" : editing ? "Update Template" : "Save Template"}
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
          <Plus className="w-3.5 h-3.5" /> New Template
        </Button>
      )}

      {/* Template list */}
      {templates.length === 0 && !creating ? (
        <div className="frappe-card p-8 text-center">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No templates yet. Create one to speed up email composition.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className="frappe-card p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                {t.subject && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    Subject: {t.subject}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {t.body_text || "No body content"}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailTemplateManager;
