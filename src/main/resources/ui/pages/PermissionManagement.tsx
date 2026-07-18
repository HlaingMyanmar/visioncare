import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit2, KeyRound, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { permissionService } from '../services/permissionapiservice';
import { PermissionDTO } from '../types';
import { useRefreshOnTabActivate } from '../hooks/useRefreshOnTabActivate';
import { useWebsocket } from '../hooks/useWebsocket';

const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      setPermissions(await permissionService.getAll());
    } catch (error) {
      console.error('Failed to load permissions', error);
      Swal.fire('Load failed', 'Could not load permission keys.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);
  useRefreshOnTabActivate(fetchPermissions);
  useWebsocket('/topic/permissions', () => { void fetchPermissions(); });

  const filteredPermissions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return permissions;
    return permissions.filter(permission => permission.name.toLowerCase().includes(query) || (permission.description || '').toLowerCase().includes(query));
  }, [permissions, searchTerm]);

  const openModal = (permission?: PermissionDTO) => {
    setEditingPermission(permission || null);
    setFormData(permission ? { name: permission.name, description: permission.description || '' } : { name: '', description: '' });
    setIsModalOpen(true);
  };

  const savePermission = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingPermission) await permissionService.update(editingPermission.id, formData);
      else await permissionService.create(formData as Omit<PermissionDTO, 'id'>);
      setIsModalOpen(false);
      await fetchPermissions();
      Swal.fire({ icon: 'success', title: editingPermission ? 'Permission updated' : 'Permission created', toast: true, position: 'top-end', timer: 1400, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire('Save failed', error.message || 'Could not save permission.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deletePermission = async (permission: PermissionDTO) => {
    const result = await Swal.fire({ title: `Delete ${permission.name}?`, text: 'Roles using this key may lose capability.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete key' });
    if (!result.isConfirmed) return;
    try {
      await permissionService.delete(permission.id);
      await fetchPermissions();
      Swal.fire({ icon: 'success', title: 'Permission deleted', toast: true, position: 'top-end', timer: 1400, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire('Delete failed', error.message || 'Could not delete permission.', 'error');
    }
  };

  if (loading) return <div className="surface flex min-h-[360px] items-center justify-center rounded-lg"><Loader2 className="animate-spin text-slate-500" size={30} /></div>;

  return (
    <div className="page-enter space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric title="Permission keys" value={permissions.length} />
        <Metric title="Visible results" value={filteredPermissions.length} />
        <Metric title="System module" value="RBAC" />
      </div>

      <div className="surface rounded-lg">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-left"><h3 className="text-base font-black text-slate-950">Permission Registry</h3><p className="text-xs font-semibold text-slate-500">Fine-grained authority keys used by roles.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="focus-ring h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold sm:w-72" placeholder="Search permission keys" /></div>
            <button onClick={() => openModal()} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-black text-white hover:bg-slate-800"><Plus size={14} /> New Key</button>
          </div>
        </div>

        <div className="table-scroll custom-scrollbar">
          <table className="w-full border-collapse text-left">
            <thead><tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase text-slate-500"><th className="px-4 py-3">Key</th><th className="px-4 py-3">Description</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPermissions.map(permission => (
                <tr key={permission.id} className="bg-white hover:bg-slate-50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700"><KeyRound size={16} /></div><div><p className="text-sm font-black text-slate-900">{permission.name}</p><p className="text-[11px] font-bold text-slate-400">ID #{permission.id}</p></div></div></td>
                  <td className="px-4 py-3 text-xs font-semibold leading-5 text-slate-500">{permission.description || 'System authority key'}</td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1.5"><IconButton title="Edit" onClick={() => openModal(permission)}><Edit2 size={14} /></IconButton><IconButton title="Delete" danger onClick={() => void deletePermission(permission)}><Trash2 size={14} /></IconButton></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filteredPermissions.length && <div className="flex flex-col items-center justify-center p-10 text-center text-slate-500"><div className="mb-3 rounded-lg bg-slate-100 p-3 text-slate-400"><KeyRound size={24} /></div><p className="text-sm font-black text-slate-700">No permissions found</p><p className="mt-1 text-xs font-semibold">Try another search term or create a new key.</p></div>}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="surface w-full max-w-md rounded-lg">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h3 className="text-sm font-black text-slate-950">{editingPermission ? 'Edit Permission' : 'Create Permission'}</h3><button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button></div>
            <form onSubmit={savePermission} className="space-y-4 p-5 text-left">
              <Field label="Key name"><input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/\s/g, '_') })} className="focus-ring h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold" placeholder="CAN_ACCESS_EXAMPLE" /></Field>
              <Field label="Description"><textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="focus-ring w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold" placeholder="What this key allows" /></Field>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsModalOpen(false)} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-4 text-xs font-black text-white hover:bg-slate-800 disabled:opacity-60">{saving && <Loader2 size={14} className="animate-spin" />}{editingPermission ? 'Save Changes' : 'Create Key'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Metric = ({ title, value }: { title: string; value: number | string }) => <div className="surface rounded-lg p-4"><p className="text-xs font-bold text-slate-500">{title}</p><p className="mt-2 text-2xl font-black text-slate-950">{value}</p></div>;
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase text-slate-500">{label}</span>{children}</label>;
const IconButton = ({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) => <button title={title} onClick={onClick} className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white ${danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-600 hover:bg-slate-50'}`}>{children}</button>;

export default PermissionManagement;
