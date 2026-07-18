import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { Eye, Printer, RefreshCcw, RotateCcw, Save } from 'lucide-react';
import { companySettingsService, voucherPrintSettingsService } from '../services/api';
import { CompanySettingsDTO, VoucherPrintSettingsDTO } from '../types';

const defaultVoucherSettings: VoucherPrintSettingsDTO = {
  paperSize: 'A5',
  paperWidthMm: 148,
  paperHeightMm: 210,
  marginTopMm: 10,
  marginRightMm: 10,
  marginBottomMm: 10,
  marginLeftMm: 10,
  primaryColor: '#354a88',
  paperColor: '#fbf7dc',
  showLogo: true,
  showClinicName: true,
  showAddress: true,
  showPhone: true,
  showFooterNotice: true,
  showSerial: true,
  logoWidthPx: 130,
  headerFontSizePx: 20,
  bodyFontSizePx: 13,
  tableFontSizePx: 13,
  contactFontSizePx: 12,
  amountFontSizePx: 17,
  eyeTitleFontSizePx: 24,
  footerFontSizePx: 13,
  serialFontSizePx: 24,
  lineHeightPx: 34,
  voucherTitle: 'Eye Clinic Voucher',
  nameLabel: 'Name',
  frameLabel: 'Frame',
  lensLabel: 'Lenss',
  doctorLabel: 'Doctor',
  dateLabel: 'Date',
  measureDateLabel: 'Measure Date',
  measureTimeLabel: 'Measure Time',
  currencyLabel: 'K.',
  footerNotice: 'Please bring this voucher when collecting glasses.'
};

const fieldClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100';
const labelClass = 'mb-1 block text-[11px] font-black uppercase text-slate-500';

