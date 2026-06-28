'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Course, Lesson } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { Plus, Edit2, Trash2, GripVertical, Loader2, X, Eye } from 'lucide-react';

const emptyForm = { lessonId: '', courseId: '', title: '', description: '', videoUrl: '', documentUrl: '', duration: '', sortOrder: 0, preview: false, memberOnly: true };

export default function AdminLessons() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    api.getCourses().then((d) => setCourses(d?.courses || [])).catch(console.error);
  }, []);

  const loadLessons = (courseId: string) => {
    setSelectedCourse(courseId);
    if (!courseId) { setLessons([]); return; }
    setLoading(true);
    api.getLessons(courseId)
      .then((d) => setLessons((d?.lessons || []).sort((a: Lesson, b: Lesson) => a.sortOrder - b.sortOrder)))
      .catch(console.error).finally(() => setLoading(false));
  };

  const openCreate = () => {
    setForm({ ...emptyForm, courseId: selectedCourse, sortOrder: lessons.length + 1 });
    setEditing(false); setModal(true);
  };
  const openEdit = (l: Lesson) => { setForm({ ...l }); setEditing(true); setModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = editing
        ? await api.updateLesson(form)
        : await api.createLesson({ ...form, createdAt: new Date().toISOString() });
      if (res.success) {
        showToast(editing ? 'แก้ไขบทเรียนสำเร็จ' : 'เพิ่มบทเรียนสำเร็จ');
        setModal(false);
        loadLessons(selectedCourse);
      } else showToast(res.message || 'เกิดข้อผิดพลาด', 'error');
    } catch { showToast('เกิดข้อผิดพลาด', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm('ยืนยันการลบ?')) return;
    const res = await api.deleteLesson(lessonId).catch(() => null);
    if (res?.success) { showToast('ลบสำเร็จ'); loadLessons(selectedCourse); }
    else showToast('ลบไม่สำเร็จ', 'error');
  };

  return (
    <div className="p-6 md:p-8">
      {ToastComponent}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">บทเรียน</h1>
          <p className="text-slate-400 mt-1">จัดการบทเรียนทั้งหมด</p>
        </div>
        {selectedCourse && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={18} /> เพิ่มบทเรียน
          </button>
        )}
      </div>

      {/* Select course */}
      <div className="glass-card p-4 mb-6">
        <label className="block text-slate-400 text-sm mb-2">เลือกคอร์ส</label>
        <select className="input-field max-w-md" value={selectedCourse} onChange={(e) => loadLessons(e.target.value)}>
          <option value="">-- เลือกคอร์ส --</option>
          {courses.map((c) => <option key={c.courseId} value={c.courseId}>{c.title}</option>)}
        </select>
      </div>

      {selectedCourse && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>ชื่อบทเรียน</th>
                  <th>ระยะเวลา</th>
                  <th>วิดีโอ</th>
                  <th>ตัวอย่าง</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10"><Loader2 size={24} className="animate-spin mx-auto text-slate-500" /></td></tr>
                ) : lessons.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-500">ยังไม่มีบทเรียน คลิก "เพิ่มบทเรียน" เพื่อเริ่มต้น</td></tr>
                ) : lessons.map((lesson) => (
                  <tr key={lesson.lessonId}>
                    <td>
                      <div className="flex items-center gap-2">
                        <GripVertical size={14} className="text-slate-600" />
                        <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">
                          {lesson.sortOrder}
                        </span>
                      </div>
                    </td>
                    <td>
                      <p className="text-white font-medium">{lesson.title}</p>
                      {lesson.description && <p className="text-slate-500 text-xs truncate max-w-xs">{lesson.description}</p>}
                    </td>
                    <td className="text-slate-400">{lesson.duration || '-'}</td>
                    <td>
                      {lesson.videoUrl ? (
                        <span className="badge badge-green">มี</span>
                      ) : (
                        <span className="badge badge-gray">ไม่มี</span>
                      )}
                    </td>
                    <td>
                      {lesson.preview ? (
                        <span className="badge badge-blue">ใช่</span>
                      ) : (
                        <span className="badge badge-gray">ไม่</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(lesson)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-blue-400">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(lesson.lessonId)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-red-400">
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
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">{editing ? 'แก้ไขบทเรียน' : 'เพิ่มบทเรียนใหม่'}</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="block text-slate-400 text-sm mb-1">ชื่อบทเรียน</label>
                <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><label className="block text-slate-400 text-sm mb-1">รายละเอียด</label>
                <textarea rows={2} className="input-field resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><label className="block text-slate-400 text-sm mb-1">URL วิดีโอ (YouTube / Google Drive / Vimeo / MP4)</label>
                <input className="input-field" placeholder="https://youtube.com/watch?v=..." value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} /></div>
              <div><label className="block text-slate-400 text-sm mb-1">URL เอกสาร / PDF</label>
                <input className="input-field" placeholder="https://drive.google.com/..." value={form.documentUrl} onChange={(e) => setForm({ ...form, documentUrl: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-slate-400 text-sm mb-1">ระยะเวลา</label>
                  <input className="input-field" placeholder="เช่น 15:30" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
                <div><label className="block text-slate-400 text-sm mb-1">ลำดับ</label>
                  <input type="number" min="1" className="input-field" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.preview} onChange={(e) => setForm({ ...form, preview: e.target.checked })} className="w-4 h-4 rounded" />
                  <span className="text-slate-300 text-sm">เปิดให้ดูตัวอย่าง</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.memberOnly} onChange={(e) => setForm({ ...form, memberOnly: e.target.checked })} className="w-4 h-4 rounded" />
                  <span className="text-slate-300 text-sm">เฉพาะสมาชิก</span>
                </label>
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
