import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignOutButton } from "@/components/sign-out-button";
import { NewEventForm } from "@/components/new-event-form";
import { DeleteEventButton } from "@/components/delete-event-button";
import {
  EventAttachments,
  type AttachmentView,
} from "@/components/event-attachments";
import { format, parseISO } from "date-fns";

export default async function TimelinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: personas } = await supabase
    .from("personas")
    .select("id, name, is_self")
    .order("is_self", { ascending: false });

  const self = personas?.find((p) => p.is_self) ?? personas?.[0];

  const { data: events } = self
    ? await supabase
        .from("events")
        .select(
          "id, title, body, occurred_on, recorded_at, event_tags(tag_id, tags(name)), attachments(id, file_name, content_type, storage_path)",
        )
        .eq("persona_id", self.id)
        .order("occurred_on", { ascending: false })
    : { data: [] as const };

  const eventsWithUrls = await Promise.all(
    (events ?? []).map(async (event) => {
      const rawAtts = event.attachments ?? [];
      const attachments: AttachmentView[] = [];

      for (const att of rawAtts) {
        const { data } = await supabase.storage
          .from("attachments")
          .createSignedUrl(att.storage_path, 60 * 60);
        if (data?.signedUrl) {
          attachments.push({
            id: att.id,
            fileName: att.file_name,
            contentType: att.content_type,
            url: data.signedUrl,
          });
        }
      }

      return { ...event, attachmentViews: attachments };
    }),
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Timeline</h1>
          <p className="text-lg text-muted-foreground">
            {self ? (
              <>
                <span className="font-medium text-foreground">{self.name}</span>
                {self.is_self ? " · Self" : null}
              </>
            ) : (
              "No Persona yet"
            )}
          </p>
        </div>
        <SignOutButton />
      </div>

      {personas && personas.length > 1 ? (
        <p className="text-base text-muted-foreground">
          Personas: {personas.map((p) => p.name).join(" · ")}
        </p>
      ) : null}

      {self ? (
        <NewEventForm personaId={self.id} accountId={user.id} />
      ) : null}

      {!eventsWithUrls.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">No Events yet</CardTitle>
            <CardDescription className="text-base">
              Use the form above to capture the first one.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {eventsWithUrls.map((event) => {
            const tagNames =
              event.event_tags
                ?.map((et) => {
                  const t = et.tags as
                    | { name: string }
                    | { name: string }[]
                    | null;
                  if (!t) return null;
                  return Array.isArray(t) ? t[0]?.name : t.name;
                })
                .filter(Boolean) ?? [];
            let when = event.occurred_on;
            try {
              when = format(parseISO(event.occurred_on), "MMM d, yyyy");
            } catch {
              /* keep raw */
            }

            return (
              <li key={event.id}>
                <Card>
                  <CardHeader className="space-y-2">
                    <div className="flex flex-row items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <CardDescription className="text-base whitespace-pre-wrap">
                          <span className="font-medium text-foreground/80">
                            {when}
                          </span>
                          {event.body ? `\n${event.body}` : null}
                        </CardDescription>
                        {tagNames.length > 0 ? (
                          <p className="pt-1 text-sm text-muted-foreground">
                            {tagNames.join(" · ")}
                          </p>
                        ) : null}
                      </div>
                      <DeleteEventButton eventId={event.id} />
                    </div>
                    <EventAttachments attachments={event.attachmentViews} />
                  </CardHeader>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
