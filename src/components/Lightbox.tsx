"use client";

import { useEffect } from "react";
import type { ImageAttachment } from "@/types";

export default function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: ImageAttachment[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange(Math.min(index + 1, images.length - 1));
      if (e.key === "ArrowLeft") onIndexChange(Math.max(index - 1, 0));
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, images.length, onClose, onIndexChange]);

  const image = images[index];
  if (!image) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white transition-colors hover:bg-white/20"
      >
        ×
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange(Math.max(index - 1, 0));
            }}
            disabled={index === 0}
            aria-label="Previous photo"
            className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white transition-colors hover:bg-white/20 disabled:opacity-30"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange(Math.min(index + 1, images.length - 1));
            }}
            disabled={index === images.length - 1}
            aria-label="Next photo"
            className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white transition-colors hover:bg-white/20 disabled:opacity-30"
          >
            ›
          </button>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element -- local dynamic image served from our own API route, not a next/image candidate */}
      <img
        src={`/api/images/${image.filename}`}
        alt=""
        className="max-h-[85vh] max-w-full rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
