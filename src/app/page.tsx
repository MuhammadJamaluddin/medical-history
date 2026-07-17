import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Personal medical memory
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Your history, your people, one quiet place.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground text-pretty">
          Capture freeform Events on a Timeline for yourself and the people you
          care for—mother, child, anyone under your Account. Private by default.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Get started
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href="/timeline" />}
          >
            Open timeline
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personas</CardTitle>
            <CardDescription>
              Self plus family under one login—no care-team complexity.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
            <CardDescription>
              Events ordered by when care happened, not when you typed.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attachments</CardTitle>
            <CardDescription>
              PDFs and photos on Events, locked to your Account.
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      </div>
    </main>
  );
}
