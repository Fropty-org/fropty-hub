"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { NotificationBell } from "@/app/components/NotificationBell";
import { SessionGuard } from "@/app/components/session/SessionGuard";

interface Props {
  userId: string;
  initials: string;
  avatarUrl?: string | null;
  profileHref: string;
}

/**
 * Topbar desktop do Hub (estilo Preline): busca global (abre o ⌘K),
 * sino de notificações e avatar. Oculta no mobile (o portal-topbar
 * mobile já cobre esse caso).
 */
export function HubTopbar({ userId, initials, avatarUrl, profileHref }: Props) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes("mac"));
  }, []);

  function openSearch() {
    // O CommandPalette escuta este evento dedicado no window.
    window.dispatchEvent(new CustomEvent("hub:open-search"));
  }

  return (
    <header className="hub-topbar">
      <button
        type="button"
        className="hub-topbar-search"
        onClick={openSearch}
        aria-label="Abrir busca global"
      >
        <Search size={14} />
        <span>Buscar no Hub…</span>
        <kbd>{isMac ? "⌘K" : "Ctrl K"}</kbd>
      </button>

      <div className="hub-topbar-right">
        <SessionGuard />
        <NotificationBell userId={userId} />
        <Link href={profileHref} className="hub-topbar-avatar" title="Meu perfil">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={30}
              height={30}
              unoptimized
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            initials
          )}
        </Link>
      </div>
    </header>
  );
}
