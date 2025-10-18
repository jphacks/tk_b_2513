import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, size = "1024x1024" } = await req.json();
    if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_IMAGE_API_KEY! });

    const out = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size, 
    });

    if (!out.data || out.data.length === 0) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    const imageUrl = out.data[0].url;
    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL returned" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "generate failed" }, { status: 500 });
  }
}
