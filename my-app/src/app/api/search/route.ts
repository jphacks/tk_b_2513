import { NextRequest, NextResponse } from 'next/server';

// 仮の画像データ（実際のデータベースからの取得をシミュレート）
const mockResults = [
  {
    id: '1',
    imageUrl: 'https://picsum.photos/seed/tokyo1/400/400',
    title: '近未来的な東京都',
    prompt: 'プロンプトプロンプトプロンプト\nプロンプトプロンプトプロンプト\nプロンプトプロンプトプロンプト\nプロンプトプロンプトプロンプト\nプロンプトプロンプトプロンプト\nプロンプトプロンプト',
    similarity: 0.95,
  },
  {
    id: '2',
    imageUrl: 'https://picsum.photos/seed/tokyo2/400/400',
    title: 'サイバーパンク風の街並み',
    prompt: 'ネオンが輝く未来都市、高層ビルが立ち並び、\n空中には飛行車が行き交う。\n雨に濡れた路面が光を反射している。',
    similarity: 0.88,
  },
  {
    id: '3',
    imageUrl: 'https://picsum.photos/seed/tokyo3/400/400',
    title: '夜の東京タワー',
    prompt: '東京タワーがライトアップされた夜景。\n周囲の高層ビル群も美しく輝いている。\n星空も少し見える幻想的な雰囲気。',
    similarity: 0.82,
  },
  {
    id: '4',
    imageUrl: 'https://picsum.photos/seed/nature1/400/400',
    title: '富士山の風景',
    prompt: '雄大な富士山が朝日に照らされている。\n手前には湖があり、逆さ富士が映っている。\n周囲には桜の木も見える。',
    similarity: 0.75,
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'クエリが指定されていません' },
        { status: 400 }
      );
    }

    // 2〜4秒のランダムな遅延をシミュレート
    const delay = Math.random() * 2000 + 2000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // クエリに基づいて結果をフィルタリング（簡易的なシミュレーション）
    let results = [...mockResults];

    // クエリに「東京」が含まれていれば東京関連の結果を優先
    if (query.includes('東京') || query.includes('tokyo')) {
      results = results.filter(r => r.title.includes('東京'));
    }
    // クエリに「富士山」が含まれていれば富士山を優先
    else if (query.includes('富士山') || query.includes('fuji')) {
      results = results.filter(r => r.title.includes('富士山'));
    }
    // それ以外は全結果を返す
    else {
      results = mockResults;
    }

    // 結果が空の場合は全結果を返す
    if (results.length === 0) {
      results = mockResults;
    }

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('検索エラー:', error);
    return NextResponse.json(
      { error: '検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
