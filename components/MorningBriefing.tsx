"use client";

import React from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";

const BRIEFING_LABEL = "\uD83D\uDCF0 \uC870\uAC04 \uBE0C\uB9AC\uD551";

export default function MorningBriefing() {
  return (
    <Link
      href="/briefing"
      className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#D35400] text-white text-sm sm:text-base font-bold shadow-md hover:bg-[#c04800] transition-colors w-full"
    >
      <Newspaper className="w-4 h-4 sm:w-5 sm:h-5" />
      <span>{BRIEFING_LABEL}</span>
    </Link>
  );
}




