"use client";

import type { ReactNode } from "react";

// Opens the guest authentication modal from server-rendered layouts.
// The trigger button is rendered by RAVINEControls (client).
export default function RAVINEOpenAuth({ className, children }: { className?: string; children: ReactNode }) {
  return <a href="#" className={className} onClick={(e) => { e.preventDefault(); document.querySelector<HTMLButtonElement>(".rv-modal-trigger")?.click(); }}>{children}</a>;
}
