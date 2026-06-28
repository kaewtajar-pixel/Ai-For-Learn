'use client';

import { getVideoEmbedUrl } from '@/lib/utils';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export default function VideoPlayer({ url, title }: VideoPlayerProps) {
  const embedUrl = getVideoEmbedUrl(url);

  if (!url) {
    return (
      <div className="w-full aspect-video bg-dark-card rounded-xl flex items-center justify-center border border-white/10">
        <div className="text-center text-slate-500">
          <Play size={48} className="mx-auto mb-2 opacity-30" />
          <p>ยังไม่มีวิดีโอ</p>
        </div>
      </div>
    );
  }

  // Check if it's an MP4 direct link
  const isMP4 = url.endsWith('.mp4') || url.includes('.mp4?');

  if (isMP4) {
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
        <video controls className="w-full h-full" title={title}>
          <source src={url} type="video/mp4" />
          เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
        </video>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
