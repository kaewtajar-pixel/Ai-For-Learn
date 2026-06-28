'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { Search, Loader2, Users, Mail, Phone, Shield, UserCheck } from 'lucide-react';

export default function AdminMembers() {
  const [members, setMembers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    api.getStudents()
      .then((d) => { setMembers(d?.students || []); setFiltered(d?.students || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (search) setFiltered(members.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    ));
    else setFiltered(members);
  }, [search, members]);

  const totalActive = members.filter((m) => m.status === 'active').length;
  const totalAdmins = members.filter((m) => m.role === 'admin').length;

  return (
    <div className="p-6 md:p-8">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">สมาชิก</h1>
        <p className="text-slate-400 mt-1">จัดการสมาชิกทั้งหมด</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'สมาชิกทั้งหมด', value: members.length, icon: <Users size={20} className="text-blue-400" /> },
          { label: 'ใช้งานอยู่', value: totalActive, icon: <UserCheck size={20} className="text-green-400" /> },
          { label: 'แอดมิน', value: totalAdmins, icon: <Shield size={20} className="text-purple-400" /> },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5">
            <div className="mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-slate-400 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="ค้นหาสมาชิก..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>สมาชิก</th>
                <th>อีเมล</th>
                <th>เบอร์โทร</th>
                <th>บทบาท</th>
                <th>สถานะ</th>
                <th>สมัครวันที่</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10"><Loader2 size={24} className="animate-spin mx-auto text-slate-500" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-500">ไม่พบสมาชิก</td></tr>
              ) : filtered.map((member) => (
                <tr key={member.userId}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Mail size={13} />{member.email}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Phone size={13} />{member.phone || '-'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${member.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}
                      style={member.role === 'admin' ? { background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' } : {}}>
                      {member.role === 'admin' ? 'แอดมิน' : 'นักเรียน'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${member.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                      {member.status === 'active' ? 'ใช้งาน' : 'ระงับ'}
                    </span>
                  </td>
                  <td className="text-slate-500">{formatDate(member.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
