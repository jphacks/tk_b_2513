'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, Heart, Download, Eye } from 'lucide-react';

type GalleryItem = {
  id: string;
  imageUrl: string;
  prompt?: string;
  likes?: number;
  views?: number;
  createdAt?: string;
};

export default function MyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'works' | 'likes'>('works');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchMyImages = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/my-images', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          setItems((data?.items as GalleryItem[]) ?? []);
        } else {
          // フォールバック（ダミーデータ）
          setItems(sampleItems);
        }
      } catch {
        setItems(sampleItems);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyImages();
  }, []);

  const stats = useMemo(() => {
    const totalWorks = items.length;
    const totalLikes = items.reduce((s, v) => s + (v.likes ?? 0), 0);
    const totalViews = items.reduce((s, v) => s + (v.views ?? 0), 0);
    return { totalWorks, totalLikes, totalViews };
  }, [items]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 opacity-30 blur-xl animate-pulse" />
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 border-r-emerald-400 animate-spin" />
              <div className="absolute inset-3 rounded-full bg-white dark:bg-gray-900" />
            </div>
          </div>
          <div className="mt-6 text-gray-600 dark:text-gray-300 text-sm font-medium">
            認証状態を確認中
            <span className="inline-flex w-8 justify-start ml-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce [animation-delay:150ms]">.</span>
              <span className="animate-bounce [animation-delay:300ms]">.</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* プロフィールヘッダー */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{user?.email?.split('@')[0] ?? 'ユーザー'}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">公開プロフィール</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="作品" value={stats.totalWorks} />
            <Stat label="いいね" value={stats.totalLikes} />
            <Stat label="閲覧" value={stats.totalViews} />
          </div>
        </div>

        {/* タブ */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 mb-8">
          <TabButton active={activeTab === 'works'} onClick={() => setActiveTab('works')}>作品</TabButton>
          <TabButton active={activeTab === 'likes'} onClick={() => setActiveTab('likes')}>いいね</TabButton>
        </div>

        {/* ギャラリー */}
        {isLoading ? (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">読み込み中...</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">まだ作品がありません</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800 text-left"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.prompt ?? 'generated image'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3 text-white/90">
                    <span className="inline-flex items-center gap-1 text-xs"><Heart className="h-3 w-3" />{item.likes ?? 0}</span>
                    <span className="inline-flex items-center gap-1 text-xs"><Eye className="h-3 w-3" />{item.views ?? 0}</span>
                  </div>
                  <span className="text-xs text-white/90 line-clamp-1">{item.prompt}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* モーダル */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-[min(92vw,1100px)] max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="min-w-0 pr-4">
                <p className="text-gray-800 dark:text-gray-200 text-sm line-clamp-2">{selected.prompt}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleDownload(selected)}
                  title="ダウンロード"
                >
                  <Download className="h-4 w-4 mr-1" />ダウンロード
                </Button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setSelected(null)}>閉じる</Button>
              </div>
            </div>
            <div className="relative w-full aspect-[16/10] bg-gray-100 dark:bg-gray-800">
              <Image src={selected.imageUrl} alt={selected.prompt ?? ''} fill className="object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 px-6 py-4 text-center">
      <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? 'text-gray-900 dark:text-white'
          : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
      }`}
    >
      {children}
      {active && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-500" />}
    </button>
  );
}

async function handleDownload(item: GalleryItem) {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const fileName = `image-${timestamp}.png`;
    const downloadUrl = `/api/download?url=${encodeURIComponent(item.imageUrl)}&filename=${encodeURIComponent(fileName)}`;
    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error('ダウンロードに失敗しました');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (e) {
    console.error(e);
    alert('ダウンロードに失敗しました');
  }
}

const sampleItems: GalleryItem[] = [
  {
    id: '1',
    imageUrl: 'https://picsum.photos/id/1015/800/800',
    prompt: 'mountain landscape at sunrise, ultra-detailed, 8k',
    likes: 24,
    views: 310,
  },
  {
    id: '2',
    imageUrl: 'https://picsum.photos/id/1025/800/800',
    prompt: 'portrait, soft light, kodak portra 400',
    likes: 12,
    views: 210,
  },
  {
    id: '3',
    imageUrl: 'https://picsum.photos/id/1035/800/800',
    prompt: 'cyberpunk city at night, neon rain, blade runner vibes',
    likes: 42,
    views: 1200,
  },
  {
    id: '4',
    imageUrl: 'https://picsum.photos/id/1042/800/800',
    prompt: 'fantasy forest, bioluminescent plants, magical atmosphere',
    likes: 16,
    views: 480,
  },
  {
    id: '5',
    imageUrl: 'https://picsum.photos/id/1050/800/800',
    prompt: 'steampunk airship over victorian city, dramatic lighting',
    likes: 35,
    views: 820,
  },
  {
    id: '6',
    imageUrl: 'https://picsum.photos/id/1069/800/800',
    prompt: 'underwater coral reef, rich colors, cinematic',
    likes: 8,
    views: 190,
  },
];


