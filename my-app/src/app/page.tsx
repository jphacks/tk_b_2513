'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GenerationDialog } from '@/components/ui/generation-dialog';
import { Toaster } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import type { ImageMeta } from '@/app/api';

interface SearchResult {
  id: string;
  imageUrl: string;
  prompt: string;
  similarity: number;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<ImageMeta | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast, toasts, dismiss } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error('検索エラー:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerate = async () => {
    if (!searchQuery.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: searchQuery }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('画像の生成に成功しました。:', data.imageUrl);
        
        const imageId = Date.now().toString();
        const newResult: SearchResult = {
          id: imageId,
          imageUrl: data.imageUrl,
          prompt: searchQuery,
          similarity: 1.0, 
        };
        setSearchResults(prev => [newResult, ...prev]);
        
        // モーダルを表示
        setGeneratedImage({
          id: imageId,
          url: data.imageUrl,
          prompt: searchQuery,
        });
        setIsDialogOpen(true);
      } else {
        const errorData = await response.json();
        console.error('画像生成エラー:', errorData.error);
        alert('画像の生成に失敗しました: ' + errorData.error);
      }
    } catch (error) {
      console.error('画像生成エラー:', error);
      alert('画像生成中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDownload = (result: SearchResult) => {
    console.log('ダウンロード:', result.id);
  };

  const handleCopy = async (result: SearchResult) => {
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopiedId(result.id);
      console.log('コピーしました:', result.prompt);

      // 2秒後にチェックマークを元に戻す
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error('コピーエラー:', error);
    }
  };

  const handleLike = (result: SearchResult) => {
    console.log('いいね:', result.id);
  };

  const handleDislike = (result: SearchResult) => {
    console.log('良くない:', result.id);
  };

  const handleContribute = () => {
    toast({
      title: "完了しました。",
      description: "画像が共有データベースに追加されました",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 左側サイドバー */}
      <aside className="w-[420px] bg-black text-white flex flex-col">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-12">RePic</h1>

          <div className="space-y-6">
            <h2 className="text-lg font-medium">画像を検索</h2>

            <div className="bg-white rounded-2xl p-6 space-y-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="🔍 キーワードを入力"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                disabled={isSearching || isGenerating}
              />

              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={!searchQuery.trim() || isGenerating}
                  className="px-6 py-3 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed border-2 border-green-500 text-green-600 font-medium rounded-full transition-colors"
                >
                  {isGenerating ? '生成中...' : '新規生成'}
                </button>

                <button
                  onClick={handleSearch}
                  disabled={isSearching || isGenerating || !searchQuery.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors"
                >
                  {isSearching ? (
                    <>検索中...</>
                  ) : (
                    <>
                      検索
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-[-45deg]">
                        <path d="M8 3L8 13M8 3L12 7M8 3L4 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 右側コンテンツエリア */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* ローディングインジケーター */}
          {(isSearching || isGenerating) && (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-8 border-gray-200"></div>
                <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-8 border-t-green-500 border-r-green-400 animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                {isGenerating ? '画像を生成中...' : '検索中...'}
              </p>
            </div>
          )}

          {/* 検索結果 */}
          {!isSearching && !isGenerating && searchResults.length > 0 && (
            <div className="space-y-6">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    {/* 画像 */}
                    <div className="relative w-full md:w-[320px] h-[320px] bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden flex-shrink-0">
                      <Image
                        src={result.imageUrl}
                        alt="検索結果の画像"
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => handleDownload(result)}
                        className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 3V13M10 13L6 9M10 13L14 9M3 17H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>

                    {/* テキスト情報 */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {result.prompt}
                        </p>
                      </div>

                      {/* アクションボタン */}
                      <div className="flex items-center gap-3 mt-6">
                        <button
                          onClick={() => handleCopy(result)}
                          className={`w-10 h-10 border rounded-lg flex items-center justify-center transition-all ${
                            copiedId === result.id
                              ? 'border-green-500 bg-green-50 text-green-600 dark:bg-green-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          title={copiedId === result.id ? 'コピーしました！' : 'プロンプトをコピー'}
                        >
                          {copiedId === result.id ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                              <path d="M4 10L8 14L16 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                              <rect x="7" y="7" width="10" height="10" rx="2" strokeWidth="2"/>
                              <path d="M4 13H3C2.44772 13 2 12.5523 2 12V4C2 3.44772 2.44772 3 3 3H11C11.5523 3 12 3.44772 12 4V5" strokeWidth="2"/>
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleLike(result)}
                          className="w-10 h-10 border border-gray-300 dark:border-gray-600 hover:bg-green-50 hover:border-green-500 hover:text-green-600 dark:hover:bg-green-900/20 rounded-lg flex items-center justify-center transition-colors"
                          title="いいね"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M7 22V11M2 13V20C2 21.1046 2.89543 22 4 22H17.4262C18.907 22 20.1662 20.9197 20.3914 19.4562L21.4683 12.4562C21.7479 10.6389 20.3418 9 18.5032 9H15V4C15 2.89543 14.1046 2 13 2C12.4477 2 12 2.44772 12 3V3.93551C12 4.3046 11.8935 4.66455 11.6935 4.97292L8.30647 9.97292C8.10445 10.2846 8 10.6493 8 11.0227V21C8 21.5523 7.55228 22 7 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDislike(result)}
                          className="w-10 h-10 border border-gray-300 dark:border-gray-600 hover:bg-red-50 hover:border-red-500 hover:text-red-600 dark:hover:bg-red-900/20 rounded-lg flex items-center justify-center transition-colors"
                          title="良くない"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M17 2V13M22 11V4C22 2.89543 21.1046 2 20 2H6.57377C5.09301 2 3.83384 3.08027 3.60864 4.54382L2.53168 11.5438C2.25207 13.3611 3.65815 15 5.49677 15H9V20C9 21.1046 9.89543 22 11 22C11.5523 22 12 21.5523 12 21V20.0645C12 19.6954 12.1065 19.3354 12.3065 19.0271L15.6935 14.0271C15.8955 13.7154 16 13.3507 16 12.9773V3C16 2.44772 16.4477 2 17 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 検索結果なし */}
          {!isSearching && !isGenerating && searchResults.length === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-gray-400 mb-4">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                検索結果が見つかりませんでした
              </p>
            </div>
          )}

          {/* 初期状態 */}
          {!searchQuery && !isSearching && !isGenerating && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-gray-300 mb-6">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-gray-400 text-lg">
                キーワードを入力して検索を開始してください
              </p>
            </div>
          )}
        </div>
      </main>

      <GenerationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        image={generatedImage}
      />

      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
