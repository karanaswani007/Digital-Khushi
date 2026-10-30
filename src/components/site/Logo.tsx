export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <ellipse cx="22" cy="26" rx="14" ry="11" fill="currentColor" transform="rotate(-28 22 26)" />
      <ellipse cx="42" cy="26" rx="14" ry="11" fill="var(--color-teal)" transform="rotate(28 42 26)" />
      <ellipse cx="24" cy="42" rx="9" ry="8" fill="currentColor" opacity="0.88" />
      <ellipse cx="40" cy="42" rx="9" ry="8" fill="var(--color-teal)" />
      <rect x="30" y="18" width="4" height="30" rx="2" fill="var(--color-deep)" />
      <circle cx="32" cy="16" r="3.2" fill="var(--color-deep)" />
    </svg>
  );
}

export function Wordmark({ tagline }: { tagline: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-11 place-items-center rounded-2xl bg-soft text-royal">
        <LogoMark className="size-8" />
      </span>
      <span className="grid leading-tight">
        <span className="text-base font-extrabold tracking-tight text-ink">Digital Khushi</span>
        <span className="text-xs font-medium text-muted">{tagline}</span>
      </span>
    </span>
  );
}

export function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.4a10.1 10.1 0 0 0 4.65 1.12h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2Zm5.78 14.18c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.14-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.36c.24-.28.64-.41 1.02-.41.12 0 .23 0 .33.01.3.01.44.03.64.49.24.56.8 1.95.87 2.09.07.14.12.31.02.49-.09.19-.14.31-.28.48-.14.16-.29.37-.41.49-.14.14-.28.29-.12.56.16.28.72 1.18 1.54 1.91 1.06.94 1.95 1.24 2.23 1.38.28.14.44.12.6-.07.16-.19.7-.81.88-1.09.19-.28.37-.23.62-.14.26.09 1.63.77 1.91.91.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}
