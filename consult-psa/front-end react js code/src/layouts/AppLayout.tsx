import { type ReactNode, useState } from 'react';
import { useAuthStore } from '../store/authStore';

interface NavItem {
  key: string;
  label: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    key: 'team',
    label: 'Team',
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'clients',
    label: 'Clients',
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
        <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2Z" />
      </svg>
    ),
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    ),
  },
];

interface AppLayoutProps {
  title?: string;
  subtitle?: string;
  activeNav?: string;
  headerAction?: ReactNode;
  children: ReactNode;
}

export const AppLayout = ({
  title = 'Dashboard',
  subtitle,
  activeNav = 'dashboard',
  headerAction,
  children,
}: AppLayoutProps) => {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const [open, setOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  return (
    <div className="flex min-h-svh bg-slate-100">
      {/* ── Mobile overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ──
          On mobile: fixed, slide in/out via translate-x.
          On desktop (lg): sticky, always visible, in document flow.
          lg:translate-x-0 overrides the mobile translate so -translate-x-full only applies <lg. */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col
          bg-[var(--sidebar-bg)] border-r border-white/[0.06]
          transition-transform duration-300 ease-in-out
          lg:sticky lg:top-0 lg:h-svh lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-5 py-[18px]">
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-[var(--brand-mid)] to-[var(--brand-2)] shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,115,200,0.35)]">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2L18 6.5V13.5L10 18L2 13.5V6.5L10 2Z"
                fill="white"
                fillOpacity="0.9"
              />
              <path
                d="M10 6L14 8.5V13L10 15.5L6 13V8.5L10 6Z"
                fill="white"
                fillOpacity="0.3"
              />
            </svg>
          </div>
          <div>
            <p className="title-font text-[14px] font-bold leading-tight text-white tracking-tight">
              Consult PSA
            </p>
            <p className="text-[11px] text-white/30">Operations Hub</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/25">
            Workspace
          </p>
          {NAV_ITEMS.map(item => {
            const isActive = activeNav === item.key;
            return (
              <a
                key={item.key}
                href="#"
                className={`
                  mb-0.5 flex items-center gap-2.5 rounded-[10px] px-3 py-[9px]
                  text-[13.5px] font-semibold transition-colors duration-150 no-underline
                  ${
                    isActive
                      ? 'bg-[rgba(14,165,166,0.14)] text-white shadow-[inset_0_0_0_1px_rgba(14,165,166,0.2)]'
                      : 'text-[#a8bdd8] hover:bg-white/[0.06] hover:text-white'
                  }
                `}
              >
                <span
                  className={
                    isActive ? 'text-[var(--brand-2)]' : 'text-current'
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* User card */}
        <div className="flex items-center gap-2.5 border-t border-white/[0.06] px-4 py-4">
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-mid)] to-[var(--brand-2)] text-[12px] font-bold text-white">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[13px] font-bold text-white">
              {user?.name}
            </p>
            <p className="text-[11px] capitalize text-white/30">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="flex items-center rounded-[7px] p-1.5 text-white/30 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-slate-100/80 px-6 backdrop-blur-md">
          {/* Hamburger — mobile only */}
          <button
            className="flex items-center rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-200 lg:hidden"
            onClick={() => setOpen(!open)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Workspace
            </p>
            <h1 className="title-font text-[20px] font-extrabold leading-tight tracking-tight text-slate-900">
              {title}
            </h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {headerAction}
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-mid)] to-[var(--brand-2)] text-[10px] font-bold text-white">
                {initials}
              </div>
              <span className="text-[13px] font-semibold text-slate-800">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Subtitle */}
        {subtitle && (
          <p className="px-6 pt-3 text-[13.5px] text-slate-500">{subtitle}</p>
        )}

        {/* Page body */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};
