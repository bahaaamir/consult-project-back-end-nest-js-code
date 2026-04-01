import React from 'react';

const PILLS = ['Multi-office', 'Role-based access', 'Invite workflows', 'Real-time ops'];
const AVATARS = ['B', 'S', 'A'];

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-svh">

      {/* ── Left branding panel (hidden on mobile) ── */}
      <aside className="hidden lg:flex lg:w-[48%] shrink-0 flex-col justify-between p-11 bg-[var(--sidebar-bg)] relative overflow-hidden">

        {/* Decorative orbs — use .orb-pulse from index.css (keyframe, can't do inline) */}
        <div className="orb-pulse absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full blur-[80px] pointer-events-none bg-[radial-gradient(circle,rgba(14,165,166,0.35)_0%,transparent_70%)]" />
        <div className="orb-pulse-delayed absolute -bottom-16 -right-16 w-[360px] h-[360px] rounded-full blur-[80px] pointer-events-none bg-[radial-gradient(circle,rgba(0,115,200,0.28)_0%,transparent_70%)]" />

        {/* Logo */}
        <header className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 shrink-0 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[var(--brand-mid)] to-[var(--brand-2)] shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_4px_12px_rgba(0,115,200,0.4)]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 6.5V13.5L10 18L2 13.5V6.5L10 2Z" fill="white" fillOpacity="0.9" />
              <path d="M10 6L14 8.5V13L10 15.5L6 13V8.5L10 6Z" fill="white" fillOpacity="0.3" />
            </svg>
          </div>
          <span className="title-font text-[17px] font-bold text-white tracking-tight">Consult PSA</span>
        </header>

        {/* Hero copy */}
        <div className="relative z-10">
          <span className="inline-block mb-5 rounded-full border border-[rgba(14,165,166,0.2)] bg-[rgba(14,165,166,0.12)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--brand-2)]">
            Operations Intelligence
          </span>
          <h2 className="title-font text-[34px] font-extrabold leading-[1.2] tracking-tight text-white mb-4">
            Run your consulting firm from one command center.
          </h2>
          <p className="text-sm leading-relaxed text-[#a8bdd8] mb-7 max-w-[380px]">
            Clients, teams, deliverables, and billing — unified in a single workspace built for professional services.
          </p>
          <div className="flex flex-wrap gap-2">
            {PILLS.map((pill) => (
              <span key={pill} className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1 text-xs font-semibold text-white/75">
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Testimonial footer */}
        <footer className="relative z-10 flex items-start gap-3.5">
          <div className="flex shrink-0">
            {AVATARS.map((letter, i) => (
              <div
                key={i}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--sidebar-bg)] bg-gradient-to-br from-[var(--brand-mid)] to-[var(--brand-2)] text-[11px] font-bold text-white ${i > 0 ? '-ml-2' : ''}`}
              >
                {letter}
              </div>
            ))}
          </div>
          <div>
            <p className="text-[13px] leading-relaxed text-white/65 mb-1">
              "Cut our onboarding time in half. It's the only tool our partners actually use."
            </p>
            <p className="text-[11px] text-white/35">— 3 offices, 40+ consultants</p>
          </div>
        </footer>
      </aside>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>

    </div>
  );
};
