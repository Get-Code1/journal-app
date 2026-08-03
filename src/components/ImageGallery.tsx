"use client";

import { useRef, useState } from "react";
import Lightbox from "@/components/Lightbox";
import type { ImageAttachment } from "@/types";

export default function ImageGallery({
  date,
  initialImages,
}: {
  date: string;
  initialImages: ImageAttachment[];
}) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of list) formData.append("file", file);

      const res = await fetch(`/api/entries/${date}/images`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setImages((prev) => [...prev, ...data.images]);
      }
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(id: number) {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setLightboxIndex(null);
    await fetch(`/api/entries/${date}/images/${id}`, { method: "DELETE" });
  }

  return (
    <div
      className={`rounded-2xl border-2 border-dashed p-3 transition-colors duration-150 ${
        dragActive ? "border-accent bg-accent-soft/40" : "border-transparent"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        uploadFiles(e.dataTransfer.files);
      }}
    >
      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <div
            key={img.id}
            className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border-subtle shadow-sm"
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="block h-full w-full"
              aria-label="View photo"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local dynamic image served from our own API route, not a next/image candidate */}
              <img
                src={`/api/images/${img.filename}`}
                alt=""
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </button>
            <button
              type="button"
              onClick={() => removeImage(img.id)}
              aria-label="Remove photo"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-foreground-muted transition-colors duration-150 hover:border-accent hover:text-accent disabled:opacity-50"
        >
          <span className="text-lg leading-none">{uploading ? "…" : "+"}</span>
          <span className="text-[10px]">Photo</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) uploadFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}
