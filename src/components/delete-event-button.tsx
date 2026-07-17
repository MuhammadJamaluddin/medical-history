"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-destructive"
      onClick={async () => {
        if (!confirm("Delete this Event permanently?")) return;
        const supabase = createClient();
        const { data: atts } = await supabase
          .from("attachments")
          .select("storage_path")
          .eq("event_id", eventId);
        if (atts?.length) {
          await supabase.storage
            .from("attachments")
            .remove(atts.map((a) => a.storage_path));
        }
        const { error } = await supabase
          .from("events")
          .delete()
          .eq("id", eventId);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Event deleted");
        router.refresh();
      }}
    >
      Delete
    </Button>
  );
}
