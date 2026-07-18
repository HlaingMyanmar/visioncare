import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Edit2, Glasses, Loader2, Plus, Search, Stethoscope, Trash2, UserRound } from 'lucide-react';
import Swal from 'sweetalert2';
import { customerApi, doctorApi, frameApi, lensApi } from '../services/clinicapiservice';
import { CustomerDTO, DoctorDTO, FrameDTO, LensDTO } from '../types';

type TabId = 'customers' | 'doctors' | 'frames' | 'lenses';
type CatalogItem = CustomerDTO | DoctorDTO | FrameDTO | LensDTO;

const tabs = [
  { id: 'customers', label: 'Customers', hint: 'Patients and phone numbers', icon: UserRound },
  { id: 'doctors', label: 'Doctors', hint: 'Prescribing doctors', icon: Stethoscope },
  { id: 'frames', label: 'Frames', hint: 'Frame catalog and price', icon: Glasses },
  { id: 'lenses', label: 'Lenses', hint: 'Lens types and price', icon: Glasses }
] as const;

const emptyForms = {
  customers: { name: '', phone: '' } as CustomerDTO,
  doctors: { name: '' } as DoctorDTO,
  frames: { frameCode: '', model: '', price: 0 } as FrameDTO,
  lenses: { lensCode: '', type: '', price: 0 } as LensDTO
};

