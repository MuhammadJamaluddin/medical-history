"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export type AttachmentView = {
  id: string;
  fileName: string;
  contentType: string;
  url: string;
};

function isImage(contentType: string, fileName: string) {
  if (contentType.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|avif|svg|heic|bmp)$/i.test(fileName);
}

function isPdf(contentType: string, fileName: string) {
  if (contentType === "application/pdf") return true;
  return /\.pdf$/i.test(fileName);
}

export function EventAttachments({
  attachments,
}: {
  attachments: AttachmentView[];
}) {
  const [preview, setPreview] = useState<AttachmentView | null>(null);

  if (!attachments.length) return null;

  return (
    <>
      <div className="flex flex-col gap-3 pt-2">
        {attachments.map((att) => {
          if (isImage(att.contentType, att.fileName)) {
            return (
              <button
                key={att.id}
                type="button"
                className="group block w-full overflow-hidden rounded-lg border border-border text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                onClick={() => setPreview(att)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={att.url}
                  alt={att.fileName}
                  className="max-h-72 w-full object-contain bg-muted/40 transition group-hover:opacity-95"
                />
                <span className="block truncate px-2.5 py-1.5 text-sm text-muted-foreground">
                  {att.fileName}
                </span>
              </button>
            );
          }

          if (isPdf(att.contentType, att.fileName)) {
            return (
              <div
                key={att.id}
                className="overflow-hidden rounded-lg border border-border"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border px-2.5 py-1.5">
                  <span className="truncate text-sm text-muted-foreground">
                    {att.fileName}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreview(att)}
                    >
                      Expand
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      render={
                        <a href={att.url} target="_blank" rel="noreferrer" />
                      }
                    >
                      Open
                    </Button>
                  </div>
                </div>
                <iframe
                  title={att.fileName}
                  src={att.url}
                  className="h-80 w-full bg-background"
                />
              </div>
            );
          }

          return (
            <a
              key={att.id}
              href={att.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-primary underline-offset-4 hover:bg-muted hover:underline"
            >
              {att.fileName}
            </a>
          );
        })}
      </div>

      {preview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={preview.fileName}
          onClick={() => setPreview(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setPreview(null);
          }}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 text-white">
              <p className="truncate text-base font-medium">{preview.fileName}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  render={
                    <a href={preview.url} target="_blank" rel="noreferrer" />
                  }
                >
                  Open
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setPreview(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            {isImage(preview.contentType, preview.fileName) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview.url}
                alt={preview.fileName}
                className="max-h-[80vh] w-full rounded-lg object-contain bg-black"
              />
            ) : (
              <iframe
                title={preview.fileName}
                src={preview.url}
                className="h-[80vh] w-full rounded-lg bg-background"
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
