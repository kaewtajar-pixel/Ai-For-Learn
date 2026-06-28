'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { saveUser, saveToken } from '@/lib/auth';
import { BookMarked, Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    if (form.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    setLoading(true);
    try {
      const res = await api.register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      if (res.success && res.user) {
        saveUser(res.user);
        saveToken(res.token || 'authenticated');
        router.push('/dashboard');
      } else {
        setError(res.message || 'เกิดข้อผิดพลาดในการสมัคร');
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-10">
      <div className="absolute top-20 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <BookMarked size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AI For Learn</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">สมัครสมาชิก</h1>
          <p className="text-slate-400 mt-1">เริ่มต้นการเรียนรู้ AI วันนี้ ฟรี!</p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">ชื่อ-นามสกุล</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" placeholder="ชื่อของคุณ" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">อีเมล</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" placeholder="your@email.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">เบอร์โทร (ไม่บังคับ)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="tel" placeholder="08x-xxx-xxxx" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">รหัสผ่าน</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPass ? 'text' : 'password'} placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">ยืนยันรหัสผ่าน</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="password" placeholder="••••••••" value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="input-field pl-10" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div className="mt-6 text-center text-slate-400 text-sm">
            มีบัญชีแล้ว?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">เข้าสู่ระบบ</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
