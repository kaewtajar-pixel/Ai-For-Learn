'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { getUser } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin') { router.push('/dashboard'); return; }
  }, []);

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
