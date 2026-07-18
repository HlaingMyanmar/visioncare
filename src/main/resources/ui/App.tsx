import React, { useMemo, useState } from 'react';
import { HashRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, Database, LogOut, PanelLeftClose, PanelLeftOpen, Printer, Settings, Shield, UsersRound } from 'lucide-react';
import Login from './pages/Login';
import UserOptions from './pages/UserOptions';
import ClinicOrders from './pages/ClinicOrders';
import CatalogOptions from './pages/CatalogOptions';
import CompanySettings from './pages/CompanySettings';
import VoucherPrintSettings from './pages/VoucherPrintSettings';
import { authService, getStoredUser } from './services/api';
import { User } from './types';

const hasAdminRole = (user: User | null) => Boolean(user?.roles?.some(role => role === 'ADMINISTRATOR' || role === 'ROLE_ADMINISTRATOR'));
const hasAnyPermission = (user: User | null, permissions: string[]) => Boolean(user && (hasAdminRole(user) || permissions.some(permission => user.permissions?.includes(permission))));
const canAccessUserOptions = (user: User | null) => hasAnyPermission(user, ['CAN_ACCESS_USERS_READ', 'CAN_ACCESS_ROLES_READ', 'CAN_ACCESS_PERMISSIONS_READ']);
const canAccessOrders = (user: User | null) => hasAnyPermission(user, ['CAN_ACCESS_ORDER_READ', 'CAN_ACCESS_PRESCRIPTION_READ']);
const canAccessCatalog = (user: User | null) => hasAnyPermission(user, ['CAN_ACCESS_CUSTOMER_READ', 'CAN_ACCESS_DOCTOR_READ', 'CAN_ACCESS_FRAME_READ', 'CAN_ACCESS_LENS_READ']);
const canAccessCompanySettings = (user: User | null) => hasAnyPermission(user, ['CAN_ACCESS_COMPANY_SETTINGS_READ', 'CAN_ACCESS_COMPANY_SETTINGS_UPDATE']);
const canAccessVoucherPrintSettings = (user: User | null) => hasAnyPermission(user, ['CAN_ACCESS_VOUCHER_PRINT_SETTINGS_READ', 'CAN_ACCESS_VOUCHER_PRINT_SETTINGS_UPDATE']);

const initials = (name: string) => name.trim().slice(0, 2).toUpperCase() || 'VC';

const Shell: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = useMemo(() => [
    { to: '/orders', label: 'Clinic Orders', hint: 'Voucher and prescription', icon: ClipboardList, enabled: canAccessOrders(user) },
    { to: '/catalog', label: 'Catalog', hint: 'Customers, doctors, items', icon: Database, enabled: canAccessCatalog(user) },
    { to: '/company-settings', label: 'Company Settings', hint: 'Clinic profile and voucher', icon: Settings, enabled: canAccessCompanySettings(user) },
    { to: '/voucher-print-settings', label: 'Voucher Print', hint: 'Paper voucher layout', icon: Printer, enabled: canAccessVoucherPrintSettings(user) },
    { to: '/user-options', label: 'User Options', hint: 'Users, roles, permissions', icon: UsersRound, enabled: canAccessUserOptions(user) }
  ], [user]);

  const firstEnabled = navItems.find(item => item.enabled) || navItems[0];
  const activeItem = navItems.find(item => location.pathname.startsWith(item.to)) || firstEnabled;

  const handleLogout = () => {
    authService.logout();
    onLogout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={`min-h-screen bg-[#f5f8fb] text-slate-900 lg:grid ${sidebarCollapsed ? 'lg:grid-cols-[88px_1fr]' : 'lg:grid-cols-[280px_1fr]'}`}>
      <aside className="border-b border-slate-200 bg-slate-950 text-white transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-slate-800">
        <div className={`flex items-center justify-between gap-3 px-4 py-4 lg:px-5 lg:py-5 ${sidebarCollapsed ? 'lg:flex-col lg:items-center' : 'lg:flex-row'}`}>
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-white shadow-sm">
              <Shield size={21} />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 text-left">
                <h1 className="truncate text-base font-black leading-tight">VisionCare</h1>
                <p className="truncate text-[11px] font-bold text-slate-400">Clinic Admin Console</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(value => !value)}
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 lg:inline-flex"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
            <button onClick={handleLogout} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold text-slate-200 hover:bg-white/10 lg:hidden">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        <nav className={`flex gap-2 overflow-x-auto px-4 pb-4 lg:mt-5 lg:flex-col lg:overflow-visible lg:pb-0 ${sidebarCollapsed ? 'lg:px-4' : 'lg:px-5'}`}>
          {navItems.filter(item => item.enabled).map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={sidebarCollapsed ? item.label : undefined}
                className={({ isActive }) => `flex min-w-[190px] items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors lg:min-w-0 ${sidebarCollapsed ? 'lg:h-12 lg:justify-center lg:px-0' : ''} ${isActive ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={`shrink-0 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                    {!sidebarCollapsed && (
                      <span className="min-w-0">
                        <span className="block text-xs font-black">{item.label}</span>
                        <span className="block text-[10px] font-bold text-slate-500">{item.hint}</span>
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className={`absolute bottom-0 left-0 right-0 hidden lg:block ${sidebarCollapsed ? 'p-4' : 'p-5'}`}>
          <div className={`rounded-lg border border-white/10 bg-white/[0.04] ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/15 text-xs font-black text-teal-100 ring-1 ring-teal-400/20">{initials(user.username)}</div>
              {!sidebarCollapsed && <div className="min-w-0 text-left"><p className="truncate text-xs font-black text-white">{user.username}</p><p className="text-[10px] font-bold text-slate-500">Signed in</p></div>}
            </div>
            <button onClick={handleLogout} title="Logout" className={`mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 text-xs font-black text-slate-200 hover:bg-white/10 ${sidebarCollapsed ? 'px-0' : ''}`}>
              <LogOut size={14} /> {!sidebarCollapsed && 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-4 sm:px-6 lg:px-6 lg:py-5">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div className="text-left"><p className="text-[11px] font-black uppercase text-slate-400">Vision Clinic</p><h2 className="text-2xl font-black tracking-tight text-slate-950">{activeItem?.label || 'Clinic Orders'}</h2></div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm">Real-time clinic administration</div>
        </div>

        <Routes>
          <Route path="/orders" element={canAccessOrders(user) ? <ClinicOrders /> : <NoAccess label="clinic orders" />} />
          <Route path="/catalog" element={canAccessCatalog(user) ? <CatalogOptions /> : <NoAccess label="catalog" />} />
          <Route path="/company-settings" element={canAccessCompanySettings(user) ? <CompanySettings /> : <NoAccess label="company settings" />} />
          <Route path="/voucher-print-settings" element={canAccessVoucherPrintSettings(user) ? <VoucherPrintSettings /> : <NoAccess label="voucher print settings" />} />
          <Route path="/user-options" element={canAccessUserOptions(user) ? <UserOptions /> : <NoAccess label="user options" />} />
          <Route path="*" element={<Navigate to={firstEnabled.to} replace />} />
        </Routes>
      </main>
    </div>
  );
};

const NoAccess = ({ label }: { label: string }) => <div className="surface rounded-lg p-5 text-sm font-bold text-amber-700">No permission to access {label}.</div>;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/orders" replace /> : <Login onLoginSuccess={setUser} />} />
        <Route path="/*" element={user ? <Shell user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;



