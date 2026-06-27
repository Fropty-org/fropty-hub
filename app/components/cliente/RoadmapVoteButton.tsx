"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, Loader2 } from "lucide-react";
import { toggleVote } from "@/app/actions/roadmap";

interface Props {
  itemId: string;
  initialVotes: number;
  initialVoted: boolean;
}

export function RoadmapVoteButton({ itemId, initialVotes, initialVoted }: Props) {
  const [voted,   setVoted]   = useState(initialVoted);
  const [votes,   setVotes]   = useState(initialVotes);
  const [pending, start]      = useTransition();

  function handleVote() {
    start(async () => {
      const result = await toggleVote(itemId);
      if (!result.error) {
        setVoted(result.voted);
        setVotes((v) => result.voted ? v + 1 : v - 1);
      }
    });
  }

  return (
    <button
      onClick={handleVote}
      disabled={pending}
      title={voted ? "Remover voto" : "Votar nesta feature"}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        gap:            5,
        padding:        "5px 10px",
        borderRadius:   8,
        fontSize:       "12px",
        fontWeight:     700,
        border:         `1px solid ${voted ? "var(--primary)" : "var(--border)"}`,
        background:     voted ? "rgba(91,87,232,0.12)" : "transparent",
        color:          voted ? "var(--primary)" : "var(--text-faint)",
        cursor:         pending ? "not-allowed" : "pointer",
        transition:     "all 0.15s",
        opacity:        pending ? 0.6 : 1,
        fontFamily:     "inherit",
      }}
    >
      {pending
        ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
        : <ThumbsUp size={13} />}
      {votes}
    </button>
  );
}
