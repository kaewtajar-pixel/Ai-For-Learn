'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Course } from '@/types';
import { formatPrice, getLevelLabel, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, Loader2, BookOpen, X } from 'lucide-react';

const emptyForm = { courseId: '', title: '', description: '', cover: '', price: 0, category: '', instructor: '', level: 'beginner', status: 'published' };

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const load = () => {
    setLoading(true);
    api.getCourses().then((d) => {
      setCourses(d?.courses || []);
      setFiltered(d?.courses || []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (search) setFiltered(courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase())));
    else setFiltered(courses);
  }, [search, courses]);

  const openCreate = () => { setForm(emptyForm); setEditing(false); setModal(true); };
  const openEdit = (course: Course) => { setForm({ ...course }); setEditing(true); setModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let res;
      if (editing) {
        res = await api.updateCourse(form);
      } else {
        res = await api.createCourse({ ...form, createdAt: new Date().toISOString() });
      }
      if (res.success) {
        showToast(editing ? 'แก้ไขคอร์สสำเร็จ' : 'เพิ่มคอร์สสำเร็จ');
        setModal(false);
        load();
      } else showToast(res.message || 'เกิดข้อผิดพลาด', 'error');
    } catch { showToast('เกิดข้อผิดพลาด', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('ยืนยันการลบคอร์สนี้?')) return;
    const res = await api.deleteCourse(courseId).catch(() => null);
    if (res?.success) { showToast('ลบคอร์สสำเร็จ'); load(); }
    else showToast('ไม่สามารถลบได้', 'error');
  };

  const toggleStatus = async (course: Course) => {
    const res = await api.updateCourse({ ...course, status: course.status === 'published' ? 'hidden' : 'published' }).catch(() => null);
    if (res?.success) { showToast('อัพเดทสถานะสำเร็จ'); load(); }
  };

  return (
    <div className="p-6 md:p-8">
      {ToastComponent}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">คอร์สเรียน</h1>
          <p className="text-slate-400 mt-1">จัดการคอร์สทั้งหมด</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={18} /> เพิ่มคอร์ส
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="ค้นหาคอร์ส..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>คอร์ส</th>
                <th>หมวดหมู่</th>
                <th>ระดับ</th>
                <th>ราคา</th>
                <th>สถานะ</th>
                <th>วันที่</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-500">
                  <Loader2 size={24} className="animate-spin mx-auto" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-500">ยังไม่มีคอร์ส</td></tr>
              ) : filtered.map((course) => (
                <tr key={course.courseId}>
                  <td>
                    <div className="flex items-center gap-3">
                      {course.cover ? (
                        <img src={course.cover} alt={course.title} className="w-12 h-8 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <BookOpen size={12} className="text-blue-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium text-sm">{course.title}</p>
                        <p className="text-slate-500 text-xs">{course.instructor}</p>
                      </div>
                    </div>
                  </td>
                  <td>{course.category}</td>
                  <td>{getLevelLabel(course.level)}</td>
                  <td>{course.price === 0 ? 'ฟรี' : formatPrice(course.price)}</td>
                  <td>
                    <span className={`badge ${course.status === 'published' ? 'badge-green' : 'badge-gray'}`}>
                      {course.status === 'published' ? 'เผยแพร่' : 'ซ่อน'}
                    </span>
                  </td>
                  <td className="text-slate-500">{formatDate(course.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleStatus(course)} title="เปลี่ยนสถานะ"
                        className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white">
                        {course.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => openEdit(course)} title="แก้ไข"
                        className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-blue-400">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(course.courseId)} title="ลบ"
                        className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-red-400">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">{editing ? 'แก้ไขคอร์ส' : 'เพิ่มคอร์สใหม่'}</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="block text-slate-400 text-sm mb-1">ชื่อคอร์ส</label>
                <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><label className="block text-slate-400 text-sm mb-1">รายละเอียด</label>
                <textarea rows={3} className="input-field resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-slate-400 text-sm mb-1">ราคา (บาท)</label>
                  <input type="number" min="0" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
                <div><label className="block text-slate-400 text-sm mb-1">หมวดหมู่</label>
                  <input className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-slate-400 text-sm mb-1">ผู้สอน</label>
                  <input className="input-field" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} /></div>
                <div><label className="block text-slate-400 text-sm mb-1">ระดับ</label>
                  <select className="input-field" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                    <option value="beginner">เริ่มต้น</option>
                    <option value="intermediate">ปานกลาง</option>
                    <option value="advanced">ขั้นสูง</option>
                  </select></div>
              </div>
              <div><label className="block text-slate-400 text-sm mb-1">URL รูปปก</label>
                <input className="input-field" placeholder="https://..." value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} /></div>
              <div><label className="block text-slate-400 text-sm mb-1">สถานะ</label>
                <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="published">เผยแพร่</option>
                  <option value="hidden">ซ่อน</option>
                </select></div>
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
