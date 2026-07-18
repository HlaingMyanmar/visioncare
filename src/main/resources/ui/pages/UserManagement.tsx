import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, Circle, Edit2, KeyRound, Loader2, Plus, Search, Trash2, UserPlus, Users, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { roleService } from '../services/roleapiservice';
import { userService } from '../services/userapiservice';
import { RoleDTO, UserDTO } from '../types';
import { useRefreshOnTabActivate } from '../hooks/useRefreshOnTabActivate';
import { useWebsocket } from '../hooks/useWebsocket';

const roleLabel = (role: string) => role.replace(/^ROLE_/, '').replace(/_/g, ' ');

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', isActive: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, roleData] = await Promise.all([userService.getAll(), roleService.getAll()]);
      setUsers(userData);
      setRoles(roleData);
    } catch (error) {
      console.error('Failed to load users', error);
      Swal.fire('Load failed', 'Could not load users and roles.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useRefreshOnTabActivate(fetchData);
  useWebsocket('/topic/user', () => { void fetchData(); });

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return users;
    return users.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.roles || []).some(role => role.toLowerCase().includes(query))
    );
  }, [searchTerm, users]);

  const activeCount = users.filter(user => user.isActive).length;
  const adminCount = users.filter(user => (user.roles || []).some(role => role.includes('ADMINISTRATOR'))).length;

  const openUserModal = (user?: UserDTO) => {
    if (user) {
      setEditingUser(user);
      setFormData({ username: user.username, email: user.email, password: '', isActive: user.isActive });
    } else {
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', isActive: true });
    }
    setIsUserModalOpen(true);
  };

  const openRoleModal = (user: UserDTO) => {
    setEditingUser(user);
    setSelectedRoleIds(roles.filter(role => (user.roles || []).includes(role.name)).map(role => role.id));
    setRoleSearchTerm('');
    setIsRoleModalOpen(true);
  };

  const saveUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      if (editingUser && !payload.password) delete (payload as any).password;
      if (editingUser) await userService.update(editingUser.id, payload);
      else await userService.create(payload);
      setIsUserModalOpen(false);
      await fetchData();
      Swal.fire({ icon: 'success', title: editingUser ? 'Account updated' : 'Account created', toast: true, position: 'top-end', timer: 1400, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire('Save failed', error.message || 'Could not save account.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (user: UserDTO) => {
    const result = await Swal.fire({ title: `Delete ${user.username}?`, text: 'This account will lose all system access.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete account' });
    if (!result.isConfirmed) return;
    try {
      await userService.delete(user.id);
      await fetchData();
      Swal.fire({ icon: 'success', title: 'Account deleted', toast: true, position: 'top-end', timer: 1400, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire('Delete failed', error.message || 'Could not delete account.', 'error');
    }
  };

  const assignRoles = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await userService.assignRoles(editingUser.id, selectedRoleIds);
      setIsRoleModalOpen(false);
      await fetchData();
      Swal.fire({ icon: 'success', title: 'Roles updated', toast: true, position: 'top-end', timer: 1400, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire('Update failed', error.message || 'Could not update roles.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="surface flex min-h-[360px] items-center justify-center rounded-lg"><Loader2 className="animate-spin text-slate-500" size={30} /></div>;
  }

  return (
    <div className="page-enter space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric title="Total accounts" value={users.length} tone="slate" />
        <Metric title="Active users" value={activeCount} tone="emerald" />
        <Metric title="Administrators" value={adminCount} tone="sky" />
      </div>

      <div className="surface rounded-lg">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-left">
            <h3 className="text-base font-black text-slate-950">Account Directory</h3>
            <p className="text-xs font-semibold text-slate-500">Create accounts, reset access, and assign operational roles.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="focus-ring h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold sm:w-64" placeholder="Search users, email, role" />
            </div>
            <button onClick={() => openUserModal()} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-black text-white hover:bg-slate-800">
              <UserPlus size={14} /> New Account
            </button>
          </div>
        </div>

        <div className="table-scroll custom-scrollbar">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase text-slate-500">
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="bg-white hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600">{user.username.slice(0, 2).toUpperCase()}</div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">{user.username}</p>
                        <p className="truncate text-xs font-semibold text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge active={user.isActive} /></td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-md flex-wrap gap-1.5">
                      {(user.roles || []).length ? user.roles.map(role => <span key={role} className="rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-[10px] font-black text-sky-700">{roleLabel(role)}</span>) : <span className="text-xs font-semibold text-slate-400">No roles</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <IconButton title="Assign roles" onClick={() => openRoleModal(user)}><KeyRound size={14} /></IconButton>
                      <IconButton title="Edit" onClick={() => openUserModal(user)}><Edit2 size={14} /></IconButton>
                      <IconButton title="Delete" danger onClick={() => void deleteUser(user)}><Trash2 size={14} /></IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filteredUsers.length && <EmptyState icon={<Users size={24} />} title="No users found" text="Try another search term or create a new account." />}
      </div>

      {isUserModalOpen && (
        <Modal title={editingUser ? 'Edit Account' : 'Create Account'} onClose={() => setIsUserModalOpen(false)}>
          <form onSubmit={saveUser} className="space-y-4 text-left">
            <Field label="Username"><input required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="focus-ring h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold" /></Field>
            <Field label="Email"><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="focus-ring h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold" /></Field>
            <Field label={editingUser ? 'Password (optional)' : 'Password'}><input type="password" required={!editingUser} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="focus-ring h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold" placeholder={editingUser ? 'Leave blank to keep current password' : 'New password'} /></Field>
            <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-sm font-bold text-slate-700">Account active</span>
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="h-4 w-4 accent-slate-950" />
            </label>
            <FormActions saving={saving} onCancel={() => setIsUserModalOpen(false)} submitLabel={editingUser ? 'Save Changes' : 'Create Account'} />
          </form>
        </Modal>
      )}

      {isRoleModalOpen && (
        <Modal title={`Roles for ${editingUser?.username || 'account'}`} onClose={() => setIsRoleModalOpen(false)} wide>
          <div className="space-y-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={roleSearchTerm} onChange={(e) => setRoleSearchTerm(e.target.value)} className="focus-ring h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold" placeholder="Filter roles" />
            </div>
            <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {roles.filter(role => role.name.toLowerCase().includes(roleSearchTerm.toLowerCase())).map(role => {
                const selected = selectedRoleIds.includes(role.id);
                return (
                  <button key={role.id} onClick={() => setSelectedRoleIds(prev => selected ? prev.filter(id => id !== role.id) : [...prev, role.id])} className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left ${selected ? 'border-sky-200 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    <span><span className="block text-sm font-black text-slate-900">{roleLabel(role.name)}</span><span className="block text-xs font-semibold text-slate-500">{role.description || 'No description'}</span></span>
                    {selected ? <CheckCircle size={18} className="text-sky-600" /> : <Circle size={18} className="text-slate-300" />}
                  </button>
                );
              })}
            </div>
            <FormActions saving={saving} onCancel={() => setIsRoleModalOpen(false)} onSubmit={assignRoles} submitLabel="Apply Roles" />
          </div>
        </Modal>
      )}
    </div>
  );
};

const Metric = ({ title, value, tone }: { title: string; value: number; tone: 'slate' | 'emerald' | 'sky' }) => {
  const colors = { slate: 'bg-slate-900 text-white', emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100', sky: 'bg-sky-50 text-sky-700 border-sky-100' };
  return <div className="surface rounded-lg p-4"><p className="text-xs font-bold text-slate-500">{title}</p><div className="mt-2 flex items-end justify-between"><p className="text-2xl font-black text-slate-950">{value}</p><span className={`rounded-md border px-2 py-1 text-[10px] font-black ${colors[tone]}`}>LIVE</span></div></div>;
};

const StatusBadge = ({ active }: { active: boolean }) => <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-black ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{active ? <CheckCircle size={12} /> : <Circle size={12} />}{active ? 'Active' : 'Inactive'}</span>;
const IconButton = ({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) => <button title={title} onClick={onClick} className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white ${danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-600 hover:bg-slate-50'}`}>{children}</button>;
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase text-slate-500">{label}</span>{children}</label>;
const EmptyState = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => <div className="flex flex-col items-center justify-center p-10 text-center text-slate-500"><div className="mb-3 rounded-lg bg-slate-100 p-3 text-slate-400">{icon}</div><p className="text-sm font-black text-slate-700">{title}</p><p className="mt-1 text-xs font-semibold">{text}</p></div>;
const Modal = ({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) => <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"><div className={`surface w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-lg`}><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h3 className="text-sm font-black text-slate-950">{title}</h3><button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button></div><div className="p-5">{children}</div></div></div>;
const FormActions = ({ saving, onCancel, onSubmit, submitLabel }: { saving: boolean; onCancel: () => void; onSubmit?: () => void; submitLabel: string }) => <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onCancel} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 hover:bg-slate-50">Cancel</button><button type={onSubmit ? 'button' : 'submit'} onClick={onSubmit} disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-4 text-xs font-black text-white hover:bg-slate-800 disabled:opacity-60">{saving && <Loader2 size={14} className="animate-spin" />}{submitLabel}</button></div>;

export default UserManagement;