const CatalogOptions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('customers');
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [frames, setFrames] = useState<FrameDTO[]>([]);
  const [lenses, setLenses] = useState<LensDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [form, setForm] = useState<CatalogItem>(emptyForms.customers);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [customerData, doctorData, frameData, lensData] = await Promise.all([
        customerApi.getAll(), doctorApi.getAll(), frameApi.getAll(), lensApi.getAll()
      ]);
      setCustomers(customerData);
      setDoctors(doctorData);
      setFrames(frameData);
      setLenses(lensData);
    } catch (error) {
      console.error(error);
      Swal.fire('Load failed', 'Could not load catalog data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const activeMeta = tabs.find(tab => tab.id === activeTab)!;
  const rows = useMemo(() => ({ customers, doctors, frames, lenses }[activeTab]), [activeTab, customers, doctors, frames, lenses]);
  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(row => JSON.stringify(row).toLowerCase().includes(q));
  }, [rows, searchTerm]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForms[activeTab] });
    setFormOpen(true);
  };

  const openEdit = (item: CatalogItem) => {
    setEditing(item);
    setForm({ ...item });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (activeTab === 'customers') {
        const payload = form as CustomerDTO;
        editing ? await customerApi.update((editing as CustomerDTO).customerId!, payload) : await customerApi.create(payload);
      } else if (activeTab === 'doctors') {
        const payload = form as DoctorDTO;
        editing ? await doctorApi.update((editing as DoctorDTO).doctorId!, payload) : await doctorApi.create(payload);
      } else if (activeTab === 'frames') {
        const payload = form as FrameDTO;
        editing ? await frameApi.update((editing as FrameDTO).frameCode, payload) : await frameApi.create(payload);
      } else {
        const payload = form as LensDTO;
        editing ? await lensApi.update((editing as LensDTO).lensCode, payload) : await lensApi.create(payload);
      }
      closeForm();
      await loadData();
      Swal.fire({ icon: 'success', title: editing ? 'Updated' : 'Created', toast: true, position: 'top-end', timer: 1200, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire('Save failed', error.message || 'Could not save data.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: CatalogItem) => {
    const title = getTitle(item);
    const result = await Swal.fire({ title: `Delete ${title}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete' });
    if (!result.isConfirmed) return;
    try {
      if (activeTab === 'customers') await customerApi.delete((item as CustomerDTO).customerId!);
      else if (activeTab === 'doctors') await doctorApi.delete((item as DoctorDTO).doctorId!);
      else if (activeTab === 'frames') await frameApi.delete((item as FrameDTO).frameCode);
      else await lensApi.delete((item as LensDTO).lensCode);
      await loadData();
      Swal.fire({ icon: 'success', title: 'Deleted', toast: true, position: 'top-end', timer: 1200, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire('Delete failed', error.message || 'Could not delete data.', 'error');
    }
  };

  if (loading) return <div className="surface flex min-h-[360px] items-center justify-center rounded-lg"><Loader2 className="animate-spin text-slate-500" size={30} /></div>;

  if (formOpen) {
    return (
      <div className="page-enter space-y-4">
        <section className="surface overflow-hidden rounded-lg">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
            <div>
              <h3 className="text-base font-black text-slate-950">{editing ? 'Edit' : 'New'} {activeMeta.label.slice(0, -1)}</h3>
              <p className="text-xs font-semibold text-slate-500">Create and maintain {activeMeta.label.toLowerCase()} information.</p>
            </div>
            <button onClick={closeForm} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:bg-slate-50"><ArrowLeft size={15} /> Back</button>
          </div>
          <form onSubmit={save} className="bg-slate-50">
            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_320px]">
              <div className="surface rounded-lg p-4">
                <div className="grid gap-4 md:grid-cols-2">{renderForm(activeTab, form, setForm, Boolean(editing))}</div>
              </div>
              <aside className="surface rounded-lg p-4">
                <p className="text-[11px] font-black uppercase text-slate-500">Entry Summary</p>
                <p className="mt-2 text-lg font-black text-slate-950">{getTitle(form) || `New ${activeMeta.label.slice(0, -1)}`}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{editing ? 'Editing existing catalog record' : 'Adding a new catalog record'}</p>
              </aside>
            </div>
            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
              <button type="button" onClick={closeForm} className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 hover:bg-slate-50">Back</button>
              <button disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-5 text-xs font-black text-white hover:bg-slate-800 disabled:opacity-60">{saving && <Loader2 size={14} className="animate-spin" />}Save</button>
            </div>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }} className={`surface rounded-lg p-4 text-left transition-colors ${selected ? 'border-slate-950 bg-slate-950 text-white' : 'hover:border-slate-300'}`}>
              <div className="flex items-center justify-between gap-3">
                <div><p className={`text-sm font-black ${selected ? 'text-white' : 'text-slate-900'}`}>{tab.label}</p><p className={`mt-1 text-[11px] font-bold ${selected ? 'text-slate-300' : 'text-slate-500'}`}>{tab.hint}</p></div>
                <Icon size={20} className={selected ? 'text-teal-300' : 'text-slate-400'} />
              </div>
              <p className={`mt-4 text-2xl font-black ${selected ? 'text-white' : 'text-slate-950'}`}>{({ customers, doctors, frames, lenses }[tab.id]).length}</p>
            </button>
          );
        })}
      </div>

      <div className="surface rounded-lg">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-left"><h3 className="text-base font-black text-slate-950">{activeMeta.label}</h3><p className="text-xs font-semibold text-slate-500">Keep clinic master data clean before creating orders.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="focus-ring h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold sm:w-64" placeholder={`Search ${activeMeta.label.toLowerCase()}`} /></div>
            <button onClick={openCreate} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-black text-white hover:bg-slate-800"><Plus size={14} /> New {activeMeta.label.slice(0, -1)}</button>
          </div>
        </div>
        <div className="table-scroll custom-scrollbar"><table className="w-full border-collapse text-left"><thead>{renderHeader(activeTab)}</thead><tbody className="divide-y divide-slate-100">{filteredRows.map(row => renderRow(activeTab, row, openEdit, remove))}</tbody></table></div>
        {!filteredRows.length && <div className="p-10 text-center text-sm font-bold text-slate-500">No records found.</div>}
      </div>
    </div>
  );
};

const getTitle = (item: CatalogItem) => 'name' in item ? item.name : 'frameCode' in item ? item.frameCode : item.lensCode;
const money = (value?: number) => `${Number(value || 0).toLocaleString()} MMK`;
const Th = ({ children, right }: { children: React.ReactNode; right?: boolean }) => <th className={`px-4 py-3 ${right ? 'text-right' : ''}`}>{children}</th>;
const Td = ({ children, right }: { children: React.ReactNode; right?: boolean }) => <td className={`px-4 py-3 ${right ? 'text-right' : ''}`}>{children}</td>;

const renderHeader = (tab: TabId) => <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase text-slate-500">{tab === 'customers' && <><Th>Name</Th><Th>Phone</Th><Th right>Actions</Th></>}{tab === 'doctors' && <><Th>Name</Th><Th right>Actions</Th></>}{tab === 'frames' && <><Th>Code</Th><Th>Model</Th><Th right>Price</Th><Th right>Actions</Th></>}{tab === 'lenses' && <><Th>Code</Th><Th>Type</Th><Th right>Price</Th><Th right>Actions</Th></>}</tr>;

const renderRow = (tab: TabId, item: CatalogItem, edit: (item: CatalogItem) => void, remove: (item: CatalogItem) => void) => {
  const actions = <div className="flex justify-end gap-1.5"><IconButton title="Edit" onClick={() => edit(item)}><Edit2 size={14} /></IconButton><IconButton title="Delete" danger onClick={() => void remove(item)}><Trash2 size={14} /></IconButton></div>;
  if (tab === 'customers') { const row = item as CustomerDTO; return <tr key={`c-${row.customerId}`} className="bg-white hover:bg-slate-50"><Td><p className="text-sm font-black text-slate-900">{row.name}</p></Td><Td><span className="text-xs font-semibold text-slate-500">{row.phone || '-'}</span></Td><Td right>{actions}</Td></tr>; }
  if (tab === 'doctors') { const row = item as DoctorDTO; return <tr key={`d-${row.doctorId}`} className="bg-white hover:bg-slate-50"><Td><p className="text-sm font-black text-slate-900">{row.name}</p></Td><Td right>{actions}</Td></tr>; }
  if (tab === 'frames') { const row = item as FrameDTO; return <tr key={`f-${row.frameCode}`} className="bg-white hover:bg-slate-50"><Td><span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">{row.frameCode}</span></Td><Td><p className="text-sm font-bold text-slate-800">{row.model || '-'}</p></Td><Td right><span className="text-sm font-black text-slate-900">{money(row.price)}</span></Td><Td right>{actions}</Td></tr>; }
  const row = item as LensDTO; return <tr key={`l-${row.lensCode}`} className="bg-white hover:bg-slate-50"><Td><span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">{row.lensCode}</span></Td><Td><p className="text-sm font-bold text-slate-800">{row.type || '-'}</p></Td><Td right><span className="text-sm font-black text-slate-900">{money(row.price)}</span></Td><Td right>{actions}</Td></tr>;
};

const renderForm = (tab: TabId, form: CatalogItem, setForm: React.Dispatch<React.SetStateAction<CatalogItem>>, editing: boolean) => {
  const update = (patch: Partial<CatalogItem>) => setForm(prev => ({ ...prev, ...patch } as CatalogItem));
  if (tab === 'customers') { const row = form as CustomerDTO; return <><Field label="Customer name"><input required value={row.name} onChange={e => update({ name: e.target.value } as Partial<CustomerDTO>)} className="field" /></Field><Field label="Phone"><input value={row.phone || ''} onChange={e => update({ phone: e.target.value } as Partial<CustomerDTO>)} className="field" /></Field></>; }
  if (tab === 'doctors') { const row = form as DoctorDTO; return <Field label="Doctor name"><input required value={row.name} onChange={e => update({ name: e.target.value } as Partial<DoctorDTO>)} className="field" /></Field>; }
  if (tab === 'frames') { const row = form as FrameDTO; return <><Field label="Frame code"><input required disabled={editing} value={row.frameCode} onChange={e => update({ frameCode: e.target.value } as Partial<FrameDTO>)} className="field disabled:bg-slate-100" /></Field><Field label="Model"><input value={row.model || ''} onChange={e => update({ model: e.target.value } as Partial<FrameDTO>)} className="field" /></Field><Field label="Price"><input required type="number" min="0" value={row.price} onChange={e => update({ price: Number(e.target.value) } as Partial<FrameDTO>)} className="field" /></Field></>; }
  const row = form as LensDTO; return <><Field label="Lens code"><input required disabled={editing} value={row.lensCode} onChange={e => update({ lensCode: e.target.value } as Partial<LensDTO>)} className="field disabled:bg-slate-100" /></Field><Field label="Type"><input value={row.type || ''} onChange={e => update({ type: e.target.value } as Partial<LensDTO>)} className="field" /></Field><Field label="Price"><input required type="number" min="0" value={row.price} onChange={e => update({ price: Number(e.target.value) } as Partial<LensDTO>)} className="field" /></Field></>;
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase text-slate-500">{label}</span>{children}</label>;
const IconButton = ({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) => <button title={title} onClick={onClick} className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white ${danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-600 hover:bg-slate-50'}`}>{children}</button>;

export default CatalogOptions;
