import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, RotateCcw, Save, Settings } from 'lucide-react';
import Swal from 'sweetalert2';
import { companySettingsService } from '../services/api';
import { CompanySettingsDTO } from '../types';

const emptySettings: CompanySettingsDTO = {
  companyName: 'VisionCare',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  invoiceTitle: 'Eye Clinic Voucher',
  footerNote: 'Thank you',
  taglineMm: '',
  logoBase64: '',
  voucherConfigJson: '',
  orderPrefix: 'VC',
  orderDigits: 5
};

const MAX_LOGO_BYTES = 500 * 1024;

const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(reader.error);
  reader.onload = () => resolve(String(reader.result || ''));
  reader.readAsDataURL(file);
});

const CompanySettings: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettingsDTO>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await companySettingsService.getSettings();
      if (response.success && response.data) setSettings({ ...emptySettings, ...response.data });
    } catch (error: any) {
      Swal.fire('Load failed', error.message || 'Could not load company settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const set = <K extends keyof CompanySettingsDTO>(key: K, value: CompanySettingsDTO[K]) => setSettings(prev => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!settings.companyName.trim()) {
      Swal.fire('Required', 'Company name is required.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const response = await companySettingsService.saveSettings(settings);
      if (response.success) {
        setSettings({ ...emptySettings, ...response.data });
        Swal.fire({ icon: 'success', title: 'Settings saved', toast: true, position: 'top-end', timer: 1400, showConfirmButton: false });
      }
    } catch (error: any) {
      Swal.fire('Save failed', error.message || 'Could not save company settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { Swal.fire('Invalid', 'Only image files are supported.', 'warning'); return; }
    if (file.size > MAX_LOGO_BYTES) { Swal.fire('Too large', 'Logo must be smaller than 500KB.', 'warning'); return; }
    try {
      set('logoBase64', await fileToDataUrl(file));
    } catch {
      Swal.fire('Error', 'Could not read logo file.', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <div className="surface flex min-h-[360px] items-center justify-center rounded-lg"><Loader2 className="animate-spin text-slate-500" size={30} /></div>;

  return (
    <div className="page-enter space-y-4">
      <div className="surface rounded-lg">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-left">
            <h3 className="text-base font-black text-slate-950">Company Settings</h3>
            <p className="text-xs font-semibold text-slate-500">Clinic profile, logo, voucher title, and order serial format.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} disabled={loading || saving} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-60"><RotateCcw size={14} /> Reload</button>
            <button onClick={save} disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-black text-white hover:bg-slate-800 disabled:opacity-60">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save</button>
          </div>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <section className="surface rounded-lg p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900"><Settings size={17} className="text-teal-700" /> Clinic Information</div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Company Name"><input value={settings.companyName} onChange={e => set('companyName', e.target.value)} className="field" /></Field>
                <Field label="Phone"><input value={settings.companyPhone || ''} onChange={e => set('companyPhone', e.target.value)} className="field" /></Field>
                <Field label="Email"><input type="email" value={settings.companyEmail || ''} onChange={e => set('companyEmail', e.target.value)} className="field" /></Field>
                <Field label="Myanmar Tagline"><input value={settings.taglineMm || ''} onChange={e => set('taglineMm', e.target.value)} className="field" /></Field>
                <Field label="Address"><textarea rows={3} value={settings.companyAddress || ''} onChange={e => set('companyAddress', e.target.value)} className="field h-auto py-2 md:col-span-2" /></Field>
                <Field label="Voucher Title"><input value={settings.invoiceTitle || ''} onChange={e => set('invoiceTitle', e.target.value)} className="field" /></Field>
                <Field label="Footer Note"><input value={settings.footerNote || ''} onChange={e => set('footerNote', e.target.value)} className="field" /></Field>
              </div>
            </section>

            <section className="surface rounded-lg p-4">
              <div className="mb-4 text-sm font-black text-slate-900">Order Serial</div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Order Prefix"><input maxLength={10} value={settings.orderPrefix || 'VC'} onChange={e => set('orderPrefix', e.target.value.toUpperCase())} className="field font-mono" /></Field>
                <Field label="Digits"><input type="number" min={1} max={10} value={settings.orderDigits || 5} onChange={e => set('orderDigits', Number(e.target.value))} className="field" /></Field>
              </div>
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">Preview: <span className="font-mono text-sm font-black text-teal-700">{settings.orderPrefix || 'VC'}-{'0'.repeat(Math.max((settings.orderDigits || 5) - 1, 0))}1</span></div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="surface rounded-lg p-4">
              <div className="mb-3 flex items-center justify-between"><p className="text-sm font-black text-slate-900">Logo</p><button onClick={() => fileInputRef.current?.click()} className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:bg-slate-50"><ImagePlus size={14} /> Upload</button></div>
              <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
                {settings.logoBase64 ? <img src={settings.logoBase64} alt="logo" className="max-h-32 max-w-full object-contain" /> : <span className="text-xs font-bold text-slate-400">No logo</span>}
              </div>
              {settings.logoBase64 && <button onClick={() => set('logoBase64', '')} className="mt-3 h-8 rounded-lg border border-rose-200 bg-white px-3 text-xs font-black text-rose-600 hover:bg-rose-50">Remove logo</button>}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
            </section>

            <section className="surface rounded-lg p-4">
              <p className="mb-3 text-sm font-black text-slate-900">Voucher Preview</p>
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
                {settings.logoBase64 && <img src={settings.logoBase64} alt="logo preview" className="mx-auto mb-2 max-h-14 object-contain" />}
                <p className="text-base font-black text-slate-950">{settings.companyName || 'VisionCare'}</p>
                {settings.taglineMm && <p className="mt-1 text-xs font-bold text-slate-500">{settings.taglineMm}</p>}
                <p className="mt-2 text-[11px] font-semibold leading-5 text-slate-500">{settings.companyPhone || 'Phone'}{settings.companyAddress ? ` | ${settings.companyAddress}` : ''}</p>
                <div className="my-3 border-t border-slate-200" />
                <p className="text-sm font-black text-slate-900">{settings.invoiceTitle || 'Eye Clinic Voucher'}</p>
                <p className="mt-3 text-[11px] font-bold text-slate-400">{settings.footerNote || 'Thank you'}</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase text-slate-500">{label}</span>{children}</label>;

export default CompanySettings;
