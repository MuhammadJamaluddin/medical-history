"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Props = {
  personaId: string;
  accountId: string;
};

function todayISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function NewEventForm({ personaId, accountId }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [occurredOn, setOccurredOn] = useState(todayISODate);
  const [tagsInput, setTagsInput] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    const supabase = createClient();

    try {
      const { data: event, error } = await supabase
        .from("events")
        .insert({
          persona_id: personaId,
          account_id: accountId,
          title: title.trim(),
          body: body.trim(),
          occurred_on: occurredOn,
        })
        .select("id")
        .single();

      if (error) throw error;

      const tagNames = [
        ...new Set(
          tagsInput
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean),
        ),
      ];

      for (const name of tagNames) {
        const { data: tag, error: tagErr } = await supabase
          .from("tags")
          .upsert(
            { account_id: accountId, name },
            { onConflict: "account_id,name" },
          )
          .select("id")
          .single();
        if (tagErr) throw tagErr;
        const { error: linkErr } = await supabase.from("event_tags").insert({
          event_id: event.id,
          tag_id: tag.id,
        });
        if (linkErr) throw linkErr;
      }

      if (files?.length) {
        for (const file of Array.from(files)) {
          const path = `${accountId}/${event.id}/${crypto.randomUUID()}-${file.name}`;
          const { error: upErr } = await supabase.storage
            .from("attachments")
            .upload(path, file, {
              contentType: file.type || "application/octet-stream",
              upsert: false,
            });
          if (upErr) throw upErr;

          const { error: attErr } = await supabase.from("attachments").insert({
            event_id: event.id,
            account_id: accountId,
            storage_path: path,
            file_name: file.name,
            content_type: file.type || "application/octet-stream",
            size_bytes: file.size,
          });
          if (attErr) throw attErr;
        }
      }

      toast.success("Event saved");
      setTitle("");
      setBody("");
      setOccurredOn(todayISODate());
      setTagsInput("");
      setFiles(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">New Event</CardTitle>
        <CardDescription>
          Freeform note on the Timeline. Occurred-on is when care happened.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Annual checkup"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occurred_on">Occurred on</Label>
            <Input
              id="occurred_on"
              type="date"
              required
              value={occurredOn}
              onChange={(e) => setOccurredOn(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Notes</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What happened, what was said, follow-ups…"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="cardiology, meds (comma-separated)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="files">Attachments</Label>
            <Input
              id="files"
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Saving…" : "Add Event"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
