"use client";

import { useTransition } from "react";
import { togglePublished } from "@/app/actions/knowledge";
import { useT } from "@/app/lib/i18n/I18nProvider";

export function TogglePublishedButton({ id, published }: { id: string; published: boolean }) {
  const t = useT();
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(async () => { await togglePublished(id); })}
      disabled={pending}
      style={{
        padding: "3px 10px", borderRadius: 999,
        border: "none", cursor: pending ? "not-allowed" : "pointer",
        fontSize: "0.75rem", fontWeight: 700,
        background: published ? "rgba(34,197,94,0.12)" : "rgba(100,116,139,0.12)",
        color: published ? "var(--c-success)" : "var(--text-faint)",
        opacity: pending ? 0.6 : 1,
        fontFamily: "inherit",
        transition: "opacity 0.15s",
      }}
    >
      {published ? t("admin.kb.statePublished") : t("admin.kb.stateDraft")}
    </button>
  );
}
