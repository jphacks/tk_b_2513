'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SearchResult {
  id: string;
  imageUrl: string;
  title: string;
  prompt: string;
  similarity: number;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

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

    // TODO: 画像生成APIを実装
    console.log('新規生成:', searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDownload = (result: SearchResult) => {
    console.log('ダウンロード:', result.id);
  };

  const handleCopy = (result: SearchResult) => {
    console.log('コピー:', result.id);
  };

  const handleLike = (result: SearchResult) => {
    console.log('いいね:', result.id);
  };

  const handleDislike = (result: SearchResult) => {
    console.log('良くない:', result.id);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 左側サイドバー */}
      <aside className="w-[420px] bg-black text-white flex flex-col">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-12">くりかえしピック</h1>

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
                disabled={isSearching}
              />

              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={!searchQuery.trim()}
                  className="px-6 py-3 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed border-2 border-green-500 text-green-600 font-medium rounded-full transition-colors"
                >
                  新規生成
                </button>

                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
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
          {isSearching && (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-8 border-gray-200"></div>
                <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-8 border-t-green-500 border-r-green-400 animate-spin"></div>
              </div>
            </div>
          )}

          {/* 検索結果 */}
          {!isSearching && searchResults.length > 0 && (
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
                        alt={result.title}
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
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                          {result.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                          {result.prompt}
                        </p>
                      </div>

                      {/* アクションボタン */}
                      <div className="flex items-center gap-3 mt-6">
                        <button
                          onClick={() => handleCopy(result)}
                          className="w-10 h-10 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                          title="コピー"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M4 13H3C2.44772 13 2 12.5523 2 12V4C2 3.44772 2.44772 3 3 3H11C11.5523 3 12 3.44772 12 4V5" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleLike(result)}
                          className="w-10 h-10 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                          title="いいね"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M2 10H6L8 2L12 18L14 10H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDislike(result)}
                          className="w-10 h-10 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                          title="良くない"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M18 10H14L12 18L8 2L6 10H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
          {!isSearching && searchResults.length === 0 && searchQuery && (
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
          {!searchQuery && !isSearching && searchResults.length === 0 && (
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
    </div>
  );
}
