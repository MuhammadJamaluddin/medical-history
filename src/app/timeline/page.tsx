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
          "id, title, body, occurred_on, recorded_at, event_tags(tag_id, tags(name)), attachments(id, file_name)",
        )
        .eq("persona_id", self.id)
        .order("occurred_on", { ascending: false })
    : { data: [] as const };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
          <p className="text-muted-foreground">
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
        <p className="text-sm text-muted-foreground">
          Personas: {personas.map((p) => p.name).join(" · ")}
        </p>
      ) : null}

      {self ? (
        <NewEventForm personaId={self.id} accountId={user.id} />
      ) : null}

      {!events?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No Events yet</CardTitle>
            <CardDescription>
              Use the form above to capture the first one.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event) => {
            const tagNames =
              event.event_tags
                ?.map((et) => {
                  const t = et.tags as { name: string } | { name: string }[] | null;
                  if (!t) return null;
                  return Array.isArray(t) ? t[0]?.name : t.name;
                })
                .filter(Boolean) ?? [];
            const atts = event.attachments ?? [];
            let when = event.occurred_on;
            try {
              when = format(parseISO(event.occurred_on), "MMM d, yyyy");
            } catch {
              /* keep raw */
            }

            return (
              <li key={event.id}>
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="text-base">{event.title}</CardTitle>
                      <CardDescription className="whitespace-pre-wrap">
                        <span className="font-medium text-foreground/80">
                          {when}
                        </span>
                        {event.body ? `\n${event.body}` : null}
                      </CardDescription>
                      {tagNames.length > 0 ? (
                        <p className="pt-1 text-xs text-muted-foreground">
                          {tagNames.join(" · ")}
                        </p>
                      ) : null}
                      {atts.length > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          {atts.map((a) => a.file_name).join(", ")}
                        </p>
                      ) : null}
                    </div>
                    <DeleteEventButton eventId={event.id} />
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
