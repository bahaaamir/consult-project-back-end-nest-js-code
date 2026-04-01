import { useState } from 'react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import { AppLayout } from '../../layouts/AppLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const STATS = [
  { label: 'Active Users',    value: '12',  sub: '↑ 2 this week'     },
  { label: 'Pending Invites', value: '4',   sub: 'Awaiting acceptance' },
  { label: 'Conversion',      value: '78%', sub: 'Invite to active'   },
];

export const Dashboard = () => {
  const user = useAuthStore((s) => s.user);

  const [inviteData, setInviteData] = useState({
    email: '', name: '', role: 'employee', company_name: '',
  });
  const [inviteResult, setInviteResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInviteResult(null);
    try {
      const res = await api.post('/auth/invite', inviteData);
      setInviteResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate invitation');
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Overview of your workspace, team access, and operations."
      activeNav="dashboard"
    >
      {/* ── Stats row ── */}
      <div className="reveal mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Welcome card — spans first column */}
        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[var(--brand-1)] to-[var(--brand-mid)] p-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">Today</p>
          <div>
            <h2 className="title-font mt-2 text-2xl font-extrabold leading-tight tracking-tight">
              Welcome back, {firstName} 👋
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-white/65">
              Your workspace is live. Invite team members and manage access below.
            </p>
          </div>
        </div>

        {/* Stat cards */}
        {STATS.map(({ label, value, sub }) => (
          <div key={label} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
            <div>
              <p className="title-font text-[32px] font-extrabold leading-none tracking-tight text-slate-900">{value}</p>
              <p className="mt-1.5 text-xs text-slate-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Lower grid ── */}
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">

        {/* Invite form */}
        <div className="reveal reveal-delay-1 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <h3 className="title-font text-[20px] font-extrabold tracking-tight text-slate-900">
            Invite Team Member
          </h3>
          <p className="mt-1 text-[13px] text-slate-500">
            Generate a secure invite link and set their access level.
          </p>

          <form onSubmit={handleInvite} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Name"
                placeholder="Jane Doe"
                value={inviteData.name}
                onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="jane@example.com"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Role</label>
              <select
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={inviteData.role}
                onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                {['owner', 'super_admin'].includes(user?.role ?? '') && (
                  <option value="manager">Manager</option>
                )}
                {user?.role === 'super_admin' && (
                  <option value="owner">Owner (New Office)</option>
                )}
              </select>
            </div>

            {inviteData.role === 'owner' && (
              <Input
                label="Company Name"
                placeholder="Acme Corp"
                value={inviteData.company_name}
                onChange={(e) => setInviteData({ ...inviteData, company_name: e.target.value })}
                required
              />
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              isLoading={loading}
              className="h-11 rounded-xl bg-sky-700 px-6 text-white hover:bg-sky-800"
            >
              Generate Invitation Link
            </Button>
          </form>

          {inviteResult && (
            <div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-4">
              <p className="text-[14px] font-bold text-cyan-900">{inviteResult.message}</p>
              <p className="mt-2 break-all text-[12px] text-cyan-800">
                <strong>Invite Link: </strong>
                <a href={inviteResult.invitation_link} target="_blank" rel="noreferrer" className="underline">
                  {inviteResult.invitation_link}
                </a>
              </p>
              <p className="mt-2 text-[11px] text-cyan-700/70">
                In production, this link is emailed automatically.
              </p>
            </div>
          )}
        </div>

        {/* Workspace status card */}
        <div className="reveal reveal-delay-2 flex flex-col gap-3 rounded-2xl bg-[var(--sidebar-bg)] p-7 border border-white/[0.06]">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/30">
            Workspace Status
          </p>
          {[
            { label: 'Signed in as', value: user?.name },
            { label: 'Email',        value: user?.email },
            { label: 'Role',         value: user?.role },
            { label: 'Current Plan', value: 'Starter' },
            { label: 'Health',       value: '✓ Operational', green: true },
          ].map(({ label, value, green }) => (
            <div
              key={label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3.5"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30">{label}</p>
              <p className={`mt-1 text-[15px] font-bold ${green ? 'text-emerald-400' : 'text-white'}`}>
                {value ?? '—'}
              </p>
            </div>
          ))}
        </div>

      </div>
    </AppLayout>
  );
};
