import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PrismaClient } from '@/generated/prisma';

// OpenAI クライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Prisma クライアントの初期化
const prisma = new PrismaClient({
  datasources: {
    db: { url: "postgresql://postgres:bw7G07dXMUVkFPWA@db.wtdpygwzmlzonidmofhv.supabase.co:5432/postgres" } // 必ずオブジェクトの形にする
  }
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
} else {
  console.log("DatabaseURLが設定されていません")
}


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

    console.log('検索クエリ:', query);

    // 1. OpenAI APIでクエリをベクトル化
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      encoding_format: 'float',
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;
    console.log('ベクトル化完了。次元数:', queryEmbedding.length);

    // 2. PostgreSQL/Supabaseでベクトル類似度検索（コサイン類似度）
    // pgvectorの <=> 演算子を使用（コサイン距離）
    const results = await prisma.$queryRaw<
      Array<{
        id: string;
        user_id: string | null;
        prompt: string;
        image_url: string;
        created_at: Date;
        similarity: number;
      }>
    >`
      SELECT
        id,
        user_id,
        prompt,
        image_url,
        created_at,
        1 - (embedding_vector <=> ${`[${queryEmbedding.join(',')}]`}::vector) as similarity
      FROM images
      WHERE embedding_vector IS NOT NULL
      ORDER BY embedding_vector <=> ${`[${queryEmbedding.join(',')}]`}::vector
      LIMIT 5
    `;

    console.log('検索結果件数:', results.length);

    // 3. フロントエンド用にフォーマット
    const formattedResults = results.map((row) => ({
      id: row.id,
      userId: row.user_id,
      prompt: row.prompt,
      imageUrl: row.image_url,
      createdAt: row.created_at.toISOString(),
      similarity: Number(row.similarity),
    }));

    return NextResponse.json({
      success: true,
      query,
      results: formattedResults,
      count: formattedResults.length,
    });
  } catch (error) {
    console.error('検索エラー:', error);
    return NextResponse.json(
      {
        error: '検索中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}
