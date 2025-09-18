"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export default function RightPanel({ fabricAPI }) {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(40);
  const [aiPrompt, setAIPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddText = () => {
    if (fabricAPI && text.trim()) {
      fabricAPI.addText(text, fontSize);
      setText("");
    }
  };

  const handleGenerateImage = async () => {
    if (!aiPrompt.trim() || !fabricAPI) return;
    setLoading(true);

    try {
      const res = await fetch("/api/generate-hf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const data = await res.json();

      if (!data.image) throw new Error("No image returned from AI service");

      const img = new Image();
      img.src = data.image;
      img.onload = () => {
        const fabricImg = new window.fabric.Image(img, {
          left: 100,
          top: 100,
        });
        fabricAPI.getCanvas().add(fabricImg);
      };

      toast.success("AI image generated successfully!");
    } catch (err) {
      console.error("AI image generation error:", err);
      toast.error(
        `Image generation failed: ${err.message}`,
        { closeButton: true }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-sky-800">AI Image Prompt</h2>

      {/* AI Image Generation */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          AI Image Prompt
        </label>
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAIPrompt(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Describe image..."
        />
        <button
          onClick={handleGenerateImage}
          disabled={loading}
          className="mt-2 w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          {loading ? "Generating..." : "Generate & Add"}
        </button>
      </div>
    </div>
  );
}
