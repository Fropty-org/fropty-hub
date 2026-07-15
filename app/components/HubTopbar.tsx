"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { NotificationBell } from "@/app/components/NotificationBell";
import { SessionGuard } from "@/app/components/session/SessionGuard";
import { HelpMenu } from "@/app/components/HelpMenu";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
import { AccountMenu } from "@/app/components/AccountMenu";
import { useT } from "@/app/lib/i18n/I18nProvider";

interface Props {
  userId: string;
  initials: string;
  avatarUrl?: string | null;
  profileHref: string;
  name: string;
  email: string;
  roleLabel: string;
  initialTheme?: "dark" | "light";
}

/**
 * Topbar desktop do Hub (estilo Preline): busca global (abre o ⌘K),
 * sino de notificações e avatar. Oculta no mobile (o portal-topbar
 * mobile já cobre esse caso).
 */
export function HubTopbar({ userId, initials, avatarUrl, profileHref, name, email, roleLabel, initialTheme }: Props) {
  const t = useT();
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
        aria-label={t("common.searchHub")}
      >
        <Search size={14} />
        <span>{t("common.searchHub")}</span>
        <kbd>{isMac ? "⌘K" : "Ctrl K"}</kbd>
      </button>

      <div className="hub-topbar-right">
        <SessionGuard />
        <LanguageSwitcher />
        <HelpMenu />
        <NotificationBell userId={userId} />
        <AccountMenu
          name={name}
          email={email}
          initials={initials}
          avatarUrl={avatarUrl}
          roleLabel={roleLabel}
          profileHref={profileHref}
          initialTheme={initialTheme}
        />
      </div>
    </header>
  );
}
