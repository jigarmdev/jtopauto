import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const res = await axios.post(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          Accept: "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    if (!res.data) {
      throw new Error("Empty response from Hugging Face");
    }

    const base64 = Buffer.from(res.data, "binary").toString("base64");
    const image = `data:image/png;base64,${base64}`;

    return NextResponse.json({ image });
  } catch (err) {
    console.error("HF API error:", err.message);
    return NextResponse.json(
      { error: "Image generation failed. Please try again." },
      { status: 500 }
    );
  }
}
