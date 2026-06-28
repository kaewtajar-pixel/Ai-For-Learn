'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Save, Loader2, Settings, Globe, Phone, FileText } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'AI For Learn Everyday',
    logo: '',
    theme: 'dark',
    contact: '',
    footer: '© 2024 AI For Learn Everyday. สงวนลิขสิทธิ์ทุกประการ',
    lineId: '',
    facebook: '',
    promptPayNumber: '',
    promptPayName: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    api.getSettings()
      .then((d) => { if (d?.settings) setSettings((prev) => ({ ...prev, ...d.settings })); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateSettings(settings);
      if (res.success) showToast('บันทึกการตั้งค่าสำเร็จ');
      else showToast(res.message || 'เกิดข้อผิดพลาด', 'error');
    } catch { showToast('เกิดข้อผิดพลาด', 'error'); }
    finally { setSaving(false); }
  };

  const Field = ({ label, name, type = 'text', placeholder = '' }: any) => (
    <div>
      <label className="block text-slate-400 text-sm mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea rows={3} className="input-field resize-none" placeholder={placeholder}
          value={(settings as any)[name] || ''}
          onChange={(e) => setSettings({ ...settings, [name]: e.target.value })} />
      ) : (
        <input type={type} className="input-field" placeholder={placeholder}
          value={(settings as any)[name] || ''}
          onChange={(e) => setSettings({ ...settings, [name]: e.target.value })} />
      )}
    </div>
  );

  return (
    <div className="p-6 md:p-8">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">ตั้งค่าระบบ</h1>
        <p className="text-slate-400 mt-1">ปรับแต่งการตั้งค่าของแพลตฟอร์ม</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {/* General */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe size={18} className="text-blue-400" />
            <h2 className="text-white font-semibold">ทั่วไป</h2>
          </div>
          <div className="space-y-4">
            <Field label="ชื่อเว็บไซต์" name="siteName" placeholder="AI For Learn Everyday" />
            <Field label="URL โลโก้" name="logo" placeholder="https://..." />
            <Field label="ข้อความ Footer" name="footer" type="textarea" />
          </div>
        </div>

        {/* Contact */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Phone size={18} className="text-emerald-400" />
            <h2 className="text-white font-semibold">ช่องทางติดต่อ</h2>
          </div>
          <div className="space-y-4">
            <Field label="เบอร์โทร / อีเมลติดต่อ" name="contact" placeholder="contact@example.com" />
            <Field label="Line ID" name="lineId" placeholder="@aiforlearn" />
            <Field label="Facebook" name="facebook" placeholder="https://facebook.com/..." />
          </div>
        </div>

        {/* Payment */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <FileText size={18} className="text-purple-400" />
            <h2 className="text-white font-semibold">PromptPay</h2>
          </div>
          <div className="space-y-4">
            <Field label="เบอร์ PromptPay / เลขบัตรประชาชน" name="promptPayNumber" placeholder="0xx-xxx-xxxx" />
            <Field label="ชื่อบัญชี" name="promptPayName" placeholder="ชื่อ นามสกุล" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary py-3 px-8">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
      </form>
    </div>
  );
}
