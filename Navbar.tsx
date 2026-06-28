import Link from 'next/link';
import { Course } from '@/types';
import { formatPrice, getLevelLabel } from '@/lib/utils';
import { BookOpen, Clock, Users, Star } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  enrolled?: boolean;
  progress?: number;
}

export default function CourseCard({ course, enrolled, progress }: CourseCardProps) {
  const levelColors: Record<string, string> = {
    beginner: 'badge-green',
    intermediate: 'badge-yellow',
    advanced: 'badge-red',
  };

  return (
    <div className="course-card group">
      {/* Cover */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-900/40 to-indigo-900/40">
        {course.cover ? (
          <img src={course.cover} alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={48} className="text-blue-500/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Price badge */}
        <div className="absolute top-3 right-3">
          {course.price === 0 ? (
            <span className="badge badge-green">ฟรี</span>
          ) : (
            <span className="badge badge-blue">{formatPrice(course.price)}</span>
          )}
        </div>

        {enrolled && (
          <div className="absolute top-3 left-3">
            <span className="badge badge-green">ลงทะเบียนแล้ว</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className={`badge ${levelColors[course.level] || 'badge-gray'} text-xs`}>
            {getLevelLabel(course.level)}
          </span>
          {course.category && (
            <span className="badge badge-gray text-xs">{course.category}</span>
          )}
        </div>

        <h3 className="text-white font-semibold text-base mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {course.title}
        </h3>

        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>

        {/* Progress bar if enrolled */}
        {enrolled && progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>ความคืบหน้า</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-slate-500 text-xs mb-4">
          <span className="flex items-center gap-1">
            <BookOpen size={12} />
            {course.lessonCount || 0} บทเรียน
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {course.instructor}
          </span>
          <span className="flex items-center gap-1">
            <Star size={12} className="text-yellow-400" fill="currentColor" />
            4.8
          </span>
        </div>

        {/* CTA */}
        <Link
          href={enrolled ? `/learn/${course.courseId}` : `/courses/${course.courseId}`}
          className="btn-primary w-full justify-center text-sm py-2.5">
          {enrolled ? 'เรียนต่อ' : 'ดูรายละเอียด'}
        </Link>
      </div>
    </div>
  );
}
