import { Outlet, useNavigate, useLocation, Link } from "react-router";
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
  { path: "/admin/anticheat", label: "Anti-Cheat", icon: ShieldAlert, badge: 6 },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 flex flex-col flex-shrink-0 sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white text-sm" style={{ fontWeight: 600 }}>
                CodeArena
              </div>
              <div className="text-slate-400 text-xs">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ path, label, icon: Icon, badge, exact }) => {
            const active = isActive(path, exact);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      active ? "bg-blue-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    {badge}
                  </span>
                )}
                {active && <ChevronRight className="w-3 h-3 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-slate-700/60 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white text-xs" style={{ fontWeight: 600 }}>
              AD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs" style={{ fontWeight: 500 }}>Admin User</div>
              <div className="text-slate-500 text-xs truncate">admin@codearena.io</div>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 h-14">
          <div>
            <div className="text-slate-400 text-xs">CodeArena Admin</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-white text-xs" style={{ fontWeight: 600 }}>
                AD
              </div>
              <span className="text-sm text-slate-700 hidden sm:block">Admin User</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