const VoucherPrintSettings: React.FC = () => {
  const [settings, setSettings] = useState<VoucherPrintSettingsDTO>(defaultVoucherSettings);
  const [company, setCompany] = useState<CompanySettingsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [voucherResponse, companyResponse] = await Promise.all([
        voucherPrintSettingsService.getSettings(),
        companySettingsService.getSettings()
      ]);
      setSettings({ ...defaultVoucherSettings, ...(voucherResponse.data || {}) });
      setCompany(companyResponse.data || null);
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Unable to load voucher settings', text: error?.message || 'Please try again.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = <K extends keyof VoucherPrintSettingsDTO>(key: K, value: VoucherPrintSettingsDTO[K]) => {
    setSettings(previous => ({ ...previous, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await voucherPrintSettingsService.saveSettings(settings);
      setSettings({ ...defaultVoucherSettings, ...(response.data || {}) });
      Swal.fire({ icon: 'success', title: 'Voucher settings saved', timer: 1100, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Save failed', text: error?.message || 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    const result = await Swal.fire({ icon: 'question', title: 'Reset voucher layout?', text: 'This will restore the VisionCare paper voucher defaults.', showCancelButton: true, confirmButtonText: 'Reset' });
    if (!result.isConfirmed) return;
    setSaving(true);
    try {
      const response = await voucherPrintSettingsService.resetSettings();
      setSettings({ ...defaultVoucherSettings, ...(response.data || {}) });
      Swal.fire({ icon: 'success', title: 'Defaults restored', timer: 1100, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Reset failed', text: error?.message || 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const sampleOrder = useMemo(() => ({
    customer: 'Mg Htet Aung',
    frame: 'Titanium Optical Frame',
    lens: 'Blue Cut Coating Lens',
    doctor: 'Dr. DKKM',
    date: '18.6.26',
    measureDate: '8.6.26',
    measureTime: '05:00 PM',
    framePrice: '30,000',
    lensPrice: '40,000',
    total: '70,000',
    advance: '-',
    balance: 'Paid',
    serial: '2762'
  }), []);

  if (loading) return <div className="surface rounded-lg p-6 text-sm font-bold text-slate-500">Loading voucher print settings...</div>;

  return (
    <div className="page-enter grid gap-4 xl:grid-cols-[minmax(0,520px)_1fr]">
      <section className="space-y-4">
        <div className="surface rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase text-teal-700">Print Layout</p>
              <h3 className="mt-1 text-xl font-black text-slate-950">Voucher Print Settings</h3>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">Tune paper size, labels, colors and visibility for the VisionCare voucher.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={load} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 hover:bg-slate-50" title="Reload"><RefreshCcw size={15} /> Reload</button>
              <button onClick={reset} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-black text-amber-800 hover:bg-amber-100" title="Reset"><RotateCcw size={15} /> Reset</button>
            </div>
          </div>
        </div>

        <SettingsPanel title="Paper">
          <div className="grid gap-3 sm:grid-cols-3">
            <TextField label="Paper size" value={settings.paperSize || ''} onChange={value => update('paperSize', value)} />
            <NumberField label="Width mm" value={settings.paperWidthMm} onChange={value => update('paperWidthMm', value)} />
            <NumberField label="Height mm" value={settings.paperHeightMm} onChange={value => update('paperHeightMm', value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <NumberField label="Top" value={settings.marginTopMm} onChange={value => update('marginTopMm', value)} />
            <NumberField label="Right" value={settings.marginRightMm} onChange={value => update('marginRightMm', value)} />
            <NumberField label="Bottom" value={settings.marginBottomMm} onChange={value => update('marginBottomMm', value)} />
            <NumberField label="Left" value={settings.marginLeftMm} onChange={value => update('marginLeftMm', value)} />
          </div>
        </SettingsPanel>

        <SettingsPanel title="Style">
          <div className="grid gap-3 sm:grid-cols-2">
            <ColorField label="Ink color" value={settings.primaryColor || '#354a88'} onChange={value => update('primaryColor', value)} />
            <ColorField label="Paper color" value={settings.paperColor || '#fbf7dc'} onChange={value => update('paperColor', value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <NumberField label="Logo px" value={settings.logoWidthPx} onChange={value => update('logoWidthPx', value)} />
            <NumberField label="Header px" value={settings.headerFontSizePx} onChange={value => update('headerFontSizePx', value)} />
            <NumberField label="Contact px" value={settings.contactFontSizePx} onChange={value => update('contactFontSizePx', value)} />
            <NumberField label="Body px" value={settings.bodyFontSizePx} onChange={value => update('bodyFontSizePx', value)} />
            <NumberField label="Table px" value={settings.tableFontSizePx} onChange={value => update('tableFontSizePx', value)} />
            <NumberField label="Amount px" value={settings.amountFontSizePx} onChange={value => update('amountFontSizePx', value)} />
            <NumberField label="Eye title px" value={settings.eyeTitleFontSizePx} onChange={value => update('eyeTitleFontSizePx', value)} />
            <NumberField label="Footer px" value={settings.footerFontSizePx} onChange={value => update('footerFontSizePx', value)} />
            <NumberField label="Serial px" value={settings.serialFontSizePx} onChange={value => update('serialFontSizePx', value)} />
            <NumberField label="Rows px" value={settings.lineHeightPx} onChange={value => update('lineHeightPx', value)} />
          </div>
        </SettingsPanel>

        <SettingsPanel title="Labels">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Voucher title" value={settings.voucherTitle || ''} onChange={value => update('voucherTitle', value)} />
            <TextField label="Currency" value={settings.currencyLabel || ''} onChange={value => update('currencyLabel', value)} />
            <TextField label="Name" value={settings.nameLabel || ''} onChange={value => update('nameLabel', value)} />
            <TextField label="Date" value={settings.dateLabel || ''} onChange={value => update('dateLabel', value)} />
            <TextField label="Frame" value={settings.frameLabel || ''} onChange={value => update('frameLabel', value)} />
            <TextField label="Lens" value={settings.lensLabel || ''} onChange={value => update('lensLabel', value)} />
            <TextField label="Doctor" value={settings.doctorLabel || ''} onChange={value => update('doctorLabel', value)} />
            <TextField label="Measure date" value={settings.measureDateLabel || ''} onChange={value => update('measureDateLabel', value)} />
            <TextField label="Measure time" value={settings.measureTimeLabel || ''} onChange={value => update('measureTimeLabel', value)} />
          </div>
        </SettingsPanel>

        <SettingsPanel title="Visible Sections">
          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle label="Logo" checked={Boolean(settings.showLogo)} onChange={value => update('showLogo', value)} />
            <Toggle label="Clinic name" checked={Boolean(settings.showClinicName)} onChange={value => update('showClinicName', value)} />
            <Toggle label="Address" checked={Boolean(settings.showAddress)} onChange={value => update('showAddress', value)} />
            <Toggle label="Phone" checked={Boolean(settings.showPhone)} onChange={value => update('showPhone', value)} />
            <Toggle label="Footer notice" checked={Boolean(settings.showFooterNotice)} onChange={value => update('showFooterNotice', value)} />
            <Toggle label="Serial number" checked={Boolean(settings.showSerial)} onChange={value => update('showSerial', value)} />
          </div>
          <div>
            <label className={labelClass}>Footer notice</label>
            <textarea value={settings.footerNotice || ''} onChange={event => update('footerNotice', event.target.value)} className={`${fieldClass} min-h-[90px] resize-y`} />
          </div>
        </SettingsPanel>

        <button onClick={save} disabled={saving} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-black text-white shadow-sm hover:bg-teal-700 disabled:opacity-60">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Voucher Print Settings'}
        </button>
      </section>

      <section className="min-w-0">
        <div className="sticky top-5 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-black text-slate-800"><Eye size={17} className="text-teal-700" /> Live Voucher Preview</div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-500"><Printer size={14} /> {settings.paperSize || 'A5'}</div>
          </div>
          <VoucherPreview settings={settings} company={company} sample={sampleOrder} />
        </div>
      </section>
    </div>
  );
};

const SettingsPanel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="surface rounded-lg p-4">
    <h4 className="mb-3 text-sm font-black text-slate-950">{title}</h4>
    <div className="space-y-3">{children}</div>
  </div>
);

const TextField: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input value={value} onChange={event => onChange(event.target.value)} className={fieldClass} />
  </div>
);

const NumberField: React.FC<{ label: string; value?: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input type="number" value={value ?? 0} onChange={event => onChange(Number(event.target.value))} className={fieldClass} />
  </div>
);

const ColorField: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="flex gap-2">
      <input type="color" value={value} onChange={event => onChange(event.target.value)} className="h-10 w-12 rounded-lg border border-slate-200 bg-white p-1" />
      <input value={value} onChange={event => onChange(event.target.value)} className={fieldClass} />
    </div>
  </div>
);

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
    <span>{label}</span>
    <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="h-4 w-4 accent-teal-600" />
  </label>
);

const VoucherPreview: React.FC<{ settings: VoucherPrintSettingsDTO; company: CompanySettingsDTO | null; sample: Record<string, string> }> = ({ settings, company, sample }) => {
  const color = settings.primaryColor || '#354a88';
  const lineStyle = { borderColor: color };
  const rowHeight = settings.lineHeightPx || 34;
  const bodySize = settings.bodyFontSizePx || 13;
  const tableSize = settings.tableFontSizePx || 13;
  const amountSize = settings.amountFontSizePx || 17;
  const eyeTitleSize = settings.eyeTitleFontSizePx || 24;
  const footerSize = settings.footerFontSizePx || 13;
  const serialSize = settings.serialFontSizePx || 24;

  return (
    <div className="overflow-auto rounded-lg border border-slate-200 bg-slate-100 p-4 shadow-sm">
      <div
        className="mx-auto min-w-[620px] max-w-[760px] shadow-md"
        style={{
          width: `${Math.min(settings.paperWidthMm || 148, 170) * 4.2}px`,
          minHeight: `${Math.min(settings.paperHeightMm || 210, 230) * 3.4}px`,
          padding: `${settings.marginTopMm || 10}px ${settings.marginRightMm || 10}px ${settings.marginBottomMm || 10}px ${settings.marginLeftMm || 10}px`,
          background: settings.paperColor || '#fbf7dc',
          color,
          fontSize: bodySize
        }}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-6">
            {settings.showLogo && (
              company?.logoBase64 ? (
                <img
                  src={company.logoBase64}
                  alt="Clinic logo"
                  className="max-h-[76px] object-contain"
                  style={{ width: settings.logoWidthPx || 130 }}
                />
              ) : (
                <div className="text-left font-black leading-none" style={{ width: settings.logoWidthPx || 130 }}>
                  <div className="text-[28px] tracking-wide">VISION</div>
                  <div className="text-[28px] tracking-wide">CARE</div>
                </div>
              )
            )}
            {settings.showClinicName && <div className="font-black" style={{ fontSize: settings.headerFontSizePx || 20 }}>{company?.companyName || 'VisionCare'}</div>}
          </div>
<div className="mt-2 space-y-1 font-bold leading-5" style={{ fontSize: settings.contactFontSizePx || 12 }}>
            {settings.showAddress && <div>{company?.companyAddress || 'Eye clinic and optical service'}</div>}
            {settings.showPhone && <div>Ph : {company?.companyPhone || '09-44 2626 461 ~ 62 ~ 63'}</div>}
          </div>
        </div>

        <div className="my-4 border-t-2" style={lineStyle} />

        <div className="grid grid-cols-[1fr_255px] gap-6">
          <div className="space-y-2 font-bold">
            <PreviewLine label={settings.nameLabel || 'Name'} value={sample.customer} color={color} height={rowHeight} />
            <PreviewLine label={settings.frameLabel || 'Frame'} value={sample.frame} color={color} height={rowHeight} />
            <PreviewLine label={settings.lensLabel || 'Lenss'} value={sample.lens} color={color} height={rowHeight} />
            <PreviewLine label={settings.doctorLabel || 'Doctor'} value={sample.doctor} color={color} height={rowHeight} />
            <PreviewLine label={settings.measureDateLabel || 'Measure Date'} value={sample.measureDate} color={color} height={rowHeight} />
            <PreviewLine label={settings.measureTimeLabel || 'Measure Time'} value={sample.measureTime} color={color} height={rowHeight} />
          </div>
          <div>
            <PreviewLine label={settings.dateLabel || 'Date'} value={sample.date} color={color} height={rowHeight} compact />
            <table className="mt-3 w-full border-collapse font-bold" style={{ ...lineStyle, fontSize: tableSize }}>
              <tbody>
                {[
                  [settings.frameLabel || 'Frame', sample.framePrice],
                  [settings.lensLabel || 'Lenses', sample.lensPrice],
                  ['Total', sample.total],
                  ['Advance', sample.advance],
                  ['Balance', sample.balance]
                ].map(([label, value]) => (
                  <tr key={label} style={{ height: rowHeight }}>
                    <td className="border px-2" style={lineStyle}>{label}</td>
                    <td className="border px-2" style={{ ...lineStyle, fontSize: amountSize }}>{settings.currencyLabel || 'K.'} {value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-0 text-center font-black" style={{ fontSize: eyeTitleSize }}>
          <div>R.E</div>
          <div>L.E</div>
        </div>
        <table className="mt-3 w-full border-collapse text-center font-bold" style={{ ...lineStyle, fontSize: tableSize }}>
          <tbody>
            <tr style={{ height: rowHeight }}>
              <td className="border" style={lineStyle}></td>
              <td className="border" style={lineStyle}>SPH</td>
              <td className="border" style={lineStyle}>CYL</td>
              <td className="border" style={lineStyle}>AXIS</td>
              <td className="border" style={lineStyle}>SPH</td>
              <td className="border" style={lineStyle}>CYL</td>
              <td className="border" style={lineStyle}>AXIS</td>
            </tr>
            <tr style={{ height: rowHeight }}>
              <td className="border" style={lineStyle}>DIST</td>
              <td className="border" style={lineStyle}></td>
              <td className="border text-lg" style={lineStyle}>-1.00</td>
              <td className="border text-lg" style={lineStyle}>90'</td>
              <td className="border" style={lineStyle}></td>
              <td className="border text-lg" style={lineStyle}>-1.00</td>
              <td className="border text-lg" style={lineStyle}>90'</td>
            </tr>
            <tr style={{ height: rowHeight }}>
              <td className="border" style={lineStyle}>READ</td>
              <td className="border" style={lineStyle}></td>
              <td className="border" style={lineStyle}></td>
              <td className="border" style={lineStyle}></td>
              <td className="border" style={lineStyle}></td>
              <td className="border" style={lineStyle}></td>
              <td className="border" style={lineStyle}></td>
            </tr>
          </tbody>
        </table>

        <div className="my-5 border-t-2" style={lineStyle} />
        {settings.showFooterNotice && (
          <div className="grid grid-cols-[22px_1fr] gap-3 font-bold leading-6" style={{ fontSize: footerSize }}>
            <div className="mt-1 h-4 w-4 border-2" style={lineStyle}></div>
            <p>{settings.footerNotice || 'Please bring this voucher when collecting glasses.'}</p>
          </div>
        )}
        {settings.showSerial && <div className="mt-3 text-center font-black tracking-widest" style={{ fontSize: serialSize }}>{sample.serial}</div>}
      </div>
    </div>
  );
};

const PreviewLine: React.FC<{ label: string; value: string; color: string; height: number; compact?: boolean }> = ({ label, value, color, height, compact }) => (
  <div className={`grid items-end gap-3 ${compact ? 'grid-cols-[70px_1fr]' : 'grid-cols-[110px_1fr]'}`} style={{ minHeight: height }}>
    <span>{label}</span>
    <span className="border-b-2 border-dotted px-2 text-base" style={{ borderColor: color }}>{value}</span>
  </div>
);

export default VoucherPrintSettings;
