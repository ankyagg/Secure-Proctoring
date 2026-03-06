import { Outlet, useLocation, Link } from "react-router";
import { useState } from "react";
import {
  Code2,
  LayoutDashboard,
  Trophy,
  HelpCircle,
  Send,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Bell,
  Settings,
} from "lucide-react";

const navItems = [
  { path: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { path: "/admin/contests", label: "Contests", icon: Trophy },
  { path: "/admin/questions", label: "Questions", icon: HelpCircle },
  { path: "/admin/submissions", label: "Submissions", icon: Send },
  { path: "/admin/anticheat", label: "Anti-Cheat", icon: ShieldAlert },
];

export default function AdminLayout() {
  const location = useLocation();

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 flex flex-col flex-shrink-0 sticky top-0 h-screen">

        <div className="px-5 py-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white text-sm font-semibold">CodeArena</div>
              <div className="text-slate-400 text-xs">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ path, label, icon: Icon, exact }) => {
            const active = isActive(path, exact);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-3 h-3 opacity-70" />}
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between h-14">
          <div className="text-slate-400 text-xs">CodeArena Admin</div>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500" />
            <Settings className="w-4 h-4 text-slate-500" />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}