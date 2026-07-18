import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Edit2, Eye, FileText, Glasses, Loader2, Plus, Printer, Search, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { customerApi, doctorApi, frameApi, lensApi, orderApi } from '../services/clinicapiservice';
import { companySettingsService, voucherPrintSettingsService } from '../services/api';
import { CompanySettingsDTO, CustomerDTO, DoctorDTO, EyePrescriptionDTO, EyeSide, FrameDTO, LensDTO, OrderDTO, UsageType, VoucherPrintSettingsDTO } from '../types';

const today = () => new Date().toISOString().slice(0, 10);
const defaultPrescription = (): EyePrescriptionDTO[] => [
  { eyeSide: 'RE', usageType: 'DIST', sph: '', cyl: '', axis: '' },
  { eyeSide: 'LE', usageType: 'DIST', sph: '', cyl: '', axis: '' },
  { eyeSide: 'RE', usageType: 'READ', sph: '', cyl: '', axis: '' },
  { eyeSide: 'LE', usageType: 'READ', sph: '', cyl: '', axis: '' }
];
const emptyOrder = (): OrderDTO => ({ orderDate: today(), measureDate: '', measureTime: '', total: 0, advance: 0, balanceStatus: 'Pending', prescriptions: defaultPrescription() });

const ClinicOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [frames, setFrames] = useState<FrameDTO[]>([]);
  const [lenses, setLenses] = useState<LensDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OrderDTO | null>(null);
  const [form, setForm] = useState<OrderDTO>(emptyOrder());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [orderData, customerData, doctorData, frameData, lensData] = await Promise.all([
        orderApi.getAll(), customerApi.getAll(), doctorApi.getAll(), frameApi.getAll(), lensApi.getAll()
      ]);
      setOrders(orderData);
      setCustomers(customerData);
      setDoctors(doctorData);
      setFrames(frameData);
      setLenses(lensData);
    } catch (error) {
      console.error(error);
      Swal.fire('Load failed', 'Could not load clinic order data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(order => [order.orderId, order.customerName, order.doctorName, order.frameCode, order.lensCode, order.balanceStatus].join(' ').toLowerCase().includes(q));
  }, [orders, searchTerm]);

  const selectedCustomer = customers.find(customer => customer.customerId === Number(form.customerId));
  const selectedDoctor = doctors.find(doctor => doctor.doctorId === Number(form.doctorId));
  const selectedFrame = frames.find(frame => frame.frameCode === form.frameCode);
  const selectedLens = lenses.find(lens => lens.lensCode === form.lensCode);
  const balance = Math.max(Number(form.total || 0) - Number(form.advance || 0), 0);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyOrder());
    setModalOpen(true);
  };

  const openEdit = (order: OrderDTO) => {
    setEditing(order);
    setForm({ ...emptyOrder(), ...order, prescriptions: normalizePrescriptions(order.prescriptions) });
    setModalOpen(true);
  };

  const setFrame = (frameCode: string) => {
    const frame = frames.find(item => item.frameCode === frameCode);
    setForm(prev => ({ ...prev, frameCode: frameCode || undefined, framePrice: Number(frame?.price || 0), total: Number(frame?.price || 0) + Number(prev.lensPrice || selectedLens?.price || 0) }));
  };

  const setLens = (lensCode: string) => {
    const lens = lenses.find(item => item.lensCode === lensCode);
    setForm(prev => ({ ...prev, lensCode: lensCode || undefined, lensPrice: Number(lens?.price || 0), total: Number(prev.framePrice || selectedFrame?.price || 0) + Number(lens?.price || 0) }));
  };

  const createCustomerFromSearch = async (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    try {
      const created = await customerApi.create({ name: cleanName, phone: '' });
      setCustomers(prev => [...prev, created]);
      setForm(prev => ({ ...prev, customerId: created.customerId }));
      Swal.fire({ icon: 'success', title: 'Customer added', toast: true, position: 'top-end', timer: 1200, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire('Create failed', error.message || 'Could not create customer.', 'error');
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload: OrderDTO = {
        ...form,
        customerId: Number(form.customerId),
        doctorId: form.doctorId ? Number(form.doctorId) : undefined,
        framePrice: Number(form.framePrice || selectedFrame?.price || 0),
        lensPrice: Number(form.lensPrice || selectedLens?.price || 0),
        total: Number(form.total || 0),
        advance: Number(form.advance || 0),
        balanceStatus: balance <= 0 ? 'Paid' : form.balanceStatus || 'Pending',
        prescriptions: (form.prescriptions || []).map(row => ({
          ...row,
          sph: toOptionalNumber(row.sph),
          cyl: toOptionalNumber(row.cyl),
          axis: toOptionalNumber(row.axis)
        }))
      };
      if (editing?.orderId) await orderApi.update(editing.orderId, payload);
      else await orderApi.create(payload);
      setModalOpen(false);
      await loadData();
      Swal.fire({ icon: 'success', title: editing ? 'Order updated' : 'Order created', toast: true, position: 'top-end', timer: 1300, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire('Save failed', error.message || 'Could not save order.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (order: OrderDTO) => {
    const result = await Swal.fire({ title: `Delete order #${order.orderId}?`, text: 'Prescription rows linked to this order will also be removed.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete order' });
    if (!result.isConfirmed || !order.orderId) return;
    try {
      await orderApi.delete(order.orderId);
      await loadData();
      Swal.fire({ icon: 'success', title: 'Order deleted', toast: true, position: 'top-end', timer: 1300, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire('Delete failed', error.message || 'Could not delete order.', 'error');
    }
  };

  const printOrder = async (order: OrderDTO) => {
    if (!order.orderId) return;
    try {
      const [fullOrder, companyResponse, voucherResponse] = await Promise.all([
        orderApi.getById(order.orderId),
        companySettingsService.getSettings(),
        voucherPrintSettingsService.getSettings()
      ]);
      const printWindow = window.open('', '_blank', 'width=980,height=760');
      if (!printWindow) {
        Swal.fire('Print blocked', 'Please allow popups for this site and try again.', 'warning');
        return;
      }
      printWindow.document.open();
      printWindow.document.write(buildVoucherPrintHtml(fullOrder, companyResponse.data, voucherResponse.data));
      printWindow.document.close();
      printWindow.focus();
    } catch (error: any) {
      Swal.fire('Print failed', error.message || 'Could not prepare voucher print.', 'error');
    }
  };
  const updatePrescriptionCell = (usageType: UsageType, eyeSide: EyeSide, patch: Partial<EyePrescriptionDTO>) => {
    setForm(prev => ({
      ...prev,
      prescriptions: (prev.prescriptions || defaultPrescription()).map(row =>
        row.usageType === usageType && row.eyeSide === eyeSide ? { ...row, ...patch } : row
      )
    }));
  };

  const prescriptionValue = (usageType: UsageType, eyeSide: EyeSide, key: 'sph' | 'cyl' | 'axis') =>
    (form.prescriptions || []).find(row => row.usageType === usageType && row.eyeSide === eyeSide)?.[key] ?? '';

  if (loading) return <div className="surface flex min-h-[360px] items-center justify-center rounded-lg"><Loader2 className="animate-spin text-slate-500" size={30} /></div>;

  return (
    <div className="page-enter space-y-4">
      {!modalOpen && (
        <>
          <div className="grid gap-3 md:grid-cols-4">
        <Metric title="Orders" value={orders.length} icon={<FileText size={18} />} />
        <Metric title="Pending" value={orders.filter(o => (o.balanceStatus || '').toLowerCase() !== 'paid').length} icon={<CalendarClock size={18} />} />
        <Metric title="Customers" value={customers.length} icon={<Eye size={18} />} />
        <Metric title="Frames + Lenses" value={frames.length + lenses.length} icon={<Glasses size={18} />} />
      </div>

      <div className="surface rounded-lg">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-left">
            <h3 className="text-base font-black text-slate-950">Clinic Orders</h3>
            <p className="text-xs font-semibold text-slate-500">Record voucher, measurement time, frame/lens selection, and eye prescription.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="focus-ring h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold sm:w-72" placeholder="Search customer, doctor, code, status" /></div>
            <button onClick={openCreate} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-black text-white hover:bg-slate-800"><Plus size={14} /> New Order</button>
          </div>
        </div>
        <div className="table-scroll custom-scrollbar"><table className="w-full border-collapse text-left"><thead><tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase text-slate-500"><th className="px-4 py-3">Voucher</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Frame / Lens</th><th className="px-4 py-3">Measure</th><th className="px-4 py-3 text-right">Balance</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredOrders.map(order => <tr key={order.orderId} className="bg-white hover:bg-slate-50"><td className="px-4 py-3"><p className="text-sm font-black text-slate-900">#{orderCode(order)}</p><p className="text-xs font-semibold text-slate-500">{order.orderDate}</p></td><td className="px-4 py-3"><p className="text-sm font-black text-slate-900">{order.customerName || '-'}</p><p className="text-xs font-semibold text-slate-500">{order.doctorName || 'No doctor'}</p></td><td className="px-4 py-3"><p className="text-xs font-black text-slate-700">{cleanVoucherItemName(order.frameModel, order.frameCode) || '-'}</p><p className="text-xs font-semibold text-slate-500">{cleanVoucherItemName(order.lensType, order.lensCode) || '-'}</p></td><td className="px-4 py-3"><p className="text-xs font-bold text-slate-700">{order.measureDate || '-'}</p><p className="text-xs font-semibold text-slate-500">{order.measureTime || '-'}</p></td><td className="px-4 py-3 text-right"><p className="text-sm font-black text-slate-900">{money(Number(order.total || 0) - Number(order.advance || 0))}</p><span className={`rounded-md px-2 py-1 text-[10px] font-black ${(order.balanceStatus || '').toLowerCase() === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{order.balanceStatus || 'Pending'}</span></td><td className="px-4 py-3"><div className="flex justify-end gap-1.5"><IconButton title="Print" onClick={() => void printOrder(order)}><Printer size={14} /></IconButton><IconButton title="Edit" onClick={() => openEdit(order)}><Edit2 size={14} /></IconButton><IconButton title="Delete" danger onClick={() => void remove(order)}><Trash2 size={14} /></IconButton></div></td></tr>)}</tbody></table></div>
        {!filteredOrders.length && <div className="p-10 text-center text-sm font-bold text-slate-500">No orders found.</div>}
      </div>

        </>
      )}

      {modalOpen && (
        <OrderModal title={editing ? `Edit Order #${editing.orderId}` : 'New Order'} onClose={() => setModalOpen(false)}>
          <form onSubmit={save} className="bg-slate-50">
            <div className="grid gap-4 p-4 xl:grid-cols-[1fr_340px]">
              <div className="space-y-4">
                <section className="surface rounded-lg">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-950">Patient Details</h3>
                      <p className="text-xs font-semibold text-slate-500">Customer, doctor, and measurement schedule</p>
                    </div>
                  </div>
                  <div className="grid gap-3 p-4 md:grid-cols-2">
                    <Field label="Customer"><SearchableSelect required placeholder="Search or add customer" value={form.customerId || ''} displayValue={selectedCustomer ? `${selectedCustomer.name}${selectedCustomer.phone ? ` - ${selectedCustomer.phone}` : ''}` : ''} options={customers.map(customer => ({ value: customer.customerId || 0, label: `${customer.name}${customer.phone ? ` - ${customer.phone}` : ''}` }))} onSelect={value => setForm({ ...form, customerId: Number(value) })} onCreate={createCustomerFromSearch} createLabel="Add customer" /></Field>
                    <Field label="Doctor"><SearchableSelect placeholder="Search doctor" value={form.doctorId || ''} displayValue={selectedDoctor?.name || ''} options={doctors.map(doctor => ({ value: doctor.doctorId || 0, label: doctor.name }))} onSelect={value => setForm({ ...form, doctorId: value ? Number(value) : undefined })} /></Field>
                    <Field label="Order Date"><input required type="date" value={form.orderDate || today()} onChange={e => setForm({ ...form, orderDate: e.target.value })} className="field" /></Field>
                    <Field label="Measure Date"><input type="date" value={form.measureDate || ''} onChange={e => setForm({ ...form, measureDate: e.target.value })} className="field" /></Field>
                    <Field label="Measure Time"><input type="time" value={form.measureTime || ''} onChange={e => setForm({ ...form, measureTime: e.target.value })} className="field" /></Field>
                    <Field label="Balance Status"><select value={form.balanceStatus || 'Pending'} onChange={e => setForm({ ...form, balanceStatus: e.target.value })} className="field"><option>Pending</option><option>Paid</option></select></Field>
                  </div>
                </section>

                <section className="surface rounded-lg">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <h3 className="text-sm font-black text-slate-950">Frame and Lens</h3>
                    <p className="text-xs font-semibold text-slate-500">Select catalog items and confirm payment</p>
                  </div>
                  <div className="grid gap-3 p-4 md:grid-cols-2">
                    <Field label="Frame"><SearchableSelect placeholder="Search frame" value={form.frameCode || ''} displayValue={selectedFrame ? `${cleanVoucherItemName(selectedFrame.model, selectedFrame.frameCode) || 'Frame'} (${money(form.framePrice ?? selectedFrame.price)})` : ''} options={frames.map(frame => ({ value: frame.frameCode, label: `${frame.frameCode} - ${frame.model || 'Frame'} (${money(frame.price)})` }))} onSelect={value => setFrame(String(value))} /></Field>
                    <Field label="Lens"><SearchableSelect placeholder="Search lens" value={form.lensCode || ''} displayValue={selectedLens ? `${cleanVoucherItemName(selectedLens.type, selectedLens.lensCode) || 'Lens'} (${money(form.lensPrice ?? selectedLens.price)})` : ''} options={lenses.map(lens => ({ value: lens.lensCode, label: `${lens.lensCode} - ${lens.type || 'Lens'} (${money(lens.price)})` }))} onSelect={value => setLens(String(value))} /></Field>
                    <Field label="Total"><input type="number" min="0" value={form.total || 0} onChange={e => setForm({ ...form, total: Number(e.target.value) })} className="field" /></Field>
                    <Field label="Advance"><input type="number" min="0" value={form.advance || 0} onChange={e => setForm({ ...form, advance: Number(e.target.value) })} className="field" /></Field>
                  </div>
                </section>

                <section className="surface overflow-hidden rounded-lg">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-950">Eye Prescription</h3>
                      <p className="text-xs font-semibold text-slate-500">DIST and READ values for R.E and L.E</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 text-xs font-black text-slate-600">
                      <span className="rounded-md bg-white px-3 py-1 text-center shadow-sm">R.E</span>
                      <span className="rounded-md bg-white px-3 py-1 text-center shadow-sm">L.E</span>
                    </div>
                  </div>
                  <div className="table-scroll custom-scrollbar">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                      <thead><tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase text-slate-500"><th className="w-24 px-3 py-3">Type</th><th className="px-3 py-3">R.E SPH</th><th className="px-3 py-3">R.E CYL</th><th className="px-3 py-3">R.E AXIS</th><th className="px-3 py-3">L.E SPH</th><th className="px-3 py-3">L.E CYL</th><th className="px-3 py-3">L.E AXIS</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">{(['DIST', 'READ'] as UsageType[]).map(usage => <tr key={usage} className="bg-white"><td className="px-3 py-3"><span className={`inline-flex h-8 min-w-16 items-center justify-center rounded-lg px-3 text-xs font-black ${usage === 'DIST' ? 'bg-sky-50 text-sky-700' : 'bg-emerald-50 text-emerald-700'}`}>{usage}</span></td><PrescriptionCell value={prescriptionValue(usage, 'RE', 'sph')} onChange={value => updatePrescriptionCell(usage, 'RE', { sph: value })} /><PrescriptionCell value={prescriptionValue(usage, 'RE', 'cyl')} onChange={value => updatePrescriptionCell(usage, 'RE', { cyl: value })} /><PrescriptionCell value={prescriptionValue(usage, 'RE', 'axis')} numeric onChange={value => updatePrescriptionCell(usage, 'RE', { axis: value })} /><PrescriptionCell value={prescriptionValue(usage, 'LE', 'sph')} onChange={value => updatePrescriptionCell(usage, 'LE', { sph: value })} /><PrescriptionCell value={prescriptionValue(usage, 'LE', 'cyl')} onChange={value => updatePrescriptionCell(usage, 'LE', { cyl: value })} /><PrescriptionCell value={prescriptionValue(usage, 'LE', 'axis')} numeric onChange={value => updatePrescriptionCell(usage, 'LE', { axis: value })} /></tr>)}</tbody>
                    </table>
                  </div>
                </section>
              </div>

              <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
                <section className="surface rounded-lg p-4">
                  <p className="text-[11px] font-black uppercase text-slate-500">Order Summary</p>
                  <div className="mt-3 space-y-3">
                    <SummaryRow label="Customer" value={selectedCustomer?.name || 'Not selected'} />
                    <SummaryRow label="Doctor" value={selectedDoctor?.name || 'No doctor'} />
                    <SummaryRow label="Frame" value={selectedFrame ? `${cleanVoucherItemName(selectedFrame.model, selectedFrame.frameCode) || 'Frame'} - ${money(form.framePrice ?? selectedFrame.price)}` : 'No frame'} />
                    <SummaryRow label="Lens" value={selectedLens ? `${cleanVoucherItemName(selectedLens.type, selectedLens.lensCode) || 'Lens'} - ${money(form.lensPrice ?? selectedLens.price)}` : 'No lens'} />
                  </div>
                </section>
                <section className="surface rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <AmountBox label="Frame" value={money(form.framePrice ?? selectedFrame?.price)} />
                    <AmountBox label="Lens" value={money(form.lensPrice ?? selectedLens?.price)} />
                    <AmountBox label="Total" value={money(form.total)} />
                    <AmountBox label="Advance" value={money(form.advance)} />
                  </div>
                  <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
                    <p className="text-[11px] font-black uppercase text-amber-700">Balance</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">{balance <= 0 ? 'Paid' : money(balance)}</p>
                  </div>
                </section>
              </aside>
            </div>
            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
              <button type="button" onClick={() => setModalOpen(false)} className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 hover:bg-slate-50">Back</button>
              <button disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-5 text-xs font-black text-white hover:bg-slate-800 disabled:opacity-60">{saving && <Loader2 size={14} className="animate-spin" />}Save Order</button>
            </div>
          </form>
        </OrderModal>
      )}
    </div>
  );
};

const normalizePrescriptions = (rows?: EyePrescriptionDTO[]) => {
  const base = defaultPrescription();
  if (!rows?.length) return base;
  return base.map(row => rows.find(item => item.eyeSide === row.eyeSide && item.usageType === row.usageType) || row);
};
const toOptionalNumber = (value?: number | string) => value === '' || value === undefined || value === null ? undefined : Number(value);
const money = (value?: number) => `${Number(value || 0).toLocaleString()} MMK`;
const orderCode = (order: OrderDTO) => order.orderCode || String(order.orderId || 0).padStart(4, '0').slice(-4);
const Metric = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => <div className="surface rounded-lg p-4"><div className="flex items-center justify-between"><p className="text-xs font-bold text-slate-500">{title}</p><div className="rounded-lg bg-teal-50 p-2 text-teal-700">{icon}</div></div><p className="mt-2 text-2xl font-black text-slate-950">{value}</p></div>;
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase text-slate-500">{label}</span>{children}</label>;

type SearchOption = { value: string | number; label: string };

const SearchableSelect = ({ value, displayValue, options, onSelect, placeholder, required, onCreate, createLabel }: { value?: string | number; displayValue?: string; options: SearchOption[]; onSelect: (value: string | number) => void; placeholder: string; required?: boolean; onCreate?: (label: string) => Promise<void> | void; createLabel?: string }) => {
  const [query, setQuery] = useState(displayValue || '');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => { setQuery(displayValue || ''); }, [displayValue, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 8);
    return options.filter(option => option.label.toLowerCase().includes(q)).slice(0, 8);
  }, [options, query]);

  const exactMatch = options.some(option => option.label.toLowerCase() === query.trim().toLowerCase());

  const handleCreate = async () => {
    if (!onCreate || !query.trim()) return;
    setCreating(true);
    try {
      await onCreate(query.trim());
      setOpen(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="relative">
      <input
        required={required && !value}
        value={query}
        onChange={event => { setQuery(event.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 140)}
        className="field pr-9"
        placeholder={placeholder}
      />
      {value && <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => { onSelect(''); setQuery(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-1.5 text-xs font-black text-slate-400 hover:bg-slate-100 hover:text-slate-700">X</button>}
      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl custom-scrollbar">
          {filtered.map(option => (
            <button key={`${option.value}`} type="button" onMouseDown={event => event.preventDefault()} onClick={() => { onSelect(option.value); setQuery(option.label); setOpen(false); }} className="w-full rounded-md px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50">
              {option.label}
            </button>
          ))}
          {!filtered.length && <div className="px-3 py-2 text-xs font-bold text-slate-400">No matching result</div>}
          {onCreate && query.trim() && !exactMatch && (
            <button type="button" disabled={creating} onMouseDown={event => event.preventDefault()} onClick={handleCreate} className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-xs font-black text-white hover:bg-slate-800 disabled:opacity-60">
              {creating && <Loader2 size={13} className="animate-spin" />}{createLabel || 'Add'}: {query.trim()}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const PrescriptionCell = ({ value, onChange, numeric }: { value: number | string; onChange: (value: string) => void; numeric?: boolean }) => <td className="px-3 py-2"><input inputMode={numeric ? 'numeric' : 'decimal'} value={value ?? ''} onChange={e => onChange(e.target.value)} className="field h-9 text-center" placeholder={numeric ? '0' : '0.00'} /></td>;
const SummaryRow = ({ label, value }: { label: string; value: string }) => <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0"><span className="text-xs font-bold text-slate-500">{label}</span><span className="max-w-[190px] text-right text-xs font-black text-slate-900">{value}</span></div>;
const VoucherLine = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="grid grid-cols-[110px_1fr] items-center gap-3 text-sm font-black md:grid-cols-[130px_1fr]"><span>{label}</span>{children}</label>;
const AmountRow = ({ label, value }: { label: string; value: string }) => <tr><td className="w-28 border-r-2 border-[#354a88]/70 px-3 py-2">{label}</td><td className="px-3 py-2">K. {value.replace(' MMK', '')}</td></tr>;
const VoucherPrescriptionInput = ({ value, onChange, placeholder, numeric, last }: { value: number | string; onChange: (value: string) => void; placeholder: string; numeric?: boolean; last?: boolean }) => <td className={last ? 'px-2 py-2' : 'border-r-2 border-[#354a88]/70 px-2 py-2'}><input inputMode={numeric ? 'numeric' : 'decimal'} value={value ?? ''} onChange={e => onChange(e.target.value)} className="h-10 w-full bg-transparent text-center text-lg font-semibold text-[#243b76] outline-none" placeholder={placeholder} /></td>;
const IconButton = ({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) => <button title={title} onClick={onClick} className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white ${danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-600 hover:bg-slate-50'}`}>{children}</button>;
const Section = ({ title, icon, children, flush }: { title: string; icon: React.ReactNode; children: React.ReactNode; flush?: boolean }) => <section className="rounded-lg border border-slate-200 bg-white shadow-sm"><div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3"><div className="rounded-lg bg-teal-50 p-2 text-teal-700">{icon}</div><h3 className="text-sm font-black text-slate-950">{title}</h3></div><div className={flush ? '' : 'space-y-3 p-4'}>{children}</div></section>;
const SummaryLine = ({ label, value }: { label: string; value: string }) => <div className="flex items-start justify-between gap-3 border-t border-white/10 pt-3"><span className="text-xs font-bold text-slate-400">{label}</span><span className="max-w-[190px] text-right text-xs font-black text-white">{value}</span></div>;
const AmountBox = ({ label, value }: { label: string; value: string }) => <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] font-black uppercase text-slate-500">{label}</p><p className="mt-1 text-sm font-black text-slate-950">{value}</p></div>;

const buildVoucherPrintHtml = (order: OrderDTO, company?: CompanySettingsDTO, settings?: VoucherPrintSettingsDTO) => {
  const primary = settings?.primaryColor || '#354a88';
  const paper = settings?.paperColor || '#fbf7dc';
  const currency = settings?.currencyLabel || 'K.';
  const marginTop = settings?.marginTopMm ?? 10;
  const marginRight = settings?.marginRightMm ?? 10;
  const marginBottom = settings?.marginBottomMm ?? 10;
  const marginLeft = settings?.marginLeftMm ?? 10;
  const rowHeight = settings?.lineHeightPx ?? 34;
  const bodySize = settings?.bodyFontSizePx ?? 13;
  const tableSize = settings?.tableFontSizePx ?? 13;
  const contactSize = settings?.contactFontSizePx ?? 12;
  const amountSize = settings?.amountFontSizePx ?? 17;
  const eyeTitleSize = settings?.eyeTitleFontSizePx ?? 24;
  const footerSize = settings?.footerFontSizePx ?? 13;
  const serialSize = settings?.serialFontSizePx ?? 24;
  const logoWidth = settings?.logoWidthPx ?? 130;
  const headerSize = settings?.headerFontSizePx ?? 20;
  const framePrice = Number(order.framePrice || 0);
  const lensPrice = Number(order.lensPrice || 0);
  const balance = Math.max(Number(order.total || 0) - Number(order.advance || 0), 0);
  const p = (usage: UsageType, eye: EyeSide, key: 'sph' | 'cyl' | 'axis') => {
    const value = normalizePrescriptions(order.prescriptions).find(row => row.usageType === usage && row.eyeSide === eye)?.[key];
    return value === undefined || value === null || value === '' ? '&nbsp;' : escapeHtml(String(value));
  };
  const logo = company?.logoBase64 && settings?.showLogo !== false
    ? `<img class="logo-img" src="${escapeAttribute(company.logoBase64)}" alt="Clinic logo" />`
    : settings?.showLogo === false ? '' : '<div class="text-logo"><div>VISION</div><div>CARE</div></div>';

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Voucher #${escapeHtml(orderCode(order))}</title>
  <style>
    @page { size: ${settings?.paperWidthMm || 148}mm ${settings?.paperHeightMm || 210}mm; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #e5e7eb; font-family: Pyidaungsu, "Myanmar Text", "Segoe UI", Arial, sans-serif; color: ${primary}; }
    .toolbar { display: flex; gap: 8px; justify-content: center; padding: 14px; }
    .toolbar button { border: 0; border-radius: 8px; background: #0f172a; color: white; padding: 10px 16px; font-weight: 800; cursor: pointer; }
    .paper { width: ${settings?.paperWidthMm || 148}mm; min-height: ${settings?.paperHeightMm || 210}mm; margin: 0 auto 24px; padding: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm; background: ${paper}; color: ${primary}; box-shadow: 0 14px 38px rgba(15,23,42,.2); font-size: ${bodySize}px; }
    .header { text-align: center; }
    .brand-row { display: flex; align-items: center; justify-content: center; gap: 22px; }
    .logo-img { width: ${logoWidth}px; max-height: 78px; object-fit: contain; }
    .text-logo { width: ${logoWidth}px; text-align: left; font-weight: 900; line-height: .9; font-size: 28px; letter-spacing: 0; }
    .clinic-name { font-size: ${headerSize}px; font-weight: 900; }
    .contact { margin-top: 7px; font-size: ${contactSize}px; line-height: 1.55; font-weight: 700; }
    .rule { border-top: 2px solid ${primary}; margin: 12px 0 16px; }
    .top-grid { display: grid; grid-template-columns: 1fr 245px; gap: 22px; }
    .line { display: grid; grid-template-columns: 110px 1fr; align-items: end; gap: 12px; min-height: ${rowHeight}px; font-weight: 800; }
    .line.compact { grid-template-columns: 62px 1fr; }
    .fill { border-bottom: 2px dotted ${primary}; min-height: 24px; padding: 0 8px 2px; font-size: 15px; }
    table { border-collapse: collapse; width: 100%; }
    .money-table { margin-top: 10px; font-size: ${tableSize}px; font-weight: 800; }
    .money-table td { border: 2px solid ${primary}; padding: 7px 8px; height: ${rowHeight}px; }
    .money-value { font-size: ${amountSize}px; }
    .eye-head { display: grid; grid-template-columns: 1fr 1fr; margin-top: 24px; text-align: center; font-size: ${eyeTitleSize}px; font-weight: 900; }
    .rx-table { margin-top: 10px; text-align: center; font-size: ${tableSize}px; font-weight: 800; }
    .rx-table td, .rx-table th { border: 2px solid ${primary}; height: ${rowHeight}px; padding: 5px; }
    .footer { display: grid; grid-template-columns: 20px 1fr; gap: 12px; margin-top: 14px; font-size: ${footerSize}px; line-height: 1.65; font-weight: 800; }
    .checkbox { width: 16px; height: 16px; border: 2px solid ${primary}; margin-top: 4px; }
    .serial { margin-top: 8px; text-align: center; font-size: ${serialSize}px; font-weight: 900; letter-spacing: 4px; }
    @media print {
      body { background: white; }
      .toolbar { display: none; }
      .paper { margin: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="toolbar"><button onclick="window.print()">Print Voucher</button><button onclick="window.close()">Close</button></div>
  <main class="paper">
    <section class="header">
      <div class="brand-row">
        ${logo}
        ${settings?.showClinicName === false ? '' : `<div class="clinic-name">${escapeHtml(company?.companyName || 'VisionCare')}</div>`}
      </div>
      <div class="contact">
        ${settings?.showAddress === false ? '' : `<div>${escapeHtml(company?.companyAddress || 'Eye clinic and optical service')}</div>`}
        ${settings?.showPhone === false ? '' : `<div>Ph : ${escapeHtml(company?.companyPhone || '09-44 2626 461 ~ 62 ~ 63')}</div>`}
      </div>
    </section>
    <div class="rule"></div>
    <section class="top-grid">
      <div>
        <div class="line"><span>${escapeHtml(settings?.nameLabel || 'Name')}</span><span class="fill">${escapeHtml(order.customerName || '')}</span></div>
        <div class="line"><span>${escapeHtml(settings?.frameLabel || 'Frame')}</span><span class="fill">${escapeHtml(cleanVoucherItemName(order.frameModel, order.frameCode))}</span></div>
        <div class="line"><span>${escapeHtml(settings?.lensLabel || 'Lenss')}</span><span class="fill">${escapeHtml(cleanVoucherItemName(order.lensType, order.lensCode))}</span></div>
        <div class="line"><span>${escapeHtml(settings?.doctorLabel || 'Doctor')}</span><span class="fill">${escapeHtml(order.doctorName || '')}</span></div>
        <div class="line"><span>${escapeHtml(settings?.measureDateLabel || 'Measure Date')}</span><span class="fill">${escapeHtml(formatDate(order.measureDate))}</span></div>
        <div class="line"><span>${escapeHtml(settings?.measureTimeLabel || 'Measure Time')}</span><span class="fill">${escapeHtml(order.measureTime || '')}</span></div>
      </div>
      <div>
        <div class="line compact"><span>${escapeHtml(settings?.dateLabel || 'Date')}</span><span class="fill">${escapeHtml(formatDate(order.orderDate))}</span></div>
        <table class="money-table"><tbody>
          <tr><td>${escapeHtml(settings?.frameLabel || 'Frame')}</td><td class="money-value">${currency} ${formatPlainMoney(framePrice)}</td></tr>
          <tr><td>${escapeHtml(settings?.lensLabel || 'Lenses')}</td><td class="money-value">${currency} ${formatPlainMoney(lensPrice)}</td></tr>
          <tr><td>Total</td><td class="money-value">${currency} ${formatPlainMoney(order.total)}</td></tr>
          <tr><td>Advance</td><td class="money-value">${currency} ${formatPlainMoney(order.advance)}</td></tr>
          <tr><td>Balance</td><td class="money-value">${balance <= 0 || (order.balanceStatus || '').toLowerCase() === 'paid' ? 'Paid' : `${currency} ${formatPlainMoney(balance)}`}</td></tr>
        </tbody></table>
      </div>
    </section>
    <section class="eye-head"><div>R.E</div><div>L.E</div></section>
    <table class="rx-table"><tbody>
      <tr><th></th><th>SPH</th><th>CYL</th><th>AXIS</th><th>SPH</th><th>CYL</th><th>AXIS</th></tr>
      <tr><td>DIST</td><td>${p('DIST','RE','sph')}</td><td>${p('DIST','RE','cyl')}</td><td>${p('DIST','RE','axis')}</td><td>${p('DIST','LE','sph')}</td><td>${p('DIST','LE','cyl')}</td><td>${p('DIST','LE','axis')}</td></tr>
      <tr><td>READ</td><td>${p('READ','RE','sph')}</td><td>${p('READ','RE','cyl')}</td><td>${p('READ','RE','axis')}</td><td>${p('READ','LE','sph')}</td><td>${p('READ','LE','cyl')}</td><td>${p('READ','LE','axis')}</td></tr>
    </tbody></table>
    <div class="rule"></div>
    ${settings?.showFooterNotice === false ? '' : `<section class="footer"><div class="checkbox"></div><div>${escapeHtml(settings?.footerNotice || company?.footerNote || 'Please bring this voucher when collecting glasses.')}</div></section>`}
    ${settings?.showSerial === false ? '' : `<div class="serial">${escapeHtml(orderCode(order))}</div>`}
  </main>

</body>
</html>`;
};

const cleanVoucherItemName = (name?: string, code?: string) => {
  const cleanName = (name || '').trim();
  const cleanCode = (code || '').trim();
  if (!cleanName) return '';
  if (!cleanCode) return cleanName;
  return cleanName
    .replace(new RegExp(`^${escapeRegExp(cleanCode)}\\s*-\\s*`, 'i'), '')
    .replace(new RegExp(`\\s*-\\s*${escapeRegExp(cleanCode)}$`, 'i'), '')
    .trim();
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');
const escapeAttribute = (value: string) => escapeHtml(value);
const formatPlainMoney = (value?: number) => Number(value || 0).toLocaleString();
const formatDate = (value?: string) => {
  if (!value) return '';
  const parts = value.split('-');
  if (parts.length !== 3) return value;
  return `${parts[2]}.${parts[1]}.${parts[0].slice(2)}`;
};
const OrderModal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
  <section className="surface overflow-hidden rounded-lg shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
      <div>
        <h3 className="text-base font-black text-slate-950">{title}</h3>
        <p className="text-xs font-semibold text-slate-500">Complete the patient, item, payment, and prescription details.</p>
      </div>
      <button onClick={onClose} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:bg-slate-50"><X size={15} /> Back</button>
    </div>
    {children}
  </section>
);

export default ClinicOrders;













