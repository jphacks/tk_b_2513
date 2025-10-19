import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { image_id, license, attribution } = await req.json()
    
    if (!image_id || !license) {
      return NextResponse.json({ error: "image_id and license are required" }, { status: 400 })
    }

    // TODO: 実際のデータベースへの保存処理を実装
    // 現在は仮の実装として成功レスポンスを返す
    console.log('Image contribution:', { image_id, license, attribution })
    
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e?.message ?? "contribute failed" }, { status: 500 })
  }
}
