'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/ui/StatCard';
import { SkeletonStats } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { BookOpen, Users, FileVideo, LogIn, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">แดชบอร์ด</h1>
        <p className="text-slate-400 mt-1">ภาพรวมระบบทั้งหมด</p>
      </div>

      {loading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <StatCard label="คอร์สทั้งหมด" value={stats?.totalCourses || 0} icon={<BookOpen size={22} />} color="blue" />
          <StatCard label="นักเรียน" value={stats?.totalStudents || 0} icon={<Users size={22} />} color="purple" />
          <StatCard label="บทเรียน" value={stats?.totalLessons || 0} icon={<FileVideo size={22} />} color="orange" />
          <StatCard label="Login วันนี้" value={stats?.todayLogins || 0} icon={<LogIn size={22} />} color="green" />
          <StatCard label="รายได้รวม" value={formatPrice(stats?.totalRevenue || 0)} icon={<DollarSign size={22} />} color="pink" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <Users size={18} className="text-blue-400" />
            <h2 className="text-white font-semibold">สมาชิกล่าสุด</h2>
          </div>
          <div className="divide-y divide-white/5">
            {stats?.recentStudents?.length > 0 ? stats.recentStudents.map((student: any) => (
              <div key={student.userId} className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {student.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{student.name}</p>
                  <p className="text-slate-500 text-xs truncate">{student.email}</p>
                </div>
                <span className="text-slate-500 text-xs">{formatDate(student.createdAt)}</span>
              </div>
            )) : (
              <div className="p-6 text-center text-slate-500 text-sm">ยังไม่มีสมาชิก</div>
            )}
          </div>
        </div>

        {/* Latest Courses */}
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <BookOpen size={18} className="text-purple-400" />
            <h2 className="text-white font-semibold">คอร์สล่าสุด</h2>
          </div>
          <div className="divide-y divide-white/5">
            {stats?.latestCourses?.length > 0 ? stats.latestCourses.map((course: any) => (
              <div key={course.courseId} className="flex items-center gap-3 p-4">
                {course.cover ? (
                  <img src={course.cover} alt={course.title} className="w-12 h-9 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={14} className="text-blue-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{course.title}</p>
                  <p className="text-slate-500 text-xs">{course.instructor}</p>
                </div>
                <span className={`badge ${course.status === 'published' ? 'badge-green' : 'badge-gray'} text-xs`}>
                  {course.status === 'published' ? 'เผยแพร่' : 'ซ่อน'}
                </span>
              </div>
            )) : (
              <div className="p-6 text-center text-slate-500 text-sm">ยังไม่มีคอร์ส</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
