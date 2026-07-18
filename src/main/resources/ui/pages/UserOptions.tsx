import React, { useMemo, useState } from 'react';
import { KeyRound, ShieldCheck, Users } from 'lucide-react';
import UserManagement from './UserManagement';
import RoleManagement from './RoleManagement';
import PermissionManagement from './PermissionManagement';

const tabs = [
  { id: 'users', label: 'Users', hint: 'Accounts', icon: Users },
  { id: 'roles', label: 'Roles', hint: 'Access groups', icon: ShieldCheck },
  { id: 'permissions', label: 'Permissions', hint: 'Security keys', icon: KeyRound }
] as const;

type TabId = typeof tabs[number]['id'];

const UserOptions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('users');

  const activeContent = useMemo(() => {
    if (activeTab === 'roles') return <RoleManagement />;
    if (activeTab === 'permissions') return <PermissionManagement />;
    return <UserManagement />;
  }, [activeTab]);

  return (
    <div className="space-y-4">
      <div className="surface rounded-lg p-2">
        <div className="grid gap-2 md:grid-cols-3">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                  selected ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <Icon size={18} className={selected ? 'text-teal-300' : 'text-slate-400'} />
                <span>
                  <span className="block text-sm font-black">{tab.label}</span>
                  <span className={`block text-[11px] font-bold ${selected ? 'text-slate-300' : 'text-slate-400'}`}>{tab.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeContent}
    </div>
  );
};

export default UserOptions;
