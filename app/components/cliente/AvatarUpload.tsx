"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { createClient } from "@/app/lib/supabase/browser";
import { updateAvatarUrl } from "@/app/actions/profile";

interface Props {
  userId:     string;
  currentUrl: string | null;
  initials:   string;
  size?:      number;
}

export function AvatarUpload({ userId, currentUrl, initials, size = 36 }: Props) {
  const [avatarUrl, setAvatarUrl]    = useState(currentUrl);
  const [uploading, setUploading]    = useState(false);
  const [, startTransition]          = useTransition();
  const inputRef                     = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Imagem muito grande (máx 2 MB)."); return; }

    setUploading(true);
    const supabase = createClient();
    const ext  = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (error) { setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

    // Adiciona cache-bust para forçar reload da imagem
    const urlWithBust = `${publicUrl}?t=${Date.now()}`;
    setAvatarUrl(urlWithBust);

    startTransition(() => updateAvatarUrl(publicUrl));
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0, cursor: "pointer" }}
      title="Clique para alterar foto"
      onClick={() => !uploading && inputRef.current?.click()}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Avatar"
          width={size}
          height={size}
          style={{ borderRadius: "50%", objectFit: "cover", width: size, height: size }}
          unoptimized
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.36,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {uploading ? <i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite", fontSize: size * 0.4 }} /> : initials}
        </div>
      )}

      {/* Overlay de upload */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; }}
      >
        <i className="ti ti-camera" style={{ fontSize: size * 0.38, color: "#fff" }} />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFile}
        style={{ display: "none" }}
      />
    </div>
  );
}
