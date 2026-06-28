export interface User {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'student';
  password?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Course {
  courseId: string;
  title: string;
  description: string;
  cover: string;
  price: number;
  category: string;
  instructor: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'published' | 'hidden';
  createdAt: string;
  lessonCount?: number;
}

export interface Lesson {
  lessonId: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  documentUrl: string;
  duration: string;
  sortOrder: number;
  preview: boolean;
  memberOnly: boolean;
  createdAt: string;
}

export interface Enrollment {
  enrollmentId: string;
  userId: string;
  courseId: string;
  status: 'active' | 'inactive';
  purchaseDate: string;
}

export interface Progress {
  progressId: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedDate: string;
}

export interface Payment {
  paymentId: string;
  userId: string;
  courseId: string;
  amount: number;
  slipImage: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalLessons: number;
  todayLogins: number;
  totalRevenue: number;
  recentStudents: User[];
  latestCourses: Course[];
}
