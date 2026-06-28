'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Payment, Course, User } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { Search, Loader2, CheckCircle, XCircle, Clock, Eye, X } from 'lucide-react';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewSlip, setViewSlip] = useState<string | null>(null);
  const { showToast, ToastComponent } = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([api.getPayments(), api.getCourses(), api.getStudents()])
      .then(([payData, courseData, studentData]) => {
        const pays = payData?.payments || [];
        const courseMap = Object.fromEntries((courseData?.courses || []).map((c: Course) => [c.courseId, c]));
        const studentMap = Object.fromEntries((studentData?.students || []).map((s: User) => [s.userId, s]));
        const enriched = pays.map((p: Payment) => ({
          ...p,
          courseName: courseMap[p.courseId]?.title || p.courseId,
          studentName: studentMap[p.userId]?.name || p.userId,
          studentEmail: studentMap[p.userId]?.email || '',
        }));
        setPayments(enriched);
        setFiltered(enriched);
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = payments;
    if (statusFilter !== 'all') result = result.filter((p) => p.status === statusFilter);
    if (search) result = result.filter((p) =>
      p.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      p.courseName?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, statusFilter, payments]);

  const updateStatus = async (payment: any, status: string) => {
    const res = await api.updatePayment({ ...payment, status }).catch(() => null);
    if (res?.success) {
      showToast(`${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}การชำระเงินสำเร็จ`);
      // If approved, create enrollment automatically
      if (status === 'approved') {
        await api.createEnrollment({
          userId: payment.userId,
          courseId: payment.courseId,
          status: 'active',
          purchaseDate: new Date().toISOString(),
        }).catch(console.error);
      }
      load();
    } else showToast('เกิดข้อผิดพลาด', 'error');
  };

  const pending = payments.filter((p) => p.status === 'pending').length;
  const approved = payments.filter((p) => p.status === 'approved').length;
  const totalRevenue = payments.filter((p) => p.status === 'approved').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="p-6 md:p-8">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">การชำระเงิน</h1>
        <p className="text-slate-400 mt-1">ตรวจสอบและอนุมัติการชำระเงิน</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5">
          <Clock size={20} className="text-yellow-400 mb-2" />
          <div className="text-2xl font-bold text-white">{pending}</div>
          <div className="text-slate-400 text-sm">รอตรวจสอบ</div>
        </div>
        <div className="glass-card p-5">
          <CheckCircle size={20} className="text-green-400 mb-2" />
          <div className="text-2xl font-bold text-white">{approved}</div>
          <div className="text-slate-400 text-sm">อนุมัติแล้ว</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-green-400 font-bold text-sm mb-2">฿</div>
          <div className="text-2xl font-bold text-white">{formatPrice(totalRevenue)}</div>
          <div className="text-slate-400 text-sm">รายได้รวม</div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-wrap gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="ค้นหา..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((s) => (
              <button key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === s ? 'btn-primary py-2' : 'btn-secondary py-2'
                }`}>
                {s === 'all' ? 'ทั้งหมด' : s === 'pending' ? 'รอตรวจ' : s === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>นักเรียน</th>
                <th>คอร์ส</th>
                <th>จำนวนเงิน</th>
                <th>สลิป</th>
                <th>สถานะ</th>
                <th>วันที่</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10"><Loader2 size={24} className="animate-spin mx-auto text-slate-500" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-500">ไม่พบข้อมูล</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={p.paymentId || i}>
                  <td>
                    <div>
                      <p className="text-white font-medium">{p.studentName}</p>
                      <p className="text-slate-500 text-xs">{p.studentEmail}</p>
                    </div>
                  </td>
                  <td className="text-slate-300 max-w-xs truncate">{p.courseName}</td>
                  <td className="text-emerald-400 font-medium">{formatPrice(p.amount)}</td>
                  <td>
                    {p.slipImage ? (
                      <button onClick={() => setViewSlip(p.slipImage)}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm">
                        <Eye size={14} /> ดูสลิป
                      </button>
                    ) : <span className="text-slate-600">-</span>}
                  </td>
                  <td>
                    <span className={`badge ${p.status === 'approved' ? 'badge-green' : p.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>
                      {p.status === 'approved' ? 'อนุมัติ' : p.status === 'rejected' ? 'ปฏิเสธ' : 'รอตรวจสอบ'}
                    </span>
                  </td>
                  <td className="text-slate-500">{p.createdAt ? formatDate(p.createdAt) : '-'}</td>
                  <td>
                    {p.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateStatus(p, 'approved')}
                          className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400" title="อนุมัติ">
                          <CheckCircle size={16} />
                        </button>
                        <button onClick={() => updateStatus(p, 'rejected')}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400" title="ปฏิเสธ">
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip viewer modal */}
      {viewSlip && (
        <div className="modal-overlay" onClick={() => setViewSlip(null)}>
          <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">สลิปการโอนเงิน</h3>
              <button onClick={() => setViewSlip(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <img src={viewSlip} alt="slip" className="w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
