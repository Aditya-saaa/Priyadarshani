"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Input } from "./ui";

/**
 * Image input that supports direct upload (auto-compressed server-side)
 * or pasting an external URL, with live preview.
 */
export function ImagePicker({
  value,
  onChange,
  allowEmpty = false,
}: {
  value: string;
  onChange: (url: string) => void;
  allowEmpty?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("files", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.urls?.[0]) {
        onChange(data.urls[0]);
      } else {
        setError(data.error || "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {value && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="h-32 w-52 rounded-lg border border-zinc-800 object-cover"
          />
          {allowEmpty && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove image"
              className="absolute -right-2 -top-2 rounded-full bg-zinc-800 p-1 text-zinc-300 hover:text-red-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:border-amber-400/50 hover:text-amber-300 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload image"}
        </button>
        <span className="text-xs text-zinc-500">or paste a URL:</span>
        <Input
          type="url"
          value={value}
          placeholder="https://…"
          onChange={(e) => onChange(e.target.value)}
          className="!w-72"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
