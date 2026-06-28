'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Enrollment, Course, User } from '@/types';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { Search, Loader2, ClipboardList, Plus, X, Loader } from 'lucide-react';

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ userId: '', courseId: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([api.getEnrollments(), api.getCourses(), api.getStudents()])
      .then(([enrData, courseData, studentData]) => {
        const enrs = enrData?.enrollments || [];
        const courseMap = Object.fromEntries((courseData?.courses || []).map((c: Course) => [c.courseId, c]));
        const studentMap = Object.fromEntries((studentData?.students || []).map((s: User) => [s.userId, s]));
        const enriched = enrs.map((e: Enrollment) => ({
          ...e,
          courseName: courseMap[e.courseId]?.title || e.courseId,
          studentName: studentMap[e.userId]?.name || e.userId,
          studentEmail: studentMap[e.userId]?.email || '',
        }));
        setEnrollments(enriched);
        setFiltered(enriched);
        setCourses(courseData?.courses || []);
        setStudents(studentData?.students || []);
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (search) setFiltered(enrollments.filter((e) =>
      e.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      e.courseName?.toLowerCase().includes(search.toLowerCase())
    ));
    else setFiltered(enrollments);
  }, [search, enrollments]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.createEnrollment({ ...form, purchaseDate: new Date().toISOString() });
      if (res.success) { showToast('เพิ่มการลงทะเบียนสำเร็จ'); setModal(false); load(); }
      else showToast(res.message || 'เกิดข้อผิดพลาด', 'error');
    } catch { showToast('เกิดข้อผิดพลาด', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 md:p-8">
      {ToastComponent}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">การลงทะเบียน</h1>
          <p className="text-slate-400 mt-1">ดูและจัดการการลงทะเบียนทั้งหมด</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus size={18} /> เพิ่มการลงทะเบียน
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="ค้นหา..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>นักเรียน</th>
                <th>คอร์ส</th>
                <th>สถานะ</th>
                <th>วันที่ลงทะเบียน</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-10"><Loader2 size={24} className="animate-spin mx-auto text-slate-500" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-slate-500">ไม่พบข้อมูล</td></tr>
              ) : filtered.map((e, i) => (
                <tr key={e.enrollmentId || i}>
                  <td>
                    <div>
                      <p className="text-white font-medium">{e.studentName}</p>
                      <p className="text-slate-500 text-xs">{e.studentEmail}</p>
                    </div>
                  </td>
                  <td className="text-slate-300">{e.courseName}</td>
                  <td>
                    <span className={`badge ${e.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                      {e.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </span>
                  </td>
                  <td className="text-slate-500">{e.purchaseDate ? formatDate(e.purchaseDate) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">เพิ่มการลงทะเบียน</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">นักเรียน</label>
                <select className="input-field" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} required>
                  <option value="">-- เลือกนักเรียน --</option>
                  {students.filter((s) => s.role === 'student').map((s) => (
                    <option key={s.userId} value={s.userId}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">คอร์ส</label>
                <select className="input-field" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
                  <option value="">-- เลือกคอร์ส --</option>
                  {courses.map((c) => <option key={c.courseId} value={c.courseId}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">สถานะ</label>
                <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center py-3">ยกเลิก</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-3">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
