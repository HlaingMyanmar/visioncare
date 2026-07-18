import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, Circle, Edit2, KeyRound, Loader2, Plus, Search, Settings2, ShieldCheck, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { permissionService } from '../services/permissionapiservice';
import { roleService } from '../services/roleapiservice';
import { PermissionDTO, RoleDTO } from '../types';
import { useRefreshOnTabActivate } from '../hooks/useRefreshOnTabActivate';
import { useWebsocket } from '../hooks/useWebsocket';

const clean = (value: string) => value.replace(/^ROLE_/, '').replace(/_/g, ' ');

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [permissionSearch, setPermissionSearch] = useState('');
  const [editingRole, setEditingRole] = useState<RoleDTO | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [roleData, permissionData] = await Promise.all([roleService.getAll(), permissionService.getAll()]);
      setRoles(roleData);
      setPermissions(permissionData);
    } catch (error) {
      console.error('Failed to load roles', error);
      Swal.fire('Load failed', 'Could not load roles and permissions.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useRefreshOnTabActivate(fetchData);
  useWebsocket('/topic/role', () => { void fetchData(); });

  const filteredRoles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return roles;
    return roles.filter(role => role.name.toLowerCase().includes(query) || (role.description || '').toLowerCase().includes(query));
  }, [roles, searchTerm]);

  const filteredPermissions = useMemo(() => {
    const query = permissionSearch.trim().toLowerCase();
    if (!query) return permissions;
    return permissions.filter(permission => permission.name.toLowerCase().includes(query) || (permission.description || '').toLowerCase().includes(query));
  }, [permissions, permissionSearch]);

  const openRoleModal = (role?: RoleDTO) => {
    setEditingRole(role || null);
    setFormData(role ? { name: role.name, description: role.description || '' } : { name: '', description: '' });
    setIsRoleModalOpen(true);
  };

  const openPermissionModal = (role: RoleDTO) => {
    setEditingRole(role);
    setSelectedPermissionIds((role.permissions || []).map(permission => permission.id));
    setPermissionSearch('');
    setIsPermissionModalOpen(true);
  };

  const saveRole = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingRole) await roleService.update(editingRole.id, formData);
      else await roleService.create(formData);
      setIsRoleModalOpen(false);
      await fetchData();
      Swal.fire({ icon: 'success', title: editingRole ? 'Role updated' : 'Role created', toast: true, position: 'top-end', timer: 1400, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire('Save failed', error.message || 'Could not save role.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async (role: RoleDTO) => {
    const result = await Swal.fire({ title: `Delete ${clean(role.name)}?`, text: 'Accounts assigned to this role may lose access.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete role' });
    if (!result.isConfirmed) return;
    try {
      await roleService.delete(role.id);
      await fetchData();
      Swal.fire({ icon: 'success', title: 'Role deleted', toast: true, position: 'top-end', timer: 1400, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire('Delete failed', error.message || 'Could not delete role.', 'error');
    }
  };

  const assignPermissions = async () => {
    if (!editingRole) return;
    setSaving(true);
    try {
      await roleService.assignPermissions(editingRole.id, selectedPermissionIds);
      setIsPermissionModalOpen(false);
      await fetchData();
      Swal.fire({ icon: 'success', title: 'Permissions updated', toast: true, position: 'top-end', timer: 1400, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire('Update failed', error.message || 'Could not update permissions.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="surface flex min-h-[360px] items-center justify-center rounded-lg"><Loader2 className="animate-spin text-slate-500" size={30} /></div>;

  return (
    <div className="page-enter space-y-4">
<div className="surface rounded-lg">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-left"><h3 className="text-base font-black text-slate-950">Security Roles</h3><p className="text-xs font-semibold text-slate-500">Group permissions into practical job responsibilities.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="focus-ring h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold sm:w-64" placeholder="Search roles" /></div>
            <button onClick={() => openRoleModal()} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-black text-white hover:bg-slate-800"><Plus size={14} /> New Role</button>
          </div>
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRoles.map(role => (
            <div key={role.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3 text-left">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white"><ShieldCheck size={18} /></div>
                  <div className="min-w-0"><h4 className="truncate text-sm font-black text-slate-950">{clean(role.name)}</h4><p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{role.description || 'No description has been added.'}</p></div>
                </div>
                <div className="flex shrink-0 gap-1"><IconButton title="Edit" onClick={() => openRoleModal(role)}><Edit2 size={14} /></IconButton><IconButton title="Delete" danger onClick={() => void deleteRole(role)}><Trash2 size={14} /></IconButton></div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-xs font-black text-slate-500">Permissions</span><span className="rounded-md bg-sky-50 px-2 py-1 text-[11px] font-black text-sky-700">{role.permissions?.length || 0}</span></div>
              <button onClick={() => openPermissionModal(role)} className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-black text-slate-700 hover:bg-slate-50"><Settings2 size={14} /> Manage Permissions</button>
            </div>
          ))}
        </div>
        {!filteredRoles.length && <Empty icon={<ShieldCheck size={24} />} title="No roles found" text="Try another search term or create a new role." />}
      </div>

      {isRoleModalOpen && (
        <Modal title={editingRole ? 'Edit Role' : 'Create Role'} onClose={() => setIsRoleModalOpen(false)}>
          <form onSubmit={saveRole} className="space-y-4 text-left">
            <Field label="Role name"><input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/\s/g, '_') })} className="focus-ring h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold" placeholder="MANAGER" /></Field>
            <Field label="Description"><textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="focus-ring w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold" placeholder="What this role can do" /></Field>
            <Actions saving={saving} onCancel={() => setIsRoleModalOpen(false)} submitLabel={editingRole ? 'Save Changes' : 'Create Role'} />
          </form>
        </Modal>
      )}

      {isPermissionModalOpen && (
        <Modal title={`Permissions for ${editingRole ? clean(editingRole.name) : 'role'}`} onClose={() => setIsPermissionModalOpen(false)} wide>
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={permissionSearch} onChange={(e) => setPermissionSearch(e.target.value)} className="focus-ring h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold" placeholder="Filter permission keys" /></div><button onClick={() => setSelectedPermissionIds(filteredPermissions.map(p => p.id))} className="h-10 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-black text-emerald-700">Select Visible</button><button onClick={() => setSelectedPermissionIds([])} className="h-10 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-black text-rose-700">Clear</button></div>
            <div className="grid max-h-[430px] gap-2 overflow-y-auto pr-1 custom-scrollbar md:grid-cols-2">
              {filteredPermissions.map(permission => {
                const selected = selectedPermissionIds.includes(permission.id);
                return <button key={permission.id} onClick={() => setSelectedPermissionIds(prev => selected ? prev.filter(id => id !== permission.id) : [...prev, permission.id])} className={`flex items-start gap-3 rounded-lg border p-3 text-left ${selected ? 'border-sky-200 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>{selected ? <CheckCircle size={18} className="mt-0.5 shrink-0 text-sky-600" /> : <Circle size={18} className="mt-0.5 shrink-0 text-slate-300" />}<span><span className="block text-xs font-black text-slate-900">{permission.name}</span><span className="mt-1 block text-[11px] font-semibold leading-4 text-slate-500">{permission.description || 'System authority key'}</span></span></button>;
              })}
            </div>
            <Actions saving={saving} onCancel={() => setIsPermissionModalOpen(false)} onSubmit={assignPermissions} submitLabel="Apply Permissions" />
          </div>
        </Modal>
      )}
    </div>
  );
};

const IconButton = ({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) => <button title={title} onClick={onClick} className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white ${danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-600 hover:bg-slate-50'}`}>{children}</button>;
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase text-slate-500">{label}</span>{children}</label>;
const Modal = ({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) => <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"><div className={`surface w-full ${wide ? 'max-w-4xl' : 'max-w-md'} rounded-lg`}><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h3 className="text-sm font-black text-slate-950">{title}</h3><button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button></div><div className="p-5">{children}</div></div></div>;
const Actions = ({ saving, onCancel, onSubmit, submitLabel }: { saving: boolean; onCancel: () => void; onSubmit?: () => void; submitLabel: string }) => <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onCancel} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 hover:bg-slate-50">Cancel</button><button type={onSubmit ? 'button' : 'submit'} onClick={onSubmit} disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-4 text-xs font-black text-white hover:bg-slate-800 disabled:opacity-60">{saving && <Loader2 size={14} className="animate-spin" />}{submitLabel}</button></div>;
const Empty = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => <div className="flex flex-col items-center justify-center p-10 text-center text-slate-500"><div className="mb-3 rounded-lg bg-slate-100 p-3 text-slate-400">{icon}</div><p className="text-sm font-black text-slate-700">{title}</p><p className="mt-1 text-xs font-semibold">{text}</p></div>;

export default RoleManagement;

