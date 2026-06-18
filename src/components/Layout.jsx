import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Luggage,
  BarChart3,
  Activity,
  Users,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  User,
  Clock,
  ChevronDown,
  Search,
  Plane,
  Hand,
  CheckSquare,
  ScanLine,
  AlertTriangle,
  Armchair
} from "lucide-react";
import { apiService } from "../services/api";

const ALL_NAV_ITEMS = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["Admin"] },
  { name: "Track Baggage", path: "/track", icon: Search, roles: ["Admin", "Check-In Staff", "Loading Staff", "Handover Staff", "Passenger"] },
  { name: "Check-In Operations", path: "/checkin", icon: CheckSquare, roles: ["Admin", "Check-In Staff"] },
  { name: "Loading Operations", path: "/loading", icon: Plane, roles: ["Admin", "Loading Staff"] },
  { name: "Handover Operations", path: "/handover", icon: Hand, roles: ["Admin", "Handover Staff"] },
  { name: "Staff Scanner", path: "/scanner", icon: ScanLine, roles: ["Admin", "Check-In Staff", "Loading Staff", "Handover Staff"] },
  { name: "Baggage Management", path: "/baggage", icon: Luggage, roles: ["Admin", "Check-In Staff"] },
  { name: "Lost Baggage Reports", path: "/lost-report", icon: AlertTriangle, roles: ["Admin", "Check-In Staff", "Handover Staff", "Passenger"] },
  { name: "Seat & Baggage Rules", path: "/seat-rules", icon: Armchair, roles: ["Admin", "Check-In Staff", "Loading Staff", "Handover Staff", "Passenger"] },
  { name: "Reports", path: "/reports", icon: BarChart3, roles: ["Admin"] },
  { name: "Monitoring", path: "/monitoring", icon: Activity, roles: ["Admin"] },
  { name: "User Management", path: "/users", icon: Users, roles: ["Admin"] },
  { name: "Settings", path: "/settings", icon: Settings, roles: ["Admin", "Check-In Staff", "Loading Staff", "Handover Staff", "Passenger"] }
];

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dateTime, setDateTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = apiService.getCurrentUser() || { username: "Guest User", role: "Staff", displayRole: "Staff" };

  // Filter nav items by role
  const navItems = ALL_NAV_ITEMS.filter(item =>
    item.roles.includes(currentUser.role)
  );

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    apiService.getNotifications().then((res) => {
      setNotifications(res.data);
    });
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await apiService.logout();
    navigate("/login");
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  };

  const ROLE_BADGE_COLORS = {
    "Admin": "bg-violet-500/20 text-violet-300 border-violet-500/30",
    "Check-In Staff": "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "Loading Staff": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    "Handover Staff": "bg-amber-500/20 text-amber-300 border-amber-500/30",
    "Passenger": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
  };

  const roleBadge = ROLE_BADGE_COLORS[currentUser.role] || "bg-slate-500/20 text-slate-300 border-slate-500/30";

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <Luggage className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading text-base font-bold tracking-wide text-white">
              LUGGAGE<span className="text-blue-500">TRACK</span>
            </span>
          </Link>
          <button className="lg:hidden text-slate-400 hover:text-white cursor-pointer" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-5 py-3 border-b border-slate-800/60 shrink-0">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${roleBadge}`}>
            {currentUser.role}
          </span>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} style={{ width: "18px", height: "18px" }} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800 p-3 shrink-0">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" style={{ width: "18px", height: "18px" }} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-6 shrink-0">
          {/* Mobile menu trigger */}
          <button
            className="lg:hidden text-slate-400 hover:text-white cursor-pointer"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Clock */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              {formatDate(dateTime)}
            </span>
            <span className="h-3 w-px bg-slate-800" />
            <span className="text-blue-400 font-mono tracking-wider">{formatTime(dateTime)}</span>
          </div>

          {/* User Operations */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors cursor-pointer"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute right-1 top-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 z-20 w-80 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-2xl">
                    <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="font-heading font-semibold text-sm text-white">Notifications</h4>
                      <span className="text-xs text-slate-500">{notifications.length} Alerts</span>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {notifications.map((n) => (
                        <div key={n.id} className="text-xs border-b border-slate-800 pb-2 last:border-b-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-semibold uppercase tracking-wider text-[10px] ${
                              n.type === "error" ? "text-red-400"
                                : n.type === "warning" ? "text-yellow-400"
                                : n.type === "success" ? "text-emerald-400"
                                : "text-blue-400"
                            }`}>
                              {n.type}
                            </span>
                            <span className="text-slate-500 font-mono text-[9px]">{n.timestamp}</span>
                          </div>
                          <p className="text-slate-300 font-medium">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center bg-blue-600 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold leading-none text-white">{currentUser.username}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">{currentUser.displayRole || currentUser.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 z-20 w-48 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl">
                    <Link
                      to="/settings"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
